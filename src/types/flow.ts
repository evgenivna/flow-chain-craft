export interface InputNodeData {
  label: string;
  value: string;
  type: 'text' | 'json';
}

export interface PromptNodeData {
  label: string;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  jsonMode: boolean;
  output?: string;
  isRunning?: boolean;
  error?: string;
  status?: 'idle' | 'running' | 'streaming' | 'done' | 'error';
}

export interface EndNodeData {
  label: string;
  output?: string;
  displayMode: 'text' | 'markdown' | 'json';
  status?: 'idle' | 'done';
}

export type NodeData = InputNodeData | PromptNodeData | EndNodeData;
