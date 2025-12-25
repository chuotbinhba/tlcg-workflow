# Hướng dẫn Debug - Chi tiết các khoản mục

## Mục đích
Kiểm tra và debug vấn đề "Chi tiết các khoản mục" không hiển thị đầy đủ trong Step 5 (Xem lại & Gửi).

## Các bước Debug

### 1. Mở Developer Tools (Công cụ phát triển)

#### Trên Chrome/Edge:
- Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows/Linux)
- Hoặc `Cmd+Option+I` (Mac)
- Hoặc click chuột phải → "Inspect" / "Kiểm tra"

#### Trên Firefox:
- Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows/Linux)
- Hoặc `Cmd+Option+I` (Mac)

### 2. Mở tab Console

Sau khi mở Developer Tools, chọn tab **Console** để xem logs và errors.

### 3. Test Flow

#### Bước 1: Điền thông tin cơ bản
1. Mở trang `phieu_thu_chi.html`
2. Điền Step 1: Thông tin cơ bản
3. Click "Tiếp theo"

#### Bước 2: Điền thông tin đối tượng
1. Điền Step 2: Thông tin đối tượng
2. Click "Tiếp theo"

#### Bước 3: Điền chi tiết chi phí (QUAN TRỌNG)
1. Ở Step 3: Chi tiết chi phí
2. Click "Thêm dòng" để thêm ít nhất 2-3 dòng
3. Điền thông tin:
   - **Nội dung**: Ví dụ "Chi phí văn phòng phẩm"
   - **Số tiền**: Ví dụ "500000"
   - **Đính kèm**: (Tùy chọn) Upload file nếu có
4. Click "Tiếp theo"

#### Bước 4: Điền thông tin phê duyệt
1. Ở Step 4: Phê duyệt
2. Chọn người phê duyệt
3. Click "Tiếp theo"

#### Bước 5: Kiểm tra Review Section
1. Ở Step 5: Xem lại & Gửi
2. **Quan trọng**: Mở Console (F12) và xem logs

### 4. Kiểm tra Console Logs

Khi vào Step 5, bạn sẽ thấy các logs sau trong Console:

```
=== updateReviewSection: expenseItems ===
expenseItems length: X
Processing item 0: {...}
Item 0 - Content: "...", Amount: ..., Attachments: ...
Generated table rows: ...
```

#### Logs bình thường (OK):
```
=== updateReviewSection: expenseItems ===
expenseItems length: 3
Processing item 0: {content: "Chi phí văn phòng phẩm", amount: 500000, attachments: Array(1)}
Item 0 - Content: "Chi phí văn phòng phẩm", Amount: 500000, Attachments: file1.pdf
Processing item 1: {content: "Chi phí đi lại", amount: 300000, attachments: Array(0)}
Item 1 - Content: "Chi phí đi lại", Amount: 300000, Attachments: Không có
Generated table rows: <tr>...</tr>
```

#### Logs có vấn đề:
```
=== updateReviewSection: expenseItems ===
expenseItems length: 0
// Hoặc
expenseItems length: 3
Processing item 0: {content: "", amount: 0, attachments: Array(0)}
// Hoặc
review-expense-items element not found!
```

### 5. Kiểm tra Elements (DOM)

#### Bước 1: Mở tab Elements/Inspector
- Trong Developer Tools, chọn tab **Elements** (Chrome) hoặc **Inspector** (Firefox)

#### Bước 2: Tìm bảng expense
1. Nhấn `Ctrl+F` (hoặc `Cmd+F` trên Mac) để mở search
2. Tìm: `expense-table-body`
3. Kiểm tra xem có bao nhiêu `<tr>` (rows) trong `<tbody id="expense-table-body">`

#### Bước 3: Tìm bảng review
1. Tìm: `review-expense-items`
2. Kiểm tra xem có bao nhiêu `<tr>` trong `<tbody id="review-expense-items">`
3. So sánh số lượng rows giữa 2 bảng

### 6. Kiểm tra Variables (Biến)

#### Trong Console, gõ các lệnh sau:

```javascript
// Kiểm tra biến expenseItems
expenseItems

// Kiểm tra số lượng items
expenseItems.length

// Kiểm tra từng item
expenseItems[0]
expenseItems[1]

// Kiểm tra DOM elements
document.getElementById('expense-table-body')
document.getElementById('review-expense-items')

// Kiểm tra số rows trong bảng expense
document.getElementById('expense-table-body').rows.length

// Kiểm tra số rows trong bảng review
document.getElementById('review-expense-items').rows.length
```

### 7. Test Manual Update

Trong Console, gõ lệnh sau để force update review section:

```javascript
updateReviewSection()
```

Sau đó kiểm tra lại bảng "Chi tiết các khoản mục" có hiển thị đúng không.

### 8. Kiểm tra Network (Nếu cần)

Nếu có vấn đề với việc load/save data:

1. Mở tab **Network** trong Developer Tools
2. Reload trang (F5)
3. Tìm các requests liên quan đến:
   - `localStorage` (nếu có)
   - API calls (nếu có)
4. Kiểm tra response và status code

### 9. Common Issues (Vấn đề thường gặp)

#### Issue 1: expenseItems là empty array
**Triệu chứng**: `expenseItems length: 0`
**Nguyên nhân**: 
- Chưa điền dữ liệu ở Step 3
- Dữ liệu bị mất khi chuyển step
- localStorage bị clear

**Giải pháp**:
- Điền lại dữ liệu ở Step 3
- Kiểm tra localStorage: `localStorage.getItem('voucher_draft')`

#### Issue 2: expenseItems có dữ liệu nhưng không hiển thị
**Triệu chứng**: `expenseItems length: 3` nhưng bảng trống
**Nguyên nhân**:
- Element `review-expense-items` không tồn tại
- JavaScript error khi render
- CSS ẩn bảng

**Giải pháp**:
- Kiểm tra: `document.getElementById('review-expense-items')`
- Kiểm tra Console có errors không
- Kiểm tra CSS: `getComputedStyle(document.getElementById('review-expense-items')).display`

#### Issue 3: Thiếu thông tin trong bảng
**Triệu chứng**: Bảng hiển thị nhưng thiếu cột (STT, Nội dung, Số tiền, Đính kèm)
**Nguyên nhân**:
- Template HTML bị lỗi
- Data không đúng format

**Giải pháp**:
- Kiểm tra logs: `Item X - Content: "...", Amount: ..., Attachments: ...`
- So sánh với dữ liệu thực tế trong `expenseItems`

### 10. Screenshot và Report

Khi gặp vấn đề, hãy chụp screenshot:

1. **Console logs**: Chụp toàn bộ logs từ Console
2. **Elements tab**: Chụp phần HTML của `review-expense-items`
3. **Bảng hiển thị**: Chụp bảng "Chi tiết các khoản mục" trên màn hình
4. **Network tab**: (Nếu có) Chụp các requests liên quan

### 11. Quick Fix Commands

Nếu cần fix nhanh, chạy các lệnh sau trong Console:

```javascript
// Force update review section
updateReviewSection()

// Clear và reload từ localStorage
loadFromLocalStorage()
updateReviewSection()

// Re-render expense table
renderExpenseTable()
updateReviewSection()

// Check và log expenseItems
console.log('expenseItems)
console.log('expenseItems length:', expenseItems.length)
expenseItems.forEach((item, i) => {
    console.log(`Item ${i}:`, item)
})
```

## Checklist Debug

- [ ] Đã mở Developer Tools (F12)
- [ ] Đã mở tab Console
- [ ] Đã điền đầy đủ Step 3 (ít nhất 2 dòng)
- [ ] Đã chuyển đến Step 5
- [ ] Đã kiểm tra Console logs
- [ ] Đã kiểm tra `expenseItems` variable
- [ ] Đã kiểm tra DOM elements
- [ ] Đã chụp screenshot nếu có lỗi
- [ ] Đã thử các quick fix commands

## Liên hệ Support

Nếu vẫn không giải quyết được, vui lòng cung cấp:
1. Screenshot Console logs
2. Screenshot bảng hiển thị
3. Output của các lệnh debug commands
4. Mô tả chi tiết các bước đã làm

