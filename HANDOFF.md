# HANDOFF: build 1

## O que foi feito nesta build
- Novo componente `src/renderer/src/Board.tsx`: quadro infinito com React Flow (`@xyflow/react` 12.12.0), com pan, zoom (minZoom 0.1), fundo pontilhado e controles de zoom. Sem nós e sem terminais.
- `src/renderer/src/main.tsx` agora renderiza só o `Board` e importa o CSS do React Flow.
- `package.json` e `package-lock.json`: dependência `@xyflow/react` ^12.12.0.
- `Terminal.tsx` e `styles.css` ficaram intactos, mas `Terminal.tsx` não é usado nesta build.
- `src/main/index.ts` e `src/shared/ipc.ts` não foram alterados.

## Como instalar e rodar
```
npm install
npm run dev
```
Verificação: `npm run typecheck` e `npm run build`.

## O que deve funcionar (critérios de aceite)
- A janela abre mostrando um quadro escuro, sem nenhum nó.
- Arrastar o fundo com o mouse move o quadro (pan).
- Roda do mouse dá zoom, com limite mínimo de 0.1.
- Os controles no canto (zoom in, zoom out, fit view) funcionam.
- `npm run typecheck` e `npm run build` terminam com código 0.

## O que testar de novo (regressão)
- Nenhuma regressão esperada: o app anterior era só um terminal de teste, que sai desta build.

## Pontos de risco
- Pan e zoom na tela não foram verificados ao vivo: o app não foi aberto no build de verificação.
- `Terminal.tsx` está sem uso e pode ser removido ou reaproveitado na build 2.
- `deleteKeyCode` está desligado (`null`) para não apagar nada até existirem nós.

## Testes que já existem
Nenhum teste automatizado. Verificação atual: `npm run typecheck` e `npm run build`.
