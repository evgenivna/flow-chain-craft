import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

function EndNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any;
  const hasOutput = nodeData.output && nodeData.output.length > 0;
  const displayValue = hasOutput
    ? (nodeData.output.length > 100 ? nodeData.output.slice(0, 100) + '...' : nodeData.output)
    : 'Awaiting results...';

  const isDone = nodeData.status === 'done' || hasOutput;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="min-w-[220px] max-w-[320px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-primary !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
      
      <div className={`node-card glass glass-card rounded-3xl transition-all duration-300 ${
        selected ? 'ring-2 ring-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]' : 'hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
      } ${isDone ? 'border-[hsl(var(--node-done))] shadow-[0_0_25px_hsl(var(--node-done)/0.6)]' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="text-4xl"
            animate={isDone ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 360] 
            } : {}}
            transition={{ duration: 0.6 }}
          >
            🏁
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-lg">End Node</div>
            <div className="text-xs text-muted-foreground">
              {isDone ? '✅ Complete' : '⏳ Pending'}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-2">
          <span className="text-[10px] text-primary/80 font-mono font-semibold">ID: {id}</span>
        </div>
        
        {/* Output preview */}
        <div className="text-xs text-muted-foreground/80 mt-3 font-mono leading-relaxed bg-background/30 rounded-xl p-3 border border-border/50 max-h-32 overflow-y-auto">
          {displayValue}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(EndNode);
