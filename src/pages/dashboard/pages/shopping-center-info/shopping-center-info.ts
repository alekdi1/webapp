import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { DialogUtils, LanguageUtils } from "@/utils"
import { BranchModel } from "@/models"
import Name from "../page-names"
import { BranchService } from "@/services"

const t = (k: string) => LanguageUtils.i18n.t("pages.shopping_center." + k).toString()

@Component({
    name: Name.shopping_center_info
})
export default class ShoppingCenterInfoPage extends Base {

    private loading = false
    private search = ""
    private error = ""
    private branch?: BranchModel.Branch|null = null
    private tabs = new Tabs()
    private downloading = false

    private get text() {
        return {
            page_title: t("title_info"),
            search_branch: this.$t("search_branch").toString(),
            general_info: t("general_info"),
            shopping_center_regulations: t("shopping_center_regulations"),
            download: LanguageUtils.lang("ดาวน์โหลด", "Download")
        }
    }

    private get branchId() {
        return this.$route.params.branch_id || ""
    }
    
    private async getDatas() {
        this.loading = true
        try {
            let { branch } = this
            if (!branch) {
                branch = await BranchService.getBranchById(this.branchId)
            }
            this.branch = branch
        } catch (e) {
            console.log("Get data error ", e.message)
            this.error = e.message || LanguageUtils.lang("ไม่สามารถโหลดข้อมูลได้", "Error while loading data")
        }
        this.loading = !true
    }

    private get branchName() {
        return this.branch?.displayName || ""
    }

    private mounted() {
        this.getDatas()
    }

    private get errorBranchNotFound() {
        return LanguageUtils.lang(
            `ไม่พบข้อมูลสาขา '${ this.branchId }'`,
            `Branch data '${ this.branchId }' not found`)
    }

    private get generalInfos() {
        const { branch } = this
        return [
            {
                label: "เวลาทำการ",
                value: branch?.officeHours || "-"
            },
            {
                label: "เบอร์โทรศัพท์ติดต่อ",
                value: branch?.phone || "-"
            },
            {
                label: "ที่อยู่",
                value: branch?.fullAddress || "-"
            }
        ]
    }

    private get regulations() {
        return [
            {
                title: "",
                content: this.branch?.information || ""
            }
        ]
    }

    private async download() {
        this.downloading = true
        try {
            const file = this.branch?.file
            if (!file) {
                this.downloading = !true
                return DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ไม่มีไฟล์", "No file to download")
                })
            }
            
            window.open(file, "_blank")
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ดาวน์โหลดไม่สำเร็จ", "Download error")
            })
        }
        this.downloading = !true
    }

    private get isQRUser () {
        return this.user.isQRUser
    }
}

class Tabs {
    tab = 0
    get tabs() {
        return [
            t("general_info"),
            t("shopping_center_regulations")
        ]
    }
}