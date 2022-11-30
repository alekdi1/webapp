import { Component } from "vue-property-decorator"
import Base from "../base"
import NotFoundInfoModal from "../../components/not-found-info/not-found-info.vue"
import { TimeUtils, DialogUtils } from "@/utils"
import { RentalServices } from "@/services"
import { RentalModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"

@Component({
    components: {
        "cpn-rental-not-found-modal": NotFoundInfoModal
    }
})
export default class RentalExpireListPage extends Base {
    private isLoading = false
    private searchBranch = ""
    private showModal = false
    private rentalStores: RentalModel.RentalStore[] = []

    private async mounted () {
        await this.getRentalStore()
    }

    private get text () {
        return {
            title: this.$t("pages.expired_rental.title").toString(),
            search_branch: this.$t("search_branch").toString(),
            contractexpired: this.$t("pages.rental.contractexpired"),
            description: this.$t("pages.rental.description")

        }
    }

    private async getRentalStore () {
        this.isLoading = true
        try {
            this.rentalStores = await RentalServices.getRentalStoreList(this.user.customerNo, RentalServices.RENTAL_STATUS.expired)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private displayDueDate (duedate: Date) {
        const newDuedate = moment(duedate)
        return TimeUtils.convertToLocalDateFormat(newDuedate)
    }

    private get isEmptyRentalStore () {
        return this.rentalStores.length === 0
    }

    private storeChar (storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private isExpired (rental: RentalModel.RentalStore) {
        return rental.info.type === "contract_expired"
    }

    private get displayStoreList () {
        if (!this.searchBranch) {
            return this.rentalStores
        }

        const filterStores = this.rentalStores.filter(s => s.branchName.includes(this.searchBranch))

        if (filterStores.length === 0) {
            this.showModal = true
        }

        return filterStores
    }

    private showModalToggle (toggle: boolean) {
        this.showModal = toggle
        this.searchBranch = ""
    }

    private goToExpireDetail (rental: RentalModel.RentalStore) {
        this.$router.push({
            name: ROUTER_NAMES.rental_expired_detail,
            query: {
                rentalId: rental.id
            }
        })
    }
}
