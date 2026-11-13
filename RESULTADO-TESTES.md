# RESULTADO DOS TESTES: build 1 (rodada 2)

## Resumo
Aprovado com ressalva: pan e zoom passaram no navegador e no Electron real (por automação). Nenhum bug bloqueante. O fit view só será conclusivo com nós (build 2), e o teste manual com mouse e teclado ficou para você (roteiro abaixo).

## Tabela
| Foco | Teste | Resultado | Evidência | Bug encontrado |
|------|-------|-----------|-----------|----------------|
| Unitários | Board sem nós e sem arestas; minZoom 0.1; deleteKeyCode null; controles ligados (análise estática) | Passou (`node tests/board.static.test.mjs`, exit 0) | tests/board.static.test.mjs | Nenhum |
| Casos de borda | Arrays `nodes={[]}` e `edges={[]}` criados a cada render | Passou com observação | tests/board.static.test.mjs | Ver "Bugs abertos", item 1 |
| Segurança | Segredos em arquivos rastreados; .gitignore de .env | Passou | tests/seguranca-regressao.mjs ("Tudo ok.") | Nenhum |
| Segurança | npm audit --omit=dev | Passou (0 vulnerabilidades) | saída do comando | Nenhum |
| Segurança | contextIsolation e sandbox no Electron | Aviso: `sandbox: false` em src/main/index.ts:23 | tests/seguranca-regressao.mjs | Ver "Bugs abertos", item 2 |
| Regressão | `git diff main -- src/main src/shared` e contrato IPC do pty | Passou | tests/seguranca-regressao.mjs | Nenhum |
| Regressão | npm run typecheck e npm run build | Passou (exit 0) | saída dos comandos | Nenhum |
| Electron (automação) | Quadro sem nós | Passou | tests/electron-pan-zoom.mjs | Nenhum |
| Electron (automação) | Pan arrastando o fundo | Passou (matrix(1,0,0,1,0,0) -> matrix(1,0,0,1,-150,-80)) | tests/electron-pan-zoom.mjs | Nenhum |
| Electron (automação) | Zoom pela roda, mínimo 0.1 | Passou (scale 0.1) | tests/electron-pan-zoom.mjs | Nenhum |
| Electron (automação) | Controle zoom in e zoom out | Passou (0.1 -> 0.12 -> 0.1) | tests/electron-pan-zoom.mjs | Nenhum |
| Electron (automação) | Fit view | Botão existe e é clicável; resultado conclusivo depende de nós | tests/electron-pan-zoom.mjs | Nenhum confirmado |
| Navegador | Pan, zoom pela roda, mínimo 0.1, controles zoom in/out | Passou (agente de uso real, claude-in-chrome) | tests/01-inicial.jpg, tests/02-apos-pan.jpg, tests/03-apos-zoom-e-controles.jpg | Nenhum |
| Navegador | Fit view | Não conclusivo (sem nós) | tests/03-apos-zoom-e-controles.jpg | Nenhum confirmado |

## Separação por origem
**Testado no navegador (localhost:5173):** tela inicial, pan, zoom pela roda, mínimo 0.1, zoom in e zoom out. Fit view não conclusivo.

**Testado no Electron por automação** (`tests/electron-pan-zoom.mjs`, Playwright `_electron` com o `out/main/index.js` da build): 7/7 passaram. Cobre quadro sem nós, pan, zoom pela roda com mínimo 0.1, zoom in e zoom out, existência e clique do fit view. Playwright fica no scratchpad, fora do repositório, para não mexer no package.json.

**Testes automáticos sem UI:** board estático (12 testes), segurança e regressão, typecheck, build e npm audit.

**Ficou para você testar manualmente** (roteiro, janela do Vexely):
1. Abra o app com `npm run dev`. Resultado esperado: janela escura, sem nenhum nó, com os controles no canto.
2. Clique e arraste o fundo com o mouse. Resultado esperado: o quadro se move junto com o arrasto, sem puxar nenhum nó.
3. Role a roda do mouse para baixo várias vezes. Resultado esperado: o zoom diminui e para em 0.1; mais roladas não diminuem.
4. Role para cima até o zoom voltar a 1 e confira que o zoom sobe sem travar.
5. Clique nos botões (+), (-) e no de fit view. Resultado esperado: + e - mudam o zoom; fit view não quebra a tela (sem nós, nada muda).
6. Tecle Delete com o quadro em foco. Resultado esperado: nada acontece, porque não há nós para apagar.
7. Feche e reabra o app. Resultado esperado: abre de novo no mesmo estado inicial, sem erro no terminal.

## Bugs abertos (para o térreo corrigir)
1. **Baixa:** `src/renderer/src/Board.tsx:6-7`: `nodes={[]}` e `edges={[]}` criam arrays novos a cada render. Não há reprodução na build 1. Ação sugerida: mover para constantes fora do componente antes da build 2.
2. **Média (alta se o renderer passar a carregar conteúdo externo):** `src/main/index.ts:23` tem `sandbox: false`. Já existia antes da build 1.
3. **Média (já existia):** o preload expõe `window.vexely.pty.spawn`, que aceita shell, args e cwd vindos do renderer (src/main/index.ts:31-35). Reproduzir: chamar `window.vexely.pty.spawn` no console do renderer. Não bloqueia a build 1.
4. **Baixa (limpeza):** `Terminal.tsx` está sem uso, e `package.json` ainda tem `@xterm/*` e `node-pty`.
5. **Pendência:** fit view só deve ser confirmado com nós, na build 2.

## O que passou sem problemas
- Quadro abre escuro e sem nós, no navegador e no Electron.
- Pan move o quadro, no navegador e no Electron.
- Zoom pela roda respeita o mínimo de 0.1, nos dois.
- Controles zoom in e zoom out funcionam, nos dois.
- Typecheck, build e npm audit passam; regressão de src/main e do contrato IPC sem mudanças.

## Observações de ambiente
- O Playwright padrão não abriu o Chromium (`/opt/google/chrome/chrome` não encontrado). O navegador foi testado com claude-in-chrome.
- O Electron foi testado com `_electron` do Playwright, com DISPLAY=:0 e `--no-sandbox` só para o teste.
- Computer use não está ligado, então o mouse e o teclado reais do usuário ainda não foram usados.
