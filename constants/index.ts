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
    "deepseek/deepseek-r1": {
        value: "deepseek/deepseek-r1",
        name: "Deepseek R1",
        reasoningEffort: null,
        inputPrice: 0.55, // per 1M tokens ($2.00 per 1M)
        outputPrice: 2.19, // per 1M tokens ($8.00 per 1M)
    },
    "anthropic/claude-3.7-sonnet:thinking": {
        value: "anthropic/claude-3.7-sonnet:thinking",
        name: "Claude 3.7 Sonnet (Thinking)",
        reasoningEffort: null,
        inputPrice: 3, // per 1M tokens ($3.00 per 1M)
        outputPrice: 15, // per 1M tokens ($15.00 per 1M)
    },
    "google/gemini-2.0-flash-001": {
        value: "google/gemini-2.0-flash-001",
        name: "Gemini 2.0 Flash",
        reasoningEffort: null,
        inputPrice: 0.1, // per 1M tokens ($0.50 per 1M)
        outputPrice: 0.4, // per 1M tokens ($2.00 per 1M)
    },
    "google/gemini-2.0-flash-lite-001": {
        value: "google/gemini-2.0-flash-lite-001",
        name: "Gemini 2.0 Flash Lite",
        reasoningEffort: null,
        inputPrice: 0.075, // per 1M tokens ($0.50 per 1M)
        outputPrice: 0.3, // per 1M tokens ($2.00 per 1M)
    },
    "mistralai/mistral-small-3.1-24b-instruct": {
        value: "mistralai/mistral-small-3.1-24b-instruct",
        name: "Mistral Small 3.1 24B Instruct",
        reasoningEffort: null,
        inputPrice: 0.1, // per 1M tokens ($0.50 per 1M)
        outputPrice: 0.3, // per 1M tokens ($2.00 per 1M)
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
