@echo off

set projectPath=C:\Users\kosta\OneDrive\Documents\Capstone Class\project-acc-hungry-hippos\Hungry-Hippo-Game

start cmd /k "cd /d %projectPath% && npm run api"

start cmd /k "cd /d %projectPath% && npm run dev"
start cmd /k "cd /d %projectPath% && npm run dev"
start cmd /k "cd /d %projectPath% && npm run dev"
start cmd /k "cd /d %projectPath% && npm run dev"
start cmd /k "cd /d %projectPath% && npm run dev"
start cmd /k "cd /d %projectPath% && npm run dev"

start chrome http://localhost:3000
start chrome http://localhost:3001
start chrome http://localhost:3002
start chrome http://localhost:3003
start chrome http://localhost:3004
start chrome http://localhost:3005