# RESULTADO DOS TESTES: build 1 (rodada 1)

## Resumo
Aprovado com ressalva: pan e zoom passaram nos testes de uso real, nenhum bug foi encontrado, mas o fit view não foi confirmado com nós e o uso com o mouse e teclado do usuário ainda não foi feito.

## Tabela
| Foco | Teste | Resultado | Evidência | Bug encontrado |
|------|-------|-----------|-----------|----------------|
| Unitários | Board renderiza sem nós e sem arestas; minZoom 0.1; deleteKeyCode null; controles ligados (análise estática) | Passou (12/12) | tests/board.static.test.mjs | Nenhum |
| Casos de borda | Estado inicial sem props; arrays `nodes={[]}` e `edges={[]}` criados a cada render | Passou com observação | tests/board.static.test.mjs | Nenhum bloqueante (ver "Bugs abertos", item 1) |
| Segurança | Segredos em arquivos rastreados e .gitignore de .env | Passou | tests/seguranca-regressao.mjs | Nenhum |
| Segurança | npm audit --omit=dev | Passou (0 vulnerabilidades) | saída do comando | Nenhum |
| Segurança | contextIsolation e sandbox no Electron | Aviso: `sandbox: false` em src/main/index.ts:23 | tests/seguranca-regressao.mjs | Ver "Bugs abertos", item 2 |
| Regressão | `git diff main -- src/main src/shared` e contrato IPC do pty | Passou (diff vazio, canais preservados) | tests/seguranca-regressao.mjs | Nenhum |
| Regressão | npm run typecheck e npm run build | Passou (exit 0) | saída dos comandos | Nenhum |
| Uso real | Tela inicial: quadro escuro, 0 nós, transform translate(0,0) scale(1) | Passou | tests/01-inicial.jpg | Nenhum |
| Uso real | Pan arrastando o fundo | Passou (translate de 0,0 para -327px,-164px, scale 1) | tests/02-apos-pan.jpg | Nenhum |
| Uso real | Zoom pela roda, mínimo 0.1 | Passou (scale 0.5, 0.125, 0.1; não desce de 0.1; botão zoom out desabilitado) | tests/03-apos-zoom-e-controles.jpg | Nenhum |
| Uso real | Controle zoom in | Passou (0.1 para 0.12) | leitura do transform | Nenhum |
| Uso real | Controle zoom out | Passou (0.12 para 0.1, limitado pelo mínimo) | leitura do transform | Nenhum |
| Uso real | Controle fit view | Não testado de forma conclusiva (transform não mudou, o quadro não tem nós para enquadrar) | tests/03-apos-zoom-e-controles.jpg | Nenhum confirmado |

## Bugs abertos (para o térreo corrigir)
1. **Baixa:** `src/renderer/src/Board.tsx:6-7`: `nodes={[]}` e `edges={[]}` criam arrays novos a cada render. Hoje não causa problema, porque Board não tem estado. Reproduzir: não há reprodução na build 1. Ação sugerida: mover para constantes fora do componente antes da build 2, quando houver estado.
2. **Média (se o renderer passar a carregar conteúdo externo, sobe para alta):** `src/main/index.ts:23` tem `sandbox: false`. Reproduzir: ler src/main/index.ts. Já existia antes da build 1.
3. **Média (já existia antes desta build):** o preload expõe `window.vexely.pty.spawn`, que aceita shell, args e cwd vindos do renderer (src/main/index.ts:31-35). Qualquer código rodando no renderer pode abrir um shell arbitrário. Reproduzir: chamar window.vexely.pty.spawn no console do renderer. Para revisão, não bloqueia a build 1.
4. **Baixa (limpeza):** `Terminal.tsx` está sem uso, e `package.json` ainda tem `@xterm/*` e `node-pty`.
5. **Pendência de teste:** fit view só deve ser confirmado com nós, na build 2.

## O que passou sem problemas
- Quadro abre escuro e sem nós.
- Pan arrastando o fundo move o quadro.
- Zoom pela roda respeita o mínimo de 0.1.
- Controles zoom in e zoom out funcionam.
- npm run typecheck e npm run build passam.
- npm audit não encontra vulnerabilidades em dependências de produção.
- Não há regressão no código do main e no contrato IPC.

## Observações de ambiente
- O Playwright não abriu o Chromium (`/opt/google/chrome/chrome` não encontrado). O uso real foi feito com claude-in-chrome, sobre o dev server em localhost:5173, não na janela do Electron.
- O uso com o mouse e teclado do usuário no app Electron ainda não foi feito, porque o Computer use não está ligado nesta conversa.
- Screenshots "antes" de cada ação não foram salvos; só o inicial e os finais.
