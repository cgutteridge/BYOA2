// helper function to format numbers for display

export default function formatNumber(value: number, showPlus: boolean = false): string {
    const plus = showPlus && value >= 0 ? "+" : ""
    // console.log( {showPlus,value} )
    if (Number.isNaN(value) || value === undefined || value === null) {
        return `${plus}0`
    }
    const v= value % 1 === 0 ? value.toString() : value.toFixed(1);
    return `${plus}${v}`;
}