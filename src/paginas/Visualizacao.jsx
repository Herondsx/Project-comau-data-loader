import { Filter, SearchX } from 'lucide-react'
import CardTransmissao from '../componentes/CardTransmissao.jsx'
import ModalDetalhes from '../componentes/ModalDetalhes.jsx'

/**
 * Dashboard principal: filtros, KPIs, grid de cards e modal de detalhes.
 */
export default function Visualizacao({
  processedData,
  filters,
  onFilterChange,
  uniqueClientes,
  uniqueWBS,
  uniqueLinhas,
  selectedCard,
  onSelectCard,
  onCloseModal
}) {
  // Filtragem
  const filtered = processedData.filter(c =>
    (c.id.toLowerCase().includes(filters.transmissao) ||
      c.descricao.toLowerCase().includes(filters.transmissao)) &&
    (filters.cliente === '' || c.cliente === filters.cliente) &&
    (filters.wbs === '' || c.projetoWBS === filters.wbs) &&
    (filters.linha === '' || c.linhaOp === filters.linha) &&
    (filters.status === 'all' || c.overallStatus === filters.status)
  )

  const total = processedData.length
  const ongoing = processedData.filter(c => c.overallStatus === 'Ongoing').length
  const delayed = processedData.filter(c => c.overallStatus === 'On delayed').length
  const complete = processedData.filter(c => c.overallStatus === 'Complete').length

  return (
    <>
      <div className="dashboard-workspace">

        {/* Barra de Filtros */}
        <div className="filters-bar">
          <div className="filter-label">
            <Filter className="icon-sm" /> Filtros
          </div>
          <input
            type="text"
            placeholder="Procurar Transmissão / Part Number..."
            className="filter-input"
            value={filters.transmissao}
            onChange={e => onFilterChange('transmissao', e.target.value.toLowerCase())}
          />
          <select
            className="filter-select"
            value={filters.cliente}
            onChange={e => onFilterChange('cliente', e.target.value)}
          >
            <option value="">Todos os Clientes</option>
            {Array.from(uniqueClientes).sort().map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.wbs}
            onChange={e => onFilterChange('wbs', e.target.value)}
          >
            <option value="">Todos os Projetos WBS</option>
            {Array.from(uniqueWBS).sort().map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.linha}
            onChange={e => onFilterChange('linha', e.target.value)}
          >
            <option value="">Todas as Linhas / OP</option>
            {Array.from(uniqueLinhas).sort().map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* KPIs */}
        <div className="stats-grid">
          <StatCard
            label="Total Transmissões"
            value={total}
            color="blue"
            active={filters.status === 'all'}
            onClick={() => onFilterChange('status', 'all')}
          />
          <StatCard
            label="Em Andamento"
            value={ongoing}
            color="yellow"
            active={filters.status === 'Ongoing'}
            onClick={() => onFilterChange('status', 'Ongoing')}
          />
          <StatCard
            label="Atrasados / Risco"
            value={delayed}
            color="red"
            active={filters.status === 'On delayed'}
            onClick={() => onFilterChange('status', 'On delayed')}
          />
          <StatCard
            label="Concluídos (E2E)"
            value={complete}
            color="green"
            active={filters.status === 'Complete'}
            onClick={() => onFilterChange('status', 'Complete')}
          />
        </div>

        {/* Grid de Cards */}
        <div className="cards-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <SearchX className="icon-xl" style={{ marginBottom: '1rem' }} />
              <p>Nenhum resultado para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filtered.map(card => (
                <CardTransmissao key={card.id} card={card} onSelect={onSelectCard} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedCard && (
        <ModalDetalhes card={selectedCard} onClose={onCloseModal} />
      )}
    </>
  )
}

function StatCard({ label, value, color, active, onClick }) {
  return (
    <div
      className={`stat-card ${color} ${active ? 'selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="stat-title">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
