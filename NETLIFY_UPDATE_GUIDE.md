# Hướng dẫn Cập nhật Files lên Netlify

## 🚀 3 Cách cập nhật files lên Netlify

### Cách 1: Drag & Drop (Đơn giản nhất)

1. **Truy cập:** https://app.netlify.com/drop
2. **Kéo thả** folder `/Volumes/MacEx01/TLCG Workflow` vào trang
3. **Đợi deploy** (tự động, ~30 giây)
4. **Xong!** Files đã được cập nhật

**Ưu điểm:**
- ✅ Đơn giản, không cần cài đặt gì
- ✅ Nhanh

**Nhược điểm:**
- ❌ Phải làm thủ công mỗi lần
- ❌ Không có version history

### Cách 2: Netlify CLI (Khuyến nghị)

#### Setup lần đầu:

```bash
cd "/Volumes/MacEx01/TLCG Workflow"

# Login (chỉ cần làm 1 lần)
netlify login

# Link với site (chỉ cần làm 1 lần)
netlify link
# Chọn site của bạn từ danh sách
```

#### Deploy mỗi lần cập nhật:

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
netlify deploy --prod
```

**Ưu điểm:**
- ✅ Nhanh, chỉ 1 lệnh
- ✅ Có thể tạo script tự động
- ✅ Có version history

**Nhược điểm:**
- ❌ Cần cài Netlify CLI (đã cài rồi)

### Cách 3: Connect GitHub (Tự động - Best Practice)

1. **Tạo GitHub Repository:**
   ```bash
   cd "/Volumes/MacEx01/TLCG Workflow"
   git init
   git add .
   git commit -m "Initial commit"
   # Tạo repo trên GitHub, sau đó:
   git remote add origin https://github.com/your-username/workflow-egg-ventures.git
   git push -u origin main
   ```

2. **Connect trong Netlify:**
   - Vào Netlify Dashboard
   - Add new site → Import from Git
   - Chọn GitHub → Chọn repo
   - Deploy settings:
     - Build command: (để trống - static site)
     - Publish directory: `.` (root)
   - Deploy

3. **Tự động deploy:**
   - Mỗi khi push code → Tự động deploy
   - Không cần làm gì thêm!

**Ưu điểm:**
- ✅ Tự động deploy khi push code
- ✅ Version control với Git
- ✅ Có build history
- ✅ Có thể rollback

**Nhược điểm:**
- ❌ Cần setup Git (1 lần)

## 🔧 Tạo Script Tự động Deploy

### Script cho Mac/Linux:

```bash
#!/bin/bash
# deploy-to-netlify.sh

cd "/Volumes/MacEx01/TLCG Workflow"
echo "🚀 Deploying to Netlify..."
netlify deploy --prod
echo "✅ Deploy completed!"
```

### Cách dùng:

1. **Tạo file script:**
   ```bash
   nano deploy.sh
   # Paste code trên
   # Save (Ctrl+O, Enter, Ctrl+X)
   ```

2. **Cho phép execute:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Chạy:**
   ```bash
   ./deploy.sh
   ```

## 📝 Quick Commands

### Deploy nhanh:
```bash
cd "/Volumes/MacEx01/TLCG Workflow" && netlify deploy --prod
```

### Xem status:
```bash
netlify status
```

### Xem site info:
```bash
netlify open:site
```

## 🎯 Workflow Khuyến nghị

### Cho Development:
1. Sửa code local
2. Test local
3. Chạy: `netlify deploy --prod`
4. Test trên production

### Cho Production (với Git):
1. Sửa code local
2. Test local
3. Commit: `git add . && git commit -m "Update..." && git push`
4. Netlify tự động deploy
5. Test trên production

## ⚡ Tips

1. **Dùng Git để track changes:**
   - Dễ rollback nếu có lỗi
   - Có history

2. **Test trước khi deploy:**
   - Test local trước
   - Dùng `netlify deploy` (không có --prod) để test

3. **Monitor deployments:**
   - Xem Netlify Dashboard
   - Kiểm tra logs nếu có lỗi

## 🔄 Auto-deploy với Git (Khuyến nghị nhất)

Nếu dùng Git, mỗi lần cập nhật chỉ cần:

```bash
git add .
git commit -m "Update files"
git push
```

Netlify sẽ tự động deploy! 🎉


