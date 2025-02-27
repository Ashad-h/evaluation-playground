// AI model definitions with pricing information
export const MODELS = {
    "openai/gpt-4o-mini": {
        value: "openai/gpt-4o-mini",
        name: "GPT-4o-mini",
        reasoningEffort: null,
        inputPrice: 0.15, // per 1M tokens ($0.15 per 1M)
        outputPrice: 0.6, // per 1M tokens ($0.60 per 1M)
    },
    "gpt-4o": {
        value: "openai/gpt-4o",
        name: "GPT-4o",
        reasoningEffort: null,
        inputPrice: 2.5, // per 1M tokens ($2.50 per 1M)
        outputPrice: 10, // per 1M tokens ($10.00 per 1M)
    },
    "openai/o3-mini": {
        value: "openai/o3-mini",
        name: "o3-mini",
        reasoningEffort: null,
        inputPrice: 1.1, // per 1M tokens ($1.10 per 1M)
        outputPrice: 4.4, // per 1M tokens ($4.40 per 1M)
    },
    "openai/o3-mini-high": {
        value: "openai/o3-mini-high",
        name: "o3-mini-high",
        reasoningEffort: null,
        inputPrice: 1.1, // per 1M tokens ($1.10 per 1M)
        outputPrice: 4.4, // per 1M tokens ($4.40 per 1M)
    },
    "anthropic/claude-3.7-sonnet": {
        value: "anthropic/claude-3.7-sonnet",
        name: "Claude 3.7 Sonnet",
        reasoningEffort: null,
        inputPrice: 3, // per 1M tokens ($0.50 per 1M)
        outputPrice: 15, // per 1M tokens ($2.00 per 1M)
    },
} as const;

// Type for model keys
export type ModelKey = keyof typeof MODELS;

// Initial dataset for the application
export const initialDataset = [
    { input: "Is the capital of France Paris?", expectedOutput: true },
    { input: "What is 2 + 2?", expectedOutput: 4 },
    {
        input: "Who wrote Romeo and Juliet?",
        expectedOutput: "William Shakespeare",
    },
];

// Default prompt for the AI
export const DEFAULT_PROMPT =
    "Answer the following question or statement with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number).";
