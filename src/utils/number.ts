import numeral from "numeral"

export function getPriceFormat (n: number) {
    return numeral(n).format("0,0.00")
}

export function getNumberFormat (n: number) {
    return numeral(n).format("0,0")
}
