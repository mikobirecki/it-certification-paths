import type React from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'

import LegendPanel from './LegendPanel'
import CertNode from './CertNode'
import TrainingEdge from './TrainingEdge'

const nodeTypes = { certNode: CertNode }
const edgeTypes = { training: TrainingEdge }

type GraphViewProps = {
  nodes: Node[]
  edges: Edge[]
  onNodeClick: (event: React.MouseEvent, node: { id: string }) => void
  onEdgeClick: (event: React.MouseEvent, edge: { data?: { trainingUrl?: string } }) => void
}

export default function GraphView({ nodes, edges, onNodeClick, onEdgeClick }: GraphViewProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnDrag
      panOnScroll
      zoomOnScroll={false}
      zoomOnPinch
      zoomOnDoubleClick={false}
      minZoom={0.3}
      maxZoom={2}
    >
      <Controls showInteractive={false} />
      <LegendPanel />
      <Background />
    </ReactFlow>
  )
}
