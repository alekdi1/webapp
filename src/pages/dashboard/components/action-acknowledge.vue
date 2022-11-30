<template>
    <div class="action-acknowledge-view">
        <div class="status-content-container d-flex flex-column align-center">
            <div class="icon-container">
                <fa-icon name="check-circle" type="fal" :size="64" color="white"/>
            </div>

            <slot name="title">
                <div class="status-title">{{ title }}</div>
            </slot>

            <slot name="content">
                <div class="status-content">{{ content }}</div>
            </slot>
        </div>

        <div class="promotion-card" v-if="promotion">
            <div class="promotion-item">
                <div class="promotion-item-title ">{{ promotion.title }}</div>
                <div class="promotion-item-subtitle">{{ promotion.subtitle }}</div>

                <v-card flat class="promotion-item-img-card">
                    <v-img width="100%" :aspect-ratio="20/9" :src="promotion.image" :alt="promotion.title" >
                        <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center" >
                                <v-progress-circular indeterminate color="primary" />
                            </v-row>
                        </template>
                    </v-img>
                </v-card>

                <div class="promotion-item-action">
                    <div>
                        <v-img class="more-icon-img" width="16" height="16" :src="require('@/assets/images/icons/view-all-content.svg')"/>
                    </div>
                    <v-btn @click="promotionMoreDetail(promotion.id)" text class="px-1 ml-1 view-more-btn">
                        <span class="action-label text-uppercase">{{ $t("see_more") }}</span>
                    </v-btn>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { VuexServices, PostService, FileService } from "@/services"
import { ROUTER_NAMES } from "@/router"
import { UserModel } from "@/models"

@Component
export default class ActionAcknowledge extends Vue {
    @Prop({ default: "success" }) private status!: string
    @Prop({ default: "" }) private title!: string
    @Prop({ default: "" }) private content!: string
    @Prop({ default: "" }) private branch!: string

    @VuexServices.Root.VXUser()
    protected user!: UserModel.User
    
    private promotion: PromotionViewModel | null = null
    private isLoading = false

    private async mounted () {
        await this.getPromotion()
    }

    private async getPromotion () {
        this.isLoading = true
        const { postType } = VuexServices.Root.getAppConfig()
        const vxUser = VuexServices.Root.getUser()
        const news = postType.find(i => i.name === PostService.POST_CATEGORY_NAMES.news)
        console.log("User --> ", this.user)
        if (news) {
            try {
                const categories = await PostService.getCategories(news.id)
                const cats = categories.filter(i => i.code === "promotion")
                if (cats) {
                    const catIds = cats.map(i => i.id)
                    const opts: PromotionParams = {
                        pageSize: 1,
                        sortBy: "created_at",
                        sortOpt: "desc",
                        category: catIds.join(","),
                        branch: vxUser ? vxUser.allowedBranchIds.join(",") : "",
                        active: 1,
                        bpNumber: this.user.bpNumber || this.user.customerNo
                    }

                    let promotion
                    if(this.user.role == 'QR'){
                        promotion = await PostService.getPostsGuest(opts)
                    }else{
                        promotion = await PostService.getPosts(opts)
                    }
                    const latestPromotion = promotion[0]
                    const imageUrl = FileService.getImagefromUrl(latestPromotion.image) ? latestPromotion.image :require("@/assets/images/cpn-placeholder.jpg");
                    this.promotion = new PromotionViewModel(latestPromotion.id, latestPromotion.title, latestPromotion.desc, imageUrl)
                }
            } catch (e) {
                // DialogUtils.showErrorDialog({ text: e })
            }
        }
        this.isLoading = false
    }

    private promotionMoreDetail(postId: string) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_promotion_detail,
            params: {
                id: postId
            }
        })
    }
}

class PromotionViewModel {
    id = ""
    title = ""
    subtitle = ""
    image = ""

    constructor (id: string, title: string, subtitle: string, image: string) {
        this.id = id
        this.title = title
        this.subtitle = subtitle
        this.image = image
    }
}

interface PromotionParams {
    pageSize: number,
    sortBy: string,
    sortOpt: string,
    category: string,
    active: number,
    branch?: string,
    bpNumber: string
}

</script>
<style lang="scss">
.action-acknowledge-view {
    background: #0c0c0c;
    width: 100%;
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;

    .status-content-container {
        padding-top: 80px;
        padding-bottom: 24px;
        padding-left: 24px;
        padding-right: 24px;
        flex: 1;
        width: 100%;

        .status-content {
            font-size: 16px;
            color: #ffffff;
        }

        .icon-container {
            margin-bottom: 20px;
        }

        .status-title {
            font-size: 20px;
            color: #ffffff;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
    }

    .promotion-card {
        background: var(--v-primary-base);
        padding-top: 36px;
        padding-bottom: 36px;
        padding-left: 24px;
        padding-right: 24px;
        border-top-left-radius: 36px;
        border-top-right-radius: 36px;
        width: 100%;

        .promotion-item {
            .promotion-item-title {
                font-size: 18px;
                font-weight: bold;
                color: #ffffff;
            }

            .promotion-item-subtitle {
                font-size: 16px;
                color: #ffffff;
            }

            .promotion-item-img-card {
                margin-top: 8px;
                border-radius: 20px;
            }

            .promotion-item-action {
                margin-top: 16px;
                display: flex;
                align-items: center;
                flex-direction: row;

                .view-more-btn {
                    height: 28px !important;
                    .action-label {
                        font-size: 14px;
                        color: #ffffff;
                        text-transform: capitalize;
                    }
                }
            }
        }
    }
}
</style>