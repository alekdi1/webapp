<template>
    <v-card class="news-item" flat>
        <div class="image-container">
            <v-img @click="goToPost" class="news-image" :aspect-ratio="20/9" :src="image"/>
            <div class="fav-btn-container" v-if="!isQRUser">
                <v-btn @click="deleteFavorite()" v-if="isFavorited" color="red lighten-1" class="favorite-icon ml-auto" elevation="0" large icon>
                    <v-icon size="36">favorite</v-icon>
                </v-btn>
                <v-btn @click="addFavorite()" v-else class="favorite-icon ml-auto" elevation="0" large icon>
                    <v-icon size="36">favorite_border</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="title-container mt-3">
            <a @click="goToPost" class="news-title cpn-content-subtitle font-weight-bold">{{ news.title }}</a>
        </div>

        <div class="news-date cpn-content-subtitle2">{{ displayDate }}</div>
    </v-card>

</template>
<script lang="ts">
import { FileService, PostService } from "@/services"
import { PostModel, UserModel } from "@/models"
import { Vue, Component, Prop } from "vue-property-decorator"
import { StringUtils, DialogUtils, LanguageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import { VuexServices } from "@/services"

@Component
export default class NewsItem extends Vue {
    @Prop({default: () => new PostModel.Post() })
    private news!: PostModel.Post

    @Prop({ default: () => new UserModel.User() })
    private user!: UserModel.User

    @VuexServices.Root.VXFavoriteItems()
    private favs!: PostModel.FavoritePost[]

    private get image() {
        const imageUrl = this.news.image
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private get displayDate () {
        return this.news.displayDateRange
    }

    private get isFavorited () {
        return this.favs.some(f => f.id === this.news.id)
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private async addFavorite () {
        try {
            await PostService.addFavoritePost(this.news.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot add this item to favorite" })
        }
    }

    private async deleteFavorite () {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, this.news.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot delete this item from favorite" })
        }
    }

    private getRouteName () {
        const n = PostService.POST_NEWS_SUB_CATEGORY_NAMES
        switch (this.news.categoryCode) {
            case n.insight: return ROUTER_NAMES.dashboard_business_insights_detail
            case n.promotion: return ROUTER_NAMES.dashboard_promotion_detail
            case n.news_event: return ROUTER_NAMES.dashboard_news_and_activities_detail
            default: return ""
        }
    }

    private goToPost() {
        const rn = this.getRouteName()
        this.$router.push({
            name: rn,
            params: {
                id: this.news.id
            }
        })
    }
}
</script>
<style lang="scss">
.news-item {
    border-radius: 20px !important;

    .image-container {
        position: relative;
    }

    .v-btn {
        position: absolute;
        top: 0;
        right: 0;
        margin-top: 16px;
        margin-right: 16px;
    }

    .news-image {
        display: block;
        border-radius: 20px !important;
        width: 100%;
        height: auto;

        .v-responsive__sizer {
            padding-bottom: 39.5% !important;
        }
        .v-image__image--cover {
            background-size: cover;
        }
    }

    .news-title {
        color: #000000;
    }

    .news-date {
        color: #666666;
    }
}
</style>
