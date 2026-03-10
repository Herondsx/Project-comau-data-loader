import { Database, CheckCircle, Activity } from 'lucide-react'

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
          <Activity className="icon-sm text-green" />
          BD: <span className="text-green">Demo</span>
        </>
      )
    }
    return (
      <>
        <Database className="icon-sm" />
        Banco: <span className="text-red">Aguardando</span>
      </>
    )
  }

  return (
    <header className="app-header">
      <div className="header-title-wrapper">
        <img
          src="/logo-comau.png"
          alt="COMAU"
          className="header-logo-img"
        />
        <h1 className="header-title">
          SUPPLY CHAIN TRACKER
          <span className="header-subtitle">· ERP COMAU</span>
        </h1>
      </div>

      <div className="header-badges">
        <div className={`status-badge-top ${badgeStatus}`}>
          {renderBadge()}
        </div>
      </div>
    </header>
  )
}
