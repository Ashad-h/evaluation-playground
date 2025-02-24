import Image from "next/image";
import EliotImage from "./images/eliot.jpeg";
import { useEditor, EditorContent } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import { useEffect } from "react";
import type { JSONContent } from "@tiptap/core";

interface LinkedInPostProps {
    content: string;
    previewWidth: string;
    onChange?: (newContent: string) => void;
    editable?: boolean;
}

export function LinkedInPost({
    content,
    previewWidth,
    onChange,
    editable = false,
}: LinkedInPostProps) {
    function stringToJSON(str: string) {
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

    function JSONToString(json: JSONContent) {
        return (
            json.content
                ?.map((p: JSONContent) => p.content?.[0]?.text || "")
                .join("\n") || ""
        );
    }

    const editor = useEditor({
        extensions: [StarterKit],
        content: {
            type: "doc",
            content: [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: content }],
                },
            ],
        },
        editable: editable,
        onUpdate: ({ editor }) => {
            if (onChange) {
                const newContent = editor.getJSON();
                console.log(newContent);
                console.log(JSONToString(newContent));
                onChange(JSONToString(newContent));
            }
        },
    });

    useEffect(() => {
        editor?.commands.setContent(stringToJSON(content));
    }, [content]);

    return (
        <div
            className={`mx-auto relative flex bg-white dark:bg-[#1b1f23] flex-col shadow-[0_0px_0px_1px_rgba(140,140,140,0.2)] ${previewWidth} transition-all duration-300 rounded-[0.4rem] my-1`}
        >
            <div className="flex flex-row w-full">
                <div className="flex flex-row pr-[12px] pt-[16px] pl-[12px] mb-[8px]">
                    <div className="flex relative">
                        <span className="flex relative justify-center items-center box-border overflow-hidden align-middle z-10 rounded-full w-[48px] h-[48px] min-w-[48px] min-h-[48px] bg-gray-200">
                            <Image
                                src={EliotImage}
                                alt="Eliot"
                                fill
                                className="object-cover"
                            />
                        </span>
                        <div className="ml-2 flex flex-col">
                            <span className="font-semibold text-[14px]">
                                Eliot Hallak
                            </span>
                            <span className="text-black/60 dark:text-white/60 line-clamp-1 leading-[14px] text-[12px]">
                                Maître suprême de l&apos;IA
                            </span>
                            <span className="text-black/60 dark:text-white/60 line-clamp-1 leading-[14px] text-[12px]">
                                Expert des jus
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex mr-[8px] w-full">
                <div
                    className={`text-[14px] font-normal px-[16px] w-full ${
                        editable ? "cursor-text" : ""
                    }`}
                >
                    <EditorContent id="linkedin-post" editor={editor} />
                </div>
            </div>
            <div className="flex flex-row px-[16px] py-[8px] justify-between border-t mt-2">
                <div className="flex flex-row items-center gap-1 text-[12px] text-black/60 dark:text-white/60">
                    <span>0 likes</span>
                    <span>·</span>
                    <span>0 comments</span>
                </div>
            </div>
        </div>
    );
}
