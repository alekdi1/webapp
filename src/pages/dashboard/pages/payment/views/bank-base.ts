import { Component } from "vue-property-decorator"
import Base from "./base"
import ATMContainer from "./atm-container.vue"

@Component({
    components: {
        "cpn-instruction-atm-container": ATMContainer
    }
})
export default class InstructionBankBase extends Base {

}
