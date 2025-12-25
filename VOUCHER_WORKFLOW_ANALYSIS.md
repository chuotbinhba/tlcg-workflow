# Phân tích Workflow - Phiếu Thu/Chi

## 📋 WORKFLOW HIỆN TẠI

### 1. **GIAI ĐOẠN 1: Điền Form (Requester)**
```
1. Mở trang phieu_thu_chi.html
2. Điền thông tin cơ bản:
   - Chọn Công ty → Tự động điền thông tin công ty
   - Chọn Loại phiếu (Thu/Chi) → Tự động cập nhật title
   - Số phiếu tự động generate (TL-YYYY-MM-XXXX)
   - Ngày lập tự động điền (hôm nay)
3. Chọn Người đề nghị → Tự động điền Bộ phận
4. Điền Thông tin đối tượng:
   - Chọn/Nhập người nộp/nhận
   - Điền Lý do
5. Thêm chi tiết chi phí:
   - Chọn Loại tiền
   - Thêm dòng chi tiết (Nội dung, Số tiền, Đính kèm)
   - Tổng cộng tự động tính
   - Số tiền bằng chữ tự động chuyển đổi
6. Chọn Người phê duyệt
7. Có thể:
   - Lưu phiếu (localStorage) - không gửi đi
   - Gửi phê duyệt (gửi email)
   - Xuất PDF/Excel
   - Lưu/Load Template
```

### 2. **GIAI ĐOẠN 2: Gửi Phê Duyệt**
```
1. Click "Gửi phê duyệt"
2. Validation tất cả trường bắt buộc
3. Nếu hợp lệ:
   - Gửi email đến Approver (TO)
   - CC email đến Requester (thông báo đã gửi)
   - Email chứa:
     * Thông tin chi tiết phiếu
     * Bảng chi tiết các khoản mục
     * 2 nút: "Phê duyệt" và "Trả lại / Từ chối"
   - Cập nhật status: "Pending"
   - Thêm vào Approval History
4. Nếu không hợp lệ:
   - Hiển thị lỗi validation
   - Scroll đến trường lỗi đầu tiên
```

### 3. **GIAI ĐOẠN 3: Phê Duyệt/Từ Chối (Approver)**
```
1. Approver nhận email
2. Click nút "Phê duyệt" hoặc "Trả lại / Từ chối"
3. Mở trang approve_voucher.html hoặc reject_voucher.html
4. Xem thông tin phiếu
5. Click "Xác nhận phê duyệt" hoặc "Xác nhận từ chối"
6. Backend xử lý:
   - Kiểm tra trạng thái hiện tại (tránh duplicate approval)
   - Nếu đã approved/rejected → Block
   - Nếu chưa → Cập nhật status
   - Ghi vào Voucher_History sheet
   - Gửi email thông báo đến Requester
7. Requester nhận email thông báo kết quả
```

### 4. **GIAI ĐOẠN 4: Sau Phê Duyệt**
```
- Status được cập nhật: "Approved" hoặc "Rejected"
- Approval History hiển thị đầy đủ
- Requester có thể:
  - Xem status
  - Xem lịch sử phê duyệt
  - Nếu rejected → Phải tạo phiếu mới
  - Nếu approved → Có thể xuất PDF/Excel
```

---

## 🔍 PHÂN TÍCH ĐIỂM MẠNH

✅ **Validation mạnh mẽ**: Real-time validation với visual feedback  
✅ **Auto-save**: Tự động lưu vào localStorage  
✅ **Email workflow**: Tự động gửi email với nút action  
✅ **History tracking**: Lưu lịch sử phê duyệt  
✅ **Export/Import**: PDF, Excel, Template  
✅ **File attachments**: Upload và preview file đính kèm  
✅ **Duplicate prevention**: Chống phê duyệt/từ chối 2 lần  

---

## 🚀 ĐỀ XUẤT CẢI THIỆN

### **A. UX/UI IMPROVEMENTS**

#### 1. **Progress Indicator / Stepper**
```
Hiện tại: Form dài, không có chỉ dẫn rõ ràng về tiến độ
Đề xuất: Thêm stepper/progress bar
- Step 1: Thông tin cơ bản (Công ty, Loại phiếu, Người đề nghị)
- Step 2: Thông tin đối tượng (Người nộp/nhận, Lý do)
- Step 3: Chi tiết chi phí (Bảng kê)
- Step 4: Phê duyệt (Chọn approver, Review)
- Step 5: Submit

Lợi ích:
- User biết đang ở bước nào
- Dễ dàng navigate giữa các bước
- Validation theo từng bước
```

#### 2. **Draft Management**
```
Hiện tại: Chỉ có "Lưu phiếu" vào localStorage
Đề xuất: 
- Danh sách Drafts (sidebar hoặc dropdown)
- Hiển thị: Số phiếu, Ngày tạo, Status, Preview
- Click để load draft
- Xóa draft
- Auto-save với tên draft tự động

Lợi ích:
- Quản lý nhiều phiếu đang soạn
- Không mất dữ liệu khi refresh
```

#### 3. **Inline Validation với Tooltips**
```
Hiện tại: Validation hiển thị error message dưới field
Đề xuất:
- Tooltip hiển thị ngay khi hover vào icon ⚠️
- Inline suggestions (ví dụ: "Bạn có muốn chọn công ty ABC?")
- Auto-complete cho các field thường dùng
- Smart suggestions dựa trên lịch sử

Lợi ích:
- UI sạch hơn
- Hướng dẫn rõ ràng hơn
```

#### 4. **Quick Actions Menu**
```
Hiện tại: Nhiều buttons ở cuối form
Đề xuất: 
- Floating action button (FAB) với menu dropdown
- Quick actions:
  * "Lưu nhanh" (Ctrl+S)
  * "Gửi phê duyệt" (Ctrl+Enter)
  * "Xuất PDF" (Ctrl+P)
  * "Copy link" (chia sẻ phiếu)
  * "In" (Print)

Lợi ích:
- Tiết kiệm không gian
- Keyboard shortcuts
- Dễ truy cập
```

#### 5. **Real-time Collaboration**
```
Hiện tại: Chỉ 1 người có thể chỉnh sửa
Đề xuất:
- Hiển thị "Đang chỉnh sửa bởi [Tên]" nếu có người khác đang mở
- Lock field khi có người đang edit
- Comments/Notes section (người phê duyệt có thể để lại ghi chú)

Lợi ích:
- Tránh conflict
- Communication tốt hơn
```

---

### **B. WORKFLOW IMPROVEMENTS**

#### 6. **Multi-level Approval**
```
Hiện tại: Chỉ 1 người phê duyệt
Đề xuất:
- Sequential approval: A → B → C (phải approve theo thứ tự)
- Parallel approval: A, B, C cùng approve (chỉ cần 1 người)
- Conditional routing: 
  * Nếu số tiền < 10M → Chỉ cần Manager
  * Nếu số tiền >= 10M → Cần Director
  * Nếu số tiền >= 50M → Cần CEO

Lợi ích:
- Phù hợp với quy trình thực tế
- Linh hoạt hơn
```

#### 7. **Approval Timeline Visualization**
```
Hiện tại: Approval History chỉ là text list
Đề xuất:
- Timeline visualization (giống Git commit history)
- Hiển thị:
  * Người gửi → Người nhận
  * Thời gian
  * Status (Pending/Approved/Rejected)
  * Comments (nếu có)
- Visual flow: [Requester] → [Approver 1] → [Approver 2] → [Approved]

Lợi ích:
- Dễ theo dõi
- Trực quan hơn
```

#### 8. **Request Changes / Revision**
```
Hiện tại: Chỉ có Approve/Reject
Đề xuất:
- Thêm option "Yêu cầu chỉnh sửa"
- Approver có thể:
  * Chọn field cần sửa
  * Thêm comment
  * Gửi lại cho Requester
- Requester nhận notification → Sửa → Gửi lại

Lợi ích:
- Không phải tạo phiếu mới
- Workflow mượt mà hơn
```

#### 9. **Auto-assign Approver**
```
Hiện tại: Requester phải chọn approver thủ công
Đề xuất:
- Auto-assign dựa trên:
  * Số tiền (routing rules)
  * Bộ phận (department routing)
  * Loại phiếu (Thu vs Chi có approver khác nhau)
  * Công ty (mỗi công ty có approver khác nhau)
- Hiển thị "Suggested Approver" với option override

Lợi ích:
- Giảm lỗi chọn sai approver
- Tự động hóa
```

#### 10. **Bulk Actions**
```
Hiện tại: Chỉ xử lý từng phiếu một
Đề xuất:
- Dashboard với danh sách phiếu
- Bulk actions:
  * Approve nhiều phiếu cùng lúc
  * Export nhiều phiếu ra Excel
  * Gửi reminder cho nhiều approver
- Filters: Status, Date range, Company, Department

Lợi ích:
- Tiết kiệm thời gian
- Quản lý hiệu quả hơn
```

---

### **C. TECHNICAL IMPROVEMENTS**

#### 11. **Offline Support**
```
Hiện tại: Cần internet để gửi phê duyệt
Đề xuất:
- Service Worker để cache
- Offline mode: Điền form, lưu draft
- Sync khi online lại
- Queue các action cần internet

Lợi ích:
- Làm việc được khi mất mạng
- Better UX
```

#### 12. **Real-time Status Updates**
```
Hiện tại: Status chỉ cập nhật khi refresh
Đề xuất:
- WebSocket hoặc Server-Sent Events (SSE)
- Real-time push notification khi:
  * Approver approve/reject
  * Status thay đổi
  * Có comment mới
- Browser notification (nếu user cho phép)

Lợi ích:
- Cập nhật tức thời
- Không cần refresh
```

#### 13. **Advanced Search & Filters**
```
Hiện tại: Không có search/filter
Đề xuất:
- Global search: Tìm theo số phiếu, người đề nghị, công ty
- Advanced filters:
  * Date range
  * Amount range
  * Status
  * Company
  * Department
  * Approver
- Saved filters (favorites)

Lợi ích:
- Tìm kiếm nhanh
- Quản lý nhiều phiếu dễ dàng
```

#### 14. **Audit Trail**
```
Hiện tại: Chỉ có Approval History cơ bản
Đề xuất:
- Chi tiết audit trail:
  * Ai thay đổi gì, khi nào
  * IP address
  * Browser/Device info
  * Before/After values
- Export audit log
- Compliance reporting

Lợi ích:
- Security
- Compliance
- Debugging
```

#### 15. **Mobile Optimization**
```
Hiện tại: Responsive nhưng chưa tối ưu cho mobile
Đề xuất:
- Mobile-first design
- Touch-friendly buttons
- Swipe gestures (swipe để approve/reject)
- Mobile app (PWA)
- Camera integration (chụp hóa đơn)

Lợi ích:
- Làm việc mọi lúc mọi nơi
- Tiện lợi hơn
```

---

### **D. BUSINESS LOGIC IMPROVEMENTS**

#### 16. **Budget Tracking**
```
Đề xuất:
- Hiển thị budget còn lại của department/company
- Warning khi vượt budget
- Budget allocation per category
- Monthly/Quarterly reports

Lợi ích:
- Kiểm soát chi phí
- Planning tốt hơn
```

#### 17. **Recurring Vouchers**
```
Đề xuất:
- Tạo template cho phiếu định kỳ (hàng tháng, hàng quý)
- Auto-generate phiếu theo schedule
- Auto-send for approval

Lợi ích:
- Tiết kiệm thời gian
- Không quên
```

#### 18. **Integration với Accounting System**
```
Đề xuất:
- Export sang QuickBooks, Xero, SAP
- Auto-post journal entries
- Sync với bank statements
- Reconciliation

Lợi ích:
- Tự động hóa
- Giảm manual work
```

#### 19. **Analytics & Reporting**
```
Đề xuất:
- Dashboard với charts:
  * Vouchers by status
  * Spending by department
  * Approval time (average)
  * Top approvers
- Custom reports
- Export reports

Lợi ích:
- Insights
- Decision making
```

#### 20. **Notifications & Reminders**
```
Đề xuất:
- Email reminders cho approver (nếu chưa approve sau X ngày)
- Slack/Teams integration
- SMS notifications (cho urgent)
- In-app notifications

Lợi ích:
- Không bỏ sót
- Faster approval
```

---

## 📊 PRIORITY MATRIX

### **HIGH PRIORITY (Làm ngay)**
1. ✅ Progress Indicator / Stepper
2. ✅ Draft Management
3. ✅ Multi-level Approval
4. ✅ Approval Timeline Visualization
5. ✅ Request Changes / Revision

### **MEDIUM PRIORITY (Làm sau)**
6. Inline Validation với Tooltips
7. Quick Actions Menu
8. Auto-assign Approver
9. Real-time Status Updates
10. Advanced Search & Filters

### **LOW PRIORITY (Nice to have)**
11. Real-time Collaboration
12. Offline Support
13. Audit Trail
14. Mobile Optimization
15. Budget Tracking

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Phase 1 (2-3 tuần)**:
   - Progress Indicator
   - Draft Management
   - Approval Timeline
   - Request Changes

2. **Phase 2 (3-4 tuần)**:
   - Multi-level Approval
   - Auto-assign Approver
   - Real-time Updates
   - Advanced Search

3. **Phase 3 (4-6 tuần)**:
   - Analytics Dashboard
   - Budget Tracking
   - Mobile App (PWA)
   - Integration

---

## 💡 QUICK WINS (Có thể làm ngay)

1. **Keyboard Shortcuts**: Ctrl+S (Save), Ctrl+Enter (Submit)
2. **Copy Voucher Number**: Click để copy số phiếu
3. **Print-friendly CSS**: Tối ưu khi in
4. **Email Templates**: Cho phép customize email template
5. **Status Badge Colors**: Màu sắc rõ ràng hơn (Pending = Yellow, Approved = Green, Rejected = Red)

---

*Document này sẽ được cập nhật khi có feedback từ user và team.*

