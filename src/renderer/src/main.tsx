import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import './styles.css'
import { Board } from './Board'

createRoot(document.getElementById('root')!).render(<Board />)
