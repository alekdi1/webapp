import { Component, Watch } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { PostService, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"


@Component
export default class NewsAndActivitiesDetailPage extends Base {
    @VuexServices.Root.VXFavoriteItems()
    private favs!: PostModel.FavoritePost[]

    private isLoading = false
    private newsAndEvent = new PostModel.Post()
    private isSubmitting = false
    private isSubmitted = false

    private async mounted() {
        PostService.updatePostIsReaded(parseInt(this.newsAndEventId));
        await this.getnewsAndEventById()
    }

    @Watch("newsAndEventId")
    private async onIdChange() {
        if (this.$route.params.id) {
            await this.getnewsAndEventById()
        }
    }

    private get newsAndEventId() {
        return this.$route.params.id
    }

    private async getnewsAndEventById() {
        this.isLoading = true
        const { text } = this
        try {
            let p: PostModel.Post | null = null
            if (this.isQRUser) {
                p = await PostService.getPostById(this.newsAndEventId)
            } else {
                p = await PostService.getPostById(this.newsAndEventId, this.user.id)
            }

            console.log("p --> ", p)
            if (!p || p.isExpired) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.")
                })
                return this.$router.go(-1)
            }
            this.newsAndEvent = p
            this.newsAndEvent.detail = this.addEventHtmlTag(p.detail)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.") })
            return this.$router.go(-1)
        }
        this.isLoading = false
    }

    private get isQRUser() {
        return this.user.isQRUser
    }

    private get isFavorited() {
        return this.favs.some(f => f.id === this.newsAndEventId)
    }

    private async addFavorite() {
        try {
            await PostService.addFavoritePost(this.newsAndEventId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถเพิ่มรายการนี้ได้", "Cannot add this item to favorite") })
        }
    }

    private async deleteFavorite() {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, this.newsAndEventId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถยกเลิกรายการนี้ได้", "Cannot delete this item from favorite") })
        }
    }

    // private get displayDate () {
    //     const startDate = this.newsAndEvent.startDate
    //     const DF = "YYYY-MM-DD HH:mm:ss"
    //     if (this.$i18n.locale === "en") {
    //         return moment(startDate, DF).locale(this.$i18n.locale).format("DD MMM YY")
    //     } else {
    //         return moment(startDate, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
    //     }
    // }

    protected get displayDate() {
        return this.newsAndEvent.displayDateRange
    }

    private get displayButton() {
        return this.newsAndEvent.hasCampaign && !this.isQRUser
    }

    private get hasUserJoinedEvent() {
        return this.newsAndEvent.allAcceptedEventUsers.includes(this.user.id) || this.isSubmitted
    }

    private get submitButtonText() {
        return this.hasUserJoinedEvent ? this.text.submitted : this.text.submit
    }

    private async submitJoin() {
        this.isSubmitting = true
        try {
            await PostService.submitJoinEvent(Number(this.newsAndEventId))
            this.isSubmitted = true
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.isSubmitting = false
    }

    private get text() {
        return {
            title: this.$t("pages.news_and_activities.title").toString(),
            submit: this.$t("pages.news_and_activities.submit").toString(),
            submitted: this.$t("pages.news_and_activities.submitted").toString()
        }
    }

    private addEventHtmlTag(html: string) {
        return html.replaceAll('<a ', '<a target="_blank" ')
    }
}
