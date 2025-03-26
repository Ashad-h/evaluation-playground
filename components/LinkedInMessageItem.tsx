import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatasetItem } from "@/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { MODELS } from "@/constants";

interface LinkedInMessageItemProps {
    item: DatasetItem;
    index: number;
    apiKey: string;
    model: string;
    prompt: string;
    onUpdateDatasetItem?: (index: number, updatedItem: DatasetItem) => void;
    onPromptChange?: (prompt: string) => void;
}

export function LinkedInMessageItem({
    item,
    index,
    apiKey,
    model,
    prompt,
    onUpdateDatasetItem,
    onPromptChange,
}: LinkedInMessageItemProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState<string | null>(
        item.predictedOutput ? String(item.predictedOutput) : null
    );

    const profileData = item.input;

    const handleGenerateMessage = async () => {
        if (!apiKey) {
            alert("Please enter your OpenAI API key in the form above");
            return;
        }

        setIsGenerating(true);

        try {
            const openai = createOpenAI({
                apiKey: apiKey,
                baseURL: "https://openrouter.ai/api/v1",
            });

            const userPrompt = `${prompt}

Nom: ${profileData.name}
Titre: ${profileData.title}
Rôle: ${profileData.role}
Résumé du profil: ${profileData.summary.trim()}
Études de cas: ${profileData.caseStudy.trim()}`;

            const { text: message, usage } = await generateText({
                model: openai(model),
                messages: [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
            });

            // Calculate cost based on token usage
            const selectedModel = MODELS[model as keyof typeof MODELS];
            const cost = (
                (usage.promptTokens * selectedModel.inputPrice +
                    usage.completionTokens * selectedModel.outputPrice) /
                1_000_000
            ).toFixed(4);

            setGeneratedMessage(`${message}\n\nRequest cost: $${cost}`);

            if (onUpdateDatasetItem) {
                onUpdateDatasetItem(index, {
                    ...item,
                    predictedOutput: message,
                });
            }
        } catch (error) {
            console.error("Error generating message:", error);
            alert("Failed to generate message. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-3">
                            Profile Information
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-gray-700">
                                    Name:
                                </h4>
                                <p>{profileData.name}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700">
                                    Title:
                                </h4>
                                <p>{profileData.title}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-700">
                                    Role:
                                </h4>
                                <p>{profileData.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Summary</h3>
                        <p className="whitespace-pre-line">
                            {profileData.summary}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Prompt</h3>
                        <textarea
                            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                            value={prompt}
                            onChange={(e) => onPromptChange && onPromptChange(e.target.value)}
                            placeholder="Enter your prompt here"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">
                            Case Study
                        </h3>
                        <div className="whitespace-pre-line">
                            {profileData.caseStudy.trim()}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg">
                                Generated Message
                            </h3>
                            <Button
                                onClick={handleGenerateMessage}
                                disabled={isGenerating}
                                size="sm"
                            >
                                {isGenerating
                                    ? "Generating..."
                                    : "Generate Message"}
                            </Button>
                        </div>

                        {generatedMessage ? (
                            <div className="whitespace-pre-line bg-blue-50 p-3 rounded-md border border-blue-100">
                                {generatedMessage}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">
                                Click "Generate Message" to create a
                                personalized outreach message
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
