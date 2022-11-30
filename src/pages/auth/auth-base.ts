import { Component, Vue } from "vue-property-decorator"

import PageContent from "./components/page-container.vue"
import CMPText from "./components/company-text.vue"

@Component({
    components: {
        "cpn-auth-conrainer": PageContent,
        "cpn-auth-company-text": CMPText
    }
})
export default class AuthBasePage extends Vue {
}
