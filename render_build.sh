#!/usr/bin/env bash
set -euo pipefail

echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🛠️ Building frontend..."
cd src/front
npm install
npm run build

echo "🚚 Moving frontend build to public/"
# Volvemos al root de proyecto
cd ../..

# Limpiamos cualquier build anterior
rm -rf public/*
mkdir -p public

# Detectamos dónde está el dist y movemos su contenido
if [ -d "src/front/dist" ]; then
  mv src/front/dist/* public/
elif [ -d "dist" ]; then
  mv dist/* public/
else
  echo "❌ Carpeta de build no encontrada: ni src/front/dist ni dist"
  exit 1
fi

echo "✅ Build movido a public/ correctamente."