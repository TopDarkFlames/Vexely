import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import os from 'node:os'
import * as pty from 'node-pty'
import { IPC, type PtySpawnOptions } from '../shared/ipc'

// shortcut: um pty por nó, sem envio em lotes; o PtyManager da tarefa 2 substitui isto.
const ptys = new Map<string, pty.IPty>()

function defaultShell(): string {
  if (process.platform === 'win32') return process.env.COMSPEC || 'powershell.exe'
  return process.env.SHELL || '/bin/bash'
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  ipcMain.handle(IPC.ptySpawn, (_e, opts: PtySpawnOptions) => {
    ptys.get(opts.nodeId)?.kill()
    const p = pty.spawn(opts.shell ?? defaultShell(), opts.args ?? [], {
      name: 'xterm-256color',
      cols: opts.cols,
      rows: opts.rows,
      cwd: opts.cwd ?? os.homedir(),
      env: { ...process.env, BOARD_NODE_ID: opts.nodeId } as Record<string, string>
    })
    p.onData((data) => win.webContents.send(IPC.ptyData, { nodeId: opts.nodeId, data }))
    p.onExit(({ exitCode }) => {
      ptys.delete(opts.nodeId)
      if (!win.isDestroyed()) win.webContents.send(IPC.ptyExit, { nodeId: opts.nodeId, exitCode })
    })
    ptys.set(opts.nodeId, p)
  })
  ipcMain.on(IPC.ptyWrite, (_e, nodeId: string, data: string) => ptys.get(nodeId)?.write(data))
  ipcMain.on(IPC.ptyResize, (_e, nodeId: string, cols: number, rows: number) =>
    ptys.get(nodeId)?.resize(cols, rows)
  )
  ipcMain.on(IPC.ptyKill, (_e, nodeId: string) => ptys.get(nodeId)?.kill())

  if (process.env.ELECTRON_RENDERER_URL) win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else win.loadFile(join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  for (const p of ptys.values()) p.kill()
  ptys.clear()
  app.quit()
})
