import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC, type PtyDataEvent, type PtyExitEvent, type VexelyApi } from '../shared/ipc'

function listen<T>(channel: string, cb: (e: T) => void): () => void {
  const handler = (_e: IpcRendererEvent, payload: T): void => cb(payload)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

const api: VexelyApi = {
  pty: {
    spawn: (opts) => ipcRenderer.invoke(IPC.ptySpawn, opts),
    write: (nodeId, data) => ipcRenderer.send(IPC.ptyWrite, nodeId, data),
    resize: (nodeId, cols, rows) => ipcRenderer.send(IPC.ptyResize, nodeId, cols, rows),
    kill: (nodeId) => ipcRenderer.send(IPC.ptyKill, nodeId),
    onData: (cb) => listen<PtyDataEvent>(IPC.ptyData, cb),
    onExit: (cb) => listen<PtyExitEvent>(IPC.ptyExit, cb)
  }
}

contextBridge.exposeInMainWorld('vexely', api)
