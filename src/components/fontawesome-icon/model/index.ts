export type IconTypePrefix = "fas"|"fad"|"far"|"fal"

export interface IconSet {
    [key: string]: Icon
}

export interface Icon {
    name: string,
    viewBox: {
        height: number,
        width: number
    }
    path: {
        fas?: string
        far?: string
        fal?: string
        fad?: {
            primary: string
            secondary: string
        }
    }
}
