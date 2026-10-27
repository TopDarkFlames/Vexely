// Contrato de IPC entre o processo principal e a interface.
// Cada terminal é identificado pelo id do nó no quadro (BOARD_NODE_ID).

export const IPC = {
  ptySpawn: 'pty:spawn',
  ptyWrite: 'pty:write',
  ptyResize: 'pty:resize',
  ptyKill: 'pty:kill',
  ptyData: 'pty:data',
  ptyExit: 'pty:exit'
} as const

export interface PtySpawnOptions {
  nodeId: string
  cols: number
  rows: number
  cwd?: string
  shell?: string
  args?: string[]
}

export interface PtyDataEvent {
  nodeId: string
  data: string
}

export interface PtyExitEvent {
  nodeId: string
  exitCode: number
}

// API exposta em window.vexely pelo preload.
export interface VexelyApi {
  pty: {
    spawn(opts: PtySpawnOptions): Promise<void>
    write(nodeId: string, data: string): void
    resize(nodeId: string, cols: number, rows: number): void
    kill(nodeId: string): void
    onData(cb: (e: PtyDataEvent) => void): () => void
    onExit(cb: (e: PtyExitEvent) => void): () => void
  }
}
