$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("c:\Users\Nolly\OneDrive\Desktop\XcelTutor.lnk")
$Shortcut.TargetPath = "c:\Users\Nolly\OneDrive\Desktop\flask_app\launch_xceltutor.bat"
$Shortcut.WorkingDirectory = "c:\Users\Nolly\OneDrive\Desktop\flask_app"
$Shortcut.IconLocation = "c:\Users\Nolly\OneDrive\Desktop\flask_app\icon.ico"
$Shortcut.Save()
