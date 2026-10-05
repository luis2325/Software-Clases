#!/usr/bin/env bash
# Launcher para AprendePlus React
cd "$(dirname "$0")"

echo "======================================================="
echo "⚛️ INICIANDO APRENDEPLUS (REACT + VITE)"
echo "Colegio - Plataforma de Juegos y Panel Docente"
echo "======================================================="

IP=$(hostname -I | awk '{print $1}')
PORT=5173

echo "Iniciando servidor de desarrollo React con acceso Wi-Fi..."
npm run dev &
SERVER_PID=$!

sleep 2

echo ""
echo "✅ Servidor React activo en segundo plano (PID: $SERVER_PID)"
echo "📍 En tu computador:      http://localhost:$PORT"
echo "📲 Para celulares Wi-Fi:   http://$IP:$PORT"
echo ""

# Abrir el navegador automáticamente
if which xdg-open > /dev/null; then
  xdg-open "http://localhost:$PORT" &
elif which google-chrome > /dev/null; then
  google-chrome "http://localhost:$PORT" &
fi

wait $SERVER_PID
