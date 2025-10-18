import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Play, Square, Settings } from 'lucide-react';
import InputNode from './nodes/InputNode';
import PromptNode from './nodes/PromptNode';
import EndNode from './nodes/EndNode';
import { useToast } from '@/hooks/use-toast';

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  end: EndNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: 'input' | 'prompt' | 'end') => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: type === 'input' ? '🟢 Input' : type === 'prompt' ? '🧠 Prompt' : '🏁 End',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: 'Node Added',
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} node created`,
    });
  };

  const runFlow = () => {
    if (nodes.length === 0) {
      toast({
        title: 'No Flow to Run',
        description: 'Add some nodes first!',
        variant: 'destructive',
      });
      return;
    }
    setIsRunning(true);
    toast({
      title: '▶ Flow Started',
      description: 'Executing your prompt chain...',
    });
    // Simulate execution
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: '✅ Flow Completed',
        description: 'All nodes executed successfully',
      });
    }, 3000);
  };

  return (
    <div className="h-screen w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gradient-to-br from-background via-background/95 to-background/90"
      >
        <Background gap={20} size={1} color="hsl(var(--border))" />
        <Controls className="glass rounded-2xl border-primary/30" />
        <MiniMap
          className="glass rounded-2xl border-primary/30"
          nodeColor={(node) => {
            if (node.type === 'input') return 'hsl(var(--node-done))';
            if (node.type === 'prompt') return 'hsl(var(--primary))';
            return 'hsl(var(--accent))';
          }}
        />

        {/* Top Toolbar */}
        <Panel position="top-center" className="flex gap-2">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card flex items-center gap-2"
          >
            <Button
              onClick={() => addNode('input')}
              size="sm"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Input
            </Button>
            <Button
              onClick={() => addNode('prompt')}
              size="sm"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Prompt
            </Button>
            <Button
              onClick={() => addNode('end')}
              size="sm"
              variant="outline"
              className="border-accent/30 hover:bg-accent/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              End
            </Button>
          </motion.div>
        </Panel>

        {/* Bottom FAB */}
        <Panel position="bottom-center" className="mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-3"
          >
            <Button
              onClick={runFlow}
              disabled={isRunning}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold px-8 py-6 rounded-2xl shadow-lg glow-accent"
            >
              {isRunning ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run Flow
                </>
              )}
            </Button>
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
