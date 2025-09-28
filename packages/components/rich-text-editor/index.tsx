"use client";

import dynamic from "next/dynamic";
import { forwardRef, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        return forwardRef((props: any, ref) => <RQ ref={ref} {...props} />);
    },
    { ssr: false }
);

const RichTextEditor = ({ value, onChange }: {
    value: string;
    onChange: (content: string) => void;
}) => {

    const quillRef = useRef<any>(null);

    return (
        <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={(content: any) => onChange(content)}
            className="bg-white text-black rounded-lg"
        />
    );
};

export default RichTextEditor;
