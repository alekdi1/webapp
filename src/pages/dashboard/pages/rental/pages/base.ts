import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import StoreView from "../view/store.vue"
import RentalDataView from "../view/rental-data.vue"
import DownloadBtn from "../view/download-btn.vue"
import RentalQuotationDataView from "../view/rental-quotation-data.vue"

@Component({
    components: {
        "cpn-rental-store": StoreView,
        "cpn-rental-data": RentalDataView,
        "cpn-rental-quotation-data": RentalQuotationDataView,
        "cpn-download-btn": DownloadBtn
    }
})
export default class RentalBase extends Base {}
