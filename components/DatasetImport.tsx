import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DatasetImportProps {
    jsonInput: string;
    setJsonInput: (value: any) => void;
    inputField: string;
    setInputField: (value: string) => void;
    outputField: string;
    setOutputField: (value: string) => void;
    imageUrlField: string;
    setImageUrlField: (value: string) => void;
    isImportOpen: boolean;
    setIsImportOpen: (value: boolean) => void;
    onImport: () => void;
}

export function DatasetImport({
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
    onImport,
}: DatasetImportProps) {
    return (
        <Collapsible open={isImportOpen} onOpenChange={setIsImportOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    onClick={() => setIsImportOpen(!isImportOpen)}
                    variant="outline"
                >
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
                    <div className="flex-1">
                        <Label htmlFor="image-url-field">Image URL Field Name</Label>
                        <Input
                            id="image-url-field"
                            value={imageUrlField}
                            onChange={(e) => setImageUrlField(e.target.value)}
                            placeholder="imageUrl"
                        />
                    </div>
                </div>
                <Button onClick={onImport}>Import</Button>
            </CollapsibleContent>
        </Collapsible>
    );
}
