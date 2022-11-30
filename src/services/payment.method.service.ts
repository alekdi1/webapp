import { PaymentModel } from "@/models"

export const atm = () => {
    const a = new PaymentModel.BankService()
    a.id = "ATM"
    a.channelCode = "C"
    a.channelName = ""
    a.methodNo = "3"
    a.nameEn = "ATM"
    a.nameTh = "ATM"
    a.images = [
        require("@/assets/images/payment/atm.png")
    ]
    return a
}

export const creditCard = () => {
    const a = new PaymentModel.BankService()
    a.id = "CREDIT_CARD"
    a.nameEn = "VISA/MasterCard/JCB"
    a.nameTh = "VISA/MasterCard/JCB"
    a.channelCode = "V"
    a.methodNo = "1"
    a.channelName = "CREDIT_CARD"
    a.Hidebankname = true
    a.images = [
        require("@/assets/images/payment/visa.png"),
        require("@/assets/images/payment/mastercard.png"),
        require("@/assets/images/payment/jcb.png")
    ]
    return a
}

export const cash = () => {
    const a = new PaymentModel.BankService()
    a.id = "CASH"
    a.nameEn = "CASH"
    a.nameTh = "เงินสด"
    a.channelCode = "C"
    a.methodNo = "3"
    a.channelName = "CASH"
    a.images = [
        require("@/assets/images/payment/counter-service.svg")
    ]
    return a
}

export const cheque = () => {
    const a = new PaymentModel.BankService()
    a.id = "CHEQUE"
    a.nameEn = "CHEQUE"
    a.nameTh = "เช็คเงินสด"
    a.channelCode = "Q"
    a.methodNo = "4"
    a.channelName = "CHEQUE"
    return a
}

export const alipay = () => {
    const p = new PaymentModel.BankService()
    p.id = "alipay"
    p.channelCode = "L"
    p.channelName = "ALIPAY"
    p.nameEn = "Alipay"
    p.nameTh = "Alipay"
    p.methodNo = "1"
    p.images = [
        require("@/assets/images/payment/alipay.png")
    ]
    return p
}

export const promptpay = () => {
    const p = new PaymentModel.BankService()
    p.id = "PROMPTPAY"
    p.channelCode = "R"
    p.channelName = "PROMPTPAY_NO"
    p.nameEn = "PROMPTPAY"
    p.nameTh = "ชำระผ่านเบอร์มือถือ"
    p.methodNo = "1"
    p.images = [
        require("@/assets/images/payment/promptpay.png")
    ]
    return p
}

export const internetBanking = () => {
    const b = new PaymentModel.BankService()
    b.id = "INTERNET_BANKING"
    b.channelCode = "C"
    b.nameEn = "Internet banking"
    b.nameTh = "อินเทอร์เน็ตแบงก์กิ้ง"
    b.methodNo = "3"
    b.images = [
        require("@/assets/images/payment/internet-banking.svg")
    ]
    return b
}

export const ThaiQR = () => {
    const b = new PaymentModel.BankService()
    b.id = "THAI_QR"
    b.channelCode = "T"
    b.channelName = "THAI_QR"
    b.nameEn = "THAI QR"
    b.nameTh = "THAI QR"
    b.methodNo = "1"
    return b
}

export const pushNotiKPlus = () => {
    const a = new PaymentModel.BankService()
    a.id = "KPLUS_NO"
    a.channelCode = "K"
    a.channelName = "KPLUS_NO"
    a.methodNo = "1"
    a.nameEn = "เบอร์มือถือที่ลงทะเบียนกับแอป K Plus"
    a.nameTh = "เบอร์มือถือที่ลงทะเบียนกับแอป K Plus"
    a.Hidebankname = true
    a.images = [
        require("@/assets/images/banks/kasikorn.jpg")
    ]
    return a
}

export const pushNotiKMA = () => {
    const a = new PaymentModel.BankService()
    a.id = "KMA_NO"
    a.channelCode = "A"
    a.channelName = "KMA_NO"
    a.methodNo = "1"
    a.nameEn = "เบอร์มือถือที่ลงทะเบียนกับแอป KMA"
    a.nameTh = "เบอร์มือถือที่ลงทะเบียนกับแอป KMA"
    a.Hidebankname = true
    a.images = [
        require("@/assets/images/banks/ayudhya.png")
    ]
    return a
}

export const wechatpay = () => {
    const w = new PaymentModel.BankService()
    w.id = "WECHAT_QR"
    w.channelCode = "W"
    w.nameEn = "WECHATPAY"
    w.nameTh = "WECHATPAY"
    w.channelName = "WECHAT_QR"
    w.methodNo = "1"
    w.images = [
        require("@/assets/images/payment/wechat.png")
    ]
    return w
}

export const unionpay = () => {
    const w = new PaymentModel.BankService()
    w.id = "UNIONPAY"
    w.channelCode = "U"
    w.nameEn = "UnionPay"
    w.nameTh = "UnionPay"
    w.channelName = "UNIONPAY"
    w.methodNo = "1"
    w.Hidebankname = true
    w.images = [
        require("@/assets/images/payment/unionpay.png")
    ]
    return w
}

export const scanQR = () => {
    const w = new PaymentModel.BankService()
    w.id = "SCAN_QR"
    w.channelCode = ""
    w.nameEn = "SCAN QR"
    w.nameTh = "SCAN QR"
    w.channelName = "SCAN_QR"
    w.methodNo = "1"
    return w
}
