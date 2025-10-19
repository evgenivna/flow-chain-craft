export interface ChatGPTModel {
  id: string;
  name: string;
  maxTokens: number;
}

// Fallback models if API fetch fails
export const FALLBACK_MODELS: ChatGPTModel[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384 },
  { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
  { id: 'gpt-5', name: 'GPT-5', maxTokens: 200000 },
];

export const fetchAvailableModels = async (apiKey: string): Promise<ChatGPTModel[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) return FALLBACK_MODELS;
    
    const data = await response.json();
    const chatModels = data.data
      .filter((model: any) => 
        model.id.includes('gpt') || 
        model.id.includes('o1') || 
        model.id.includes('o3') ||
        model.id.includes('o4')
      )
      .map((model: any) => {
        // Estimate max tokens based on model name
        let maxTokens = 4096;
        if (model.id.includes('gpt-5') || model.id.includes('o3') || model.id.includes('o4')) maxTokens = 200000;
        else if (model.id.includes('gpt-4o')) maxTokens = 128000;
        else if (model.id.includes('gpt-4')) maxTokens = 8192;
        else if (model.id.includes('o1')) maxTokens = 100000;
        
        return {
          id: model.id,
          name: model.id.toUpperCase().replace(/-/g, ' '),
          maxTokens,
        };
      })
      .sort((a: ChatGPTModel, b: ChatGPTModel) => b.maxTokens - a.maxTokens);
    
    return chatModels.length > 0 ? chatModels : FALLBACK_MODELS;
  } catch {
    return FALLBACK_MODELS;
  }
};

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
  jsonMode?: boolean;
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
    jsonMode = false,
    stream = true,
    onToken,
    onError,
    onComplete,
  } = options;

  try {
    const body: any = {
      model,
      messages,
      temperature,
      stream,
    };

    // Use max_completion_tokens for GPT-4o and newer models, max_tokens for older ones
    if (model.includes('gpt-4o') || model.includes('gpt-5') || model.includes('o1')) {
      body.max_completion_tokens = maxTokens;
    } else {
      body.max_tokens = maxTokens;
    }

    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
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
