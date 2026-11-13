# BACKLOG do Vexely

Fonte: `docs/PLANO.md` (seção 6, ordem do MVP), com o ajuste aprovado pelo usuário. Cada item vira uma build (`teste-N`). O primeiro item não concluído é a build atual.

## Concluídos

- [x] **0. Esqueleto do projeto** — Electron + React + TypeScript, contrato de IPC em `src/shared/ipc.ts`, terminal único de teste (commit `8e1f3a4`).

## Pendentes

- [ ] **1. Quadro infinito** — pronta na `teste-1` (PR #1, aguardando merge do usuário)
  - Quadro com pan e zoom (React Flow, `@xyflow/react`).
  - Nenhum terminal nesta build: só o quadro vazio navegável.

- [ ] **2. Terminais no quadro** ← build 2 (`teste-2`)
  - Criar, arrastar e fechar terminais.
  - Ligar o sandbox do Electron (`sandbox: true` em `src/main/index.ts`) com teste próprio que confirme que o renderer continua funcionando.
  - Mover o `ipcMain.handle` do `pty.spawn` para fora do `createWindow`, para registrar os handlers uma única vez.
  - Ressalva do zoom pela roda: o passo 4 do roteiro não para em exatamente 1; passa de 1 para 2. Corrigir e cobrir com teste.
  - Fit view só é conclusivo com nós: testar nesta build.
  - Ressalvas da build 1 que sobram: arrays `nodes={[]}` e `edges={[]}` fora do componente (`Board.tsx`); remover `Terminal.tsx` sem uso e dependências `@xterm/*` que ficarem sem uso.
  - Nó `TerminalNode` com terminal real (xterm.js + node-pty já ligados por IPC).
  - WebGL só no terminal focado; os demais usam o renderizador DOM.
  - Zoom sem `fit()` a cada passo: ajustar o terminal só quando o zoom parar.

- [ ] **3. Salvar e carregar o quadro**
  - `WorkspaceStore` em JSON com gravação atômica (arquivo temporário → rename).
  - Guardar posição, tamanho, pasta e CLI de cada nó.

- [ ] **4. Status por hooks do Claude Code**
  - `HookServer` em `localhost` recebendo POST dos hooks (`UserPromptSubmit`, `PreToolUse`, `Notification`, `Stop`).
  - Variável `BOARD_NODE_ID` em cada pty para ligar o hook ao nó.
  - Selo em cada terminal: trabalhando / parado / esperando você.

- [ ] **5. Retomar sessões**
  - Guardar o ID da sessão de cada nó e, ao reabrir, rodar `claude --resume <id>`.

- [ ] **6. Notas e kanban**
  - Nó `NoteNode` e nó `KanbanNode` (kanban com `dnd-kit`).

## Fora do MVP

- Voz com whisper.cpp.
- Empacotamento e distribuição (electron-builder, electron-updater, GitHub Actions).

## Pendências do plano

- Confirmar formato atual dos hooks do Codex e do Gemini CLI.
- Benchmark com 10–20 terminais ativos.
