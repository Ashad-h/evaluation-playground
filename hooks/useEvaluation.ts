import { useState, useEffect } from "react";
import { createOpenAI } from "@ai-sdk/openai";
import {
  generateObject,
  generateText,
  TextPart,
  ImagePart,
  CoreMessage,
} from "ai";
import { DatasetItem, FormState, Metrics, outputSchema } from "@/types";
import { MODELS, ModelKey } from "@/constants";
import { useLocalStorage } from "./useLocalStorage";
import { getRenderedLines } from "@/lib/utils";

/**
 * Custom hook for managing the evaluation process
 * @param dataset The dataset to evaluate
 * @param setDataset Function to update the dataset
 * @returns Evaluation state and functions
 */
export function useEvaluation(
  dataset: DatasetItem[],
  setDataset: (value: DatasetItem[]) => void,
) {
  const [formState, setFormState] = useLocalStorage<FormState>("formState", {
    openaiKey: "",
    selectedModel: "gpt-4.1-mini" as ModelKey,
    prompt:
      "Answer the following question or statement with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number).",
    evaluateImages: false,
    evaluatePostImage: false,
    minCharCount: 0,
    minLineCount: 0,
    evaluateArticle: false,
    evaluateLinkedInMessage: false,
  });

  const [metricsHistory, setMetricsHistory] = useLocalStorage<Metrics[]>(
    "metricsHistory",
    [],
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  /**
   * Captures an image of a LinkedIn post
   * @param index The index of the post to capture
   * @returns A promise that resolves to the data URL of the captured image
   */
  const captureLinkedInPost = async (
    index: number,
  ): Promise<{ lines: string[] }> => {
    // Add a small delay to ensure the element is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    const postElement = document.getElementById(`linkedin-post-${index}`);
    if (!postElement) {
      throw new Error(
        `LinkedIn post element with id linkedin-post-${index} not found`,
      );
    }

    const postContentElement = postElement.querySelector(
      ".post-content",
    ) as HTMLElement;
    if (!postContentElement) {
      throw new Error(`Post content element with class post-content not found`);
    }
    try {
      // Make sure the element is visible for capture
      const parentElement = postElement.parentElement;
      if (parentElement) {
        const originalStyle = parentElement.style.cssText;
        // Temporarily make it visible for capture
        parentElement.style.visibility = "visible";
        parentElement.style.position = "fixed";
        parentElement.style.top = "0";
        parentElement.style.left = "0";
        parentElement.style.opacity = "1";
        parentElement.style.pointerEvents = "auto";
        parentElement.style.zIndex = "-1000"; // Behind everything else

        // Wait a bit for the styles to apply
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Restore original style
        parentElement.style.cssText = originalStyle;

        return {
          lines: getRenderedLines(postContentElement),
        };
      } else {
        return {
          lines: getRenderedLines(postContentElement),
        };
      }
    } catch (error) {
      console.error("Error capturing LinkedIn post:", error);
      throw error;
    }
  };

  /**
   * Runs the evaluation on the dataset
   */
  const handleRunEvaluation = async () => {
    if (!formState.openaiKey || !formState.selectedModel || !formState.prompt) {
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
        baseURL: "https://openrouter.ai/api/v1",
      });

      let completedItems = 0;
      const totalItems = updatedDataset.length;

      const evaluationPromises = updatedDataset.map(async (item, i) => {
        try {
          // Check if the post meets the minimum character count when evaluating images
          if (formState.evaluateImages) {
            // Check character count
            if (
              formState.minCharCount > 0 &&
              item.input.length < formState.minCharCount
            ) {
              // If post is too short, automatically set output to false
              completedItems++;
              setProgress((completedItems / totalItems) * 100);

              updatedDataset[i] = {
                ...item,
                predictedOutput: false,
                explanation: `Post is too short (${item.input.length} characters). Minimum required: ${formState.minCharCount} characters.`,
              };

              return {
                predicted: false,
                expected: item.expectedOutput,
                error: null,
              };
            }

            // Line count will be checked after capturing the LinkedIn post image
          }

          // Create the system message
          const systemMessage =
            "You are a helpful AI that responds with a JSON object containing an 'output' key with the appropriate value (boolean, string, or number) and an 'explanation' key with a string explaining your reasoning.";

          const message: CoreMessage = {
            role: "user",
            content: [
              {
                type: "text",
                text: `${formState.prompt}`,
              },
            ],
          };

          // If evaluating images, also capture and add the LinkedIn post as an image
          if (formState.evaluateImages) {
            try {
              const imageUrl = await captureLinkedInPost(i);
              console.log(`Captured image for item ${i}`);

              // Check line count using the captured lines
              if (formState.minLineCount > 0) {
                const lineCount = imageUrl.lines.length;

                if (lineCount < formState.minLineCount) {
                  // If post has too few lines, automatically set output to false
                  completedItems++;
                  setProgress((completedItems / totalItems) * 100);

                  updatedDataset[i] = {
                    ...item,
                    predictedOutput: false,
                    explanation: `Post has too few lines (${lineCount} lines). Minimum required: ${formState.minLineCount} lines.`,
                  };

                  return {
                    predicted: false,
                    expected: item.expectedOutput,
                    error: null,
                  };
                }
              }

              // Add the lines to the message
              (message.content as Array<TextPart>).push({
                type: "text",
                text: JSON.stringify(imageUrl.lines, null, 2),
              });
            } catch (error) {
              console.error(`Failed to capture image for item ${i}:`, error);
              // Continue with just the text input if image capture fails
            }
          } else if (formState.evaluatePostImage && item.imageUrl) {
            (message.content as Array<ImagePart>).push({
              type: "image",
              image: item.imageUrl,
            });
          } else if (formState.evaluateArticle) {
            const articleEl = document
              .getElementById(`article-content-${i}`)
              ?.shadowRoot?.querySelector(".article-content");

            if (!articleEl) {
              throw new Error(
                `Article element with id article-content-${i} not found`,
              );
            }

            // Clone the element to avoid modifying the original
            const clone = articleEl.cloneNode(true) as HTMLElement;

            // Remove unwanted elements from the clone
            clone
              .querySelectorAll("style, script, link, meta")
              .forEach((el) => el.remove());

            // Get only the visible human-readable text
            const textContent = clone.innerText.trim();

            console.log(textContent);
            (message.content as Array<TextPart>).push({
              type: "text",
              text: `Article title: ${item.input.title}\nArticle content: ${textContent}`,
            });
          } else {
            (message.content as Array<TextPart>).push({
              type: "text",
              text: `${item.input}`,
            });
          }

          // Step 1: Generate raw text with the main model
          const { text: rawOutput, usage: mainModelUsage } = await generateText(
            {
              model: openai(MODELS[formState.selectedModel].value),
              system: systemMessage,
              messages: [message],
              abortSignal: controller.signal,
            },
          );

          // Step 2: Use gpt-4o-mini to parse the raw text into an object
          const parsingMessage: CoreMessage = {
            role: "user",
            content: [
              {
                type: "text",
                text: `Parse the following text into a JSON object with 'output' and 'explanation' keys. The output should be a boolean, string, or number as appropriate:\n\n${rawOutput}`,
              },
            ],
          };

          const { object, usage: parsingUsage } = await generateObject({
            model: openai(MODELS["openai/gpt-4.1-mini"].value),
            schema: outputSchema,
            system:
              "You are a helpful assistant that parses text into structured JSON objects.",
            messages: [parsingMessage],
            abortSignal: controller.signal,
          });

          // Calculate cost for both models
          const mainModel = MODELS[formState.selectedModel];
          const parsingModel = MODELS["openai/gpt-4.1-mini"];

          const mainModelCost =
            (mainModelUsage.promptTokens * mainModel.inputPrice) / 1_000_000 +
            (mainModelUsage.completionTokens * mainModel.outputPrice) /
              1_000_000;

          const parsingCost =
            (parsingUsage.promptTokens * parsingModel.inputPrice) / 1_000_000 +
            (parsingUsage.completionTokens * parsingModel.outputPrice) /
              1_000_000;

          const requestCost = mainModelCost + parsingCost;
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
          console.error("Error generating object for item", i, ":", error);
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
          } else if (result.predicted === true && result.expected === false) {
            falsePositives++;
          } else if (result.predicted === false && result.expected === true) {
            falseNegatives++;
          } else if (result.predicted === false && result.expected === false) {
            trueNegatives++;
          }
        }
      });

      setDataset(updatedDataset);

      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = (2 * (precision * recall)) / (precision + recall) || 0;

      const newMetrics = {
        precision,
        recall,
        f1Score,
        prompt: formState.prompt,
        model: formState.selectedModel,
        cost: totalCost,
      };

      // Only add metrics to history if not aborted
      if (!controller.signal.aborted) {
        setMetricsHistory((prevHistory) => [...prevHistory, newMetrics]);
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
          2,
        ),
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

  /**
   * Cancels the current evaluation
   */
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  /**
   * Resets the metrics history
   */
  const handleResetHistory = () => {
    setMetricsHistory([]);
  };

  /**
   * Loads a prompt into the form state
   */
  const handleLoadPrompt = (prompt: string) => {
    setFormState((prev) => ({ ...prev, prompt }));
  };

  /**
   * Gets the best metrics from the history
   */
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
      },
    );
  };

  /**
   * Formats time as mm:ss
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    formState,
    setFormState,
    metricsHistory,
    isEvaluating,
    progress,
    elapsedTime,
    handleRunEvaluation,
    handleCancel,
    handleResetHistory,
    handleLoadPrompt,
    getBestMetrics,
    formatTime,
  };
}
