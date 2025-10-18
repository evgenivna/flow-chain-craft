import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

function PromptNode({ data, selected }: NodeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] ${
        selected ? 'ring-2 ring-primary glow-primary' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className="text-3xl">🧠</div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">ChatGPT</div>
          <div className="text-xs text-muted-foreground">gpt-4o-mini</div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </motion.div>
  );
}

export default memo(PromptNode);
