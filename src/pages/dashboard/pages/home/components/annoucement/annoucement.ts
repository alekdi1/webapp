import { Component, Vue, Prop } from "vue-property-decorator"
import { PostModel } from "@/models"
import moment from "moment"
import { StringUtils } from "@/utils"

@Component
export default class AnnoucementComponent extends Vue {
    @Prop({ default: {} })
    private popup!: PostModel.Post

    private overlay = true

    private get hasVideoLink () {
        if (!this.popup) return
        return this.popup.videoLink
    }

    private get hasFileLink () {
        if (!this.popup) return
        return this.popup.image
    }

    private get validateYoutubeUrl () {
        const REGX_YOUTUBE_LINK = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)(?<video_code>[^& \n<]+)(?:[^ \n<]+)?/
        const youtubeId = this.popup.videoLink.match(REGX_YOUTUBE_LINK)
        return youtubeId
    }

    private get videoUrl () {
        const urlRegx = StringUtils.isUrl(this.popup.videoLink)
        if(!urlRegx) return

        const youtubeRegx = this.validateYoutubeUrl
        return youtubeRegx ? `https://www.youtube.com/embed/${youtubeRegx.groups?.video_code || ""}` : this.popup.videoLink
    }

    private get title () {
        if (!this.popup) return ""
        return this.popup.title
    }

    private get file () {
        if (!this.popup) return ""
        return this.popup.image
    }
    private get annoucement_detail_id () {
        if (!this.popup) return ""
        return 'news/annoucement_detail/'+this.popup.id
    }

    private get isExpired () {
        const end = moment(this.popup.endDate).format("YYYY-MM-DD HH:mm:ss")
        return moment().isAfter(end)
    }

    private get text () {
        return {
            see_detail: this.$t("pages.homepage.see_detail").toString()
        }
    }
}
