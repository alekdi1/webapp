import { Component } from "vue-property-decorator"
import Base from "../base"
import { ShopSaleModel, StoreModel } from "@/models"
import { ShopSaleServices, StoreServices, VuexServices } from "@/services"
import { CPMForm } from "@/pages/dashboard/models"
import { DialogUtils, LanguageUtils, TimeUtils, NumberUtils, FileUtils } from "@/utils"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"
import ImageFile from "../../components/slip-file.vue"

const displayUserStampDate = (date: string) => {
    const md = moment(date, "YYYY-MM-DDTHH:mm:ss").locale(LanguageUtils.getCurrentLang())
    return `${md.format("D MMM")} ${LanguageUtils.lang(md.year() + 543, md.year())} /${md.format("HH:mm")} ${LanguageUtils.lang("น.", "")}`.trim()
}

const WORD_EXTENSIONS = [
    "docx",
    "doc"
]

const EXCEL_EXTENSIONS = [
    "xls",
    "xlsx"
]

const PDF_EXTENSIONS = [
    "pdf"
]

const IMAGE_EXTENSIONS = [
    "jpg",
    "jpeg",
    "tiff",
    "png"
]

const DOCUMENT_EXTENSIONS = [
    ...WORD_EXTENSIONS,
    ...EXCEL_EXTENSIONS,
    ...PDF_EXTENSIONS
]

interface TempDocument {
    id: string
    blob: Blob
}

@Component({
    components: {
        "shop-sale-slip-file": ImageFile
    }
})
export default class ShopSaleSalesFormPage extends Base {
    private salesChannelList: ShopSaleModel.SaleChannel[] = []
    private salesCredit: ShopSaleModel.SaleCredit[] = []
    private form = new SalesForm()
    private salesCredit_status = false
    private loading = false
    private store: StoreModel.Store | null = null
    private shopSaleData: ShopSaleModel.ShopSaleDateItem | null = null
    private verifiedFlag = ""
    private isInited = false
    private loadingFile = ""
    private saleDataList: ShopSaleModel.ShopSaleDateItem[] = []

    private tempDocs: TempDocument[] = []

    private get text() {
        return {
            title: this.$t("pages.shop_sales_sales_form.title").toString(),
            section_date_title: this.$t("pages.shop_sales_sales_form.section_date_title").toString(),
            section_date_subtitle: this.$t("pages.shop_sales_sales_form.section_date_subtitle").toString(),
            section_date_subtitle_extra: this.$t("pages.shop_sales_sales_form.section_date_subtitle_extra").toString(),
            section_offline_title: this.$t("pages.shop_sales_sales_form.section_offline_title").toString(),
            section_online_title: this.$t("pages.shop_sales_sales_form.section_online_title").toString(),
            section_delivery_title: this.$t("pages.shop_sales_sales_form.section_delivery_title").toString(),
            section_sales_amount_title: this.$t("pages.shop_sales_sales_form.section_sales_amount_title").toString(),
            section_sales_amount_subtitle: this.$t("pages.shop_sales_sales_form.section_sales_amount_subtitle").toString(),
            section_upload_title: this.$t("pages.shop_sales_sales_form.section_upload_title").toString(),
            section_upload_subtitle: this.$t("pages.shop_sales_sales_form.section_upload_subtitle").toString(),
            section_created_updated_title: this.$t("pages.shop_sales_sales_form.section_created_updated_title").toString(),
            sales_amount_title: this.$t("pages.shop_sales_sales_form.sales_amount_title").toString(),
            sales_invoice_title: this.$t("pages.shop_sales_sales_form.sales_invoice_title").toString(),
            sales_credit_title: this.$t("pages.shop_sales_sales_form.sales_credit_title").toString(),
            total_sales_amount_title: this.$t("pages.shop_sales_sales_form.total_sales_amount_title").toString(),
            include_vat: this.$t("pages.shop_sales_sales_form.include_vat").toString(),
            pos: this.$t("pages.shop_sales_sales_form.pos").toString(),
            add: this.$t("pages.shop_sales_sales_form.add").toString(),
            no_sales: this.$t("pages.shop_sales_sales_form.no_sales").toString(),
            upload_file: this.$t("pages.shop_sales_sales_form.upload_file").toString(),
            uploaded_file: this.$t("pages.shop_sales_sales_form.uploaded_file").toString(),
            upload_file_alert: this.$t("pages.shop_sales_sales_form.upload_file_alert").toString(),
            created_by: this.$t("pages.shop_sales_sales_form.created_by").toString(),
            updated_by: this.$t("pages.shop_sales_sales_form.updated_by").toString(),
            save: this.$t("pages.shop_sales_sales_form.save").toString(),
            already_verified: this.$t("pages.shop_sales_sales_form.already_verified").toString(),
            ok: this.$t("ok").toString(),
            note: LanguageUtils.lang("หมายเหตุ", "Note")
        }
    }

    private get lang() {
        return this.$i18n.locale
    }

    private datePickerEvents(date: string) {
        const md = moment(date, "YYYY-MM-DD")

        if (this.saleDataList.some(d => d.date === md.format("YYYYMMDD"))) {
            return ["#ffffff00"]
        }

        return false
    }

    private get storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private get branchCode() {
        return String(this.$route.params.branch_code || "")
    }

    private get saleDate() {
        return this.$route.params.sale_date || ""
    }

    private async getData() {
        this.loading = true
        
        const selectedDate = this.form.date
        this.form = await new SalesForm()
        this.form.date = selectedDate
        this.form.selectedDate = selectedDate
        const { branchCode } = this
        this.form.userFullName = this.actionUser
        this.form.branchCode = branchCode
        try {
            this.shopSaleData = null
            let stores = VuexServices.Root.getStores()
            if (stores.length === 0) {
                stores = await StoreServices.getActiveStoresByBPForShopSale()
                // stores = stores.filter(s => s.floorRoom)
            }

            const store = stores.find(s => (String(s.branch.code) === String(this.branchCode) && String(s.floorRoom) === String(this.storeFloorRoom)))
            if (!store) {
                throw new Error("Shop not found")
            }

            this.store = store

            let md = moment(this.form.date, this.form.dateFormat)


            if (this.saleDate && !this.isInited) {
                const saleDate = moment(this.saleDate, "YYYYMMDD")

                if (saleDate.isValid()) {
                    md = saleDate
                }
            }

            this.isInited = true


            const endDate = moment()
            let startDate = moment().startOf("month")
            if (moment().date() <= 2) {
                startDate = moment().subtract(1, "month").startOf("month")
            }
            console.log("start-getHistory")
            const saleDataList = await ShopSaleServices.getHistory(startDate, endDate, store)
            this.saleDataList = saleDataList

            this.shopSaleData = saleDataList.find(d => d.date === md.format("YYYYMMDD")) || null

            if (this.shopSaleData) {
                if (!this.isUpdate) {
                    this.$router.replace({
                        name: ROUTER_NAMES.shop_sale_sales_form_edit,
                        query: this.$route.query,
                        params: {
                            ...this.$route.params,
                            sale_date: md.format("YYYYMMDD")
                        }
                    })
                }
            } else {
                if (!this.isCreate) {
                    this.$router.replace({
                        name: ROUTER_NAMES.shop_sale_sales_form,
                        query: this.$route.query,
                        // params: {
                        //     ...this.$route.params,
                        //     sale_date: md.format("YYYYMMDD")
                        // }
                    })
                }
            }

            const selectedDate = md.format(this.form.dateFormat)
            this.form.date = selectedDate
            this.form.saveDate = md.format(this.form.saveDateFormat)

            this.form.selectedDate = selectedDate
            // @ts-ignore
            this.$refs["date-picker-dialog"].save(selectedDate)
            console.log("start-getSalesChannelData")
            this.getSalesChannelData()
            // }
            console.log(this.form)

        } catch (e) {
            console.log("error ", e)
            this.loading = !true
            // console.log(e.message || e)
        }

        this.loading = !true
    }

    private async mounted() {
        await this.getData()
    }

    private async getSalesChannelData() {
        this.form.loading = true
        try {
            this.salesChannelList = await ShopSaleServices.getSalesChannel()
            this.salesCredit = await ShopSaleServices.getSalesCredit()
            this.salesCredit_status = this.salesCredit.find(e=>e.menu == 'sales_credit')?.active=='Y'?true:false
            this.setupForm()
        } catch (e) {
            console.log("catch-getSalesChannelData ", e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || "Error while get shop sale channel"
            })
        }
        this.form.loading = false
    }

    private get actionUser() {
        const { user } = this
        return user.fullName || user.bpName || user.bpNumber || user.id
    }

    private async setupForm() {
        const { shopSaleData, isCreate } = this
        if (isCreate) {
            this.salesChannelList.forEach(salesChannel => {
                const isValid = moment().isBetween(salesChannel.valid.from, salesChannel.valid.to, "day", "[]")
                if (isValid) {
                    const salesChannelForm = new SalesChannelForm()
                    salesChannelForm.channel = salesChannel
                    salesChannelForm.salesPOSList.push(new SalesPOSForm())
                    this.form.salesChannelList.push(salesChannelForm)
                }
            })
        }

        if (shopSaleData) {
            const md = shopSaleData.getMomentDate()
            this.form.date = md.format(this.form.dateFormat)
            this.form.selectedDate = md.format(this.form.dateFormat)
            this.form.saveDate = md.format(this.form.saveDateFormat)
            this.form.salesChannelList = []
            this.form.uploadedImages = []
            this.verifiedFlag = shopSaleData.verifiedFlag
            for (const s of shopSaleData.salesList) {
                const salesChannelForm = new SalesChannelForm()
                salesChannelForm.channel = s.channel
                salesChannelForm.creditCardAmount = String(s.creditCard.amount > 0 ? s.creditCard.amount : "")
                salesChannelForm.creditCardInvoice = String(s.creditCard.invoice > 0 ? s.creditCard.invoice : "")
                salesChannelForm.salesPOSList = s.data.map(sd => {
                    const f = new SalesPOSForm()
                    f.salesAmount = String(sd.amount || "")
                    f.salesInvoice = String(sd.invoice || "")
                    return f
                })
                salesChannelForm.noSalesFlag = s.isNoSale
                this.form.salesChannelList.push(salesChannelForm)

                for (const img of s.images) {
                    if (!this.form.uploadedImages.includes(img)) {
                        this.form.uploadedImages.push(img)
                    }
                }
            }
        }
    }

    private get isUpdate() {
        return this.$route.name === ROUTER_NAMES.shop_sale_sales_form_edit
    }

    private get isCreate() {
        return this.$route.name === ROUTER_NAMES.shop_sale_sales_form
    }

    private get isDisabled() {
        if (this.isCreate) {
            return false
        }
        return this.isVerified
    }

    private get isVerified() {
        return this.shopSaleData?.isVerified === true
    }

    private get formDisabled() {
        return this.form.loading || this.loading || this.isDisabled
    }

    private get datePickerDisabled() {
        return this.form.loading || this.form.loading
    }

    private async confirmSelectDate() {

        // @ts-ignore
        this.$refs["date-picker-dialog"].save(this.form.date)
        this.form.datePickerShow = false

        this.form.selectedDate = this.form.date

        this.form.saveDate = this.form.date
        await this.getData()
    }

    private cancelSelectDate() {
        // @ts-ignore
        this.$refs["date-picker-dialog"].save(this.form.selectedDate)
        this.form.datePickerShow = false
    }

    private get createdBy() {
        // Check is create use this.user.fullName
        // Check is update use this.sales.createdBy
        if (this.isUpdate) {
            return this.shopSaleData?.createdBy || ""
        } else {
            return this.user.fullName
        }
    }

    private get createdDate() {
        // Check is create use moment
        // Check is update use this.sales.createdDate
        if (this.isUpdate) {
            if (this.shopSaleData && this.shopSaleData.createdDate) {
                return displayUserStampDate(this.shopSaleData.createdDate)
            }
            return ""
        } else {
            const date = moment(moment(), "YYYY-MM-DDTHH:mm")
            return TimeUtils.convertToLocalDateFormat(moment(date)) + " /" + TimeUtils.convertToLocalTimeFormat(moment(date))
        }
    }

    private get updatedBy() {
        // Check is create use ""
        // Check is update use this.sales.updatedBy
        if (this.isUpdate) {
            return this.shopSaleData?.updatedBy || ""
        } else {
            return ""
        }
    }

    private get updatedDate() {
        // Check is create use ""
        // Check is update use this.sales.updatedDate
        if (this.isUpdate) {
            if (this.shopSaleData && this.shopSaleData.updatedDate) {
                return displayUserStampDate(this.shopSaleData.updatedDate)
            }
            return ""
        } else {
            return ""
        }
    }

    private async submitSalesForm() {
        this.form.validated = true

        if (this.form.allValidated) {
            this.form.loading = true
            try {
                const { store } = this
                if (!store) {
                    throw new Error("Shop not found")
                }

                const { saveDate, salesChannelList, uploadFiles } = this.form
                const images: string[] = uploadFiles.filter(u => u.imageId !== "").map(u => u.imageId)

                const salesList = salesChannelList.map(salesChannel => {
                    const channel = new ShopSaleModel.ShopSaleItem()
                    channel.images = [...images, ...this.form.uploadedImages]
                    channel.channel = salesChannel.channel
                    channel.noSaleFlag = salesChannel.noSalesFlag ? "Y" : "N"
                    channel.creditCard.amount = Number(salesChannel.creditCardAmount || 0)
                    channel.creditCard.invoice = Number(salesChannel.creditCardInvoice || 0)
                    if (!salesChannel.noSalesFlag) {
                        channel.data = salesChannel.salesPOSList.map((salesPOS, idx) => {
                            const data = new ShopSaleModel.SaleData()
                            data.seq = idx + 1
                            data.amount = parseFloat(salesPOS.salesAmount)
                            data.invoice = salesPOS.salesInvoice ? parseInt(salesPOS.salesInvoice) : 0
                            return data
                        })
                    }
                    return channel
                })

                if (this.isCreate) {

                        const result = await DialogUtils.showSuccessWithActionDialog({
                            text: `วันที่ ${this.form.displayDate}<br>ยอดขายรวมdd ${this.form.displaySalesAmountAllChannel} บาท`
                        })
                        if (result.isConfirmed ) {
                            const rs = await ShopSaleServices.createSales(
                                this.branchCode,
                                store.displayName,
                                store.floorRoom,
                                saveDate,
                                salesList,
                                this.actionUser
                            )
                            if (rs.api_type === "SALES_CREATE") {
                                return this.$router.push({
                                    name: ROUTER_NAMES.shop_sale_create_success,
                                    params: this.$route.params
                                })
                            }
                            DialogUtils.showErrorDialog({
                                text: LanguageUtils.lang(`การส่งข้อมูลล้มเหลว: ${rs.result_msg_th}`, `Error while sending data: ${rs.result_msg_en}`)
                            })
                        }

                } else if (this.isUpdate && this.shopSaleData) {
                    const result = await DialogUtils.showSuccessWithActionDialog({
                        text: `วันที่ ${this.form.displayDate}<br>ยอดขายรวม ${this.form.displaySalesAmountAllChannel} บาท`
                    })

                    if (result.isConfirmed) {
                        const rs = await ShopSaleServices.updateSaleData({
                            branchCode: this.branchCode,
                            date: saveDate,
                            salesList,
                            store,
                            actionBy: this.actionUser,
                            shopSaleData: this.shopSaleData
                        })
                        if (rs.api_type === "SALES_UPDATE") {
                            return this.$router.push({
                                name: ROUTER_NAMES.shop_sale_create_success,
                                params: this.$route.params,
                                query: {
                                    action: "update"
                                }
                            })
                        }
                        DialogUtils.showErrorDialog({
                            text: LanguageUtils.lang(`การส่งข้อมูลล้มเหลว: ${rs.result_msg_th}`, `Error while sending data: ${rs.result_msg_en}`)
                        })
                    }
                }


            } catch (e) {
                console.log(e.message || e)
                DialogUtils.showErrorDialog({
                    text: e.message || LanguageUtils.lang("การส่งข้อมูลล้มเหลว", "Error while sending data")
                })
            }

            this.form.loading = false
        } else {
            if (this.form.getUploadImageError) {
                DialogUtils.showErrorDialog({ text: this.text.upload_file_alert })
            }
        }
    }

    private async viewImageFromId(imageId: string) {
        this.loadingFile = imageId
        try {
            const t = this.tempDocs.find(t => t.id === imageId)
            let blob: Blob

            if (t) {
                blob = t.blob
            } else {
                const responseImg = await ShopSaleServices.downloadImage(imageId)
                blob = this.base64toBlob(responseImg.file.content, responseImg.file.extension);
                this.tempDocs.push({
                    blob,
                    id: imageId
                })
            }

            if (this.isImage(imageId)) {
                const url = URL.createObjectURL(blob)
                this.viewImage(url)
            } else {
                await FileUtils.downloadBlobToFile(blob, imageId)
            }
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({
                text: e.message || "Error while download file"
            })
        }
        this.loadingFile = ""

    }

    private async downloadFile(fileId: string) {
        this.loadingFile = fileId
        try {
            const t = this.tempDocs.find(t => t.id === fileId)
            let blob: Blob

            if (t) {
                blob = t.blob
            } else {
                const responseImg = await ShopSaleServices.downloadImage(fileId)
                blob = this.base64toBlob(responseImg.file.content, responseImg.file.extension);
                this.tempDocs.push({
                    blob,
                    id: fileId
                })
            }
            await FileUtils.downloadBlobToFile(blob, fileId)
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({
                text: e.message || "Error while download file"
            })
        }
        this.loadingFile = ""
    }

    private isImage(fileId: string) {
        const ext = (fileId.includes(".") ? (fileId.split(".").pop() || "") : "").toLowerCase()
        return IMAGE_EXTENSIONS.includes(ext)
    }

    private async viewUploadImage(u: UploadFile) {
        if (u.file) {
            const url = URL.createObjectURL(u.file)
            const { name } = u.file
            const ext = name.includes(".") ? (name.split(".").pop() || "") : ""
            if (IMAGE_EXTENSIONS.includes(ext.toLowerCase())) {
                this.viewImage(url)
            } else {
                console.log(ext)
                // TODO: get data
            }
        }
    }

    private async viewImage(url: string) {
        const imgView = this.$refs.imgView
        // @ts-ignore
        imgView.show(url)
        // @ts-ignore
        imgView.setLoading(false)
    }

    protected get comment() {
        return this.shopSaleData?.verifiedComment
    }

    private base64toBlob(base64Data: string | "", contentType: string | "") {
        contentType = contentType || "";
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }
}

class UploadFile {
    id = Math.random().toString(36).replace("0.", "")
    file?: File | null
    percent = 0.0
    displayPercent = 0
    imageId = ""
    loading = false
    uploadSuccess = false

    get fileExtension() {
        const name = this.file?.name || ""
        return name.includes(".") ? (name.split(".").pop() || "") : ""
    }

    get progressClass() {
        let className = "upload-progress "
        if (this.loading) {
            className += "upload-progress-loading"
        } else {
            if (this.uploadSuccess) {
                className += "upload-progress-success"
            } else {
                className += "upload-progress-failed"
            }
        }
        return className
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            imageId: (v => {
                if (!v) return lang("กรุณาแนบใบปิดสิ้นวัน", "กรุณาแนบใบปิดสิ้นวัน")
                return null
            })(this.imageId)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

class SalesPOSForm {
    id = Math.random().toString(36).replace("0.", "")
    salesAmount = ""
    salesInvoice = ""
    salesAmountError = false

    validate() {
        this.salesAmountError = this.errors.salesAmount !== null
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            salesAmount: (v => {
                if (!v) return lang("กรุณาระบุยอดขายเงินสด", "Please input sales amount")
                return null
            })(this.salesAmount)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

class SalesChannelForm {
    id = Math.random().toString(36).replace("0.", "")
    channel = new ShopSaleModel.SaleChannel()
    noSalesFlag = false
    salesPOSList: SalesPOSForm[] = []
    creditCardAmount = ""
    creditCardInvoice = ""
    creditCardAmountError = false

    get title() {
        return this.channel.channelName
    }

    validate() {
        this.creditCardAmountError = this.errors.creditCardAmount !== null
    }

    noSalesClick() {
        this.noSalesFlag = !this.noSalesFlag
    }

    addSalesPOS() {
        this.salesPOSList.push(new SalesPOSForm())
    }

    removeSalesPOS(salesPOS: SalesPOSForm) {
        if (this.salesPOSList.length > 1) {
            this.salesPOSList = this.salesPOSList.filter(s => s.id !== salesPOS.id)
        }
    }

    get salesAmount() {
        let salesAmount = 0.0
        if (this.noSalesFlag === true) {
            return salesAmount
        }
        this.salesPOSList.forEach((salesPOS) => {
            if (salesPOS.salesAmount) {
                salesAmount += parseFloat(salesPOS.salesAmount)
            }
        })
        return salesAmount
    }

    get displaySalesAmount() {
        return NumberUtils.getPriceFormat(this.salesAmount)
    }

    get salesInvoice() {
        let salesInvoice = 0
        if (this.noSalesFlag === true) {
            return salesInvoice
        }
        this.salesPOSList.forEach((salesPOS) => {
            if (salesPOS.salesInvoice) {
                salesInvoice += parseInt(salesPOS.salesInvoice)
            }
        })
        return salesInvoice
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            salesPOSList: (vList => {
                if (this.noSalesFlag === false) {
                    const vListCheck = Object.values(vList).every(v => v.allValidated === true)
                    if (!vListCheck) return ""
                    return null
                }
                return null
            })(this.salesPOSList),

            creditCardAmount: (v => {
                const salesAmountTotal = this.salesAmount
                if (v && salesAmountTotal > 0.0) {
                    if (parseFloat(v) > salesAmountTotal) {
                        return lang("ยอดขาย Credit card ต้องไม่มากกว่ายอดขายรวม", "Credit card sales amount must not more than total sales amount")
                    }
                    return null
                }
                return null
            })(this.creditCardAmount)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

class SalesForm {
    id = Math.random().toString(36).replace("0.", "")
    loading = false
    validated = false
    dateFormat = "YYYY-MM-DD"
    saveDateFormat = "YYYYMMDD"
    saveDate = moment().format(this.saveDateFormat)
    date = moment().format(this.dateFormat)
    selectedDate = moment().format(this.dateFormat)
    datePickerShow = false
    maxDate = moment().format(this.dateFormat)
    salesChannelList: SalesChannelForm[] = []
    userFullName = ""
    branchCode = ""
    uploadFiles: UploadFile[] = []
    uploadedImages: string[] = []
    uploadedImagesData: { imageId: string, data: string }[] = []
    uploadImageError = false

    validate() {
        this.uploadImageError = this.errors.uploadFiles !== null
    }

    get getUploadImageError() {
        return this.uploadImageError
    }

    get minDate() {
        if (moment().date() > 2) {
            return moment().startOf("month").format(this.dateFormat)
        }
        return moment().subtract(1, "month").startOf("month").format(this.dateFormat)
    }

    removeUploadedImage(img: string) {
        this.uploadedImages = this.uploadedImages.filter(z => z !== img)
    }

    get displayDate() {
        if (!this.saveDate) return ""
        const currentSelectedDate = moment(this.selectedDate, this.dateFormat)
        return TimeUtils.convertToLocalDateFormat(currentSelectedDate)
    }

    get salesAmountAllChannel() {
        // console.log("salesChannelList ", this.salesChannelList)
        return this.salesChannelList.reduce((sum, salesChannel) => sum + salesChannel.salesAmount, 0)
    }

    get displaySalesAmountAllChannel() {
        return NumberUtils.getPriceFormat(this.salesAmountAllChannel)
    }

    get displayUploadedImages() {
        return this.uploadedImages.map(img => ({
            name: img,
            ext: img.includes(".") ? (img.split(".").pop() || "") : ""
        }))
    }

    onFileChange(e: any) {
        const file = new CPMForm.ImageFormValue()
        file.onFileInput(e)
        const uploadFile = new UploadFile()
        uploadFile.file = file.file
        // if (uploadFile.file != null && uploadFile.file.size > 10097152) {
        //     DialogUtils.showErrorDialog({
        //         text: LanguageUtils.lang("ไม่สามารถอัปโหลดไฟล์ที่มีขนาดเกิน 10 MB", "Can't upload files larger than 10 MB.")
        //     })
        //     e.target.files = null;
        //     e.target.value = null;
        //     return;
        // } else {
            this.uploadFiles.push(uploadFile)
            this.uploadFile(uploadFile)
            e.target.files = null;
            e.target.value = null;
        // }
        console.log("uploadFiles ", this.uploadFiles)
    }

    async uploadFile(uploadFile: UploadFile) {

        if (uploadFile.file) {
            try {
                uploadFile.loading = true
                const imageId = await ShopSaleServices.uploadSalesFile(this.userFullName, this.branchCode, uploadFile.file, (file, event) => {
                    // On upload progress
                    uploadFile.percent = (event.loaded / event.total) * 100
                    uploadFile.displayPercent = Math.floor(uploadFile.percent)
                })

                uploadFile.imageId = imageId
                uploadFile.uploadSuccess = true
                uploadFile.loading = false
                // If uploadImage is error need clear error when upload success
                if (this.uploadImageError) this.validate()
            } catch (e) {
                console.log(e.message || e)
                uploadFile.uploadSuccess = false
                uploadFile.loading = false
            }
        }
    }

    removeUploadFile(uploadFile: UploadFile) {
        this.uploadFiles = this.uploadFiles.filter(f => f.id !== uploadFile.id)
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            saveDate: (v => {
                if (!v) return lang("กรุณาระบุวันที่", "Please select date")
                return null
            })(this.saveDate),

            salesChannelList: (vList => {
                const vListCheck = Object.values(vList).every(v => v.allValidated === true)
                if (!vListCheck) return ""
                return null
            })(this.salesChannelList),

            uploadFiles: (vList => {
                if (this.uploadedImages.length > 0) return null
                if (vList.length === 0) return ""
                const vListCheck = Object.values(vList).every(v => v.allValidated === true)
                if (!vListCheck) return ""
                return null
            })(this.uploadFiles)
        }
    }

    get allValidated() {
        this.validate()
        this.salesChannelList.forEach((salesChannel) => {
            salesChannel.validate()
            salesChannel.salesPOSList.forEach((salesPOS) => {
                salesPOS.validate()
            })
        })
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.validated ? false : !this.allValidated
    }

    get uploadFileExtensions() {
        return [
            ...IMAGE_EXTENSIONS,
            ...DOCUMENT_EXTENSIONS
        ].map(e => "." + e)
    }
}
