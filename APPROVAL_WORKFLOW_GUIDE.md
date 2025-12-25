# Enhanced Approval Workflow - Hướng dẫn sử dụng

## 🎯 Tổng quan

Approval Workflow đã được cải thiện với các tính năng nâng cao theo phong cách BPM chuyên nghiệp.

---

## ✨ Tính năng mới

### 1. **Multi-level Approval (Phê duyệt nhiều cấp)**
- ✅ Sequential approval: Phê duyệt tuần tự từng cấp
- ✅ Parallel approval: Phê duyệt song song nhiều người
- ✅ Conditional routing: Routing dựa trên điều kiện (ví dụ: amount > 10M VND)

### 2. **Visual Timeline**
- ✅ Timeline hiển thị các bước phê duyệt
- ✅ Status indicators: Pending, Active, Completed, Rejected
- ✅ Animated progress indicators
- ✅ Visual connection lines

### 3. **Approval Actions**
- ✅ **Approve**: Phê duyệt
- ✅ **Reject**: Từ chối (yêu cầu comment)
- ✅ **Request Changes**: Yêu cầu chỉnh sửa

### 4. **Comments System**
- ✅ Comment cho mỗi action
- ✅ Required comment khi reject
- ✅ Comment history

### 5. **Approval History**
- ✅ Lịch sử đầy đủ các actions
- ✅ Timestamp cho mỗi action
- ✅ Approver name
- ✅ Comments

### 6. **Progress Tracking**
- ✅ Progress bar hiển thị tiến độ
- ✅ "X of Y completed" counter
- ✅ Real-time updates

---

## 📋 Các loại Approval Workflow

### 1. Sequential Approval (Tuần tự)
**Ví dụ: Quotation Approval**
```
Step 1: Manager Approval → Step 2: Director Approval
```
- Phải approve Step 1 trước khi Step 2 active
- Step 2 chỉ hiện khi Step 1 completed

### 2. Parallel Approval (Song song)
**Ví dụ: Contract Approval**
```
Legal Approval || Accountant Approval || Director Approval
```
- Có thể approve song song
- Tất cả phải approve để hoàn thành
- Một reject → toàn bộ rejected

### 3. Conditional Approval (Có điều kiện)
**Ví dụ: Director Approval chỉ khi amount > 10M VND**
```
Step 1: Manager → (if amount > 10M) → Step 2: Director
```

---

## 🎨 UI Components

### Approval Timeline
```html
<div class="approval-timeline">
    <div class="approval-step active">
        <!-- Step content -->
    </div>
</div>
```

### Status Badges
- `badge-pending`: Đang chờ
- `badge-approved`: Đã phê duyệt
- `badge-rejected`: Đã từ chối
- `badge-changes-requested`: Yêu cầu chỉnh sửa

### Approval Actions
- Green button: Approve
- Red button: Reject
- Amber button: Request Changes

---

## 🔧 JavaScript Functions

### approveStep(processId, stepNumber)
Phê duyệt một step trong workflow.

**Parameters:**
- `processId`: ID của process (ví dụ: 'o2c-quot', 'p2p-pr')
- `stepNumber`: Số thứ tự step (1, 2, 3...)

**Example:**
```javascript
approveStep('o2c-quot', 1); // Approve step 1 của Quotation
```

### rejectStep(processId, stepNumber)
Từ chối một step (yêu cầu comment).

**Example:**
```javascript
rejectStep('p2p-pr', 1); // Reject step 1 của Purchase Request
```

### requestChanges(processId, stepNumber)
Yêu cầu chỉnh sửa (yêu cầu comment).

**Example:**
```javascript
requestChanges('o2c-quot', 1);
```

### approveParallel(role, processId)
Phê duyệt trong parallel approval.

**Example:**
```javascript
approveParallel('legal', 'o2c-cont'); // Approve Legal trong Contract
approveParallel('accountant', 'o2c-cont');
approveParallel('director', 'o2c-cont');
```

### toggleApprovalHistory(historyId)
Hiển thị/ẩn approval history.

**Example:**
```javascript
toggleApprovalHistory('o2c-quot-history');
```

---

## 📊 Approval History Structure

```javascript
approvalHistory = {
    'o2c-quot': [
        {
            step: 1,
            action: 'approved', // or 'rejected', 'changes_requested'
            approver: 'Nguyễn Văn Chinh',
            comment: 'Looks good',
            timestamp: '24/12/2025 10:30 AM'
        }
    ]
}
```

---

## 🎯 Workflow Examples

### Example 1: Quotation Approval (Sequential)
```
1. Manager Approval (Active)
   ↓ (after approve)
2. Director Approval (if amount > 10M VND)
```

### Example 2: Contract Approval (Parallel)
```
Legal Approval || Accountant Approval || Director Approval
(All must approve)
```

### Example 3: Purchase Request (Mixed)
```
Step 1: Budget Approval (Active)
Step 2: Supplier Approval (Active - Parallel)
   ↓ (after both approve)
Step 3: Final Approval (Waiting)
```

---

## 🔔 Notifications

Khi approve/reject:
- ✅ Toast notification hiển thị
- ✅ Approval history được update
- ✅ Progress bar được update
- ✅ Next step được activate (nếu sequential)

---

## 📝 Best Practices

1. **Always add comments** khi reject hoặc request changes
2. **Check approval history** trước khi approve
3. **Verify approver assignment** trước khi submit
4. **Monitor progress** để biết workflow status

---

## 🚀 Future Enhancements

- [ ] Email notifications khi có approval request
- [ ] Escalation rules (tự động chuyển cấp khi timeout)
- [ ] Delegation (ủy quyền)
- [ ] Approval templates
- [ ] Bulk approval
- [ ] Approval analytics

---

**Bạn có thể test approval workflow ngay bây giờ!**

