import { Node, Edge } from '@xyflow/react';
import { chatCompletion } from './chatgpt';
import { PromptNodeData } from '@/types/flow';

interface ExecutionContext {
  [nodeId: string]: any;
}

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    graph.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  const queue: Node[] = [];
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node);
    }
  });
  
  const sorted: Node[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    
    graph.get(node.id)?.forEach(targetId => {
      const newDegree = (inDegree.get(targetId) || 0) - 1;
      inDegree.set(targetId, newDegree);
      if (newDegree === 0) {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) queue.push(targetNode);
      }
    });
  }
  
  return sorted;
}

function interpolateTemplate(template: string, context: ExecutionContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const parts = path.trim().split('.');
    let value: any = context;
    for (const part of parts) {
      value = value?.[part];
    }
    return value !== undefined ? String(value) : '';
  });
}

export async function executeFlow(
  nodes: Node[],
  edges: Edge[],
  apiKey: string,
  onNodeStart: (nodeId: string) => void,
  onNodeToken: (nodeId: string, token: string) => void,
  onNodeComplete: (nodeId: string, output: string) => void,
  onNodeError: (nodeId: string, error: string) => void
): Promise<void> {
  const sortedNodes = topologicalSort(nodes, edges);
  const context: ExecutionContext = {};
  
  for (const node of sortedNodes) {
    try {
      onNodeStart(node.id);
      
      if (node.type === 'input') {
        const value = (node.data as any).value || '';
        context[node.id] = { output: value };
        onNodeComplete(node.id, value);
      } else if (node.type === 'prompt') {
        const data = node.data as any as PromptNodeData;
        const systemPrompt = interpolateTemplate(data.systemPrompt, context);
        const userPrompt = interpolateTemplate(data.userPrompt, context);
        
        let fullOutput = '';
        
        await chatCompletion({
          apiKey,
          model: data.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          jsonMode: data.jsonMode,
          stream: true,
          onToken: (token) => {
            fullOutput += token;
            onNodeToken(node.id, token);
          },
          onComplete: (output) => {
            context[node.id] = { output };
            onNodeComplete(node.id, output);
          },
          onError: (error) => {
            throw error;
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } else if (node.type === 'end') {
        const incomingEdges = edges.filter(e => e.target === node.id);
        if (incomingEdges.length > 0) {
          const sourceId = incomingEdges[0].source;
          const output = context[sourceId]?.output || '';
          context[node.id] = { output };
          onNodeComplete(node.id, output);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onNodeError(node.id, errorMsg);
      throw error;
    }
  }
}
