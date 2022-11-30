import { Component, Vue } from "vue-property-decorator"
import Footer from "../components/footer.vue"

@Component({
    components: {
        "cpn-dsb-footer": Footer
    }
})
export default class DashboardFooterBase extends Vue {}
