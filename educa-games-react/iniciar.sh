#!/usr/bin/env bash
# ========================================================
# 🚀 Launcher Automático para AprendePlus React + Cloudflare
# ========================================================

# Ubicarse en el directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================="
echo "🎓 INICIANDO APRENDEPLUS (REACT + VITE + TÚNEL PÚBLICO)"
echo "Colegio - Plataforma de Juegos y Panel Docente"
echo "======================================================="

# Si estamos en la raíz del repositorio, entrar a educa-games-react
if [ -d "educa-games-react" ]; then
  cd educa-games-react
fi

PORT=5173
IP=$(hostname -I | awk '{print $1}')

# 1. Iniciar servidor Vite en segundo plano
echo "1️⃣  Iniciando servidor de desarrollo React..."
npx vite --host 0.0.0.0 --port $PORT > /tmp/vite_educa.log 2>&1 &
VITE_PID=$!

# Esperar a que Vite responda
sleep 2

echo "✅ Servidor Vite activo (PID: $VITE_PID)"
echo "📍 Enlace local:           http://localhost:$PORT"
echo "📲 Para red local (Wi-Fi): http://$IP:$PORT"
echo ""

# 2. Iniciar túnel Cloudflare si el binario existe
TUNNEL_PID=""
if [ -f "./tools/cloudflared" ]; then
  echo "2️⃣  Iniciando túnel público de Cloudflare..."
  rm -f /tmp/cf_tunnel.log
  ./tools/cloudflared tunnel --url "http://127.0.0.1:$PORT" > /tmp/cf_tunnel.log 2>&1 &
  TUNNEL_PID=$!
  
  # Esperar unos segundos para obtener la URL pública
  echo "⏳ Conectando con Cloudflare..."
  for i in {1..10}; do
    sleep 1
    PUBLIC_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' /tmp/cf_tunnel.log | head -n 1)
    if [ -n "$PUBLIC_URL" ]; then
      break
    fi
  done

  if [ -n "$PUBLIC_URL" ]; then
    echo "======================================================="
    echo "🌐 ENLACE PÚBLICO PARA ESTUDIANTES (INTERNET / CELULARES):"
    echo "👉 $PUBLIC_URL"
    echo "======================================================="
    # Sincronizar automáticamente con el frontend
    cat <<EOF > ./public/network-config.json
{
  "tunnelUrl": "$PUBLIC_URL",
  "lanIp": "$IP",
  "port": $PORT
}
EOF
  else
    echo "⚠️  El túnel está conectando. Revisa el log en /tmp/cf_tunnel.log"
  fi
fi

# 3. Abrir en el navegador del computador
if which xdg-open > /dev/null 2>&1; then
  xdg-open "http://localhost:$PORT" > /dev/null 2>&1 &
elif which google-chrome > /dev/null 2>&1; then
  google-chrome "http://localhost:$PORT" > /dev/null 2>&1 &
fi

echo ""
echo "Presiona [Ctrl + C] para detener el servidor y el túnel en cualquier momento."

# Función para apagar limpiamente al presionar Ctrl + C
cleanup() {
  echo ""
  echo "🛑 Deteniendo servicios..."
  if [ -n "$VITE_PID" ]; then kill $VITE_PID 2>/dev/null; fi
  if [ -n "$TUNNEL_PID" ]; then kill $TUNNEL_PID 2>/dev/null; fi
  echo "Servidores apagados correctamente."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Mantener activo esperando que el usuario presione Ctrl + C
wait $VITE_PID
