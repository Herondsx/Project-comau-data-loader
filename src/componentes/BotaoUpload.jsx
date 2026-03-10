import { useState, useRef } from 'react'
import { FolderOpen, FilePlus, Cpu, Play, FileSpreadsheet, Upload, Globe } from 'lucide-react'
import GoogleSheetsInput from './GoogleSheetsInput.jsx'

export default function BotaoUpload({
  fileQueue, onAddFiles, onProcess, onDemo, feedback,
  onProcessSheets
}) {
  const [modo, setModo] = useState('arquivo')   // 'arquivo' | 'sheets'
  const fileInputRef = useRef(null)
  const dropZoneRef  = useRef(null)

  function handleDragOver(e) {
    e.preventDefault(); e.stopPropagation()
    dropZoneRef.current?.classList.add('dragover')
  }
  function handleDragLeave(e) {
    e.preventDefault(); e.stopPropagation()
    dropZoneRef.current?.classList.remove('dragover')
  }
  function handleDrop(e) {
    e.preventDefault(); e.stopPropagation()
    dropZoneRef.current?.classList.remove('dragover')
    setModo('arquivo')
    onAddFiles(Array.from(e.dataTransfer.files))
  }
  function handleFileChange(e) {
    onAddFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const isProcessing = Boolean(feedback)

  return (
    <div className="overlay">
      <div
        className="drop-zone"
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Ícone animado */}
        <div className="upload-icon-wrapper">
          {modo === 'arquivo'
            ? <FolderOpen className="icon-xl text-blue" />
            : <Globe className="icon-xl text-blue" />
          }
        </div>

        <h2>{modo === 'arquivo' ? 'Área de Preparação de Arquivos' : 'Importar Planilha via URL'}</h2>
        <p>
          {modo === 'arquivo'
            ? 'Arraste ou selecione suas planilhas de Follow-up, Comerciais, PCP, PRPO, etc.'
            : 'Cole o link da planilha compartilhada para importar os dados automaticamente.'
          }
        </p>

        {/* Toggle de modo */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${modo === 'arquivo' ? 'active' : ''}`}
            onClick={() => setModo('arquivo')}
          >
            <Upload className="icon-sm" /> Upload de Arquivo
          </button>
          <button
            className={`mode-btn ${modo === 'sheets' ? 'active' : ''}`}
            onClick={() => setModo('sheets')}
          >
            <Globe className="icon-sm" /> Via URL
          </button>
        </div>

        {/* Conteúdo do modo */}
        {modo === 'arquivo' ? (
          <>
            <div className="btn-group" style={{ marginTop: '.25rem' }}>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                <FilePlus className="icon-sm" /> Adicionar Arquivos
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".xlsx, .xls, .xlsm, .csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {fileQueue.length > 0 && (
              <div className="file-queue">
                <div className="file-queue-title">
                  Fila de Processamento — {fileQueue.length} arquivo{fileQueue.length !== 1 ? 's' : ''}
                </div>
                {fileQueue.map((f, idx) => (
                  <div key={idx} className="file-queue-item" style={{ animationDelay: `${idx * 40}ms` }}>
                    <FileSpreadsheet className="icon-inline text-green" />
                    {f.name}
                  </div>
                ))}
              </div>
            )}

            <div className="btn-group" style={{ marginTop: '.75rem' }}>
              <button
                className="btn btn-success"
                disabled={fileQueue.length === 0 || isProcessing}
                onClick={onProcess}
              >
                {isProcessing
                  ? <><div className="spinner" /> Processando...</>
                  : <><Cpu className="icon-sm" /> Processar Base de Dados</>
                }
              </button>
              <button className="btn btn-secondary" onClick={onDemo} disabled={isProcessing}>
                <Play className="icon-sm" /> Exemplo Demo
              </button>
            </div>

            <div className="upload-feedback">
              {feedback && <><div className="spinner" />{feedback}</>}
            </div>
          </>
        ) : (
          <GoogleSheetsInput
            onProcessar={onProcessSheets}
            onDemo={onDemo}
            feedback={feedback}
          />
        )}
      </div>
    </div>
  )
}
