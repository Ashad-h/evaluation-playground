import type { JSONContent } from "@tiptap/core";

/**
 * Converts a string to TipTap JSON format
 * @param str The string to convert
 * @returns TipTap JSON content
 */
export function stringToJSON(str: string): JSONContent {
    try {
        // Split text into paragraphs, keeping empty ones
        const paragraphs = str.trim().split("\n");

        return {
            type: "doc",
            content: paragraphs.map((p) => ({
                type: "paragraph",
                content: p.length > 0 ? [{ type: "text", text: p }] : [],
            })),
        };
    } catch (e) {
        console.error("Error converting string to JSON:", e);
        return {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: "" }],
                },
            ],
        };
    }
}

/**
 * Converts TipTap JSON to a string
 * @param json The TipTap JSON content
 * @returns A string representation
 */
export function JSONToString(json: JSONContent): string {
    return (
        json.content
            ?.map((p: JSONContent) => p.content?.[0]?.text || "")
            .join("\n") || ""
    );
}
