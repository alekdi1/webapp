import { Component, Watch } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { PostService, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"
import moment from "moment"

@Component
export default class BusinessInsightDetailPage extends Base {
    @VuexServices.Root.VXFavoriteItems()
    private favs!: PostModel.FavoritePost[]

    private isLoading = false
    private businessInsight = new PostModel.Post()

    private async mounted () {
        await this.getBusinessInsightById()
    }

    @Watch("businessInsightId")
    private async onIdChange () {
        if (this.$route.params.id) {
            await this.getBusinessInsightById()
        }
    }

    private get businessInsightId () {
        return this.$route.params.id
    }

    private async getBusinessInsightById () {
        this.isLoading = true
        const { text } = this
        try {
            let p: PostModel.Post|null = null
            if (this.isQRUser) {
                p = await PostService.getPostById(this.businessInsightId)
            } else {
                p = await PostService.getPostById(this.businessInsightId, this.user.id)
            }

            if (!p || p.isExpired) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.")
                })
                return this.$router.go(-1)
            }
            this.businessInsight = p
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private get isFavorited () {
        return this.favs.some(f => f.id === this.businessInsightId)
    }

    private async addFavorite () {
        try {
            await PostService.addFavoritePost(this.businessInsightId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถเพิ่มรายการนี้ได้", "Cannot add this item to favorite")  })
        }
    }
    
    private async deleteFavorite () {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, this.businessInsightId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถยกเลิกรายการนี้ได้", "Cannot delete this item from favorite") })
        }
    }

    private get displayDate () {
        const startDate = this.businessInsight.startDate
        const DF = "YYYY-MM-DD HH:mm:ss"

        if (this.$i18n.locale === "en") {
            return moment(startDate, DF).locale(this.$i18n.locale).format("DD MMM YY")
        } else {
            return moment(startDate, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
        }
    }

    private get text () {
        return {
            title: this.$t("pages.business_insight.title").toString()
        }
    }
}
