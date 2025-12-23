# Hướng dẫn Deploy lên Netlify

## 🚀 Cách 1: Dùng Netlify CLI (Đã cài đặt)

### Bước 1: Login vào Netlify
```bash
cd "/Volumes/MacEx01/TLCG Workflow"
netlify login
```
- Sẽ mở browser để đăng nhập
- Chọn "Authorize" để cho phép Netlify CLI

### Bước 2: Deploy
```bash
netlify deploy --prod
```

### Bước 3: Setup Custom Domain (sau khi deploy)
```bash
netlify domains:add workflow.egg-ventures.com
```

## 🚀 Cách 2: Drag & Drop (Dễ nhất - Không cần CLI)

1. **Truy cập:** https://app.netlify.com/drop
2. **Kéo thả** folder `/Volumes/MacEx01/TLCG Workflow` vào trang
3. **Đợi deploy** (tự động)
4. **Copy site URL** (sẽ có dạng: `random-name-123.netlify.app`)

### Sau đó setup custom domain:
1. Vào **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Nhập: `workflow.egg-ventures.com`
4. Netlify sẽ hiển thị DNS records cần thêm

## 📝 Files sẽ được deploy

- ✅ `phieu_thu_chi_auto_email_working (final).html`
- ✅ `approve_voucher.html`
- ✅ `reject_voucher.html`
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `script.js`
- ✅ Tất cả files khác trong folder

## ⚙️ Cấu hình

File `netlify.toml` đã được tạo với:
- Redirect root → main HTML file
- Security headers
- CORS headers

## 🔗 Sau khi deploy

1. **Update URL trong code:**
   - File `phieu_thu_chi_auto_email_working (final).html`
   - Dòng ~2332: `const baseUrl = 'https://workflow.egg-ventures.com';`
   - (Đã được set sẵn)

2. **Setup DNS trong Wix:**
   - Vào Wix Domain Manager
   - Thêm CNAME record:
     ```
     Type: CNAME
     Name: workflow
     Value: [Netlify site URL, ví dụ: your-site.netlify.app]
     ```

3. **Đợi DNS propagate** (5-30 phút)

4. **Test:**
   - Truy cập: `https://workflow.egg-ventures.com/phieu_thu_chi_auto_email_working (final).html`
   - Gửi phiếu test
   - Click links trong email → Hoạt động!

## 🔄 Update sau này

**Cách 1: CLI**
```bash
netlify deploy --prod
```

**Cách 2: Drag & Drop lại**
- Kéo thả folder mới vào Netlify

**Cách 3: Connect GitHub**
- Connect GitHub repo
- Tự động deploy khi push code


