import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { DialogUtils, StringUtils } from "@/utils"
import moment from "moment"
import { FileService, PostService, VuexServices } from "@/services"
import { ROUTER_NAMES } from "@/router"

@Component
export default class BusinessInsightsPage extends Base {
    private businessInsights: PostModel.Post[] = []
    private isLoading = false

    private async mounted () {
        await this.getBusinessInsights()
    }

    private get emptyBusinessInsight () {
        return this.businessInsights.length === 0
    }
    
    private getImage (imageUrl: string) {
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }
    
    private async getBusinessInsights () {
        this.isLoading = true
        const { postType } = VuexServices.Root.getAppConfig()
        const news = postType.find(i => i.name === PostService.POST_CATEGORY_NAMES.news)
        if (news) {
            try {
                const categories = await PostService.getCategories(news.id)
                const cats = categories.filter(i => i.code === "insight")
                if (cats) {
                    const catIds = cats.map(i => i.id)
                    const opts = {
                        sortBy: "created_at",
                        sortOpt: "desc",
                        category: catIds.join(","),
                        active: 1,
                        branch: this.user.allowedBranchIds.join(","),
                        ...!this.isQRUser && { userId: this.user.id } }
                    let insights
                    if(this.user.role == 'QR'){
                        insights = await PostService.getPostsGuest(opts)
                    }else{
                        insights = await PostService.getPosts(opts)
                    }
                    this.businessInsights =  insights
                }
            } catch (e) {
                DialogUtils.showErrorDialog({ text: e.message || e})
            }
        }
        this.isLoading = false
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private displayDate (startDate: string) {
        const DF = "YYYY-MM-DD HH:mm:ss"

        if (this.$i18n.locale === "en") {
            return moment(startDate, DF).locale(this.$i18n.locale).format("DD MMM YY")
        } else {
            return moment(startDate, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
        }
    }
    
    private gotoBusinessInsightDetail (postId: string) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_business_insights_detail,
            params: {
                id: postId
            }
        })
    }

    private get text () {
        return {
            title: this.$t("pages.business_insight.title").toString(),
            search_branch: this.$t("pages.business_insight.search_branch").toString()
        }
    }
}
