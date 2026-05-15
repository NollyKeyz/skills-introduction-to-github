@echo off
setlocal EnableDelayedExpansion
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
:: Find local IP address for mobile access
set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4 Address"') do (
    if not defined IP (
        set "IP=%%a"
        set "IP=!IP: =!"
    )
)

echo.
echo =========================================================
echo XcelTutor is now running locally!
echo.
echo You can access it on this computer at:
echo    http://127.0.0.1:5000
echo.
if defined IP (
echo To access from your phone or tablet on the same Wi-Fi:
echo    http://%IP%:5000
)
echo =========================================================
echo.

start "XcelTutor Server" /min python app.py
timeout /t 3 /nobreak > nul

echo Opening XcelTutor in your web browser...
start "" "http://127.0.0.1:5000"

echo.
echo Keep this window open if you want to remember the phone address above.
pause
