#!/bin/bash

# Script để deploy lên Netlify
# Cách dùng: ./netlify-deploy.sh

echo "🚀 Deploying to Netlify..."

# Kiểm tra Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI chưa được cài đặt"
    echo "📦 Cài đặt: npm install -g netlify-cli"
    exit 1
fi

# Login (nếu chưa)
if [ ! -f .netlify/state.json ]; then
    echo "🔐 Đăng nhập Netlify..."
    netlify login
fi

# Deploy
echo "📤 Đang deploy..."
netlify deploy --prod --dir="."

echo "✅ Deploy thành công!"
echo "🌐 URL: https://workflow.egg-ventures.com"


