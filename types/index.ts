import { z } from "zod";
import { ModelKey } from "@/constants";

// Output schema for AI responses
export const outputSchema = z.object({
    output: z.union([z.boolean(), z.string(), z.number()]),
    explanation: z.string(),
});

export type OutputType = z.infer<typeof outputSchema>["output"];

export interface DatasetItem {
    input: string;
    expectedOutput: OutputType;
    predictedOutput?: OutputType;
    explanation?: string;
    imageUrl?: string;
}

export interface Metrics {
    precision: number;
    recall: number;
    f1Score: number;
    prompt: string;
    model: string;
    cost: number;
}

// Schema for dataset items
export const datasetItemSchema = z.object({
    input: z.string(),
    expectedOutput: z.union([z.boolean(), z.string(), z.number()]),
    imageUrl: z.string().optional(),
});

export interface FormState {
    openaiKey: string;
    selectedModel: ModelKey;
    prompt: string;
    evaluateImages: boolean;
    minCharCount: number;
    minLineCount: number;
    evaluatePostImage: boolean;
}
