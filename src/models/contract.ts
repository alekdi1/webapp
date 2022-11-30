import { Branch } from "./branch"

export class ContactUser {
    /** id */
    id = 0

    /** first_name */
    firstname = ""

    /** last_name */
    lastname = ""

    get fullName() {
        return `${ this.firstname || "" } ${ this.lastname || "" }`.trim()
    }
}

export class CreatedUser extends ContactUser {
    /** created_at
     * `2021-04-23 03:17:58` */
    createdDate = ""
}

export class ReplyUser extends ContactUser {
    /** reply_date
     * `2021-04-23 03:17:58` */
    repliedDate = ""
}

export class ContactDetail {

    /** id */
    id = 0

    /** branch_id */
    branchId = 0

    /** contact_email */
    contactEmail = ""

    /** contact_name */
    contactName = ""

    /** contact_phone */
    contactPhone = ""

    /** created_by */
    createdBy = new CreatedUser()

    /** description */
    description = ""

    /** images */
    images: string[] = []

    /** replied_by */
    repliedBy = new ReplyUser()

    /** reply_image */
    replyImage = ""

    /** reply_message */
    replyMessage = ""

    /** status */
    status = ""

    /** title */
    title = ""

    branch: Branch|null = null
}
