@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo       XcelTutor Setup ^& Launcher
echo ==========================================
echo.

echo [1/3] Checking and installing Python dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Creating Desktop Shortcut...
set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Desktop\XcelTutor.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%~dp0launch_xceltutor.bat" >> %SCRIPT%
echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
echo oLink.IconLocation = "%~dp0icon.ico" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Shortcut created successfully!

echo.
echo [3/3] Starting XcelTutor Server...
start "XcelTutor Server" /min python app.py
timeout /t 3 /nobreak > nul

echo Opening XcelTutor in your web browser...
start "" "http://127.0.0.1:5000"
