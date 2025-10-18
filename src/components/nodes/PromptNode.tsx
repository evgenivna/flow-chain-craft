import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { PromptNodeData } from '@/types/flow';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function PromptNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as PromptNodeData;
  const modelName = nodeData.model?.replace('gpt-', 'GPT-').replace('-', ' ') || 'GPT-4o Mini';
  
  // Determine visual state
  const getNodeState = () => {
    if (nodeData.error) return 'error';
    if (nodeData.isRunning) return 'running';
    if (nodeData.output) return 'done';
    return 'idle';
  };
  
  const state = getNodeState();
  
  const stateStyles = {
    idle: 'ring-border/50',
    running: 'ring-2 ring-[hsl(var(--node-running))] animate-pulse-glow',
    done: 'ring-2 ring-[hsl(var(--node-done))] shadow-[0_0_25px_hsl(var(--node-done)/0.3)]',
    error: 'ring-2 ring-[hsl(var(--node-error))] shadow-[0_0_20px_hsl(var(--node-error)/0.4)]',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="min-w-[240px] max-w-[340px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`node-card glass glass-card rounded-3xl transition-all duration-300 ${
        selected ? 'ring-2 ring-primary shadow-[0_0_35px_hsl(var(--primary)/0.5)]' : stateStyles[state]
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <motion.div 
              className="text-4xl"
              animate={nodeData.isRunning ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 1.5, repeat: nodeData.isRunning ? Infinity : 0 }}
            >
              🧠
            </motion.div>
            {nodeData.isRunning && (
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5 text-[hsl(var(--node-running))]" />
              </motion.div>
            )}
            {nodeData.output && !nodeData.isRunning && !nodeData.error && (
              <motion.div 
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <CheckCircle2 className="w-5 h-5 text-[hsl(var(--node-done))] fill-[hsl(var(--node-done)/0.2)]" />
              </motion.div>
            )}
            {nodeData.error && (
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertCircle className="w-5 h-5 text-[hsl(var(--node-error))] fill-[hsl(var(--node-error)/0.2)]" />
              </motion.div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-lg">ChatGPT</div>
            <div className="text-xs text-muted-foreground">{modelName}</div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-2">
          <span className="text-[10px] text-primary/80 font-mono font-semibold">ID: {id}</span>
        </div>
        
        {/* Status/Output Preview */}
        {nodeData.isRunning && (
          <motion.div 
            className="text-xs text-[hsl(var(--node-running))] mt-3 flex items-center gap-2 bg-[hsl(var(--node-running)/0.1)] rounded-xl p-3 border border-[hsl(var(--node-running)/0.3)]"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="font-medium">Generating response...</span>
          </motion.div>
        )}
        
        {nodeData.output && !nodeData.isRunning && !nodeData.error && (
          <div className="text-xs text-muted-foreground/80 mt-3 line-clamp-2 font-mono leading-relaxed bg-background/30 rounded-xl p-3 border border-border/50">
            {nodeData.output.slice(0, 120)}{nodeData.output.length > 120 ? '...' : ''}
          </div>
        )}
        
        {nodeData.error && (
          <motion.div 
            className="text-xs text-[hsl(var(--node-error))] mt-3 bg-[hsl(var(--node-error)/0.1)] rounded-xl p-3 border border-[hsl(var(--node-error)/0.3)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold mb-1">❌ Error</div>
            <div className="line-clamp-2">{nodeData.error}</div>
          </motion.div>
        )}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-primary !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-primary !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
    </motion.div>
  );
}

export default memo(PromptNode);
