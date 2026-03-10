import { Factory, Flag, Search } from 'lucide-react'
import { getTheme, formatDate } from '../utils/formatadores.js'

const STAGES_MAP = [
  { k: 'Engineering', l: 'ENG' },
  { k: 'Purchasing', l: 'PUR' },
  { k: 'Commercial', l: 'COM' },
  { k: 'Constructives', l: 'MFG Ext' },
  { k: 'Manufacturing', l: 'MFG Int' },
  { k: 'Delivery', l: 'DEL' }
]

export default function CardTransmissao({ card, onSelect, index = 0 }) {
  const theme = getTheme(card.overallStatus)
  const { Icon: StatusIcon } = theme

  return (
    <div
      className={`card ${theme.b}`}
      onClick={() => onSelect(card)}
      style={{ animationDelay: `${Math.min(index * 55, 550)}ms` }}
    >
      {/* Header */}
      <div className="card-header">
        <div>
          <span className="card-tag">
            {card.cliente} · {card.linhaOp}
          </span>
          <h3 className="card-title">{card.id}</h3>
        </div>
        <div className={`card-status-badge ${theme.bg}`}>
          {StatusIcon && <StatusIcon className="icon-inline" style={{ margin: 0 }} />}
        </div>
      </div>

      {/* Descrição */}
      <p className="card-desc" title={card.descricao}>
        {card.descricao || '-'}
      </p>

      {/* Mini-stages */}
      <div className="card-stages">
        {STAGES_MAP.map(({ k, l }) => {
          const st = getTheme(card.stages[k])
          const { Icon } = st
          return (
            <div key={k} className={`stage-box ${st.bg}`}>
              <span className="stage-title">{l}</span>
              <div className="stage-status">
                {Icon && <Icon className="icon-inline" />}
                {st.t === 'N/A' ? '-' : st.t.substring(0, 4) + '.'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer: fornecedor + data entrega */}
      {card.construtivo && (
        <div className="card-footer">
          <div className="card-footer-item">
            <Factory className="icon-inline" />
            <span>{card.construtivo.fornecedor.substring(0, 15)}</span>
          </div>
          <div className="card-footer-item">
            <Flag className="icon-inline" />
            <span>{formatDate(card.construtivo.entregaMfg)}</span>
          </div>
        </div>
      )}

      <button className="view-details-btn">
        <Search className="icon-sm" /> Detalhamento
      </button>
    </div>
  )
}
