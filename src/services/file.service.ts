import { Endpoints } from "@/config"
import { FileUtils } from "@/utils"
import ApiClient from "@/modules/api"
// import axios from "axios"

const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    // @ts-ignore
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
})

export async function uploadFile(file: File) {
    const { method, url } = Endpoints.uploadImage
    const rs = {
        name: "",
        url: ""
    }

    const base64 = await fileToBase64(file)

    const data = {
        file_extension: FileUtils.getFileExtension(file),
        base64_file: base64
    }

    const result = await ApiClient.request({ url, method, data })

    if (result.status === "Success") {
        rs.name = result.data.file_name
        rs.url = result.data.full_path
    }

    return rs
}

interface OnProgressEvent extends Event {
    total: number
    loaded: number
}

export async function uploadRegisterImage(file: File, onProgress?: (event: OnProgressEvent) => void) {
    const { method, url } = Endpoints.uploadRegisterImage

    const rs = {
        name: "",
        url: ""
    }

    const base64 = await fileToBase64(file)

    const data = {
        file_extension: FileUtils.getFileExtension(file),
        base64_file: base64
    }

    const result = await ApiClient.request({
        url, method, data,
        config: {
            onUploadProgress: e => {
                if (typeof onProgress === "function") {
                    onProgress(e)
                }
            }
        }
    })

    if (result.status === "Success") {
        rs.name = result.data.file_name
        rs.url = result.data.full_path
    }
    return rs
}

export const getImagefromUrl = (url: string) => {
    const s: any = document.createElement("IMG");
    let result = false;
    s.src = url
    s.onerror = function () {
        result = false;
    }
    s.onload = function () {
        result = true
    }
    return result;
}