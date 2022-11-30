export async function downloadBlobToFile(blob: Blob, filename: string) {
    const URL = window.URL || window.webkitURL
    const downloadUrl = URL.createObjectURL(blob)
    downloadDataUrlFile(downloadUrl, filename)
}

export function downloadDataUrlFile(dataUrl: string, filename: string) {
    const link = document.createElement("a")
    link.setAttribute("href", dataUrl)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(dataUrl)
}

export function downloadFile(file: string, filename: string, extension: string) {
    const linkSource = `data:application/${extension};base64,${file}`;
    const downloadLink = document.createElement("a");
    const fileName = filename + '.' + extension;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
}

export function getFileExtension(file: File) {
    return (file.name.split(".").pop() || "").toLowerCase()
}
