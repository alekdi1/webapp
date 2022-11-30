// import { MaintainanceServices } from "@/services"
import { LanguageUtils } from "@/utils"
import { Branch } from "./branch"
// import { Maintainance } from "./maintainance"

export class RentalStatusInformation {
    /** status_type */
    type = ""

    /** status_name */
    name = ""

    /** date_time */
    dateTime = ""
}

export class RentalStore {


    nameTh = ""
    nameEn = ""
    branch = new Branch()

    /** id */
    id = ""

    /** contract_name */
    contractName = ""

    /** contract_number */
    contractNumber = ""

    /** branch_code */
    branchCode = ""

    /** branch_name */
    branchName = ""

    /** renew_status */
    status = ""

    /** request_refund */
    refund = 0

    /** start_date */
    start = ""

    /** end_date */
    end = ""

    /** status_information */
    info = new RentalStatusInformation()


    get displayName() {
        return LanguageUtils.lang(this.nameTh, this.nameEn)
    }

}

export class RefundProgress {
    /** status */
    status = false

    /** process_name */
    name = ""

    /** description */
    desc = ""
}

export class RentalDetail extends RentalStore {

    /** contract_number */
    contractNumber = ""

    /** contract_type_code */
    contractTypeCode = ""

    /** contract_type_name */
    contractTypeName = ""

    /** contract_address */
    contractAddress = ""

    /** category_code */
    catCode = ""

    /** industry_code */
    industryCode = ""

    /** industry_name */
    industryName = ""

    /** floor_room */
    floorRoom = ""

    /** bp_number */
    bpNo = ""

    /** business_entity_code */
    businessEntityCode = ""

    /** cof_number */
    cofNumber = ""

    /** price_per_month */
    pricePerMonth = ""

    /** price_per_sqm */
    pricePerSqm = ""

    /** cof_current_file */
    cofCurrentFile = ""

    /** cof_renew_file */
    cofRenewFile = ""

    /** cof_renew */
    cofRenew = ""

    /** refund_decoration */
    refundDecoration = ""

    /** refund_deposit */
    refundDeposit = ""

    /** refund_rental */
    refundRental = ""

    /** request_refund */
    requestRefund = 0

    /** request_refund_date */
    requestRefundDate = ""

    /** created_at */
    createdAt = ""

    /** updated_at */
    updatedAt = ""

    /** refund_progress */
    refundProgress: RefundProgress[] = []
}

export class Quotation {
    /** id */
    id = ""

    /** branch_code */
    branchCode = ""

    /** branch_name */
    branchName = ""

    /** cof_number */
    cofNumber = ""

    /** cof_name */
    cofName = ""

    /** bp_number */
    bpNo = ""

    /** contract_type_code */
    contractTypeCode = ""

    /** contract_type_name */
    contractTypeName = ""

    /** start_date */
    startDate = ""

    /** end_date */
    endDate = ""

    /** contract_address */
    contractAddress = ""

    /** business_entity_code */
    businessEntityCode = ""

    /** category_code */
    catCode = ""

    /** industry_code */
    industryCode = ""

    /** industry_name */
    industryName = ""

    /** rental_deposit */
    rentalDeposit = ""

    /** floor_room */
    floorRoom = ""

    /** price_per_month */
    pricePerMonth = ""

    /** price_per_sqm */
    pricePerSqm = ""

    /** sale_ad_user */
    saleAdUser = ""

    /** sale_ad_email */
    saleAdEmail = ""

    /** cof_created_date */
    cofCreatedDate = ""

    /** submitted_renew */
    submittedRenew = false

    /** submitted_renew_date */
    submittedRenewDate = ""

    /** drop_lead_contact */
    dropLeadContact = ""

    /** drop_lead_date */
    dropLeadDate = ""

    /** updated_at */
    updatedAt = ""

    /** cof_renew */
    cofRenew = ""

    /** cof_renew_file */
    cofRenewFile = ""

    status = ""
}
