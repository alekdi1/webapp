import { StoreModel } from "."

export class Coupon {
    couponCode = ""
    shopId = ""
    branchCode = ""
    floorRoom = ""
    isShopVerification = false
    store = new StoreModel.Store() || null
    couponId = ""
    isvalid = false
    shopNumber = ""
    error_message = ""
    couponOwner = ""
    endDate = ""
    imgUrl = ""
    startDate = ""
    title = ""
    usageInfo = ""
    displayTextDate = ""
    isMinimumExpense = false
    toc = ""
    branchName = ""
    minimumExpense = 0
}


