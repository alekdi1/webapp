import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { DialogUtils, LanguageUtils, StringUtils } from "@/utils"
import { BranchModel } from "@/models"
import { EmployeeServices,BranchService } from "@/services"

@Component
export default class ShoppingCenterMapPage extends Base {

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
            page_title: this.$t("pages.dashboard.menu_shopping_mall_map").toString(),
            search_branch: this.$t("search_branch").toString()
        }
    }

    private get branchList() {
        const { search, branches } = this
        return branches.filter(b => (
            (search ? String(b.displayName).toLocaleLowerCase().includes(search.toLocaleLowerCase()) : true)
        ))
    }

    private get isQRUser () {
        return this.user.isQRUser
    }

    private selectBranch(b: BranchModel.Branch) {
        const mapUrl = b.directory
        if (StringUtils.isUrl(mapUrl)) {
            window.open(mapUrl, "_blank")
        } else {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่มีข้อมูลแผนผังศูนย์การค้า ", "No shopping center map information.")
            })
        }
    }
}
