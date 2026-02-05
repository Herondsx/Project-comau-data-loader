// ========================================
// MOCK DATA
// ========================================
const CATEGORIES = ['Eletrônicos', 'Móveis', 'Escritório', 'Serviços'];
const STATUS_OPTIONS = ['Concluído', 'Pendente', 'Cancelado', 'Processando'];
const REGIONS = ['Sul', 'Sudeste', 'Norte', 'Nordeste', 'Centro-Oeste'];

const MOCK_DATA = Array.from({ length: 50 }, (_, i) => ({
    id: `REQ-${1000 + i}`,
    date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    product: `Item ${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]} - Lote ${Math.floor(Math.random() * 100)}`,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    amount: Math.floor(Math.random() * 5000) + 100,
    status: STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)],
    region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
}));

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    // Views
    uploadView: document.getElementById('upload-view'),
    mainApp: document.getElementById('main-app'),
    dashboardView: document.getElementById('dashboard-view'),
    tableView: document.getElementById('table-view'),
    reportsView: document.getElementById('reports-view'),
    settingsView: document.getElementById('settings-view'),
    
    // Upload
    dropzone: document.getElementById('dropzone'),
    dropzoneContent: document.getElementById('dropzone-content'),
    dropzoneUploading: document.getElementById('dropzone-uploading'),
    uploadProgress: document.getElementById('upload-progress'),
    
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    navItems: document.querySelectorAll('.nav-item[data-tab]'),
    logoutBtn: document.getElementById('logout-btn'),
    toggleSidebar: document.getElementById('toggle-sidebar'),
    
    // Header
    pageTitle: document.getElementById('page-title'),
    
    // Dashboard
    totalAmount: document.getElementById('total-amount'),
    totalRecords: document.getElementById('total-records'),
    pendingCount: document.getElementById('pending-count'),
    areaFill: document.getElementById('area-fill'),
    areaLine: document.getElementById('area-line'),
    barChart: document.getElementById('bar-chart'),
    
    // Table
    searchInput: document.getElementById('search-input'),
    tableBody: document.getElementById('table-body'),
};

// ========================================
// STATE
// ========================================
let state = {
    hasFile: false,
    activeTab: 'dashboard',
    sidebarOpen: true,
    searchFilter: '',
};

// ========================================
// UPLOAD FUNCTIONALITY
// ========================================
function initUpload() {
    const { dropzone, dropzoneContent, dropzoneUploading, uploadProgress } = elements;
    
    // Drag events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragging');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragging');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
        startUploadSimulation();
    });
    
    dropzone.addEventListener('click', startUploadSimulation);
}

function startUploadSimulation() {
    const { dropzoneContent, dropzoneUploading, uploadProgress } = elements;
    
    dropzoneContent.classList.add('hidden');
    dropzoneUploading.classList.remove('hidden');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(completeUpload, 600);
        }
        uploadProgress.textContent = `${Math.round(progress)}%`;
    }, 100);
}

function completeUpload() {
    state.hasFile = true;
    elements.uploadView.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    
    // Initialize dashboard data
    updateDashboardStats();
    renderAreaChart();
    renderBarChart();
    renderTable();
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    // Tab navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Sidebar toggle
    elements.toggleSidebar.addEventListener('click', () => {
        elements.sidebar.classList.toggle('collapsed');
        state.sidebarOpen = !state.sidebarOpen;
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', logout);
}

function switchTab(tab) {
    state.activeTab = tab;
    
    // Update nav items
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        table: 'Tabela Mestra',
        reports: 'Relatórios',
        settings: 'Configurações',
    };
    elements.pageTitle.textContent = titles[tab] || 'Dashboard';
    
    // Show/hide views
    elements.dashboardView.classList.toggle('hidden', tab !== 'dashboard');
    elements.tableView.classList.toggle('hidden', tab !== 'table');
    elements.reportsView.classList.toggle('hidden', tab !== 'reports');
    elements.settingsView.classList.toggle('hidden', tab !== 'settings');
}

function logout() {
    state.hasFile = false;
    state.activeTab = 'dashboard';
    
    // Reset upload view
    elements.dropzoneContent.classList.remove('hidden');
    elements.dropzoneUploading.classList.add('hidden');
    elements.uploadProgress.textContent = '0%';
    
    // Switch views
    elements.mainApp.classList.add('hidden');
    elements.uploadView.classList.remove('hidden');
    
    // Reset nav
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === 'dashboard');
    });
}

// ========================================
// DASHBOARD
// ========================================
function updateDashboardStats() {
    const totalAmount = MOCK_DATA.reduce((acc, cur) => acc + cur.amount, 0);
    const pendingCount = MOCK_DATA.filter(d => d.status === 'Pendente').length;
    
    elements.totalAmount.textContent = totalAmount.toLocaleString('pt-BR');
    elements.totalRecords.textContent = MOCK_DATA.length;
    elements.pendingCount.textContent = pendingCount;
}

function renderAreaChart() {
    const data = Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 100) + 20 }));
    const max = Math.max(...data.map(d => d.value));
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / max) * 100;
        return `${x},${y}`;
    }).join(' ');
    
    elements.areaLine.setAttribute('points', points);
    elements.areaFill.setAttribute('d', `M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`);
}

function renderBarChart() {
    const categoryData = {};
    MOCK_DATA.forEach(d => {
        categoryData[d.category] = (categoryData[d.category] || 0) + d.amount;
    });
    
    const data = Object.keys(categoryData).map(k => ({
        label: k,
        value: categoryData[k],
    }));
    
    const max = Math.max(...data.map(d => d.value));
    
    elements.barChart.innerHTML = data.map(d => `
        <div class="bar-item">
            <div class="bar-container">
                <div class="bar" style="height: ${(d.value / max) * 100}%"></div>
            </div>
            <span class="bar-label">${d.label.substring(0, 3)}</span>
        </div>
    `).join('');
}

// ========================================
// TABLE
// ========================================
function initTable() {
    elements.searchInput.addEventListener('input', (e) => {
        state.searchFilter = e.target.value.toLowerCase();
        renderTable();
    });
}

function renderTable() {
    const filteredData = MOCK_DATA.filter(item =>
        item.product.toLowerCase().includes(state.searchFilter) ||
        item.status.toLowerCase().includes(state.searchFilter) ||
        item.id.toLowerCase().includes(state.searchFilter) ||
        item.category.toLowerCase().includes(state.searchFilter)
    );
    
    elements.tableBody.innerHTML = filteredData.map(row => `
        <tr>
            <td>${row.id}</td>
            <td>${row.product}</td>
            <td>${row.category}</td>
            <td>${formatDate(row.date)}</td>
            <td class="text-right">R$ ${row.amount.toLocaleString('pt-BR')}</td>
            <td class="text-center">
                <span class="badge badge-${getBadgeClass(row.status)}">${row.status}</span>
            </td>
            <td class="text-right">
                <span class="row-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

function getBadgeClass(status) {
    const classes = {
        'Concluído': 'concluido',
        'Processando': 'processando',
        'Pendente': 'pendente',
        'Cancelado': 'cancelado',
    };
    return classes[status] || 'pendente';
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
    initUpload();
    initNavigation();
    initTable();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
