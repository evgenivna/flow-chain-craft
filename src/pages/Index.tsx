import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Onboarding from '@/components/Onboarding';
import FlowCanvas from '@/components/FlowCanvas';
import { getSetting, initDB } from '@/lib/storage';

export default function Index() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      await initDB();
      const apiKey = await getSetting('openai_api_key');
      setHasCompletedOnboarding(!!apiKey);
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent animate-float glow-accent" />
          <p className="text-muted-foreground">Loading FlowPilot...</p>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
