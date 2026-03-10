import { useState, useEffect, useRef } from 'react'

/**
 * Anima um número de 0 até `target` com easing cúbico.
 * Reutilizável em qualquer componente de KPI/stat.
 */
export function useAnimatedCounter(target, duration = 750) {
  const [value, setValue] = useState(0)
  const prevRef = useRef(0)
  const rafRef  = useRef(null)

  useEffect(() => {
    const start = prevRef.current
    const end   = target
    if (start === end) return

    const startTime = performance.now()

    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)   // cubic ease-out
      setValue(Math.round(start + (end - start) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = end
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}
