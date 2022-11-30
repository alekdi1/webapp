import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { DialogUtils, LanguageUtils } from "@/utils"
import { BranchService } from "@/services"
import { BranchModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import Name from "../../../page-names"

const getBranchOptions = () => ({
    head_office: (() => {
        const b = new ContactBranch()
        b.id = "head_office"
        b.nameTh = "ติดต่อสำนักงานใหญ่"
        b.nameEn = "Contact head office"
        b.image = require("@/assets/images/icons/head-office-branch.svg")
        return b
    })(),
    branch: (() => {
        const b = new ContactBranch()
        b.id = "branch"
        b.nameTh = "ติดต่อสาขา"
        b.nameEn = "Contact branch"
        b.image = require("@/assets/images/icons/branch.svg")
        return b
    })()
})

@Component({
    name: Name.select_branch
})
export default class SelectContactBranchPage extends Base {
    private selectedOption: ContactBranch | null = null
    private loading = true
    private branchForm = new SelectBranchView()
    private masterBranches: BranchModel.Branch[] = []

    private async mounted() {
        await this.getBranch()
    }

    private get branchOptions() {
        return getBranchOptions()
    }

    private optionClick(o: ContactBranch) {
        if (!this.isSelectedOption(o)) {
            this.selectedOption = o
        }

        if (o.id === getBranchOptions().branch.id) {
            // this.getBranch()
        } else {
            const head = this.masterBranches.find(b => b.code === BranchService.CENTER_BRANCH_CODE)

            if (head) {
                this.gotoForm(head)
            } else {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ไม่มีข้อมูลสาขาสำนักงานใหญ่", "No head office information")
                })
            }
        }
    }

    private isSelectedOption(o: ContactBranch) {
        return this.selectedOption?.id === o.id
    }

    private gotoForm(b: BranchModel.Branch) {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_contact_us_form,
            params: {
                branch_id: b.id
            },
            query: {
                branch_code: b.code
            }
        })
    }

    private selectBranch(b: BranchModel.Branch) {
        this.gotoForm(b)
    }

    private async getBranch() {
        this.loading = true
        try {
            const branches = await BranchService.getBranchAllNameList()
            this.masterBranches = branches;
            this.branchForm.allBranch = branches.filter((x: BranchModel.Branch) => x.code != "HOF")

            console.log("branches --> ", this.branchForm.branchList)
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Get branch error"
            })
        }
        this.loading = false
    }

    private get isSelectBranch() {
        return this.selectedOption?.id === getBranchOptions().branch.id
    }
}

class ContactBranch {
    id = ""
    nameTh = ""
    nameEn = ""
    image = ""

    get name() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

class SelectBranchView {
    allBranch: BranchModel.Branch[] = []
    search = ""

    get branchList() {
        return this.allBranch.filter(b =>
            !b.isHeadOffice &&
            (this.search ? b.displayName.search(this.search) > -1 : true)
        )
    }
}
