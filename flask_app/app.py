from flask import Flask, render_template, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
import base64
import requests
import json
from io import BytesIO

app = Flask(__name__)
CORS(app)

OLLAMA_URL = 'http://localhost:11434/api/generate'
VISION_MODEL = 'gemma4'
TUTOR_MODEL = 'gemma4'
REQUEST_TIMEOUT = 300
TASK_PROMPTS = {
    'solve': (
        'Solve the homework in the image step by step. Explain the reasoning clearly, '
        'show working for calculations, and end with a concise final answer.'
    ),
    'explain': (
        'Explain what the homework question in the image is asking. Break down the topic, '
        'important terms, and the method someone should use before solving it.'
    ),
    'hint': (
        'Give a helpful hint for the homework in the image without fully solving it. Point the student '
        'toward the next step and mention any formula or idea they should consider.'
    ),
    'check': (
        'Check the homework in the image carefully. If there is visible student work, identify mistakes '
        'and explain how to correct them. If there is no student work, say what is needed to solve it.'
    )
}

def image_to_base64(img):
    buffer = BytesIO()
    img = img.convert('RGB')
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def ollama_stream(model, prompt, images=None):
    payload = {
        'model': model,
        'prompt': prompt,
        'stream': True
    }
    if images:
        payload['images'] = images

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            stream=True,
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
    except requests.Timeout as exc:
        raise RuntimeError(
            f'{model} took too long to respond. The first run can be slow while Ollama loads the model; try again in a minute.'
        ) from exc
    except requests.ConnectionError as exc:
        raise RuntimeError(
            'Could not connect to Ollama. Make sure the Ollama app is running.'
        ) from exc
    except requests.RequestException as exc:
        raise RuntimeError(f'Ollama request failed for {model}: {exc}') from exc

    full_text = ""
    for line in response.iter_lines():
        if line:
            try:
                data = json.loads(line.decode('utf-8'))
            except json.JSONDecodeError:
                continue

            if data.get('error'):
                raise RuntimeError(data['error'])

            if 'response' in data:
                full_text += data['response']

    return full_text.strip()

def solve_homework_image(file_storage, task='solve', custom_task=''):
    try:
        img = Image.open(file_storage.stream)
        img.verify()
        file_storage.stream.seek(0)
        img = Image.open(file_storage.stream)
    except UnidentifiedImageError as exc:
        raise ValueError('Please upload a valid image file. PDF support is not enabled in this app yet.') from exc

    img_b64 = image_to_base64(img)

    if task == 'extract':
        prompt = 'Extract all visible text from this homework image. Keep equations, symbols, and question numbers intact.'
        solution = ollama_stream(VISION_MODEL, prompt, images=[img_b64])
        return solution, solution

    instruction = TASK_PROMPTS.get(task, TASK_PROMPTS['solve'])
    if task == 'custom':
        instruction = custom_task.strip()
        if not instruction:
            raise ValueError('Please tell XcelTutor what you want to do with the upload.')

    solution = ollama_stream(
        TUTOR_MODEL,
        (
            'You are XcelTutor, an offline AI tutor. '
            f'{instruction}'
        ),
        images=[img_b64]
    )

    return "Text extraction skipped (Gemma 4 native vision used)", solution

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload')
def upload_page():
    return render_template('upload.html')

@app.route('/manifest.json')
def manifest():
    return send_from_directory('static', 'manifest.json')

@app.route('/service-worker.js')
def service_worker():
    response = make_response(send_from_directory('static', 'service-worker.js'))
    response.headers['Service-Worker-Allowed'] = '/'
    return response

@app.route('/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file was uploaded.'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Please choose a file before processing.'}), 400

    try:
        task = request.form.get('task', 'solve')
        custom_task = request.form.get('custom_task', '')
        extracted, solution = solve_homework_image(file, task, custom_task)
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({'error': str(exc)}), 502

    return jsonify({
        'extracted_text': extracted,
        'answer': solution
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
