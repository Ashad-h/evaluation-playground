"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
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
} from "@/components/ui/alert-dialog"

// Define a more flexible output schema
const outputSchema = z.object({
  output: z.union([z.boolean(), z.string(), z.number()]),
})

type OutputType = z.infer<typeof outputSchema>["output"]

interface DatasetItem {
  input: string
  expectedOutput: OutputType
  predictedOutput?: OutputType
}

interface Metrics {
  precision: number
  recall: number
  f1Score: number
}

// Define a schema for dataset items
const datasetItemSchema = z.object({
  input: z.string(),
  expectedOutput: z.union([z.boolean(), z.string(), z.number()]),
})

const initialDataset: DatasetItem[] = [
  { input: "Is the capital of France Paris?", expectedOutput: true },
  { input: "What is 2 + 2?", expectedOutput: 4 },
  { input: "Who wrote Romeo and Juliet?", expectedOutput: "William Shakespeare" },
]

export default function OpenAIPlayground() {
  const [openaiKey, setOpenaiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [prompt, setPrompt] = useState(
    "Answer the following question or statement with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number).",
  )
  const [metricsHistory, setMetricsHistory] = useState<Metrics[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [dataset, setDataset] = useState<DatasetItem[]>(initialDataset)
  const [jsonInput, setJsonInput] = useState("")
  const [inputField, setInputField] = useState("input")
  const [outputField, setOutputField] = useState("expectedOutput")
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem("openaiPlaygroundData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setOpenaiKey(parsedData.openaiKey || "")
      setSelectedModel(parsedData.selectedModel || "")
      setPrompt(parsedData.prompt || prompt)
      setDataset(parsedData.dataset || initialDataset)
      setMetricsHistory(parsedData.metricsHistory || [])
    }
  }, [])

  useEffect(() => {
    const dataToStore = {
      openaiKey,
      selectedModel,
      prompt,
      dataset,
      metricsHistory,
    }
    localStorage.setItem("openaiPlaygroundData", JSON.stringify(dataToStore))
  }, [openaiKey, selectedModel, prompt, dataset, metricsHistory])

  useEffect(() => {
    const dataToStore = {
      openaiKey,
      selectedModel,
      prompt,
      dataset,
      metricsHistory,
    }
    localStorage.setItem("openaiPlaygroundData", JSON.stringify(dataToStore))
  }, [dataset])

  const handleRunEvaluation = async () => {
    if (!openaiKey || !selectedModel || !prompt) {
      alert("Please fill in all fields")
      return
    }

    setIsEvaluating(true)
    const updatedDataset = [...dataset]
    const openai = createOpenAI({
      apiKey: openaiKey,
    })

    const evaluationPromises = updatedDataset.map(async (item, i) => {
      try {
        const { object } = await generateObject({
          model: openai(selectedModel),
          schema: outputSchema,
          prompt: `${prompt}\n\nInput: ${item.input}`,
          system:
            "You are a helpful AI that responds with a JSON object containing a single key 'output' with the appropriate value (boolean, string, or number) based on the input question or statement.",
        })

        updatedDataset[i] = { ...item, predictedOutput: object.output }

        return {
          predicted: object.output,
          expected: item.expectedOutput,
          error: null,
        }
      } catch (error) {
        console.error("Error generating object for item", i, ":", error)
        updatedDataset[i] = { ...item, predictedOutput: "Error: Failed to generate output" }
        return {
          predicted: null, // Treat errors as a special case
          expected: item.expectedOutput,
          error: true,
        }
      }
    })

    const results = await Promise.all(evaluationPromises)

    let truePositives = 0
    let falsePositives = 0
    let falseNegatives = 0
    let trueNegatives = 0 // Optional, for completeness

    results.forEach((result) => {
      if (result.error) {
        // Handle errors: assume it's a miss based on expected value
        if (result.expected === true) {
          falseNegatives++ // Expected true, but failed
        } else {
          falsePositives++ // Expected false, but failed
        }
      } else {
        if (result.predicted === true && result.expected === true) {
          truePositives++
        } else if (result.predicted === true && result.expected === false) {
          falsePositives++
        } else if (result.predicted === false && result.expected === true) {
          falseNegatives++
        } else if (result.predicted === false && result.expected === false) {
          trueNegatives++
        }
      }
    })

    setDataset(updatedDataset)

    const precision = truePositives / (truePositives + falsePositives) || 0
    const recall = truePositives / (truePositives + falseNegatives) || 0
    const f1Score = (2 * (precision * recall)) / (precision + recall) || 0

    const newMetrics = {
      precision,
      recall,
      f1Score,
    }

    setMetricsHistory((prevHistory) => [...prevHistory, newMetrics])
    setIsEvaluating(false)

    // Optional: Log for debugging
    console.log(JSON.stringify({ truePositives, falsePositives, falseNegatives, trueNegatives }, null, 2))
  }

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleImportDataset = () => {
    try {
      const parsedData = JSON.parse(jsonInput)
      if (!Array.isArray(parsedData)) {
        throw new Error("Input must be an array")
      }

      const newDataset = parsedData.map((item: any) => {
        const validatedItem = datasetItemSchema.parse({
          input: item[inputField],
          expectedOutput: item[outputField],
        })
        return validatedItem
      })

      setDataset(newDataset)
      setJsonInput("")
      setIsImportOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(`Invalid dataset format: ${error.errors.map((e) => e.message).join(", ")}`)
      } else {
        alert("Invalid JSON input. Please check your data and field names.")
      }
    }
  }

  const handleResetHistory = () => {
    setMetricsHistory([])
  }

  const getBestMetrics = (history: Metrics[]): Metrics => {
    return history.reduce(
      (best, current) => ({
        precision: Math.max(best.precision, current.precision),
        recall: Math.max(best.recall, current.recall),
        f1Score: Math.max(best.f1Score, current.f1Score),
      }),
      { precision: 0, recall: 0, f1Score: 0 },
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">OpenAI Playground</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <Input
            id="openai-key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
          />
        </div>

        <div>
          <Label htmlFor="model-select">Select Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here"
            rows={4}
          />
        </div>

        <Button onClick={handleRunEvaluation} disabled={isEvaluating}>
          {isEvaluating ? "Evaluating..." : "Run Evaluation"}
        </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const bestMetrics = getBestMetrics(metricsHistory)
                return [...metricsHistory].reverse().map((metrics, index) => (
                  <TableRow key={index}>
                    <TableCell>{metricsHistory.length - index}</TableCell>
                    <TableCell>
                      <span className={metrics.precision === bestMetrics.precision ? "font-bold" : ""}>
                        {(metrics.precision * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={metrics.recall === bestMetrics.recall ? "font-bold" : ""}>
                        {(metrics.recall * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={metrics.f1Score === bestMetrics.f1Score ? "font-bold" : ""}>
                        {(metrics.f1Score * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))
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
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your metrics history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetHistory}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Collapsible open={isImportOpen} onOpenChange={setIsImportOpen}>
        <CollapsibleTrigger asChild>
          <Button onClick={() => setIsImportOpen(!isImportOpen)} variant="outline">
            {isImportOpen ? "Hide Import Dataset" : "Import Dataset"}
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
              <Label htmlFor="input-field">Input Field Name</Label>
              <Input
                id="input-field"
                value={inputField}
                onChange={(e) => setInputField(e.target.value)}
                placeholder="input"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="output-field">Output Field Name</Label>
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
        <Table>
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
                <TableRow>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleRowExpansion(index)}>
                      {expandedRows[index] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>{item.input.slice(0, 50)}...</TableCell>
                  <TableCell>{String(item.expectedOutput)}</TableCell>
                  <TableCell
                    className={item.predictedOutput === item.expectedOutput ? "text-green-600" : "text-red-600"}
                  >
                    {item.predictedOutput !== undefined ? String(item.predictedOutput) : "N/A"}
                  </TableCell>
                </TableRow>
                {expandedRows[index] && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="p-4 bg-gray-50 space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Input:</h3>
                          <p>{item.input}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Expected Output:</h3>
                          <p>{String(item.expectedOutput)}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Predicted Output:</h3>
                          <p
                            className={item.predictedOutput === item.expectedOutput ? "text-green-600" : "text-red-600"}
                          >
                            {item.predictedOutput !== undefined ? String(item.predictedOutput) : "N/A"}
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
  )
}

