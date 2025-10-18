import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { EndNodeData } from '@/types/flow';
import { Sparkles } from 'lucide-react';

function EndNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as EndNodeData;
  const hasOutput = !!nodeData.output;
  
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
        selected 
          ? 'ring-2 ring-accent shadow-[0_0_35px_hsl(var(--accent)/0.5)]' 
          : hasOutput 
          ? 'ring-2 ring-accent/50 shadow-[0_0_20px_hsl(var(--accent)/0.3)] hover:ring-accent'
          : 'ring-border/50 hover:shadow-[0_0_20px_hsl(var(--accent)/0.2)]'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="text-4xl relative"
            animate={hasOutput ? { 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 2, repeat: hasOutput ? Infinity : 0 }}
          >
            🏁
            {hasOutput && (
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
              >
                <Sparkles className="w-4 h-4 text-accent fill-accent/30" />
              </motion.div>
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-lg">Final Output</div>
            <div className="text-xs text-muted-foreground capitalize">
              {nodeData.displayMode || 'text'} mode
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 mb-2">
          <span className="text-[10px] text-accent/80 font-mono font-semibold">ID: {id}</span>
        </div>
        
        {/* Output Preview */}
        {hasOutput ? (
          <motion.div 
            className="text-xs text-muted-foreground/80 mt-3 line-clamp-3 font-mono leading-relaxed bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-3 border border-accent/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {nodeData.output.slice(0, 180)}{nodeData.output.length > 180 ? '...' : ''}
          </motion.div>
        ) : (
          <div className="text-xs text-muted-foreground/60 mt-3 italic text-center py-4 bg-background/20 rounded-xl border border-border/30">
            Awaiting workflow completion...
          </div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-accent !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
    </motion.div>
  );
}

export default memo(EndNode);
