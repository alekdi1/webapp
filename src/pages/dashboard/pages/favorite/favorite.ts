import { PostModel } from "@/models"
import { FileService, PostService, VuexServices } from "@/services"
import { DialogUtils, StringUtils, LanguageUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"

@Component
export default class FavoritePage extends Base {
    private tabValue = 0
    private isLoading = false
    private groups: PostModel.FavoriteGroup[] = []

    private get text () {
        return {
            title: this.$t("pages.favorites.title").toString(),
            not_found: this.$t("pages.favorites.not_found").toString(),
            business_insight_title: this.$t("pages.business_insight.title").toString(),
            annoucement_title: this.$t("pages.annoucement.title").toString(),
            promotion_title: this.$t("pages.promotion.title").toString(),
            news_and_activities_title: this.$t("pages.news_and_activities.title").toString()
        }
    }

    private async mounted () {
        await this.getFavoriteByGroup()
        this.selectedTab(this.menuTabs[0])
    }

    private selectedTab (tab: FavoriteTab) {
        this.tabValue = tab.value
    }

    private get currentPost () {
        const menu = this.menuTabs[this.tabValue]
        const currentGroup = this.groups.find(i => i.code === menu?.id)
        return currentGroup?.posts.filter((x: any) => moment(x.endDate) > moment()) || []
        // return currentGroup ? currentGroup.posts : []
    }

    private async getFavoriteByGroup () {
        this.isLoading = true
        try {
            this.groups = await PostService.getUserAllFavoritePost()
            console.log("this.groups ", this.groups)
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(this.groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private getImage (imageUrl: string) {
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private displayDateRange (startDate: string, endDate: string) {
        const currentLang = LanguageUtils.getCurrentLang()
        const DF = "YYYY-MM-DD HH:mm:ss"
        const start = moment(startDate, DF).locale(currentLang)
        const end = moment(endDate, DF).locale(currentLang)

        if (start.isValid() && end.isValid()) {
            if (currentLang === "en") {
                return `From ${ start.format("DD MMM YY") } - ${ end.format("DD MMM YY") }`
            } else {
                const dd = (m: moment.Moment) => `${ m.format("DD MMM") } ${ String(m.year() + 543).substring(2, 4) }`
                return `ตั้งแต่วันที่ ${ dd(start) } - ${ dd(end) }`
            }
        }
    }

    private async deleteFavorite (id: string) {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, id)
            await this.getFavoriteByGroup()
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot delete this item from favorite" || e.message })
        }
    }

    private goToPost (id: string) {
        const rn = this.menuTabs.find(i => i.active)
        if (rn) {
            this.$router.push({
                name: rn.route,
                params: {
                    id: id
                }
            })
        }
    }

    private get menuTabs () {
        const txt = this.text
        const rn = ROUTER_NAMES
        const menu = [
            // (() => {
            // const t = new FavoriteTab(
            //     PostService.POST_NEWS_SUB_CATEGORY_NAMES.insight,
            //     rn.dashboard_business_insights_detail,
            //     0,
            //     txt.business_insight_title,
            //     this.tabValue === 0
            //     )
            //     return t
            // })(),
                
            (() => {
                const t = new FavoriteTab(
                    PostService.POST_CATEGORY_NAMES.branch_annonuce,
                    rn.dashboard_annoucement_detail,
                    0,
                    txt.annoucement_title,
                    this.tabValue === 0
                )
            return t
            })(),

            (() => {
                const t = new FavoriteTab(
                    PostService.POST_NEWS_SUB_CATEGORY_NAMES.promotion,
                    rn.dashboard_promotion_detail,
                    1,
                    txt.promotion_title,
                    this.tabValue === 1
                )
                return t
            })(),

            (() => {
                const t = new FavoriteTab(
                    PostService.POST_NEWS_SUB_CATEGORY_NAMES.news_event,
                    rn.dashboard_news_and_activities_detail,
                    2,
                    txt.news_and_activities_title,
                    this.tabValue === 2
                )
                return t
            })()
        ]
        return menu
    }
}

class FavoriteTab {
    id = ""
    route = ""
    value = 0
    label = ""
    active = false

    constructor(id: string, route: string, value: number, label: string, active: boolean) {
        this.id = id
        this.route = route
        this.value = value
        this.label = label
        this.active = active
    }
}
