"use client";

import React, { useState, useEffect } from "react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

import { LinkedInPost } from "@/components/LinkedInPost";

// Update the output schema to include optional explanation
const outputSchema = z.object({
    output: z.union([z.boolean(), z.string(), z.number()]),
    explanation: z.string(),
});

type OutputType = z.infer<typeof outputSchema>["output"];

interface DatasetItem {
    input: string;
    expectedOutput: OutputType;
    predictedOutput?: OutputType;
    explanation?: string; // Add explanation field
}

interface Metrics {
    precision: number;
    recall: number;
    f1Score: number;
    prompt: string;
    model: string;
    cost: number; // Renamed from estimatedCost
}

// Define a schema for dataset items
const datasetItemSchema = z.object({
    input: z.string(),
    expectedOutput: z.union([z.boolean(), z.string(), z.number()]),
});

const initialDataset: DatasetItem[] = [
    { input: "Is the capital of France Paris?", expectedOutput: true },
    { input: "What is 2 + 2?", expectedOutput: 4 },
    {
        input: "Who wrote Romeo and Juliet?",
        expectedOutput: "William Shakespeare",
    },
];

interface FormState {
    openaiKey: string;
    selectedModel: keyof typeof MODELS;
    prompt: string;
}

const MODELS = {
    "gpt-4o-mini": {
        value: "gpt-4o-mini",
        name: "GPT-4o-mini",
        reasoningEffort: null,
        inputPrice: 0.15, // per 1M tokens ($0.15 per 1M)
        outputPrice: 0.6, // per 1M tokens ($0.60 per 1M)
    },
    "gpt-4o": {
        value: "gpt-4o",
        name: "GPT-4o",
        reasoningEffort: null,
        inputPrice: 2.5, // per 1M tokens ($2.50 per 1M)
        outputPrice: 10, // per 1M tokens ($10.00 per 1M)
    },
    "o3-mini": {
        value: "o3-mini",
        name: "o3-mini",
        reasoningEffort: "medium",
        inputPrice: 1.1, // per 1M tokens ($1.10 per 1M)
        outputPrice: 4.4, // per 1M tokens ($4.40 per 1M)
    },
    "o3-mini-high": {
        value: "o3-mini",
        name: "o3-mini-high",
        reasoningEffort: "high",
        inputPrice: 1.1, // per 1M tokens ($1.10 per 1M)
        outputPrice: 4.4, // per 1M tokens ($4.40 per 1M)
    },
};

export default function OpenAIPlayground() {
    const [formState, setFormState] = useState<FormState>({
        openaiKey: "",
        selectedModel: "gpt-4o-mini",
        prompt: "Answer the following question or statement with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number).",
    });
    const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([]);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        {}
    );
    const [dataset, setDataset] = useState<DatasetItem[]>(initialDataset);
    const [jsonInput, setJsonInput] = useState("");
    const [inputField, setInputField] = useState("input");
    const [outputField, setOutputField] = useState("expectedOutput");
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
        null
    );
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem("openaiPlaygroundData");
        console.log(storedData);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setFormState({
                openaiKey: parsedData.openaiKey || "",
                selectedModel: parsedData.selectedModel || "",
                prompt: parsedData.prompt || formState.prompt,
            });
            setDataset(parsedData.dataset || initialDataset);
            setMetricsHistory(parsedData.metricsHistory || []);
        }
    }, []);

    useEffect(() => {
        const dataToStore = {
            ...formState,
            dataset,
            metricsHistory,
        };
        localStorage.setItem(
            "openaiPlaygroundData",
            JSON.stringify(dataToStore)
        );
    }, [formState, dataset, metricsHistory]);

    // Add cleanup effect for the timer
    useEffect(() => {
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [timerInterval]);

    const handleRunEvaluation = async () => {
        if (
            !formState.openaiKey ||
            !formState.selectedModel ||
            !formState.prompt
        ) {
            alert("Please fill in all fields");
            return;
        }

        // Create new AbortController
        const controller = new AbortController();
        setAbortController(controller);

        setIsEvaluating(true);
        setProgress(0);
        setElapsedTime(0);

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);

        try {
            const updatedDataset = [...dataset];
            let totalCost = 0;

            const openai = createOpenAI({
                apiKey: formState.openaiKey,
            });

            let completedItems = 0;
            const totalItems = updatedDataset.length;

            const evaluationPromises = updatedDataset.map(async (item, i) => {
                try {
                    const { object, usage } = await generateObject({
                        model: openai(
                            MODELS[formState.selectedModel].value,
                            MODELS[formState.selectedModel].reasoningEffort
                                ? {
                                      reasoningEffort:
                                          (MODELS[formState.selectedModel]
                                              .reasoningEffort as
                                              | "medium"
                                              | "high"
                                              | "low") || "medium",
                                  }
                                : {}
                        ),
                        schema: outputSchema,
                        prompt: `${formState.prompt}\n\nInput: ${item.input}`,
                        system: "You are a helpful AI that responds with a JSON object containing an 'output' key with the appropriate value (boolean, string, or number) and an optional 'explanation' key with a string explaining your reasoning.",
                        abortSignal: controller.signal,
                    });

                    const selectedModel = MODELS[formState.selectedModel];
                    const requestCost =
                        (usage.promptTokens * selectedModel.inputPrice) /
                            1_000_000 +
                        (usage.completionTokens * selectedModel.outputPrice) /
                            1_000_000;
                    totalCost += requestCost;

                    completedItems++;
                    setProgress((completedItems / totalItems) * 100);

                    updatedDataset[i] = {
                        ...item,
                        predictedOutput: object.output,
                        explanation: object.explanation,
                    };

                    return {
                        predicted: object.output,
                        expected: item.expectedOutput,
                        error: null,
                    };
                } catch (error) {
                    completedItems++;
                    setProgress((completedItems / totalItems) * 100);
                    console.error(
                        "Error generating object for item",
                        i,
                        ":",
                        error
                    );
                    updatedDataset[i] = {
                        ...item,
                        predictedOutput: "Error: Failed to generate output",
                    };
                    return {
                        predicted: null, // Treat errors as a special case
                        expected: item.expectedOutput,
                        error: true,
                    };
                }
            });

            const results = await Promise.all(evaluationPromises);

            let truePositives = 0;
            let falsePositives = 0;
            let falseNegatives = 0;
            let trueNegatives = 0; // Optional, for completeness

            results.forEach((result) => {
                if (result.error) {
                    // Handle errors: assume it's a miss based on expected value
                    if (result.expected === true) {
                        falseNegatives++; // Expected true, but failed
                    } else {
                        falsePositives++; // Expected false, but failed
                    }
                } else {
                    if (result.predicted === true && result.expected === true) {
                        truePositives++;
                    } else if (
                        result.predicted === true &&
                        result.expected === false
                    ) {
                        falsePositives++;
                    } else if (
                        result.predicted === false &&
                        result.expected === true
                    ) {
                        falseNegatives++;
                    } else if (
                        result.predicted === false &&
                        result.expected === false
                    ) {
                        trueNegatives++;
                    }
                }
            });

            setDataset(updatedDataset);

            const precision =
                truePositives / (truePositives + falsePositives) || 0;
            const recall =
                truePositives / (truePositives + falseNegatives) || 0;
            const f1Score =
                (2 * (precision * recall)) / (precision + recall) || 0;

            const newMetrics = {
                precision,
                recall,
                f1Score,
                prompt: formState.prompt,
                model: formState.selectedModel,
                cost: totalCost, // Renamed from estimatedCost
            };

            // Only add metrics to history if not aborted
            if (!controller.signal.aborted) {
                setMetricsHistory((prevHistory) => [
                    ...prevHistory,
                    newMetrics,
                ]);
            }

            // Optional: Log for debugging
            console.log(
                JSON.stringify(
                    {
                        truePositives,
                        falsePositives,
                        falseNegatives,
                        trueNegatives,
                    },
                    null,
                    2
                )
            );
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                console.log("Evaluation was cancelled");
            } else {
                console.error("Evaluation failed:", error);
            }
        } finally {
            setIsEvaluating(false);
            setAbortController(null);
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
            setElapsedTime(0); // Reset the elapsed time
        }
    };

    const handleCancel = () => {
        if (abortController) {
            abortController.abort();
        }
    };

    const toggleRowExpansion = (index: number) => {
        setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleImportDataset = () => {
        try {
            const parsedData = JSON.parse(jsonInput);
            if (!Array.isArray(parsedData)) {
                throw new Error("Input must be an array");
            }

            const newDataset = parsedData.map((item: any) => {
                const validatedItem = datasetItemSchema.parse({
                    input: item[inputField],
                    expectedOutput: item[outputField],
                });
                return validatedItem;
            });

            setDataset(newDataset);
            setJsonInput("");
            setIsImportOpen(false);
        } catch (error) {
            if (error instanceof z.ZodError) {
                alert(
                    `Invalid dataset format: ${error.errors
                        .map((e) => e.message)
                        .join(", ")}`
                );
            } else {
                alert(
                    "Invalid JSON input. Please check your data and field names."
                );
            }
        }
    };

    const handleResetHistory = () => {
        setMetricsHistory([]);
    };

    const getBestMetrics = (history: Metrics[]): Metrics => {
        return history.reduce(
            (best, current) => ({
                precision: Math.max(best.precision, current.precision),
                recall: Math.max(best.recall, current.recall),
                f1Score: Math.max(best.f1Score, current.f1Score),
                prompt: best.prompt,
                model: best.model,
                cost: best.cost,
            }),
            {
                precision: 0,
                recall: 0,
                f1Score: 0,
                prompt: "",
                model: "",
                cost: 0,
            }
        );
    };

    const handleLoadPrompt = (prompt: string) => {
        setFormState((prev) => ({ ...prev, prompt }));
    };

    // Format time as mm:ss
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-2xl font-bold mb-4">OpenAI Playground</h1>

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
                                selectedModel: value as keyof typeof MODELS,
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
                    <Button
                        onClick={handleRunEvaluation}
                        disabled={isEvaluating}
                    >
                        {isEvaluating ? "Evaluating..." : "Run Evaluation"}
                    </Button>
                    {isEvaluating && (
                        <Button variant="destructive" onClick={handleCancel}>
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

            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Metrics History</h2>
                <div className="overflow-x-auto max-h-[20rem]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Run</TableHead>
                                <TableHead>Precision</TableHead>
                                <TableHead>Recall</TableHead>
                                <TableHead>F1 Score</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>
                                    Average Cost per 100 examples
                                </TableHead>
                                <TableHead>Prompt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(() => {
                                const bestMetrics =
                                    getBestMetrics(metricsHistory);
                                return [...metricsHistory]
                                    .reverse()
                                    .map((metrics, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {metricsHistory.length - index}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        metrics.precision ===
                                                        bestMetrics.precision
                                                            ? "font-bold"
                                                            : ""
                                                    }
                                                >
                                                    {(
                                                        metrics.precision * 100
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        metrics.recall ===
                                                        bestMetrics.recall
                                                            ? "font-bold"
                                                            : ""
                                                    }
                                                >
                                                    {(
                                                        metrics.recall * 100
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        metrics.f1Score ===
                                                        bestMetrics.f1Score
                                                            ? "font-bold"
                                                            : ""
                                                    }
                                                >
                                                    {(
                                                        metrics.f1Score * 100
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {metrics.model}
                                            </TableCell>
                                            <TableCell>
                                                ${metrics.cost.toFixed(4)}
                                            </TableCell>
                                            <TableCell>
                                                $
                                                {(
                                                    (metrics.cost /
                                                        dataset.length) *
                                                    100
                                                ).toFixed(4)}
                                            </TableCell>
                                            <TableCell>
                                                <Collapsible>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="space-y-2">
                                                        <div className="p-2 bg-gray-50 rounded">
                                                            <p className="text-sm whitespace-pre-wrap">
                                                                {metrics.prompt}
                                                            </p>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="mt-2"
                                                                onClick={() =>
                                                                    handleLoadPrompt(
                                                                        metrics.prompt
                                                                    )
                                                                }
                                                            >
                                                                Use This Prompt
                                                            </Button>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </TableCell>
                                        </TableRow>
                                    ));
                            })()}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Reset History</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your metrics history.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleResetHistory}>
                                    Reset
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Collapsible open={isImportOpen} onOpenChange={setIsImportOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        onClick={() => setIsImportOpen(!isImportOpen)}
                        variant="outline"
                    >
                        {isImportOpen
                            ? "Hide Import Dataset"
                            : "Import Dataset"}
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="json-input">JSON Input</Label>
                        <Textarea
                            id="json-input"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON dataset here (e.g., [{input: 'question', expectedOutput: true}])"
                            rows={6}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="input-field">
                                Input Field Name
                            </Label>
                            <Input
                                id="input-field"
                                value={inputField}
                                onChange={(e) => setInputField(e.target.value)}
                                placeholder="input"
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="output-field">
                                Output Field Name
                            </Label>
                            <Input
                                id="output-field"
                                value={outputField}
                                onChange={(e) => setOutputField(e.target.value)}
                                placeholder="expectedOutput"
                            />
                        </div>
                    </div>
                    <Button onClick={handleImportDataset}>Import</Button>
                </CollapsibleContent>
            </Collapsible>

            <div>
                <h2 className="text-xl font-semibold mb-2">Dataset</h2>
                <Table className="max-w-3xl">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Input</TableHead>
                            <TableHead>Expected Output</TableHead>
                            <TableHead>Predicted Output</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dataset.map((item, index) => (
                            <React.Fragment key={index}>
                                <TableRow
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleRowExpansion(index)}
                                >
                                    <TableCell>
                                        {expandedRows[index] ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.input.length > 50
                                            ? `${item.input
                                                  .split("\n")[0]
                                                  .slice(0, 50)}...`
                                            : item.input}
                                    </TableCell>
                                    <TableCell>
                                        {String(item.expectedOutput)}
                                    </TableCell>
                                    <TableCell
                                        className={
                                            item.predictedOutput ===
                                            item.expectedOutput
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        {item.predictedOutput !== undefined
                                            ? String(item.predictedOutput)
                                            : "N/A"}
                                    </TableCell>
                                </TableRow>
                                {expandedRows[index] && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="p-4 bg-gray-50 space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="w-fit">
                                                        <h3 className="font-semibold mb-2">
                                                            Input:
                                                        </h3>
                                                        <LinkedInPost
                                                            editable={true}
                                                            content={item.input}
                                                            previewWidth="w-[350px]"
                                                        />
                                                    </div>
                                                    {item.explanation && (
                                                        <div className="max-w-md">
                                                            <h3 className="font-semibold mb-2">
                                                                Explanation:
                                                            </h3>
                                                            <p className="text-gray-700 bg-white p-3 rounded-md">
                                                                {
                                                                    item.explanation
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2">
                                                        Expected Output:
                                                    </h3>
                                                    <p>
                                                        {String(
                                                            item.expectedOutput
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold mb-2">
                                                        Predicted Output:
                                                    </h3>
                                                    <p
                                                        className={
                                                            item.predictedOutput ===
                                                            item.expectedOutput
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }
                                                    >
                                                        {item.predictedOutput !==
                                                        undefined
                                                            ? String(
                                                                  item.predictedOutput
                                                              )
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
