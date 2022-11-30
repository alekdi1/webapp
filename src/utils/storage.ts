import CryptoJS from "crypto-js"
import { App } from "@/config"
const SIGNATURE = App.local_storage_key
interface Bundle {
    data: any
    timestamp?: number
}

function encryptKey(key: string) {
    try {
        const sha1 = CryptoJS.SHA1(key).toString()
        const md5 = CryptoJS.MD5(sha1).toString()
        const sha256 = CryptoJS.SHA256(md5).toString()
        return sha256.substr(0, 16).toUpperCase()
    } catch (e) {
        return key
    }
}

function encryptData(data: any) {
    const bundle: Bundle = {
        data,
        timestamp: new Date().getTime()
    }
    const jsonString    = JSON.stringify(bundle)
    const encryptedData = CryptoJS.AES.encrypt(jsonString, SIGNATURE)

    return encryptedData.toString()
}

function decryptData(encryptedData: string|null) {
    try {

        if (encryptedData == null) {
            throw new Error("Encrypted data is 'null'")
        }

        const bytes = CryptoJS.AES.decrypt(encryptedData, SIGNATURE)
        const jsonString = bytes.toString(CryptoJS.enc.Utf8)
        const bundle: Bundle = JSON.parse(jsonString)
        return bundle.data

    } catch (e) {
        return null
    }
}

type Storage = "LOCAL" | "SESSION"

class AppStorage {

    public setItem(key: string, data: any, storage: Storage = "SESSION") {
        const encryptedKey = encryptKey(key)
        const encryptedData = encryptData(data)
        if (storage === "LOCAL") {
            localStorage.setItem(encryptedKey, encryptedData)
        } else {
            sessionStorage.setItem(encryptedKey, encryptedData)
        }
    }

    public getItem(key: string, storage: Storage = "SESSION") {
        const encryptedKey = encryptKey(key)
        const storedData = storage === "LOCAL" ? localStorage.getItem(encryptedKey) : sessionStorage.getItem(encryptedKey)
        return decryptData(storedData)
    }

    public removeItem(key: string, storage: Storage = "SESSION") {
        const encryptedKey = encryptKey(key)
        if (storage === "LOCAL") {
            localStorage.removeItem(encryptedKey)
        } else {
            sessionStorage.removeItem(encryptedKey)
        }
    }

    public clear(storage?: Storage) {
        if (storage === "LOCAL") {
            localStorage.clear()
        } else if (storage === "SESSION") {
            sessionStorage.clear()
        } else {
            sessionStorage.clear()
            localStorage.clear()
        }
    }
}

const appStorage = new AppStorage()

export default appStorage
