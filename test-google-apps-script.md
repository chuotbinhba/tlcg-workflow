# Test Google Apps Script

## 🧪 Test Functions

Sau khi deploy Google Apps Script, bạn có thể test các hàm sau:

### 1. Test doGet (Kiểm tra script hoạt động)

1. Mở Google Apps Script editor
2. Chọn hàm `doGet` từ dropdown
3. Click **"Run"**
4. Nếu thành công, sẽ thấy message: "Google Apps Script is running!"

### 2. Test Email Function

1. Chọn hàm `testSendEmail` (cần tạo)
2. Click **"Run"**
3. Kiểm tra email đã được gửi

### 3. Test Sync to Sheets

1. Tạo Google Sheet mới
2. Copy Spreadsheet ID
3. Chọn hàm `testSyncToSheets`
4. Sửa `YOUR_SPREADSHEET_ID_HERE` thành ID thực tế
5. Click **"Run"**
6. Kiểm tra dữ liệu đã được ghi vào sheet

## 📝 Test Code để thêm vào Script

Thêm các hàm test này vào file `.gs`:

```javascript
/**
 * Test function - Gửi email test
 */
function testSendEmail() {
  const testData = {
    action: 'sendApprovalEmail',
    email: {
      to: 'your-email@gmail.com', // Thay bằng email của bạn
      cc: '',
      subject: 'Test Email từ Google Apps Script',
      body: '<h1>Test Email</h1><p>Nếu bạn nhận được email này, nghĩa là Google Apps Script đã hoạt động!</p>'
    }
  };
  
  const result = handleSendEmail(testData);
  Logger.log(result.getContent());
}

/**
 * Test function - Sync to Sheets
 */
function testSyncToSheets() {
  const testData = {
    action: 'syncToSheets',
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE', // Thay bằng ID thực tế
    sheetName: 'Phiếu Thu Chi',
    data: {
      timestamp: new Date().toISOString(),
      voucherNumber: 'TEST-2024-0001',
      voucherType: 'Chi',
      voucherDate: '2024-12-21',
      company: 'CÔNG TY TEST',
      employee: 'Người Test',
      department: 'Phòng Test',
      payeeName: 'Người nhận Test',
      currency: 'VND',
      totalAmount: '1,000,000 VNĐ',
      amountInWords: 'Một triệu đồng',
      reason: 'Test sync function',
      approver: 'Người phê duyệt Test',
      status: 'Chờ phê duyệt',
      expenseItems: [
        { stt: 1, content: 'Test item 1', amount: 500000, attachments: 0 },
        { stt: 2, content: 'Test item 2', amount: 500000, attachments: 1 }
      ],
      approvalHistory: [
        {
          timestamp: new Date().toLocaleString('vi-VN'),
          action: 'Tạo phiếu',
          by: 'Người Test',
          to: 'Hệ thống'
        }
      ]
    }
  };
  
  const result = handleSyncToSheets(testData);
  Logger.log(result.getContent());
}
```

## ✅ Checklist Test

- [ ] Script deploy thành công
- [ ] Web App URL hoạt động (mở URL trong browser)
- [ ] doGet trả về message thành công
- [ ] Email được gửi thành công
- [ ] Dữ liệu được ghi vào Google Sheets
- [ ] Sheet được tạo tự động với header đúng
- [ ] Sheet chi tiết được tạo cho mỗi phiếu
- [ ] Format số tiền và ngày đúng
- [ ] Conditional formatting cho trạng thái hoạt động

## 🐛 Debug Tips

### Xem Logs
1. Trong Google Apps Script editor
2. Click **"Executions"** tab
3. Xem logs của các lần chạy
4. Click vào execution để xem chi tiết

### Common Issues

**Issue**: "Cannot access spreadsheet"
- **Fix**: Share sheet với email Google Apps Script

**Issue**: "Email not sent"
- **Fix**: Kiểm tra quyền Gmail trong "Review Permissions"

**Issue**: "Script timeout"
- **Fix**: Tăng timeout trong Google Apps Script settings

## 📊 Expected Results

### Sheet "Phiếu Thu Chi"
- Header row với màu xanh (#4285F4)
- Dữ liệu được ghi vào dòng tiếp theo
- Format số tiền: #,##0
- Format ngày: dd/mm/yyyy
- Trạng thái có màu sắc:
  - Xanh lá: Đã phê duyệt
  - Đỏ: Từ chối
  - Vàng: Chờ phê duyệt

### Sheet "Chi tiết [Số phiếu]"
- Header: STT, Nội dung, Số tiền, Số file đính kèm
- Dữ liệu chi tiết
- Dòng tổng cộng với công thức SUM


