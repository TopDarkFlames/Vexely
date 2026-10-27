/// <reference types="vite/client" />
import type { VexelyApi } from '../../shared/ipc'

declare global {
  interface Window {
    vexely: VexelyApi
  }
}
