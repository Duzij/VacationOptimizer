export function capitalizeFirstLetter(value: string, locale?: string): string {
    if (!value) {
        return value;
    }

    return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}
