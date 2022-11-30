import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { TermAndCondition } from "@/views"

@Component({
    components: {
        "cpn-tnc-view": TermAndCondition
    }
})
export default class TncPage extends Base {

    private get isQRUser () {
        return this.user.isQRUser
    }

    private get text () {
        return {
            title: this.$t("pages.tnc.title").toString()
        }
    }
}
