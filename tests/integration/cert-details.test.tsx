import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/components/GraphView', () => ({
  default: ({
    nodes,
    onNodeClick,
  }: {
    nodes: Array<{ id: string; data?: { cert?: { title?: string } } }>
    onNodeClick: (event: React.MouseEvent, node: { id: string }) => void
  }) => (
    <div data-testid="mock-graph-view">
      {nodes.slice(0, 3).map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onNodeClick({} as React.MouseEvent, { id: node.id })}
        >
          {node.data?.cert?.title ?? node.id}
        </button>
      ))}
    </div>
  ),
}))

import App from '../../src/App'

describe('certification details panel', () => {
  it('shows and closes details when certification is selected', () => {
    render(<App />)

    const nodeButton = screen.getAllByRole('button').find((button) =>
      button.closest('[data-testid="mock-graph-view"]'),
    )

    expect(nodeButton).toBeDefined()
    fireEvent.click(nodeButton as HTMLButtonElement)

    expect(screen.getByTestId('node-details-panel')).toBeInTheDocument()
    expect(screen.getByText('Official certification page')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByTestId('node-details-panel')).not.toBeInTheDocument()
  })
})
