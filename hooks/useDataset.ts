import { useState } from "react";
import { z } from "zod";
import { DatasetItem, datasetItemSchema } from "@/types";
import { initialDataset } from "@/constants";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Custom hook for managing the dataset
 * @returns Dataset state and management functions
 */
export function useDataset() {
    const [dataset, setDataset] = useLocalStorage<DatasetItem[]>(
        "dataset",
        initialDataset
    );
    const [jsonInput, setJsonInput] = useState("");
    const [inputField, setInputField] = useState("input");
    const [outputField, setOutputField] = useState("expectedOutput");
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        {}
    );

    /**
     * Toggles the expansion state of a dataset row
     */
    const toggleRowExpansion = (index: number) => {
        setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    /**
     * Imports a dataset from JSON input
     */
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

    return {
        dataset,
        setDataset,
        jsonInput,
        setJsonInput,
        inputField,
        setInputField,
        outputField,
        setOutputField,
        isImportOpen,
        setIsImportOpen,
        expandedRows,
        toggleRowExpansion,
        handleImportDataset,
    };
}
