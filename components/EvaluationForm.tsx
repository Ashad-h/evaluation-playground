import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FormState } from "@/types";
import { MODELS, ModelKey } from "@/constants";

interface EvaluationFormProps {
    formState: FormState;
    setFormState: (value: FormState | ((prev: FormState) => FormState)) => void;
    isEvaluating: boolean;
    progress: number;
    elapsedTime: number;
    formatTime: (seconds: number) => string;
    onRunEvaluation: () => void;
    onCancel: () => void;
}

export function EvaluationForm({
    formState,
    setFormState,
    isEvaluating,
    progress,
    elapsedTime,
    formatTime,
    onRunEvaluation,
    onCancel,
}: EvaluationFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                    id="openai-key"
                    type="password"
                    value={formState.openaiKey}
                    onChange={(e) =>
                        setFormState((prev) => ({
                            ...prev,
                            openaiKey: e.target.value,
                        }))
                    }
                    placeholder="Enter your OpenAI API key"
                />
            </div>

            <div>
                <Label htmlFor="model-select">Select Model</Label>
                <Select
                    value={formState.selectedModel}
                    onValueChange={(value) =>
                        setFormState((prev) => ({
                            ...prev,
                            selectedModel: value as ModelKey,
                        }))
                    }
                >
                    <SelectTrigger id="model-select">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(MODELS).map(([key, model]) => (
                            <SelectItem key={key} value={key}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                    id="prompt"
                    value={formState.prompt}
                    onChange={(e) =>
                        setFormState((prev) => ({
                            ...prev,
                            prompt: e.target.value,
                        }))
                    }
                    placeholder="Enter your prompt here"
                    rows={4}
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={onRunEvaluation} disabled={isEvaluating}>
                    {isEvaluating ? "Evaluating..." : "Run Evaluation"}
                </Button>
                {isEvaluating && (
                    <Button variant="destructive" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
            {isEvaluating && (
                <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-gray-500 text-center">
                        Processing examples: {Math.round(progress)}% (
                        {formatTime(elapsedTime)})
                    </p>
                </div>
            )}
        </div>
    );
}
