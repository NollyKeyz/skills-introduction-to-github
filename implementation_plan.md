# Build XcelTutor Standalone App

The goal is to convert the XcelTutor Flask application into a fully standalone, double-clickable Windows Application (`.exe`) and place it directly on your Desktop, eliminating the need for batch files or command prompts.

## User Review Required

> [!IMPORTANT]  
> We will use **PyInstaller** to package your Python code, HTML templates, and CSS/JS assets into a single executable file. This process will bundle everything so it runs even if Python is not installed. Is this exactly what you mean by "Build an app"?

## Proposed Changes

### 1. `app.py` modifications
- **[MODIFY]** Update `app.py` to accurately locate the `templates` and `static` folders when running as a PyInstaller executable (using `sys._MEIPASS`).
- **[MODIFY]** Add a lightweight background thread in `app.py` using `threading` and `webbrowser` so that the app automatically opens your browser window (`http://127.0.0.1:5000/upload`) as soon as the Flask server is ready. This eliminates the need for the `.bat` file's timeout/start logic.

### 2. Dependency Installation
- Install `pyinstaller` via pip to compile the code.

### 3. Build Process
- Run `pyinstaller` with the `--onefile` (single executable), `--windowed` (no ugly black console window), and `--icon=icon.ico` flags.
- We will instruct PyInstaller to package the `templates` and `static` directories directly into the executable using `--add-data`.

### 4. Final App Placement
- Move the resulting `XcelTutor.exe` from the `dist/` build directory directly to your `Desktop`.

## Verification Plan
1. Ensure the PyInstaller build completes successfully without missing dependencies.
2. Verify that running `XcelTutor.exe` silently starts the server and successfully pops open the beautiful UI in the browser.
3. Check that file uploads and interactions still communicate properly with the bundled server.
