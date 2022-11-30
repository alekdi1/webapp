import { Component } from "vue-property-decorator"
import Base from "../base"
import { DialogUtils, LanguageUtils } from "@/utils"
import { StoreServices, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import axios from "axios"

const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component
export default class WatchSaleSelectBranchPage extends Base {
    private isLoading = false
    private search = ""
    private stores: StoreModel.Store[] = []
    private Contracts: StoreModel.Contract[] = []
    private sortDialog = new SortDialog()
    private isdisplay = false;
    private _isLoading = true

    private async mounted() {
        await this.getStores()
    }

    private get text() {
        return {
            select_branch: this.$t("select_branch").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            room: this.$t("room").toString(),
            data_not_found: this.$t("data_not_found").toString(),
            play_house_desc: this.$t("pages.watch_sales_select_branch.title").toString(),
            play_house_detail_desc: this.$t("pages.watch_sales_select_branch.detail_desc").toString(),
            sales_report: this.$t("sales_report").toString()
        }
    }

    private async getStores() {
        this.isLoading = true
        try {
            this.Contracts = await StoreServices.checkPermissionOrdering();
            this.Contracts = this.Contracts.filter(s => s.floor_room)
            if (this.Contracts.length > 0) {
                this.isdisplay = true
            }

            // console.log(this.Contracts);
            // console.log(rscheckpermission);
            // this.stores = await StoreServices.getActiveStoresByBPForShopSale()
            // this.stores = this.stores.filter(s => s.floorRoom)
            // this.sortStore()
            // await VuexServices.Root.setStores(this.stores)
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

    private sortItemContractClick(val: string) {
        if (val !== this.sortDialog.sortBy) {
            this.sortDialog.sortBy = val
            this.sortDialog.show = false

            this.sortContract(this.sortDialog.sortBy)
        }
    }


    private sortStore(type = SORT_TYPES.store_name_asc) {
        const stores = this.stores
        switch (type) {
            case SORT_TYPES.store_name_asc:
                this.stores = [...stores].sort((v1, v2) => v1.displayName.localeCompare(v2.displayName))
                break
            case SORT_TYPES.store_name_desc:
                this.stores = [...stores].sort((v1, v2) => v2.displayName.localeCompare(v1.displayName))
                break
        }
    }

    private sortContract(type = SORT_TYPES.store_name_asc) {
        const Contracts = this.Contracts
        switch (type) {
            case SORT_TYPES.store_name_asc:
                this.Contracts = [...Contracts].sort((v1, v2) => v1.contract_name.localeCompare(v2.contract_name))
                break
            case SORT_TYPES.store_name_desc:
                this.Contracts = [...Contracts].sort((v1, v2) => v2.contract_name.localeCompare(v1.contract_name))
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

    private get displayContractsList() {
        const srh = this.search.toLowerCase()
        if (this.search) {
            return this.Contracts.filter(s => s.branch_name.toLowerCase().includes(srh) || s.contract_name.toLowerCase().includes(srh))
        }
        return this.Contracts
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
            name: ROUTER_NAMES.watch_sale_main_select_option,
            query: {
                shop_name: store.displayName,
                shop_unit: store.floorRoom,
                branch_id: store.branch.id,
                branch_name: store.branch.displayName,
            },
            params: {
                branch_code: store.branch.code
            }
        })
    }

    private goToMainPage_Contract(contract: StoreModel.Contract) {
        this.$router.push({
            name: ROUTER_NAMES.watch_sale_main_select_option,
            query: {
                shop_name: contract.displayName,
                shop_unit: contract.floor_room,
                branch_id: contract.branch_code,
                branch_name: contract.branch_name,
                contract_number: contract.contract_number,
            },
            params: {
                branch_code: contract.branch_code
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