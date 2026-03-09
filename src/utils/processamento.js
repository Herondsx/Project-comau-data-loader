import { excelToJSDate, cleanTr } from './formatadores.js'

/**
 * Processa os dados extraídos das planilhas e retorna
 * a lista de transmissões com status E2E calculado.
 *
 * @param {object} sheets - { followUp, saturacao, bordomaquina, comerciais, prpo }
 * @returns {{ processedData, uniqueClientes, uniqueWBS, uniqueLinhas }}
 */
export function processarDados(sheets) {
  const trMap = new Map()
  const supRiscoMap = new Map()
  const uniqueClientes = new Set()
  const uniqueWBS = new Set()
  const uniqueLinhas = new Set()

  function getOrCreateCard(trId) {
    if (!trMap.has(trId)) {
      trMap.set(trId, {
        id: trId,
        cliente: 'N/A',
        linhaOp: 'N/A',
        descricao: 'S/ Descrição',
        projetoWBS: 'N/A',
        construtivo: null,
        riscoFornecedor: { saturacaoPerc: 0, nota: 'N/A' },
        pcp: null,
        comerciais: [],
        logisticaAdvanced: {}
      })
    }
    return trMap.get(trId)
  }

  // 1. Mapear Risco de Fornecedor (Saturação)
  if (sheets.saturacao.length) {
    sheets.saturacao.forEach(r => {
      if (r.length < 5) return
      supRiscoMap.set(String(r[0]).trim().toUpperCase(), {
        saturacaoPerc: parseFloat(r[2]) || 0,
        nota: r[4] || 'N/A'
      })
    })
  }

  // 2. Mapear PCP - Bordo de Máquina
  if (sheets.bordomaquina.length) {
    sheets.bordomaquina.forEach(r => {
      if (r.length < 15) return
      const tr = cleanTr(r[1])
      if (!tr || tr.toLowerCase().includes('transmissão')) return

      const card = getOrCreateCard(tr)
      card.pcp = {
        dataEntrega: excelToJSDate(r[3]),
        projEle: r[6] || '-',
        projPneu: r[7] || '-',
        projTop: r[8] || '-',
        matEle: r[9] || '0',
        matPneu: r[10] || '0',
        misc: r[11] || '-',
        placaAlum: r[12] || '-',
        etiQ: r[13] || '-',
        qrCode: r[14] || '-',
        testes: r[15] || '-',
        obsPcp: r[16] || ''
      }
    })
  }

  // 3. Mapear Follow-Up (Construtivos)
  if (sheets.followUp.length) {
    for (let i = 1; i < sheets.followUp.length; i++) {
      const r = sheets.followUp[i]
      if (!r || r.length < 5) continue

      const tr = cleanTr(r[4])
      if (!tr || tr.toLowerCase().includes('transmissão')) continue

      const cliente = String(r[0] || '').trim()
      const wbs = String(r[1] || '').trim()
      const linha = String(r[2] || '').trim()
      const desc = String(r[3] || '').trim()

      if (cliente && cliente !== 'N/A') uniqueClientes.add(cliente)
      if (wbs && wbs !== 'N/A') uniqueWBS.add(wbs)
      if (linha && linha !== 'N/A') uniqueLinhas.add(linha)

      const fornecedorName = String(r[11] || '').trim().toUpperCase()
      const riscoData = supRiscoMap.get(fornecedorName) || { saturacaoPerc: 0, nota: 'N/A' }
      const prioridadeRaw = r[23] !== undefined && r[23] !== '' ? String(r[23]).trim() : ''

      const card = getOrCreateCard(tr)
      card.cliente = cliente || card.cliente
      card.linhaOp = linha || card.linhaOp
      card.descricao = desc || card.descricao
      card.projetoWBS = wbs || card.projetoWBS
      card.construtivo = {
        rev: r[5] || '-',
        makeBuy: r[8] || '-',
        fornecedor: fornecedorName,
        inicio: excelToJSDate(r[9]),
        entregaForn: excelToJSDate(r[12]),
        reprog: excelToJSDate(r[14]),
        entregaMfg: excelToJSDate(r[13]),
        statusSys: String(r[15] || '').trim(),
        valorTot: r[16] || 0,
        horasPlanejadas: r[17] || 0,
        respFollow: r[18] || '-',
        nf: r[19] || '-',
        comercialResp: r[20] || '-',
        status: r[21] || '-',
        localEnt: r[22] || '-',
        prioridade: prioridadeRaw,
        obs: r[7] || ''
      }
      card.riscoFornecedor = riscoData
    }
  }

  // 4. Mapear Comerciais & PRPO
  const processCom = (sheet) => {
    for (let i = 1; i < sheet.length; i++) {
      const r = sheet[i]
      if (!r || r.length < 2) continue
      const tr = cleanTr(r[0])
      if (!tr || tr.toLowerCase().includes('transmissão')) continue

      const card = getOrCreateCard(tr)
      const rc = String(r[5] || '').trim()
      const oc = String(r[9] || '').trim()

      if (r[21] && String(r[21]).includes('FOB')) card.logisticaAdvanced.frete = r[21]
      if (r[19] && String(r[19]).includes('BRBC')) card.logisticaAdvanced.cc = r[19]
      if (r[25]) card.logisticaAdvanced.presencaCarga = excelToJSDate(r[25])

      card.comerciais.push({
        desc: r[1] || '',
        pn: r[2] || '-',
        qtd: r[4] || 0,
        rc,
        oc,
        forn: r[11] || '',
        dtEnt: excelToJSDate(r[12]),
        nf: r[13] || '',
        pull: r[14] || ''
      })
    }
  }

  sheets.comerciais.forEach(processCom)
  if (sheets.prpo.length) processCom(sheets.prpo)

  // 5. Cálculo de Status E2E
  const today = new Date()
  const processedData = Array.from(trMap.values()).map(card => {
    let reqOk = true
    let ocOk = true
    const hasComerciais = card.comerciais.length > 0
    let comAtrasado = false

    card.comerciais.forEach(c => {
      if (!c.rc) reqOk = false
      if (!c.oc) ocOk = false
      if (c.dtEnt && c.dtEnt < today && !c.oc) comAtrasado = true
    })

    const pStatus = hasComerciais ? (!reqOk ? 'Vazio' : (!ocOk ? 'Ongoing' : 'Complete')) : 'Vazio'
    const cStatus = hasComerciais ? (comAtrasado ? 'On delayed' : (ocOk ? 'Complete' : 'Ongoing')) : 'Vazio'

    let constStatus = 'Vazio'
    if (card.construtivo) {
      const st = card.construtivo.statusSys.toLowerCase()
      if (st.includes('atrasa') || (card.construtivo.reprog && card.construtivo.reprog < today)) {
        constStatus = 'On delayed'
      } else if (st === '1' || st === '100%' || st.includes('conclu')) {
        constStatus = 'Complete'
      } else {
        constStatus = 'Ongoing'
      }
    }

    const engStatus = card.pcp
      ? (String(card.pcp.projEle).toLowerCase().includes('liberad') ? 'Complete' : 'Ongoing')
      : (card.construtivo ? 'Complete' : 'Vazio')

    const mfgStatus = card.pcp
      ? (String(card.pcp.testes).toLowerCase().includes('ok') ? 'Complete' : 'Ongoing')
      : ((constStatus !== 'Vazio' || cStatus !== 'Vazio') ? 'Ongoing' : 'Vazio')

    const delStatus = mfgStatus !== 'Vazio'
      ? (mfgStatus === 'Complete' ? 'Complete' : 'Ongoing')
      : 'Vazio'

    const stages = [engStatus, pStatus, cStatus, constStatus, mfgStatus, delStatus]
    let overall = 'Ongoing'
    if (stages.every(s => s === 'Complete' || s === 'Vazio')) overall = 'Complete'
    if (stages.some(s => s === 'On delayed')) overall = 'On delayed'

    return {
      ...card,
      stages: {
        Engineering: engStatus,
        Purchasing: pStatus,
        Commercial: cStatus,
        Constructives: constStatus,
        Manufacturing: mfgStatus,
        Delivery: delStatus
      },
      overallStatus: overall
    }
  })

  return { processedData, uniqueClientes, uniqueWBS, uniqueLinhas }
}

// Dados de demonstração para testes sem planilha
export const DEMO_SHEETS = {
  saturacao: [
    ['Fornecedor', '', 'Saturação %', '', 'Nota Avaliação'],
    ['MEC SYSTEMS', '', '0.85', '', '0.92'],
    ['AR SANTOS', '', '0.95', '', '0.81'],
    ['IMECOR', '', '0.45', '', '0.96']
  ],
  bordomaquina: [
    ['ID', 'TRANSMISSÃO', 'OPERAÇÃO', 'DATA', 'LOCAL', 'PRIO', 'PROJ ELE', 'PROJ PNEU', 'PROJ TOP', 'MAT ELE', 'MAT PNEU', 'MISC', 'PLACA', 'ETIQ', 'QR', 'TESTES', 'OBS'],
    [1, 'VW427-PATAGONIA-AUFBAU-0035-2025', 'OP10', 46000, 'Betim', 'N', 'Liberado', 'Liberado', 'N/A', '1', '1', 'Ok', 'Fixada', 'Colado', 'Gerado', 'Testes OK', 'Sem Pendências'],
    [2, 'VW247-PATAGONIA-BODYSIDE-0001-2025', 'OP20', 46050, 'Santo André', 'S', 'Em Análise', 'Não liberado', 'N/A', '0.2', '0', 'Pendente', '-', '-', '-', 'Pendente', 'Aguardando Mat.'],
    [3, 'STL-PSA-BB21-JJ-PCK01-0102-2024', 'OP25', 46060, 'Betim', 'N', 'Liberado', 'Liberado', 'N/A', '1', '1', 'Ok', 'Fixada', 'Colado', 'Gerado', 'Testes OK', 'Apenas PCP']
  ],
  followUp: [
    [],
    ['VW', 'BRBCBBB35', 'AUFBAU', 'DISPOSITIVO INDEX', 'VW427-PATAGONIA-AUFBAU-0035-2025', '1', 'Date', 'Aprovado GQ', 'Make', '45500', 'OC', 'MEC SYSTEMS', '45600', '45605', '45610', '100% Concluído', '15000', '120', 'Ana', '123', 'Vic', 'Ok', 'Betim', ''],
    ['VW', 'BRBCBBB35', 'BODYSIDE', 'GRAMPO PNEUMATICO', 'VW247-PATAGONIA-BODYSIDE-0001-2025', '0', 'Date', 'Máquina CNC Quebrou', 'Buy', '45550', 'OC', 'AR SANTOS', '45620', '45625', '45640', 'Atrasado', '8400', '45', 'Rudnei', '-', 'Jes', 'Fail', 'S.André', '1'],
    ['RENAULT', 'BRBCBBB37', 'STW', 'SUPORTE BASE', 'BB37-VW-ANCH-STW-UB2-0002-2025', '2', 'Date', 'Nenhuma obs.', 'Make/Buy', '45550', 'OC', 'IMECOR', '45620', '45625', '45640', 'Em andamento', '1200', '15', 'Kaio', '-', 'Vic', 'Ok', 'S.André', 'MÁXIMA']
  ],
  comerciais: [
    [[], ['VW427-PATAGONIA-AUFBAU-0035-2025', 'SENSOR M12', 'PN123', 'D', '4', 'RC1', 'x', 'x', 'x', 'OC1', 'x', 'FORN', '45600', 'NF12', 'PULL99']],
    [[], ['VW247-PATAGONIA-BODYSIDE-0001-2025', 'CILINDRO 50MM', 'CIL50', 'D', '2', 'RC2', 'x', 'x', 'x', '', 'x', 'FORN', '45630', '', '']]
  ],
  prpo: [
    [],
    ['VW427-PATAGONIA-AUFBAU-0035-2025', 'SENSOR M12', 'PN123', 'D', '4', 'RC1', 'x', 'x', 'x', 'OC1', 'x', 'FORN', '45600', 'NF12', 'PULL99', '', '', '', '', 'BRBC-CC1', '', 'CIF', '', '', '', '45590']
  ]
}
