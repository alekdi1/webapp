import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { FileService, PostService, VuexServices } from "@/services"
import { PostModel } from "@/models"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"

@Component
export default class PromotionPage extends Base {
    private promotions: PostModel.Post[] =  []
    private isLoading = false
    private search = ""

    private async mounted () {
        this.getPromotion()
    }

    private get emptyPromotion () {
        return this.promotions.length === 0
    }

    private get text () {
        return {
            title: this.$t("pages.promotion.title").toString(),
            search_branch: this.$t("pages.promotion.search_branch").toString(),
            search_placeholder: LanguageUtils.lang("ค้นหาโปรโมชัน", "Search promotion")
        }
    }

    private async getPromotion () {
        this.isLoading = true
        const { postType } = VuexServices.Root.getAppConfig()
        const news = postType.find(i => i.name === PostService.POST_CATEGORY_NAMES.news)
        if (news) {
            try {
                const categories = await PostService.getCategories(news.id)
                const cats = categories.filter(i => i.code === "promotion")
                if (cats) {
                    const catIds = cats.map(i => i.id)
                    const opts = {
                        sortBy: "created_at",
                        sortOpt: "desc",
                        category: catIds.join(","),
                        branch: this.user.allowedBranchIds.join(","),
                        active: 1,
                        ...this.isQRUser && { bpNumber: this.user.customerNo  } 
                    }
                    let promotion
                    if(this.user.role == 'QR'){
                        promotion = await PostService.getPostsGuest(opts)
                    }else{
                        promotion = await PostService.getPosts(opts)
                    }
                    this.promotions = promotion
                }
            } catch (e) {
                DialogUtils.showErrorDialog({ text: e.message || e})
            }
        }
        this.isLoading = false
    }

    private getImage (imageUrl: string) {
        const checkImageIsvalide = FileService.getImagefromUrl(imageUrl);
        console.log('checkImageIsvalide ==> ', checkImageIsvalide);
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private async addFavorite (item: PostModel.Post) {
        try {
            await PostService.addFavoritePost(item.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
            item.isFavorited = true
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot add this item to favorite" })
        }
    }

    private async deleteFavorite (item: PostModel.Post) {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, item.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
            item.isFavorited = false
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot delete this item from favorite" })
        }
    }

    private displayDateRange (item: PostModel.Post) {
        return item.displayDateRange
    }

    private gotoPromotionDetail (postId: string) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_promotion_detail,
            params: {
                id: postId
            }
        })
    }

    private get displayItems() {
        const { promotions, search } = this
        const s = search.toLowerCase()
        console.log(promotions)
        if (!s) {
            return promotions
        }

        const dummy_branchList =  this.user.branchList.filter(a=>{
            return String( a.code ).toLowerCase().includes(s) || String( a.nameTh ).toLowerCase().includes(s) ||String( a.nameEn ).toLowerCase().includes(s)
        } )
        
        const result =promotions.filter(a =>{
            return (a.branches.filter(e=>{
                return dummy_branchList.find(s=> s.id == e )?.id
                })?.length>0 || (String(a.title + a.desc).toLowerCase().includes(s)))

        })
        return result;


        
        // return promotions.filter(p => (String(p.title + p.desc).toLowerCase().includes(s)))
    }
}
