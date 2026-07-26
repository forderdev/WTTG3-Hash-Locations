@echo off
setlocal
cd /d "%~dp0"
start "" "http://127.0.0.1:4173/"
where node >nul 2>nul
if not errorlevel 1 (
  node tools\serve.mjs
  exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
  py -m http.server 4173 --bind 127.0.0.1
  exit /b
)
python -m http.server 4173 --bind 127.0.0.1
endlocal
