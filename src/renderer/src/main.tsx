import { createRoot } from 'react-dom/client'
import '@xterm/xterm/css/xterm.css'
import './styles.css'
import { Terminal } from './Terminal'

createRoot(document.getElementById('root')!).render(<Terminal nodeId="terminal-1" />)
