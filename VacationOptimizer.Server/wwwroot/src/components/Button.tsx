import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: Variant;
    fullWidth?: boolean;
}

function getVariantClassName(variant: Variant) {
    switch (variant) {
        case "danger":
            return "action-btn action-btn-danger";
        case "secondary":
            return "action-btn action-btn-secondary";
        case "primary":
        default:
            return "action-btn action-btn-primary";
    }
}

export default function Button({
    children,
    className = "",
    variant = "primary",
    fullWidth = false,
    ...props
}: Props) {
    const widthClassName = fullWidth ? "w-full" : "";
    const composedClassName = [getVariantClassName(variant), widthClassName, className]
        .filter(Boolean)
        .join(" ");

    return (
        <button {...props} className={composedClassName}>
            {children}
        </button>
    );
}
