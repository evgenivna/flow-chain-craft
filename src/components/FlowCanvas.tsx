import { useCallback, useState, useEffect } from 'react';
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
import { Plus, Play, Square, Save, Download, Settings as SettingsIcon } from 'lucide-react';
import InputNode from './nodes/InputNode';
import PromptNode from './nodes/PromptNode';
import EndNode from './nodes/EndNode';
import { useToast } from '@/hooks/use-toast';
import NodeInspector from './NodeInspector';
import Settings from './Settings';
import { executeFlow } from '@/lib/execution';
import { getSetting, saveFlow, getFlow } from '@/lib/storage';
import { PromptNodeData } from '@/types/flow';

const nodeTypes = {
  input: InputNode,
  prompt: PromptNode,
  end: EndNode,
};

const FLOW_ID = 'main-flow';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const { toast } = useToast();

  // Load saved flow on mount
  useEffect(() => {
    const loadFlow = async () => {
      const saved = await getFlow(FLOW_ID);
      if (saved) {
        setNodes(saved.nodes);
        setEdges(saved.edges);
      }
    };
    loadFlow();
  }, [setNodes, setEdges]);

  // Auto-save flow on changes
  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        saveFlow({ id: FLOW_ID, name: 'Main Flow', nodes, edges });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: 'input' | 'prompt' | 'end') => {
    const id = `${type}-${Date.now()}`;
    let data: any = {};
    
    if (type === 'input') {
      data = { label: 'Input', value: '', type: 'text' };
    } else if (type === 'prompt') {
      data = {
        label: 'ChatGPT',
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: '',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        jsonMode: false,
      };
    } else if (type === 'end') {
      data = { label: 'Final Output', displayMode: 'text' };
    }
    
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data,
    };
    setNodes((nds) => [...nds, newNode]);
    toast({
      title: 'Node Added',
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} node created`,
    });
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
    );
  }, [setNodes]);

  const runFlow = async () => {
    if (nodes.length === 0) {
      toast({
        title: 'No Flow to Run',
        description: 'Add some nodes first!',
        variant: 'destructive',
      });
      return;
    }

    const apiKey = await getSetting('openai_api_key');
    if (!apiKey) {
      toast({
        title: 'API Key Missing',
        description: 'Please configure your ChatGPT API key in settings.',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    setTokenCount(0);
    const startTime = Date.now();
    
    // Reset all node outputs
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, output: undefined, error: undefined, isRunning: false }
      }))
    );

    toast({
      title: '▶ Flow Started',
      description: 'Executing your prompt chain...',
    });

    try {
      await executeFlow(
        nodes,
        edges,
        apiKey,
        (nodeId) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, isRunning: true, output: '', error: undefined } }
                : node
            )
          );
        },
        (nodeId, token) => {
          setTokenCount((c) => c + 1);
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, output: (node.data.output || '') + token } }
                : node
            )
          );
        },
        (nodeId, output) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, output, isRunning: false } }
                : node
            )
          );
        },
        (nodeId, error) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, error, isRunning: false } }
                : node
            )
          );
        }
      );

      const endTime = Date.now();
      setDuration((endTime - startTime) / 1000);

      toast({
        title: '✅ Flow Completed',
        description: `Processed ${tokenCount} tokens in ${((endTime - startTime) / 1000).toFixed(1)}s`,
      });
    } catch (error) {
      toast({
        title: '❌ Flow Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const exportFlow = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Flow Exported',
      description: 'Downloaded as flow.json',
    });
  };

  return (
    <>
      <div className="h-screen w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
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

          {/* Top Right Settings */}
          <Panel position="top-right" className="flex gap-2">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Button
                onClick={() => setShowSettings(true)}
                size="sm"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </motion.div>
          </Panel>

        {/* Bottom FAB */}
        <Panel position="bottom-center" className="mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-3 items-center"
          >
            {isRunning && tokenCount > 0 && (
              <div className="glass-card px-4 py-2 text-sm">
                ⚡ {tokenCount} tokens • {duration.toFixed(1)}s
              </div>
            )}
            <Button
              onClick={exportFlow}
              variant="outline"
              size="lg"
              className="border-primary/30 hover:bg-primary/10 px-6 py-6 rounded-2xl"
            >
              <Download className="w-5 h-5" />
            </Button>
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
    
    <NodeInspector
      node={selectedNode}
      onClose={() => setSelectedNode(null)}
      onUpdate={handleNodeUpdate}
    />
    
    {showSettings && <Settings onClose={() => setShowSettings(false)} />}
  </>
  );
}
