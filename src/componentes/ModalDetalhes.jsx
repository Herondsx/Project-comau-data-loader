import { useEffect } from 'react'
import {
  X, Folder, Tag, Layers, AlertTriangle,
  PenTool, Wrench, Factory, Truck, ShoppingCart,
  Hash, FileText, FileCheck2, Receipt, MapPin
} from 'lucide-react'
import { getTheme, formatDate, formatCur } from '../utils/formatadores.js'
import ArvoreHierarquia from './ArvoreHierarquia.jsx'

export default function ModalDetalhes({ card, onClose }) {
  // Fechar com ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!card) return null

  const oT = getTheme(card.overallStatus)
  const { Icon: StatusIcon } = oT

  const rPerc = card.riscoFornecedor.saturacaoPerc * 100
  const satClass = rPerc > 80 ? 'badge-sat-red' : (rPerc > 50 ? 'badge-sat-yellow' : 'badge-sat-green')

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">

        {/* Header do Modal */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="card-tag">{card.cliente} | {card.linhaOp}</span>
            <h2 className="modal-title">{card.id}</h2>
            <p className="card-desc" style={{ marginBottom: '0.5rem' }}>{card.descricao}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-outline"><Folder className="icon-sm" /> {card.projetoWBS}</span>
              <span className="badge-outline"><Tag className="icon-sm" /> Rev: {card.construtivo?.rev ?? '-'}</span>
              <span className="badge-outline"><Layers className="icon-sm" /> {card.construtivo?.makeBuy ?? 'N/A'}</span>
              {card.construtivo?.prioridade && (
                <span className="badge-outline priority-high">
                  <AlertTriangle className="icon-sm" /> Prioridade: {card.construtivo.prioridade}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            <button className="modal-close" onClick={onClose}><X className="icon-md" /></button>
            <div className={`card-status-badge ${oT.bg}`}>
              {StatusIcon && <StatusIcon className="icon-sm" />}
              Status Global: {oT.t}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Stepper E2E */}
          <ArvoreHierarquia stages={card.stages} />

          {/* Grid 4 colunas */}
          <div className="details-grid">

            {/* Eng. & Projetos */}
            <div className="detail-section">
              <h4><PenTool className="icon-sm text-purple" /> Eng. & Projetos</h4>
              {(card.pcp || card.construtivo) ? (
                <>
                  <InfoRow label="Estratégia" value={card.construtivo?.makeBuy ?? '-'} />
                  <InfoRow label="Revisão" value={card.construtivo?.rev ?? '-'} />
                  <InfoRow label="Proj. Elétrico" value={card.pcp?.projEle ?? 'Não Mapeado'} badge />
                  <InfoRow label="Proj. Pneumático" value={card.pcp?.projPneu ?? 'Não Mapeado'} badge />
                  <InfoRow label="Proj. Topográfico" value={card.pcp?.projTop ?? 'Não Mapeado'} badge />
                  <InfoRow label="Horas Estimadas" value={`${card.construtivo?.horasPlanejadas ?? '0'} h`} />
                </>
              ) : (
                <p className="text-slate text-sm">Sem dados de PCP/Engenharia.</p>
              )}
            </div>

            {/* Construtivo Ext. */}
            <div className="detail-section">
              <h4><Wrench className="icon-sm text-blue" /> Construtivo Ext.</h4>
              {card.construtivo ? (
                <>
                  <InfoRow label="Fornecedor" value={card.construtivo.fornecedor} />
                  <InfoRow
                    label="Risco / Saturação"
                    value={`${rPerc.toFixed(1)}% | Nota: ${card.riscoFornecedor.nota}`}
                    badgeClass={satClass}
                  />
                  <InfoRow label="Resp. Follow-Up" value={card.construtivo.respFollow} />
                  <InfoRow
                    label="Início / Entrega Orig."
                    value={`${formatDate(card.construtivo.inicio)} / ${formatDate(card.construtivo.entregaForn)}`}
                  />
                  <InfoRow
                    label="Reprogramação"
                    value={formatDate(card.construtivo.reprog)}
                    className="text-red"
                  />
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                    <strong>Obs. Histórico:</strong>{' '}
                    <span className="text-slate">{card.construtivo.obs || 'S/ observações.'}</span>
                  </div>
                </>
              ) : (
                <p className="text-slate text-sm">Sem dados de fornecimento externo.</p>
              )}
            </div>

            {/* Bordo de Máquina (PCP) */}
            <div className="detail-section">
              <h4><Factory className="icon-sm text-orange" /> Bordo de Máquina (PCP)</h4>
              {card.pcp ? (
                <>
                  <InfoRow label="Local Montagem" value={card.construtivo?.localEnt ?? '-'} className="text-indigo" />
                  <InfoRow
                    label="Mat. Elétrico / Pneu"
                    value={`${(parseFloat(card.pcp.matEle) * 100).toFixed(0)}% / ${(parseFloat(card.pcp.matPneu) * 100).toFixed(0)}%`}
                  />
                  <InfoRow label="Miscelâneas / Placa" value={`${card.pcp.misc} / ${card.pcp.placaAlum}`} />
                  <InfoRow label="Etiquetas / QR Code" value={`${card.pcp.etiQ} / ${card.pcp.qrCode}`} />
                  <InfoRow label="Status Testes" value={card.pcp.testes} className="text-orange" />
                </>
              ) : card.construtivo ? (
                <>
                  <InfoRow label="Local Montagem" value={card.construtivo?.localEnt ?? '-'} className="text-indigo" />
                  <p className="text-slate" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Aguardando entrada física no PCP.</p>
                </>
              ) : (
                <p className="text-slate text-sm">Transmissão não listada no Bordo de Máquina.</p>
              )}
            </div>

            {/* Finanças & Logística */}
            <div className="detail-section">
              <h4><Truck className="icon-sm text-green" /> Finanças & Logística</h4>
              {(card.construtivo || card.logisticaAdvanced.cc) ? (
                <>
                  <InfoRow label="Comprador" value={card.construtivo?.comercialResp ?? '-'} />
                  <InfoRow label="Centro Custo (WBS)" value={card.logisticaAdvanced.cc || card.projetoWBS} />
                  <InfoRow label="Valor Total Ordem" value={formatCur(card.construtivo?.valorTot)} className="text-green" />
                  <InfoRow label="NF Construtivo" value={card.construtivo?.nf ?? '-'} />
                  <InfoRow label="Frete (Incoterm)" value={card.logisticaAdvanced.frete || 'FOB'} />
                  <InfoRow label="Data Presença Carga" value={formatDate(card.logisticaAdvanced.presencaCarga)} className="text-blue" />
                </>
              ) : (
                <p className="text-slate text-sm">Sem info. financeira/PRPO.</p>
              )}
            </div>

            {/* BOM & NFs */}
            <div className="detail-section full-width">
              <h4><ShoppingCart className="icon-sm text-yellow" /> Itens Comerciais (BOM) & NFs</h4>
              {card.comerciais.length > 0 ? (
                <div className="items-list">
                  {card.comerciais.map((c, i) => (
                    <div key={i} className="item-row">
                      <div className="item-title">{c.desc}</div>
                      <div className="item-meta">
                        <span style={{ background: '#f1f5f9', border: 'none', fontWeight: 600 }}>
                          <Tag className="icon-inline" /> {c.pn}
                        </span>
                        <span><Hash className="icon-inline" /> Qtd: {c.qtd}</span>
                        <span><FileText className="icon-inline" /> RC: {c.rc || 'Pend.'}</span>
                        <span className={!c.oc ? 'text-red' : 'text-green'}>
                          <FileCheck2 className="icon-inline" /> OC: {c.oc || 'Pend.'}
                        </span>
                        {c.nf && (
                          <span className="text-green">
                            <Receipt className="icon-inline" /> NF: {c.nf}
                          </span>
                        )}
                        {c.pull && (
                          <span className="text-indigo">
                            <MapPin className="icon-inline" /> PULL: {c.pull}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate text-sm">Nenhum item BOM associado.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-componente linha de informação
function InfoRow({ label, value, badge = false, badgeClass = '', className = '' }) {
  return (
    <div className="info-row">
      <span className={`info-label ${className}`}>{label}:</span>
      <span className={`info-val ${badge || badgeClass ? 'badge-status' : ''} ${badgeClass} ${className}`}>
        {value}
      </span>
    </div>
  )
}
