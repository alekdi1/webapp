
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { PostService, VuexServices, FileService } from "@/services"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"

@Component
export default class NewsAndActivitiesPage extends Base {
    private newsAndEvents: PostModel.Post[] = []
    private isLoading = false
    private search = ""

    private async mounted() {
        await this.getNewsAndEvents()
    }

    private get emptyNewsAndEvents() {
        return this.newsAndEvents.length === 0
    }

    private getImage(imageUrl: string) {
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private async getNewsAndEvents() {
        this.isLoading = true
        const { postType } = VuexServices.Root.getAppConfig()
        const news = postType.find(i => i.name === PostService.POST_CATEGORY_NAMES.news)
        if (news) {
            try {
                const categories = await PostService.getCategories(news.id)
                const cats = categories.filter(i => i.code === "news_event")
                if (cats) {
                    const catIds = cats.map(i => i.id)
                    const opts = {
                        postType: 1,
                        sortBy: "created_at",
                        sortOpt: "desc",
                        category: catIds.join(","),
                        branch: this.user.allowedBranchIds.join(","),
                        active: 1,
                        pageSize: 100,
                        ...!this.isQRUser ? { userId: this.user.id } :{ bpNumber: this.user.customerNo  }
                    }
                    let newsAndEvents
                    if(this.user.role == 'QR'){
                        newsAndEvents = await PostService.getPostsGuest(opts)
                    }else{
                        newsAndEvents = await PostService.getPosts(opts)
                    }

                    console.log("newsAndEvents ", newsAndEvents)
                    this.newsAndEvents = newsAndEvents;
                }
            } catch (e) {
                DialogUtils.showErrorDialog({ text: e.message || e })
            }
        }
        this.isLoading = false
    }

    private get isQRUser() {
        return this.user.isQRUser
    }

    private async addFavorite(item: PostModel.Post) {
        try {
            await PostService.addFavoritePost(item.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
            item.isFavorited = true
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot add this item to favorite" })
        }
    }

    private async deleteFavorite(item: PostModel.Post) {
        try {
            await DialogUtils.showDeleteFavDialog({ text: LanguageUtils.lang("ยกเลิกรายการโปรด ใช่หรือไม่", "Remove this favorite post?") }, item.id)
            const groups = await PostService.getUserAllFavoritePost()
            await VuexServices.Root.setFavoriteItems(PostService.getFavoritePostFromGroups(groups))
            item.isFavorited = false
        } catch (e) {
            DialogUtils.showErrorDialog({ text: "Cannot delete this item from favorite" })
        }
    }

    private get displayItems() {
        const { search, newsAndEvents } = this
        const s = search.toLowerCase()
        if (!s) {
            return newsAndEvents
        }
        const dummy_branchList =  this.user.branchList.filter(a=>{
            return String( a.code ).toLowerCase().includes(s) || String( a.nameTh ).toLowerCase().includes(s) ||String( a.nameEn ).toLowerCase().includes(s)
        } )
        
        const result =newsAndEvents.filter(a =>{
            return (a.branches.filter(e=>{
                return dummy_branchList.find(s=> s.id == e )?.id
                })?.length>0 || String(a.title + a.desc).toLowerCase().includes(s))

        })
        // const result = annoucements.filter(a => (
        //     String(a.title + a.desc).toLowerCase().includes(s)
        // ))
        return result;
     
     
        // return newsAndEvents.filter(q => (
        //     String(q.title).toLowerCase().includes(s) || String(q.desc).toLowerCase().includes(s)
        // ))




    }

    private displayDate(startDate: string) {
        const DF = "YYYY-MM-DD HH:mm:ss"

        if (this.$i18n.locale === "en") {
            return moment(startDate, DF).locale(this.$i18n.locale).format("DD MMM YY")
        } else {
            return moment(startDate, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
        }
    }

    private displayDateRange(item: PostModel.Post) {
        return item.displayDateRange
    }

    private gotoNewsAndActivitiesDetail(postId: string) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_news_and_activities_detail,
            params: {
                id: postId
            }
        })
    }

    private get text() {
        return {
            title: this.$t("pages.news_and_activities.title"),
            search_branch: this.$t("pages.news_and_activities.search_branch"),
            search_placeholder: LanguageUtils.lang("ค้นหาข่าวสารและกิจกรรม", "Search news and activities")
        }
    }
}
