import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { InputNodeData } from '@/types/flow';

function InputNode({ data, selected }: NodeProps) {
  const nodeData = data as any as InputNodeData;
  const displayValue = nodeData.value ? (nodeData.value.length > 50 ? nodeData.value.slice(0, 50) + '...' : nodeData.value) : 'Click to edit';
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`glass-card min-w-[200px] max-w-[300px] ${
        selected ? 'ring-2 ring-primary glow-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl">🟢</div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">Input Node</div>
          <div className="text-xs text-muted-foreground">{nodeData.type === 'json' ? 'JSON data' : 'Text data'}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground/70 italic mt-2 font-mono">
        {displayValue}
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
