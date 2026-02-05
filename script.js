/**
 * ============================================================================
 * SIV-SITE - Sistema de Integração e Visualização de Projetos
 * Comau - Departamento de SITE (Instalações)
 * ============================================================================
 *
 * Este arquivo contém toda a lógica de interface do sistema SIV-SITE.
 * O sistema processa arquivos Excel (.xlsx/.xlsm) e organiza dados de
 * montagem em uma estrutura hierárquica:
 *
 *   Linhas de Montagem → Transmissões (IDs) → Lista de Materiais (BOM)
 *
 * NOTA: Esta é uma versão de PREVIEW ESTÁTICA. As funcionalidades de
 * processamento real de arquivos não estão implementadas.
 *
 * @author Natan Guimarães dos Santos
 * @author Heron de Souza
 * @version 1.0.0 (MVP)
 *
 * ============================================================================
 * ÍNDICE DO ARQUIVO:
 * ============================================================================
 * 1. DADOS MOCKADOS (Mock Data)
 * 2. ELEMENTOS DO DOM (DOM Elements)
 * 3. ESTADO DA APLICAÇÃO (Application State)
 * 4. FUNÇÕES DE UPLOAD (Upload Functions)
 * 5. FUNÇÕES DE NAVEGAÇÃO (Navigation Functions)
 * 6. FUNÇÕES DO DASHBOARD (Dashboard Functions)
 * 7. FUNÇÕES DA ÁRVORE HIERÁRQUICA (Hierarchy Tree Functions)
 * 8. FUNÇÕES DA TABELA (Table Functions)
 * 9. FUNÇÕES DE EXPORTAÇÃO (Export Functions)
 * 10. UTILITÁRIOS (Utilities)
 * 11. INICIALIZAÇÃO (Initialization)
 * ============================================================================
 */


/* ============================================================================
   1. DADOS MOCKADOS (Mock Data)
   ============================================================================
   Dados simulados que representam a estrutura hierárquica de um projeto de
   montagem industrial. Em produção, estes dados viriam do processamento
   dos arquivos Excel importados.
   ============================================================================ */

/**
 * Estrutura hierárquica do projeto mockado
 * Representa: Linhas de Montagem → Transmissões → Materiais (BOM)
 *
 * @type {Array<Object>}
 * @property {string} id - Identificador único da linha
 * @property {string} name - Nome descritivo da linha de montagem
 * @property {string} code - Código interno da linha
 * @property {Array<Object>} transmissions - Lista de transmissões/IDs associados
 */
const MOCK_PROJECT_DATA = {
    projectName: 'Linha Body Shop 2024',
    processedAt: new Date().toISOString(),

    // Estrutura hierárquica principal
    lines: [
        {
            id: 'LINE-001',
            name: 'Linha de Montagem Principal',
            code: 'LMP-001',
            description: 'Linha principal de soldagem do chassi',
            transmissions: [
                {
                    id: 'TRANS-001',
                    name: 'Transmissão Frontal',
                    code: 'TF-2024-001',
                    materials: [
                        { id: 'MAT-001', code: '7891234567890', description: 'Parafuso Sextavado M10x30', qty: 48, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-002', code: '7891234567891', description: 'Porca Travante M10', qty: 48, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-003', code: '7891234567892', description: 'Arruela Lisa M10', qty: 96, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-004', code: '7891234567893', description: 'Suporte Fixação Frontal', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-005', code: '7891234567894', description: 'Cabo Elétrico 2.5mm²', qty: 25, unit: 'M', status: 'pendente' },
                    ]
                },
                {
                    id: 'TRANS-002',
                    name: 'Transmissão Central',
                    code: 'TC-2024-001',
                    materials: [
                        { id: 'MAT-006', code: '7891234567895', description: 'Viga Estrutural 100x50', qty: 8, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-007', code: '7891234567896', description: 'Chapa Aço 3mm', qty: 12, unit: 'M²', status: 'vinculado' },
                        { id: 'MAT-008', code: '7891234567897', description: 'Perfil Alumínio 40x40', qty: 30, unit: 'M', status: 'vinculado' },
                        { id: 'MAT-009', code: '7891234567898', description: 'Motor Elétrico 2CV', qty: 2, unit: 'UN', status: 'vinculado' },
                    ]
                },
                {
                    id: 'TRANS-003',
                    name: 'Transmissão Traseira',
                    code: 'TT-2024-001',
                    materials: [
                        { id: 'MAT-010', code: '7891234567899', description: 'Rolamento 6205', qty: 16, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-011', code: '7891234567900', description: 'Correia Dentada HTD 8M', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-012', code: '7891234567901', description: 'Polia HTD 8M 32 Dentes', qty: 8, unit: 'UN', status: 'erro' },
                    ]
                },
                {
                    id: 'TRANS-004',
                    name: 'Transmissão Auxiliar A',
                    code: 'TA-2024-001',
                    materials: [
                        { id: 'MAT-013', code: '7891234567902', description: 'Sensor Indutivo M18', qty: 6, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-014', code: '7891234567903', description: 'Cabo Sensor 5m', qty: 6, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-015', code: '7891234567904', description: 'Conector M12 4 Pinos', qty: 12, unit: 'UN', status: 'vinculado' },
                    ]
                }
            ]
        },
        {
            id: 'LINE-002',
            name: 'Linha de Acabamento',
            code: 'LAC-001',
            description: 'Linha de acabamento e pintura',
            transmissions: [
                {
                    id: 'TRANS-005',
                    name: 'Estação de Pintura 1',
                    code: 'EP-2024-001',
                    materials: [
                        { id: 'MAT-016', code: '7891234567905', description: 'Pistola Pintura HVLP', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-017', code: '7891234567906', description: 'Mangueira Ar 1/4"', qty: 20, unit: 'M', status: 'vinculado' },
                        { id: 'MAT-018', code: '7891234567907', description: 'Filtro Ar Comprimido', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-019', code: '7891234567908', description: 'Regulador Pressão', qty: 2, unit: 'UN', status: 'pendente' },
                    ]
                },
                {
                    id: 'TRANS-006',
                    name: 'Estação de Pintura 2',
                    code: 'EP-2024-002',
                    materials: [
                        { id: 'MAT-020', code: '7891234567909', description: 'Cabine Pintura Móvel', qty: 1, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-021', code: '7891234567910', description: 'Exaustor Industrial', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-022', code: '7891234567911', description: 'Duto Flexível 200mm', qty: 15, unit: 'M', status: 'vinculado' },
                    ]
                },
                {
                    id: 'TRANS-007',
                    name: 'Estação de Secagem',
                    code: 'ES-2024-001',
                    materials: [
                        { id: 'MAT-023', code: '7891234567912', description: 'Lâmpada Infravermelho', qty: 24, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-024', code: '7891234567913', description: 'Refletor Parabólico', qty: 24, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-025', code: '7891234567914', description: 'Termostato Digital', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-026', code: '7891234567915', description: 'Sensor Temperatura PT100', qty: 8, unit: 'UN', status: 'pendente' },
                    ]
                },
                {
                    id: 'TRANS-008',
                    name: 'Inspeção Visual',
                    code: 'IV-2024-001',
                    materials: [
                        { id: 'MAT-027', code: '7891234567916', description: 'Luminária LED 40W', qty: 16, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-028', code: '7891234567917', description: 'Espelho Inspeção', qty: 4, unit: 'UN', status: 'vinculado' },
                    ]
                }
            ]
        },
        {
            id: 'LINE-003',
            name: 'Linha de Testes',
            code: 'LTS-001',
            description: 'Linha de testes e validação final',
            transmissions: [
                {
                    id: 'TRANS-009',
                    name: 'Estação de Teste Elétrico',
                    code: 'ETE-2024-001',
                    materials: [
                        { id: 'MAT-029', code: '7891234567918', description: 'Multímetro Digital', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-030', code: '7891234567919', description: 'Fonte Alimentação 24V', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-031', code: '7891234567920', description: 'Osciloscópio 100MHz', qty: 1, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-032', code: '7891234567921', description: 'Ponta Prova Kit', qty: 4, unit: 'UN', status: 'vinculado' },
                    ]
                },
                {
                    id: 'TRANS-010',
                    name: 'Estação de Teste Mecânico',
                    code: 'ETM-2024-001',
                    materials: [
                        { id: 'MAT-033', code: '7891234567922', description: 'Torquímetro Digital', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-034', code: '7891234567923', description: 'Calibrador Folga', qty: 4, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-035', code: '7891234567924', description: 'Relógio Comparador', qty: 2, unit: 'UN', status: 'pendente' },
                    ]
                },
                {
                    id: 'TRANS-011',
                    name: 'Estação de Teste Funcional',
                    code: 'ETF-2024-001',
                    materials: [
                        { id: 'MAT-036', code: '7891234567925', description: 'CLP Siemens S7-1200', qty: 1, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-037', code: '7891234567926', description: 'IHM 7" Touch', qty: 1, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-038', code: '7891234567927', description: 'Módulo I/O Digital', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-039', code: '7891234567928', description: 'Cabo Profinet 5m', qty: 4, unit: 'UN', status: 'vinculado' },
                    ]
                },
                {
                    id: 'TRANS-012',
                    name: 'Liberação Final',
                    code: 'LF-2024-001',
                    materials: [
                        { id: 'MAT-040', code: '7891234567929', description: 'Etiqueta QR Code', qty: 500, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-041', code: '7891234567930', description: 'Leitor QR Code', qty: 2, unit: 'UN', status: 'vinculado' },
                        { id: 'MAT-042', code: '7891234567931', description: 'Impressora Etiquetas', qty: 1, unit: 'UN', status: 'erro' },
                    ]
                }
            ]
        }
    ]
};

/**
 * Calcula estatísticas do projeto a partir dos dados mockados
 *
 * @returns {Object} Objeto contendo as estatísticas calculadas
 */
function calculateProjectStats() {
    const stats = {
        totalLines: MOCK_PROJECT_DATA.lines.length,
        totalTransmissions: 0,
        totalMaterials: 0,
        totalLinks: 0,
        linkedCount: 0,
        pendingCount: 0,
        errorCount: 0
    };

    MOCK_PROJECT_DATA.lines.forEach(line => {
        stats.totalTransmissions += line.transmissions.length;

        line.transmissions.forEach(trans => {
            stats.totalMaterials += trans.materials.length;

            trans.materials.forEach(mat => {
                stats.totalLinks++;
                if (mat.status === 'vinculado') stats.linkedCount++;
                else if (mat.status === 'pendente') stats.pendingCount++;
                else if (mat.status === 'erro') stats.errorCount++;
            });
        });
    });

    return stats;
}


/* ============================================================================
   2. ELEMENTOS DO DOM (DOM Elements)
   ============================================================================
   Referências aos elementos HTML utilizados pelo JavaScript.
   Organizados por seção da interface para facilitar manutenção.
   ============================================================================ */

/**
 * Objeto contendo todas as referências aos elementos do DOM
 * Carregado após o DOMContentLoaded para garantir que os elementos existam
 *
 * @type {Object}
 */
let elements = {};

/**
 * Inicializa as referências aos elementos do DOM
 * Deve ser chamada após o carregamento completo do documento
 */
function initDOMElements() {
    elements = {
        // === Tela de Upload ===
        uploadView: document.getElementById('upload-view'),
        dropzone: document.getElementById('dropzone'),
        dropzoneContent: document.getElementById('dropzone-content'),
        dropzoneUploading: document.getElementById('dropzone-uploading'),
        uploadProgress: document.getElementById('upload-progress'),
        uploadStatusTitle: document.getElementById('upload-status-title'),
        uploadStatusText: document.getElementById('upload-status-text'),
        uploadSteps: document.querySelectorAll('.upload-steps .step'),

        // === Layout Principal ===
        mainApp: document.getElementById('main-app'),
        sidebar: document.getElementById('sidebar'),
        toggleSidebar: document.getElementById('toggle-sidebar'),
        logoutBtn: document.getElementById('logout-btn'),
        navItems: document.querySelectorAll('.nav-item[data-tab]'),
        activeProjectName: document.getElementById('active-project-name'),

        // === Header ===
        pageTitle: document.getElementById('page-title'),
        pageBreadcrumb: document.getElementById('page-breadcrumb'),
        headerLinesCount: document.getElementById('header-lines-count'),
        headerTransmissionsCount: document.getElementById('header-transmissions-count'),

        // === Views de Conteúdo ===
        dashboardView: document.getElementById('dashboard-view'),
        hierarchyView: document.getElementById('hierarchy-view'),
        tableView: document.getElementById('table-view'),
        exportView: document.getElementById('export-view'),

        // === Dashboard ===
        totalLines: document.getElementById('total-lines'),
        totalTransmissions: document.getElementById('total-transmissions'),
        totalBomItems: document.getElementById('total-bom-items'),
        totalLinks: document.getElementById('total-links'),
        linesChart: document.getElementById('lines-chart'),
        notificationBtnAction: document.querySelector('.notification-btn-action'),

        // === Árvore Hierárquica ===
        hierarchyTree: document.getElementById('hierarchy-tree'),
        treeSearchInput: document.getElementById('tree-search-input'),
        expandAllBtn: document.getElementById('expand-all'),
        collapseAllBtn: document.getElementById('collapse-all'),
        detailPanel: document.getElementById('detail-panel'),
        detailTitle: document.getElementById('detail-title'),
        detailContent: document.getElementById('detail-content'),
        closeDetailBtn: document.getElementById('close-detail'),

        // === Tabela de Materiais ===
        searchInput: document.getElementById('search-input'),
        filterLine: document.getElementById('filter-line'),
        filterTransmission: document.getElementById('filter-transmission'),
        tableBody: document.getElementById('table-body'),
        paginationInfo: document.getElementById('pagination-info'),
        pageNumbers: document.getElementById('page-numbers'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),

        // === Exportação ===
        exportLines: document.getElementById('export-lines'),
        exportTransmissions: document.getElementById('export-transmissions'),
        exportItems: document.getElementById('export-items'),
        exportLinks: document.getElementById('export-links')
    };
}


/* ============================================================================
   3. ESTADO DA APLICAÇÃO (Application State)
   ============================================================================
   Variáveis que controlam o estado atual da interface.
   ============================================================================ */

/**
 * Estado global da aplicação
 *
 * @type {Object}
 * @property {boolean} hasFile - Indica se um arquivo foi carregado
 * @property {string} activeTab - Aba atualmente ativa
 * @property {boolean} sidebarOpen - Estado da sidebar (aberta/fechada)
 * @property {string} searchFilter - Filtro de busca atual
 * @property {number} currentPage - Página atual da tabela
 * @property {number} itemsPerPage - Itens por página na tabela
 * @property {Object|null} selectedNode - Nó selecionado na árvore
 */
const state = {
    hasFile: false,
    activeTab: 'dashboard',
    sidebarOpen: true,
    searchFilter: '',
    lineFilter: '',
    transmissionFilter: '',
    currentPage: 1,
    itemsPerPage: 20,
    selectedNode: null,
    expandedNodes: new Set()
};


/* ============================================================================
   4. FUNÇÕES DE UPLOAD (Upload Functions)
   ============================================================================
   Funções relacionadas à tela de upload e simulação do processamento
   de arquivos Excel.
   ============================================================================ */

/**
 * Inicializa os eventos da área de upload (dropzone)
 * Configura drag & drop e clique para selecionar arquivo
 */
function initUpload() {
    const { dropzone } = elements;

    // Evento: Arquivo sendo arrastado sobre a área
    dropzone.addEventListener('dragover', handleDragOver);

    // Evento: Arquivo saiu da área de arraste
    dropzone.addEventListener('dragleave', handleDragLeave);

    // Evento: Arquivo solto na área
    dropzone.addEventListener('drop', handleDrop);

    // Evento: Clique na área de upload
    dropzone.addEventListener('click', handleDropzoneClick);
}

/**
 * Handler para evento dragover
 * Adiciona estilo visual quando arquivo está sobre a área
 *
 * @param {DragEvent} e - Evento de drag
 */
function handleDragOver(e) {
    e.preventDefault();
    elements.dropzone.classList.add('dragging');
}

/**
 * Handler para evento dragleave
 * Remove estilo visual quando arquivo sai da área
 */
function handleDragLeave() {
    elements.dropzone.classList.remove('dragging');
}

/**
 * Handler para evento drop
 * Inicia simulação de upload quando arquivo é solto
 *
 * @param {DragEvent} e - Evento de drop
 */
function handleDrop(e) {
    e.preventDefault();
    elements.dropzone.classList.remove('dragging');
    startUploadSimulation();
}

/**
 * Handler para clique na dropzone
 * Inicia simulação de upload (em produção, abriria seletor de arquivo)
 */
function handleDropzoneClick() {
    startUploadSimulation();
}

/**
 * Inicia a simulação de upload e processamento do arquivo
 * Em produção, aqui seria feito o upload real e processamento ETL
 */
function startUploadSimulation() {
    const { dropzoneContent, dropzoneUploading, uploadProgress, uploadSteps } = elements;

    // Alterna para estado de upload
    dropzoneContent.classList.add('hidden');
    dropzoneUploading.classList.remove('hidden');

    let progress = 0;
    let currentStep = 0;

    // Mensagens para cada etapa do processamento
    const stepMessages = [
        { title: 'Validando', text: 'Verificando formato do arquivo...' },
        { title: 'Normalizando', text: 'Organizando colunas e dados...' },
        { title: 'Vinculando', text: 'Criando relacionamentos hierárquicos...' }
    ];

    // Atualiza step visual
    const updateStep = (stepIndex) => {
        uploadSteps.forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (i < stepIndex) step.classList.add('completed');
            if (i === stepIndex) step.classList.add('active');
        });

        if (stepIndex < stepMessages.length) {
            elements.uploadStatusTitle.textContent = stepMessages[stepIndex].title;
            elements.uploadStatusText.textContent = stepMessages[stepIndex].text;
        }
    };

    // Simula progresso do upload
    const interval = setInterval(() => {
        progress += Math.random() * 6;

        // Atualiza step baseado no progresso
        const newStep = Math.floor(progress / 33);
        if (newStep !== currentStep && newStep < 3) {
            currentStep = newStep;
            updateStep(currentStep);
        }

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            uploadSteps.forEach(step => step.classList.add('completed'));
            elements.uploadStatusTitle.textContent = 'Concluído';
            elements.uploadStatusText.textContent = 'Dados processados com sucesso!';

            // Transição para a tela principal
            setTimeout(completeUpload, 800);
        }

        uploadProgress.textContent = `${Math.round(progress)}%`;
    }, 80);
}

/**
 * Finaliza o processo de upload e exibe a interface principal
 * Carrega todos os dados do dashboard e componentes
 */
function completeUpload() {
    state.hasFile = true;

    // Oculta tela de upload, exibe app principal
    elements.uploadView.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');

    // Carrega nome do projeto
    elements.activeProjectName.textContent = MOCK_PROJECT_DATA.projectName;

    // Inicializa todos os componentes
    updateDashboardStats();
    renderLinesChart();
    renderHierarchyTree();
    renderTable();
    populateFilters();
    updateExportSummary();
}


/* ============================================================================
   5. FUNÇÕES DE NAVEGAÇÃO (Navigation Functions)
   ============================================================================
   Funções para controle de navegação entre abas e sidebar.
   ============================================================================ */

/**
 * Inicializa eventos de navegação (tabs, sidebar, logout)
 */
function initNavigation() {
    // Navegação por tabs
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });

    // Toggle sidebar (mobile e desktop)
    elements.toggleSidebar.addEventListener('click', toggleSidebar);

    // Botão de novo projeto (logout)
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Botão de ação rápida no banner
    if (elements.notificationBtnAction) {
        elements.notificationBtnAction.addEventListener('click', () => {
            switchTab('hierarchy');
        });
    }
}

/**
 * Alterna para uma aba específica
 * Atualiza navegação, título e exibe a view correspondente
 *
 * @param {string} tab - Identificador da aba ('dashboard', 'hierarchy', 'table', 'export')
 */
function switchTab(tab) {
    state.activeTab = tab;

    // Atualiza estado ativo nos itens de navegação
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });

    // Configurações de cada aba
    const tabConfig = {
        dashboard: {
            title: 'Visão Geral',
            breadcrumb: 'Dashboard do Projeto'
        },
        hierarchy: {
            title: 'Árvore do Projeto',
            breadcrumb: 'Linhas → Transmissões → Materiais'
        },
        table: {
            title: 'Lista de Materiais',
            breadcrumb: 'BOM - Bill of Materials'
        },
        export: {
            title: 'Exportar Dados',
            breadcrumb: 'Opções de Exportação'
        }
    };

    // Atualiza título e breadcrumb
    const config = tabConfig[tab] || tabConfig.dashboard;
    elements.pageTitle.textContent = config.title;
    elements.pageBreadcrumb.textContent = config.breadcrumb;

    // Alterna visibilidade das views
    elements.dashboardView.classList.toggle('hidden', tab !== 'dashboard');
    elements.hierarchyView.classList.toggle('hidden', tab !== 'hierarchy');
    elements.tableView.classList.toggle('hidden', tab !== 'table');
    elements.exportView.classList.toggle('hidden', tab !== 'export');

    // Fecha painel de detalhes ao trocar de aba
    closeDetailPanel();
}

/**
 * Alterna estado da sidebar (expandida/recolhida)
 */
function toggleSidebar() {
    elements.sidebar.classList.toggle('collapsed');
    state.sidebarOpen = !state.sidebarOpen;
}

/**
 * Retorna à tela de upload (novo projeto)
 */
function handleLogout() {
    state.hasFile = false;
    state.activeTab = 'dashboard';
    state.currentPage = 1;
    state.searchFilter = '';
    state.selectedNode = null;
    state.expandedNodes.clear();

    // Reseta tela de upload
    elements.dropzoneContent.classList.remove('hidden');
    elements.dropzoneUploading.classList.add('hidden');
    elements.uploadProgress.textContent = '0%';
    elements.uploadSteps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    elements.uploadSteps[0]?.classList.add('active');

    // Volta para tela de upload
    elements.mainApp.classList.add('hidden');
    elements.uploadView.classList.remove('hidden');

    // Reseta navegação
    switchTab('dashboard');
}


/* ============================================================================
   6. FUNÇÕES DO DASHBOARD (Dashboard Functions)
   ============================================================================
   Funções para renderização e atualização do dashboard.
   ============================================================================ */

/**
 * Atualiza todas as estatísticas exibidas no dashboard
 */
function updateDashboardStats() {
    const stats = calculateProjectStats();

    // Cards de estatísticas
    elements.totalLines.textContent = stats.totalLines;
    elements.totalTransmissions.textContent = stats.totalTransmissions;
    elements.totalBomItems.textContent = stats.totalMaterials;
    elements.totalLinks.textContent = stats.totalLinks;

    // Header stats
    elements.headerLinesCount.textContent = stats.totalLines;
    elements.headerTransmissionsCount.textContent = stats.totalTransmissions;
}

/**
 * Renderiza o gráfico de barras horizontais (distribuição por linha)
 */
function renderLinesChart() {
    const container = elements.linesChart;
    if (!container) return;

    // Calcula dados por linha
    const linesData = MOCK_PROJECT_DATA.lines.map(line => {
        const materialCount = line.transmissions.reduce((acc, trans) =>
            acc + trans.materials.length, 0
        );
        return {
            name: line.name,
            transmissions: line.transmissions.length,
            materials: materialCount
        };
    });

    // Encontra o máximo para escala
    const maxMaterials = Math.max(...linesData.map(l => l.materials));

    // Renderiza HTML
    container.innerHTML = linesData.map(line => `
        <div class="h-bar-item">
            <div class="h-bar-header">
                <span class="h-bar-label">${line.name}</span>
                <span class="h-bar-value">${line.transmissions} trans. / ${line.materials} itens</span>
            </div>
            <div class="h-bar-track">
                <div class="h-bar-fill" style="width: ${(line.materials / maxMaterials) * 100}%"></div>
            </div>
        </div>
    `).join('');
}


/* ============================================================================
   7. FUNÇÕES DA ÁRVORE HIERÁRQUICA (Hierarchy Tree Functions)
   ============================================================================
   Funções para renderização e interação com a árvore de navegação.
   ============================================================================ */

/**
 * Inicializa eventos da árvore hierárquica
 */
function initHierarchyTree() {
    // Busca na árvore
    elements.treeSearchInput?.addEventListener('input', handleTreeSearch);

    // Botões expandir/recolher
    elements.expandAllBtn?.addEventListener('click', expandAllNodes);
    elements.collapseAllBtn?.addEventListener('click', collapseAllNodes);

    // Fechar painel de detalhes
    elements.closeDetailBtn?.addEventListener('click', closeDetailPanel);
}

/**
 * Renderiza a árvore hierárquica completa
 */
function renderHierarchyTree() {
    const container = elements.hierarchyTree;
    if (!container) return;

    container.innerHTML = MOCK_PROJECT_DATA.lines.map(line =>
        renderLineNode(line)
    ).join('');

    // Adiciona eventos aos nós
    container.querySelectorAll('.tree-node-header').forEach(header => {
        header.addEventListener('click', handleNodeClick);
    });
}

/**
 * Renderiza um nó de linha de montagem
 *
 * @param {Object} line - Dados da linha de montagem
 * @returns {string} HTML do nó
 */
function renderLineNode(line) {
    const isExpanded = state.expandedNodes.has(line.id);
    const materialCount = line.transmissions.reduce((acc, trans) =>
        acc + trans.materials.length, 0
    );

    return `
        <div class="tree-node ${isExpanded ? 'expanded' : ''}" data-id="${line.id}" data-type="line">
            <div class="tree-node-header">
                <span class="tree-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
                <span class="tree-node-icon line">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                </span>
                <span class="tree-node-label">${line.name}</span>
                <span class="tree-node-count">${line.transmissions.length} trans. / ${materialCount} itens</span>
            </div>
            <div class="tree-children">
                ${line.transmissions.map(trans => renderTransmissionNode(trans, line)).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza um nó de transmissão/ID
 *
 * @param {Object} trans - Dados da transmissão
 * @param {Object} parentLine - Linha pai
 * @returns {string} HTML do nó
 */
function renderTransmissionNode(trans, parentLine) {
    const isExpanded = state.expandedNodes.has(trans.id);

    return `
        <div class="tree-node ${isExpanded ? 'expanded' : ''}" data-id="${trans.id}" data-type="transmission" data-parent="${parentLine.id}">
            <div class="tree-node-header">
                <span class="tree-toggle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
                <span class="tree-node-icon transmission">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                        <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                        <rect x="9" y="15" width="6" height="6" rx="1"></rect>
                        <line x1="6" y1="9" x2="6" y2="12"></line>
                        <line x1="18" y1="9" x2="18" y2="12"></line>
                        <line x1="6" y1="12" x2="18" y2="12"></line>
                        <line x1="12" y1="12" x2="12" y2="15"></line>
                    </svg>
                </span>
                <span class="tree-node-label">${trans.name} (${trans.code})</span>
                <span class="tree-node-count">${trans.materials.length} itens</span>
            </div>
            <div class="tree-children">
                ${trans.materials.map(mat => renderMaterialNode(mat, trans)).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderiza um nó de material
 *
 * @param {Object} mat - Dados do material
 * @param {Object} parentTrans - Transmissão pai
 * @returns {string} HTML do nó
 */
function renderMaterialNode(mat, parentTrans) {
    const statusClass = `badge-${mat.status}`;

    return `
        <div class="tree-node" data-id="${mat.id}" data-type="material" data-parent="${parentTrans.id}">
            <div class="tree-node-header">
                <span class="tree-toggle" style="visibility: hidden;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
                <span class="tree-node-icon material">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                </span>
                <span class="tree-node-label">${mat.code} - ${mat.description}</span>
                <span class="badge ${statusClass}">${mat.status}</span>
            </div>
        </div>
    `;
}

/**
 * Handler para clique em um nó da árvore
 * Expande/recolhe nós com filhos ou exibe detalhes
 *
 * @param {Event} e - Evento de clique
 */
function handleNodeClick(e) {
    const header = e.currentTarget;
    const node = header.closest('.tree-node');
    const nodeId = node.dataset.id;
    const nodeType = node.dataset.type;

    // Toggle expand/collapse para nós com filhos
    if (nodeType !== 'material') {
        node.classList.toggle('expanded');

        if (node.classList.contains('expanded')) {
            state.expandedNodes.add(nodeId);
        } else {
            state.expandedNodes.delete(nodeId);
        }
    }

    // Atualiza seleção visual
    elements.hierarchyTree.querySelectorAll('.tree-node-header').forEach(h => {
        h.classList.remove('selected');
    });
    header.classList.add('selected');

    // Exibe detalhes
    showNodeDetails(nodeId, nodeType);
}

/**
 * Exibe o painel de detalhes para um nó selecionado
 *
 * @param {string} nodeId - ID do nó
 * @param {string} nodeType - Tipo do nó ('line', 'transmission', 'material')
 */
function showNodeDetails(nodeId, nodeType) {
    const panel = elements.detailPanel;
    const title = elements.detailTitle;
    const content = elements.detailContent;

    let data = null;
    let detailHTML = '';

    // Busca dados baseado no tipo
    if (nodeType === 'line') {
        data = MOCK_PROJECT_DATA.lines.find(l => l.id === nodeId);
        if (data) {
            const materialCount = data.transmissions.reduce((acc, t) => acc + t.materials.length, 0);
            detailHTML = `
                <div class="detail-section">
                    <h4>Informações da Linha</h4>
                    <div class="detail-row">
                        <span class="detail-label">Nome</span>
                        <span class="detail-value">${data.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Código</span>
                        <span class="detail-value">${data.code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Descrição</span>
                        <span class="detail-value">${data.description}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h4>Estatísticas</h4>
                    <div class="detail-row">
                        <span class="detail-label">Transmissões</span>
                        <span class="detail-value">${data.transmissions.length}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total de Materiais</span>
                        <span class="detail-value">${materialCount}</span>
                    </div>
                </div>
            `;
            title.textContent = `Linha: ${data.name}`;
        }
    } else if (nodeType === 'transmission') {
        MOCK_PROJECT_DATA.lines.forEach(line => {
            const found = line.transmissions.find(t => t.id === nodeId);
            if (found) data = { ...found, lineName: line.name };
        });
        if (data) {
            detailHTML = `
                <div class="detail-section">
                    <h4>Informações da Transmissão</h4>
                    <div class="detail-row">
                        <span class="detail-label">Nome</span>
                        <span class="detail-value">${data.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Código</span>
                        <span class="detail-value">${data.code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Linha</span>
                        <span class="detail-value">${data.lineName}</span>
                    </div>
                </div>
                <div class="detail-section">
                    <h4>Materiais</h4>
                    <div class="detail-row">
                        <span class="detail-label">Total de Itens</span>
                        <span class="detail-value">${data.materials.length}</span>
                    </div>
                </div>
            `;
            title.textContent = `Transmissão: ${data.code}`;
        }
    } else if (nodeType === 'material') {
        MOCK_PROJECT_DATA.lines.forEach(line => {
            line.transmissions.forEach(trans => {
                const found = trans.materials.find(m => m.id === nodeId);
                if (found) data = { ...found, transName: trans.name, lineName: line.name };
            });
        });
        if (data) {
            detailHTML = `
                <div class="detail-section">
                    <h4>Informações do Material</h4>
                    <div class="detail-row">
                        <span class="detail-label">Código</span>
                        <span class="detail-value">${data.code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Descrição</span>
                        <span class="detail-value">${data.description}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantidade</span>
                        <span class="detail-value">${data.qty} ${data.unit}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value"><span class="badge badge-${data.status}">${data.status}</span></span>
                    </div>
                </div>
                <div class="detail-section">
                    <h4>Localização</h4>
                    <div class="detail-row">
                        <span class="detail-label">Linha</span>
                        <span class="detail-value">${data.lineName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transmissão</span>
                        <span class="detail-value">${data.transName}</span>
                    </div>
                </div>
            `;
            title.textContent = `Material: ${data.code}`;
        }
    }

    content.innerHTML = detailHTML;
    panel.classList.remove('hidden');
}

/**
 * Fecha o painel de detalhes
 */
function closeDetailPanel() {
    elements.detailPanel?.classList.add('hidden');
    elements.hierarchyTree?.querySelectorAll('.tree-node-header').forEach(h => {
        h.classList.remove('selected');
    });
}

/**
 * Handler para busca na árvore
 *
 * @param {Event} e - Evento de input
 */
function handleTreeSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const nodes = elements.hierarchyTree.querySelectorAll('.tree-node');

    nodes.forEach(node => {
        const label = node.querySelector('.tree-node-label')?.textContent.toLowerCase() || '';
        const matches = label.includes(query);

        if (query === '') {
            node.style.display = '';
        } else {
            node.style.display = matches ? '' : 'none';
            if (matches) {
                // Expande pais se houver match
                let parent = node.parentElement?.closest('.tree-node');
                while (parent) {
                    parent.classList.add('expanded');
                    parent.style.display = '';
                    parent = parent.parentElement?.closest('.tree-node');
                }
            }
        }
    });
}

/**
 * Expande todos os nós da árvore
 */
function expandAllNodes() {
    elements.hierarchyTree?.querySelectorAll('.tree-node').forEach(node => {
        node.classList.add('expanded');
        state.expandedNodes.add(node.dataset.id);
    });
}

/**
 * Recolhe todos os nós da árvore
 */
function collapseAllNodes() {
    elements.hierarchyTree?.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('expanded');
    });
    state.expandedNodes.clear();
}


/* ============================================================================
   8. FUNÇÕES DA TABELA (Table Functions)
   ============================================================================
   Funções para renderização e interação com a tabela de materiais.
   ============================================================================ */

/**
 * Inicializa eventos da tabela
 */
function initTable() {
    // Busca
    elements.searchInput?.addEventListener('input', handleTableSearch);

    // Filtros
    elements.filterLine?.addEventListener('change', handleLineFilter);
    elements.filterTransmission?.addEventListener('change', handleTransmissionFilter);

    // Paginação
    elements.prevPageBtn?.addEventListener('click', goToPrevPage);
    elements.nextPageBtn?.addEventListener('click', goToNextPage);
}

/**
 * Obtém lista plana de todos os materiais com informações de hierarquia
 *
 * @returns {Array<Object>} Lista de materiais
 */
function getAllMaterials() {
    const materials = [];

    MOCK_PROJECT_DATA.lines.forEach(line => {
        line.transmissions.forEach(trans => {
            trans.materials.forEach(mat => {
                materials.push({
                    ...mat,
                    lineName: line.name,
                    lineId: line.id,
                    transName: trans.name,
                    transId: trans.id,
                    transCode: trans.code
                });
            });
        });
    });

    return materials;
}

/**
 * Filtra materiais baseado nos filtros ativos
 *
 * @returns {Array<Object>} Lista filtrada de materiais
 */
function getFilteredMaterials() {
    let materials = getAllMaterials();

    // Filtro de busca
    if (state.searchFilter) {
        const query = state.searchFilter.toLowerCase();
        materials = materials.filter(m =>
            m.code.toLowerCase().includes(query) ||
            m.description.toLowerCase().includes(query) ||
            m.lineName.toLowerCase().includes(query) ||
            m.transCode.toLowerCase().includes(query)
        );
    }

    // Filtro de linha
    if (state.lineFilter) {
        materials = materials.filter(m => m.lineId === state.lineFilter);
    }

    // Filtro de transmissão
    if (state.transmissionFilter) {
        materials = materials.filter(m => m.transId === state.transmissionFilter);
    }

    return materials;
}

/**
 * Renderiza a tabela de materiais
 */
function renderTable() {
    const materials = getFilteredMaterials();
    const totalItems = materials.length;
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);

    // Ajusta página se necessário
    if (state.currentPage > totalPages) {
        state.currentPage = Math.max(1, totalPages);
    }

    // Paginação
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageItems = materials.slice(startIndex, endIndex);

    // Renderiza linhas
    elements.tableBody.innerHTML = pageItems.map(mat => `
        <tr>
            <td>${mat.code}</td>
            <td>${mat.description}</td>
            <td>${mat.lineName}</td>
            <td>${mat.transCode}</td>
            <td class="text-right">${mat.qty}</td>
            <td>${mat.unit}</td>
            <td class="text-center">
                <span class="badge badge-${mat.status}">${mat.status}</span>
            </td>
        </tr>
    `).join('');

    // Atualiza informações de paginação
    const showingStart = totalItems > 0 ? startIndex + 1 : 0;
    const showingEnd = Math.min(endIndex, totalItems);
    elements.paginationInfo.textContent = `Mostrando ${showingStart}-${showingEnd} de ${totalItems} itens`;
    elements.pageNumbers.textContent = `${state.currentPage} / ${Math.max(1, totalPages)}`;

    // Estado dos botões de paginação
    elements.prevPageBtn.disabled = state.currentPage <= 1;
    elements.nextPageBtn.disabled = state.currentPage >= totalPages;
}

/**
 * Popula os filtros de linha e transmissão
 */
function populateFilters() {
    // Filtro de linhas
    elements.filterLine.innerHTML = '<option value="">Todas as Linhas</option>' +
        MOCK_PROJECT_DATA.lines.map(line =>
            `<option value="${line.id}">${line.name}</option>`
        ).join('');

    // Filtro de transmissões (inicialmente todas)
    updateTransmissionFilter();
}

/**
 * Atualiza opções do filtro de transmissão baseado na linha selecionada
 */
function updateTransmissionFilter() {
    let transmissions = [];

    if (state.lineFilter) {
        const line = MOCK_PROJECT_DATA.lines.find(l => l.id === state.lineFilter);
        if (line) {
            transmissions = line.transmissions;
        }
    } else {
        MOCK_PROJECT_DATA.lines.forEach(line => {
            transmissions = transmissions.concat(line.transmissions);
        });
    }

    elements.filterTransmission.innerHTML = '<option value="">Todas as Transmissões</option>' +
        transmissions.map(trans =>
            `<option value="${trans.id}">${trans.code} - ${trans.name}</option>`
        ).join('');
}

/**
 * Handler para busca na tabela
 *
 * @param {Event} e - Evento de input
 */
function handleTableSearch(e) {
    state.searchFilter = e.target.value.trim();
    state.currentPage = 1;
    renderTable();
}

/**
 * Handler para filtro de linha
 *
 * @param {Event} e - Evento de change
 */
function handleLineFilter(e) {
    state.lineFilter = e.target.value;
    state.transmissionFilter = '';
    state.currentPage = 1;
    updateTransmissionFilter();
    renderTable();
}

/**
 * Handler para filtro de transmissão
 *
 * @param {Event} e - Evento de change
 */
function handleTransmissionFilter(e) {
    state.transmissionFilter = e.target.value;
    state.currentPage = 1;
    renderTable();
}

/**
 * Navega para a página anterior
 */
function goToPrevPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
    }
}

/**
 * Navega para a próxima página
 */
function goToNextPage() {
    const materials = getFilteredMaterials();
    const totalPages = Math.ceil(materials.length / state.itemsPerPage);

    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderTable();
    }
}


/* ============================================================================
   9. FUNÇÕES DE EXPORTAÇÃO (Export Functions)
   ============================================================================
   Funções para a tela de exportação.
   Nota: Em produção, estas funções gerariam arquivos reais.
   ============================================================================ */

/**
 * Inicializa eventos da tela de exportação
 */
function initExport() {
    // Botões de exportação (simulação apenas)
    document.querySelectorAll('.btn-export-action').forEach(btn => {
        btn.addEventListener('click', handleExportClick);
    });
}

/**
 * Handler para clique em botão de exportação
 * Em produção, geraria o arquivo correspondente
 *
 * @param {Event} e - Evento de clique
 */
function handleExportClick(e) {
    const btnText = e.currentTarget.textContent.trim();
    alert(`Exportação "${btnText}" seria iniciada aqui.\n\nEsta é uma versão de preview estática.`);
}

/**
 * Atualiza o resumo de exportação com estatísticas
 */
function updateExportSummary() {
    const stats = calculateProjectStats();

    if (elements.exportLines) elements.exportLines.textContent = stats.totalLines;
    if (elements.exportTransmissions) elements.exportTransmissions.textContent = stats.totalTransmissions;
    if (elements.exportItems) elements.exportItems.textContent = stats.totalMaterials;
    if (elements.exportLinks) elements.exportLinks.textContent = stats.totalLinks;
}


/* ============================================================================
   10. UTILITÁRIOS (Utilities)
   ============================================================================
   Funções auxiliares utilizadas em todo o sistema.
   ============================================================================ */

/**
 * Formata data para exibição no padrão brasileiro
 *
 * @param {string} dateStr - Data em formato ISO
 * @returns {string} Data formatada (DD/MM/AAAA)
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Debounce - Limita a frequência de execução de uma função
 *
 * @param {Function} func - Função a ser limitada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


/* ============================================================================
   11. INICIALIZAÇÃO (Initialization)
   ============================================================================
   Função principal que inicializa todo o sistema.
   ============================================================================ */

/**
 * Inicializa a aplicação
 * Configura todos os elementos e eventos necessários
 */
function init() {
    // Carrega referências aos elementos do DOM
    initDOMElements();

    // Inicializa cada módulo
    initUpload();
    initNavigation();
    initHierarchyTree();
    initTable();
    initExport();

    console.log('SIV-SITE inicializado com sucesso.');
    console.log('Versão: 1.0.0 (MVP - Preview Estática)');
}

// Aguarda carregamento do DOM e inicializa
document.addEventListener('DOMContentLoaded', init);
