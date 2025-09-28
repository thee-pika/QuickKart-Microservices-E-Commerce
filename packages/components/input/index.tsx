import React, { forwardRef } from "react";

interface BaseProps {
    label?: string;
    type?: "text" | "number" | "password" | "email" | "textarea";
    className?: string;
    error?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextAreaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextAreaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className = "", error, ...props }, ref) => {
        const baseStyles =
            "w-full rounded-lg border border-gray-300 bg-gray-100 text-black px-3 py-2 text-sm  placeholder-gray-400 shadow-sm focus:ring-2 transition-all duration-200";

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label className="text-sm font-medium text-gray-200">
                        {label}
                    </label>
                )}

                {type === "textarea" ? (
                    <textarea
                        ref={ref as React.Ref<HTMLTextAreaElement>}
                        className={`${baseStyles} min-h-[100px] resize-none ${className}`}
                        {...(props as TextAreaProps)}
                    />
                ) : (
                    <input
                        type={type}
                        ref={ref as React.Ref<HTMLInputElement>}
                        className={`${baseStyles} ${className} `}
                        {...(props as InputProps)}
                    />
                )}

                {error && <span className="text-xs text-red-500">{error}</span>}

            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
