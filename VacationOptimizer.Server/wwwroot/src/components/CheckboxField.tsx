import { Check } from "lucide-react";

interface Props {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}

export default function CheckboxField({ checked, label, onChange }: Props) {
    return (
        <label className="checkbox-field">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <span className={`checkbox-field__control ${checked ? "checkbox-field__control--checked" : ""}`}>
                <Check className="checkbox-field__icon" />
            </span>
            <span className="checkbox-field__label">{label}</span>
        </label>
    );
}
