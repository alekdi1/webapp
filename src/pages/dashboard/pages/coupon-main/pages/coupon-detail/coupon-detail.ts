import { Component } from "vue-property-decorator"
import Base from "../../../../../dashboard/dashboard-base"
import { DialogUtils, LanguageUtils, StringUtils,StorageUtils } from "@/utils"
import { FileService, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { CouponServices } from "@/services"
import * as Models from "@/models"
import numeral from "numeral"


@Component
export default class CouponDetail extends Base {
    @VuexServices.Root.VXCoupon()
    private coupon!: Models.Coupon.Coupon | null

    @VuexServices.Root.VXStores()
    private stores!: StoreModel.Store[] | null

    private t = (k: string) => this.$t("pages.contact." + k).toString()
    private form: ConfirmCoupon = new ConfirmCoupon();
    private isShowDetail = true;
    private isShowConfirm = false;
    private isShowtransaction = false;
    private isConfirmed = false;
    private couponName = ""
    private couponBranchName = ""
    private couponCode = ""
    private loadingsubmitDetail = false;
    private loadingsubmitConfirmAoupon = false;
    private loadingconfirmReceipt = false;
    private loadingmarkUsedCoupon = false;
    private confirmUsedCoupon: any = {}
    private isUsedSuccess = false 

    private async mounted() {
        const routParams = this.$route;
        const couponCode = await this.coupon;
        const selectedStore = await this.stores?.find(x => x.id == routParams.query.shop_id)
        if (couponCode != null && couponCode != undefined) {
            this.couponName = couponCode.usageInfo
            this.couponBranchName = couponCode.branchName
            this.form.coupon_code = couponCode.couponCode
        }
        if ((selectedStore == undefined || couponCode == null) && this.user.role !== 'QR') {
            this.$router.push({
                name: ROUTER_NAMES.coupon_branch,
            })
        }

        // if(this.coupon != null){
        //     this.coupon.toc = "โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...โปรดระบุ Term and condition...";
        // }
        console.log("this.$route --> ", this.$route)
    }

    private get text() {
        return {
            label_coupon_text: LanguageUtils.lang("คูปอง", "Coupon"),
            continue_text: LanguageUtils.lang("ดำเนินการต่อ", "Continue"),
            coupon_can_use: LanguageUtils.lang("คูปองนี้สามารถใช้สิทธิ์ได้", "This coupon can be used."),
            confirm_user_thecoupon: LanguageUtils.lang("ยืนยันการใช้สิทธิ์", "Confirm"),
            placeholder_coupon_code: LanguageUtils.lang("รหัสคูปอง", "Coupon Code."),
            placeholder_receipt: LanguageUtils.lang("เลขที่ใบเสร็จ", "Receipt No."),
            placeholder_totalamount: LanguageUtils.lang("ยอดค่าใช้จ่าย", ""),
            labelcoupon: LanguageUtils.lang("ระบุรหัสคูปองที่ใช้", ""),
            labelreceipt: LanguageUtils.lang("ระบุเลขที่ใบเสร็จรับเงิน", ""),
            labeltotalamount: LanguageUtils.lang("ยอดที่ลูกค้าใช้จ่าย (บาท)", ""),
            isused_coupon_text: LanguageUtils.lang("ใช้สิทธิ์เรียบร้อย", ""),
            btn_confirm_text: LanguageUtils.lang("ยืนยัน", ""),
        }
    }

    private getImage(imageUrl: string) {
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private async submitDetail() {
        console.log("submitDetail")
        this.loadingsubmitDetail = true;
        const StoreList = await CouponServices.getStoreListByTenantId(StorageUtils.getItem("QR_TENANT_NO"))
        console.log("StoreList:==>",StoreList)
        if (this.coupon?.isMinimumExpense == false) {
            const data = {
                skuCodeId: this.coupon?.couponId.toString(),
                spentAmount: this.form.total_amount,
                shopNumber: this.coupon?.store.number || StoreList.shop_number,
                branchCode: this.coupon?.branchCode,
                floorRoom: this.coupon?.floorRoom,
                industryCode: this.coupon?.store.industryCode || StoreList.industry_code,
                targetIdentity: this.user.id.toString() || "99999",
                targetIdentityText: "userId",
                targetIdentityName: this.user.fullName
            }

            try {
                this.confirmUsedCoupon = await CouponServices.markCouponIsUsed(data,this.user.role == 'QR');
                console.log("submitConfirmAoupon --> ", this.confirmUsedCoupon)
                if (this.confirmUsedCoupon != null) {
                    this.isShowConfirm = false;
                    this.isShowDetail = true;
                    this.isShowtransaction = true;
                }
            }
            catch (e) {
                DialogUtils.showErrorDialog({ text: e.message || e });
            }
        } else {
            const couponItem = await this.coupon;
            console.log("couponCode --> ", couponItem)
            if (couponItem?.isShopVerification && couponItem?.isvalid) {
                this.isShowConfirm = true;
                this.isShowDetail = false;
            } else {
                this.$router.push({
                    name: ROUTER_NAMES.coupon_wrong
                })
            }
        }
        this.loadingsubmitDetail = false;
    }

    private async submitConfirmAoupon() {
        this.loadingsubmitConfirmAoupon = true;
        const routParams = this.$route;
        const couponCode = await this.coupon
        const selectedStore = await this.stores?.find(x => x.id == routParams.query.shop_id)
        const StoreList = await CouponServices.getStoreListByTenantId(StorageUtils.getItem("QR_TENANT_NO"))
        
                
        console.log("storeList-->", StoreList.tenantId);
        // console.log(couponCode)
        // console.log(selectedStore)
        try {
            if ((selectedStore != undefined && couponCode != undefined) || ( couponCode != undefined && this.user.role == 'QR')) {
                const data = {
                    skuCodeId: couponCode.couponId.toString(),
                    spentAmount: this.form.total_amount,
                    shopNumber: this.coupon?.shopNumber,
                    branchCode: this.coupon?.branchCode,
                    floorRoom: this.coupon?.floorRoom,
                    industryCode: this.coupon?.store.industryCode|| StoreList?.industry_code,
                    targetIdentity: this.user.id.toString()||StorageUtils.getItem("QR_TENANT_NO"),
                    targetIdentityText: "QR Code",
                    targetIdentityName: "QR Code"
                }

                const minimumExpense = this.coupon == null ? 0 : this.coupon?.minimumExpense
                if (this.form.total_amount < minimumExpense) {
                    DialogUtils.showErrorDialog({ text: LanguageUtils.lang(`ยอดค่าใช้จ่ายห้ามต่ำกว่า ${this.cashFormat(this.coupon?.minimumExpense.toString())} บาท`, `The amount of expenses must not be lower than ${this.cashFormat(this.coupon?.minimumExpense.toString())} baht`) });
                    this.loadingsubmitConfirmAoupon = false;
                    return;
                }

                this.confirmUsedCoupon = await CouponServices.markCouponIsUsed(data,this.user.role == 'QR');
                console.log("submitConfirmAoupon --> ", this.confirmUsedCoupon)
                if (this.confirmUsedCoupon != null) {
                    this.isShowConfirm = false;
                    this.isShowDetail = true;
                    this.isShowtransaction = true;
                } else {
                    DialogUtils.showErrorDialog({ text: this.confirmUsedCoupon.message });
                }
            }
        }
        catch (e) {
            console.log("error --> ", e)
            DialogUtils.showErrorDialog({ text: e.message || e.data.message || e });
        }
        this.loadingsubmitConfirmAoupon = false;
    }

    private get checkIsUsedCoupon() {
        return this.isShowtransaction ? true : false;
    }

    private async confirmReceipt() {
        const data = {
            billNo: this.form.receipt_no,
            skuCodeId: this.coupon?.couponId
        }
        this.loadingconfirmReceipt = true;
        if (this.form.receipt_no != "") {
            const updateCoupon = await CouponServices.updateCouponIsUsed(data,this.user.role == 'QR');
            console.log("updateCoupon --> ", updateCoupon)
            if (updateCoupon != null) {
                this.isConfirmed = true;
                await VuexServices.Root.setCoupon(null);
                this.isUsedSuccess = true
            }
        } else {
            await VuexServices.Root.setCoupon(null);
            this.isUsedSuccess = true
        }

        this.loadingconfirmReceipt = false;
    }

    private cashFormat(n: any) {
        return numeral(n).format("0,0.00")
    }

    private backToMainSelectOptionPage() {
        const routParams = this.$route;
        this.$router.push({
            name: ROUTER_NAMES.coupon_code,
            query: {
                shop_id: routParams.query.shop_id,
                floor_room: routParams.query.floor_room,
                branch_id: routParams.query.branch_id,
            },
            params: {
                branch_code: routParams.params.branch_code
            }
        })
    }
}

class ConfirmCoupon {
    coupon_code = ""
    receipt_no = ""
    total_amount = 0
}