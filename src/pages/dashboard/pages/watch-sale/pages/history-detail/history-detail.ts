import { ShopSaleModel } from "@/models"
import { ShopSaleServices, StoreServices, VuexServices } from "@/services"
import { DialogUtils, FileUtils, LanguageUtils } from "@/utils"
import moment from "moment"
import { Component } from "vue-property-decorator"
import Base from "../base"
import SectionTitle from "./section-title.vue"
import numeral from "numeral"
import { ROUTER_NAMES } from "@/router"
import ImageFile from "../../components/slip-file.vue"

@Component({
    components: {
        "shop-sale-section-title": SectionTitle,
        "shop-sale-slip-file": ImageFile
    }
})
export default class WatchSaleHistoryDetailPage extends Base {

    private loading = false
    private shopSaleData: ShopSaleModel.ShopSaleDateItem | null = null
    private downloading = ""

    private get text() {
        return {
            title: LanguageUtils.lang("ส่งยอดขาย", "ส่งยอดขาย"),
            note: LanguageUtils.lang("หมายเหตุ", "Note")
        }
    }

    private get storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private get branchCode() {
        return String(this.$route.params.branch_code || "")
    }

    private mounted() {
        this.getData()
    }

    private async getData() {
        this.loading = true
        try {
            let stores = VuexServices.Root.getStores()
            if (stores.length === 0) {
                stores = await StoreServices.getActiveStoresByBPForShopSale()
                // stores = stores.filter(s => s.floorRoom)
            }

            const store = stores.find(s => (String(s.branch.code) === String(this.branchCode) && String(s.floorRoom) === String(this.storeFloorRoom)))
            if (!store) {
                throw new Error("Shop not found")
            }
            const md = moment(this.$route.params.date, "YYYYMMDD")
            const data = await ShopSaleServices.getHistory(md, md, store)

            if (data.length > 0) {
                this.shopSaleData = data[0]
                console.log(this.shopSaleData)
            } else {
                throw new Error("Data not found")
            }

        } catch (e) {
            console.log(e.message || e)
        }
        this.loading = !true
    }

    private editClick() {
        return this.$router.push({
            name: ROUTER_NAMES.shop_sale_select_branch,
            query: this.$route.query,
            params: {
                ...this.$route.params,
                sale_date: this.$route.params.date
            }
        })
    }

    private async downloadImage(imageId: string) {
        this.downloading = imageId
        try {
            const img = await ShopSaleServices.downloadImage(imageId)
            await FileUtils.downloadFile(img.file.content, imageId, img.file.extension);
        } catch (e) {
            console.log(`Download image error: `, e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || `Download image '${imageId}' error`
            })
        }
        this.downloading = ""
    }

    // -------------- ui display --------------

    private get displayDate() {
        const md = this.shopSaleData?.getMomentDate().locale(this.$i18n.locale)
        if (md) {
            return `${md.format("D MMM")} ${LanguageUtils.lang(md.year() + 543, md.year())}`
        }
        return ""
    }

    private get salesList() {
        return this.shopSaleData?.salesList.filter(s => !s.isNoSale).map(sales => ({
            title: `${sales.channel.channelName} (บาท)`,
            subtitle: "รวม VAT",
            id: sales.id,
            data: (() => {
                const data = sales.data.map(d => ({
                    label: "POS " + d.seq,
                    id: d.id,
                    amount: numeral(d.amount).format("0,0.00"),
                    invoice: numeral(d.invoice).format("0,0")
                }))

                if (sales.creditCard.amount > 0) {
                    data.push({
                        label: "Credit card",
                        id: Math.random().toString(20).replace("0.", ""),
                        amount: numeral(sales.creditCard.amount).format("0,0.00"),
                        invoice: numeral(sales.creditCard.invoice).format("0,0")
                    })
                }

                return data
            })(),
            total: {
                label: "รวมยอดขาย(บาท)",
                amount: numeral(sales.data.reduce((sum, d) => sum + d.amount, 0)).format("0,0.00"),
                invoice: numeral(sales.data.reduce((sum, d) => sum + d.invoice, 0)).format("0,0")
            }
        })) || []
    }

    private get displayTotalPrice() {
        const total = this.shopSaleData?.salesList.filter(s => !s.isNoSale).reduce((sum, saleItem) => saleItem.creditCard.amount + sum + saleItem.data.reduce((sdSum, sd) => sdSum + sd.amount, 0), 0) || 0
        return numeral(total).format("0,0.00")
    }

    private get slips() {
        const imgs: string[] = []
        const imageObjs: {
            name: string
            ext: string
        }[] = []
        for (const sale of (this.shopSaleData?.salesList || [])) {
            for (const img of sale.images) {
                if (!imgs.includes(img)) {
                    imgs.push(img)
                    imageObjs.push({
                        name: img,
                        ext: img.includes(".") ? (img.split(".").pop() || "") : ""
                    })
                }
            }
        }

        return imageObjs
    }

    private get stampUser() {
        interface StampItem {
            name: string
            label: string
            datetime: string
        }

        const displayDate = (date: string) => {
            const md = moment(date, "YYYY-MM-DDTHH:mm:ss").locale(this.$i18n.locale)
            return `${md.format("D MMM")} ${LanguageUtils.lang(md.year() + 543, md.year())} /${md.format("HH:mm")} ${LanguageUtils.lang("น.", "")}`.trim()
        }

        const rows: StampItem[] = []
        const d = this.shopSaleData

        if (d) {
            rows.push({
                datetime: displayDate(d.createdDate),
                label: LanguageUtils.lang("ส่งยอดขายโดย", "Sent by"),
                name: d.createdBy
            })

            if (d.updatedBy && d.updatedDate) {
                rows.push({
                    datetime: displayDate(d.updatedDate),
                    label: LanguageUtils.lang("แก้ไขยอดขายโดย", "Edit by"),
                    name: d.updatedBy
                })
            }

            
            if (d.isVerified) {
                rows.push({
                    datetime: "",
                    label: this.text.note,
                    name: d.verifiedComment
                })
            }
        }


        return rows
    }

    get showEditBtn() {
        if (this.shopSaleData) {
            return !this.shopSaleData.isVerified
        }
        return false
    }
}