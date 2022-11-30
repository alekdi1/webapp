import { Component, Vue } from "vue-property-decorator"
import PublicPageContainer from "./components/page-content-container.vue"
import publicActionAcknowledge from "./components/action-acknowledge.vue"

@Component({
    components: {
        "cpn-public-page-content-container": PublicPageContainer,
        "cpn-public-action-acknowledge": publicActionAcknowledge
    }
})
export default class PublicBasePage extends Vue {}
