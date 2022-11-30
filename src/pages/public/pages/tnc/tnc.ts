import { Component } from "vue-property-decorator"
import Base from "../../public-base"
import { TermAndCondition } from "@/views"

@Component({
    components: {
        "cpn-tnc-view": TermAndCondition
    }
})
export default class TermAndConditionPublicPage extends Base {

}
