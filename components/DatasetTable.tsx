import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Check, X, Download } from "lucide-react";
import { DatasetItem } from "@/types";
import { LinkedInPost } from "@/components/LinkedInPost";
import { LinkedInMessageItem } from "@/components/LinkedInMessageItem";
import { exportDatasetToJson } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DatasetTableProps {
    dataset: DatasetItem[];
    expandedRows: Record<number, boolean>;
    onToggleRow: (index: number) => void;
    evaluateImages: boolean;
    evaluateLinkedInMessage?: boolean;
    openaiKey?: string;
    selectedModel?: string;
    prompt?: string;
    onUpdateDatasetItem?: (index: number, updatedItem: DatasetItem) => void;
    onPromptChange?: (prompt: string) => void;
}

function LinkedInItem({
    item,
    index,
    renderBooleanValue,
}: {
    item: DatasetItem;
    index: number;
    renderBooleanValue: (
        value: boolean,
        index: number,
        isExpectedOutput: boolean,
        inParagraph?: boolean
    ) => React.ReactNode;
}) {
    return (
        <div className="p-4 bg-gray-50 space-y-4">
            {item.imageUrl && (
                <div>
                    <h3 className="font-semibold mb-2">Image:</h3>
                    <img
                        src={item.imageUrl}
                        alt="Dataset item image"
                        className="max-w-lg object-contain rounded-md border border-gray-200"
                    />
                </div>
            )}

            <div className="flex gap-4">
                <div className="w-fit">
                    <h3 className="font-semibold mb-2">Input:</h3>
                    <LinkedInPost
                        editable={true}
                        content={item.input}
                        previewWidth="w-[350px]"
                    />
                </div>
                {item.explanation && (
                    <div className="max-w-md">
                        <h3 className="font-semibold mb-2">Explanation:</h3>
                        <p className="text-gray-700 bg-white p-3 rounded-md">
                            {item.explanation}
                        </p>
                    </div>
                )}
            </div>
            <div>
                <h3 className="font-semibold mb-2">Expected Output:</h3>
                <p>
                    {typeof item.expectedOutput === "boolean"
                        ? renderBooleanValue(
                              item.expectedOutput,
                              index,
                              true,
                              true
                          )
                        : String(item.expectedOutput)}
                </p>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Predicted Output:</h3>
                <p
                    className={
                        item.predictedOutput === item.expectedOutput
                            ? "text-green-600"
                            : "text-red-600"
                    }
                >
                    {item.predictedOutput !== undefined
                        ? String(item.predictedOutput)
                        : "N/A"}
                </p>
            </div>
        </div>
    );
}

function BlogArticleItem({
    index,
    item,
}: {
    index: number;
    item: DatasetItem;
}) {
    const article = item.input;
    const shadowRootRef = useRef<HTMLDivElement | null>(null);

    // Memoize the shadow DOM content creation to avoid unnecessary re-renders
    const createShadowContent = useCallback(
        (node: HTMLDivElement) => {
            if (!node) return;

            shadowRootRef.current = node;

            // Clear any existing shadow root
            if (node.shadowRoot) {
                while (node.shadowRoot.firstChild) {
                    node.shadowRoot.removeChild(node.shadowRoot.firstChild);
                }
            }

            // Create shadow root if it doesn't exist
            const shadowRoot =
                node.shadowRoot || node.attachShadow({ mode: "open" });

            // Create container for article content
            const articleContainer = document.createElement("div");
            articleContainer.className = "article-content";
            articleContainer.innerHTML = article.content;

            shadowRoot.appendChild(articleContainer);
        },
        [article.content]
    );

    // Memoize the article content component
    const ArticleContent = useMemo(() => {
        return (
            <div
                id={`article-content-${index}`}
                className="mx-auto w-[50rem]"
                ref={createShadowContent}
            />
        );
    }, [createShadowContent]);

    return (
        <div className="flex gap-6">
            <div className="w-full">
                <h3 className="font-semibold mb-2">Blog Article:</h3>
                <div className="bg-white shadow-sm rounded-md border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1 flex justify-between">
                        <span>{article.source_name}</span>
                        {article.url && (
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                View Original
                            </a>
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-3">{article.title}</h2>
                    <div className="flex">{ArticleContent}</div>
                </div>
            </div>
            {item.explanation && (
                <div className="max-w-md">
                    <h3 className="font-semibold mb-2">Explanation:</h3>
                    <p className="text-gray-700 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        {item.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}

export function DatasetTable({
    dataset,
    expandedRows,
    onToggleRow,
    evaluateImages = false,
    evaluateLinkedInMessage = false,
    openaiKey = "",
    selectedModel = "",
    prompt = "",
    onUpdateDatasetItem,
    onPromptChange,
}: DatasetTableProps) {
    // State for export dialog
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportFilename, setExportFilename] = useState("dataset.json");

    // Handle dataset export
    const handleExportDataset = () => {
        setIsExportDialogOpen(true);
    };

    // Handle export confirmation
    const handleExportConfirm = () => {
        // Make sure filename has .json extension
        const filename = exportFilename.endsWith(".json")
            ? exportFilename
            : `${exportFilename}.json`;

        exportDatasetToJson(dataset, filename);
        setIsExportDialogOpen(false);
    };
    // Force render of all LinkedIn posts when evaluateImages is true
    useEffect(() => {
        if (evaluateImages) {
            console.log("Preparing LinkedIn posts for image capture");
        }
    }, [evaluateImages, dataset]);

    // Handle toggling boolean expected output
    const handleToggleExpectedOutput = (
        index: number,
        currentValue: boolean
    ) => {
        if (onUpdateDatasetItem) {
            const updatedItem = {
                ...dataset[index],
                expectedOutput: !currentValue,
            };
            onUpdateDatasetItem(index, updatedItem);
        }
    };

    // Render boolean value as a clickable element
    const renderBooleanValue = (
        value: boolean,
        index: number,
        isExpectedOutput: boolean,
        inParagraph: boolean = false
    ) => {
        if (isExpectedOutput && onUpdateDatasetItem) {
            const Element = inParagraph ? "span" : "div";
            return (
                <Element
                    className="flex items-center cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpectedOutput(index, value);
                    }}
                >
                    <span
                        className={`inline-flex w-6 h-6 rounded-md items-center justify-center mr-2 ${
                            value
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                        }`}
                    >
                        {value ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}
                    </span>
                    {String(value)}
                </Element>
            );
        }
        return String(value);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Dataset</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportDataset}
                    className="flex items-center gap-1"
                >
                    <Download className="h-4 w-4" />
                    Export Dataset
                </Button>
            </div>

            {/* Export Dataset Dialog */}
            <AlertDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Export Dataset</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter a name for your dataset file.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="filename" className="text-right">
                            Filename
                        </Label>
                        <Input
                            id="filename"
                            value={exportFilename}
                            onChange={(e) => setExportFilename(e.target.value)}
                            placeholder="dataset.json"
                            className="mt-1"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExportConfirm}>
                            Export
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Table className="">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[70px]">Index</TableHead>
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
                                onClick={() => onToggleRow(index)}
                            >
                                <TableCell>
                                    {expandedRows[index] ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    {typeof item.input === "object"
                                        ? `${item.input.title.slice(0, 50)}${
                                              item.input.title.length > 50
                                                  ? "..."
                                                  : ""
                                          }`
                                        : typeof item.input === "string" &&
                                          item.input.length > 50
                                        ? `${item.input
                                              .split("\n")[0]
                                              .slice(0, 50)}...`
                                        : String(item.input)}
                                </TableCell>
                                <TableCell>
                                    {typeof item.expectedOutput === "boolean" &&
                                    !evaluateLinkedInMessage
                                        ? renderBooleanValue(
                                              item.expectedOutput,
                                              index,
                                              true
                                          )
                                        : item.expectedOutput
                                        ? String(item.expectedOutput)
                                        : "N/A"}
                                </TableCell>
                                <TableCell
                                    className={
                                        item.predictedOutput ===
                                        item.expectedOutput
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    {item.predictedOutput !== undefined &&
                                    !evaluateLinkedInMessage
                                        ? String(item.predictedOutput)
                                        : "N/A"}
                                </TableCell>
                            </TableRow>
                            {/* Expanded row content */}
                            <TableRow
                                className={expandedRows[index] ? "" : "hidden"}
                            >
                                <TableCell colSpan={5}>
                                    {evaluateLinkedInMessage &&
                                    typeof item.input === "object" ? (
                                        <LinkedInMessageItem
                                            item={item}
                                            index={index}
                                            apiKey={openaiKey}
                                            model={selectedModel}
                                            prompt={prompt}
                                            onUpdateDatasetItem={
                                                onUpdateDatasetItem
                                            }
                                            onPromptChange={onPromptChange}
                                        />
                                    ) : typeof item.input === "object" &&
                                      !evaluateLinkedInMessage ? (
                                        <BlogArticleItem
                                            index={index}
                                            item={item}
                                        />
                                    ) : (
                                        <LinkedInItem
                                            item={item}
                                            index={index}
                                            renderBooleanValue={
                                                renderBooleanValue
                                            }
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                            {/* LinkedIn post for image capture - visually hidden but still rendered */}
                            <TableRow className="h-0 overflow-hidden">
                                <TableCell colSpan={5} className="p-0 border-0">
                                    <div
                                        className="opacity-0 pointer-events-none"
                                        style={{
                                            visibility: "hidden",
                                            position: "absolute",
                                            left: "-9999px",
                                            top: "-9999px",
                                        }}
                                    >
                                        <div id={`linkedin-post-${index}`}>
                                            {typeof item.input === "string" && (
                                                <LinkedInPost
                                                    content={item.input}
                                                    previewWidth="w-[350px]"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
