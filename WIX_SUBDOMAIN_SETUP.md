# Hướng dẫn Setup Subdomain workflow.egg-ventures.com trên Wix

## ⚠️ Lưu ý về Wix

Wix có một số hạn chế với static HTML files:
- Không thể upload và host HTML files tùy ý như web server thông thường
- Cần dùng Wix Editor hoặc Wix Code/Velo
- Subdomain cần được cấu hình trong Wix Domain Manager

## 🎯 Giải pháp đề xuất

### Option 1: Dùng Wix Dev Mode (Khuyến nghị nếu có)

1. **Enable Dev Mode trong Wix:**
   - Vào Wix Dashboard
   - Settings → Dev Mode
   - Enable Dev Mode

2. **Upload files qua Wix Storage:**
   - Vào Wix Editor
   - Add → More → Storage
   - Upload files HTML

3. **Tạo pages để embed HTML:**
   - Tạo page mới cho mỗi file
   - Embed HTML code vào page

### Option 2: Dùng External Hosting + Wix Subdomain (Khuyến nghị nhất)

Host files trên service khác (GitHub Pages, Netlify, Vercel) và point subdomain về đó.

## 🚀 Setup Subdomain trên Wix

### Bước 1: Thêm Subdomain trong Wix

1. **Vào Wix Dashboard:**
   - Settings → Domains
   - Click vào domain `egg-ventures.com`

2. **Thêm Subdomain:**
   - Click "Add Subdomain"
   - Nhập: `workflow`
   - Chọn: `workflow.egg-ventures.com`

3. **Cấu hình DNS:**
   - Wix sẽ tự động tạo DNS records
   - Hoặc bạn cần thêm CNAME record:
     ```
     Type: CNAME
     Name: workflow
     Value: wix.com (hoặc theo hướng dẫn của Wix)
     ```

### Bước 2: Point Subdomain đến External Hosting

Nếu dùng Option 2 (external hosting):

1. **Tạo CNAME record:**
   ```
   Type: CNAME
   Name: workflow
   Value: your-hosting-provider.com
   ```

2. **Hoặc A record:**
   ```
   Type: A
   Name: workflow
   Value: IP-address-of-hosting
   ```

## 🌐 Alternative: Host trên GitHub Pages (Miễn phí, Dễ setup)

### Setup GitHub Pages:

1. **Tạo GitHub Repository:**
   ```bash
   # Tạo repo mới trên GitHub
   # Tên: workflow-egg-ventures
   ```

2. **Upload files:**
   ```bash
   cd "/Volumes/MacEx01/TLCG Workflow"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/workflow-egg-ventures.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Vào repo Settings
   - Pages → Source: `main` branch
   - Save
   - URL sẽ là: `https://your-username.github.io/workflow-egg-ventures/`

4. **Point subdomain về GitHub Pages:**
   - Trong Wix DNS settings, thêm:
     ```
     Type: CNAME
     Name: workflow
     Value: your-username.github.io
     ```
   - Trong GitHub repo, tạo file `CNAME`:
     ```
     workflow.egg-ventures.com
     ```

## 🌐 Alternative: Host trên Netlify (Khuyến nghị - Dễ nhất)

### Setup Netlify:

1. **Tạo account Netlify:**
   - Truy cập: https://netlify.com
   - Sign up với GitHub/GitLab/Bitbucket

2. **Deploy:**
   - Drag & drop folder `/Volumes/MacEx01/TLCG Workflow` vào Netlify
   - Hoặc connect GitHub repo
   - Netlify sẽ tự động deploy

3. **Custom Domain:**
   - Vào Site settings → Domain management
   - Add custom domain: `workflow.egg-ventures.com`
   - Netlify sẽ hiển thị DNS records cần thêm

4. **Cấu hình DNS trong Wix:**
   - Thêm CNAME record:
     ```
     Type: CNAME
     Name: workflow
     Value: your-site.netlify.app
     ```

## 📝 Update Code sau khi có URL

Sau khi có URL `https://workflow.egg-ventures.com`, update code:

### Trong `phieu_thu_chi_auto_email_working (final).html`:

Tìm dòng:
```javascript
let baseUrl;
if (window.location.protocol === 'file:') {
    baseUrl = '.';
} else {
    baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
}
```

Thay bằng:
```javascript
// Production URL
const baseUrl = 'https://workflow.egg-ventures.com';
```

Hoặc giữ logic auto-detect nhưng đảm bảo files được host đúng.

## ✅ Checklist Setup

### Nếu dùng Wix trực tiếp:
- [ ] Subdomain đã được thêm trong Wix Domain Manager
- [ ] DNS records đã được cấu hình
- [ ] Files đã được upload qua Wix Storage
- [ ] Pages đã được tạo để embed HTML
- [ ] Test truy cập: `https://workflow.egg-ventures.com`

### Nếu dùng External Hosting (GitHub/Netlify):
- [ ] Files đã được upload lên hosting
- [ ] Custom domain đã được cấu hình trên hosting
- [ ] DNS records đã được thêm trong Wix
- [ ] SSL certificate đã được cấu hình (tự động với Netlify/GitHub)
- [ ] Test truy cập: `https://workflow.egg-ventures.com`

## 🎯 Khuyến nghị

**Tôi khuyến nghị dùng Netlify vì:**
- ✅ Miễn phí
- ✅ Dễ setup (drag & drop)
- ✅ Tự động SSL
- ✅ CDN global
- ✅ Custom domain dễ dàng
- ✅ Hỗ trợ static HTML tốt

**Hoặc GitHub Pages nếu:**
- Bạn đã quen với Git
- Muốn version control
- Miễn phí và đáng tin cậy

## 📚 Tài liệu tham khảo

- [Wix Domain Settings](https://support.wix.com/en/article/adding-a-subdomain-to-your-wix-site)
- [Netlify Custom Domain](https://docs.netlify.com/domains-https/custom-domains/)
- [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)


