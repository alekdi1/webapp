import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { StoreServices, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"

@Component
export default class CouponConfirm extends Base {

    private form: ConfirmCoupon = new ConfirmCoupon();  

    private get text() {
        return {
            label_coupon_text: LanguageUtils.lang("คูปอง", "Coupon"),
            confirm_user_thecoupon: LanguageUtils.lang("ยืนยันการใช้สิทธิ์", "Confirm"),
            coupon_can_use: LanguageUtils.lang("คูปองนี้สามารถใช้สิทธิ์ได้", "This coupon can be used."),
            placeholder_coupon_code: LanguageUtils.lang("รหัสคูปอง", "Coupon Code."),
            placeholder_receipt: LanguageUtils.lang("เลขที่ใบเสร็จ", "Receipt No."),
            placeholder_totalamount: LanguageUtils.lang("ยอดค่าใช้จ่าย", ""),
            labelcoupon: LanguageUtils.lang("ระบุรหัสคูปองที่ใช้", ""),
            labelreceipt: LanguageUtils.lang("ระบุเลขที่ใบเสร็จรับเงิน", ""),
            labeltotalamount: LanguageUtils.lang("ยอดที่ลูกค้าใช้จ่าย (บาท)", ""),
        }
    }

    private async submitConfirmAoupon() {
        console.log("submitConfirmAoupon")
    }
}

class ConfirmCoupon {
    coupon_code = ""
    receipt_no = ""
    total_amount = 0
}