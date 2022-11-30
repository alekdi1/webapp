import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { StoreServices, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"

const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component
export default class CouponฺฺBranch extends Base {
    private isLoading = false
    private search = ""
    private stores: StoreModel.Store[] = []
    private sortDialog = new SortDialog()

    private async mounted() {
        await this.getStores()
    }

    private get text() {
        return {
            select_branch: LanguageUtils.lang("การแลกคูปอง", "Coupon"),
            search_branch: this.$t("search_branch_or_store").toString(),
            room: this.$t("room").toString(),
            data_not_found: this.$t("data_not_found").toString()
        }
    }

    private async getStores() {
        this.isLoading = true
        try {
            this.stores = await StoreServices.getActiveStoresByBPForCoupon()
            
           
           
            // this.stores = this.stores.filter(s => s.floorRoom)
            this.sortStore()
            await VuexServices.Root.setStores(this.stores)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private get isNotEmptyDisplayStoreList() {
        if (this.search) {
            const storeList = this.displayStoreList
            return storeList.length > 0
        }
        return this.stores.length > 0
    }

    private get isEmptyStoreList() {
        return this.stores.length === 0
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

    private get displayStoreList() {
        const srh = this.search.toLowerCase()
        if (this.search) {
            return this.stores.filter(s => s.displayName.toLowerCase().includes(srh) || s.branch.displayName.toLowerCase().includes(srh))
        }
        return this.stores
    }

    private storeChar(storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
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

    private goToMainPage(store: StoreModel.Store) {
        this.$router.push({
            name: ROUTER_NAMES.coupon_code,
            query: {
                shop_id: store.id ,
                floor_room: store.floorRoom,
                branch_id: store.branch.id,
            },
            params: {
                branch_code: store.branch.code
            }
        })
    }
}

class SortDialog {
    show = false
    sortBy = SORT_TYPES.store_name_asc

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