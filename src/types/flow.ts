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
}

export interface EndNodeData {
  label: string;
  output?: string;
  displayMode: 'text' | 'markdown' | 'json';
}

export type NodeData = InputNodeData | PromptNodeData | EndNodeData;
