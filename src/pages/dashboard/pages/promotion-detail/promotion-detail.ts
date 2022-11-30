import { Component, Watch } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { PostService, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"

@Component
export default class PromotionDetailPage extends Base {
    @VuexServices.Root.VXFavoriteItems()
    protected favs!: PostModel.FavoritePost[]

    protected isLoading = false
    protected promotion = new PostModel.Post()

    protected async mounted() {
        PostService.updatePostIsReaded(parseInt(this.promotionId));
        await this.getPromotionById()
    }

    @Watch("promotionId")
    protected async onIdChange() {
        if (this.$route.params.id) {
            await this.getPromotionById()
        }
    }

    protected get promotionId() {
        return this.$route.params.id
    }

    protected async getPromotionById() {
        this.isLoading = true
        try {
            let p: PostModel.Post | null = null
            if (this.isQRUser) {
                p = await PostService.getPostById(this.promotionId)
            } else {
                p = await PostService.getPostById(this.promotionId, this.user.id)
            }

            if (!p || p.isExpired) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.")
                })
                return this.$router.go(-1)
            }
            this.promotion = p
            this.promotion.detail = this.addEventHtmlTag(this.promotion.detail);
            console.log("this.promotion -->", this.promotion)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
        this.isLoading = false
    }

    protected get isQRUser() {
        return this.user.isQRUser
    }

    protected get isFavorited() {
        return this.favs.some(f => f.id === this.promotionId)
    }

    protected async addFavorite() {
        try {
            await PostService.addFavoritePost(this.promotionId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถเพิ่มรายการนี้ได้", "Cannot add this item to favorite") })
        }
    }

    protected async deleteFavorite() {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, this.promotionId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถยกเลิกรายการนี้ได้", "Cannot delete this item from favorite") })
        }
    }

    protected get displayDate() {
        return this.promotion.displayDateRange
    }

    protected get text() {
        return {
            title: this.$t("pages.promotion.title").toString(),
            submit: this.$t("pages.promotion.submit").toString(),
            submitted: this.$t("pages.promotion.submitted").toString()
        }
    }

    get submitButtonText() {
        return this.hasUserJoinedEvent ? this.text.submitted : this.text.submit
    }

    get hasUserJoinedEvent() {
        return this.promotion.allAcceptedEventUsers.includes(this.user.id) || false;
    }

    private async submitJoin() {
        const promotionId = this.promotionId;
        try {
            await PostService.submitJoinEvent(Number(promotionId))
            this.promotion.allAcceptedEventUsers.push(this.user.id);
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }
    }

    private addEventHtmlTag(html: string) {
       return html.replaceAll('<a ', '<a target="_blank" ')
    }
}
