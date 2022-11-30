<template>
    <v-card class="promotion-item" flat>
        <v-img class="promotion-image" :aspect-ratio="20/9" :src="image"/>

        <div class="promotion-title" v-html="promotion.title"></div>

        <div class="promotion-date">{{ displayDateRange }}</div>
    </v-card>
</template>
<script lang="ts">
import { PostModel } from "@/models"
import { Vue, Component, Prop } from "vue-property-decorator"
import moment from "moment"
import { StringUtils } from "@/utils"
import { FileService } from "@/services"

@Component
export default class PromotionItem extends Vue {
    @Prop({ default: () => new PostModel.Post() })
    private promotion!: PostModel.Post

    private get image() {
        const imageUrl = this.promotion.image
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private get displayDateRange() {
        const { startDate, endDate } = this.promotion
        const DF = "YYYY-MM-DD HH:mm:ss"
        const start = moment(startDate, DF).locale(this.$i18n.locale)
        const end = moment(endDate, DF).locale(this.$i18n.locale)

        if (start.isValid() && end.isValid()) {
            if (this.$i18n.locale === "en") {
                return `From ${ start.format("DD MMM YY") } - ${ end.format("DD MMM YY") }`
            } else {
                const dd = (m: moment.Moment) => `${ m.format("DD MMM") } ${ String(m.year() + 543).substring(2, 4) }`
                return `ตั้งแต่วันที่ ${ dd(start) } - ${ dd(end) }`
            }
        }
        return ""
    }
}
</script>
<style lang="scss" scoped>
.promotion-item {
    border-radius: 20px !important;
    .promotion-image {
        border-radius: 20px !important;
    }

    .promotion-title {
        margin-top: 6px;
        font-size: 16px;
        font-weight: bold;
        color: #000000;
    }

    .promotion-date {
        margin-top: 2px;
        font-size: 12px;
        color: #666666;
    }
}
</style>