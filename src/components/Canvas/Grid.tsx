import { Line, Group } from 'react-konva'
import { GRID_SIZE } from '../../lib/constants'

interface GridProps {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Renders a soft blueprint grid. We compute visible lines in world space
 * so the grid stays crisp when zoomed/panned.
 */
export const Grid = ({ width, height, scale, offsetX, offsetY }: GridProps) => {
  const step = GRID_SIZE
  // World bounds visible on screen
  const left = -offsetX / scale
  const top = -offsetY / scale
  const right = left + width / scale
  const bottom = top + height / scale

  const startX = Math.floor(left / step) * step
  const startY = Math.floor(top / step) * step

  const lines: JSX.Element[] = []
  let i = 0
  for (let x = startX; x < right; x += step) {
    const major = Math.round(x / step) % 5 === 0
    lines.push(
      <Line
        key={`v-${i++}`}
        points={[x, top, x, bottom]}
        stroke={major ? '#cfc7b3' : '#e6e0d0'}
        strokeWidth={major ? 1 : 0.5}
        listening={false}
      />,
    )
  }
  for (let y = startY; y < bottom; y += step) {
    const major = Math.round(y / step) % 5 === 0
    lines.push(
      <Line
        key={`h-${i++}`}
        points={[left, y, right, y]}
        stroke={major ? '#cfc7b3' : '#e6e0d0'}
        strokeWidth={major ? 1 : 0.5}
        listening={false}
      />,
    )
  }
  return <Group listening={false}>{lines}</Group>
}
