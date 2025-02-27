import React from "react";
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
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Metrics } from "@/types";

interface MetricsHistoryProps {
    metricsHistory: Metrics[];
    datasetLength: number;
    onResetHistory: () => void;
    onLoadPrompt: (prompt: string) => void;
    getBestMetrics: (history: Metrics[]) => Metrics;
}

export function MetricsHistory({
    metricsHistory,
    datasetLength,
    onResetHistory,
    onLoadPrompt,
    getBestMetrics,
}: MetricsHistoryProps) {
    return (
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
                            <TableHead>Average Cost per 100 examples</TableHead>
                            <TableHead>Prompt</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(() => {
                            const bestMetrics = getBestMetrics(metricsHistory);
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
                                                {(metrics.recall * 100).toFixed(
                                                    1
                                                )}
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
                                        <TableCell>{metrics.model}</TableCell>
                                        <TableCell>
                                            ${metrics.cost.toFixed(4)}
                                        </TableCell>
                                        <TableCell>
                                            $
                                            {(
                                                (metrics.cost / datasetLength) *
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
                                                                onLoadPrompt(
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
                            <AlertDialogAction onClick={onResetHistory}>
                                Reset
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
