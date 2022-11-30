import { MaintainanceServices } from "@/services"
import { LanguageUtils } from "@/utils"
import { Branch } from "./branch"
import { Maintainance } from "./maintainance"

export class Store {
    id = ""
    nameTh = ""
    nameEn = ""
    branch = new Branch()
    number = ""
    industryCode = ""

    isBangkokBranch = false
    floorCode = ""

    /** floor_room */
    floorRoom = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}

export class MaintainanceStore {
    storeId = ""
    storeName = ""
    branchCode = ""
    branchTH = ""
    branchEN = ""
    maintenances: Maintainance[] = []
    brachNameMaster = ""

    get displayIdAsName() {
        return this.storeName ? this.storeName : this.storeId
    }

    get displayBranchName() {
        return LanguageUtils.lang(this.branchTH, this.branchEN)
    }

    get inCompleteMaintenances() {
        const mstatus = MaintainanceServices.MAINTENANCE_STATUS
        return this.maintenances.filter(m => [mstatus.pending, mstatus.inprogress].includes(m.status)).length
    }
}

export class Contract {
    id = ""
    nameTh = ""
    nameEn = ""
    branch = new Branch()
    contract_number = ""
    contract_name = ""
    floor_room = ""
    branch_code = ""
    branch_name = ""

    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }
}
