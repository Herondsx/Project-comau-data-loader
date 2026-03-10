import * as XLSX from 'xlsx'

/**
 * Extrai o Sheet ID de qualquer URL do Google Sheets.
 * Suporta formatos: /spreadsheets/d/{ID}/edit, /spreadsheets/d/{ID}/view, etc.
 */
export function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/**
 * Converte texto CSV para array 2D (mesmo formato do XLSX.sheet_to_json header:1)
 */
function csvTo2D(csvText) {
  try {
    const wb = XLSX.read(csvText, { type: 'string' })
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })
  } catch {
    return []
  }
}

/**
 * Busca uma aba específica de uma planilha pública do Google Sheets.
 * Usa o endpoint gviz/tq que não requer API key.
 * Retorna null se a aba não existir ou ocorrer erro.
 */
async function fetchTab(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    // Resposta de erro do gviz começa com "google.visualization" (JS callback)
    if (text.startsWith('google.') || text.includes('"status":"error"')) return null
    const data = csvTo2D(text)
    return data.length > 1 ? data : null   // ignora abas vazias (só cabeçalho)
  } catch {
    return null
  }
}

/**
 * Variantes de nomes a tentar para cada tipo de aba.
 * A lógica espelha o que já existe no processamento de arquivos.
 */
const TAB_VARIANTS = {
  followUp:     ['Follow Up', 'Follow-Up', 'FOLLOW UP', 'follow up', 'FollowUp', 'Follow_Up'],
  saturacao:    ['Saturação', 'Saturacao', 'SATURAÇÃO', 'saturacao', 'Saturacão'],
  bordomaquina: ['BordoMaquina', 'Bordo Maquina', 'Bordo', 'bordo', 'BORDOMAQUINA', 'Bordo de Máquina'],
  comerciais:   ['Comerciais', 'COMERCIAIS', 'comerciais', 'PoProgr', 'PoProg', 'POPROG'],
  prpo:         ['PRPO', 'prpo', 'PR/PO', 'PR-PO'],
}

/**
 * Tenta encontrar e buscar todas as abas conhecidas de um Google Sheet público.
 * Retorna o objeto sheets parcialmente preenchido (abas não encontradas ficam []).
 */
async function fetchSheetsFromId(sheetId, onProgress) {
  const result = { followUp: [], saturacao: [], bordomaquina: [], comerciais: [], prpo: [] }
  const found  = {}

  for (const [tipo, variants] of Object.entries(TAB_VARIANTS)) {
    onProgress?.(`Procurando aba "${tipo}"...`)
    for (const name of variants) {
      const data = await fetchTab(sheetId, name)
      if (data) {
        if (tipo === 'comerciais') {
          result.comerciais.push(data)
        } else {
          result[tipo] = data
        }
        found[tipo] = name
        break
      }
    }
  }

  return { sheets: result, found }
}

/**
 * Ponto de entrada principal.
 * Recebe um array de URLs do Google Sheets e retorna o objeto sheets acumulado.
 */
export async function fetchAllSheets(urls, onProgress) {
  const accumulated = { followUp: [], saturacao: [], bordomaquina: [], comerciais: [], prpo: [] }
  const summary = []

  for (const url of urls) {
    const sheetId = extractSheetId(url)
    if (!sheetId) {
      summary.push({ url, erro: 'URL inválida' })
      continue
    }

    onProgress?.(`Conectando à planilha...`)
    const { sheets, found } = await fetchSheetsFromId(sheetId, onProgress)

    // Acumula
    if (sheets.followUp.length)     accumulated.followUp     = accumulated.followUp.length     ? [...accumulated.followUp,     ...sheets.followUp]     : sheets.followUp
    if (sheets.saturacao.length)    accumulated.saturacao    = accumulated.saturacao.length    ? [...accumulated.saturacao,    ...sheets.saturacao]    : sheets.saturacao
    if (sheets.bordomaquina.length) accumulated.bordomaquina = accumulated.bordomaquina.length ? [...accumulated.bordomaquina, ...sheets.bordomaquina] : sheets.bordomaquina
    if (sheets.comerciais.length)   accumulated.comerciais.push(...sheets.comerciais)
    if (sheets.prpo.length)         accumulated.prpo         = accumulated.prpo.length         ? [...accumulated.prpo,         ...sheets.prpo]         : sheets.prpo

    summary.push({ url, found })
  }

  return { sheets: accumulated, summary }
}
