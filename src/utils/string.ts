export const isUrl = (data: any) => (typeof data === "string" && data.startsWith("http://") || data.startsWith("https://"))
