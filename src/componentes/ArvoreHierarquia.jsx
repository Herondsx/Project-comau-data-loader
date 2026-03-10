import { PenTool, ShoppingCart, DollarSign, Wrench, Factory, Truck } from 'lucide-react'
import { getTheme } from '../utils/formatadores.js'

const STAGE_ICONS = {
  Engineering: PenTool,
  Purchasing: ShoppingCart,
  Commercial: DollarSign,
  Constructives: Wrench,
  Manufacturing: Factory,
  Delivery: Truck
}

/**
 * Stepper visual E2E: Engineering → Purchasing → Commercial
 *                   → Constructives → Manufacturing → Delivery
 */
export default function ArvoreHierarquia({ stages }) {
  return (
    <div className="e2e-stepper">
      {Object.entries(stages).map(([key, value]) => {
        const theme = getTheme(value)
        const IconStage = STAGE_ICONS[key]
        return (
          <div key={key} className={`step ${theme.c}`}>
            <div className="step-icon-wrapper" title={theme.t}>
              {IconStage && <IconStage className="icon-md" />}
            </div>
            <div className="step-label">{key}</div>
            <div className="step-status-text">{theme.t}</div>
          </div>
        )
      })}
    </div>
  )
}
