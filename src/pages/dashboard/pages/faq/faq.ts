import { PostModel, UserModel } from "@/models"
import { PostService } from "@/services"
import { DialogUtils, LanguageUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"

const t = (k: string) => LanguageUtils.i18n.t("pages.faq." + k).toString()

@Component
export default class FAQPage extends Base {

    private loading = false
    private search = ""
    private filter = new FilterControl()
    private faqs: FAQItem[] = []

    private async mounted() {
        await this.getDatas()
        console.log("faqs --> ", this.faqs)
    }

    private get text() {
        return {
            page_title: t("page_title"),
            phd_search_faq: t("phd_search_faq"),
            title_select_cat: t("title_select_cat")
        }
    }

    private async getDatas() {
        this.loading = true
        // get faqs
        try {
            const faqs = await PostService.getFAQs()
            this.faqs = faqs.map(p => new FAQItem(p))
            this.faqs = this.faqs.filter((x: FAQItem) => x.item.branches.filter(b => this.user.allowedBranchIds.includes(parseInt(b))).length > 0)
            const catMap: { [key: string]: FilterCategoryItem } = {}

            for (const faq of faqs) {
                const catId = String(faq.catId ?? "")
                let item = catMap[catId]
                if (!item) {
                    item = new FilterCategoryItem()
                    item.id = catId
                    item.nameTh = faq.categoryName || ""
                    item.nameEn = faq.categoryName || ""
                    catMap[catId] = item
                }
            }

            this.filter.categories = Object.values(catMap)

        } catch (e) {
            console.log("get faqs error ", e.message || e)
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่สามารถโหลดข้อมูล FAQ ได้", "Cannot load FAQ data.") || e.message
            })
        }
        this.loading = false
    }


    private get isQRUser() {
        return this.user.isQRUser
    }

    private get displayFAQItems() {
        const { faqs, search, filter } = this
        return faqs.filter(f => (
            // check search
            (search ? f.title.search(search) > -1 : true) &&
            // check all
            (filter.selectedType === allCategoryItem().id ? true : String(f.item.catId) === filter.selectedType)
        ))
    }

    // ------------ filter -------------
    private filterBtnClick() {
        this.filter.show = true
    }
}

class FAQItem {
    item: PostModel.Post

    constructor(p: PostModel.Post) {
        this.item = p
    }

    get contentHTML() {
        return this.item.detail
    }

    get title() {
        return this.item.title
    }
}

class FilterControl {
    show = false
    selectedType = allCategoryItem().id
    categories: FilterCategoryItem[] = []

    get filterOptions() {
        return [
            allCategoryItem(),
            ...this.categories
        ]
    }

    isSelected(item: FilterCategoryItem) {
        return this.selectedType === item.id
    }

    selectCat(item: FilterCategoryItem) {
        this.selectedType = item.id
        this.show = false
    }
}

class FilterCategoryItem {
    id = ""
    nameTh = ""
    nameEn = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

function allCategoryItem() {
    const all = new FilterCategoryItem()
    all.id = "all"
    all.nameEn = "View all"
    all.nameTh = "ดูทั้งหมด"
    return all
}
