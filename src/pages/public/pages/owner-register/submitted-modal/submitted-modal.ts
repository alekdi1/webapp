import { Component, Vue, Prop } from "vue-property-decorator"
import { ROUTER_NAMES } from "@/router"

@Component
export default class SubmitOwnerComponent extends Vue {
    @Prop({ default: false })
    private overlay!: boolean

    private open = true

    private login () {
        this.open = false
        this.$router.push({
            name: ROUTER_NAMES.login
        })
    }

    private addEmployee () {
        this.open = false
        this.$emit("add")
    }
}
