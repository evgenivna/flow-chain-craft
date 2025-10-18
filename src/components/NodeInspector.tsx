import { useState } from 'react';
import { Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { InputNodeData, PromptNodeData, EndNodeData } from '@/types/flow';
import { CHATGPT_MODELS } from '@/lib/chatgpt';

interface NodeInspectorProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeInspector({ node, onClose, onUpdate }: NodeInspectorProps) {
  if (!node) return null;

  const handleUpdate = (updates: Partial<any>) => {
    onUpdate(node.id, { ...node.data, ...updates });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl h-[70vh] md:h-auto md:max-h-[75vh] glass-card overflow-hidden flex flex-col rounded-t-3xl md:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {node.type === 'input' ? '🟢 Input Node' : node.type === 'prompt' ? '🧠 Prompt Node' : '🏁 End Node'}
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {node.type === 'input' && <InputNodeEditor data={node.data as any as InputNodeData} onUpdate={handleUpdate} />}
            {node.type === 'prompt' && <PromptNodeEditor data={node.data as any as PromptNodeData} onUpdate={handleUpdate} />}
            {node.type === 'end' && <EndNodeEditor data={node.data as any as EndNodeData} onUpdate={handleUpdate} />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InputNodeEditor({ data, onUpdate }: { data: InputNodeData; onUpdate: (updates: Partial<InputNodeData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Data</Label>
        <Textarea
          value={data.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter your input text or JSON..."
          className="min-h-[200px] font-mono"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={data.type === 'json'}
          onCheckedChange={(checked) => onUpdate({ type: checked ? 'json' : 'text' })}
        />
        <Label>JSON Mode</Label>
      </div>
    </div>
  );
}

function PromptNodeEditor({ data, onUpdate }: { data: PromptNodeData; onUpdate: (updates: Partial<PromptNodeData>) => void }) {
  return (
    <Tabs defaultValue="prompt" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
        <TabsTrigger value="model">Model</TabsTrigger>
        <TabsTrigger value="io">I/O</TabsTrigger>
      </TabsList>

      <TabsContent value="prompt" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            value={data.systemPrompt || ''}
            onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
            placeholder="You are a helpful assistant..."
            className="min-h-[120px]"
          />
        </div>
        <div className="space-y-2">
          <Label>User Prompt</Label>
          <Textarea
            value={data.userPrompt || ''}
            onChange={(e) => onUpdate({ userPrompt: e.target.value })}
            placeholder="Use {{NodeId.output}} to reference other nodes..."
            className="min-h-[120px]"
          />
        </div>
        <div className="p-4 glass rounded-lg">
          <Label className="text-xs text-muted-foreground">💡 Tip</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Use <code className="px-1 py-0.5 bg-primary/10 rounded">{'{{NodeId.output}}'}</code> to reference outputs from previous nodes
          </p>
        </div>
      </TabsContent>

      <TabsContent value="model" className="space-y-6 mt-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={data.model} onValueChange={(value) => onUpdate({ model: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHATGPT_MODELS.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Temperature: {data.temperature?.toFixed(1) || '0.7'}</Label>
          <Slider
            value={[data.temperature || 0.7]}
            onValueChange={([value]) => onUpdate({ temperature: value })}
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Max Tokens: {data.maxTokens || 2000}</Label>
          <Slider
            value={[data.maxTokens || 2000]}
            onValueChange={([value]) => onUpdate({ maxTokens: value })}
            min={50}
            max={4000}
            step={50}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={data.jsonMode || false}
            onCheckedChange={(checked) => onUpdate({ jsonMode: checked })}
          />
          <Label>JSON Mode</Label>
        </div>
      </TabsContent>

      <TabsContent value="io" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Output</Label>
          <Textarea
            value={data.output || 'No output yet. Run the flow to see results.'}
            readOnly
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        {data.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{data.error}</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EndNodeEditor({ data, onUpdate }: { data: EndNodeData; onUpdate: (updates: Partial<EndNodeData>) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Display Mode</Label>
        <Select value={data.displayMode || 'text'} onValueChange={(value: any) => onUpdate({ displayMode: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Final Output</Label>
        <Textarea
          value={data.output || 'No output yet. Run the flow to see results.'}
          readOnly
          className="min-h-[300px] font-mono text-sm"
        />
      </div>
    </div>
  );
}
