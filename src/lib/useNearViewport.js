import { useEffect, useState } from 'react'

/**
 * Returns true once the referenced element comes within `rootMargin` of the
 * viewport, and stays true afterwards. Used to defer third-party widgets until
 * the visitor scrolls close to them.
 */
export function useNearViewport(ref, rootMargin = '600px 0px') {
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    if (isNear) return undefined
    const element = ref.current
    if (!element) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setIsNear(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin, isNear])

  return isNear
}
