"use client";

import React from "react";
import { useDataset } from "@/hooks/useDataset";
import { useEvaluation } from "@/hooks/useEvaluation";
import { EvaluationForm } from "@/components/EvaluationForm";
import { MetricsHistory } from "@/components/MetricsHistory";
import { DatasetTable } from "@/components/DatasetTable";
import { DatasetImport } from "@/components/DatasetImport";

/**
 * Main OpenAI Playground component
 */
export default function OpenAIPlayground() {
  // Dataset management
  const {
    dataset,
    setDataset,
    jsonInput,
    setJsonInput,
    inputField,
    setInputField,
    outputField,
    setOutputField,
    imageUrlField,
    setImageUrlField,
    isImportOpen,
    setIsImportOpen,
    expandedRows,
    toggleRowExpansion,
    handleImportDataset,
  } = useDataset();

  // Evaluation logic
  const {
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
  } = useEvaluation(dataset, setDataset);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">OpenAI Playground</h1>

      {/* Evaluation Form */}
      <EvaluationForm
        formState={formState}
        setFormState={setFormState}
        isEvaluating={isEvaluating}
        progress={progress}
        elapsedTime={elapsedTime}
        formatTime={formatTime}
        onRunEvaluation={handleRunEvaluation}
        onCancel={handleCancel}
      />

      {/* Metrics History */}
      <MetricsHistory
        metricsHistory={metricsHistory}
        datasetLength={dataset.length}
        onResetHistory={handleResetHistory}
        onLoadPrompt={handleLoadPrompt}
        getBestMetrics={getBestMetrics}
      />

      {/* Dataset Import */}
      <DatasetImport
        jsonInput={jsonInput}
        setJsonInput={setJsonInput}
        inputField={inputField}
        setInputField={setInputField}
        outputField={outputField}
        setOutputField={setOutputField}
        imageUrlField={imageUrlField}
        setImageUrlField={setImageUrlField}
        isImportOpen={isImportOpen}
        setIsImportOpen={setIsImportOpen}
        onImport={handleImportDataset}
      />

      {/* Dataset Table */}
      <DatasetTable
        dataset={dataset}
        expandedRows={expandedRows}
        onToggleRow={toggleRowExpansion}
        evaluateImages={formState.evaluateImages}
        evaluateLinkedInMessage={formState.evaluateLinkedInMessage}
        openaiKey={formState.openaiKey}
        selectedModel={formState.selectedModel}
        prompt={formState.prompt}
        onUpdateDatasetItem={(index, updatedItem) => {
          const newDataset = [...dataset];
          newDataset[index] = updatedItem;
          setDataset(newDataset);
        }}
        onPromptChange={(newPrompt) => {
          setFormState((prev) => ({
            ...prev,
            prompt: newPrompt,
          }));
        }}
      />
    </div>
  );
}
