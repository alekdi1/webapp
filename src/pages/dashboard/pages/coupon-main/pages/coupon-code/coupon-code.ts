import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { DialogUtils, LanguageUtils,StorageUtils } from "@/utils"
import { VuexServices } from "@/services"
// import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { CouponServices } from "@/services"
import * as Models from "@/models"

@Component
export default class CouponCode extends Base {
    @VuexServices.Root.VXStores()
    private stores!: Models.StoreModel.Store[] | null

    @VuexServices.Root.VXBranches()
    private branches!: Models.BranchModel.Branch[] | null

    @VuexServices.Root.VXCoupon()
    private coupon!: Models.Coupon.Coupon | null

    private coupon_code = "";
    private isLoading = false;

    private get text() {
        return {
            label_insert_coupon_code: LanguageUtils.lang("กรุณากรอกหมายเลข Code", ""),
            confirm_btn: LanguageUtils.lang("ยืนยัน", "Confirm"),
            placeholder_coupon_code: LanguageUtils.lang("หมายเลขคูปอง", "Coupon Number"),
        }
    }

    private async mounted() {
        const routParams = this.$route;
        const store = await this.stores?.find(x => x.id == routParams.query.shop_id)
        console.log("store --> ", store)
        console.log("branch --> ", this.branches)
        console.log(this.user)
        if (store == undefined&& this.user.role !== 'QR') {
            this.$router.push({
                name: ROUTER_NAMES.coupon_branch,
            })
        }
    }

    private async submitJoin() {
        this.isLoading = true;
        const routParams = this.$route;
        const store = await this.stores?.find(x => x.id == routParams.query.shop_id)
        console.log("store --> ", store)
        if(this.user.role == 'QR'){
            try {

                const StoreList = await CouponServices.getStoreListByTenantId(StorageUtils.getItem("QR_TENANT_NO"))
                console.log(StoreList)
                const data = {
                    couponCode: this.coupon_code,
                    shopNumber: StoreList?.shop_number || '',
                    branchCode: StoreList?.branch_code || '',
                    floorRoom: StoreList?.floor_room || '',
                    industryCode: StoreList?.industry_code || ''
                }
                const checkValideCoupon = await CouponServices.checkCouponIsValidebyQR(data);
                console.log("checkValideCoupon --> ", checkValideCoupon)

                if (checkValideCoupon.isvalid) {
                    const coupon: Models.Coupon.Coupon = {
                        couponCode: this.coupon_code,
                        shopId: String(StoreList?.shop_number || ""),
                        branchCode: checkValideCoupon.info.shopInfo.branchCode,
                        floorRoom: String(StoreList?.floor_room || ""),
                        isShopVerification: checkValideCoupon.isShopVerification,
                        store: store != undefined ? store : new Models.StoreModel.Store(),
                        couponId: checkValideCoupon.couponId,
                        isvalid: checkValideCoupon.isvalid,
                        shopNumber: StoreList?.shop_number,
                        error_message: "",
                        couponOwner: checkValideCoupon.info.couponOwner,
                        endDate: checkValideCoupon.info.endDate,
                        imgUrl: checkValideCoupon.info.imgUrl,
                        startDate: checkValideCoupon.info.startDate,
                        title: checkValideCoupon.info.title,
                        usageInfo: checkValideCoupon.info.shopInfo.name,
                        displayTextDate: checkValideCoupon.info.displayTextDate,
                        isMinimumExpense: checkValideCoupon.isMinimumExpense,
                        toc: checkValideCoupon.info.toc,
                        branchName: checkValideCoupon.info.shopInfo.branchName,
                        minimumExpense: checkValideCoupon.minimumExpense
                    }

                    await VuexServices.Root.setCoupon(coupon);

                    this.$router.push({
                        name: ROUTER_NAMES.coupon_detail,
                        query: {
                            shop_id: StoreList?.shop_number,
                            floor_room: StoreList?.floor_room,
                            branch_id: StoreList?.branch_code,
                            shop_number: StoreList?.shop_number,
                        },
                        params: {
                            branch_code: routParams.params.branch_code
                        }
                    })
                } else {
                    const couponforcatch = new Models.Coupon.Coupon();
                    couponforcatch.error_message = checkValideCoupon.message
                    await VuexServices.Root.setCoupon(couponforcatch);
                    this.$router.push({
                        name: ROUTER_NAMES.coupon_wrong
                    })
                }
            } catch (e) {
                console.log("error --> ", e)
                DialogUtils.showErrorDialog({ text: e.message || e});
            }
            this.isLoading = false;
        }
        if (store != undefined) {
            const data = {
                couponCode: this.coupon_code,
                shopNumber: store.number,
                branchCode: routParams.params.branch_code,
                floorRoom: routParams.query.floor_room,
                industryCode: store.industryCode
            }
            try {

                const checkValideCoupon = await CouponServices.checkCouponIsValide(data);
                console.log("checkValideCoupon --> ", checkValideCoupon)

                if (checkValideCoupon.isvalid) {
                    const coupon: Models.Coupon.Coupon = {
                        couponCode: this.coupon_code,
                        shopId: String(this.$route.query.shop_id || ""),
                        branchCode: checkValideCoupon.info.shopInfo.branchCode,
                        floorRoom: String(this.$route.query.floor_room || ""),
                        isShopVerification: checkValideCoupon.isShopVerification,
                        store: store != undefined ? store : new Models.StoreModel.Store(),
                        couponId: checkValideCoupon.couponId,
                        isvalid: checkValideCoupon.isvalid,
                        shopNumber: store.number,
                        error_message: "",
                        couponOwner: checkValideCoupon.info.couponOwner,
                        endDate: checkValideCoupon.info.endDate,
                        imgUrl: checkValideCoupon.info.imgUrl,
                        startDate: checkValideCoupon.info.startDate,
                        title: checkValideCoupon.info.title,
                        usageInfo: checkValideCoupon.info.shopInfo.name,
                        displayTextDate: checkValideCoupon.info.displayTextDate,
                        isMinimumExpense: checkValideCoupon.isMinimumExpense,
                        toc: checkValideCoupon.info.toc,
                        branchName: checkValideCoupon.info.shopInfo.branchName,
                        minimumExpense: checkValideCoupon.minimumExpense
                    }

                    await VuexServices.Root.setCoupon(coupon);

                    this.$router.push({
                        name: ROUTER_NAMES.coupon_detail,
                        query: {
                            shop_id: routParams.query.shop_id,
                            floor_room: routParams.query.floor_room,
                            branch_id: routParams.query.branch_id,
                            shop_number: store.number,
                        },
                        params: {
                            branch_code: routParams.params.branch_code
                        }
                    })
                } else {
                    const couponforcatch = new Models.Coupon.Coupon();
                    couponforcatch.error_message = checkValideCoupon.message
                    await VuexServices.Root.setCoupon(couponforcatch);
                    this.$router.push({
                        name: ROUTER_NAMES.coupon_wrong
                    })
                }
            }
            catch (e) {
                console.log("error --> ", e)
                DialogUtils.showErrorDialog({ text: e.message || e});
            }
            this.isLoading = false;
        }
    }
}