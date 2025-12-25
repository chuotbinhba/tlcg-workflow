# Hướng dẫn Push Code lên GitHub (Cách 1: Personal Access Token)

## 📋 Checklist

- [x] Branch đã đổi từ `master` → `main`
- [x] Remote đã được thêm: `https://github.com/chuotbinhba/tlcg-workflow.git`
- [ ] Tạo Personal Access Token
- [ ] Push code lên GitHub

## 🔐 Bước 1: Tạo Personal Access Token

1. **Truy cập:** https://github.com/settings/tokens

2. **Click:** "Generate new token" → **"Generate new token (classic)"**

3. **Điền thông tin:**
   - **Note:** `TLCG Workflow Deploy`
   - **Expiration:** Chọn thời hạn (khuyến nghị: 90 days hoặc No expiration)
   - **Select scopes:** ✅ Chọn `repo` (Full control of private repositories)

4. **Click:** "Generate token" (ở cuối trang)

5. **⚠️ QUAN TRỌNG:** Copy token ngay lập tức! Token chỉ hiện 1 lần duy nhất.
   - Token sẽ có dạng: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🚀 Bước 2: Push Code

Sau khi có token, chạy lệnh sau:

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
git push -u origin main
```

**Khi được hỏi:**
- **Username:** Nhập GitHub username của bạn (`chuotbinhba`)
- **Password:** Paste token vừa copy (KHÔNG phải password GitHub!)

## ✅ Kết quả mong đợi

Nếu thành công, bạn sẽ thấy:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/chuotbinhba/tlcg-workflow.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## 🔄 Sau khi push thành công

### Mỗi lần cập nhật code:

```bash
cd "/Volumes/MacEx01/TLCG Workflow"
git add .
git commit -m "Mô tả thay đổi"
git push
```

### Connect với Netlify để auto-deploy:

1. Truy cập: https://app.netlify.com
2. **Add new site** → **Import from Git**
3. Chọn **GitHub** → Authorize nếu cần
4. Chọn repo: **`chuotbinhba/tlcg-workflow`**
5. **Deploy settings:**
   - Build command: (để trống)
   - Publish directory: `.` (root)
6. Click **Deploy site**

Sau đó, mỗi lần `git push` → Netlify sẽ tự động deploy! 🎉

## ⚠️ Lưu ý

- Token là bí mật, không chia sẻ với ai
- Nếu quên token, phải tạo token mới
- Token có thể bị thu hồi nếu bị lộ
- Khuyến nghị: Đặt expiration date để bảo mật hơn

## 🆘 Nếu gặp lỗi

### Lỗi: "Authentication failed"
- Kiểm tra lại token đã copy đúng chưa
- Token có thể đã hết hạn, tạo token mới

### Lỗi: "Repository not found"
- Kiểm tra repo `chuotbinhba/tlcg-workflow` đã được tạo trên GitHub chưa
- Kiểm tra username đúng chưa

### Lỗi: "Permission denied"
- Kiểm tra token có quyền `repo` chưa
- Tạo lại token với đầy đủ quyền

