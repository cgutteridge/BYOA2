// helper function to format numbers for display

export default function formatNumber(value: number): string {
    if (Number.isNaN(value) || value === undefined || value === null) {
        return '0'
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
}