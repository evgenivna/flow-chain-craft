import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

function InputNode({ data, selected }: NodeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] ${
        selected ? 'ring-2 ring-primary glow-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">🟢</div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">Input Node</div>
          <div className="text-xs text-muted-foreground">Seed data</div>
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

export default memo(InputNode);
