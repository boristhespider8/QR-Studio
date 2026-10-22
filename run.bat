@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo Starting QR Studio development server...
echo Local address: http://localhost:5173
echo.
npm run dev
