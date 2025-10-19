import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PromptNodeData } from '@/types/flow';

function PromptNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as PromptNodeData;

  const getStatusColor = () => {
    if (nodeData.error) return 'border-destructive';
    if (nodeData.isRunning) return 'border-node-running';
    if (nodeData.output) return 'border-node-done';
    return 'border-border';
  };

  const getStatusIcon = () => {
    if (nodeData.error) return '❌';
    if (nodeData.isRunning) return '⚡';
    if (nodeData.output) return '✅';
    return '🤖';
  };

  const displayPrompt = nodeData.userPrompt 
    ? (nodeData.userPrompt.length > 80 ? nodeData.userPrompt.slice(0, 80) + '...' : nodeData.userPrompt)
    : 'Click to configure prompt';

  return (
    <div className="min-w-[220px] max-w-[320px]">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className={`bg-card border-2 rounded-lg p-4 shadow-sm transition-all ${
        selected ? 'border-primary shadow-md' : getStatusColor()
      }`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xl">{getStatusIcon()}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">AI Prompt</div>
            <div className="text-xs text-muted-foreground">
              {nodeData.model || 'gpt-4'}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono mb-2">
          {id}
        </div>
        
        {/* Prompt Preview */}
        <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded p-2 border border-border/50">
          {displayPrompt}
        </div>

        {/* Streaming Output */}
        {nodeData.isRunning && nodeData.output && (
          <div className="mt-2 text-xs bg-node-running/10 rounded p-2 border border-node-running/20">
            <div className="font-semibold mb-1 text-foreground">Streaming...</div>
            <div className="text-muted-foreground font-mono max-h-20 overflow-y-auto">
              {nodeData.output}
            </div>
          </div>
        )}

        {/* Error Display */}
        {nodeData.error && (
          <div className="mt-2 text-xs bg-destructive/10 rounded p-2 border border-destructive/20">
            <div className="font-semibold text-destructive">Error</div>
            <div className="text-muted-foreground">{nodeData.error}</div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
}

export default memo(PromptNode);
