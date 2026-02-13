// ===========================================
// 1. CONFIGURAÇÃO DO MENU LATERAL
// ===========================================
const menuItems = [
    {
        label: "Dashboard",
        dataTab: "tracker",
        active: true,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
    },
    {
        label: "Lista",
        dataTab: "table",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`
    },
    {
        label: "Sair",
        id: "btn-logout",
        extraClass: "mt-auto",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
    }
];

function renderSidebar() {
    const container = document.getElementById('sidebar');
    if (!container) return;
    container.innerHTML = '';
    
    menuItems.forEach(item => {
        const div = document.createElement('div');
        let classes = 'sidebar-icon';
        if (item.active) classes += ' active';
        if (item.extraClass) classes += ` ${item.extraClass}`;
        div.className = classes;

        if (item.id) div.id = item.id;
        if (item.dataTab) div.setAttribute('data-tab', item.dataTab);

        div.innerHTML = `${item.icon}<span style="margin-top:2px">${item.label}</span>`;
        container.appendChild(div);
    });
}

// ===========================================
// 2. LÓGICA PRINCIPAL (SCRIPT.JS INTEGRADO)
// ===========================================

const state = {
    pcpData: [],
    filters: { client: 'all', makeBuy: 'all' }
};

let elements = {};

function initDOMElements() {
    elements = {
        uploadView: document.getElementById('upload-view'),
        mainApp: document.getElementById('main-app'),
        viewTracker: document.getElementById('view-tracker'),
        viewTable: document.getElementById('view-table'),
        trackerContent: document.getElementById('tracker-content-area'),
        tableBody: document.getElementById('table-body'),
        fileInput: document.getElementById('file-input'),
        btnBrowse: document.getElementById('btn-browse'),
        btnDemo: document.getElementById('btn-demo'),
        inputProject: document.getElementById('input-project-name'),
        headerTitle: document.getElementById('header-project-title'),
        kpiHours: document.getElementById('kpi-hours'),
        kpiValue: document.getElementById('kpi-value'),
        kpiRisk: document.getElementById('kpi-risk'),
        kpiEfficiency: document.getElementById('kpi-efficiency'),
        filterClient: document.getElementById('filter-client'),
        filterMakeBuy: document.getElementById('filter-makebuy')
    };
}

// --- PARSING DE DADOS (LÊ O EXCEL) ---
function parseExcelData(rows) {
    let headerRowIndex = -1;
    // Procura linha que contenha 'ID'
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
        const row = rows[i];
        if (row && row.some(cell => cell && typeof cell === 'string' && cell.trim().toUpperCase() === 'ID')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        alert("Não encontrei o cabeçalho 'ID' na planilha.");
        return [];
    }

    const headers = rows[headerRowIndex].map(h => (h ? h.toString().trim().toLowerCase() : ''));
    
    // Mapeamento de colunas
const colMap = {
    id: headers.indexOf('id'),
    client: headers.indexOf('cliente'),
    project: headers.indexOf('projeto'),
    op: headers.indexOf('operação'),
    desc: headers.indexOf('descrição'),
    makeBuy: headers.findIndex(h => h.includes('make')),
    supplier: headers.indexOf('fornecedor'),
    transmission: headers.indexOf('transmissão'), // <-- NOVA LINHA AQUI
    dateSupplier: headers.findIndex(h => h.includes('entrega') && h.includes('fornecedor')),
    dateFinal: headers.findIndex(h => h.includes('entrega') && h.includes('final')),
    hours: headers.findIndex(h => h.includes('quantd') || h.includes('horas')),
    value: headers.findIndex(h => h.includes('valor mo')),
    // Pipeline
    dim3d: headers.findIndex(h => h.includes('3d') || h.includes('matematica')),
    minuteria: headers.findIndex(h => h.includes('minuteria')),
    material: headers.findIndex(h => h.includes('material') && h.includes('construtivo')),
    bordo: headers.findIndex(h => h.includes('bordo')),
    montagem: headers.findIndex(h => h.includes('montagem') && h.includes('mecânica')),
    qualidade: headers.findIndex(h => h.includes('inspeção') || h.includes('qualidade'))
};

    // ... (código anterior da função parseExcelData)

const processedData = [];

for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // 1. Verifica se a linha existe e tem o ID preenchido
    if (!row || !row[colMap.id]) continue;

// ==========================================
    // NOVA REGRA: Ignorar se tiver APENAS o ID e/ou Zeros (Horas = 0)
    // ==========================================
    let hasOtherData = false;
    
    // Varre todas as colunas mapeadas (exceto o 'id')
    for (const key in colMap) {
        if (key !== 'id') {
            const colIndex = colMap[key];
            const cellValue = row[colIndex];
            
            // Verifica se a célula não é nula/indefinida
            if (colIndex !== -1 && cellValue !== undefined && cellValue !== null && cellValue !== '') {
                
                // Trata strings com espaços vazios
                if (typeof cellValue === 'string' && cellValue.trim() === '') {
                    continue;
                }

                // Se o conteúdo for apenas um zero (ex: Horas = 0), ignoramos e continuamos procurando
                if (cellValue === 0 || cellValue === '0' || cellValue === '0%') {
                    continue;
                }
                
                // Se chegou aqui, achou algum texto de verdade, data ou número maior que zero!
                hasOtherData = true;
                break; 
            }
        }
    }

    // Se passou por todas as colunas e não achou nada além do ID (ou apenas zeros nas horas), pula para a próxima linha
    if (!hasOtherData) continue;
    // ==========================================

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
        desc: row[colMap.desc] || 'Sem descrição',
        makeBuy: (row[colMap.makeBuy] || 'MAKE').toUpperCase(),
        supplier: row[colMap.supplier] || 'Interno',
        transmission: row[colMap.transmission] || '-', // <-- NOVA LINHA AQUI
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

// --- RENDERIZAÇÃO ---
function renderDashboard() {
    const container = elements.trackerContent;
    container.innerHTML = '';

    let filtered = state.pcpData;
    const clientFilter = elements.filterClient.value;
    const typeFilter = elements.filterMakeBuy.value;

    if (clientFilter !== 'all') filtered = filtered.filter(i => i.client === clientFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(i => i.makeBuy.includes(typeFilter));

    updateKPIs(filtered);

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';

        // Lógica Risco
        let isRisk = false;
        if (item.dateSupplier && item.dateFinal) {
            isRisk = item.dateSupplier > item.dateFinal;
        }
        
        const statusLabel = isRisk ? 'ATRASO' : 'NO PRAZO';
        const statusClass = isRisk ? 'st-risk' : 'st-ok';
        const mbClass = item.makeBuy.includes('MAKE') ? 'badge-make' : 'badge-buy';
        const fmtDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';
        
        // Pipeline Cores
        const segClass = (val) => {
            if (val >= 1) return 'seg-complete';
            if (val > 0) return 'seg-partial';
            return 'seg-empty';
        };
        
        // Tooltip %
        const percent = (val) => (val * 100).toFixed(0) + '%';
        card.innerHTML = `
        <div class="card-info">
            <h3>${item.id}</h3>
            
            <div style="font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px;">
                Transmissão: ${item.transmission} <span style="font-weight:400">| OP: ${item.op}</span>
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
                    <span class="date-label">Data de Entrega Final:</span>
                    <span class="date-val">${fmtDate(item.dateFinal)}</span>
                </div>
                <div class="date-row">
                    <span class="date-label">Data de Entrega Fornecedor:</span>
                    <span class="date-val" style="${isRisk ? 'color:red' : ''}">${fmtDate(item.dateSupplier)}</span>
                </div>
                <span class="status-pill ${statusClass}">${statusLabel}</span>
            </div>
        `;
        container.appendChild(card);
    });

    renderTable(filtered);
}

function updateKPIs(data) {
    const totalHours = data.reduce((acc, i) => acc + i.hours, 0);
    elements.kpiHours.textContent = Math.round(totalHours).toLocaleString('pt-BR') + 'h';

    const totalVal = data.reduce((acc, i) => acc + i.value, 0);
    elements.kpiValue.textContent = totalVal.toLocaleString('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0});

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
    
    data.forEach(item => {
        const tr = document.createElement('tr');
        const fmtDate = (d) => d ? d.toLocaleDateString('pt-BR') : '-';
        const isRisk = item.dateSupplier && item.dateFinal && item.dateSupplier > item.dateFinal;
        
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.transmission}</td> <td>${item.op}</td>
            <td>${item.supplier}</td>
            <td>${fmtDate(item.dateSupplier)}</td>
            <td style="color:${isRisk?'red':'green'}; font-weight:bold">${isRisk ? 'Atraso' : 'Ok'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- FILTROS E EVENTOS ---
function populateFilters() {
    const clients = [...new Set(state.pcpData.map(i => i.client))].sort();
    elements.filterClient.innerHTML = '<option value="all">Todos os Clientes</option>';
    clients.forEach(c => {
        if(c && c !== 'Geral') {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            elements.filterClient.appendChild(opt);
        }
    });
}

function initEvents() {
    // Upload
    elements.btnBrowse.addEventListener('click', () => elements.fileInput.click());
    
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        elements.btnBrowse.textContent = "Processando...";
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            let sheetName = workbook.SheetNames.find(n => n.toUpperCase().includes('PCP'));
            if (!sheetName) sheetName = workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            state.pcpData = parseExcelData(jsonData);
            
            elements.uploadView.classList.add('hidden');
            elements.mainApp.classList.remove('hidden');
            if(elements.inputProject.value) elements.headerTitle.textContent = elements.inputProject.value.toUpperCase();
            
            populateFilters();
            renderDashboard();
        };
        reader.readAsArrayBuffer(file);
    });

    // Demo
    elements.btnDemo.addEventListener('click', () => {
        state.pcpData = generateMockData();
        elements.uploadView.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');
        populateFilters();
        renderDashboard();
    });

    // Filters
    elements.filterClient.addEventListener('change', renderDashboard);
    elements.filterMakeBuy.addEventListener('change', renderDashboard);

    // Navigation
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
    
    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => location.reload());
}

function generateMockData() {
    // Dados simulados baseados no seu Excel
    return [
        { id: "2018", client: "RENAULT", op: "BM030", desc: "GRIPPER - LABOR - REALY", makeBuy: "MAKE", dateSupplier: new Date("2025-12-10"), dateFinal: new Date("2025-10-17"), hours: 149, value: 12000, pipeline: { dim3d: 1, material: 1, minuteria: 1, bordo: 0.5, montagem: 0, qualidade: 0 } },
        { id: "2019", client: "RENAULT", op: "BM030", desc: "GRIPPER - CONJ SUPERIOR", makeBuy: "MAKE", dateSupplier: new Date("2025-12-19"), dateFinal: new Date("2026-01-20"), hours: 165, value: 14000, pipeline: { dim3d: 1, material: 1, minuteria: 0.9, bordo: 0.75, montagem: 0.2, qualidade: 0 } },
        { id: "2501", client: "STL", op: "OP10", desc: "Fabricação SM-PA012-SM-2025", makeBuy: "BUY", dateSupplier: new Date("2025-12-29"), dateFinal: new Date("2025-12-31"), hours: 37, value: 3100, pipeline: { dim3d: 1, material: 1, minuteria: 1, bordo: 1, montagem: 1, qualidade: 0.5 } },
        { id: "2604", client: "VW", op: "OP40", desc: "Dispositivo de Solda Lateral", makeBuy: "MAKE", dateSupplier: new Date("2025-11-15"), dateFinal: new Date("2025-11-10"), hours: 210, value: 18500, pipeline: { dim3d: 1, material: 0.5, minuteria: 0.2, bordo: 0, montagem: 0, qualidade: 0 } }
    ];
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    renderSidebar();
    setTimeout(initEvents, 50); // Garante que sidebar carregou
});