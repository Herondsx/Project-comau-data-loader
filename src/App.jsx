import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import Cabecalho from './componentes/Cabecalho.jsx'
import Inicio from './paginas/Inicio.jsx'
import Visualizacao from './paginas/Visualizacao.jsx'
import { processarDados, DEMO_SHEETS } from './utils/processamento.js'

const SHEETS_INICIAL = {
  followUp: [],
  saturacao: [],
  bordomaquina: [],
  comerciais: [],
  prpo: []
}

export default function App() {
  const [tela, setTela] = useState('upload')        // 'upload' | 'dashboard'
  const [fileQueue, setFileQueue] = useState([])
  const [feedback, setFeedback] = useState('')
  const [badgeStatus, setBadgeStatus] = useState('waiting') // 'waiting' | 'integrated' | 'demo'

  const [processedData, setProcessedData] = useState([])
  const [filters, setFilters] = useState({ transmissao: '', cliente: '', wbs: '', linha: '', status: 'all' })
  const [uniqueClientes, setUniqueClientes] = useState(new Set())
  const [uniqueWBS, setUniqueWBS] = useState(new Set())
  const [uniqueLinhas, setUniqueLinhas] = useState(new Set())
  const [selectedCard, setSelectedCard] = useState(null)

  // Adicionar arquivos à fila (sem duplicatas por nome)
  const handleAddFiles = useCallback((files) => {
    setFileQueue(prev => {
      const names = new Set(prev.map(f => f.name))
      const novos = files.filter(f => !names.has(f.name))
      return [...prev, ...novos]
    })
  }, [])

  // Processar todos os arquivos da fila
  const handleProcessar = useCallback(async () => {
    setFeedback(`Lendo ${fileQueue.length} arquivo(s). Por favor, aguarde...`)

    const sheets = { ...SHEETS_INICIAL, comerciais: [] }

    for (const file of fileQueue) {
      try {
        const wb = await readExcel(file)
        wb.SheetNames.forEach(sheetName => {
          const lower = sheetName.toLowerCase()
          if (lower.includes('bkp') || lower.includes('cópia') || lower.includes('copia') || lower.includes('backup')) return

          const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 })

          if (lower.includes('follow up') || lower.includes('follow-up')) {
            sheets.followUp = sheets.followUp.length === 0 ? data : [...sheets.followUp, ...data]
          } else if (lower.includes('saturação') || lower.includes('saturacao')) {
            sheets.saturacao = sheets.saturacao.length === 0 ? data : [...sheets.saturacao, ...data]
          } else if (lower.includes('bordomaquina') || lower.includes('bordo')) {
            sheets.bordomaquina = sheets.bordomaquina.length === 0 ? data : [...sheets.bordomaquina, ...data]
          } else if (lower.includes('comerciai') || lower.includes('poprog')) {
            sheets.comerciais.push(data)
          } else if (lower.includes('prpo')) {
            sheets.prpo = sheets.prpo.length === 0 ? data : [...sheets.prpo, ...data]
          }
        })
      } catch (err) {
        console.error('Erro ao ler arquivo:', file.name, err)
      }
    }

    setBadgeStatus('integrated')
    setFeedback('Cruzando dados...')

    setTimeout(() => {
      aplicarResultado(sheets)
      setTela('dashboard')
    }, 800)
  }, [fileQueue])

  // Carregar dados de demonstração
  const handleDemo = useCallback(() => {
    setFeedback('Carregando ambiente de demonstração...')
    setTimeout(() => {
      setBadgeStatus('demo')
      aplicarResultado(DEMO_SHEETS)
      setTela('dashboard')
    }, 600)
  }, [])

  function aplicarResultado(sheets) {
    const resultado = processarDados(sheets)
    setProcessedData(resultado.processedData)
    setUniqueClientes(resultado.uniqueClientes)
    setUniqueWBS(resultado.uniqueWBS)
    setUniqueLinhas(resultado.uniqueLinhas)
  }

  const handleFilterChange = useCallback((campo, valor) => {
    setFilters(prev => ({ ...prev, [campo]: valor }))
  }, [])

  return (
    <>
      <Cabecalho badgeStatus={badgeStatus} />

      <main className="main-content">
        {tela === 'upload' && (
          <Inicio
            fileQueue={fileQueue}
            onAddFiles={handleAddFiles}
            onProcess={handleProcessar}
            onDemo={handleDemo}
            feedback={feedback}
          />
        )}

        {tela === 'dashboard' && (
          <Visualizacao
            processedData={processedData}
            filters={filters}
            onFilterChange={handleFilterChange}
            uniqueClientes={uniqueClientes}
            uniqueWBS={uniqueWBS}
            uniqueLinhas={uniqueLinhas}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
            onCloseModal={() => setSelectedCard(null)}
          />
        )}
      </main>
    </>
  )
}

function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(XLSX.read(new Uint8Array(e.target.result), { type: 'array' }))
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
