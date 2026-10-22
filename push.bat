@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo Pushing QR Studio to https://github.com/boristhespider8/QR-Studio.git...
echo.
git push -u origin main
