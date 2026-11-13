# RESULTADO DOS TESTES: build 1 (rodada 3)

## Resumo
Aprovado com ressalva. Na rodada 3 o quadro (pan, zoom, controles) passou no navegador. A correção do `pty.spawn` foi conferida pela leitura do código e os testes estáticos passam, mas o comportamento de `pty.spawn` e do canal IPC em execução depende do Electron, e esse teste ficou para você (seção "Pendente para o usuário"). Nenhum bug bloqueante foi encontrado.

## Histórico
- Rodada 1: aprovado com ressalva (pan e zoom no navegador).
- Rodada 2: Electron por automação (7/7) e registro de abertura e fechamento do app.
- Rodada 3 (commit 04b771f do térreo): correção do `pty.spawn` e teste do quadro no navegador.

## Tabela
| Foco | Teste | Resultado | Evidência | Bug encontrado |
|------|-------|-----------|-----------|----------------|
| (a) pty.spawn | shell e args vindos do renderer são ignorados | Não testado em execução (depende do Electron). Conferido no código: `pty.spawn(defaultShell(), [], …)` em src/main/index.ts:45; `shell` e `args` removidos de `PtySpawnOptions` em src/shared/ipc.ts | Código: src/main/index.ts:45, src/shared/ipc.ts | Nenhum no código |
| (a) pty.spawn | cwd inválido ou fora da pasta pessoal cai na pasta pessoal | Não testado em execução. Conferido no código: `safeCwd` (src/main/index.ts:16-27) retorna a pasta pessoal para cwd não absoluto, inexistente, não diretório ou fora de ~ | Código: src/main/index.ts:16-27 | Nenhum no código |
| (b) terminal | criar terminal e digitar pelo canal IPC | Não testado em execução (depende do Electron). No navegador `window.vexely` não existe (undefined), porque o preload só carrega no Electron | Verificado no navegador: `typeof window.vexely` = "undefined" | Nenhum confirmado |
| (c) quadro | quadro sem nós | Passou | Navegador: 0 nós, bg rgb(15, 17, 21) | Nenhum |
| (c) quadro | pan arrastando o fundo | Passou (matrix(1,0,0,1,0,0) → matrix(1,0,0,1,-326,-82) com arrasto no navegador) | Navegador, computer drag | Nenhum |
| (c) quadro | zoom pela roda, mínimo 0.1 | Passou (10 ticks → 0.25; 20 ticks → 0.1; mais roladas não descem) | Navegador, scroll | Nenhum |
| (c) quadro | botão zoom out desabilita em 0.1 | Passou (disabled = true em 0.1) | Navegador | Nenhum |
| (c) quadro | controles zoom in e zoom out | Passou (0.1 → 0.12 → 0.1; zoom out em 0.1 não muda nada) | Navegador, clique real | Nenhum |
| (c) quadro | fit view | Não conclusivo: sem nós, o transform não muda | Navegador, clique real | Nenhum confirmado |
| Regressão | typecheck e build | Passou (exit 0) | saída dos comandos | Nenhum |
| Regressão | board estático (12 testes) | Passou | `node --test tests/board.static.test.mjs` | Nenhum |
| Regressão | segurança e regressão (`tests/seguranca-regressao.mjs`) | 9 passaram, 1 falhou (ver nota) | saída do script | Nenhum (falha esperada, ver nota) |

**Nota sobre a falha em `tests/seguranca-regressao.mjs`:** o teste "src/main e src/shared idênticos ao main" compara com a `main`. A rodada 3 mudou exatamente esses arquivos (a correção do pty), então a diferença é a correção pedida, não regressão. O assert é que ficou desatualizado para esta build.

## Bugs abertos (para o térreo corrigir)
1. **Baixa:** `src/renderer/src/Board.tsx:6-7`: `nodes={[]}` e `edges={[]}` criam arrays novos a cada render. Ação: constantes fora do componente, na build 2.
2. **Média (alta se o renderer carregar conteúdo externo):** `src/main/index.ts:23` tem `sandbox: false`. Já existia antes da build 1.
3. **Baixa (limpeza):** `Terminal.tsx` está sem uso. `@xterm/*` e `node-pty` continuam no package.json; `node-pty` ainda é usado pelo main.
4. **Baixa:** `ipcMain.handle` em `createWindow` (src/main/index.ts). Se houver segunda janela, o handler é registrado de novo e lança erro. Hoje não ocorre.
5. **Pendência:** fit view só fica conclusivo com nós (build 2).

## Pendente para o usuário (Electron, mouse e teclado reais)
Não automatizei (a) e (b) no Electron nesta rodada: a tentativa com Playwright `_electron` fechou a janela antes de terminar o teste (o `Target page … has been closed` apareceu sem exceção no renderer), então não confio no resultado. Roteiro sugerido:
1. Abra o app (`npm run dev`) e confirme que não há outra instância aberta antes.
2. Abra o console do renderer e rode `window.vexely.pty.spawn({nodeId:'t1', cols:80, rows:24, shell:'/bin/sh', args:['-c','touch /tmp/vexely-pwn-teste'], cwd:'/tmp'})`. Resultado esperado: o arquivo `/tmp/vexely-pwn-teste` NÃO é criado, e o terminal abre no shell padrão em ~ (cwd `/tmp` fora da pasta pessoal cai em ~).
3. Confira com `window.vexely.pty.spawn({nodeId:'t2', cols:80, rows:24, cwd:'/nao/existe'})` e `window.vexely.pty.write('t2', 'pwd\r')` com `window.vexely.pty.onData` logando a saída. Resultado esperado: a saída mostra a pasta pessoal.
4. Digite via IPC: `window.vexely.pty.write('t2', 'echo ola-$((1+1))\r')`. Resultado esperado: a saída do `onData` contém `ola-2`.
5. Feche o app com Super+W e confirme que o processo termina.

O arquivo `TESTE-MANUAL-BUILD1.md` (raiz) e os `tests/manual-*.png` continuam como estão, fora do commit, porque o teste manual é seu. Ele descreve o pty como reproduzido, antes da correção da rodada 3, e pode ser atualizado.

## O que passou sem problemas
- Quadro sem nós, pan, zoom com mínimo 0.1, zoom in e zoom out, controle de zoom out desabilitado em 0.1 (navegador).
- Correção do pty conferida no código: shell e args fixos no main, cwd validado, `shell`/`args` removidos do contrato IPC.
- Typecheck e build passam; board estático passa.
