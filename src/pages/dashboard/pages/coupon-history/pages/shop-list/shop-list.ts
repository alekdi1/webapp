import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { StoreModel } from "@/models"
import { StoreServices } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"


const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component
export default class CouponHistoryShopListPage extends Base {
    private isLoading = false
    private search = ""
    private stores: StoreModel.Store[] = []
    private sortDialog = new SortDialog()

    private async mounted() {
        if(this.user.role !== 'QR'){
            await this.getShopList()
        }
    }

    private get hasNoStore() {
        return this.stores.length === 0
    }

    private async getShopList() {
        try {
            this.isLoading = true
            this.stores = await StoreServices.getActiveStoresByBPForCouponHistory()
            this.sortStore()
            this.isLoading = false
        } catch (e) {
            console.error(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        console.log("stores --> ", this.stores)
    }

    private async goToCouponListByShop(store: StoreModel.Store) {
        this.$router.push({
            name: ROUTER_NAMES.coupon_history_coupon_list_by_shop,
            query: {
                shop_number: store.number,
                industrycode: store.industryCode,
                branch_code: store.branch.code,
                floor_room: store.floorRoom,
            }
        })
    }


    private storeChar(storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private get text() {
        return {
            title: this.$t("pages.coupon_history.coupon_history_title").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            data_not_found: this.$t("pages.maintainance_shop_list.data_not_found").toString(),
            sort_by: this.$t("sort_by").toString(),
            room: this.$t("room").toString(),
        }
    }

    private get displayStoreList() {
        const srh = this.search.replaceAll(" ","").toLowerCase()
        return this.search ? this.stores.filter(s => (
            s.nameEn.toLowerCase().includes(srh) ||
            s.nameTh.includes(srh) ||
            s.branch.nameEn.toLowerCase().includes(srh) ||
            s.branch.nameTh.includes(srh) ||
            s.floorRoom.replaceAll("_","").toLowerCase().includes(srh)
        )) : this.stores
    }

    private showSortDialog() {
        this.sortDialog.show = true
    }

    private sortItemClick(val: string) {
        if (val !== this.sortDialog.sortBy) {
            this.sortDialog.sortBy = val
            this.sortDialog.show = false

            this.sortStore(this.sortDialog.sortBy)
        }
    }

    private sortStore(type = SORT_TYPES.store_name_asc) {
        const stores = this.stores
        switch (type) {
            case SORT_TYPES.store_name_asc:
                this.stores = [...stores].sort((v1, v2) => v1.displayName.toLowerCase().localeCompare(v2.displayName.toLowerCase()) || v1.branch.nameTh.localeCompare(v2.branch.nameTh) || this.floorRoom(v1.floorRoom).localeCompare(this.floorRoom(v2.floorRoom)))
                break
            case SORT_TYPES.store_name_desc:
                this.stores = [...stores].sort((v1, v2) => v2.displayName.localeCompare(v1.displayName) || v2.branch.nameTh.localeCompare(v1.branch.nameTh) || this.floorRoom(v2.floorRoom).localeCompare(this.floorRoom(v1.floorRoom)))
                break
        }
    }

    private floorRoom(floorRoom: string) {
        let isMultipleRoom = false
        let room = floorRoom
        if (room.includes(";")) {
            room = room.split(";")[0]
            isMultipleRoom = true
        }
        if (room.includes(",")) {
            room = room.split(",")[0]
            isMultipleRoom = true
        }
        if (room.includes("_")) {
            room = room.split("_")[1]
        }
        return isMultipleRoom ? `${room}*` : room
    }

    private get isEmptyStoreList() {
        return this.stores.length === 0
    }

}

class SortDialog {
    show = false
    sortBy = ""

    get sortList() {
        return [
            {
                label: LanguageUtils.lang("เรียงตาม A-Z", "Sort from A-Z"),
                value: SORT_TYPES.store_name_asc
            },
            {
                label: LanguageUtils.lang("เรียงตาม Z-A", "Sort from Z-A"),
                value: SORT_TYPES.store_name_desc
            }
        ]
    }
}
