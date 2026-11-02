@echo off
rem Awaaz: put your keys in the .env file once, then just double-click this file.
cd /d "%~dp0"
if not exist node_modules call npm install
start "" http://127.0.0.1:8000
node server\index.js
