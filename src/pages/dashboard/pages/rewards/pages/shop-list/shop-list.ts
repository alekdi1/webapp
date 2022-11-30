import { Component } from "vue-property-decorator"
import { DialogUtils, LanguageUtils } from "@/utils"
import { RewardServices, StoreServices, VuexServices } from "@/services"
import { StoreModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import ctjs from "crypto-js"
import Base from "@/pages/dashboard/pages/rewards/reward-base"

const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component
export default class RewardsShopListPage extends Base {
    private search = ""
    private stores: StoreModel.Store[] = []
    private sortDialog = new SortDialog()
    private loading = false
    private isNoStoreConfig = false

    private async mounted() {
        await this.getStores()
    }

    private get text() {
        return {
            search_branch_or_store: this.$t("pages.rewards_shop_list.search_branch_or_store").toString(),
            sorry: this.$t("pages.rewards_shop_list.sorry").toString(),
            no_store_config: this.$t("pages.rewards_shop_list.no_store_config").toString(),
            register_msg: this.$t("pages.rewards_shop_list.register_msg").toString(),
            interest_title: this.$t("pages.rewards_shop_list.interest_title").toString(),
            interest_1: this.$t("pages.rewards_shop_list.interest_1").toString(),
            interest_2: this.$t("pages.rewards_shop_list.interest_2").toString(),
            interest_3: this.$t("pages.rewards_shop_list.interest_3").toString(),
            contact_us: this.$t("pages.rewards_shop_list.contact_us").toString(),
            select_branch: this.$t("select_branch").toString(),
            search_branch: this.$t("search_branch").toString(),
            room: this.$t("room").toString(),
            data_not_found: this.$t("data_not_found").toString()
        }
    }

    private async getStores() {
        this.loading = true
        try {
            const stores = await StoreServices.getActiveStoresByBPForReward()
            // this.stores = stores.filter(s => s.floorRoom)
            this.sortStore()
            await VuexServices.Root.setStores(this.stores)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.loading = false
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
        const { stores } = this
        switch (type) {
            case SORT_TYPES.store_name_asc:
                this.stores = [...stores].sort((v1, v2) => v1.displayName.localeCompare(v2.displayName))
                break
            case SORT_TYPES.store_name_desc:
                this.stores = [...stores].sort((v1, v2) => v2.displayName.localeCompare(v1.displayName))
                break
        }
    }

    private get displayStoreList() {
        const { search, stores } = this
        if (search) {
            const text = search.toLowerCase()
            return this.stores.filter(s => s.displayName.includes(text) || s.branch.displayName.includes(text))
        }
        return stores
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

    private async getRewardConfigs(store: StoreModel.Store) {
        this.isNoStoreConfig = false
        this.loading = true
        try {
            const configs = await RewardServices.getRewardConfigs(this.user.bpNumber, store.branch.code, store.industryCode, store.number, store.floorRoom)
            await VuexServices.CustomerReward.configs.set(configs)
            this.isNoStoreConfig = configs.length === 0
            if (this.isNoStoreConfig === false) {
                this.goToMainPage(store)   
            }
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private async goToMainPage(store: StoreModel.Store) {        
        await VuexServices.CustomerReward.store.set(store)
        return this.$router.push({
            name: ROUTER_NAMES.rewards_main,
            query: {
                shop_name: store.displayName,
                shop_unit: store.floorRoom,
                branch_id: store.branch.id,
                branch_name: store.branch.displayName,
                shop_number: store.number,
                industry_code: store.industryCode,
                branch_code: store.branch.code,
                floor_room: store.floorRoom,
                hs: ctjs.SHA1(JSON.stringify(store)).toString()
            },
            params: {
                shop_id: store.id
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