import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
  BackgroundVariant
} from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Download, Settings as SettingsIcon, Zap } from 'lucide-react';
import InputNode from '@/components/nodes/InputNode';
import PromptNode from '@/components/nodes/PromptNode';
import EndNode from '@/components/nodes/EndNode';
import NodeInspector from '@/components/NodeInspector';
import Settings from '@/components/Settings';
import { saveFlow, getSetting } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { executeFlow } from '@/lib/execution';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  end: EndNode,
};

const defaultViewport = { x: 50, y: 50, zoom: 0.8 };

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const { fitView } = useReactFlow();
  const { toast } = useToast();
  const startTimeRef = useRef<number>(0);

  // Load saved flow on mount
  useEffect(() => {
    const loadFlow = async () => {
      const saved = localStorage.getItem('current-flow');
      if (saved) {
        try {
          const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
          setNodes(savedNodes || []);
          setEdges(savedEdges || []);
          setTimeout(() => fitView({ padding: 0.2 }), 100);
        } catch (e) {
          console.error('Failed to load flow:', e);
        }
      }
    };
    loadFlow();
  }, []);

  // Mobile viewport handling
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        document.body.style.height = `${window.visualViewport.height}px`;
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Auto-save flow
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        localStorage.setItem('current-flow', JSON.stringify({ nodes, edges }));
        saveFlow({
          id: 'current',
          name: 'Current Flow',
          nodes,
          edges,
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  // Connection handler
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: 'hsl(var(--primary))' } }, eds));
    toast({
      title: '✨ Connected',
      description: 'Nodes linked successfully',
      duration: 2000,
    });
  }, [setEdges, toast]);

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowFabMenu(false);
  }, []);

  // Add node functions
  const addNode = useCallback((type: 'input' | 'prompt' | 'end') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 200 + 100 
      },
      data: type === 'input' 
        ? { label: 'Input', value: '', type: 'text' }
        : type === 'prompt'
        ? { 
            label: 'Prompt', 
            systemPrompt: 'You are a helpful assistant.', 
            userPrompt: 'Hello!', 
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000,
            jsonMode: false,
          }
        : { label: 'End', displayMode: 'text' },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowFabMenu(false);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
    
    toast({
      title: '🎉 Node Added',
      description: `${type} node created`,
      duration: 2000,
    });
  }, [setNodes, fitView, toast]);

  // Update node handler
  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  // Run flow
  const runFlow = async () => {
    const apiKey = await getSetting('openai_api_key');
    if (!apiKey) {
      toast({
        title: '⚠️ API Key Missing',
        description: 'Please add your ChatGPT API key in Settings',
        variant: 'destructive',
      });
      setShowSettings(true);
      return;
    }

    if (nodes.length === 0) {
      toast({
        title: '📭 Empty Canvas',
        description: 'Add some nodes first!',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    setTokenCount(0);
    setDuration(0);
    startTimeRef.current = Date.now();

    // Reset all nodes
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          output: undefined,
          error: undefined,
          isRunning: false,
        },
      }))
    );

    try {
      await executeFlow(
        nodes,
        edges,
        apiKey,
        (nodeId) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, isRunning: true, error: undefined } } : n
            )
          );
        },
        (nodeId, token) => {
          setTokenCount((prev) => prev + 1);
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, output: (n.data.output || '') + token } }
                : n
            )
          );
        },
        (nodeId, output) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, output, isRunning: false } }
                : n
            )
          );
        },
        (nodeId, error) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, error, isRunning: false } }
                : n
            )
          );
        }
      );

      const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
      setDuration(parseFloat(elapsed));

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      toast({
        title: '✅ Flow Complete',
        description: `Generated ${tokenCount} tokens in ${elapsed}s`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Execution Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Export flow
  const exportFlow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: '📥 Flow Exported',
      description: 'Your flow has been downloaded',
      duration: 2000,
    });
  };

  return (
    <div className="w-full h-screen relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        panOnDrag={[1, 2]}
        zoomOnPinch
        zoomOnScroll
        minZoom={0.3}
        maxZoom={1.5}
        fitView
        className="bg-gradient-to-br from-background via-background to-card"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1.5}
          color="hsl(var(--primary) / 0.15)"
        />
        <Controls 
          className="!bg-card/80 !backdrop-blur-lg !border-border/50 !rounded-2xl"
          showInteractive={false}
        />

        {/* Stats Panel */}
        {isExecuting && (
          <Panel position="top-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass glass-card px-6 py-3 flex items-center gap-4"
            >
              <Zap className="w-5 h-5 text-accent animate-pulse" />
              <div className="text-sm font-semibold text-foreground">
                {tokenCount} tokens • {((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s
              </div>
            </motion.div>
          </Panel>
        )}

        {/* Top Toolbar */}
        <Panel position="top-right">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="glass glass-card p-3 rounded-2xl hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <SettingsIcon className="w-5 h-5 text-foreground" />
          </motion.button>
        </Panel>
      </ReactFlow>

      {/* FAB Menu */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-40">
        <AnimatePresence>
          {showFabMenu && (
            <>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addNode('input')}
                className="glass glass-card px-4 py-3 rounded-2xl text-sm font-semibold text-foreground flex items-center gap-2 hover:ring-2 hover:ring-primary/50"
              >
                🟢 Input
              </motion.button>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addNode('prompt')}
                className="glass glass-card px-4 py-3 rounded-2xl text-sm font-semibold text-foreground flex items-center gap-2 hover:ring-2 hover:ring-primary/50"
              >
                🧠 Prompt
              </motion.button>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addNode('end')}
                className="glass glass-card px-4 py-3 rounded-2xl text-sm font-semibold text-foreground flex items-center gap-2 hover:ring-2 hover:ring-accent/50"
              >
                🏁 End
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            showFabMenu 
              ? 'bg-accent text-white ring-4 ring-accent/30' 
              : 'bg-gradient-to-br from-primary to-accent text-white'
          }`}
        >
          <motion.div animate={{ rotate: showFabMenu ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="w-8 h-8" />
          </motion.div>
        </motion.button>
      </div>

      {/* Run FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={runFlow}
        disabled={isExecuting || nodes.length === 0}
        className="fixed bottom-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary text-white flex items-center justify-center shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed z-40"
      >
        {isExecuting ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Zap className="w-7 h-7" />
          </motion.div>
        ) : (
          <Play className="w-7 h-7 ml-1" />
        )}
      </motion.button>

      {/* Export FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={exportFlow}
        className="fixed bottom-24 left-6 w-12 h-12 rounded-full glass glass-card text-foreground flex items-center justify-center shadow-lg z-40"
      >
        <Download className="w-5 h-5" />
      </motion.button>

      {/* Node Inspector */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={handleNodeUpdate}
        />
      )}

      {/* Settings */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
