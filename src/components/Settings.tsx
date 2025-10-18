import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X, Check, Loader2 } from 'lucide-react';
import { testConnection } from '@/lib/chatgpt';
import { getSetting, saveSetting, deleteSetting, clearAllData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { CHATGPT_MODELS } from '@/lib/chatgpt';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini');
  const [defaultTemp, setDefaultTemp] = useState('0.7');
  const [haptics, setHaptics] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const key = await getSetting('openai_api_key');
    const model = await getSetting('default_model');
    const temp = await getSetting('default_temperature');
    const hapticsEnabled = await getSetting('haptics_enabled');
    
    if (key) setApiKey('sk-****' + key.slice(-4));
    if (model) setDefaultModel(model);
    if (temp) setDefaultTemp(temp);
    if (hapticsEnabled !== null) setHaptics(hapticsEnabled === 'true');
  };

  const handleTestKey = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: 'Invalid API Key',
        description: 'ChatGPT API keys start with "sk-"',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    const isValid = await testConnection(apiKey);
    setIsValidating(false);

    if (isValid) {
      await saveSetting('openai_api_key', apiKey, true);
      toast({
        title: '✅ API Key Valid',
        description: 'Your key has been saved securely.',
      });
      setApiKey('sk-****' + apiKey.slice(-4));
    } else {
      toast({
        title: '⚠️ Invalid Key',
        description: 'Could not verify your API key.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDefaults = async () => {
    await saveSetting('default_model', defaultModel);
    await saveSetting('default_temperature', defaultTemp);
    await saveSetting('haptics_enabled', String(haptics));
    toast({
      title: '✅ Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleClearData = async () => {
    if (confirm('Are you sure? This will delete ALL data including your API key and flows.')) {
      await clearAllData();
      toast({
        title: '🗑️ Data Cleared',
        description: 'All local data has been deleted.',
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] glass-card overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚙️ Settings
            </h2>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ChatGPT Connection */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">ChatGPT Connection</h3>
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={apiKey.includes('****')}
                    className="flex-1"
                  />
                  {apiKey.includes('****') ? (
                    <Button onClick={() => setApiKey('')} variant="outline">
                      Change
                    </Button>
                  ) : (
                    <Button onClick={handleTestKey} disabled={isValidating}>
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            </section>

            <Separator />

            {/* Defaults */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Defaults</h3>
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
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
                <Label>Default Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={defaultTemp}
                  onChange={(e) => setDefaultTemp(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveDefaults} className="w-full">
                Save Defaults
              </Button>
            </section>

            <Separator />

            {/* Appearance */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Appearance</h3>
              <div className="flex items-center justify-between">
                <Label>Haptic Feedback</Label>
                <Switch checked={haptics} onCheckedChange={setHaptics} />
              </div>
            </section>

            <Separator />

            {/* Storage */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Storage</h3>
              <Button onClick={handleClearData} variant="destructive" className="w-full">
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                This will delete your API key, flows, and all settings. This action cannot be undone.
              </p>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
