export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  complete(messages: Message[]): Promise<string>;
}

export interface NvidiaProviderOptions {
  apiKey?: string;
  model?: string;
}

export class NvidiaProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseURL: string = 'https://integrate.api.nvidia.com/v1';

  constructor(options?: NvidiaProviderOptions) {
    this.apiKey = options?.apiKey || 
      ((globalThis as any).process?.env?.VITE_NVIDIA_API_KEY as string) ||
      ((import.meta as any).env?.VITE_NVIDIA_API_KEY as string) || 
      '';
    this.model = options?.model || 'nvidia/llama-3.3-nemotron-super-49b-v1';
  }

  setModel(model: string): void {
    this.model = model;
  }

  async complete(messages: Message[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("NVIDIA API key is not configured.");
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Nvidia API failed: ${response.status} - ${err}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (content === undefined || content === null) {
      throw new Error("NVIDIA returned empty response content.");
    }

    return content;
  }
}

export class AIManager implements AIProvider {
  private activeModel: string;
  private provider: NvidiaProvider;
  private readonly validModels: string[] = [
    'deepseek-ai/deepseek-v4-flash',
    'z-ai/glm-5.1',
    'minimax/minimax-m2.7',
    'mistralai/mistral-medium-3.5-128b',
    'nvidia/llama-3.3-nemotron-super-49b-v1'
  ];

  constructor(provider?: NvidiaProvider) {
    this.activeModel = ((globalThis as any).process?.env?.VITE_ACTIVE_MODEL as string) ||
      ((import.meta as any).env?.VITE_ACTIVE_MODEL as string) || 
      'deepseek-ai/deepseek-v4-flash';
    this.provider = provider || new NvidiaProvider({ model: this.activeModel });
  }

  getActiveModel(): string {
    return this.activeModel;
  }

  setActiveModel(model: string): void {
    if (!this.validModels.includes(model)) {
      throw new Error(`Invalid model: ${model}. Must be one of the approved NVIDIA candidate models.`);
    }
    this.activeModel = model;
    this.provider.setModel(model);
  }

  async complete(messages: Message[]): Promise<string> {
    return this.provider.complete(messages);
  }
}
