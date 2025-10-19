import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

function EndNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any;
  const hasOutput = nodeData.output && nodeData.output.length > 0;
  const displayValue = hasOutput
    ? (nodeData.output.length > 100 ? nodeData.output.slice(0, 100) + '...' : nodeData.output)
    : 'Awaiting results...';

  const isDone = nodeData.status === 'done' || hasOutput;

  return (
    <div className="min-w-[200px] max-w-[300px]">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className={`bg-card border-2 rounded-lg p-4 shadow-sm transition-all ${
        selected ? 'border-primary shadow-md' : isDone ? 'border-node-done' : 'border-border'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xl">{isDone ? '✅' : '⏳'}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">End</div>
            <div className="text-xs text-muted-foreground">
              {isDone ? 'Complete' : 'Pending'}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono mb-2">
          {id}
        </div>
        
        {/* Output preview */}
        <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded p-2 border border-border/50 max-h-32 overflow-y-auto">
          {displayValue}
        </div>
      </div>
    </div>
  );
}

export default memo(EndNode);
