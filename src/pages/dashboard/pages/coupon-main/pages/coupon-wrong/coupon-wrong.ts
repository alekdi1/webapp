import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { StoreServices, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import * as Models from "@/models"

@Component
export default class CouponWrong extends Base {
    private couponCode = "";
    private referanceId = "";
    private errorMessage = "";

    @VuexServices.Root.VXCoupon()
    private coupon!: Models.Coupon.Coupon | null

    private async mounted() {
        if (this.coupon != undefined) {
            this.errorMessage = this.coupon.error_message;
            this.referanceId = this.coupon.couponId;
        }
    }

    private get text() {
        return {
            sorry_text: LanguageUtils.lang("SORRY", ""),
            label_detail: LanguageUtils.lang("Test Test Test Test Test Test ", ""),
            referance_id: LanguageUtils.lang("Referance ID :", ""),
            referance_detail_text: "",
            confirm_btn: LanguageUtils.lang("ลองใหม่อีกครั้ง", ""),
        }
    }

    private async submit_tryagain() {
        return this.$router.go(-1)
    }
}