import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Sparkles, Brain, Play } from 'lucide-react';
import { testConnection } from '@/lib/chatgpt';
import { saveSetting } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  {
    title: 'Welcome to FlowPilot 🌈',
    content: 'Visualize your prompts as a living graph. Everything runs locally — nothing leaves your device.',
    cta: 'Start Setup',
  },
  {
    title: 'Connect ChatGPT',
    content: 'FlowPilot uses your ChatGPT API key to call models (3.5 → GPT-5). Your key is encrypted and stored only in your browser.',
    cta: 'Continue',
  },
  {
    title: 'Tutorial',
    content: '• Tap + to add your first Prompt node\n• Drag lines to connect nodes\n• Tap ▶ Run to watch ChatGPT flow live',
    cta: "Let's Build!",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleNext = async () => {
    if (step === 1) {
      // Validate API key
      if (!apiKey.trim().startsWith('sk-')) {
        toast({
          title: '❌ Invalid API Key',
          description: 'ChatGPT API keys start with "sk-"',
          variant: 'destructive',
        });
        return;
      }

      setIsValidating(true);
      const isValid = await testConnection(apiKey);
      setIsValidating(false);

      if (!isValid) {
        toast({
          title: '⚠️ Could not verify key',
          description: 'Check your API key and network connection, then try again.',
          variant: 'destructive',
        });
        return;
      }

      // Save encrypted API key
      await saveSetting('openai_api_key', apiKey, true);
      toast({
        title: '✅ API Key Validated!',
        description: 'Successfully connected to ChatGPT. Your key has been encrypted and saved securely.',
      });
    }

    if (step === STEPS.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md"
        >
          <div className="glass-card space-y-6 glow-primary animate-glow-pulse">
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-accent"
              >
                {step === 0 && <Sparkles className="w-10 h-10 text-white" />}
                {step === 1 && <Brain className="w-10 h-10 text-white" />}
                {step === 2 && <Play className="w-10 h-10 text-white" />}
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              {currentStep.title}
            </h1>

            {/* Content */}
            <p className="text-muted-foreground text-center whitespace-pre-line leading-relaxed">
              {currentStep.content}
            </p>

            {/* API Key Input */}
            {step === 1 && (
              <div className="space-y-3">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="glass border-primary/30 focus:border-accent"
                />
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Where to find my key? <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Progress Dots */}
            <div className="flex justify-center gap-2">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-8 bg-gradient-to-r from-primary to-accent'
                      : 'w-2 bg-muted'
                  }`}
                  animate={i === step ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleNext}
              disabled={isValidating || (step === 1 && !apiKey.trim())}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-6 rounded-2xl shadow-lg glow-accent"
            >
              {isValidating ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Validating API Key...
                </span>
              ) : (
                currentStep.cta
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
