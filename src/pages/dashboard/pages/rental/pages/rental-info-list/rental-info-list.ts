import { Component } from "vue-property-decorator"
import Base from "../base"
import NotFoundInfoModal from "../../components/not-found-info/not-found-info.vue"
import { DialogUtils, TimeUtils, LanguageUtils } from "@/utils"
import { RentalServices } from "@/services"
import { RentalModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"

const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component({
    components: {
        "cpn-rental-not-found-modal": NotFoundInfoModal
    }
})
export default class RentalInfoListPage extends Base {
    private isLoading = false
    private searchBranch = ""
    private showModal = false
    private rentalStores: RentalModel.RentalStore[] = []
    private sortDialog = new SortDialog()

    private async mounted() {
        await this.getRentalStore()
        console.log("this.rentalStores --> ", this.rentalStores)
    }

    private get text() {
        return {
            title: this.$t("pages.rental.title").toString(),
            see_expired: this.$t("pages.rental.see_expired").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            duedate: this.$t("pages.rental.duedate").toString()
        }
    }

    getStatusText(key: any): string {
        return this.$t('pages.rental.' + key).toString();
    }

    private async getRentalStore() {
        this.isLoading = true
        try {
            const rentalStores = await RentalServices.getRentalStoreList(this.user.customerNo)
            this.rentalStores = rentalStores.filter(i => i.info.type !== RentalServices.RENTAL_STATUS.expired)
            this.sortStore(this.sortDialog.sortBy)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.isLoading = false
    }

    private displayDueDate(duedate: Date) {
        const newDuedate = moment(duedate)
        return TimeUtils.convertToLocalDateFormat(newDuedate)
    }

    private get isEmptyRentalStore() {
        return this.rentalStores.length === 0
    }

    private storeChar(storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private isEmptyInfo(rental: RentalModel.RentalStore) {
        return rental.info.name === ""
    }

    private isExpiring(rental: RentalModel.RentalStore) {
        return rental.info.type === RentalServices.RENTAL_STATUS.expiring
    }

    private isRefund(rental: RentalModel.RentalStore) {
        return rental.info.type === RentalServices.RENTAL_STATUS.refund
    }

    private isRenew(rental: RentalModel.RentalStore) {
        return rental.info.type === RentalServices.RENTAL_STATUS.renew
    }

    private get displayStoreList() {
        const search = this.searchBranch.toLowerCase()
        if (!search) {
            return this.rentalStores
        }

        const filterStores = this.rentalStores.filter(s =>
            String(s.branchName).toLowerCase().includes(search) ||
            String(s.contractName).toLowerCase().includes(search)
        )

        if (filterStores.length === 0) {
            this.showModal = true
        }
        return filterStores
    }

    private get hasNoRental() {
        return this.rentalStores.length === 0
    }

    private showSortDialog() {
        this.sortDialog.show = true
    }

    private sortItemClick(val: string) {
        this.sortDialog.sortBy = val === this.sortDialog.sortBy ? "" : val
        this.sortDialog.show = false

        this.sortStore(this.sortDialog.sortBy)
    }

    private sortStore(type = "") {
        const stores = this.rentalStores
        switch (type) {
            case SORT_TYPES.store_name_asc:
                this.rentalStores = [...stores].sort((v1, v2) => v1.contractName.localeCompare(v2.contractName))
                break
            case SORT_TYPES.store_name_desc:
                this.rentalStores = [...stores].sort((v1, v2) => v2.contractName.localeCompare(v1.contractName))
                break
            default: this.rentalStores = [...stores].sort((v1, v2) => v1.end.localeCompare(v2.end))
        }
    }

    private showModalToggle(toggle: boolean) {
        this.showModal = toggle
        this.searchBranch = ""
    }

    private goToDetail(store: RentalModel.RentalStore) {
        const status = RentalServices.RENTAL_STATUS
        if (store.status || [status.renew, status.expiring].includes(store.info.type)) {
            this.$router.push({
                name: ROUTER_NAMES.rental_detail,
                query: {
                    rentalId: store.id
                }
            })
            return
        }

        this.$router.push({
            name: ROUTER_NAMES.rental_refund_detail,
            query: {
                rentalId: store.id
            }
        })
    }

    private goToExpireList() {
        this.$router.push({
            name: ROUTER_NAMES.rental_expired_list,
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

