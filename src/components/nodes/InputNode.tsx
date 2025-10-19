import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { InputNodeData } from '@/types/flow';

function InputNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as InputNodeData;
  const displayValue = nodeData.value 
    ? (nodeData.value.length > 60 ? nodeData.value.slice(0, 60) + '...' : nodeData.value) 
    : 'Click to add input data';
  
  return (
    <div className="min-w-[200px] max-w-[300px]">
      <div className={`bg-card border-2 rounded-lg p-4 shadow-sm transition-all ${
        selected ? 'border-primary shadow-md' : 'border-border'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xl">📥</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Input</div>
            <div className="text-xs text-muted-foreground">
              {nodeData.type === 'json' ? 'JSON data' : 'Text data'}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono mb-2">
          {id}
        </div>
        
        {/* Preview */}
        <div className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 rounded p-2 border border-border/50">
          {displayValue}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
}

export default memo(InputNode);
