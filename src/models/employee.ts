import { Store } from "./store"

class RefUser {
    id = 0
    firstname = ""
    lastname = ""
}

class UpdateRefUser extends RefUser {
    /** updated_at `2021-04-25T08:39:06.000000Z`*/
    updatedDate = ""
}

export class EmployeePermissionShop extends Store{}

export class EmployeePermission {
    permission = ""
    shops: EmployeePermissionShop[] = []
}

export class EmployeeBranch {
    code = ""
    name = ""
}

export class Employee {

    /** id */
    id = ""

    /** employee_branches */
    branches: EmployeeBranch[] = []

    /** last_login `2021-04-25 15:39:06` */
    lastLogin = ""

    /** bp_number */
    bpNumber = ""

    /** username */
    username = ""

    company = {
        /** company_name */
        name: ""
    }

    /** created_by */
    createdBy: any[] = []

    /** email */
    email = ""

    /** first_name */
    firstname = ""

    /** last_name */
    lastname = ""

    /** phone_number */
    phone = ""

    role = {
        /** role_name */
        name: ""
    }

    /** tax_id */
    taxId = ""

    /** permissions */
    permissions: EmployeePermission[] = []

    /** updated_by */
    updatedBy = new UpdateRefUser()

    get fullName () {
        return `${this.firstname || ""} ${this.lastname || ""}`.trim()
    }
}

export class RegisteredStaff {
    /** user_id */
    id = 0

    /** email */
    email: string | null = null

    /** phone_number */
    phone: string | null = null

    /** role */
    role = ""

    /** create_credential_link */
    url = ""
}

export class RegisteredInfo {
    /** owner_username */
    ownerName: string | null = null

    /** staffs */
    staffs: RegisteredStaff[] = []
}