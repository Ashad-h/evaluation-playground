// AI model definitions with pricing information
export const MODELS = {
  "anthropic/claude-sonnet-4.5": {
    value: "anthropic/claude-sonnet-4.5",
    name: "Claude 4.5 Sonnet",
    reasoningEffort: null,
    inputPrice: 3, // per 1M tokens ($0.50 per 1M)
    outputPrice: 15, // per 1M tokens ($2.00 per 1M)
  },
  "anthropic/claude-opus-4.1": {
    value: "anthropic/claude-opus-4.1",
    name: "Claude 4.1 Opus",
    reasoningEffort: null,
    inputPrice: 15, // per 1M tokens ($2.00 per 1M)
    outputPrice: 75, // per 1M tokens ($8.00 per 1M)
  },
  "openai/gpt-4.1": {
    value: "openai/gpt-4.1",
    name: "GPT-4.1",
    reasoningEffort: null,
    inputPrice: 2, // per 1M tokens ($2.00 per 1M)
    outputPrice: 8, // per 1M tokens ($8.00 per 1M)
  },
  "openai/gpt-4.1-mini": {
    value: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    reasoningEffort: null,
    inputPrice: 2, // per 1M tokens ($2.00 per 1M)
    outputPrice: 8, // per 1M tokens ($8.00 per 1M)
  },
  "openai/gpt-5": {
    value: "openai/gpt-5",
    name: "GPT-5",
    reasoningEffort: null,
    inputPrice: 1.25, // per 1M tokens ($2.00 per 1M)
    outputPrice: 10, // per 1M tokens ($8.00 per 1M)
  },
} as const;

// Type for model keys
export type ModelKey = keyof typeof MODELS;

// Initial dataset for the application
export const initialDataset = [
  {
    input: "Is the capital of France Paris?",
    expectedOutput: true,
    imageUrl: "",
  },
  {
    input: "What is 2 + 2?",
    expectedOutput: 4,
    imageUrl: "",
  },
  {
    input: "Who wrote Romeo and Juliet?",
    expectedOutput: "William Shakespeare",
    imageUrl: "",
  },
];

// Default prompt for the AI
export const DEFAULT_PROMPT =
  "Answer the following question or statement with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number).";
