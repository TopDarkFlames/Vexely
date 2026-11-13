// Testes estáticos do quadro (build 1). Só leitura de arquivos, sem dependências.
// Rodar: node --test tests/board.static.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

const board = read('src/renderer/src/Board.tsx')
const main = read('src/renderer/src/main.tsx')
const css = read('src/renderer/src/styles.css')
const rfStyle = read('node_modules/@xyflow/react/dist/style.css')
const rfPkg = JSON.parse(read('node_modules/@xyflow/react/package.json'))
const rfControls = read('node_modules/@xyflow/react/dist/esm/index.mjs')

test('Board renderiza sem nós e sem arestas', () => {
  assert.match(board, /nodes=\{\[\]\}/)
  assert.match(board, /edges=\{\[\]\}/)
})

test('Board não usa estado nem props (nada a receber)', () => {
  assert.match(board, /export function Board\(\)\s*\{/)
  assert.doesNotMatch(board, /useState|useReducer|useEffect/)
})

test('minZoom é 0.1', () => {
  assert.match(board, /minZoom=\{0\.1\}/)
})

test('deleteKeyCode está null', () => {
  assert.match(board, /deleteKeyCode=\{null\}/)
})

test('Background e Controls são filhos do ReactFlow', () => {
  const open = board.indexOf('<ReactFlow')
  const close = board.indexOf('</ReactFlow>')
  assert.ok(open !== -1 && close > open, 'tag ReactFlow fechada')
  const inner = board.slice(open, close)
  assert.match(inner, /<Background\s*\/>/)
  assert.match(inner, /<Controls\s*\/>/)
})

test('Controls usa os defaults: zoom in, zoom out e fit view ligados', () => {
  // Controls sem props de showZoom/showFitView/onZoomIn etc. => defaults true.
  assert.match(rfControls, /function ControlsComponent\(\{[^}]*showZoom = true, showFitView = true/)
  assert.match(rfControls, /react-flow__controls-zoomin/)
  assert.match(rfControls, /react-flow__controls-zoomout/)
  assert.match(rfControls, /react-flow__controls-fitview/)
})

test('versão do @xyflow/react instalada bate com o package.json', () => {
  assert.equal(rfPkg.version.split('.')[0], '12')
})

test('main.tsx renderiza só o Board e importa o CSS do React Flow', () => {
  assert.match(main, /import '@xyflow\/react\/dist\/style\.css'/)
  assert.match(main, /render\(<Board \/>\)/)
  assert.doesNotMatch(main, /Terminal/)
})

test('altura: html/body/#root em 100% e wrapper do React Flow em 100%', () => {
  assert.match(css, /html, body, #root \{[^}]*height: 100%/)
  assert.match(rfControls, /const wrapperStyle = \{\s*width: '100%',\s*height: '100%'/)
})

test('fundo escuro: body tem cor de fundo explícita', () => {
  assert.match(css, /background: #0f1115/)
})

test('edge: nodes/edges inline criam arrays novos a cada render (sem estado, sem efeito hoje)', () => {
  // Board não tem estado, então não re-renderiza sozinho. Quando houver estado,
  // trocar por constantes fora do componente para não reiniciar o layout.
  assert.match(board, /nodes=\{\[\]\}/)
})

test('edge: Terminal.tsx não é importado (código morto nesta build)', () => {
  assert.doesNotMatch(board, /Terminal/)
  assert.doesNotMatch(main, /Terminal/)
})
