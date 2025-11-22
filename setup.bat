@echo off
echo ==========================================
echo   StockManager App - One-Click Setup
echo ==========================================
echo.

echo [1/4] Installing Root Dependencies...
call npm install
if %errorlevel% neq 0 goto :error

echo.
echo [2/4] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 goto :error
cd ..

echo.
echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 goto :error
cd ..

echo.
echo [4/4] Setup Complete!
echo.
echo To start the app, run: npm start
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] Something went wrong during setup.
pause
exit /b 1
