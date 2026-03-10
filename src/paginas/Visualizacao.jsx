import { useMemo, useState, useEffect } from 'react'
import { Filter, SearchX, ChevronDown } from 'lucide-react'
import CardTransmissao from '../componentes/CardTransmissao.jsx'
import ModalDetalhes from '../componentes/ModalDetalhes.jsx'
import { useAnimatedCounter } from '../utils/useAnimatedCounter.js'

const PAGE_SIZE = 48

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
  const [page, setPage] = useState(1)

  // Filtragem memoizada — não recalcula em re-renders desnecessários
  const filtered = useMemo(() => processedData.filter(c =>
    (c.id.toLowerCase().includes(filters.transmissao) ||
     c.descricao.toLowerCase().includes(filters.transmissao)) &&
    (filters.cliente === '' || c.cliente  === filters.cliente) &&
    (filters.wbs     === '' || c.projetoWBS === filters.wbs)  &&
    (filters.linha   === '' || c.linhaOp  === filters.linha)  &&
    (filters.status  === 'all' || c.overallStatus === filters.status)
  ), [processedData, filters])

  // Reseta para página 1 sempre que os filtros mudarem
  useEffect(() => { setPage(1) }, [filtered])

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const hasMore  = filtered.length > visible.length
  const remaining = filtered.length - visible.length

  const total    = processedData.length
  const ongoing  = useMemo(() => processedData.filter(c => c.overallStatus === 'Ongoing').length,    [processedData])
  const delayed  = useMemo(() => processedData.filter(c => c.overallStatus === 'On delayed').length, [processedData])
  const complete = useMemo(() => processedData.filter(c => c.overallStatus === 'Complete').length,   [processedData])

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
            placeholder="Procurar transmissão / part number..."
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

        {/* KPIs com contadores animados */}
        <div className="stats-grid">
          <StatCard label="Total Transmissões" value={total}    color="blue"   active={filters.status === 'all'}        onClick={() => onFilterChange('status', 'all')} />
          <StatCard label="Em Andamento"        value={ongoing}  color="yellow" active={filters.status === 'Ongoing'}    onClick={() => onFilterChange('status', 'Ongoing')} />
          <StatCard label="Atrasados / Risco"   value={delayed}  color="red"    active={filters.status === 'On delayed'} onClick={() => onFilterChange('status', 'On delayed')} />
          <StatCard label="Concluídos (E2E)"    value={complete} color="green"  active={filters.status === 'Complete'}   onClick={() => onFilterChange('status', 'Complete')} />
        </div>

        {/* Grid de Cards */}
        <div className="cards-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <SearchX className="icon-xl" />
              <p style={{ fontWeight: 600 }}>Nenhum resultado para os filtros selecionados.</p>
              <p style={{ fontSize: '.8rem' }}>Tente remover um ou mais filtros.</p>
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {visible.map((card, index) => (
                  <CardTransmissao
                    key={card.id}
                    card={card}
                    onSelect={onSelectCard}
                    index={index}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-bar">
                  <span className="load-more-count">
                    Exibindo {visible.length} de {filtered.length} transmissões
                  </span>
                  <button
                    className="btn-load-more"
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronDown className="icon-sm" />
                    Carregar mais {Math.min(PAGE_SIZE, remaining)}
                  </button>
                </div>
              )}

              {!hasMore && filtered.length > PAGE_SIZE && (
                <div className="load-more-bar">
                  <span className="load-more-count">
                    Todas as {filtered.length} transmissões exibidas
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCard && (
        <ModalDetalhes card={selectedCard} onClose={onCloseModal} />
      )}
    </>
  )
}

function StatCard({ label, value, color, active, onClick }) {
  const animated = useAnimatedCounter(value)
  return (
    <div
      className={`stat-card ${color} ${active ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="stat-title">{label}</div>
      <div className="stat-value">{animated}</div>
    </div>
  )
}
