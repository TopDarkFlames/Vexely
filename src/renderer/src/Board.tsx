import { Background, Controls, ReactFlow } from '@xyflow/react'

export function Board() {
  return (
    <ReactFlow
      nodes={[]}
      edges={[]}
      // Sem nós ainda; Delete/Backspace desligados para quando houver terminais.
      deleteKeyCode={null}
      minZoom={0.1}
      colorMode="dark"
    >
      <Background />
      <Controls />
    </ReactFlow>
  )
}
