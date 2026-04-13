// Initialize Lucide icons
lucide.createIcons();

// --- MOCK DATA ---
const mockData = [
    { id: 'SH PL 134121 2125', icon: 'globe',     name: '—', status: 'Отримано 10.04',           statusColor: 'status-gray',   created: '10.04.2026 | 15:58', delivery: '14.04.2026 | 09:35', value: '1.01 zł',  toPay: '0 zł', postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 894418 5061', icon: 'globe',     name: '—', status: 'Доставимо 09.04 до 12:00', statusColor: 'status-yellow', created: '07.04.2026 | 15:33', delivery: '09.04.2026 | 12:00', value: '20.25 L',  toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 668448 3558', icon: 'globe',     name: '—', status: 'Доставимо 09.04 до 12:00', statusColor: 'status-yellow', created: '07.04.2026 | 15:33', delivery: '09.04.2026 | 12:00', value: '20.25 L',  toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 573743 6578', icon: null,        name: '—', status: 'Ви відмовились від посилки',statusColor: 'status-red',    created: '27.03.2026 | 18:32', delivery: '31.03.2026 | 09:00', value: '1 000 L', toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 129268 8360', icon: null,        name: '—', status: 'Ви відмовились від посилки',statusColor: 'status-red',    created: '27.03.2026 | 18:32', delivery: '31.03.2026 | 09:00', value: '1 000 L', toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 130520 9030', icon: null,        name: '—', status: 'Ви відмовились від посилки',statusColor: 'status-red',    created: '27.03.2026 | 18:32', delivery: '31.03.2026 | 09:00', value: '1 000 L', toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 502471 6914', icon: null,        name: '—', status: 'Ви відмовились від посилки',statusColor: 'status-red',    created: '27.03.2026 | 18:29', delivery: '31.03.2026 | 09:00', value: '1 000 L', toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 951428 2701', icon: 'file-text', name: '—', status: 'Чекає у відділенні №22',   statusColor: 'status-green',  created: '27.03.2026 | 18:28', delivery: '28.03.2026 | 09:00', value: '1 000 L', toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH MD 981122 3456', icon: null,        name: '—', status: 'Отримано 26.03',           statusColor: 'status-gray',   created: '26.03.2026 | 10:15', delivery: '29.03.2026 | 10:00', value: '500 L',   toPay: '0 L',  postpay: '—', sentPostpay: '—' },
    { id: 'SH PL 112233 4455', icon: 'globe',     name: '—', status: 'Доставимо 28.03 до 12:00', statusColor: 'status-yellow', created: '25.03.2026 | 14:00', delivery: '28.03.2026 | 12:00', value: '55.50 zł',toPay: '0 zł', postpay: '—', sentPostpay: '—' }
];

// Expand to 40 rows for pagination demo
let allData = [];
mockData.forEach((item, i) => {
    allData.push(item);
    // add 3 variants per base row
    for (let v = 1; v <= 3; v++) {
        const suffix = String(Math.floor(Math.random() * 9000) + 1000);
        allData.push({ ...item, id: item.id.slice(0, -4) + suffix });
    }
});

// --- STATE ---
let currentPage  = 1;
let rowsPerPage  = 20;
let searchQuery  = '';
let multiMode    = false;   // true when user pasted multiple IDs
let multiIds     = [];      // list of pasted IDs (normalised)
let filteredData = [...allData];

// Sorting state
let sortCol = null;   // key of currently sorted column, or null
let sortDir = 'asc';  // 'asc' | 'desc'

// Column key → comparator value extractor
const SORT_KEYS = {
    id:          d => d.id,
    name:        d => d.name,
    status:      d => d.status,
    created:     d => d.created,
    delivery:    d => d.delivery,
    value:       d => parseFloat(d.value)  || d.value,
    toPay:       d => parseFloat(d.toPay)  || d.toPay,
    postpay:     d => parseFloat(d.postpay)|| d.postpay,
    sentPostpay: d => parseFloat(d.sentPostpay) || d.sentPostpay,
};

// --- DOM ---
const tableBody       = document.getElementById('tableBody');
const searchInput     = document.getElementById('searchInput');
const rowsSelect      = document.getElementById('rowsSelect');
const prevBtn         = document.querySelectorAll('.page-btn')[0];
const nextBtn         = document.querySelectorAll('.page-btn')[1];
const currentPageSpan = document.querySelector('.current-page');
const navSubitems     = document.querySelectorAll('.nav-subitem');
const actionButtons   = document.querySelectorAll('.action-btn');
const sidebar         = document.querySelector('.sidebar');
const collapseBtn     = document.querySelector('.collapse-btn');
const navGroup        = document.querySelector('.nav-group');
const navItemHeader   = document.querySelector('.nav-item-header');
const drawer          = document.getElementById('trackingDrawer');

// ─── Tracking events per status ──────────────────────────────
const trackingByStatus = {
    'status-gray': [
        { dot: 'active', title: 'Прибуде до відділення 256',     location: 'Київ',     date: '09.04.2026 | 12:00' },
        { dot: 'done',   title: 'Виїде з КІТ Київ',              location: 'Київ',     date: '09.04.2026 | 10:45' },
        { dot: 'done',   title: 'Прибуде до КІТ Київ',           location: 'Київ',     date: '09.04.2026 | 09:05' },
        { dot: 'done',   title: 'Виїде з митного терміналу Київ', location: 'Київ',    date: '09.04.2026 | 08:25' },
        { dot: 'done',   title: 'Прибуде до митного терміналу Київ', location: 'Київ', date: '09.04.2026 | 07:10' },
        { dot: 'done',   title: 'Виїде з митного терміналу Кишинів', location: 'Кишинів', date: '08.04.2026 | 18:00' },
        { dot: 'done',   title: 'Прибуде до митного терміналу Кишинів', location: 'Кишинів', date: '07.04.2026 | 18:50' },
        { dot: 'done',   title: 'Виїде з депо CHI-TERM',         location: 'Кишинів', date: '07.04.2026 | 17:50' },
        { dot: 'done',   title: 'Прибуде в депо CHI-TERM',       location: 'Кишинів', date: '07.04.2026 | 17:35' },
        { dot: 'done',   title: 'Виїде з відділення 16TL',       location: 'Кишинів', date: '07.04.2026 | 17:20' },
        { dot: 'done',   title: 'Прийняли у відділенні 16TL',    location: 'Кишинів', date: '07.04.2026 | 16:55' },
    ],
    'status-yellow': [
        { dot: 'active', title: 'Прибуде до відділення',         location: 'Варшава',  date: '09.04.2026 | 12:00' },
        { dot: 'done',   title: 'Виїде з сортувального центру',  location: 'Варшава',  date: '08.04.2026 | 20:00' },
        { dot: 'done',   title: 'Прибуде до сортувального центру', location: 'Варшава', date: '08.04.2026 | 14:30' },
        { dot: 'done',   title: 'Виїде з митного терміналу',     location: 'Краків',   date: '07.04.2026 | 22:00' },
        { dot: 'done',   title: 'Митне оформлення завершено',    location: 'Краків',   date: '07.04.2026 | 18:00' },
        { dot: 'done',   title: 'Прийняли у відділення',         location: 'Львів',    date: '07.04.2026 | 15:33' },
    ],
    'status-red': [
        { dot: 'active', title: 'Ви відмовились від посилки',    location: 'Одеса',    date: '31.03.2026 | 09:15' },
        { dot: 'done',   title: 'Прибуло до відділення',         location: 'Одеса',    date: '30.03.2026 | 14:00' },
        { dot: 'done',   title: 'Виїде з сортувального центру',  location: 'Київ',     date: '29.03.2026 | 06:00' },
        { dot: 'done',   title: 'Транзит через склад',           location: 'Київ',     date: '28.03.2026 | 18:00' },
        { dot: 'done',   title: 'Прийняли у відділення',         location: 'Харків',   date: '27.03.2026 | 18:32' },
    ],
    'status-green': [
        { dot: 'active', title: 'Чекає у відділенні №22',        location: 'Харків',   date: '28.03.2026 | 09:00' },
        { dot: 'done',   title: 'Доставлено до відділення',      location: 'Харків',   date: '28.03.2026 | 07:30' },
        { dot: 'done',   title: 'Виїде з сортувального центру',  location: 'Дніпро',   date: '27.03.2026 | 23:00' },
        { dot: 'done',   title: 'Прибуло до сортувального центру', location: 'Дніпро', date: '27.03.2026 | 20:00' },
        { dot: 'done',   title: 'Прийняли у відділення',         location: 'Запоріжжя', date: '27.03.2026 | 18:28' },
    ],
};

// normalise ID for comparison: remove spaces, lower-case
function norm(s) { return s.replace(/\s+/g, '').toLowerCase(); }

// ─── Search: smart multi-ID paste (up to 50) ────────────────
// Parcel IDs match patterns like: SH PL 123456 7890 / UA 123456789 etc.
// We extract them via regex so single spaces inside an ID don't confuse us.
const TRACK_PATTERN = /[A-Z]{2}\s?[A-Z0-9]{2,4}\s?\d{4,8}\s?\d{0,6}/gi;

searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('paste', () => setTimeout(handleSearch, 0));

function parseTrackingNumbers(raw) {
    // 1) Try regex extraction first — covers comma, newline or space-separated lists
    const matched = raw.match(TRACK_PATTERN);
    if (matched && matched.length > 0) {
        // Normalise internal whitespace so "SHPL1341212125" and "SH PL 134121 2125" both work
        return [...new Set(matched.map(s => s.trim()))].slice(0, 50);
    }
    // 2) Fallback: split by comma, semicolon, newline, or 2+ spaces
    return raw.split(/[,;\n\r]+|\s{2,}/).map(s => s.trim()).filter(Boolean).slice(0, 50);
}

function handleSearch() {
    const raw = searchInput.value.trim();
    if (!raw) {
        multiMode = false; multiIds = [];
        filteredData = [...allData];
        currentPage = 1;
        renderTable();
        return;
    }

    const parts = parseTrackingNumbers(raw);

    if (parts.length > 1) {
        multiMode = true;
        multiIds  = parts.map(norm);
        // Exact matches first, then partial
        const exact   = allData.filter(d => multiIds.includes(norm(d.id)));
        const partial  = allData.filter(d => {
            const n = norm(d.id);
            return !multiIds.includes(n) && multiIds.some(q => n.includes(q) || q.includes(n));
        });
        filteredData = [...exact, ...partial].slice(0, parts.length);
    } else {
        multiMode = false; multiIds = [];
        const q = norm(raw);
        filteredData = allData.filter(d => norm(d.id).includes(q));
    }

    currentPage = 1;
    renderTable();
}

// ─── Sort data ────────────────────────────────────────────────
function applySorting(data) {
    if (!sortCol || !SORT_KEYS[sortCol]) return data;
    const getter = SORT_KEYS[sortCol];
    return [...data].sort((a, b) => {
        const av = getter(a);
        const bv = getter(b);
        if (av === '—' && bv === '—') return 0;
        if (av === '—') return 1;
        if (bv === '—') return -1;
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ?  1 : -1;
        return 0;
    });
}

// Update sort indicators in <thead>
function updateSortHeaders() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
        const key = th.dataset.sort;
        th.classList.remove('sort-asc', 'sort-desc', 'sort-active');
        if (key === sortCol) {
            th.classList.add('sort-active', sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

// ─── Render table ─────────────────────────────────────────────
function renderTable() {
    tableBody.innerHTML = '';
    updateSortHeaders();

    const sorted = applySorting(filteredData);
    const start  = (currentPage - 1) * rowsPerPage;
    const page   = sorted.slice(start, start + rowsPerPage);

    if (page.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted)">Посилок не знайдено</td></tr>`;
        updatePaginationUI();
        return;
    }

    page.forEach(item => {
        const tr  = document.createElement('tr');
        const eid = item.id.replace(/'/g, "\\'");
        const isMatch = multiMode && multiIds.includes(norm(item.id));
        if (isMatch) tr.classList.add('multi-match');

        const customIcon = item.icon
            ? `<i data-lucide="${item.icon}" class="globe-icon" title="Тип"></i>`
            : '';

        tr.innerHTML = `
            <td class="sticky-col-left">
                <button class="parcel-id-btn" onclick="copyParcelId(this, '${eid}')">
                    <span>${item.id}</span>
                    <i data-lucide="copy" class="copy-icon-btn"></i>
                    <span class="copy-toast">✓ Скопійовано</span>
                </button>
                ${customIcon}
            </td>
            <td class="${item.name === '—' ? 'empty-cell' : ''}">${item.name}</td>
            <td>
                <span class="status status-link" onclick="openTrackingModal('${eid}','${item.statusColor}')">
                    <span class="status-square ${item.statusColor}"></span>
                    <span class="status-text">${item.status}</span>
                    <i data-lucide="external-link" class="external-icon"></i>
                </span>
            </td>
            <td>${item.created}</td>
            <td>${item.delivery}</td>
            <td>${item.value}</td>
            <td>${item.toPay}</td>
            <td class="${item.postpay === '—' ? 'empty-cell' : ''}">${item.postpay}</td>
            <td class="${item.sentPostpay === '—' ? 'empty-cell' : ''}">${item.sentPostpay}</td>
            <td class="sticky-col-right">
                <button class="btn-more" onclick="alert('Дії для ${eid}')">
                    <i data-lucide="more-horizontal"></i>
                </button>
            </td>`;
        tableBody.appendChild(tr);
    });

    lucide.createIcons();
    updatePaginationUI();
}

// ─── Pagination ───────────────────────────────────────────────
function updatePaginationUI() {
    const total = Math.ceil(filteredData.length / rowsPerPage);
    currentPageSpan.textContent = currentPage;
    prevBtn.style.opacity      = currentPage === 1 ? '0.4' : '1';
    prevBtn.style.pointerEvents = currentPage === 1 ? 'none' : 'auto';
    nextBtn.style.opacity      = currentPage >= total || total === 0 ? '0.4' : '1';
    nextBtn.style.pointerEvents = currentPage >= total || total === 0 ? 'none' : 'auto';
}

prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
nextBtn.addEventListener('click', () => {
    const total = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < total) { currentPage++; renderTable(); }
});
rowsSelect.addEventListener('change', e => { rowsPerPage = parseInt(e.target.value); currentPage = 1; renderTable(); });

// ─── Copy parcel ID ───────────────────────────────────────────
function copyParcelId(btn, id) {
    navigator.clipboard.writeText(id).then(() => {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1600);
    });
}

// ─── Tracking Drawer ──────────────────────────────────────────
function openTrackingModal(parcelId, statusColor) {
    const events = trackingByStatus[statusColor] || trackingByStatus['status-gray'];

    document.getElementById('drawerParcelId').textContent = parcelId;

    document.getElementById('drawerTimeline').innerHTML = events.map(e => `
        <div class="timeline-item">
            <div class="timeline-dot ${e.dot}"></div>
            <div class="timeline-content">
                <div class="timeline-title ${e.dot === 'pending' ? 'muted' : ''}">${e.title}</div>
                <div class="timeline-location">${e.location}</div>
                <div class="timeline-date">${e.date || ''}</div>
            </div>
        </div>`).join('');

    drawer.classList.add('open');
    lucide.createIcons();
}

function closeTrackingModal() {
    drawer.classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTrackingModal(); });

// ─── Sidebar ──────────────────────────────────────────────────
collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const collapsed = sidebar.classList.contains('collapsed');
    collapseBtn.innerHTML = collapsed
        ? `<i data-lucide="panel-left-open"></i> <span class="nav-text-light">Згорнути меню</span>`
        : `<i data-lucide="panel-left-close"></i> <span class="nav-text-light">Згорнути меню</span>`;
    collapseBtn.title = collapsed ? 'Розгорнути меню' : 'Згорнути меню';
    if (collapsed) {
        const activeChild = navGroup.querySelector('.nav-subitem.active');
        if (activeChild) navItemHeader.classList.add('parent-active');
    } else {
        navItemHeader.classList.remove('parent-active');
        navGroup.classList.remove('closed');
    }
    lucide.createIcons();
});

navItemHeader.addEventListener('click', () => {
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        navGroup.classList.remove('closed');
        collapseBtn.innerHTML = `<i data-lucide="panel-left-close"></i> <span class="nav-text-light">Згорнути меню</span>`;
        navItemHeader.classList.remove('parent-active');
        lucide.createIcons();
    } else {
        navGroup.classList.toggle('closed');
    }
});

navSubitems.forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        navSubitems.forEach(n => { n.classList.remove('active'); const sq = n.querySelector('.square'); if (sq) sq.remove(); });
        item.classList.add('active');
        item.insertAdjacentHTML('afterbegin', '<span class="square"></span>');
        const title = item.textContent.replace('■','').trim();
        document.querySelector('.page-header h1').innerHTML = `${title} <i data-lucide="info" class="icon-info"></i>`;
        lucide.createIcons();
    });
});

actionButtons.forEach(btn => btn.addEventListener('click', () => alert('Ця дія буде доступна в повноцінній версії!')));

// ─── Column sort click ────────────────────────────────────────
document.querySelector('.data-table thead').addEventListener('click', e => {
    const th = e.target.closest('th[data-sort]');
    if (!th) return;
    const key = th.dataset.sort;
    if (sortCol === key) {
        // cycle: asc → desc → none
        if (sortDir === 'asc') { sortDir = 'desc'; }
        else { sortCol = null; sortDir = 'asc'; }
    } else {
        sortCol = key;
        sortDir = 'asc';
    }
    currentPage = 1;
    renderTable();
});

// ─── Init ─────────────────────────────────────────────────────
if (sidebar.classList.contains('collapsed') && navGroup.querySelector('.nav-subitem.active')) {
    navItemHeader.classList.add('parent-active');
}
renderTable();