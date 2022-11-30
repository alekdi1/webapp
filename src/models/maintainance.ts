import { LanguageUtils } from "@/utils"

export class Survey {
    /** status */
    status = false

    /** createDate */
    createDate = ""

    /** is_req_survey */
    isRequired = 0

    /** score */
    score = 0
}

export class MaintainanceTime {
    /** requestTime */
    requestTime = ""

    /** startDate */
    startDate = ""

    /** endDate */
    endDate = ""
}

export class MaintainanceResponse {
    /** name */
    name = ""

    /** contactNumber */
    contactNumber = ""

    /** responseMessage */
    message = ""
}

export class Maintainance {
    /** mrId */
    maintainanceId = 0

    /** mrNo */
    maintainanceNo = ""

    /** tenantId */
    tenantId: number|null = null

    /** Only use after maintenance survey e.g. CTW01010101 */
    tenantCode = ""

    /** requestBy */
    contactName =  ""

    /** contactNumber */
    phoneNumber = ""

    /** survey */
    survey = new Survey()

    /** description */
    desc = ""

    /** createDate */
    createDate = ""

    /** time */
    time = new MaintainanceTime()


    /** typeId */
    typeId = 0

    /** typeName */
    typeName = ""

    /** typeOther */
    typeOther = ""

    /** typeGroupId */
    typeGroupId = 0

    /** typeGroupName */
    typeGroupName = ""

    /** attachments */
    imageUrls: string[] = []

    /** status
     * Pending
     * InProcress <-- Wrong spelling from API
     * Complete
     * Cancel
     */
    status = ""

    /** responseBy */
    responseBy = new MaintainanceResponse()

    /** updateDate */
    updateDate = ""

    /** updateBy */
    updateBy = ""
}

export class MaintenanceTenant {
    /** tenantId */
    tenantId = ""

    /** tenantName */
    tenantName = ""

    /** branchCode */
    branchCode = ""

    /** branchNameTH */
    branchNameTh = ""

    /** branchNameENG */
    branchNameEn = ""

    /** maintenances */
    maintenances = []

    get displayBranchName () {
        return LanguageUtils.lang(this.branchNameTh, this.branchNameEn)
    }
}

export class MaintenanceByTenantId {
    /** bPName */
    bpName = ""

    /** bpNumber */
    bpNo = ""

    /** data */
    tenants: MaintenanceTenant[] = []
}

