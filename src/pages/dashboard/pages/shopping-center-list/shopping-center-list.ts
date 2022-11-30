import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { LanguageUtils } from "@/utils"
import { BranchModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import { EmployeeServices, BranchService } from "@/services"

const t = (k: string) => LanguageUtils.i18n.t("pages.shopping_center." + k).toString()

@Component
export default class ShoppingCenterListPage extends Base {

    private loading = false
    private search = ""
    private branches: BranchModel.Branch[] = []

    private mounted() {
        if (this.user.isQRUser) {
            this.branches = BranchService.filterQRBranch(this.user)
        } else {
            this.branches = BranchService.filterNoneHeadOffice(this.user.branchList)
            if (!this.user.isOwner) {
                const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.branch_announcement)
                if (!permission) {
                    throw new Error(LanguageUtils.lang("คุณไม่มีสิทธิ์เข้าใช้งาน", "You have no permission to use this feature"))
                }
                console.log(this.branches)
                // this.branches = this.branches.filter(s =>permission.shops.some(ps => (ps.branch.code=='PK2'?'PKT': (ps.branch.code=='PKT'?'PK1':ps.branch.code)) === s.code))
                this.branches = this.branches.filter(s =>permission.shops.some(ps => ps.branch.code === s.code))

                // --------- debug ---------
            }
        }
    }

    private get text() {
        return {
            page_title: t("title_list"),
            search_branch: this.$t("search_branch").toString()
        }
    }

    private get branchList() {
        const { search, branches } = this
        if (!search) {
            return [...branches]
        }

        return branches.filter(b => (
            // search branch
            String(b.displayName).toLowerCase().includes(search.toLowerCase())
        ))
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private selectBranch(b: BranchModel.Branch) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_shopping_center_info,
            params: {
                branch_id: b.id
            }
        })
    }
}
