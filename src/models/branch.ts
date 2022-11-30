import { BranchService } from "@/services"
import { LanguageUtils } from "@/utils"

export class Branch {
    id = ""

    /** nameTH */
    nameTh = ""

    /** nameEN */
    nameEn = ""

    tenantId = ""

    /** branch_code */
    code = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }

    /** address */
    fullAddress = ""
    email = ""
    website = ""
    businessHoursStartTime = ""
    businessHoursEndTime = ""
    /** tel */
    phone = ""
    type = ""
    active = false
    mapUrl = ""

    /** directory */
    directory = ""

    /** file */
    file = ""

    /** information */
    information = ""

    /** office_hours */
    officeHours = ""

    get isHeadOffice() {
        return this.type === BranchService.BRANCH_TYPES.head_office
    }
}
