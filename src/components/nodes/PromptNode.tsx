import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { PromptNodeData } from '@/types/flow';

function PromptNode({ data, selected, id }: NodeProps) {
  const nodeData = data as any as PromptNodeData;
  
  const getStatusColor = () => {
    if (nodeData.error) return 'border-[hsl(var(--node-error))] shadow-[0_0_20px_hsl(var(--node-error)/0.6)]';
    if (nodeData.isRunning) return 'border-[hsl(var(--node-running))] shadow-[0_0_20px_hsl(var(--node-running)/0.5)]';
    if (nodeData.output) return 'border-[hsl(var(--node-done))] shadow-[0_0_20px_hsl(var(--node-done)/0.5)]';
    return '';
  };

  const getStatusIcon = () => {
    if (nodeData.error) return '❌';
    if (nodeData.isRunning) return '⚡';
    if (nodeData.output) return '✅';
    return '🧠';
  };

  const previewText = nodeData.userPrompt 
    ? (nodeData.userPrompt.length > 80 ? nodeData.userPrompt.slice(0, 80) + '...' : nodeData.userPrompt)
    : 'Tap to configure prompt';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="min-w-[240px] max-w-[340px]"
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
      } ${getStatusColor()}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="text-4xl"
            animate={nodeData.isRunning ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0] 
            } : {}}
            transition={{ duration: 1, repeat: nodeData.isRunning ? Infinity : 0 }}
          >
            {getStatusIcon()}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground text-lg">Prompt Node</div>
            <div className="text-xs text-muted-foreground capitalize">
              {nodeData.model || 'gpt-4o-mini'} • T={nodeData.temperature ?? 0.7}
            </div>
          </div>
        </div>
        
        {/* ID Badge */}
        <div className="inline-block px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-2">
          <span className="text-[10px] text-primary/80 font-mono font-semibold">ID: {id}</span>
        </div>
        
        {/* Preview */}
        <div className="text-xs text-muted-foreground/80 mt-3 font-mono leading-relaxed bg-background/30 rounded-xl p-3 border border-border/50">
          {previewText}
        </div>

        {/* Streaming output preview */}
        {nodeData.isRunning && nodeData.output && (
          <div className="mt-3 text-xs text-foreground/90 bg-accent/10 rounded-xl p-3 border border-accent/30 max-h-24 overflow-hidden">
            <div className="animate-token">
              {nodeData.output.slice(-100)}
            </div>
          </div>
        )}

        {/* Error display */}
        {nodeData.error && (
          <div className="mt-3 text-xs text-[hsl(var(--node-error))] bg-[hsl(var(--node-error)/0.1)] rounded-xl p-3 border border-[hsl(var(--node-error)/0.3)]">
            {nodeData.error}
          </div>
        )}

        {/* Status indicator */}
        {nodeData.isRunning && (
          <div className="mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            running
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-primary !border-[3px] !border-background hover:!scale-125 transition-transform"
      />
    </motion.div>
  );
}

export default memo(PromptNode);
