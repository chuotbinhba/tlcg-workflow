# Fix: CORS Error khi mở file HTML trực tiếp

## 🐛 Lỗi

```
Access to fetch at '...' from origin 'null' has been blocked by CORS policy
```

**Nguyên nhân:** Bạn đang mở file HTML trực tiếp từ file system (`file://`), browser chặn CORS requests.

---

## ✅ Giải pháp

### Cách 1: Dùng Local Web Server (Nhanh nhất) ⭐

#### Option A: Python (Mac/Linux thường có sẵn)

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
python3 -m http.server 8000
```

Sau đó mở: **http://localhost:8000/tlcgroup-intranet.html**

#### Option B: Node.js (nếu đã cài)

```bash
# Cài http-server (chỉ cần 1 lần)
npm install -g http-server

# Chạy server
cd "/Volumes/MacEx01/TLCG Workflow"
http-server -p 8000
```

Sau đó mở: **http://localhost:8000/tlcgroup-intranet.html**

#### Option C: PHP (nếu có)

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
php -S localhost:8000
```

---

### Cách 2: Deploy lên Netlify (Production) ⭐⭐

**Đã có setup sẵn!**

1. **Deploy lên Netlify:**
   ```bash
   cd "/Volumes/MacEx01/TLCG Workflow"
   netlify deploy --prod
   ```

2. **Hoặc drag & drop:**
   - Vào: https://app.netlify.com/drop
   - Kéo thả folder vào

3. **Mở URL từ Netlify** (không phải file://)

---

## 🚀 Quick Fix: Tạo Script chạy Local Server

Tạo file `start-server.sh`:

```bash
#!/bin/bash
cd "/Volumes/MacEx01/TLCG Workflow"
echo "🚀 Starting local server..."
echo "📝 Open: http://localhost:8000/tlcgroup-intranet.html"
python3 -m http.server 8000
```

**Cách dùng:**
```bash
chmod +x start-server.sh
./start-server.sh
```

---

## 🔧 Tại sao bị CORS?

- **File:// protocol:** Browser coi là không an toàn
- **Google Apps Script:** Không cho phép CORS từ file://
- **Security:** Browser chặn cross-origin requests từ local files

---

## ✅ Sau khi fix

1. **Chạy local server** hoặc **deploy lên Netlify**
2. **Mở URL** (http://localhost:8000/... hoặc Netlify URL)
3. **Test login** - CORS error sẽ biến mất!

---

## 📝 Lưu ý

- **Development:** Dùng local server (http://localhost:8000)
- **Production:** Deploy lên Netlify (https://workflow.egg-ventures.com)

---

**🎉 Sau khi chạy local server hoặc deploy, CORS error sẽ hết!**

