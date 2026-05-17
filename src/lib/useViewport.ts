import { useEffect, useState } from 'react'

/**
 * Returns the current viewport width/height and updates on resize.
 * Initial state is 0 to avoid SSR/initial-mount jank — components should
 * branch on `width === 0` if they need to defer rendering.
 */
export const useViewport = () => {
  const [size, setSize] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}
