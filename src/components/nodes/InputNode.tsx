import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { InputNodeData } from '@/types/flow';

function InputNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as InputNodeData;
  const displayValue = nodeData.value 
    ? (nodeData.value.length > 60 ? nodeData.value.slice(0, 60) + '...' : nodeData.value) 
    : 'Tap to add input data';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="min-w-[220px] max-w-[320px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`node-card glass glass-card rounded-3xl transition-all duration-300 ${
        selected ? 'ring-2 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]' : 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🟢
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-lg">Input Node</div>
            <div className="text-xs text-muted-foreground capitalize">
              {nodeData.type === 'json' ? '📋 JSON data' : '📝 Text data'}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-2">
          <span className="text-[10px] text-primary/80 font-mono font-semibold">ID: {id}</span>
        </div>
        
        {/* Preview */}
        <div className="text-xs text-muted-foreground/80 mt-3 font-mono leading-relaxed bg-background/30 rounded-xl p-3 border border-border/50">
          {displayValue}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-primary !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
    </motion.div>
  );
}

export default memo(InputNode);
