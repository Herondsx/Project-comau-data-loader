/**
 * ============================================================================
 * SIV-SITE - Sistema de Integração e Visualização de Projetos
 * Módulo: Tracker Dashboard (PowerPoint Style)
 * ============================================================================
 */

// ==============================================================
// 1. ESTADO E DADOS MOCKADOS
// ==============================================================

const state = {
    currentView: 'tracker',
    filters: {
        line: 'AUFBAU',
        station: 'all'
    },
    data: null,
    rawExcelData: []
};

const MOCK_DATA = {
    "OP20": [
        { id: "XXXX-XXXX-0003-2026", phases: generatePhases("04/02", "04/02", "04/02", "08/02", "10/02") },
        { id: "XXXX-XXXX-0004-2026", phases: generatePhases("04/02", "04/02", "04/02", "04/02", "04/02") }
    ],
    "OP10": [
        { id: "XXXX-XXXX-0001-2026", phases: generatePhases("04/02", "08/02", "04/02", "04/02", "04/02") }
    ]
};

// ==============================================================
// 2. REFERÊNCIAS DO DOM
// ==============================================================
let elements = {};

function initDOMElements() {
    elements = {
        uploadView: document.getElementById('upload-view'),
        mainApp: document.getElementById('main-app'),
        viewTracker: document.getElementById('view-tracker'),
        viewTable: document.getElementById('view-table'),
        trackerContent: document.getElementById('tracker-content-area'),
        tableBody: document.getElementById('table-body'),
        btnBrowse: document.getElementById('btn-browse'),
        fileInput: document.getElementById('file-input'),
        dropzone: document.getElementById('dropzone'),
        btnDemo: document.getElementById('btn-demo'),
        btnLogout: document.getElementById('btn-logout'),
        navItems: document.querySelectorAll('.sidebar-icon[data-tab]'),
        filterStation: document.getElementById('filter-station-tracker'),
        filterTransmission: document.getElementById('filter-transmission-tracker')
    };
}

// ==============================================================
// 3. FUNÇÕES AUXILIARES DE DADOS
// ==============================================================

function generatePhases(eng, pur, com, cons, man) {
    return [
        { name: "Engineering", plan: "04/02", actual: eng || "04/02" },
        { name: "Purchasing", plan: "04/02", actual: pur || "04/02" },
        { name: "Commercial", plan: "04/02", actual: com || "04/02" },
        { name: "Constructives", plan: "04/02", actual: cons || "04/02" },
        { name: "Manufacturing", plan: "04/02", actual: man || "04/02" },
        { name: "Delivery", plan: "04/02", actual: "04/02" }
    ];
}

function determineStatusClass(plan, actual) {
    // Se houver concatenação "|" (divergência), marca como vermelho ou alerta
    if (actual.toString().includes('|')) return 'dot-red'; 
    if (plan === actual) return 'dot-green';
    if (actual > plan) return 'dot-red'; 
    return 'dot-blue';
}

/**
 * Converte as linhas do Excel no objeto de estado
 */
function parseExcelToState(rows) {
    if (rows.length < 2) return {};

    // --- CONFIGURAÇÃO DE COLUNAS (Ajuste conforme seu Excel) ---
    // 0 = Coluna A, 1 = Coluna B, etc.
    const COL_STATION = 0; 
    const COL_ID = 1;      
    const COL_PHASE = 2;   
    const COL_PLAN = 3;    
    const COL_ACTUAL = 4;  

    const result = {};
    const conflicts = [];

    // Começa do 1 para pular o cabeçalho
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[COL_ID]) continue; // Pula linhas sem ID

        const station = row[COL_STATION] || "Sem Estação";
        const id = row[COL_ID];
        const phaseName = row[COL_PHASE];
        const plan = row[COL_PLAN] || "-";
        const actual = row[COL_ACTUAL] || "-";

        if (!result[station]) result[station] = [];

        // Verifica se o ID já existe na estação
        let transmission = result[station].find(t => t.id === id);
        if (!transmission) {
            transmission = { id: id, phases: [] };
            result[station].push(transmission);
        }

        // Verifica se a fase já existe (Divergência)
        let phase = transmission.phases.find(p => p.name === phaseName);
        if (phase) {
            if (phase.plan !== plan || phase.actual !== actual) {
                conflicts.push(`Divergência: ID ${id} - ${phaseName}`);
                // Concatena as informações divergentes
                phase.plan = `${phase.plan} | ${plan}`;
                phase.actual = `${phase.actual} | ${actual}`;
            }
        } else {
            transmission.phases.push({ name: phaseName, plan, actual });
        }
    }

    if (conflicts.length > 0) {
        alert("⚠️ Divergências processadas:\n" + conflicts.slice(0,5).join("\n") + (conflicts.length > 5 ? "\n..." : ""));
    }
    return result;
}

// ==============================================================
// 4. LÓGICA DE RENDERIZAÇÃO
// ==============================================================

function renderTracker() {
    const container = elements.trackerContent;
    if (!container) return;
    container.innerHTML = '';
    
    const stationFilter = elements.filterStation ? elements.filterStation.value : 'all';
    const transFilter = elements.filterTransmission ? elements.filterTransmission.value : 'all';
    const dataToRender = state.data || MOCK_DATA;

    for (const [station, items] of Object.entries(dataToRender)) {
        if (stationFilter !== 'all' && station !== stationFilter) continue;
        
        const filteredItems = items.filter(item => {
            return transFilter === 'all' || item.id === transFilter;
        });

        if (filteredItems.length === 0) continue;

        const section = document.createElement('div');
        section.className = 'station-section';
        
        // CORREÇÃO: Estava 'di   '
        const title = document.createElement('div'); 
        title.className = 'station-title';
        title.textContent = station;
        section.appendChild(title);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container';

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tracker-card';
            
            // Monta o HTML do card
            let phasesHTML = '';
            item.phases.forEach(phase => {
                const statusClass = determineStatusClass(phase.plan, phase.actual);
                phasesHTML += `
                    <div class="phase-row">
                        <div class="phase-name">${phase.name}</div>
                        <div class="phase-date">${phase.plan}</div>
                        <div class="phase-date">${phase.actual}</div>
                        <div class="phase-status"><span class="status-dot ${statusClass}"></span></div>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="card-header">
                    <span>${item.id}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </div>
                <div class="card-body">
                    <div class="phase-grid">
                        <div class="grid-header text-left">Phase</div>
                        <div class="grid-header">Plan</div>
                        <div class="grid-header">Actual</div>
                        <div class="grid-header">Status</div>
                        ${phasesHTML}
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });

        section.appendChild(cardsContainer);
        container.appendChild(section);
    }
}

function renderTable() {
    const tbody = elements.tableBody;
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const dataToRender = state.data || MOCK_DATA;

    for (const [station, items] of Object.entries(dataToRender)) {
        items.forEach(item => {
            item.phases.forEach(phase => {
                const statusDot = determineStatusClass(phase.plan, phase.actual);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${station}</td>
                    <td>${item.id}</td>
                    <td>${phase.name}</td>
                    <td>${phase.plan}</td>
                    <td>${phase.actual}</td>
                    <td><span class="status-dot ${statusDot}"></span></td>
                `;
                tbody.appendChild(row);
            });
        });
    }
}

// ==============================================================
// 5. NAVEGAÇÃO E EVENTOS
// ==============================================================

function switchTab(tabName) {
    elements.viewTracker.classList.add('hidden');
    elements.viewTable.classList.add('hidden');
    elements.navItems.forEach(el => el.classList.remove('active'));
    
    const activeIcon = document.querySelector(`.sidebar-icon[data-tab="${tabName}"]`);
    if(activeIcon) activeIcon.classList.add('active');

    if(tabName === 'tracker') elements.viewTracker.classList.remove('hidden');
    else if (tabName === 'table') elements.viewTable.classList.remove('hidden');
}

function initEvents() {
    // 1. Botão Buscar
    elements.btnBrowse.addEventListener('click', () => elements.fileInput.click());

    // 2. Leitura do Arquivo Excel
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        elements.btnBrowse.textContent = "Lendo arquivo...";
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                state.rawExcelData = jsonData;
                
                // Processa dados e trata divergências
                state.data = parseExcelToState(jsonData);

                elements.btnBrowse.textContent = "Buscar Arquivo";
                startApp();
            } catch (error) {
                console.error(error);
                alert("Erro ao ler o arquivo.");
                elements.btnBrowse.textContent = "Buscar Arquivo";
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // 3. Botão Demo
    elements.btnDemo.addEventListener('click', () => {
        state.data = MOCK_DATA;
        startApp();
    });

    // 4. Navegação
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // 5. Logout
    elements.btnLogout.addEventListener('click', () => location.reload());

    // 6. Filtros
    if (elements.filterStation) {
        elements.filterStation.addEventListener('change', renderTracker);
    }
    if (elements.filterTransmission) {
        elements.filterTransmission.addEventListener('change', renderTracker);
    }
}

function populateTransmissionFilter() {
    if(!elements.filterTransmission || !state.data) return;
    let allIds = [];
    Object.values(state.data).forEach(items => {
        items.forEach(i => allIds.push(i.id));
    });
    allIds = [...new Set(allIds)];
    elements.filterTransmission.innerHTML = '<option value="all">Todas</option>';
    allIds.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = id;
        elements.filterTransmission.appendChild(opt);
    });
}

function startApp() {
    elements.uploadView.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    populateTransmissionFilter();
    renderTracker();
    renderTable();
}

// ==============================================================
// 6. INICIALIZAÇÃO
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    initEvents();
});