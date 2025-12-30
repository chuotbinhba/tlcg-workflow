# 📋 Backend URL Configuration Guide

## 🔍 Two Backends Identified

### 1. TLCGroup Backend (Intranet Operations)
**URL:** `https://script.google.com/macros/s/AKfycbwQ9lisLCr2iATBF2NGOqdNlG_f8ygDKrIEYkiZYsaVbm_7gFI4P_EC0FC5Wq-TJdMYKw/exec`

**Handles:**
- ✅ `login` - Authentication
- ✅ `getMasterData` - Master data (employees, customers, suppliers)
- ✅ `getVoucherSummary` - Voucher summary
- ✅ `approveVoucher` - Voucher approval
- ✅ `rejectVoucher` - Voucher rejection
- ✅ `sendForApproval` / `sendEmail` - Send voucher for approval

**Used by:**
- `index.html` - For login and master data
- `phieu_thu_chi.html` - For all voucher operations
- All voucher-related pages

### 2. Phieu Thu Chi Backend (Voucher Operations)
**URL:** `https://script.google.com/macros/s/AKfycbyltkunEjTHhFSRH6evpwDAxZk74QouLTG-FSlCOQtLJGts8guLhFYuBq9n1h0fJvyd/exec`

**Handles:**
- ✅ Voucher-specific operations only
- ⚠️ May not have `login` or `getMasterData`

**Used by:**
- Backup/alternative for voucher operations

## ✅ Recommended Configuration

Since **TLCG_INTRANET_BACKEND_COMPLETE.gs** handles ALL operations (login, master data, AND vouchers), we should use it as the PRIMARY backend.

### Option 1: Single Backend (Recommended)
Use **TLCG_INTRANET_BACKEND_COMPLETE** for everything:
- ✅ Simpler configuration
- ✅ All features in one place
- ✅ Easier to maintain

### Option 2: Separate Backends
If you want to keep them separate:
- `index.html` → TLCG_INTRANET_BACKEND (for login/master data)
- Proxy → VOUCHER_WORKFLOW_BACKEND (for vouchers only)

## 📝 Current Status

- **Proxy (`api/voucher/[action].js`)**: Currently points to VOUCHER_WORKFLOW_BACKEND
- **Frontend files**: All use `/api/voucher` (proxy)
- **Issue**: Need to decide which backend to use

