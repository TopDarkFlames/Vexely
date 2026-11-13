// Teste de segurança básica e regressão da build 1. Sem dependências: node tests/seguranca-regressao.mjs
import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const read = (p) => readFileSync(join(root, p), 'utf8')

let falhas = 0
function teste(nome, fn) {
  try {
    fn()
    console.log(`PASSOU  ${nome}`)
  } catch (e) {
    falhas++
    console.log(`FALHOU  ${nome}\n        ${String(e.message).split('\n').slice(0, 4).join('\n        ')}`)
  }
}

// --- Segurança ---
teste('.gitignore cobre .env e .env.*, exceto .env.example', () => {
  const gi = read('.gitignore')
  assert.match(gi, /^\.env$/m)
  assert.match(gi, /^\.env\.\*$/m)
  assert.match(gi, /^!\.env\.example$/m)
})

teste('nenhum arquivo .env ou chave/credencial rastreado pelo git', () => {
  const arquivos = sh('git ls-files').split('\n')
  const suspeitos = arquivos.filter((f) => /(^|\/)\.env(\.|$)|\.(pem|p12|key|pfx)$|credential|secret/i.test(f))
  assert.deepEqual(suspeitos, [])
})

teste('nenhum padrão de segredo em arquivos rastreados', () => {
  const padroes = [
    /AKIA[0-9A-Z]{16}/,
    /ghp_[A-Za-z0-9]{36}/,
    /sk-[A-Za-z0-9]{32,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/
  ]
  const arquivos = sh('git ls-files').split('\n').filter((f) => f && !f.endsWith('package-lock.json'))
  const achados = []
  for (const f of arquivos) {
    let txt
    try { txt = read(f) } catch { continue }
    for (const p of padroes) if (p.test(txt)) achados.push(`${f} (${p})`)
  }
  assert.deepEqual(achados, [])
})

teste('BrowserWindow mantém contextIsolation true e nodeIntegration ausente/false', () => {
  const main = read('src/main/index.ts')
  assert.match(main, /contextIsolation:\s*true/)
  assert.doesNotMatch(main, /nodeIntegration:\s*true/)
})

// Aviso, não conta como falha: sandbox está false em src/main/index.ts:23.
if (!/sandbox:\s*true/.test(read('src/main/index.ts')))
  console.log('AVISO   sandbox do renderer está false (src/main/index.ts:23), não é falha do teste')

teste('preload expõe só a API vexely (sem ipcRenderer/require cru)', () => {
  const pre = read('src/preload/index.ts')
  assert.match(pre, /contextBridge\.exposeInMainWorld\('vexely'/)
  assert.doesNotMatch(pre, /exposeInMainWorld\('(ipcRenderer|require|process)'/)
  assert.doesNotMatch(pre, /window\.(require|ipcRenderer)/)
})

// --- Regressão ---
teste('src/main e src/shared idênticos ao main (git diff vazio)', () => {
  const diff = sh('git diff main -- src/main src/shared')
  assert.equal(diff, '', 'houve mudança em src/main ou src/shared')
})

teste('npm run typecheck termina com código 0', () => {
  sh('npm run typecheck')
})

teste('npm run build termina com código 0', () => {
  sh('npm run build')
})

teste('contrato IPC preservado (canais pty:*)', () => {
  const ipc = read('src/shared/ipc.ts')
  for (const canal of ["'pty:spawn'", "'pty:write'", "'pty:resize'", "'pty:kill'", "'pty:data'", "'pty:exit'"]) {
    assert.ok(ipc.includes(canal), `canal ausente: ${canal}`)
  }
})

console.log(falhas === 0 ? '\nTudo ok.' : `\n${falhas} teste(s) falharam.`)
process.exit(falhas === 0 ? 0 : 1)
