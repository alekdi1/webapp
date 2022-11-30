declare global {
    interface Window { __env: any; }
}

export default function getEnv(name: string) {
    return window?.__env?.[name] || process.env[name]
}