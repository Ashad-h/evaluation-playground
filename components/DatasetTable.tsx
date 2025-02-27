import React, { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DatasetItem } from "@/types";
import { LinkedInPost } from "@/components/LinkedInPost";

interface DatasetTableProps {
    dataset: DatasetItem[];
    expandedRows: Record<number, boolean>;
    onToggleRow: (index: number) => void;
    evaluateImages: boolean;
}

export function DatasetTable({
    dataset,
    expandedRows,
    onToggleRow,
    evaluateImages = false,
}: DatasetTableProps) {
    // Force render of all LinkedIn posts when evaluateImages is true
    useEffect(() => {
        if (evaluateImages) {
            console.log("Preparing LinkedIn posts for image capture");
        }
    }, [evaluateImages, dataset]);
    return (
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
                                onClick={() => onToggleRow(index)}
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
                            {/* Always render the LinkedIn post but keep it hidden when not expanded */}
                            <TableRow className={expandedRows[index] ? "" : "hidden"}>
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
                                                        {item.explanation}
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
                            {/* LinkedIn post for image capture - visually hidden but still rendered */}
                            <TableRow className="h-0 overflow-hidden">
                                <TableCell colSpan={4} className="p-0 border-0">
                                    <div className="opacity-0 pointer-events-none" style={{ visibility: 'hidden', position: 'absolute', left: '-9999px', top: '-9999px' }}>
                                        <div id={`linkedin-post-${index}`}>
                                            <LinkedInPost
                                                content={item.input}
                                                previewWidth="w-[350px]"
                                            />
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
