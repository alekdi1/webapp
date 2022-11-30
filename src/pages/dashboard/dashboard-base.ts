import { VuexServices } from "@/services"
import { Component, Vue } from "vue-property-decorator"
import PageContentContainer from "./components/page-content-container.vue"
import { AppModel, UserModel } from "@/models"
import FeedItem from "./components/feed-item.vue"
import FeedView from "./components/feed-view.vue"
import ActionAcknowledge from "./components/action-acknowledge.vue"

@Component({
    components: {
        "cpn-dsb-page-content-container": PageContentContainer,
        "cpn-dsb-feed-item": FeedItem,
        "cpn-dsb-feed-view": FeedView,
        "cpn-dsb-action-acknowledge": ActionAcknowledge
    }
})
export default class DasgboardBasePage extends Vue {
    @VuexServices.Root.VXAppConfig()
    protected appConfig!: AppModel.AppConfig

    @VuexServices.Root.VXUser()
    protected user!: UserModel.User
}
