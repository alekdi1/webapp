
export function isColor(strColor: string) {
    const s = new Option().style
    s.color = strColor
    const isColorName = s.color === strColor
    const isColorCode = /^#[0-9A-F]{6}$/i.test(strColor)
    return (isColorName === true || isColorCode === true)
}
