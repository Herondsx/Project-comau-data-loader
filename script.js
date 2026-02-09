/**
 * ============================================================================
 * SIV-SITE - Sistema de Integração e Visualização de Projetos
 * Módulo: Tracker Dashboard (PowerPoint Style)
 * ============================================================================
 * * Este arquivo modulariza a lógica de controle da interface, processamento
 * de dados e alternância de views.
 */

// ==============================================================
// 1. ESTADO E DADOS MOCKADOS
// ==============================================================

const state = {
    currentView: 'tracker', // 'tracker' ou 'table'
    filters: {
        line: 'AUFBAU',
        station: 'all'
    },
    data: null, // Dados processados para exibição visual
    rawExcelData: [] // Dados brutos importados do Excel
};

// Dados simulados baseados no PPT do usuário (Fallback)
const MOCK_DATA = {
    "OP20": [
        { id: "XXXX-XXXX-0003-2026", phases: generatePhases("04/02", "04/02", "04/02", "08/02", "10/02") },
        { id: "XXXX-XXXX-0004-2026", phases: generatePhases("04/02", "04/02", "04/02", "04/02", "04/02") },
        { id: "XXXX-XXXX-0005-2026", phases: generatePhases("04/02", "04/02", "04/02", "08/02", "04/02") }
    ],
    "OP30": [
        { id: "XXXX-XXXX-0006-2026", phases: generatePhases("15/05", "15/05", "15/05", "15/05", "15/05") },
        { id: "XXXX-XXXX-0007-2026", phases: generatePhases("15/05", "20/05", "15/05", "15/05", "15/05") }
    ],
    "OP40": [
        { id: "XXXX-XXXX-0008-2026", phases: generatePhases("15/05", "15/05", "15/05", "15/05", "15/05") }
    ],
    "OP10": [
        { id: "XXXX-XXXX-0001-2026", phases: generatePhases("04/02", "08/02", "04/02", "04/02", "04/02") },
        { id: "XXXX-XXXX-0002-2026", phases: generatePhases("04/02", "04/02", "04/02", "04/02", "10/02") }
    ]
};

// ==============================================================
// 2. REFERÊNCIAS DO DOM
// ==============================================================
let elements = {};

function initDOMElements() {
    elements = {
        // Views
        uploadView: document.getElementById('upload-view'),
        mainApp: document.getElementById('main-app'),
        viewTracker: document.getElementById('view-tracker'),
        viewTable: document.getElementById('view-table'),
        
        // Containers de Conteúdo
        trackerContent: document.getElementById('tracker-content-area'),
        tableBody: document.getElementById('table-body'),
        
        // Botões de Ação
        btnBrowse: document.getElementById('btn-browse'),
        fileInput: document.getElementById('file-input'),
        dropzone: document.getElementById('dropzone'),
        btnDemo: document.getElementById('btn-demo'),
        btnLogout: document.getElementById('btn-logout'),
        
        // Navegação Sidebar
        navItems: document.querySelectorAll('.sidebar-icon[data-tab]'),
        
        // Filtros (Novos IDs do redesign)
        filterProject: document.getElementById('filter-project-tracker'),
        filterLine: document.getElementById('filter-line-tracker'),
        filterStation: document.getElementById('filter-station-tracker'),
        filterTransmission: document.getElementById('filter-transmission-tracker')
    };
}

// ==============================================================
// 3. FUNÇÕES AUXILIARES DE DADOS
// ==============================================================

/** Gera estrutura de fases com status automático */
function generatePhases(engDate, purDate, comDate, constDate, manDate) {
    return [
        { name: "Engineering", plan: "04/02", actual: engDate || "04/02" },
        { name: "Purchasing", plan: "04/02", actual: purDate || "04/02" },
        { name: "Commercial", plan: "04/02", actual: comDate || "04/02" },
        { name: "Constructives", plan: "04/02", actual: constDate || "04/02" },
        { name: "Manufacturing", plan: "04/02", actual: manDate || "04/02" },
        { name: "Delivery", plan: "04/02", actual: "04/02" }
    ];
}

/** Determina classe CSS do status baseado em datas */
function determineStatusClass(plan, actual) {
    if (plan === actual) return 'dot-green';
    if (actual > plan) return 'dot-red'; 
    return 'dot-blue';
}

// ==============================================================
// 4. LÓGICA DE RENDERIZAÇÃO
// ==============================================================

/** Renderiza a visualização de Cards (Tracker) */
function renderTracker() {
    const container = elements.trackerContent;
    container.innerHTML = '';
    
    // Obtém valores dos filtros
    const stationFilter = elements.filterStation ? elements.filterStation.value : 'all';
    const transFilter = elements.filterTransmission ? elements.filterTransmission.value : 'all';

    // Usa MOCK_DATA se state.data for null, para garantir que algo apareça
    const dataToRender = state.data || MOCK_DATA;

    for (const [station, items] of Object.entries(dataToRender)) {
        if (stationFilter !== 'all' && station !== stationFilter) continue;
        
        const filteredItems = items.filter(item => {
            if (transFilter === 'all') return true;
            return item.id === transFilter;
        });

        if (filteredItems.length === 0) continue;

        // Criação da Seção
        const section = document.createElement('div');
        section.className = 'station-section';
        
        const title = document.createElement('div');
        title.className = 'station-title';
        title.textContent = station;
        section.appendChild(title);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container';

        // Criação dos Cards
        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'tracker-card';
            
            const header = document.createElement('div');
            header.className = 'card-header';
            header.innerHTML = `
                <span>${item.id}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2">
                    <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                </svg>
            `;
            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'card-body';
            const grid = document.createElement('div');
            grid.className = 'phase-grid';

            grid.innerHTML = `
                <div class="grid-header text-left">Phase</div>
                <div class="grid-header">Plan</div>
                <div class="grid-header">Actual</div>
                <div class="grid-header">Status</div>
            `;

            item.phases.forEach(phase => {
                const statusClass = determineStatusClass(phase.plan, phase.actual);
                grid.innerHTML += `
                    <div class="phase-row">
                        <div class="phase-name">${phase.name}</div>
                        <div class="phase-date">${phase.plan}</div>
                        <div class="phase-date">${phase.actual}</div>
                        <div class="phase-status"><span class="status-dot ${statusClass}"></span></div>
                    </div>
                `;
            });

            body.appendChild(grid);
            card.appendChild(body);
            cardsContainer.appendChild(card);
        });

        section.appendChild(cardsContainer);
        container.appendChild(section);
    }
}

/** Renderiza a visualização em Tabela */
function renderTable() {
    const tbody = elements.tableBody;
    tbody.innerHTML = '';
    
    const dataToRender = state.data || MOCK_DATA;

    for (const [station, items] of Object.entries(dataToRender)) {
        items.forEach(item => {
            item.phases.forEach(phase => {
                const row = document.createElement('tr');
                const statusDot = determineStatusClass(phase.plan, phase.actual);
                
                let statusText = statusDot.includes('green') ? 'OK' : 
                                 (statusDot.includes('red') ? 'Atrasado' : 'Em Andamento');
                
                row.innerHTML = `
                    <td>${station}</td>
                    <td style="font-family: 'Roboto Mono', monospace; font-size:12px;">${item.id}</td>
                    <td>${phase.name}</td>
                    <td>${phase.plan}</td>
                    <td>${phase.actual}</td>
                    <td>
                        <span class="status-dot ${statusDot}" style="margin-right:5px; vertical-align:middle;"></span> 
                        ${statusText}
                    </td>
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

    if(tabName === 'tracker') {
        elements.viewTracker.classList.remove('hidden');
    } else if (tabName === 'table') {
        elements.viewTable.classList.remove('hidden');
    }
}

function initEvents() {
    // 1. Botão Buscar Arquivo - Abre o seletor nativo
    elements.btnBrowse.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // 2. Clique na Dropzone também abre o seletor
    elements.dropzone.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // 3. EVENTO DE LEITURA DO ARQUIVO (IMPLEMENTAÇÃO SOLICITADA)
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        // Feedback de carregamento no botão
        elements.btnBrowse.textContent = "Lendo arquivo...";
        
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                // Leitura usando a biblioteca SheetJS (XLSX)
                const workbook = XLSX.read(data, { type: 'array' });

                // Pega a primeira aba
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Converte para JSON (Array de Arrays)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Salva os dados brutos no estado global
                state.rawExcelData = jsonData;

                // Prepara a mensagem de saída para o alert
                let output = "Dados encontrados (Visualização das primeiras 10 linhas):\n\n";
                
                // Limita a exibição para não travar a tela se o arquivo for grande
                const previewLimit = 10;
                jsonData.slice(0, previewLimit).forEach(row => {
                    output += row.join(" | ") + "\n";
                });

                if (jsonData.length > previewLimit) {
                    output += `\n... e mais ${jsonData.length - previewLimit} linhas.`;
                }

                // Exibe o alerta conforme pedido
                alert(output);

                // Carrega o app principal
                // (Mantemos o MOCK_DATA para a visualização gráfica enquanto o parser real não é feito)
                state.data = MOCK_DATA;
                startApp();

            } catch (error) {
                console.error("Erro na leitura do Excel:", error);
                alert("Erro ao ler o arquivo. Verifique se é um Excel válido.");
                elements.btnBrowse.textContent = "Buscar Arquivo";
            }
        };

        // Inicia a leitura do arquivo como ArrayBuffer
        reader.readAsArrayBuffer(file);
    });

    // Botão Demo
    elements.btnDemo.addEventListener('click', () => {
        state.data = MOCK_DATA;
        startApp();
    });

    // Navegação Sidebar
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // Logout
    elements.btnLogout.addEventListener('click', () => location.reload());

    // Filtros
    if (elements.filterStation) {
        elements.filterStation.addEventListener('change', () => {
            renderTracker();
        });
    }
    
    if (elements.filterTransmission) {
        elements.filterTransmission.addEventListener('change', () => {
            renderTracker();
        });
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
        opt.value = id;
        opt.textContent = id;
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
    console.log('SIV-SITE Tracker: Inicializado com sucesso.');
});