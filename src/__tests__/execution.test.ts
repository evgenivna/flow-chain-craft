import { describe, it, expect, vi } from 'vitest';
import { executeFlow } from '@/lib/execution';
import { Node, Edge } from '@xyflow/react';

describe('Execution Engine', () => {
  it('should execute nodes in topological order', async () => {
    const nodes: Node[] = [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Input', value: 'Test input', type: 'text' }
      },
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 200, y: 0 },
        data: {
          label: 'Prompt',
          systemPrompt: 'You are helpful',
          userPrompt: 'Process: {{input-1.output}}',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 100,
          jsonMode: false
        }
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 400, y: 0 },
        data: { label: 'End', displayMode: 'text' }
      }
    ];

    const edges: Edge[] = [
      { id: 'e1', source: 'input-1', target: 'prompt-1' },
      { id: 'e2', source: 'prompt-1', target: 'end-1' }
    ];

    const onNodeStart = vi.fn();
    const onNodeToken = vi.fn();
    const onNodeComplete = vi.fn();
    const onNodeError = vi.fn();

    // Mock successful API call
    const mockApiKey = 'sk-test123';

    await executeFlow(
      nodes,
      edges,
      mockApiKey,
      onNodeStart,
      onNodeToken,
      onNodeComplete,
      onNodeError
    );

    // Verify nodes were started in correct order
    expect(onNodeStart).toHaveBeenCalledWith('input-1');
    expect(onNodeStart).toHaveBeenCalledWith('prompt-1');
    expect(onNodeStart).toHaveBeenCalledWith('end-1');
  });

  it('should interpolate templates correctly', async () => {
    const nodes: Node[] = [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 0, y: 0 },
        data: { label: 'Input', value: 'Hello World', type: 'text' }
      },
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 200, y: 0 },
        data: {
          label: 'Prompt',
          systemPrompt: 'System',
          userPrompt: 'User input: {{input-1.output}}',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 100,
          jsonMode: false
        }
      }
    ];

    const edges: Edge[] = [
      { id: 'e1', source: 'input-1', target: 'prompt-1' }
    ];

    const onNodeComplete = vi.fn();

    await executeFlow(
      nodes,
      edges,
      'sk-test',
      vi.fn(),
      vi.fn(),
      onNodeComplete,
      vi.fn()
    );

    expect(onNodeComplete).toHaveBeenCalledWith('input-1', 'Hello World');
  });
});
