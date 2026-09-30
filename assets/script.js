/**
 * ==============================================================================
 * Praktikum 3 PABWE — Pengembangan Aplikasi Berbasis Web 2026
 * Mahasiswa: ifs24023
 * Proyek: ifs24023-pabwe-p3
 * 
 * Tiga Fitur Utama (Single Page Application dengan Tab Navigation):
 * 1. Catatan Pengeluaran Harian (Expense Tracker)
 * 2. Bookmark / Link Manager
 * 3. Kuis Interaktif (Quiz App)
 * ==============================================================================
 */

/* ==============================================================================
 * 1. UTILITAS DOM & FORMATTING
 * ============================================================================== */

/**
 * Selektor elemen tunggal dengan pengecekan keberadaan
 * @param {string} selector
 * @returns {HTMLElement}
 */
function $(selector) {
  const el = document.querySelector(selector);
  if (!el) {
    console.warn(`Elemen selector tidak ditemukan: ${selector}`);
  }
  return el;
}

/**
 * Selektor multi-elemen
 * @param {string} selector
 * @returns {NodeListOf<HTMLElement>}
 */
function $all(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Format angka ke format mata uang Rupiah
 * @param {number} value
 * @returns {string}
 */
function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/**
 * Format tanggal YYYY-MM-DD ke format lokal Indonesia (contoh: 30 September 2026)
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Tampilkan notifikasi toast sementara
 * @param {string} message
 * @param {'success'|'info'|'warning'|'danger'} type
 */
function showToast(message, type = "success") {
  const container = $("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgStyles = {
    success: "bg-emerald-600 text-white shadow-emerald-500/20",
    danger: "bg-rose-600 text-white shadow-rose-500/20",
    warning: "bg-amber-600 text-white shadow-amber-500/20",
    info: "bg-sky-600 text-white shadow-sky-500/20",
  };

  const icons = {
    success: "ti-check",
    danger: "ti-alert-circle",
    warning: "ti-alert-triangle",
    info: "ti-info-circle",
  };

  toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto ${bgStyles[type] || bgStyles.info}`;
  toast.innerHTML = `
    <i class="ti ${icons[type] || icons.info} text-base"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Animasi masuk
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  // Hapus otomatis setelah 3 detik
  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}


/* ==============================================================================
 * 2. MODAL CONTROLLER SISTEM UMUM
 * ============================================================================== */

/**
 * Tampilkan modal dengan efek backdrop dan cegah body scroll
 * @param {HTMLElement} modalEl
 */
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("hidden");
  modalEl.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

/**
 * Sembunyikan modal dan kembalikan scroll
 * @param {HTMLElement} modalEl
 */
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");

  // Jika tidak ada modal lain yang terbuka, buka scroll kembali
  const anyOpen = document.querySelector(".custom-modal:not(.hidden)");
  if (!anyOpen) {
    document.body.classList.remove("overflow-hidden");
  }
}

// Inisialisasi event listener penutup modal (backdrop, data-close, dan tombol Esc)
function initModalSystem() {
  // Tombol dengan atribut data-close-modal="selector"
  $all("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-close-modal");
      const targetModal = $(targetSelector);
      if (targetModal) closeModal(targetModal);
    });
  });

  // Klik backdrop luar modal
  $all(".custom-modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal-backdrop")) {
        closeModal(modal);
      }
    });
  });

  // Tombol keyboard Escape menutup semua modal yang aktif
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModals = $all(".custom-modal:not(.hidden)");
      openModals.forEach((m) => closeModal(m));
    }
  });
}


/* ==============================================================================
 * 3. TAB NAVIGATION (MENGINGAT TAB TERAKHIR DI LOCALSTORAGE)
 * ============================================================================== */

const TAB_STORAGE_KEY = "pabwe-p3-active-tab";
const tabButtons = $all(".tab-btn");
const panels = {
  expense: $("#panel-expense"),
  bookmark: $("#panel-bookmark"),
  quiz: $("#panel-quiz"),
};

/**
 * Berpindah tab aktif, mengupdate style UI dan menyimpan ke localStorage
 * @param {string} tabName ('expense' | 'bookmark' | 'quiz')
 */
function switchTab(tabName) {
  if (!panels[tabName]) {
    tabName = "expense";
  }

  // Tampilkan hanya panel yang sesuai
  Object.entries(panels).forEach(([key, panel]) => {
    if (panel) {
      panel.classList.toggle("hidden", key !== tabName);
    }
  });

  // Update styling tombol tab
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.setAttribute("aria-selected", String(isActive));

    if (isActive) {
      btn.classList.add("bg-indigo-600", "text-white", "shadow-sm", "shadow-indigo-500/20");
      btn.classList.remove("text-slate-600", "hover:text-slate-900", "hover:bg-slate-100");
    } else {
      btn.classList.remove("bg-indigo-600", "text-white", "shadow-sm", "shadow-indigo-500/20");
      btn.classList.add("text-slate-600", "hover:text-slate-900", "hover:bg-slate-100");
    }
  });

  // Simpan state tab ke localStorage
  localStorage.setItem(TAB_STORAGE_KEY, tabName);
}

// Pasang event listener pada setiap tombol tab
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});


/* ==============================================================================
 * 4. FITUR 1: CATATAN PENGELUARAN HARIAN (EXPENSE TRACKER)
 * ============================================================================== */

const EXPENSE_STORAGE_KEY = "pabwe-p3-expenses";

// Data awal contoh jika pengguna belum pernah mengisi data
const DEFAULT_EXPENSES = [
  {
    id: "exp-init-1",
    title: "Makan Siang Nasi Padang",
    category: "Makanan",
    amount: 25000,
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: "exp-init-2",
    title: "Transfer Uang Saku Bulanan",
    category: "Pemasukan",
    amount: 500000,
    type: "income",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: "exp-init-3",
    title: "Buku Teks Pemrograman Web",
    category: "Pendidikan",
    amount: 75000,
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    createdAt: Date.now() - 3600000 * 2,
  },
];

let expenses = loadExpenses();
let editingExpenseId = null;
let deletingExpenseId = null;

// Referensi Elemen Expense Form & Filter
const expenseForm = $("#expense-form");
const expenseTitle = $("#expense-title");
const expenseAmount = $("#expense-amount");
const expenseType = $("#expense-type");
const expenseCategory = $("#expense-category");
const expenseDate = $("#expense-date");

const expenseSearch = $("#expense-search");
const expenseFilterType = $("#expense-filter-type");
const expenseFilterCategory = $("#expense-filter-category");
const expenseSort = $("#expense-sort");

const expenseList = $("#expense-list");
const expenseEmpty = $("#expense-empty");

// Ringkasan Finansial
const summaryTotalIncome = $("#summary-total-income");
const summaryTotalExpense = $("#summary-total-expense");
const summaryBalance = $("#summary-balance");

// Modal Ubah Expense
const modalExpenseEdit = $("#modal-expense-edit");
const expenseEditForm = $("#expense-edit-form");
const expenseEditTitle = $("#expense-edit-title");
const expenseEditAmount = $("#expense-edit-amount");
const expenseEditType = $("#expense-edit-type");
const expenseEditCategory = $("#expense-edit-category");
const expenseEditDate = $("#expense-edit-date");

// Modal Hapus Expense
const modalExpenseDelete = $("#modal-expense-delete");
const expenseDeleteTitle = $("#expense-delete-title");
const expenseDeleteConfirm = $("#expense-delete-confirm");

/**
 * Muat data expense dari localStorage
 * @returns {Array}
 */
function loadExpenses() {
  try {
    const raw = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (!raw) {
      // Inisialisasi data contoh default pada pemakaian pertama
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(DEFAULT_EXPENSES));
      return [...DEFAULT_EXPENSES];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca data expense dari localStorage", err);
    return [];
  }
}

/**
 * Simpan data expense ke localStorage
 */
function saveExpenses() {
  localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
}

/**
 * Hitung dan tampilkan total pemasukan, pengeluaran, serta saldo akhir
 */
function updateExpenseSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  expenses.forEach((item) => {
    const amt = Number(item.amount) || 0;
    if (item.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }
  });

  const balance = totalIncome - totalExpense;

  if (summaryTotalIncome) summaryTotalIncome.textContent = formatRupiah(totalIncome);
  if (summaryTotalExpense) summaryTotalExpense.textContent = formatRupiah(totalExpense);
  if (summaryBalance) {
    summaryBalance.textContent = formatRupiah(balance);
    summaryBalance.classList.toggle("text-emerald-600", balance >= 0);
    summaryBalance.classList.toggle("text-rose-600", balance < 0);
  }
}

/**
 * Ambil style badge & ikon kategori transaksi
 * @param {string} category
 * @param {string} type
 */
function getExpenseCategoryMeta(category, type) {
  const isIncome = type === "income";
  if (isIncome) {
    return {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "ti-arrow-down-left text-emerald-600",
      bgIcon: "bg-emerald-100",
    };
  }

  const metaMap = {
    Makanan: {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      iconClass: "ti-soup text-amber-600",
      bgIcon: "bg-amber-100",
    },
    Transportasi: {
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
      iconClass: "ti-car text-sky-600",
      bgIcon: "bg-sky-100",
    },
    Pendidikan: {
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconClass: "ti-book text-indigo-600",
      bgIcon: "bg-indigo-100",
    },
    Belanja: {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      iconClass: "ti-shopping-bag text-purple-600",
      bgIcon: "bg-purple-100",
    },
    Hiburan: {
      badgeClass: "bg-pink-50 text-pink-700 border-pink-200",
      iconClass: "ti-device-gamepad-2 text-pink-600",
      bgIcon: "bg-pink-100",
    },
    Tagihan: {
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      iconClass: "ti-receipt text-orange-600",
      bgIcon: "bg-orange-100",
    },
    Lainnya: {
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      iconClass: "ti-coin text-slate-600",
      bgIcon: "bg-slate-100",
    },
  };

  return metaMap[category] || {
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconClass: "ti-arrow-up-right text-rose-600",
    bgIcon: "bg-rose-100",
  };
}

/**
 * Filter, urutkan, dan render daftar transaksi ke DOM
 */
function renderExpenses() {
  updateExpenseSummary();

  const query = (expenseSearch?.value || "").trim().toLowerCase();
  const filterType = expenseFilterType?.value || "all";
  const filterCategory = expenseFilterCategory?.value || "all";
  const sort = expenseSort?.value || "date-desc";

  // Filter
  let filtered = expenses.filter((item) => {
    const matchQuery =
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    const matchType = filterType === "all" || item.type === filterType;
    const matchCategory = filterCategory === "all" || item.category === filterCategory;
    return matchQuery && matchType && matchCategory;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (sort) {
      case "date-asc":
        return (a.date || "").localeCompare(b.date || "") || a.createdAt - b.createdAt;
      case "amount-desc":
        return Number(b.amount) - Number(a.amount);
      case "amount-asc":
        return Number(a.amount) - Number(b.amount);
      case "title-asc":
        return a.title.localeCompare(b.title, "id");
      case "date-desc":
      default:
        return (b.date || "").localeCompare(a.date || "") || b.createdAt - a.createdAt;
    }
  });

  // Tampilkan / sembunyikan empty state
  const hasNoDataAtAll = expenses.length === 0;
  if (expenseEmpty) {
    expenseEmpty.classList.toggle("hidden", !hasNoDataAtAll);
  }
  if (expenseList) {
    expenseList.classList.toggle("hidden", hasNoDataAtAll);
    expenseList.innerHTML = "";
  }

  if (hasNoDataAtAll) return;

  // Jika data ada tapi hasil filter kosong
  if (filtered.length === 0) {
    const emptyFilterLi = document.createElement("li");
    emptyFilterLi.className =
      "rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500 text-sm";
    emptyFilterLi.innerHTML = `
      <i class="ti ti-search text-3xl text-slate-400 block mb-2"></i>
      Tidak ada transaksi yang sesuai dengan filter atau kata kunci pencarian.
    `;
    expenseList.appendChild(emptyFilterLi);
    return;
  }

  // Render item per transaksi
  filtered.forEach((item) => {
    const isIncome = item.type === "income";
    const meta = getExpenseCategoryMeta(item.category, item.type);

    const li = document.createElement("li");
    li.className =
      "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-200";

    li.innerHTML = `
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-xl ${meta.bgIcon} flex items-center justify-center shrink-0">
          <i class="ti ${meta.iconClass} text-xl"></i>
        </div>
        <div class="min-w-0">
          <h4 class="font-semibold text-slate-900 truncate text-base leading-snug">${escapeHtml(item.title)}</h4>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${meta.badgeClass}">
              ${item.category}
            </span>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <i class="ti ti-calendar text-xs"></i>
              ${formatDate(item.date)}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <div class="text-left sm:text-right">
          <span class="block font-bold text-base sm:text-lg ${isIncome ? "text-emerald-600" : "text-slate-900"}">
            ${isIncome ? "+" : "-"}${formatRupiah(item.amount)}
          </span>
          <span class="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            ${isIncome ? "Pemasukan" : "Pengeluaran"}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="btn-edit-expense p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors"
            title="Ubah Transaksi"
            aria-label="Ubah Transaksi"
            data-id="${item.id}"
          >
            <i class="ti ti-pencil text-base"></i>
          </button>
          <button
            type="button"
            class="btn-delete-expense p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
            title="Hapus Transaksi"
            aria-label="Hapus Transaksi"
            data-id="${item.id}"
          >
            <i class="ti ti-trash text-base"></i>
          </button>
        </div>
      </div>
    `;

    // Pasang handler tombol ubah & hapus
    li.querySelector(".btn-edit-expense").addEventListener("click", () => openExpenseEditModal(item.id));
    li.querySelector(".btn-delete-expense").addEventListener("click", () => openExpenseDeleteModal(item.id));

    expenseList.appendChild(li);
  });
}

/**
 * Helper untuk sanitasi teks mencegah XSS pada rendering innerHTML
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Buka modal Ubah Transaksi
function openExpenseEditModal(id) {
  const item = expenses.find((x) => x.id === id);
  if (!item) return;

  editingExpenseId = id;
  if (expenseEditTitle) expenseEditTitle.value = item.title;
  if (expenseEditAmount) expenseEditAmount.value = item.amount;
  if (expenseEditType) expenseEditType.value = item.type;
  if (expenseEditCategory) expenseEditCategory.value = item.category;
  if (expenseEditDate) expenseEditDate.value = item.date;

  openModal(modalExpenseEdit);
  if (expenseEditTitle) expenseEditTitle.focus();
}

// Buka modal Hapus Transaksi
function openExpenseDeleteModal(id) {
  const item = expenses.find((x) => x.id === id);
  if (!item) return;

  deletingExpenseId = id;
  if (expenseDeleteTitle) {
    expenseDeleteTitle.textContent = `"${item.title}" (${formatRupiah(item.amount)})`;
  }
  openModal(modalExpenseDelete);
}

// Simpan transaksi baru dari form utama
if (expenseForm) {
  // Set default tanggal input ke hari ini
  if (expenseDate && !expenseDate.value) {
    expenseDate.value = new Date().toISOString().split("T")[0];
  }

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = expenseTitle.value.trim();
    const amount = Number(expenseAmount.value);
    const type = expenseType.value;
    const category = expenseCategory.value;
    const date = expenseDate.value || new Date().toISOString().split("T")[0];

    // Validasi form
    if (!title) {
      showToast("Judul transaksi wajib diisi!", "warning");
      expenseTitle.focus();
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      showToast("Jumlah transaksi harus angka lebih besar dari 0!", "warning");
      expenseAmount.focus();
      return;
    }

    const newExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title,
      category,
      amount,
      type,
      date,
      createdAt: Date.now(),
    };

    expenses.unshift(newExpense);
    saveExpenses();
    renderExpenses();

    // Reset form
    expenseForm.reset();
    expenseType.value = "expense";
    expenseCategory.value = "Makanan";
    expenseDate.value = new Date().toISOString().split("T")[0];

    showToast("Transaksi berhasil ditambahkan!", "success");
  });
}

// Submit perubahan dari modal edit transaksi
if (expenseEditForm) {
  expenseEditForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!editingExpenseId) return;

    const title = expenseEditTitle.value.trim();
    const amount = Number(expenseEditAmount.value);
    const type = expenseEditType.value;
    const category = expenseEditCategory.value;
    const date = expenseEditDate.value;

    if (!title) {
      showToast("Judul transaksi wajib diisi!", "warning");
      expenseEditTitle.focus();
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      showToast("Jumlah transaksi harus angka lebih besar dari 0!", "warning");
      expenseEditAmount.focus();
      return;
    }

    const item = expenses.find((x) => x.id === editingExpenseId);
    if (item) {
      item.title = title;
      item.amount = amount;
      item.type = type;
      item.category = category;
      item.date = date;

      saveExpenses();
      renderExpenses();
      showToast("Transaksi berhasil diperbarui!", "success");
    }

    closeModal(modalExpenseEdit);
    editingExpenseId = null;
  });
}

// Konfirmasi hapus transaksi dari modal
if (expenseDeleteConfirm) {
  expenseDeleteConfirm.addEventListener("click", () => {
    if (!deletingExpenseId) return;

    expenses = expenses.filter((x) => x.id !== deletingExpenseId);
    saveExpenses();
    renderExpenses();
    showToast("Transaksi berhasil dihapus!", "danger");

    closeModal(modalExpenseDelete);
    deletingExpenseId = null;
  });
}

// Event listener filter & pencarian transaksi
if (expenseSearch) expenseSearch.addEventListener("input", renderExpenses);
if (expenseFilterType) expenseFilterType.addEventListener("change", renderExpenses);
if (expenseFilterCategory) expenseFilterCategory.addEventListener("change", renderExpenses);
if (expenseSort) expenseSort.addEventListener("change", renderExpenses);


/* ==============================================================================
 * 5. FITUR 2: BOOKMARK / LINK MANAGER
 * ============================================================================== */

const BOOKMARK_STORAGE_KEY = "pabwe-p3-bookmarks";

// Data awal contoh bookmark
const DEFAULT_BOOKMARKS = [
  {
    id: "bm-init-1",
    title: "MDN Web Docs — JavaScript",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    category: "Dokumentasi",
    note: "Referensi lengkap standar ECMAScript dan API DOM Web.",
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: "bm-init-2",
    title: "Tailwind CSS Documentation",
    url: "https://tailwindcss.com/docs",
    category: "Belajar",
    note: "Dokumentasi utilitas Tailwind CSS untuk referensi class styling.",
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: "bm-init-3",
    title: "Tabler Icons Directory",
    url: "https://tabler.io/icons",
    category: "Tools",
    note: "Koleksi ribuan ikon SVG gratis dan modern siap pakai.",
    createdAt: Date.now() - 3600000 * 6,
  },
];

let bookmarks = loadBookmarks();
let editingBookmarkId = null;
let deletingBookmarkId = null;

// Referensi Elemen Form & Filter Bookmark
const bookmarkForm = $("#bookmark-form");
const bookmarkTitle = $("#bookmark-title");
const bookmarkUrl = $("#bookmark-url");
const bookmarkCategory = $("#bookmark-category");
const bookmarkNote = $("#bookmark-note");

const bookmarkSearch = $("#bookmark-search");
const bookmarkFilterCategory = $("#bookmark-filter-category");
const bookmarkSort = $("#bookmark-sort");

const bookmarkList = $("#bookmark-list");
const bookmarkEmpty = $("#bookmark-empty");

// Modal Ubah Bookmark
const modalBookmarkEdit = $("#modal-bookmark-edit");
const bookmarkEditForm = $("#bookmark-edit-form");
const bookmarkEditTitle = $("#bookmark-edit-title");
const bookmarkEditUrl = $("#bookmark-edit-url");
const bookmarkEditCategory = $("#bookmark-edit-category");
const bookmarkEditNote = $("#bookmark-edit-note");

// Modal Hapus Bookmark
const modalBookmarkDelete = $("#modal-bookmark-delete");
const bookmarkDeleteTitle = $("#bookmark-delete-title");
const bookmarkDeleteConfirm = $("#bookmark-delete-confirm");

/**
 * Muat bookmark dari localStorage
 * @returns {Array}
 */
function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKMARKS));
      return [...DEFAULT_BOOKMARKS];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca data bookmark dari localStorage", err);
    return [];
  }
}

/**
 * Simpan bookmark ke localStorage
 */
function saveBookmarks() {
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
}

/**
 * Validasi apakah URL valid (harus berawalan http:// atau https:// dan dapat di-parse oleh constructor URL)
 * @param {string} urlString
 * @returns {boolean}
 */
function isValidUrl(urlString) {
  if (!urlString) return false;
  const trimmed = urlString.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Styling kategori bookmark
 */
function getBookmarkCategoryClass(category) {
  const map = {
    Dokumentasi: "bg-blue-50 text-blue-700 border-blue-200",
    Belajar: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Tools: "bg-purple-50 text-purple-700 border-purple-200",
    Desain: "bg-pink-50 text-pink-700 border-pink-200",
    Hiburan: "bg-amber-50 text-amber-700 border-amber-200",
    Berita: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Lainnya: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return map[category] || "bg-indigo-50 text-indigo-700 border-indigo-200";
}

/**
 * Render daftar bookmark ke DOM
 */
function renderBookmarks() {
  const query = (bookmarkSearch?.value || "").trim().toLowerCase();
  const filterCat = bookmarkFilterCategory?.value || "all";
  const sort = bookmarkSort?.value || "newest";

  // Filter
  let filtered = bookmarks.filter((bm) => {
    const matchQuery =
      bm.title.toLowerCase().includes(query) ||
      bm.url.toLowerCase().includes(query) ||
      (bm.note && bm.note.toLowerCase().includes(query)) ||
      bm.category.toLowerCase().includes(query);
    const matchCat = filterCat === "all" || bm.category === filterCat;
    return matchQuery && matchCat;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (sort) {
      case "title-asc":
        return a.title.localeCompare(b.title, "id");
      case "title-desc":
        return b.title.localeCompare(a.title, "id");
      case "category-asc":
        return a.category.localeCompare(b.category, "id");
      case "newest":
      default:
        return b.createdAt - a.createdAt;
    }
  });

  // Tampilkan empty state
  const hasNoDataAtAll = bookmarks.length === 0;
  if (bookmarkEmpty) bookmarkEmpty.classList.toggle("hidden", !hasNoDataAtAll);
  if (bookmarkList) {
    bookmarkList.classList.toggle("hidden", hasNoDataAtAll);
    bookmarkList.innerHTML = "";
  }

  if (hasNoDataAtAll) return;

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className =
      "col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500 text-sm";
    li.innerHTML = `
      <i class="ti ti-search text-3xl text-slate-400 block mb-2"></i>
      Tidak ada bookmark yang cocok dengan kriteria pencarian.
    `;
    bookmarkList.appendChild(li);
    return;
  }

  // Render cards
  filtered.forEach((bm) => {
    const catClass = getBookmarkCategoryClass(bm.category);
    let domain = "";
    try {
      domain = new URL(bm.url).hostname.replace(/^www\./, "");
    } catch {
      domain = bm.url;
    }

    const card = document.createElement("li");
    card.className =
      "group flex flex-col justify-between p-5 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200";

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <span class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${catClass}">
            <i class="ti ti-tag text-[11px]"></i>
            ${bm.category}
          </span>
          <span class="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <i class="ti ti-world text-xs"></i>
            ${domain}
          </span>
        </div>

        <h4 class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1 mb-1">
          <a href="${escapeHtml(bm.url)}" target="_blank" rel="noopener noreferrer" class="hover:underline flex items-center gap-1.5">
            <span class="truncate">${escapeHtml(bm.title)}</span>
            <i class="ti ti-external-link text-xs shrink-0 opacity-70"></i>
          </a>
        </h4>

        <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          ${bm.note ? escapeHtml(bm.note) : '<span class="italic text-slate-400">Tidak ada catatan tambahan.</span>'}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <a
          href="${escapeHtml(bm.url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <i class="ti ti-arrow-up-right"></i>
          Kunjungi Link
        </a>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="btn-copy-bookmark p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Salin URL"
            aria-label="Salin URL"
            data-url="${escapeHtml(bm.url)}"
          >
            <i class="ti ti-copy text-base"></i>
          </button>
          <button
            type="button"
            class="btn-edit-bookmark p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Ubah Bookmark"
            aria-label="Ubah Bookmark"
            data-id="${bm.id}"
          >
            <i class="ti ti-pencil text-base"></i>
          </button>
          <button
            type="button"
            class="btn-delete-bookmark p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus Bookmark"
            aria-label="Hapus Bookmark"
            data-id="${bm.id}"
          >
            <i class="ti ti-trash text-base"></i>
          </button>
        </div>
      </div>
    `;

    // Pasang tombol aksi
    card.querySelector(".btn-copy-bookmark").addEventListener("click", () => {
      navigator.clipboard.writeText(bm.url).then(() => {
        showToast("Tautan berhasil disalin ke clipboard!", "info");
      }).catch(() => {
        showToast("Gagal menyalin tautan!", "danger");
      });
    });

    card.querySelector(".btn-edit-bookmark").addEventListener("click", () => openBookmarkEditModal(bm.id));
    card.querySelector(".btn-delete-bookmark").addEventListener("click", () => openBookmarkDeleteModal(bm.id));

    bookmarkList.appendChild(card);
  });
}

// Buka modal Ubah Bookmark
function openBookmarkEditModal(id) {
  const item = bookmarks.find((x) => x.id === id);
  if (!item) return;

  editingBookmarkId = id;
  if (bookmarkEditTitle) bookmarkEditTitle.value = item.title;
  if (bookmarkEditUrl) bookmarkEditUrl.value = item.url;
  if (bookmarkEditCategory) bookmarkEditCategory.value = item.category;
  if (bookmarkEditNote) bookmarkEditNote.value = item.note || "";

  openModal(modalBookmarkEdit);
  if (bookmarkEditTitle) bookmarkEditTitle.focus();
}

// Buka modal Hapus Bookmark
function openBookmarkDeleteModal(id) {
  const item = bookmarks.find((x) => x.id === id);
  if (!item) return;

  deletingBookmarkId = id;
  if (bookmarkDeleteTitle) {
    bookmarkDeleteTitle.textContent = `"${item.title}"`;
  }
  openModal(modalBookmarkDelete);
}

// Submit bookmark baru
if (bookmarkForm) {
  bookmarkForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = bookmarkTitle.value.trim();
    const url = bookmarkUrl.value.trim();
    const category = bookmarkCategory.value;
    const note = bookmarkNote.value.trim();

    if (!title) {
      showToast("Judul bookmark wajib diisi!", "warning");
      bookmarkTitle.focus();
      return;
    }

    if (!isValidUrl(url)) {
      showToast("URL tidak valid! Wajib diawali http:// atau https://", "warning");
      bookmarkUrl.focus();
      return;
    }

    const newBm = {
      id: crypto.randomUUID ? crypto.randomUUID() : `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title,
      url,
      category,
      note,
      createdAt: Date.now(),
    };

    bookmarks.unshift(newBm);
    saveBookmarks();
    renderBookmarks();

    bookmarkForm.reset();
    bookmarkCategory.value = "Dokumentasi";
    showToast("Bookmark berhasil disimpan!", "success");
  });
}

// Submit perubahan dari modal edit bookmark
if (bookmarkEditForm) {
  bookmarkEditForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!editingBookmarkId) return;

    const title = bookmarkEditTitle.value.trim();
    const url = bookmarkEditUrl.value.trim();
    const category = bookmarkEditCategory.value;
    const note = bookmarkEditNote.value.trim();

    if (!title) {
      showToast("Judul bookmark wajib diisi!", "warning");
      bookmarkEditTitle.focus();
      return;
    }

    if (!isValidUrl(url)) {
      showToast("URL tidak valid! Wajib diawali http:// atau https://", "warning");
      bookmarkEditUrl.focus();
      return;
    }

    const item = bookmarks.find((x) => x.id === editingBookmarkId);
    if (item) {
      item.title = title;
      item.url = url;
      item.category = category;
      item.note = note;

      saveBookmarks();
      renderBookmarks();
      showToast("Bookmark berhasil diperbarui!", "success");
    }

    closeModal(modalBookmarkEdit);
    editingBookmarkId = null;
  });
}

// Konfirmasi hapus bookmark dari modal
if (bookmarkDeleteConfirm) {
  bookmarkDeleteConfirm.addEventListener("click", () => {
    if (!deletingBookmarkId) return;

    bookmarks = bookmarks.filter((x) => x.id !== deletingBookmarkId);
    saveBookmarks();
    renderBookmarks();
    showToast("Bookmark berhasil dihapus!", "danger");

    closeModal(modalBookmarkDelete);
    deletingBookmarkId = null;
  });
}

// Event listener pencarian & filter bookmark
if (bookmarkSearch) bookmarkSearch.addEventListener("input", renderBookmarks);
if (bookmarkFilterCategory) bookmarkFilterCategory.addEventListener("change", renderBookmarks);
if (bookmarkSort) bookmarkSort.addEventListener("change", renderBookmarks);


/* ==============================================================================
 * 6. FITUR 3: KUIS INTERAKTIF (QUIZ APP)
 * ============================================================================== */

const QUIZ_STORAGE_KEY = "pabwe-p3-quiz-high-score";

/**
 * Bank Data Soal Kuis Berbasis JavaScript (Array of Objects)
 * Menguji materi pemrograman web modern, DOM, event, dan arsitektur aplikasi
 */
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Manakah metode DOM berikut yang digunakan untuk memilih elemen HTML pertama yang cocok dengan CSS selector tertentu?",
    options: [
      "document.getElementById()",
      "document.querySelector()",
      "document.querySelectorAll()",
      "document.getElementsByClassName()",
    ],
    answer: 1,
    explanation: "querySelector() mengembalikan elemen pertama yang cocok dengan selector CSS yang diberikan.",
  },
  {
    id: 2,
    question: "Karakteristik utama dari penyimpanan browser `localStorage` adalah...",
    options: [
      "Data otomatis terhapus saat tab browser ditutup",
      "Hanya dapat menyimpan objek biner langsung tanpa serialisasi",
      "Data tetap tersimpan tanpa batas waktu sampai dihapus secara eksplisit oleh skrip atau pengguna",
      "Data dikirimkan secara otomatis pada setiap request HTTP header ke server",
    ],
    answer: 2,
    explanation: "localStorage menyimpan data dalam bentuk string key-value secara persisten tanpa batas kedaluwarsa.",
  },
  {
    id: 3,
    question: "Bagaimana cara mengubah objek JavaScript menjadi format string agar dapat disimpan ke dalam `localStorage`?",
    options: [
      "JSON.parse(object)",
      "JSON.stringify(object)",
      "object.toStringRepresentation()",
      "localStorage.setObject(object)",
    ],
    answer: 1,
    explanation: "JSON.stringify() mengonversi objek atau nilai JavaScript menjadi string notasi JSON.",
  },
  {
    id: 4,
    question: "Dalam penanganan event form submit di JavaScript, fungsi apakah yang harus dipanggil agar halaman tidak melakukan refresh default?",
    options: [
      "event.stopPropagation()",
      "event.preventDefault()",
      "event.stopImmediatePropagation()",
      "event.cancelBubble()",
    ],
    answer: 1,
    explanation: "event.preventDefault() mencegah aksi bawaan browser, seperti me-reload halaman saat form di-submit.",
  },
  {
    id: 5,
    question: "Manakah method array JavaScript berikut yang membuat array baru dengan menyaring elemen yang memenuhi kondisi fungsi pengujian?",
    options: [
      "Array.prototype.map()",
      "Array.prototype.forEach()",
      "Array.prototype.filter()",
      "Array.prototype.reduce()",
    ],
    answer: 2,
    explanation: "filter() membuat shallow copy dari array yang hanya berisi elemen-elemen yang lolos evaluasi predikat pengujian.",
  },
  {
    id: 6,
    question: "Apa fungsi dari atribut `rel=\"noopener noreferrer\"` saat menggunakan link dengan `target=\"_blank\"`?",
    options: [
      "Mencegah serangan phishing / tabnabbing dengan memutus referensi window.opener",
      "Mempercepat proses rendering CSS halaman tujuan",
      "Mengompres ukuran gambar yang dimuat di tab baru",
      "Menyimpan cache halaman tujuan di browser secara otomatis",
    ],
    answer: 0,
    explanation: "rel='noopener noreferrer' melindungi aplikasi induk agar halaman eksternal tidak dapat mengakses objek window.opener demi keamanan.",
  },
  {
    id: 7,
    question: "Di JavaScript modern, method apa yang paling tepat digunakan untuk menghasilkan UUID acak yang aman secara kriptografi?",
    options: [
      "Math.random()",
      "crypto.randomUUID()",
      "Date.now().toUUID()",
      "window.generateId()",
    ],
    answer: 1,
    explanation: "crypto.randomUUID() merupakan standar web API modern untuk membuat UUID v4 secara aman dan unik.",
  },
  {
    id: 8,
    question: "Apa perbedaan mendasar antara `classList.toggle('active')` dengan `classList.add('active')`?",
    options: [
      "toggle hanya bekerja pada elemen link <a>",
      "toggle menambahkan kelas jika belum ada, atau menghapusnya jika kelas tersebut sudah ada",
      "add secara otomatis menghapus kelas lain yang serupa",
      "toggle memerlukan konfirmasi izin dari pengguna",
    ],
    answer: 1,
    explanation: "classList.toggle() berfungsi sebagai saklar: menghapus class jika sudah ada, atau menambahkannya jika belum ada.",
  },
];

// State Kuis
let currentQuestionIndex = 0;
let userAnswers = []; // Menyimpan indeks jawaban yang dipilih pengguna
let quizScore = 0;
let quizTimer = null;
let timerSeconds = 25; // 25 detik per pertanyaan

// Referensi DOM Kuis
const quizCardStart = $("#quiz-card-start");
const quizCardActive = $("#quiz-card-active");
const quizCardResult = $("#quiz-card-result");

const quizBtnStart = $("#quiz-btn-start");
const quizBtnNext = $("#quiz-btn-next");
const quizBtnRestart = $("#quiz-btn-restart");

const quizHighScoreDisplay = $("#quiz-high-score-display");
const quizResultHighScore = $("#quiz-result-high-score");
const quizProgressText = $("#quiz-progress-text");
const quizProgressBar = $("#quiz-progress-bar");
const quizQuestionText = $("#quiz-question-text");
const quizOptionsContainer = $("#quiz-options-container");
const quizFeedbackContainer = $("#quiz-feedback-container");
const quizTimerDisplay = $("#quiz-timer-display");

const quizFinalScore = $("#quiz-final-score");
const quizFinalPercent = $("#quiz-final-percent");
const quizFinalBadge = $("#quiz-final-badge");
const quizReviewList = $("#quiz-review-list");

/**
 * Muat skor tertinggi kuis dari localStorage
 * @returns {number}
 */
function getQuizHighScore() {
  const v = localStorage.getItem(QUIZ_STORAGE_KEY);
  return v !== null ? Number(v) : null;
}

/**
 * Simpan skor kuis ke localStorage jika lebih tinggi dari rekor sebelumnya
 * @param {number} score
 */
function updateQuizHighScore(score) {
  const currentBest = getQuizHighScore();
  if (currentBest === null || score > currentBest) {
    localStorage.setItem(QUIZ_STORAGE_KEY, String(score));
    return true; // Rekor baru tercipta
  }
  return false;
}

/**
 * Tampilkan skor tertinggi di UI
 */
function renderQuizHighScoreBadge() {
  const top = getQuizHighScore();
  const text = top !== null ? `${top} / ${QUIZ_QUESTIONS.length * 10} Poin` : "Belum ada rekor";
  if (quizHighScoreDisplay) quizHighScoreDisplay.textContent = text;
  if (quizResultHighScore) quizResultHighScore.textContent = text;
}

/**
 * Mulai Kuis dari awal
 */
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = new Array(QUIZ_QUESTIONS.length).fill(null);
  quizScore = 0;

  if (quizCardStart) quizCardStart.classList.add("hidden");
  if (quizCardResult) quizCardResult.classList.add("hidden");
  if (quizCardActive) quizCardActive.classList.remove("hidden");

  renderCurrentQuestion();
}

/**
 * Hentikan timer soal
 */
function stopQuizTimer() {
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
}

/**
 * Mulai hitung mundur waktu per soal
 */
function startQuizTimer() {
  stopQuizTimer();
  timerSeconds = 25;
  updateTimerUI();

  quizTimer = setInterval(() => {
    timerSeconds -= 1;
    updateTimerUI();

    if (timerSeconds <= 0) {
      stopQuizTimer();
      // Waktu habis, otomatis beri feedback jawaban kosong
      handleOptionSelect(-1);
    }
  }, 1000);
}

function updateTimerUI() {
  if (!quizTimerDisplay) return;
  quizTimerDisplay.textContent = `${timerSeconds}s`;
  if (timerSeconds <= 5) {
    quizTimerDisplay.className =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse";
  } else {
    quizTimerDisplay.className =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700";
  }
}

/**
 * Render pertanyaan dan opsi jawaban yang aktif saat ini
 */
function renderCurrentQuestion() {
  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  if (!q) return;

  // Update indikator nomor soal dan progress bar
  const total = QUIZ_QUESTIONS.length;
  const currentNum = currentQuestionIndex + 1;
  const percent = Math.round((currentNum / total) * 100);

  if (quizProgressText) {
    quizProgressText.textContent = `Pertanyaan ${currentNum} dari ${total}`;
  }
  if (quizProgressBar) {
    quizProgressBar.style.width = `${percent}%`;
  }

  // Teks pertanyaan
  if (quizQuestionText) {
    quizQuestionText.textContent = q.question;
  }

  // Sembunyikan feedback & tombol lanjut
  if (quizFeedbackContainer) quizFeedbackContainer.classList.add("hidden");
  if (quizBtnNext) {
    quizBtnNext.classList.add("hidden");
    quizBtnNext.textContent = currentNum === total ? "Lihat Hasil Akhir" : "Soal Berikutnya";
  }

  // Render opsi jawaban
  if (quizOptionsContainer) {
    quizOptionsContainer.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "quiz-opt-btn w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all duration-150 group";
      btn.dataset.index = idx;

      btn.innerHTML = `
        <span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white font-bold text-sm flex items-center justify-center shrink-0 transition-colors">
          ${letters[idx]}
        </span>
        <span class="font-medium text-slate-800 text-sm sm:text-base leading-snug flex-1">
          ${escapeHtml(optText)}
        </span>
        <i class="opt-status-icon text-xl opacity-0 shrink-0"></i>
      `;

      btn.addEventListener("click", () => handleOptionSelect(idx));
      quizOptionsContainer.appendChild(btn);
    });
  }

  // Mulai timer hitung mundur
  startQuizTimer();
}

/**
 * Handle ketika pengguna memilih opsi jawaban
 * @param {number} selectedIndex (-1 jika waktu habis)
 */
function handleOptionSelect(selectedIndex) {
  stopQuizTimer();

  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = selectedIndex;

  const isCorrect = selectedIndex === q.answer;
  if (isCorrect) {
    quizScore += 10;
  }

  // Disable semua opsi dan tandai benar/salah
  const buttons = quizOptionsContainer.querySelectorAll(".quiz-opt-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    const idx = Number(btn.dataset.index);
    const icon = btn.querySelector(".opt-status-icon");

    if (idx === q.answer) {
      // Opsi yang benar selalu hijau
      btn.classList.remove("border-slate-200", "bg-white", "hover:border-indigo-400", "hover:bg-indigo-50/40");
      btn.classList.add("border-emerald-500", "bg-emerald-50/80", "text-emerald-950");
      if (icon) {
        icon.className = "opt-status-icon ti ti-circle-check-filled text-emerald-600 text-xl opacity-100";
      }
    } else if (idx === selectedIndex && !isCorrect) {
      // Opsi yang dipilih salah jadi merah
      btn.classList.remove("border-slate-200", "bg-white", "hover:border-indigo-400", "hover:bg-indigo-50/40");
      btn.classList.add("border-rose-500", "bg-rose-50/80", "text-rose-950");
      if (icon) {
        icon.className = "opt-status-icon ti ti-circle-x-filled text-rose-600 text-xl opacity-100";
      }
    } else {
      btn.classList.add("opacity-50");
    }
  });

  // Tampilkan kotak feedback penjelasan
  if (quizFeedbackContainer) {
    quizFeedbackContainer.classList.remove("hidden");
    const isTimeout = selectedIndex === -1;
    const title = isTimeout ? "Waktu Habis!" : isCorrect ? "Jawaban Benar! 🎉" : "Jawaban Kurang Tepat 💡";
    const alertBg = isCorrect
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : "bg-amber-50 border-amber-200 text-amber-900";

    quizFeedbackContainer.className = `p-4 rounded-2xl border text-sm flex items-start gap-3 mt-4 ${alertBg}`;
    quizFeedbackContainer.innerHTML = `
      <i class="ti ${isCorrect ? "ti-check" : "ti-info-circle"} text-xl shrink-0 mt-0.5"></i>
      <div>
        <p class="font-bold mb-1">${title}</p>
        <p class="text-xs sm:text-sm opacity-90 leading-relaxed">${escapeHtml(q.explanation)}</p>
      </div>
    `;
  }

  // Munculkan tombol lanjut
  if (quizBtnNext) {
    quizBtnNext.classList.remove("hidden");
    quizBtnNext.focus();
  }
}

/**
 * Pindah ke pertanyaan berikutnya atau tampilkan hasil kuis
 */
function handleNextQuestion() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex < QUIZ_QUESTIONS.length) {
    renderCurrentQuestion();
  } else {
    showQuizResults();
  }
}

/**
 * Selesai kuis: tampilkan kartu ringkasan skor dan review jawaban
 */
function showQuizResults() {
  stopQuizTimer();

  if (quizCardActive) quizCardActive.classList.add("hidden");
  if (quizCardResult) quizCardResult.classList.remove("hidden");

  const totalPossible = QUIZ_QUESTIONS.length * 10;
  const percentage = Math.round((quizScore / totalPossible) * 100);
  const isNewRecord = updateQuizHighScore(quizScore);

  renderQuizHighScoreBadge();

  if (quizFinalScore) quizFinalScore.textContent = `${quizScore} / ${totalPossible}`;
  if (quizFinalPercent) quizFinalPercent.textContent = `${percentage}% Akurasi`;

  // Badge hasil evaluasi
  let badgeText = "Bagus!";
  let badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";

  if (percentage === 100) {
    badgeText = "🏆 Sempurna! Pemahaman Anda Luar Biasa";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (percentage >= 75) {
    badgeText = "🌟 Hebat! Hampir Sempurna";
    badgeColor = "bg-sky-100 text-sky-800 border-sky-200";
  } else if (percentage >= 50) {
    badgeText = "👍 Cukup Bagus, Terus Tingkatkan!";
    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
  } else {
    badgeText = "📚 Perlu Belajar Lagi, Semangat!";
    badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
  }

  if (isNewRecord) {
    badgeText += " — 🎉 REKOR SKOR BARU!";
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300 shadow-sm";
  }

  if (quizFinalBadge) {
    quizFinalBadge.textContent = badgeText;
    quizFinalBadge.className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${badgeColor}`;
  }

  // Tampilkan daftar review per pertanyaan
  if (quizReviewList) {
    quizReviewList.innerHTML = "";
    const letters = ["A", "B", "C", "D"];

    QUIZ_QUESTIONS.forEach((q, idx) => {
      const userChoice = userAnswers[idx];
      const isCorrect = userChoice === q.answer;
      const userText = userChoice !== null && userChoice >= 0 ? `${letters[userChoice]}. ${q.options[userChoice]}` : "Tidak dijawab / Waktu habis";
      const correctText = `${letters[q.answer]}. ${q.options[q.answer]}`;

      const reviewItem = document.createElement("div");
      reviewItem.className = `p-4 rounded-2xl border ${isCorrect ? "bg-emerald-50/40 border-emerald-200" : "bg-rose-50/40 border-rose-200"}`;

      reviewItem.innerHTML = `
        <div class="flex items-start gap-2.5 mb-2">
          <i class="ti ${isCorrect ? "ti-circle-check text-emerald-600" : "ti-circle-x text-rose-600"} text-lg shrink-0 mt-0.5"></i>
          <div>
            <h5 class="font-semibold text-slate-900 text-sm leading-snug">
              ${idx + 1}. ${escapeHtml(q.question)}
            </h5>
          </div>
        </div>
        <div class="ml-7 text-xs space-y-1">
          <p class="${isCorrect ? "text-emerald-700" : "text-rose-700"}">
            <span class="font-semibold">Jawaban Anda:</span> ${escapeHtml(userText)}
          </p>
          ${!isCorrect ? `<p class="text-emerald-800"><span class="font-semibold">Kunci Jawaban:</span> ${escapeHtml(correctText)}</p>` : ""}
          <p class="text-slate-500 pt-1 text-[11px] border-t border-slate-200/60 mt-1">
            <span class="font-semibold">Penjelasan:</span> ${escapeHtml(q.explanation)}
          </p>
        </div>
      `;

      quizReviewList.appendChild(reviewItem);
    });
  }
}

// Pasang event listener Kuis
if (quizBtnStart) quizBtnStart.addEventListener("click", startQuiz);
if (quizBtnNext) quizBtnNext.addEventListener("click", handleNextQuestion);
if (quizBtnRestart) {
  quizBtnRestart.addEventListener("click", () => {
    if (quizCardResult) quizCardResult.classList.add("hidden");
    if (quizCardStart) quizCardStart.classList.remove("hidden");
    renderQuizHighScoreBadge();
  });
}


/* ==============================================================================
 * 7. INISIALISASI APLIKASI SAAT DOM SELESAI DIMUAT
 * ============================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi sistem modal
  initModalSystem();

  // Inisialisasi data & render
  renderExpenses();
  renderBookmarks();
  renderQuizHighScoreBadge();

  // Buka tab terakhir yang disimpan di localStorage (default: 'expense')
  const savedTab = localStorage.getItem(TAB_STORAGE_KEY) || "expense";
  switchTab(savedTab);
});
