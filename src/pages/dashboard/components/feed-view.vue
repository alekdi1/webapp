<template>
    <div class="feed-container">

        <div class="d-flex justify-center" style="width: 100%; height: 200px;" v-if="loading">
            <cpn-loading />
        </div>

        <template v-else>
            <div class="feed-content-title" v-if="title">{{ title }}</div>

            <div class="feed-list mt-6">
                <template v-for="(item, idx) in items">
                    <!-- <feed-item-promotion class="mb-5" :promotion="item" v-if="category === 'promotion'" :key="'promotion-item-' + idx"/> -->
                    <feed-item-news class="mb-5" :news="item" :user="user" :key="'news-item-' + idx" />
                </template>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import { PostService } from "@/services"
import * as VXS from "@/services/vuex.service"
import { Component, Prop, Vue } from "vue-property-decorator"
import ItemPromotion from "../views/feed-promotion-item.vue"
import ItemNews from "../views/feed-news-item.vue"
import { PostModel, UserModel } from "@/models"

@Component({
    components: {
        "feed-item-promotion": ItemPromotion,
        "feed-item-news": ItemNews
    }
})
export default class FeedItemView extends Vue {
    @Prop({ default: "" }) private category!: string

    @Prop({ default: "" }) private title!: string

    @Prop({ default: () => new UserModel.User }) private user!: UserModel.User

    private items: PostModel.Post[] = []

    private loading = false

    private mounted() {
        this.getFeeds()
    }

    private async getFeeds() {
        this.loading = true
        try {
            const appConfig = VXS.Root.getAppConfig()
            const { postType } = appConfig
            const newsPostId = postType.find(i => i.name === "news")
            let posts
            if(this.user.role == 'QR'){
                posts = await PostService.getPostsGuest({
                postType: newsPostId?.id,
                pageSize: 3,
                sortBy: "created_at",
                sortOpt: "desc",
                active: 1,
                branch: this.user.allowedBranchIds.join(","),
                bpNumber: this.user.customerNo  })
            }else{
                posts = await PostService.getPosts({
                postType: newsPostId?.id,
                pageSize: 3,
                sortBy: "created_at",
                sortOpt: "desc",
                active: 1,
                branch: this.user.allowedBranchIds.join(","),
                userId: this.user.id })
            } 
            this.items = posts
        } catch (e) {
            console.log("Get feed error ", e.message || e)
        }
        this.loading = false
    }
}
</script>
<style lang="scss" scoped>
.feed-container {
    padding: 36px;
    .feed-content-title {
        font-size: 16px;
        font-weight: bold;
        color: #121212;
    }
}
</style>