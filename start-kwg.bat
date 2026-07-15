@echo off
REM ============================================================
REM  Kulche Wali Gali - backend launcher
REM  Double-click this file. It ALWAYS runs from the correct
REM  folder, installs dependencies on first run, and starts the
REM  server + Admin dashboard.
REM ============================================================
cd /d "%~dp0backend"
echo Working folder: %cd%
echo.
if not exist "node_modules" (
  echo First run - installing dependencies (this can take a few minutes)...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Please check Node.js is installed ^(node -v^).
    pause
    exit /b 1
  )
)
echo.
echo Starting server on http://localhost:5000
echo   - Website API:     http://localhost:5000/api/health
echo   - Admin dashboard: http://localhost:5000/admin   ^(login: admin / ChangeMe@123^)
echo.
call npm start
pause
