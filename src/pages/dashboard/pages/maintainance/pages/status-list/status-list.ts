import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { EmployeeServices, FileService, MaintainanceServices, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils, StorageUtils, StringUtils, TimeUtils } from "@/utils"
import { StoreModel, MaintainanceModel, BranchModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"
import axios from "axios"

@Component
export default class MaintainanceStatusListPage extends Base {
    @VuexServices.Root.VXBranches()
    private selectedBranchList!: BranchModel.Branch[]
    private branchList!: BranchModel.Branch[]
    private branchMaps = new Map<string, BranchModel.Branch>();
    private isLoading = false
    private isCanceling = false
    private cancelItem: MaintainanceModel.Maintainance | null = null
    private pendingMaintainances: MaintainanceModel.Maintainance[] = []
    private inProgressMaintainances: MaintainanceModel.Maintainance[] = []
    private successMaintainances: MaintainanceModel.Maintainance[] = []
    private tenantWithMaintainance: StoreModel.MaintainanceStore | null = null
    private statusType = 0
    private showdetail: MaintainanceModel.Maintainance | null = null

    private async mounted() {
        if (!this.selectedBranchList || this.selectedBranchList.length <= 0) {
            await this.getBranchList();
        } else {
            this.selectedBranchList.map(x => {
                this.branchMaps.set(x.code, x);
            })
        }

        await this.getMaintainaceByBPandTenant()
        if (this.$route.query.status === "success") {
            this.statusType = 2
        }
        console.log("branchMaps --> ", this.branchMaps)
    }

    private get isPendingEmpty() {
        return this.pendingMaintainances.length === 0 && this.statusType === 0
    }

    private get isInprogressEmpty() {
        return this.inProgressMaintainances.length === 0 && this.statusType === 1
    }

    private get isSuccessEmpty() {
        return this.successMaintainances.length === 0 && this.statusType === 2
    }

    private get emptyStatus() {
        switch (this.statusType) {
            case 0: return this.text.empty_pending
            case 1: return this.text.empty_in_progress
            case 2: return this.text.empty_success
            default: return this.text.empty_pending
        }
    }

    private get bpNo() {
        return this.user.customerNo || String(this.$route.query.bpNo || "")
    }

    private get tenantNo() {
        return String(this.$route.query.tenantNo || "") || StorageUtils.getItem("QR_TENANT_NO")
    }

    private get tenantName() {
        return this.tenantWithMaintainance ? this.tenantWithMaintainance.displayIdAsName : ""
    }

    private get branchName() {
        return this.tenantWithMaintainance ? this.tenantWithMaintainance.displayBranchName : ""
    }

    private async getMaintainaceByBPandTenant() {
        this.isLoading = true
        try {
            const tenantsWithMaintainances = await MaintainanceServices.getStoreListByBP("", this.tenantNo)
            const tenantWithMaintainance = tenantsWithMaintainances.find(i => i.storeId === this.tenantNo) || null
            this.tenantWithMaintainance = tenantWithMaintainance
            if (tenantWithMaintainance) {
                this.separateMaintainancesByType(tenantWithMaintainance.maintenances)
            }
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private sortingMaintainance(maintainaces: MaintainanceModel.Maintainance[]) {
        return maintainaces.sort((a, b) => moment(b.createDate).diff(moment(a.createDate)))
    }

    private groupSuccessMaintainance(cancelMaintainances: MaintainanceModel.Maintainance[], successMaintainances: MaintainanceModel.Maintainance[]) {
        const maintainances: MaintainanceModel.Maintainance[] = []
        const notYetSurvey: MaintainanceModel.Maintainance[] = []
        const doneSurvey: MaintainanceModel.Maintainance[] = []

        // Separate done and not done survey
        for (const m of successMaintainances) {
            if (!m.survey.status) {
                notYetSurvey.push(m)
            } else {
                doneSurvey.push(m)
            }
        }

        maintainances.push(...this.sortingMaintainance(notYetSurvey), ...this.sortingMaintainance(doneSurvey), ...this.sortingMaintainance(cancelMaintainances))
        return maintainances
    }

    private separateMaintainancesByType(maintainances: MaintainanceModel.Maintainance[]) {
        const pending: MaintainanceModel.Maintainance[] = []
        const inProgress: MaintainanceModel.Maintainance[] = []
        const success: MaintainanceModel.Maintainance[] = []
        const cancel: MaintainanceModel.Maintainance[] = []

        const status = MaintainanceServices.MAINTENANCE_STATUS
        for (const m of maintainances) {
            if (m.status === status.pending) {
                pending.push(m)
            } else if (m.status === status.inprogress) {
                inProgress.push(m)
            } else if (m.status === status.complete) {
                success.push(m)
            } else if (m.status === status.cancel) {
                cancel.push(m)
            }
        }
        this.pendingMaintainances = this.sortingMaintainance(pending)
        this.inProgressMaintainances = this.sortingMaintainance(inProgress)
        this.successMaintainances = this.groupSuccessMaintainance(cancel, success)
    }

    private displayMaintainanceTitle(maintainace: MaintainanceModel.Maintainance) {
        return maintainace.typeName === "อื่นๆ" ? maintainace.typeOther : maintainace.typeName
    }

    private async cancelMaintainance(maintainace: MaintainanceModel.Maintainance) {
        this.isCanceling = true
        this.cancelItem = maintainace
        try {
            await MaintainanceServices.cancelMaintainance({
                maintainanceId: maintainace.maintainanceId,
                userId: this.user.id,
                tenantId: this.tenantNo
            })
            this.getMaintainaceByBPandTenant()
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: `Cannot cancel with error: ${e}`
            })
        }
        this.cancelItem = null
        this.isCanceling = false
    }

    private isCancel(maintainace: MaintainanceModel.Maintainance) {
        return maintainace.status === MaintainanceServices.MAINTENANCE_STATUS.cancel
    }

    private displayName(name: string) {
        return name ? name : "-"
    }

    private displayPhoneNumber(phone: string) {
        return phone ? phone : "-"
    }

    private displaySurveyText(survey: MaintainanceModel.Survey) {
        if (!survey.score) return "-"

        const score = Math.round(survey.score)
        switch (score) {
            case 1: return LanguageUtils.lang("ควรปรับปรุง", "Extremely Unsatisfied")
            case 2: return LanguageUtils.lang("เฉยๆ", "Unsatisfied")
            case 3: return LanguageUtils.lang("พอใช้", "Neutral")
            case 4: return LanguageUtils.lang("ดี", "Satisfied")
            case 5: return LanguageUtils.lang("ดีมาก", "Extremely Satisfied")
            default: return LanguageUtils.lang("ควรปรับปรุง", "Extremely Unsatisfied")
        }
    }

    private displayDateTime(time: string) {
        if (!time) return "-"
        const convert = moment(time, "YYYY-MM-DDTHH:mm")
        if (!convert.isValid()) return "Invalid date"
        const dateFormat = TimeUtils.convertToLocalDateFormat(convert)
        const timeFormat = TimeUtils.convertToLocalTimeFormat(convert)
        return dateFormat + " " + timeFormat
    }

    private goToMaintainanceRequestForm() {
        this.$router.replace({
            name: ROUTER_NAMES.maintainance_repair_form,
            query: {
                bpNo: this.bpNo,
                tenantNo: this.tenantNo
            }
        })
    }

    private async goToRateSurvey(maintainace: MaintainanceModel.Maintainance) {
        maintainace.tenantCode = this.tenantNo
        if (maintainace.tenantId) {
            await VuexServices.Root.setMaintainanceItem(maintainace)
            this.$router.replace({
                name: ROUTER_NAMES.maintainance_survey,
                query: {
                    tenantId: maintainace.tenantId + "",
                    mrId: maintainace.maintainanceId + ""
                }
            })
            return
        }

        DialogUtils.showErrorDialog({ text: LanguageUtils.lang("ไม่มีเลข Tenant ID", "No Tenant ID") })
    }

    private async selectShowDetail(request: MaintainanceModel.Maintainance) {
        this.showdetail = request
        console.log("selectShowDetail ", request);
    }

    private getImage(imageUrl: string) {
        if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
            return imageUrl
        }
        return require("@/assets/images/cpn-placeholder.jpg")
    }

    private toDataUrl(url: string) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    private displayDate(time: string) {
        if (!time) {
            return "-"
        }
        const convert = moment(time, "YYYY-MM-DD")
        if (!convert.isValid()) {
            return "-"
        }
        const dateFormat = TimeUtils.convertToLocalDateFormat(convert)
        return dateFormat
    }

    private async getBranchList() {
        let branches = [...this.user.branchList];
        if (!this.user.isOwner && this.user.role !== 'QR') {
            const permission = this.user.permissions.find(
                p => p.permission === EmployeeServices.PERMISSIONS.maintenance
            );
            if (!permission) {
                throw new Error(
                    LanguageUtils.lang(
                        "คุณไม่มีสิทธิ์เข้าใช้งาน",
                        "You have no permission to use this feature"
                    )
                );
            }

            const mapBranch: { [x: string]: BranchModel.Branch } = {};
            for (const shop of permission.shops) {
                const code = shop.branch.code;
                if (code) {
                    let b = mapBranch[code];
                    if (!b) {
                        b = branches.find(ub => ub.code === code) || shop.branch;
                        mapBranch[code] = b;
                    }
                }
            }

            branches = Object.values(mapBranch);
        }
        this.branchList = branches;
        this.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
        VuexServices.Root.setBranches(this.branchList);
    }

    private displayMasterBranch(branchCode: string) {
        let code = "";
        if (branchCode === "PK1") {
            code = "PKT";
        } else if (branchCode === "PKT") {
            code = "PK2";
        } else {
            code = branchCode;
        }
        const branch = this.branchMaps.has(code) ? this.branchMaps.get(code) : null;
        if (branch) {
            return LanguageUtils.lang("สาขา" + branch.nameTh, branch.nameEn + " branch");
        }
        return "";
    }

    private get text() {
        return {
            pending: this.$t("pages.maintainace_status_list.pending").toString(),
            in_progress: this.$t("pages.maintainace_status_list.in_progress").toString(),
            success: this.$t("pages.maintainace_status_list.success").toString(),
            cancel: this.$t("pages.maintainace_status_list.cancel").toString(),
            technician: this.$t("pages.maintainace_status_list.technician").toString(),
            informant: this.$t("pages.maintainace_status_list.informant").toString(),
            empty_pending: this.$t("pages.maintainace_status_list.empty_pending").toString(),
            empty_in_progress: this.$t("pages.maintainace_status_list.empty_in_progress").toString(),
            empty_success: this.$t("pages.maintainace_status_list.empty_success").toString(),
            request_maintainace: this.$t("pages.maintainace_status_list.request_maintainace").toString(),
            detail: this.$t("pages.maintainace_status_list.detail").toString(),
            do_survey: this.$t("pages.maintainace_status_list.do_survey").toString(),
            finish_maintainance: this.$t("pages.maintainace_status_list.finish_maintainance").toString(),
            result: this.$t("pages.maintainace_status_list.result").toString()
        }
    }
}
