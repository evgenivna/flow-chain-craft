import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

function EndNode({ data, selected }: NodeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] ${
        selected ? 'ring-2 ring-accent glow-accent' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-accent !border-2 !border-background"
      />
      
      <div className="flex items-center gap-3">
        <div className="text-3xl">🏁</div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">Final Output</div>
          <div className="text-xs text-muted-foreground">Display result</div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(EndNode);
