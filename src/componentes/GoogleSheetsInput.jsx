import { useState, useRef } from 'react'
import { Globe, Plus, X, AlertCircle, Wifi, ChevronRight } from 'lucide-react'

export default function GoogleSheetsInput({ onProcessar, onDemo, feedback }) {
  const [urlInput, setUrlInput]   = useState('')
  const [urlQueue, setUrlQueue]   = useState([])
  const [urlError, setUrlError]   = useState('')
  const inputRef = useRef(null)

  const isProcessing = Boolean(feedback)

  function isValidUrl(url) {
    return url.includes('docs.google.com/spreadsheets') ||
           url.includes('sharepoint.com') ||
           url.startsWith('https://')
  }

  function handleAdd() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('https://')) {
      setUrlError('O link deve começar com https://')
      return
    }
    if (urlQueue.includes(trimmed)) {
      setUrlError('Esta planilha já foi adicionada.')
      return
    }
    setUrlQueue(prev => [...prev, trimmed])
    setUrlInput('')
    setUrlError('')
    inputRef.current?.focus()
  }

  function handleRemove(url) {
    setUrlQueue(prev => prev.filter(u => u !== url))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  function shorten(url) {
    try {
      // Google Sheets: extrai ID
      const gsId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]
      if (gsId) return `Planilha ···${gsId.slice(-10)}`
      // Genérico: mostra domínio + caminho curto
      const u = new URL(url)
      return u.hostname.replace('www.', '') + (u.pathname.length > 18 ? '···' + u.pathname.slice(-12) : u.pathname)
    } catch {
      return url.slice(0, 36) + '…'
    }
  }

  return (
    <div className="gs-wrapper">

      {/* Painel de instrução */}
      <div className="gs-tip">
        <div className="gs-tip-icon">
          <Wifi className="icon-sm" />
        </div>
        <span>
          Cole o <strong>link público</strong> da planilha compartilhada.
          O sistema detecta as abas por nome automaticamente — <strong>sem precisar de chave de API</strong>.
        </span>
      </div>

      {/* Input de URL */}
      <div className="gs-input-row">
        <div className="gs-input-wrapper">
          <Globe className="gs-input-icon icon-sm" />
          <input
            ref={inputRef}
            type="url"
            className="gs-url-input"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!urlInput.trim() || isProcessing}
          title="Adicionar planilha"
        >
          <Plus className="icon-sm" />
        </button>
      </div>

      {urlError && (
        <p className="gs-error">
          <AlertCircle className="icon-inline" /> {urlError}
        </p>
      )}

      {/* Fila de planilhas */}
      {urlQueue.length > 0 && (
        <div className="gs-queue">
          <div className="file-queue-title" style={{ marginBottom: '.5rem' }}>
            <Globe className="icon-inline text-blue" />
            {urlQueue.length} planilha{urlQueue.length !== 1 ? 's' : ''} na fila
          </div>
          {urlQueue.map((url, i) => (
            <div key={i} className="gs-queue-item" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="gs-queue-dot" />
              <span className="gs-queue-label" title={url}>{shorten(url)}</span>
              <button
                className="gs-remove-btn"
                onClick={() => handleRemove(url)}
                disabled={isProcessing}
                title="Remover"
              >
                <X className="icon-sm" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="btn-group" style={{ marginTop: '.875rem' }}>
        <button
          className="btn btn-success"
          disabled={urlQueue.length === 0 || isProcessing}
          onClick={() => onProcessar(urlQueue)}
        >
          {isProcessing
            ? <><div className="spinner" /> Importando dados...</>
            : <><ChevronRight className="icon-sm" /> Importar e Processar</>
          }
        </button>
        <button className="btn btn-secondary" onClick={onDemo} disabled={isProcessing}>
          Exemplo Demo
        </button>
      </div>

      <div className="upload-feedback">
        {feedback && <><div className="spinner" />{feedback}</>}
      </div>
    </div>
  )
}
