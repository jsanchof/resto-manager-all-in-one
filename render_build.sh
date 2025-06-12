#!/usr/bin/env bash
set -euo pipefail

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Limpiamos cualquier build anterior
rm -rf public/*
mkdir -p public

echo "🛠️ Building frontend..."
npm install
npm run build

echo "✅ Build creado a public/ correctamente."