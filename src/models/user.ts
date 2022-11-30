import { Branch } from "./branch"
import { EmployeePermission } from "./employee"
import { EmployeeServices } from "@/services"

export class User {
    /** UserId */
    id = ""

    /** bpNumber */
    customerNo = ""

    /** Email */
    email = ""

    /** FirstName */
    firstName = ""


    /** company_name */
    companyName = ""

    /** HashedPassword */
    hashedPassword = ""

    /** LastName */
    lastName = ""

    /** MobileNo */
    mobileNo = ""

    /** UserRole */
    role = ""

    /** ContractNumbers */
    contractNumbers = []

    /** Disable */
    disable = false

    /** PaymentToken */
    paymentToken = ""

    /** BranchList */
    branchList: Branch[] = []

    /** Privacy */
    privacy = false

    /** username */
    username = ""

    permissions: EmployeePermission[] = []

    cpntid = ""

    taxId = ""

    isAcceptTnC = false

    bpNumber = ""

    bpName = ""

    legal_form_code = ""

    image = ""

    // force logout
    forceLogout = false

    token = ""

    /** user_branch_ids */
    allowedBranchIds: number[] = []

    passwordExpireDate = ""

    wrongPasswordCount = 0

    get fullName() {
        return `${this.firstName || ""} ${this.lastName || ""}`.trim()
    }

    get isQRUser() {
        return this.role === "QR"
    }

    get isOwner() {
        return this.role.toLowerCase() === "owner"
    }

    get displayRole() {
        if (this.isOwner) return "Owner"
        if(this.isQRUser) return this.companyName
        const r = Object.values(EmployeeServices.ROLES).find($ => $.value === this.role)
        return r?.displayName || this.role
    }

}

export class Contact {
    /** NameContact */
    name = ""

    /** EmailContact */
    email = ""

    /** MobileContact */
    mobile = ""

    /** ContractNumber */
    contactNumber = ""

    /** ContractSaleType */
    contactSaleType = ""

    /** StartDate */
    startDate = ""

    /** EndDate */
    endDate = ""

    /** CurrentDate */
    currentDate = ""

    /** RentalObjectName */
    rentalName = ""

    /** IndustryName */
    industryName = ""

    /** ContractTypename */
    contactType = ""

    /** Branch */
    branch = ""

    /** BrachAddress */
    brachAddress = ""

    /** ShopName */
    shopName = ""

    /** CustomerName */
    customerName = ""

    /** dtEndDate */
    endDateTime = ""

    /** dateTotal */
    dateTotal = ""

    /** IsExpired */
    expired = true
}

export class UserCreator {
    /** id */
    id = 0

    /** first_name */
    firstName = ""

    /** last_name */
    lastName = ""

    /** created_at */
    createdAt = ""
}

export class UserUpdater {
    /** id */
    id = 0

    /** first_name */
    firstName = ""

    /** last_name */
    lastName = ""

    /** updated_at */
    updatedAt = ""
}

export class UserFavMenu {
    /** menu_id */
    id = ""

    /** menu_name */
    name = ""

    /** position */
    position = 0
}

export class StaffRegister {
    role = ""
    email = ""
    phone = ""
}

export class OwnerRegister {
    email = ""
    username = ""
    password = ""
    staffs: StaffRegister[] = []
}

export class AuthUser {

    /** Bearer token*/
    token = ""

    /** format: `YYYY-MM-DD HH:mm:ss` */
    expiredDate = ""
}

export class HistoryLogin {
    id = 0
    role = ""
    firstName = ""
    lastName = ""
    lastLogin = ""
}
