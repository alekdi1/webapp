import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { PostModel } from "@/models"
import { DialogUtils, LanguageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import { VuexServices, PostService, NotificationServices } from "@/services"
import moment from "moment"
import { compile } from "vue/types/umd"

@Component
export default class AnnoucementPage extends Base {
    private annoucements: PostModel.Post[] = []
    private isLoading = false
    private search = ""

    private async mounted() {
        await this.getAnnoucement()
    }

    private get emptyAnnoucement() {
        return this.annoucements.length === 0
    }

    private diplayDate(date: string) {
        const DF = "YYYY-MM-DD HH:mm:ss"

        if (this.$i18n.locale === "en") {
            return moment(date, DF).locale(this.$i18n.locale).format("DD MMM YY")
        } else {
            return moment(date, DF).locale(this.$i18n.locale).add(543, "year").format("DD MMM YY")
        }
    }

    private get isQRUser() {
        return this.user.isQRUser
    }

    private async getAnnoucement() {
        this.isLoading = true
        const { postType } = VuexServices.Root.getAppConfig()
        const annoucement = postType.find(i => i.name === PostService.POST_CATEGORY_NAMES.branch_annonuce)
        if (annoucement) {
            try {
                let annoucements
                if(this.user.role == 'QR'){
                    annoucements = await PostService.getPostsGuest({
                        active: 1,
                        postType: annoucement.id,
                        branch: this.user.allowedBranchIds.join(","),
                        bpNumber: this.user.customerNo  
                    })
                }else{
                    annoucements = await PostService.getPosts({
                        active: 1,
                        postType: annoucement.id,
                        branch: this.user.allowedBranchIds.join(","),
                    })
                }
                console.log("annoucements ", annoucements)
                this.annoucements = annoucements
            } catch (e) {
                DialogUtils.showErrorDialog({ text: e.message || e})
            }
        }
        this.isLoading = false
    }

    private goToAnnoucementDetail(postId: string) {
        const post = this.annoucements.find(x => x.id == postId);
        if (post != undefined && post.notificationId != 0 && !post.isReaded) {
            console.log("updateNotification")
            NotificationServices.markNotisAsRead([post.notificationId]);
        }
        const rount_url = {
            name: ROUTER_NAMES.dashboard_annoucement_detail,
            params: {
                id: postId
            }
        }
        this.$router.push(rount_url)
    }

    private get text() {
        return {
            title: this.$t("pages.annoucement.title").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            search_placeholder: LanguageUtils.lang("ค้นหาประกาศ", "Search annoucement")
        }
    }

    private get displayAnnoucements() {
        const { annoucements, search } = this

        if (!search) {
            return annoucements
        }
        const s = search.toLowerCase()
        const dummy_branchList =  this.user.branchList.filter(a=>{
            return String( a.code ).toLowerCase().includes(s) || String( a.nameTh ).toLowerCase().includes(s) ||String( a.nameEn ).toLowerCase().includes(s)
        } )
        
        const result =annoucements.filter(a =>{
            return (a.branches.filter(e=>{
                return dummy_branchList.find(s=> s.id == e )?.id
                })?.length>0 || String(a.title + a.desc).toLowerCase().includes(s))

        })
        // const result = annoucements.filter(a => (
        //     String(a.title + a.desc).toLowerCase().includes(s)
        // ))
        return result;
    }

    private displayDateRange(item: PostModel.Post) {
        return LanguageUtils.lang(
            `${this.displayDate(item.startDate)}`,
            `${this.displayDate(item.startDate)}`
        )
    }

    private displayDate = (dateStr: string) => {
        const md = moment(dateStr, "YYYY-MM-DD HH:mm:ss").locale(LanguageUtils.getCurrentLang())
        return LanguageUtils.lang(
            `${md.format("DD MMM")} ${String(md.year() + 543).substr(2)}`,
            md.format("DD MMM YY")
        )
    }
}
