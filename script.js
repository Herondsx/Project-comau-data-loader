// ===========================================
// 1. CONFIGURACAO DO MENU LATERAL
// ===========================================
const menuItems = [
    {
        label: "Dashboard",
        dataTab: "tracker",
        active: true,
        tooltip: "Dashboard de Fluxo",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
    },
    {
        label: "Lista",
        dataTab: "table",
        tooltip: "Tabela Detalhada",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`
    },
    {
        label: "Sair",
        id: "btn-logout",
        extraClass: "mt-auto",
        tooltip: "Voltar ao Upload",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
    }
];

function renderSidebar() {
    const container = document.getElementById('sidebar');
    if (!container) return;
    container.innerHTML = '';

    // Logo Comau no topo do sidebar
    const logo = document.createElement('img');
    logo.src = 'logo-comau.png';
    logo.alt = 'Comau';
    logo.className = 'sidebar-logo';
    container.appendChild(logo);

    // Divisor
    const divider = document.createElement('div');
    divider.className = 'sidebar-divider';
    container.appendChild(divider);

    menuItems.forEach(item => {
        const div = document.createElement('div');
        let classes = 'sidebar-icon';
        if (item.active) classes += ' active';
        if (item.extraClass) classes += ` ${item.extraClass}`;
        div.className = classes;

        if (item.id) div.id = item.id;
        if (item.dataTab) div.setAttribute('data-tab', item.dataTab);
        if (item.tooltip) div.setAttribute('data-tooltip', item.tooltip);

        div.innerHTML = `${item.icon}<span style="margin-top:2px">${item.label}</span>`;
        container.appendChild(div);
    });
}

// ===========================================
// 2. LOGICA PRINCIPAL
// ===========================================

const state = {
    pcpData: [],
    filters: { client: 'all', makeBuy: 'all' },
    searchTerm: '',
    sortColumn: null,
    sortDirection: 'asc'
};

let elements = {};
let searchDebounceTimer = null;

function initDOMElements() {
    elements = {
        uploadView: document.getElementById('upload-view'),
        mainApp: document.getElementById('main-app'),
        viewTracker: document.getElementById('view-tracker'),
        viewTable: document.getElementById('view-table'),
        trackerContent: document.getElementById('tracker-content-area'),
        tableBody: document.getElementById('table-body'),
        fileInput: document.getElementById('file-input'),
        dropzone: document.getElementById('dropzone'),
        btnBrowse: document.getElementById('btn-browse'),
        btnDemo: document.getElementById('btn-demo'),
        inputProject: document.getElementById('input-project-name'),
        headerTitle: document.getElementById('header-project-title'),
        searchInput: document.getElementById('search-input'),
        kpiItems: document.getElementById('kpi-items'),
        kpiHours: document.getElementById('kpi-hours'),
        kpiValue: document.getElementById('kpi-value'),
        kpiRisk: document.getElementById('kpi-risk'),
        kpiEfficiency: document.getElementById('kpi-efficiency'),
        filterClient: document.getElementById('filter-client'),
        filterMakeBuy: document.getElementById('filter-makebuy'),
        itemCount: document.getElementById('item-count'),
        tableItemCount: document.getElementById('table-item-count'),
        emptyState: document.getElementById('empty-state')
    };
}

// --- PARSING DE DADOS (LE O EXCEL) ---
function parseExcelData(rows) {
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
        const row = rows[i];
        if (row && row.some(cell => cell && typeof cell === 'string' && cell.trim().toUpperCase() === 'ID')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        alert("Nao encontrei o cabecalho 'ID' na planilha.");
        return [];
    }

    const headers = rows[headerRowIndex].map(h => (h ? h.toString().trim().toLowerCase() : ''));

    const colMap = {
        id: headers.indexOf('id'),
        client: headers.indexOf('cliente'),
        project: headers.indexOf('projeto'),
        op: headers.findIndex(h => h === 'operação' || h === 'operacao'),
        desc: headers.findIndex(h => h === 'descrição' || h === 'descricao'),
        makeBuy: headers.findIndex(h => h.includes('make')),
        supplier: headers.indexOf('fornecedor'),
        transmission: headers.findIndex(h => h === 'transmissão' || h === 'transmissao'),
        dateSupplier: headers.findIndex(h => h.includes('entrega') && h.includes('fornecedor')),
        dateFinal: headers.findIndex(h => h.includes('entrega') && h.includes('final')),
        hours: headers.findIndex(h => h.includes('quantd') || h.includes('horas')),
        value: headers.findIndex(h => h.includes('valor mo')),
        dim3d: headers.findIndex(h => h.includes('3d') || h.includes('matematica')),
        minuteria: headers.findIndex(h => h.includes('minuteria')),
        material: headers.findIndex(h => h.includes('material') && h.includes('construtivo')),
        bordo: headers.findIndex(h => h.includes('bordo')),
        montagem: headers.findIndex(h => h.includes('montagem') && h.includes('mecânica')),
        qualidade: headers.findIndex(h => h.includes('inspeção') || h.includes('qualidade') || h.includes('inspecao'))
    };

    const processedData = [];

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[colMap.id]) continue;

        // Ignorar linhas com apenas o ID e/ou zeros
        let hasOtherData = false;
        for (const key in colMap) {
            if (key !== 'id') {
                const colIndex = colMap[key];
                const cellValue = row[colIndex];

                if (colIndex !== -1 && cellValue !== undefined && cellValue !== null && cellValue !== '') {
                    if (typeof cellValue === 'string' && cellValue.trim() === '') continue;
                    if (cellValue === 0 || cellValue === '0' || cellValue === '0%') continue;
                    hasOtherData = true;
                    break;
                }
            }
        }

        if (!hasOtherData) continue;

        const parseDate = (val) => {
            if (!val) return null;
            if (typeof val === 'number') {
                return new Date(Math.round((val - 25569) * 86400 * 1000));
            }
            return new Date(val);
        };

        const dtSup = parseDate(row[colMap.dateSupplier]);
        const dtFin = parseDate(row[colMap.dateFinal]);

        const item = {
            id: row[colMap.id],
            client: row[colMap.client] || 'Geral',
            project: row[colMap.project] || '-',
            op: row[colMap.op] || '-',
            desc: row[colMap.desc] || 'Sem descricao',
            makeBuy: (row[colMap.makeBuy] || 'MAKE').toUpperCase(),
            supplier: row[colMap.supplier] || 'Interno',
            transmission: row[colMap.transmission] || '-',
            dateSupplier: dtSup,
            dateFinal: dtFin,
            hours: parseFloat(row[colMap.hours]) || 0,
            value: parseFloat(row[colMap.value]) || 0,
            pipeline: {
                dim3d: parseFloat(row[colMap.dim3d]) || 0,
                material: parseFloat(row[colMap.material]) || 0,
                minuteria: parseFloat(row[colMap.minuteria]) || 0,
                bordo: parseFloat(row[colMap.bordo]) || 0,
                montagem: parseFloat(row[colMap.montagem]) || 0,
                qualidade: parseFloat(row[colMap.qualidade]) || 0
            }
        };
        processedData.push(item);
    }
    return processedData;
}

// --- FILTRAGEM CENTRAL ---
function getFilteredData() {
    let filtered = state.pcpData;
    const clientFilter = elements.filterClient.value;
    const typeFilter = elements.filterMakeBuy.value;
    const search = state.searchTerm.toLowerCase().trim();

    if (clientFilter !== 'all') {
        filtered = filtered.filter(i => i.client === clientFilter);
    }
    if (typeFilter !== 'all') {
        filtered = filtered.filter(i => i.makeBuy.includes(typeFilter));
    }
    if (search) {
        filtered = filtered.filter(i => {
            const searchable = [
                String(i.id),
                i.desc,
                i.supplier,
                i.client,
                i.op,
                i.transmission,
                i.makeBuy
            ].join(' ').toLowerCase();
            return searchable.includes(search);
        });
    }
    return filtered;
}

// --- RENDERIZACAO ---
function renderDashboard() {
    const container = elements.trackerContent;
    container.innerHTML = '';

    const filtered = getFilteredData();

    updateKPIs(filtered);

    // Contagem de itens
    const countText = filtered.length === 1 ? '1 item' : filtered.length + ' itens';
    elements.itemCount.textContent = countText;
    elements.tableItemCount.textContent = countText;

    // Estado vazio
    if (filtered.length === 0) {
        elements.emptyState.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        container.classList.remove('hidden');
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';

        let isRisk = false;
        if (item.dateSupplier && item.dateFinal) {
            isRisk = item.dateSupplier > item.dateFinal;
        }

        const statusLabel = isRisk ? 'ATRASO' : 'NO PRAZO';
        const statusClass = isRisk ? 'st-risk' : 'st-ok';
        const mbClass = item.makeBuy.includes('MAKE') ? 'badge-make' : 'badge-buy';
        const fmtDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';

        const segClass = (val) => {
            if (val >= 1) return 'seg-complete';
            if (val > 0) return 'seg-partial';
            return 'seg-empty';
        };

        const percent = (val) => (val * 100).toFixed(0) + '%';

        card.innerHTML = `
        <div class="card-info">
            <h3>${item.id}</h3>
            <div style="font-size: 11px; color: #666; font-weight: 600; margin-bottom: 3px;">
                Transmissao: ${item.transmission} <span style="font-weight:400">| OP: ${item.op}</span>
            </div>
            <span class="desc" title="${item.desc}">${item.desc}</span>
            <div class="badges">
                <span class="badge ${mbClass}">${item.makeBuy}</span>
                <span class="badge badge-client">${item.client}</span>
            </div>
        </div>

        <div class="pipeline-container">
            <div class="pipeline-track">
                <div class="pipeline-segment ${segClass(item.pipeline.dim3d)}" title="3D: ${percent(item.pipeline.dim3d)}"></div>
                <div class="pipeline-segment ${segClass(item.pipeline.material)}" title="Material: ${percent(item.pipeline.material)}"></div>
                <div class="pipeline-segment ${segClass(item.pipeline.minuteria)}" title="Minuteria: ${percent(item.pipeline.minuteria)}"></div>
                <div class="pipeline-segment ${segClass(item.pipeline.bordo)}" title="Bordo: ${percent(item.pipeline.bordo)}"></div>
                <div class="pipeline-segment ${segClass(item.pipeline.montagem)}" title="Montagem: ${percent(item.pipeline.montagem)}"></div>
                <div class="pipeline-segment ${segClass(item.pipeline.qualidade)}" title="Qualidade: ${percent(item.pipeline.qualidade)}"></div>
            </div>
            <div class="pipeline-legend">
                <span>3D</span><span>Mat.</span><span>Min.</span><span>Bordo</span><span>Mont.</span><span>Qual.</span>
            </div>
        </div>

        <div class="card-dates">
            <div class="date-row">
                <span class="date-label">Entrega Final:</span>
                <span class="date-val">${fmtDate(item.dateFinal)}</span>
            </div>
            <div class="date-row">
                <span class="date-label">Entrega Fornecedor:</span>
                <span class="date-val" style="${isRisk ? 'color:#ef4444' : ''}">${fmtDate(item.dateSupplier)}</span>
            </div>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
        `;
        container.appendChild(card);
    });

    renderTable(filtered);
}

function updateKPIs(data) {
    elements.kpiItems.textContent = data.length;

    const totalHours = data.reduce((acc, i) => acc + i.hours, 0);
    elements.kpiHours.textContent = Math.round(totalHours).toLocaleString('pt-BR') + 'h';

    const totalVal = data.reduce((acc, i) => acc + i.value, 0);
    elements.kpiValue.textContent = totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

    const risks = data.filter(i => i.dateSupplier && i.dateFinal && i.dateSupplier > i.dateFinal).length;
    elements.kpiRisk.textContent = risks;

    let totalScore = 0;
    const maxScore = data.length * 6;
    if (data.length === 0) {
        elements.kpiEfficiency.textContent = "0%";
        return;
    }
    data.forEach(i => {
        const p = i.pipeline;
        totalScore += (p.dim3d + p.material + p.minuteria + p.bordo + p.montagem + p.qualidade);
    });
    const eff = (totalScore / maxScore) * 100;
    elements.kpiEfficiency.textContent = eff.toFixed(1) + '%';
}

function renderTable(data) {
    const tbody = elements.tableBody;
    tbody.innerHTML = '';

    // Ordenacao
    let sortedData = [...data];
    if (state.sortColumn) {
        sortedData.sort((a, b) => {
            let valA = a[state.sortColumn];
            let valB = b[state.sortColumn];

            // Status virtual
            if (state.sortColumn === 'status') {
                valA = (a.dateSupplier && a.dateFinal && a.dateSupplier > a.dateFinal) ? 1 : 0;
                valB = (b.dateSupplier && b.dateFinal && b.dateSupplier > b.dateFinal) ? 1 : 0;
            }

            if (valA instanceof Date && valB instanceof Date) {
                return state.sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            if (valA == null) valA = '';
            if (valB == null) valB = '';

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();

            if (state.sortDirection === 'asc') {
                return strA < strB ? -1 : strA > strB ? 1 : 0;
            } else {
                return strA > strB ? -1 : strA < strB ? 1 : 0;
            }
        });
    }

    const segClass = (val) => {
        if (val >= 1) return 'seg-complete';
        if (val > 0) return 'seg-partial';
        return '';
    };

    sortedData.forEach(item => {
        const tr = document.createElement('tr');
        const fmtDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';
        const isRisk = item.dateSupplier && item.dateFinal && item.dateSupplier > item.dateFinal;

        const mbStyle = item.makeBuy.includes('MAKE')
            ? 'background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600'
            : 'background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600';

        tr.innerHTML = `
            <td style="font-weight:600">${item.id}</td>
            <td>${item.client}</td>
            <td>${item.transmission}</td>
            <td>${item.op}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${item.desc}">${item.desc}</td>
            <td><span style="${mbStyle}">${item.makeBuy}</span></td>
            <td>${item.supplier}</td>
            <td>${fmtDate(item.dateSupplier)}</td>
            <td>${fmtDate(item.dateFinal)}</td>
            <td>
                <div class="table-pipeline">
                    <div class="seg ${segClass(item.pipeline.dim3d)}" style="background:${item.pipeline.dim3d >= 1 ? '#10b981' : item.pipeline.dim3d > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                    <div class="seg ${segClass(item.pipeline.material)}" style="background:${item.pipeline.material >= 1 ? '#10b981' : item.pipeline.material > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                    <div class="seg ${segClass(item.pipeline.minuteria)}" style="background:${item.pipeline.minuteria >= 1 ? '#10b981' : item.pipeline.minuteria > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                    <div class="seg ${segClass(item.pipeline.bordo)}" style="background:${item.pipeline.bordo >= 1 ? '#10b981' : item.pipeline.bordo > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                    <div class="seg ${segClass(item.pipeline.montagem)}" style="background:${item.pipeline.montagem >= 1 ? '#10b981' : item.pipeline.montagem > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                    <div class="seg ${segClass(item.pipeline.qualidade)}" style="background:${item.pipeline.qualidade >= 1 ? '#10b981' : item.pipeline.qualidade > 0 ? '#f59e0b' : '#e5e7eb'}"></div>
                </div>
            </td>
            <td>
                <span style="padding:3px 8px;border-radius:4px;font-size:11px;font-weight:700;${isRisk ? 'background:#fee2e2;color:#991b1b' : 'background:#d1fae5;color:#065f46'}">${isRisk ? 'Atraso' : 'Ok'}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- FILTROS E EVENTOS ---
function populateFilters() {
    const clients = [...new Set(state.pcpData.map(i => i.client))].sort();
    elements.filterClient.innerHTML = '<option value="all">Todos os Clientes</option>';
    clients.forEach(c => {
        if (c && c !== 'Geral') {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            elements.filterClient.appendChild(opt);
        }
    });
}

function processFile(file) {
    if (!file) return;

    elements.btnBrowse.textContent = "Processando...";
    elements.btnBrowse.classList.add('loading');

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let sheetName = workbook.SheetNames.find(n => n.toUpperCase().includes('PCP'));
        if (!sheetName) sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        state.pcpData = parseExcelData(jsonData);

        elements.uploadView.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');
        if (elements.inputProject.value) {
            elements.headerTitle.textContent = elements.inputProject.value.toUpperCase();
        }

        populateFilters();
        renderDashboard();

        // Reset botao
        elements.btnBrowse.textContent = "Buscar Arquivo";
        elements.btnBrowse.classList.remove('loading');
    };

    reader.onerror = function () {
        alert('Erro ao ler o arquivo. Verifique se o formato esta correto.');
        elements.btnBrowse.textContent = "Buscar Arquivo";
        elements.btnBrowse.classList.remove('loading');
    };

    reader.readAsArrayBuffer(file);
}

function initEvents() {
    // Browse button
    elements.btnBrowse.addEventListener('click', () => elements.fileInput.click());

    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        processFile(e.target.files[0]);
    });

    // Drag and Drop real
    const dropzone = elements.dropzone;

    dropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'xlsx' || ext === 'xlsm') {
                processFile(file);
            } else {
                alert('Formato nao suportado. Use arquivos .XLSX ou .XLSM');
            }
        }
    });

    // Clicar na dropzone toda tambem abre o seletor
    dropzone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            elements.fileInput.click();
        }
    });

    // Demo
    elements.btnDemo.addEventListener('click', () => {
        state.pcpData = generateMockData();
        elements.uploadView.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');
        populateFilters();
        renderDashboard();
    });

    // Filtros
    elements.filterClient.addEventListener('change', renderDashboard);
    elements.filterMakeBuy.addEventListener('change', renderDashboard);

    // Busca com debounce
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            state.searchTerm = e.target.value;
            renderDashboard();
        }, 250);
    });

    // Navegacao Sidebar
    const navItems = document.querySelectorAll('.sidebar-icon[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const tab = item.dataset.tab;
            if (tab === 'tracker') {
                elements.viewTracker.classList.remove('hidden');
                elements.viewTable.classList.add('hidden');
                document.getElementById('kpi-section').classList.remove('hidden');
            } else {
                elements.viewTracker.classList.add('hidden');
                elements.viewTable.classList.remove('hidden');
                document.getElementById('kpi-section').classList.add('hidden');
            }
        });
    });

    // Ordenacao na tabela
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;

            // Limpa classes anteriores
            document.querySelectorAll('.data-table th').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            if (state.sortColumn === col) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortColumn = col;
                state.sortDirection = 'asc';
            }

            th.classList.add(state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');

            // Re-render apenas a tabela com os dados filtrados
            renderTable(getFilteredData());
        });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => location.reload());
}

function generateMockData() {
    return [
        { id: "2018", client: "RENAULT", op: "BM030", desc: "GRIPPER - LABOR - REALY", makeBuy: "MAKE", supplier: "Interno", transmission: "TR-001", dateSupplier: new Date("2025-12-10"), dateFinal: new Date("2025-10-17"), hours: 149, value: 12000, pipeline: { dim3d: 1, material: 1, minuteria: 1, bordo: 0.5, montagem: 0, qualidade: 0 } },
        { id: "2019", client: "RENAULT", op: "BM030", desc: "GRIPPER - CONJ SUPERIOR", makeBuy: "MAKE", supplier: "Interno", transmission: "TR-001", dateSupplier: new Date("2025-12-19"), dateFinal: new Date("2026-01-20"), hours: 165, value: 14000, pipeline: { dim3d: 1, material: 1, minuteria: 0.9, bordo: 0.75, montagem: 0.2, qualidade: 0 } },
        { id: "2501", client: "STL", op: "OP10", desc: "Fabricacao SM-PA012-SM-2025", makeBuy: "BUY", supplier: "Fornecedor X", transmission: "TR-045", dateSupplier: new Date("2025-12-29"), dateFinal: new Date("2025-12-31"), hours: 37, value: 3100, pipeline: { dim3d: 1, material: 1, minuteria: 1, bordo: 1, montagem: 1, qualidade: 0.5 } },
        { id: "2604", client: "VW", op: "OP40", desc: "Dispositivo de Solda Lateral", makeBuy: "MAKE", supplier: "Interno", transmission: "TR-112", dateSupplier: new Date("2025-11-15"), dateFinal: new Date("2025-11-10"), hours: 210, value: 18500, pipeline: { dim3d: 1, material: 0.5, minuteria: 0.2, bordo: 0, montagem: 0, qualidade: 0 } },
        { id: "2701", client: "STELLANTIS", op: "OP20", desc: "Base Estrutural Conjunto A", makeBuy: "MAKE", supplier: "Interno", transmission: "TR-200", dateSupplier: new Date("2026-01-15"), dateFinal: new Date("2026-02-01"), hours: 320, value: 27000, pipeline: { dim3d: 1, material: 1, minuteria: 1, bordo: 1, montagem: 0.8, qualidade: 0.3 } },
        { id: "2702", client: "STELLANTIS", op: "OP25", desc: "Suporte Fixacao Painel", makeBuy: "BUY", supplier: "MetalParts Ltda", transmission: "TR-200", dateSupplier: new Date("2026-01-20"), dateFinal: new Date("2026-01-18"), hours: 45, value: 5200, pipeline: { dim3d: 1, material: 1, minuteria: 0.5, bordo: 0, montagem: 0, qualidade: 0 } }
    ];
}

// --- INICIALIZACAO ---
document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    renderSidebar();
    setTimeout(initEvents, 50);
});