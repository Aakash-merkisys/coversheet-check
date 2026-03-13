@echo off
echo ========================================
echo Coversheet Automation Backend Starter
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo.
echo Backend will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start
