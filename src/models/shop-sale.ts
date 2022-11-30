import { LanguageUtils } from "@/utils"
import moment from "moment"
import { Store } from "./store"

export class SaleChannel {

    /** channel_id */
    channelId = 0

    nameTh = ""
    nameEn = ""

    ref1 = ""
    ref2 = ""
    ref3 = ""

    /** date in format `YYYYMMDD`
     * 
     * eg. `20210101`
     * */
    valid = {
        from: "",
        to: ""
    }
    
    /** channel_name */
    get channelName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}
export class SaleCredit {

    /** channel_id */
    id = 0

    active = ""
    menu = ""

    time = 0
}

export class SaleData {
    id = ""

    /** seq_no */
    seq = 0

    /** sales_invoice */
    invoice = 0

    /** sales_amount */
    amount = 0
}

export class ShopSaleItem {
    id = ""

    channel = new SaleChannel()

    /** no_sales_flag */
    noSaleFlag = ""

    creditCard = {
        /** credit_card_amount */
        amount: 0,
        invoice: 0
    }

    /** image_list */
    images: string[] = []

    /** sales_data */
    data: SaleData[] = []

    get isNoSale() {
        return this.noSaleFlag === "Y"
    }
}

export class ShopSaleDateItem {
    id = ""

    /** sales_date informat `YYYYMMDD` */
    date = ""

    store = new Store()

    /** branch_code */
    branchCode = ""

    /** floor_room */
    storeUnit = ""

    /** sales_list */
    salesList: ShopSaleItem[] = []

    /** verified_flag */
    verifiedFlag = ""

    /** verified_comment */
    verifiedComment = ""

    /** created_by */
    createdBy = ""

    /** created_date: format `2021-04-30T13:03:27`*/
    createdDate = ""

    /** updated_by */
    updatedBy = ""

    /** updated_date: format `2021-05-18T20:18:32` */
    updatedDate = ""

    ref1 = ""
    ref2 = ""
    ref3 = ""

    get isVerified() {
        return this.verifiedFlag === "Y"
    }

    getMomentDate() {
        return moment(this.date, "YYYYMMDD")
    }
}