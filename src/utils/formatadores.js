import { CheckCircle2, AlertCircle, Clock, Minus } from 'lucide-react'

export function excelToJSDate(serial) {
  if (!serial) return null
  if (typeof serial === 'string') return new Date(serial)
  return new Date((Math.floor(serial - 25569)) * 86400 * 1000)
}

export function formatDate(date) {
  return (!date || isNaN(date))
    ? '-'
    : new Date(date.getTime() + 86400000).toLocaleDateString('pt-BR')
}

export function formatCur(val) {
  return (!val || isNaN(val))
    ? 'R$ 0,00'
    : Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function cleanTr(str) {
  return String(str || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

// Retorna tema com referência ao componente de ícone Lucide
export function getTheme(st) {
  switch (st) {
    case 'Complete':
      return { b: 'border-complete', bg: 'bg-complete', Icon: CheckCircle2, t: 'Concluído', c: 'complete' }
    case 'On delayed':
      return { b: 'border-delayed', bg: 'bg-delayed', Icon: AlertCircle, t: 'Atraso/Risco', c: 'delayed' }
    case 'Ongoing':
      return { b: 'border-ongoing', bg: 'bg-ongoing', Icon: Clock, t: 'Em Andamento', c: 'ongoing' }
    default:
      return { b: '', bg: '', Icon: Minus, t: 'N/A', c: 'empty' }
  }
}

// Mapa de ícones por etapa do fluxo E2E
export { PenTool, ShoppingCart, DollarSign, Wrench, Factory, Truck } from 'lucide-react'
