# ✅ Approve/Reject Voucher - Checklist

## 🎯 Tổng quan

Hệ thống hỗ trợ **approve/reject voucher** từ **2 nguồn**:
1. **Email links** - Từ email notification
2. **Website** - Từ modal trong `phieu_thu_chi.html`

---

## 📧 Approve/Reject từ Email

### Approve từ Email (`approve_voucher.html`)
- ✅ **Yêu cầu upload chữ ký** (bắt buộc)
- ✅ **Kiểm tra duplicate** - Không cho approve lại nếu đã được xử lý
- ✅ **POST method** - Gửi signature qua POST
- ✅ **Error handling** - Phát hiện HTML error pages, hiển thị lỗi rõ ràng
- ✅ **Validation** - Validate file type (PNG/JPG), size (max 2MB)

### Reject từ Email (`reject_voucher.html`)
- ✅ **Yêu cầu lý do từ chối** (bắt buộc)
- ✅ **Kiểm tra duplicate** - Không cho reject lại nếu đã được xử lý
- ✅ **POST method** - Consistent với approve
- ✅ **Error handling** - Phát hiện HTML error pages, hiển thị lỗi rõ ràng

---

## 🌐 Approve/Reject từ Website

### Approve từ Website (`phieu_thu_chi.html` - `approveFromModal()`)
- ✅ **Yêu cầu upload chữ ký** (bắt buộc)
- ✅ **Kiểm tra duplicate** - Backend kiểm tra status hiện tại
- ✅ **POST method** - Gửi signature qua POST
- ✅ **Error handling** - Phát hiện HTML error pages, hiển thị lỗi rõ ràng
- ✅ **Validation** - Check signature trước khi submit

### Reject từ Website (`phieu_thu_chi.html` - `rejectFromModal()`)
- ✅ **Yêu cầu lý do từ chối** (bắt buộc)
- ✅ **Kiểm tra duplicate** - Backend kiểm tra status hiện tại
- ✅ **POST method** - Consistent với approve
- ✅ **Error handling** - Phát hiện HTML error pages, hiển thị lỗi rõ ràng
- ✅ **Field name** - Sử dụng `rejectReason` (đúng với backend)

---

## 🔒 Backend Protection (`VOUCHER_WORKFLOW_BACKEND.gs`)

### Duplicate Check
```javascript
// Kiểm tra latest status trong Voucher_History
if (latestStatus === 'Approved' || latestAction === 'Approved') {
  return createResponse(false, 'Phiếu này đã được duyệt trước đó...');
}

if (latestStatus === 'Rejected' || latestAction === 'Rejected') {
  return createResponse(false, 'Phiếu này đã được từ chối trước đó...');
}
```

### Signature Validation (Approve only)
```javascript
// Chỉ approve mới yêu cầu signature
if (!v.approverSignature || v.approverSignature.trim() === '') {
  return createResponse(false, 'Vui lòng tải lên chữ ký trước khi phê duyệt');
}
```

### Reject Reason Validation
```javascript
// Reject yêu cầu lý do
if (!rejectReason || rejectReason.trim() === '') {
  return createResponse(false, 'Vui lòng nhập lý do từ chối');
}
```

---

## ✅ Testing Checklist

### Test Approve từ Email
- [ ] Click approve link trong email
- [ ] Upload chữ ký thành công
- [ ] Approve voucher thành công
- [ ] Thử approve lại voucher đã approved → Phải báo lỗi "đã được xử lý"
- [ ] Thử approve voucher đã rejected → Phải báo lỗi "đã được từ chối"
- [ ] Không upload chữ ký → Phải báo lỗi yêu cầu upload

### Test Reject từ Email
- [ ] Click reject link trong email
- [ ] Nhập lý do từ chối
- [ ] Reject voucher thành công
- [ ] Thử reject lại voucher đã rejected → Phải báo lỗi "đã được xử lý"
- [ ] Thử reject voucher đã approved → Phải báo lỗi "đã được duyệt"
- [ ] Không nhập lý do → Phải báo lỗi yêu cầu nhập lý do

### Test Approve từ Website
- [ ] Mở voucher modal
- [ ] Upload chữ ký người phê duyệt
- [ ] Click "Phê duyệt"
- [ ] Approve voucher thành công
- [ ] Thử approve lại voucher đã approved → Phải báo lỗi
- [ ] Không upload chữ ký → Phải báo lỗi yêu cầu upload

### Test Reject từ Website
- [ ] Mở voucher modal
- [ ] Click "Từ chối"
- [ ] Nhập lý do từ chối
- [ ] Reject voucher thành công
- [ ] Thử reject lại voucher đã rejected → Phải báo lỗi
- [ ] Không nhập lý do → Phải báo lỗi yêu cầu nhập lý do

---

## 🔧 Troubleshooting

### Lỗi: "Unexpected token '<', "<!doctype"..."
**Nguyên nhân:** Backend trả về HTML thay vì JSON
**Giải pháp:** 
- Frontend đã có code phát hiện HTML error pages
- Kiểm tra backend logs trong Google Apps Script
- Đảm bảo backend luôn trả về JSON qua `createResponse()`

### Lỗi: "Phiếu này đã được xử lý trước đó"
**Nguyên nhân:** Voucher đã được approve/reject
**Giải pháp:** Đây là hành vi đúng - hệ thống ngăn duplicate processing

### Lỗi: "Vui lòng tải lên chữ ký"
**Nguyên nhân:** Approve yêu cầu chữ ký
**Giải pháp:** Upload chữ ký trước khi approve (chỉ áp dụng cho approve, không áp dụng cho reject)

---

## 📝 Notes

- **Signature chỉ bắt buộc cho Approve**, không bắt buộc cho Reject
- **Reject chỉ cần lý do**, không cần chữ ký
- **Duplicate check** hoạt động cho cả Email và Website
- **POST method** được dùng cho cả Approve và Reject (để gửi signature/reason)
- **Backend** kiểm tra duplicate dựa trên latest status trong Voucher_History sheet

