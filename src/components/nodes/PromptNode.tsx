import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { PromptNodeData } from '@/types/flow';
import { Loader2 } from 'lucide-react';

function PromptNode({ data, selected }: NodeProps) {
  const nodeData = data as any as PromptNodeData;
  const modelName = nodeData.model?.replace('gpt-', 'GPT-') || 'GPT-4o-mini';
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] max-w-[300px] relative ${
        selected ? 'ring-2 ring-primary glow-primary' : ''
      } ${nodeData.isRunning ? 'ring-2 ring-accent animate-glow-pulse' : ''} ${
        nodeData.error ? 'ring-2 ring-destructive' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className="text-3xl relative">
          🧠
          {nodeData.isRunning && (
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">ChatGPT</div>
          <div className="text-xs text-muted-foreground">{modelName}</div>
        </div>
      </div>
      
      {nodeData.output && (
        <div className="text-xs text-muted-foreground/70 italic mt-2 line-clamp-2">
          {nodeData.output.slice(0, 100)}...
        </div>
      )}
      
      {nodeData.error && (
        <div className="text-xs text-destructive mt-2">
          Error: {nodeData.error}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </motion.div>
  );
}

export default memo(PromptNode);
