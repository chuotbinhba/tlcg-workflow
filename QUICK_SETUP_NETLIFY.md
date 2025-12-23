# Quick Setup - Deploy lên Netlify (5 phút)

## 🚀 Cách nhanh nhất để có workflow.egg-ventures.com

### Bước 1: Tạo Netlify Account (2 phút)

1. Truy cập: https://app.netlify.com/signup
2. Sign up với GitHub/Email
3. Xong!

### Bước 2: Deploy Files (1 phút)

**Cách 1: Drag & Drop (Dễ nhất)**
1. Vào https://app.netlify.com/drop
2. Kéo thả folder `/Volumes/MacEx01/TLCG Workflow` vào
3. Xong! Netlify sẽ tự động deploy

**Cách 2: Dùng Netlify CLI**
```bash
cd "/Volumes/MacEx01/TLCG Workflow"
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Bước 3: Setup Custom Domain (2 phút)

1. **Trong Netlify:**
   - Vào Site settings → Domain management
   - Click "Add custom domain"
   - Nhập: `workflow.egg-ventures.com`
   - Netlify sẽ hiển thị DNS records

2. **Trong Wix Domain Manager:**
   - Vào Settings → Domains → egg-ventures.com
   - Click "Manage DNS"
   - Thêm CNAME record:
     ```
     Type: CNAME
     Name: workflow
     Value: [giá trị Netlify cung cấp, thường là: your-site.netlify.app]
     ```

3. **Đợi DNS propagate (5-30 phút)**
   - Netlify sẽ tự động cấu hình SSL
   - Khi xong, bạn sẽ thấy "SSL certificate active"

### Bước 4: Update Code (1 phút)

Sau khi có URL `https://workflow.egg-ventures.com`, update:

**File: `phieu_thu_chi_auto_email_working (final).html`**

Tìm dòng (~2334):
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
// Production URL - Update này sau khi deploy
const baseUrl = 'https://workflow.egg-ventures.com';
```

## ✅ Xong!

Bây giờ:
- ✅ Files đã được host trên Netlify
- ✅ Subdomain `workflow.egg-ventures.com` đã được cấu hình
- ✅ SSL tự động (HTTPS)
- ✅ Links trong email sẽ hoạt động!

## 🧪 Test

1. Truy cập: `https://workflow.egg-ventures.com/phieu_thu_chi_auto_email_working (final).html`
2. Gửi một phiếu test
3. Click link "Phê duyệt" hoặc "Từ chối" trong email
4. Links sẽ hoạt động!

## 📝 Lưu ý

- Netlify miễn phí cho static sites
- Bandwidth: 100GB/tháng (miễn phí)
- SSL tự động và miễn phí
- CDN global (nhanh)

## 🔄 Update Files sau này

**Cách 1: Drag & Drop lại**
- Kéo thả folder mới vào Netlify

**Cách 2: Dùng CLI**
```bash
netlify deploy --prod
```

**Cách 3: Connect GitHub (Tự động)**
- Connect GitHub repo
- Mỗi khi push code → Tự động deploy


