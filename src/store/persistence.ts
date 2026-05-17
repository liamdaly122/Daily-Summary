import type { AppState } from './types'

const KEY = 'housediy:v1'

export const loadState = (): Partial<AppState> | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<AppState>
  } catch (err) {
    console.error('Failed to load state', err)
    return null
  }
}

export const saveState = (state: AppState) => {
  try {
    const { floors, activeFloorId, ui } = state
    localStorage.setItem(KEY, JSON.stringify({ floors, activeFloorId, ui }))
  } catch (err) {
    console.error('Failed to save state', err)
  }
}

export const clearState = () => {
  localStorage.removeItem(KEY)
}
