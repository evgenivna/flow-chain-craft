export const CHATGPT_MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384 },
  { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
  { id: 'gpt-5', name: 'GPT-5', maxTokens: 200000 },
] as const;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onToken?: (token: string) => void;
  onError?: (error: Error) => void;
  onComplete?: (fullResponse: string) => void;
}

export const testConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const chatCompletion = async (options: ChatCompletionOptions): Promise<string> => {
  const {
    apiKey,
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2000,
    stream = true,
    onToken,
    onError,
    onComplete,
  } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    if (stream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices[0]?.delta?.content || '';
              if (token) {
                fullResponse += token;
                onToken?.(token);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      onComplete?.(fullResponse);
      return fullResponse;
    } else {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      onComplete?.(content);
      return content;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    onError?.(err);
    throw err;
  }
};
