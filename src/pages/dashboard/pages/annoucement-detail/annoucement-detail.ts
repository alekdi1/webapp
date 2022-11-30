import { Component, Watch } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { PostService, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils, StringUtils} from "@/utils"

@Component
export default class AnnoucementDetailPage extends Base {
    @VuexServices.Root.VXFavoriteItems()
    private favs!: PostModel.FavoritePost[]

    private isLoading = false
    private annoucement = new PostModel.Post();

    private async mounted() {
        await this.getAnnoucementById()
    }

    @Watch("annoucementId")
    private async onIdChange() {
        if (this.$route.params.id) {
            await this.getAnnoucementById()
        }
    }

    private get annoucementId() {
        return this.$route.params.id
    }

    private async getAnnoucementById() {
        this.isLoading = true
        const { text } = this
        try {
            let p: PostModel.Post | null = null
            if (this.isQRUser) {
                p = await PostService.getPostById(this.annoucementId)
            } else {
                p = await PostService.getPostById(this.annoucementId, this.user.id)
            }

            if (p == null) {
                DialogUtils.showErrorDialog({
                    // text: LanguageUtils.lang("ไม่พบรายการ " + text.title, text.title + " not found")
                    text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.")
                })
                return this.$router.go(-1)
            }
            if (p.isExpired) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired.")
                })
                return this.$router.go(-1)
            }
            this.annoucement = p
            this.annoucement.detail = this.addEventHtmlTag(p.detail)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
            return this.$router.go(-1)
        }
        this.isLoading = false
    }

    private get isQRUser() {
        return this.user.isQRUser
    }

    private get isFavorited() {
        return this.favs.some(f => f.id === this.annoucementId)
    }

    private async addFavorite() {
        try {
            await PostService.addFavoritePost(this.annoucementId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถเพิ่มรายการนี้ได้", "Cannot add this item to favorite") })
        }
    }

    private async deleteFavorite() {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, this.annoucementId)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่สามารถยกเลิกรายการนี้ได้", "Cannot delete this item from favorite")})
        }
    }

    // private get displayDate () {
    //     const startDate = this.annoucement.startDate
    //     const DF = "YYYY-MM-DD HH:mm:ss"

    //     if (this.$i18n.locale === "en") {
    //         return moment(startDate, DF).locale(this.$i18n.locale).format("DD MMM YY")
    //     } else {
    //         return moment(startDate, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
    //     }
    // }

    private get validateYoutubeUrl () {
        const REGX_YOUTUBE_LINK = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)(?<video_code>[^& \n<]+)(?:[^ \n<]+)?/
        const youtubeId = this.annoucement.videoLink.match(REGX_YOUTUBE_LINK)
        return youtubeId
    }

    private get videoUrl () {
        const urlRegx = StringUtils.isUrl(this.annoucement.videoLink)
        if(!urlRegx) return

        const youtubeRegx = this.validateYoutubeUrl
        return youtubeRegx ? `https://www.youtube.com/embed/${youtubeRegx.groups?.video_code || ""}` : this.annoucement.videoLink
    }

    protected get displayDate() {
        return this.annoucement?.displayDateRange
    }

    private get text() {
        return {
            title: this.$t("pages.annoucement.title").toString()
        }
    }

    private addEventHtmlTag(html: string) {
        return html.replaceAll('<a ', '<a target="_blank" ')
    }
}
