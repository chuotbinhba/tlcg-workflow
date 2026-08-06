/**
 * TLCG Workflow — shared bilingual (VI/EN) layer.
 *
 * Loaded by every page via <script src="i18n.js"></script> before the page's
 * own inline script. No build step; mirrors the tlcg_companies_embed.js pattern.
 *
 * IMPORTANT — display-only status mapping:
 * Vietnamese status strings ('Chờ duyệt', 'Đã duyệt', 'Từ chối', ...) are used
 * as COMPARISON values in filter logic and in the Apps Script backend, and are
 * written into Google Sheets. They are never translated in place. Use tStatus()
 * only where a status is painted into the DOM.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'tlc_language';
  var SUPPORTED = ['vi', 'en'];
  var DEFAULT_LANG = 'vi';

  // ---------------------------------------------------------------- storage

  // Safari private mode throws on localStorage write; degrade to in-memory.
  var memoryLang = null;

  function readStored() {
    try {
      return global.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return memoryLang;
    }
  }

  function writeStored(lang) {
    memoryLang = lang;
    try {
      global.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* in-memory only */
    }
  }

  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) !== -1;
  }

  /** Stored choice -> browser language -> Vietnamese. */
  function detectLang() {
    var stored = readStored();
    if (isSupported(stored)) return stored;

    var nav = global.navigator || {};
    var candidates = [].concat(nav.languages || [], [nav.language || '']);
    for (var i = 0; i < candidates.length; i++) {
      var tag = String(candidates[i] || '').toLowerCase();
      if (!tag) continue;
      if (tag.indexOf('vi') === 0) return 'vi';
      if (tag.indexOf('en') === 0) return 'en';
    }
    return DEFAULT_LANG;
  }

  var currentLang = null;

  // ----------------------------------------------------------- translations

  // Shared chrome. Page-specific keys are merged in via TLCI18n.extend().
  var strings = {
    vi: {
      // Brand / nav
      appName: 'Business Process Management (BPM)',
      navHome: 'Trang chủ',
      navAdmin: 'Quản trị',
      backToDash: 'Quay lại',
      backToHome: 'Về trang chủ',

      // Hubs
      opsHubTitle: 'Vận hành Nhóm',
      o2cTitle: 'Bán hàng (O2C)',
      p2pTitle: 'Mua hàng (P2P)',
      cashTitle: 'Tiền mặt & Quản trị',
      openProcesses: 'Mở hệ thống',

      // Documents
      quotation: 'Báo giá',
      contract: 'Hợp đồng',
      vatInvoice: 'Hóa đơn VAT',
      purchaseRequest: 'Yêu cầu mua hàng',
      acceptance: 'Biên bản nghiệm thu',
      paymentRequest: 'Đề nghị thanh toán',
      cashBook: 'Sổ quỹ',
      vouchers: 'Phiếu thu/chi',

      // Auth
      loginTitle: 'Đăng nhập TLCGroup',
      loginSubtitle: 'Đăng nhập vào tài khoản của bạn',
      signIn: 'Đăng nhập',
      signOut: 'Đăng xuất',
      email: 'Email',
      password: 'Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      profile: 'Hồ sơ',

      // Common actions
      save: 'Lưu',
      submit: 'Gửi phê duyệt',
      cancel: 'Hủy',
      close: 'Đóng',
      confirm: 'Xác nhận',
      search: 'Tìm kiếm',
      filter: 'Bộ lọc',
      refresh: 'Làm mới',
      exportLabel: 'Xuất file',
      print: 'In',
      previous: 'Quay lại',
      next: 'Tiếp theo',
      approve: 'Phê duyệt',
      reject: 'Từ chối',
      delete: 'Xóa',
      edit: 'Sửa',
      view: 'Xem',
      add: 'Thêm',

      // Common fields
      company: 'Công ty',
      date: 'Ngày',
      currency: 'Tiền tệ',
      amount: 'Số tiền',
      total: 'Tổng cộng',
      note: 'Ghi chú',
      status: 'Trạng thái',
      requester: 'Người đề nghị',
      department: 'Bộ phận',

      // Feedback
      loading: 'Đang tải...',
      saving: 'Đang lưu...',
      noData: 'Không có dữ liệu',
      required: 'Bắt buộc',
      errorGeneric: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      errorNetwork: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      successSaved: 'Đã lưu thành công',
      successSubmitted: 'Đã gửi thành công',

      // AI
      aiTitle: '✨ Hỏi Đáp TLC AI',
      aiWelcome: 'Xin chào! Tôi có thể giúp gì về O2C, P2P hay Tiền mặt?'
    },
    en: {
      appName: 'Business Process Management (BPM)',
      navHome: 'Home',
      navAdmin: 'Admin',
      backToDash: 'Back',
      backToHome: 'Back to Home',

      opsHubTitle: 'Group Operations Hub',
      o2cTitle: 'Order to Cash',
      p2pTitle: 'Purchase to Pay',
      cashTitle: 'Cash & Admin',
      openProcesses: 'Launch System',

      quotation: 'Quotation',
      contract: 'Contract',
      vatInvoice: 'VAT Invoice',
      purchaseRequest: 'Purchase Request',
      acceptance: 'Acceptance Minutes',
      paymentRequest: 'Payment Request',
      cashBook: 'Cash Book',
      vouchers: 'Vouchers',

      loginTitle: 'TLCGroup Login',
      loginSubtitle: 'Sign in to your account',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      profile: 'Profile',

      save: 'Save',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      exportLabel: 'Export',
      print: 'Print',
      previous: 'Previous',
      next: 'Next',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',

      company: 'Company',
      date: 'Date',
      currency: 'Currency',
      amount: 'Amount',
      total: 'Total',
      note: 'Note',
      status: 'Status',
      requester: 'Requester',
      department: 'Department',

      loading: 'Loading...',
      saving: 'Saving...',
      noData: 'No data',
      required: 'Required',
      errorGeneric: 'Something went wrong. Please try again.',
      errorNetwork: 'Connection error. Please check your network.',
      successSaved: 'Saved successfully',
      successSubmitted: 'Submitted successfully',

      aiTitle: '✨ Ask TLC AI',
      aiWelcome: 'Hello! I can help with O2C, P2P or Cash.'
    }
  };

  /**
   * Display-only status map, keyed by the exact Vietnamese value stored in
   * Sheets. Never use this for comparisons — only for rendering.
   */
  var statusMap = {
    'Chờ duyệt': { vi: 'Chờ duyệt', en: 'Pending' },
    'Chờ xác nhận': { vi: 'Chờ xác nhận', en: 'Awaiting Confirmation' },
    'Đã duyệt': { vi: 'Đã duyệt', en: 'Approved' },
    'Đã xác nhận': { vi: 'Đã xác nhận', en: 'Confirmed' },
    'Đã nghiệm thu': { vi: 'Đã nghiệm thu', en: 'Accepted' },
    'Từ chối': { vi: 'Từ chối', en: 'Rejected' },
    'Trả lại': { vi: 'Trả lại', en: 'Returned' },
    'Đang xử lý': { vi: 'Đang xử lý', en: 'In Progress' },
    'Hoàn thành': { vi: 'Hoàn thành', en: 'Completed' },
    'Đã hủy': { vi: 'Đã hủy', en: 'Cancelled' },
    'Nháp': { vi: 'Nháp', en: 'Draft' },
    'Đã thanh toán': { vi: 'Đã thanh toán', en: 'Paid' },
    // English values already present in some backend rows.
    Pending: { vi: 'Chờ duyệt', en: 'Pending' },
    Approved: { vi: 'Đã duyệt', en: 'Approved' },
    Rejected: { vi: 'Từ chối', en: 'Rejected' }
  };

  // -------------------------------------------------------------- accessors

  function getLang() {
    if (currentLang === null) currentLang = detectLang();
    return currentLang;
  }

  /** Look up a key. Falls back to the vi table, then `fallback`, then the key. */
  function t(key, fallback) {
    var lang = getLang();
    var table = strings[lang] || strings[DEFAULT_LANG];
    if (table && table[key] != null) return table[key];

    var base = strings[DEFAULT_LANG];
    if (base && base[key] != null) return base[key];

    return fallback != null ? fallback : key;
  }

  /** Translate a status for DISPLAY only. Unknown values pass through. */
  function tStatus(status) {
    if (status == null || status === '') return status;
    var entry = statusMap[String(status).trim()];
    if (!entry) return status;
    return entry[getLang()] || status;
  }

  /** Merge page-specific strings: extend({vi: {...}, en: {...}}). */
  function extend(extra) {
    if (!extra) return;
    SUPPORTED.forEach(function (lang) {
      if (!extra[lang]) return;
      if (!strings[lang]) strings[lang] = {};
      Object.keys(extra[lang]).forEach(function (key) {
        strings[lang][key] = extra[lang][key];
      });
    });
  }

  // ---------------------------------------------------------------- render

  var ATTR_TARGETS = [
    { attr: 'data-i18n', apply: setText },
    { attr: 'data-i18n-html', apply: setHtml },
    { attr: 'data-i18n-placeholder', apply: setProp('placeholder') },
    { attr: 'data-i18n-title', apply: setProp('title') },
    { attr: 'data-i18n-aria', apply: setAttr('aria-label') },
    { attr: 'data-i18n-value', apply: setProp('value') }
  ];

  function setText(el, value) {
    el.textContent = value;
  }

  // Only for keys whose translations intentionally contain markup.
  function setHtml(el, value) {
    el.innerHTML = value;
  }

  function setProp(prop) {
    return function (el, value) {
      el[prop] = value;
    };
  }

  function setAttr(name) {
    return function (el, value) {
      el.setAttribute(name, value);
    };
  }

  /**
   * Paint every tagged element under `root`. Elements keep their original
   * inline text as the fallback, so an unknown key never blanks the UI.
   */
  function apply(root) {
    var scope = root || global.document;
    if (!scope || !scope.querySelectorAll) return;

    ATTR_TARGETS.forEach(function (target) {
      var nodes = scope.querySelectorAll('[' + target.attr + ']');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var key = el.getAttribute(target.attr);
        if (!key) continue;

        // Remember the authored text so we can fall back to it forever.
        var cacheAttr = 'data-i18n-orig-' + target.attr;
        if (!el.hasAttribute(cacheAttr)) {
          var original =
            target.attr === 'data-i18n' ? el.textContent
              : target.attr === 'data-i18n-html' ? el.innerHTML
                : target.attr === 'data-i18n-aria' ? el.getAttribute('aria-label')
                  : el[target.attr.replace('data-i18n-', '')];
          el.setAttribute(cacheAttr, original == null ? '' : original);
        }

        target.apply(el, t(key, el.getAttribute(cacheAttr)));
      }
    });
  }

  /** Keep every EN/VI switcher on the page in sync. */
  function syncSwitchers(lang) {
    var doc = global.document;
    if (!doc || !doc.querySelectorAll) return;

    // Preferred markup: <button data-lang="en">. Legacy: id="lang-en".
    var buttons = doc.querySelectorAll('[data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var btnLang = btn.getAttribute('data-lang');
      if (!isSupported(btnLang)) continue;
      var active = btnLang === lang;
      // classList.toggle preserves ios-segmented-item; never reassign className.
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    SUPPORTED.forEach(function (code) {
      var legacy = doc.getElementById('lang-' + code);
      if (!legacy || legacy.hasAttribute('data-lang')) return;
      var isActive = code === lang;
      legacy.classList.toggle('active', isActive);
      legacy.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  /**
   * Inject switcher styles so pages without the iOS design system still get a
   * correctly-styled control. Scoped under [data-tlc-i18n-css] and written so
   * pages that already define .ios-segmented keep their own look.
   */
  function injectStyles() {
    var doc = global.document;
    if (!doc || !doc.head || doc.getElementById('tlc-i18n-styles')) return;

    var css =
      '.tlc-lang-switch{display:inline-flex;background:rgba(118,118,128,0.12);' +
      'border-radius:8px;padding:2px;gap:0;}' +
      '.tlc-lang-switch button{flex:1;padding:4px 10px;font-size:12px;' +
      'font-weight:600;text-align:center;border:none;background:transparent;' +
      'color:#1c1c1e;cursor:pointer;border-radius:6px;line-height:1.4;' +
      'transition:background-color .2s,box-shadow .2s;}' +
      '.tlc-lang-switch button.active{background:#fff;' +
      'box-shadow:0 1px 2px rgba(0,0,0,.04),0 1px 3px rgba(0,0,0,.08);}' +
      '.tlc-lang-switch button:focus-visible{outline:2px solid #007AFF;' +
      'outline-offset:2px;}';

    var style = doc.createElement('style');
    style.id = 'tlc-i18n-styles';
    style.textContent = css;
    doc.head.appendChild(style);
  }

  var listeners = [];

  /** Register a callback to re-render dynamic content after a change. */
  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  function setLanguage(lang) {
    if (!isSupported(lang)) lang = DEFAULT_LANG;

    currentLang = lang;
    writeStored(lang);

    var doc = global.document;
    if (doc && doc.documentElement) doc.documentElement.lang = lang;

    apply();
    syncSwitchers(lang);

    listeners.forEach(function (fn) {
      // One bad listener must not stop the rest of the page updating.
      try {
        fn(lang);
      } catch (e) {
        if (global.console) global.console.error('[i18n] listener failed:', e);
      }
    });

    return lang;
  }

  /**
   * Build an EN/VI switcher and prepend it to `target` (element or selector).
   * Used by pages that have a nav but no iOS segmented control of their own.
   * No-op if that container already holds a switcher.
   */
  function mountSwitcher(target) {
    var doc = global.document;
    if (!doc) return null;

    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host || host.querySelector('.tlc-lang-switch')) return null;

    var wrap = doc.createElement('div');
    wrap.className = 'tlc-lang-switch';

    SUPPORTED.forEach(function (code) {
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-lang', code);
      btn.textContent = code.toUpperCase();
      btn.setAttribute(
        'aria-label',
        code === 'en' ? 'Switch to English' : 'Switch to Vietnamese'
      );
      btn.addEventListener('click', function () {
        setLanguage(code);
      });
      wrap.appendChild(btn);
    });

    host.insertBefore(wrap, host.firstChild);
    syncSwitchers(getLang());
    return wrap;
  }

  /** Apply the resolved language on load without overwriting the stored one. */
  function init() {
    injectStyles();

    // Pages opt in declaratively with <div data-tlc-lang-switcher></div> or by
    // marking an existing nav container.
    var doc = global.document;
    if (doc && doc.querySelectorAll) {
      var hosts = doc.querySelectorAll('[data-tlc-lang-switcher]');
      for (var i = 0; i < hosts.length; i++) mountSwitcher(hosts[i]);
    }

    setLanguage(getLang());
  }

  var TLCI18n = {
    getLang: getLang,
    setLanguage: setLanguage,
    t: t,
    tStatus: tStatus,
    apply: apply,
    extend: extend,
    onChange: onChange,
    mountSwitcher: mountSwitcher,
    init: init,
    STORAGE_KEY: STORAGE_KEY,
    SUPPORTED: SUPPORTED
  };

  global.TLCI18n = TLCI18n;

  // Existing inline handlers call setLanguage('en') directly.
  global.setLanguage = setLanguage;

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : this);
