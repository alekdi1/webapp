export class FormValue {
    public id = Math.random().toString(36).replace("0.", "")
    public value = ""
}

export class FormPassword extends FormValue {
    show = false
}

export class ImageFormValue {
    public id = Math.random().toString(36).replace("0.", "")
    public value = ""
    file?: File|null
    fileDataUrl = ""

    public onFileInput(e: Event) {
        // @ts-ignore
        const input: HTMLInputElement = e.target
        if (input && input.files && input.files.length > 0) {
            const file = input.files.item(0)
            this.file = file
            this.fileDataUrl = URL.createObjectURL(file)
        }
    }
}
