import { Layers, Database, CheckCircle } from 'lucide-react'

export default function Cabecalho({ badgeStatus }) {
  const renderBadge = () => {
    if (badgeStatus === 'integrated') {
      return (
        <>
          <CheckCircle className="icon-sm text-green" />
          BD: <span className="text-green">Integrado</span>
        </>
      )
    }
    if (badgeStatus === 'demo') {
      return (
        <>
          <CheckCircle className="icon-sm text-green" />
          BD: <span className="text-green">Demo</span>
        </>
      )
    }
    return (
      <>
        <Database className="icon-sm" />
        Banco de Dados: <span className="text-red">Aguardando</span>
      </>
    )
  }

  return (
    <header className="app-header">
      <div className="header-title-wrapper">
        <Layers className="icon-lg text-yellow" />
        <h1 className="header-title">
          SUPPLY CHAIN TRACKER
          <span className="header-subtitle">ERP COMAU</span>
        </h1>
      </div>
      <div className="header-badges">
        <div className="status-badge-top">
          {renderBadge()}
        </div>
      </div>
    </header>
  )
}
