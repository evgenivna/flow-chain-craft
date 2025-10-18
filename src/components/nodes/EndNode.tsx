import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { EndNodeData } from '@/types/flow';

function EndNode({ data, selected }: NodeProps) {
  const nodeData = data as any as EndNodeData;
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] max-w-[300px] bg-card/50 backdrop-blur-xl ${
        selected ? 'ring-2 ring-accent glow-accent' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl">🏁</div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">Final Output</div>
          <div className="text-xs text-muted-foreground">{nodeData.displayMode || 'text'} mode</div>
        </div>
      </div>
      
      {nodeData.output && (
        <div className="text-xs text-muted-foreground/70 italic mt-2 line-clamp-3">
          {nodeData.output.slice(0, 150)}...
        </div>
      )}
    </motion.div>
  );
}

export default memo(EndNode);
