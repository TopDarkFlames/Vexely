import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export function Terminal({ nodeId }: { nodeId: string }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = new XTerm({ fontFamily: 'monospace', fontSize: 14, cursorBlink: true })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(hostRef.current!)
    fit.fit()

    const { pty } = window.vexely
    const offData = pty.onData((e) => e.nodeId === nodeId && term.write(e.data))
    const offExit = pty.onExit((e) => e.nodeId === nodeId && term.write('\r\n[processo encerrado]\r\n'))
    const input = term.onData((data) => pty.write(nodeId, data))
    pty.spawn({ nodeId, cols: term.cols, rows: term.rows })
    term.focus()

    const observer = new ResizeObserver(() => {
      fit.fit()
      pty.resize(nodeId, term.cols, term.rows)
    })
    observer.observe(hostRef.current!)

    return () => {
      observer.disconnect()
      input.dispose()
      offData()
      offExit()
      pty.kill(nodeId)
      term.dispose()
    }
  }, [nodeId])

  return <div ref={hostRef} className="terminal-host" />
}
