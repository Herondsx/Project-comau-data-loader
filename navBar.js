// navBar.js

/**
 * Lista de itens do menu lateral.
 * - `id`: Usado para seleção no DOM (event listeners).
 * - `dataTab`: Usado para navegação entre abas (Tracker/Table).
 * - `extraClass`: Classes CSS adicionais (ex: 'mt-auto' para alinhar ao fundo).
 * - `active`: Define se o item começa ativo.
 * - `icon`: O SVG completo do ícone.
 */
export const menuItems = [
  {
      label: "Tracker",
      dataTab: "tracker",
      title: "Tracker Dashboard",
      active: true,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
  },
  {
      label: "Materiais",
      dataTab: "table",
      title: "Lista de Materiais",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`
  },
  {
      label: "Novo Projeto",
      id: "btn-new-project",
      title: "Novo Projeto",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
  },
  {
      label: "Sair",
      id: "btn-logout",
      title: "Sair",
      extraClass: "mt-auto", // Importante para jogar o botão para o final
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
  }
];

/**
* Função que gera o HTML e insere no elemento pai (sidebar).
* Deve ser chamada ANTES de inicializar os eventos no script.js.
*/
export function renderSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Mantém a logo (primeiro filho) se ela já estiver lá, ou limpa tudo exceto a logo
  const logo = container.querySelector('.logo-responsivo-inicio');
  container.innerHTML = '';
  if (logo) container.appendChild(logo);

  menuItems.forEach(item => {
      const div = document.createElement('div');
      
      // Classes padrão + extras (active, mt-auto)
      let classes = 'sidebar-icon';
      if (item.active) classes += ' active';
      if (item.extraClass) classes += ` ${item.extraClass}`;
      div.className = classes;

      // Atributos HTML
      div.title = item.title;
      if (item.id) div.id = item.id;
      if (item.dataTab) div.setAttribute('data-tab', item.dataTab);

      // Conteúdo interno (SVG + Label)
      div.innerHTML = `
          ${item.icon}
          <span class="sidebar-label">${item.label}</span>
      `;

      container.appendChild(div);
  });
} 