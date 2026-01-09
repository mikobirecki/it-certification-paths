import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

type TrainingEdgeData = {
  type: 'required' | 'recommended'
  trainingUrl?: string
  trainingTitle?: string
}

export default function TrainingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const edgeData = data as TrainingEdgeData | undefined
  const isRequired = edgeData?.type === 'required'
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleClick = () => {
    if (edgeData?.trainingUrl) {
      window.open(edgeData.trainingUrl, '_blank', 'noreferrer')
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isRequired ? '#f1f5f9' : '#64748b',
          strokeWidth: isRequired ? 2.5 : 1.5,
          strokeDasharray: isRequired ? undefined : '6 4',
        }}
        markerEnd={isRequired ? 'url(#arrow-required)' : 'url(#arrow-recommended)'}
      />
      {edgeData?.trainingTitle && (
        <EdgeLabelRenderer>
          <div
            onClick={handleClick}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              cursor: edgeData.trainingUrl ? 'pointer' : 'default',
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {edgeData.trainingTitle}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
