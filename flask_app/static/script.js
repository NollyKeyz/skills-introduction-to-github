let uploadedFile = null;

function handleFileSelect() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
        processFile(fileInput.files[0]);
    }
}

function processFile(file) {
    const taskPanel = document.getElementById("taskPanel");
    const previewPanel = document.getElementById("previewPanel");
    const imagePreview = document.getElementById("imagePreview");
    const fileInfo = document.getElementById("fileInfo");
    const resultContainer = document.getElementById("resultContainer");

    uploadedFile = file;

    if (uploadedFile.type.startsWith("image/")) {
        imagePreview.src = URL.createObjectURL(uploadedFile);
        previewPanel.classList.remove("hidden");
    } else {
        previewPanel.classList.add("hidden");
        imagePreview.removeAttribute("src");
    }

    fileInfo.textContent = uploadedFile.name;
    fileInfo.style.color = "var(--primary)";
    
    taskPanel.classList.remove("hidden");
    resultContainer.classList.add("hidden");
}

async function processUploadedFile() {
    const resultContainer = document.getElementById("resultContainer");
    const resultDiv = document.getElementById("result");
    const taskSelect = document.getElementById("taskSelect");
    const customTask = document.getElementById("customTask");
    const actionBtn = document.getElementById("actionBtn");
    const btnText = document.getElementById("btnText");
    const loadingSpinner = document.getElementById("loadingSpinner");

    if (!uploadedFile) {
        return;
    }

    const task = taskSelect.value;
    const customInstruction = customTask.value.trim();

    if (task === "custom" && customInstruction.length === 0) {
        customTask.focus();
        return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("task", task);
    formData.append("custom_task", customInstruction);

    // Show loading state
    btnText.textContent = "Thinking...";
    loadingSpinner.classList.remove("hidden");
    actionBtn.disabled = true;
    actionBtn.style.opacity = "0.8";

    resultContainer.classList.remove("hidden");
    resultDiv.innerHTML = "Connecting to AI Tutor...";

    try {
        const response = await fetch("/process", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            resultDiv.innerHTML = data.error || "Something went wrong while processing the file.";
        } else {
            resultDiv.innerHTML = data.answer || "No answer was returned.";
        }
    } catch (error) {
        resultDiv.innerHTML = "Could not reach the server. Make sure the Flask app is running.";
    } finally {
        // Reset loading state
        btnText.textContent = "Ask Tutor";
        loadingSpinner.classList.add("hidden");
        actionBtn.disabled = false;
        actionBtn.style.opacity = "1";
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function copyResult() {
    const resultDiv = document.getElementById("result");
    navigator.clipboard.writeText(resultDiv.innerText).then(() => {
        const copyBtn = document.querySelector(".copy-btn");
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const taskSelect = document.getElementById("taskSelect");
    const customTask = document.getElementById("customTask");
    const dropZone = document.getElementById("dropZone");

    taskSelect.addEventListener("change", () => {
        if (taskSelect.value === "custom") {
            customTask.classList.remove("hidden");
            customTask.focus();
        } else {
            customTask.classList.add("hidden");
        }
    });

    // Drag and Drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, false);
});
