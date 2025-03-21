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
import { Checkbox } from "@/components/ui/checkbox";

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
    const mutuallyExclusiveFields = [
        "evaluateImages",
        "evaluatePostImage",
        "evaluateArticle",
    ];


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

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="evaluate-images"
                    checked={formState.evaluateImages}
                    onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                            ...prev,
                            ...Object.fromEntries(
                                mutuallyExclusiveFields.map((field) => [
                                    field,
                                    false,
                                ])
                            ),
                            evaluateImages: checked === true,
                        }))
                    }
                />
                <Label
                    htmlFor="evaluate-images"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Évaluer la forme d&apos;un post LinkedIn
                </Label>
            </div>

            {formState.evaluateImages && (
                <>
                    <div>
                        <Label htmlFor="min-char-count">
                            Minimum Character Count
                        </Label>
                        <Input
                            id="min-char-count"
                            type="number"
                            value={formState.minCharCount?.toString() || "0"}
                            onChange={(e) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    minCharCount: parseInt(e.target.value) || 0,
                                }))
                            }
                            placeholder="Enter minimum character count"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Posts with fewer characters than this will always be
                            predicted as &quot;false&quot;. If the value is 0,
                            the post will be evaluated regardless of the
                            character count.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="min-line-count">
                            Minimum Line Count
                        </Label>
                        <Input
                            id="min-line-count"
                            type="number"
                            value={formState.minLineCount?.toString() || "0"}
                            onChange={(e) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    minLineCount: parseInt(e.target.value) || 0,
                                }))
                            }
                            placeholder="Enter minimum line count"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Posts with fewer lines than this will always be
                            predicted as &quot;false&quot;. If the value is 0,
                            the post will be evaluated regardless of the line
                            count. Lines are counted based on newline
                            characters.
                        </p>
                    </div>
                </>
            )}

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="evaluate-post-image"
                    checked={formState.evaluatePostImage}
                    onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                            ...prev,
                            ...Object.fromEntries(
                                mutuallyExclusiveFields.map((field) => [
                                    field,
                                    false,
                                ])
                            ),
                            evaluatePostImage: checked === true,
                        }))
                    }
                />
                <Label
                    htmlFor="evaluate-post-image"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Évaluer l&apos;image du post LinkedIn
                </Label>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="evaluate-article"
                    checked={formState.evaluateArticle}
                    onCheckedChange={(checked) =>
                        setFormState((prev) => ({
                            ...prev,
                            ...Object.fromEntries(
                                mutuallyExclusiveFields.map((field) => [
                                    field,
                                    false,
                                ])
                            ),
                            evaluateArticle: checked === true,
                        }))
                    }
                />
                <Label
                    htmlFor="evaluate-article"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Évaluer un article
                </Label>
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
