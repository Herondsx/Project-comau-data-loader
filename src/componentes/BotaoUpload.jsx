import { useRef } from 'react'
import { FolderPlus, FilePlus, Cpu, Play, FileSpreadsheet } from 'lucide-react'

export default function BotaoUpload({ fileQueue, onAddFiles, onProcess, onDemo, feedback }) {
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.add('dragover')
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('dragover')
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('dragover')
    onAddFiles(Array.from(e.dataTransfer.files))
  }

  function handleFileChange(e) {
    onAddFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  return (
    <div className="overlay">
      <div
        className="drop-zone"
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FolderPlus className="icon-xl text-blue" style={{ margin: '0 auto 1rem auto' }} />
        <h2>Área de Preparação de Arquivos</h2>
        <p>
          Arraste ou selecione suas planilhas de Follow-up, Comerciais, PCP, etc.<br />
          Você pode ir adicionando vários arquivos aos poucos antes de processar.
        </p>

        <div className="btn-group">
          <label className="btn btn-outline">
            <FilePlus className="icon-sm" /> Adicionar Arquivos
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {fileQueue.length > 0 && (
          <div className="file-queue">
            <div className="file-queue-title">
              Fila de Processamento ({fileQueue.length} arquivo{fileQueue.length !== 1 ? 's' : ''})
            </div>
            <div>
              {fileQueue.map((f, idx) => (
                <div key={idx} className="file-queue-item">
                  <FileSpreadsheet className="icon-inline text-green" />
                  {f.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="btn-group" style={{ marginTop: '0.5rem' }}>
          <button
            className="btn btn-success"
            disabled={fileQueue.length === 0}
            onClick={onProcess}
          >
            <Cpu className="icon-sm" /> Processar Base de Dados
          </button>
          <button className="btn btn-secondary" onClick={onDemo}>
            <Play className="icon-sm" /> Exemplo Demo
          </button>
        </div>

        <div className="upload-feedback">{feedback}</div>
      </div>
    </div>
  )
}
