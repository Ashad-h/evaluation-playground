import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Return an array of "rendered lines" from the container,
 * where each entry holds the text content of that line.
 *
 * Empty lines (e.g. from <br> or empty block elements) are also recorded.
 */
export function getRenderedLines(container: HTMLElement): string[] {
    const lines: string[] = [];
    let currentLineText = ""; // collects text for the "active" line
    let lastLineTop: number | null = null;

    /**
     * Processes a single text node by measuring how its text is laid out
     * across multiple browser-rendered lines.
     */
    function processTextNode(textNode: Text) {
        const text = textNode.nodeValue || "";
        if (!text.trim() && !text.includes("\n")) {
            // It's purely whitespace; we still measure because it may affect line breaks.
            // But if it is truly invisible and not creating new lines, you may choose to skip it.
        }

        const range = document.createRange();
        let startOffset = 0;

        while (startOffset < text.length) {
            range.setStart(textNode, startOffset);
            let endOffset = startOffset + 1;
            range.setEnd(textNode, endOffset);

            // Get the initial bounding rect for the first character
            const rects = range.getClientRects();
            if (!rects.length) {
                // Possibly whitespace, or the text is not visible. Skip it.
                startOffset++;
                continue;
            }

            let lineTop = rects[0].top;

            // Keep extending the range until we move onto a new line
            while (endOffset < text.length) {
                range.setEnd(textNode, endOffset + 1);
                const nextRects = range.getClientRects();
                if (!nextRects.length) {
                    // Potentially invisible, break out
                    break;
                }

                // If the top of the last rect in the range changes, we moved to a new line
                const lastRect = nextRects[nextRects.length - 1];
                if (lastRect.top !== lineTop) {
                    // revert to previous endOffset
                    range.setEnd(textNode, endOffset);
                    break;
                }
                endOffset++;
            }

            // The chunk [startOffset..endOffset-1] is on the same line
            const chunkText = text.substring(startOffset, endOffset);

            // If this is truly the first character of a new line, or continuing the same line?
            // We'll compare with lastLineTop. If it's the same line top, we just append.
            const currentRects = range.getClientRects();
            const currentTop = currentRects[0]?.top ?? null;

            if (lastLineTop === null) {
                // We haven't established any line yet
                currentLineText = chunkText;
                lastLineTop = currentTop;
            } else if (currentTop !== lastLineTop) {
                // The top changed => that means new line
                lines.push(currentLineText);
                currentLineText = chunkText;
                lastLineTop = currentTop;
            } else {
                // We are in the same line => append text
                currentLineText += chunkText;
            }

            startOffset = endOffset;
        }
    }

    /**
     * Traverses DOM nodes inside the container.
     * - Text nodes are processed with `processTextNode`.
     * - <br> (or other forced-break elements) produce an empty line.
     */
    function walk(node: Node) {
        // If text node, process it
        if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node as Text);
            return;
        }

        // If element node, handle special tags or walk children
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const tagName = element.tagName.toLowerCase();

            // If <br>, we push the current line if there's text, and then add an empty line
            if (tagName === "br") {
                // Push whatever accumulated on the current line
                lines.push(currentLineText);
                currentLineText = "";

                // Also treat <br> as a separate empty line:
                lines.push("");
                // Reset lastLineTop because we definitely forced a break
                lastLineTop = null;
            } else {
                // For block-ish elements that might be empty => can produce an empty line
                // We'll walk their children to pick up text.
                const childNodes = element.childNodes;
                if (!childNodes || childNodes.length === 0) {
                    // If it truly has no children and is block-level, it might be an empty line
                    // (For a robust solution, check element's computed display property, etc.)
                    lines.push("");
                    lastLineTop = null;
                } else {
                    // Recurse
                    for (let i = 0; i < childNodes.length; i++) {
                        walk(childNodes[i]);
                    }
                    // If the element is a block-level and concluded, we might want
                    // to force a break here as well, depending on your exact rules.
                    // E.g. lines.push(currentLineText); currentLineText = '';
                    //      lastLineTop = null;
                }
            }
        }
    }

    // Walk the entire container
    walk(container);

    // If there's leftover text in currentLineText, push it as last line
    if (currentLineText !== "") {
        lines.push(currentLineText);
    }

    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i] + "<br>";
    }

    return lines;
}

console.log(getRenderedLines);
