import { PaymentModel } from "@/models"
import { LanguageUtils } from "@/utils"
import {
    pushNotiKMA,
    promptpay,
    cheque,
    cash,
    creditCard,
    atm,
    internetBanking,
    unionpay,
    wechatpay,
    ThaiQR,
    pushNotiKPlus
} from "./payment.method.service"

const instructionTitleBarcode = () => LanguageUtils.lang("ชำระผ่าน Barcode", "Pay via Barcode")

export const Banks = Object.freeze({
    KBANK: () => {
        const b = new PaymentModel.Bank()
        b.id = "KBANK"
        b.nameEn = "Kasikorn Bank"
        b.url = "https://online.kasikornbankgroup.com/K-Online/"
        b.nameTh = "ธนาคารกสิกรไทย"
        b.image = require("@/assets/images/banks/kasikorn.jpg")
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            bank_app: (() => {
                const a = new PaymentModel.BankService()
                a.id = "KPLUS_APP"
                a.channelCode = "K"
                a.channelName = "KPLUS_APP"
                a.methodNo = "1"
                a.nameEn = "KPLUS"
                a.nameTh = "KPLUS"
                a.images = [
                    require("@/assets/images/banks/kasikorn.jpg")
                ]
                return a
            })(),
            credit_card: creditCard(),
            cash: cash(),
            cheque: cheque(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            push_noti: pushNotiKPlus(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }
        
        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก “Barcode Payment”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน",
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    KIAT: () => {
        const b = new PaymentModel.Bank()
        b.id = "KIAT"
        b.nameEn = "Kiatnakin Bank"
        b.nameTh = "ธนาคารเกียรตินาคิน"
        b.image = require("@/assets/images/banks/kiatnakin.png")
        b.url = "https://ebanking.kkpfg.com/ebanking/#/"
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            credit_card: creditCard(),
            cash: cash(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    // TNB: () => {
    //     const b = new PaymentModel.Bank()
    //     b.url = "https://retailib.thanachartbank.co.th/retail/Login.do?action=form&lang=th_TH"
    //     b.id = "TNB"
    //     b.nameEn = "Thanachart Bank"
    //     b.nameTh = "ธนาคารธนชาต"
    //     b.image = require("@/assets/images/banks/thanachat.png")
    //     b.services = {
    //         thai_qr: ThaiQR(),
    //         atm: atm(),
    //         credit_card: creditCard(),
    //         cash: cash(),
    //         promptpay: promptpay(),
    //         internet_banking: internetBanking(),
    //         wechatpay: wechatpay(),
    //         unionpay: unionpay()
    //     }

    //     const barcodeInstruction = new PaymentModel.BankInstruction()
    //     barcodeInstruction.title = instructionTitleBarcode()
    //     barcodeInstruction.steps = [
    //         "ดาวน์โหลด Bill payment",
    //         "ทำธุรกรรมผ่านตู้ ATM",
    //         "เลือก \"บริการอื่นๆ\"",
    //         "เลือก \"จ่ายบิล/ชำระเงิน\"",
    //         "เลือก “ชำระด้วยบาร์โค้ด”",
    //         "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
    //         "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
    //         "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
    //         "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
    //     ]

    //     b.instructions.push(barcodeInstruction)
    //     b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ CPN Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

    //     return b
    // },

    KMA: () => {
        const b = new PaymentModel.Bank()
        b.id = "KMA"
        b.nameEn = "Krungsri Bank"
        b.nameTh = "ธนาคารกรุงศรีอยุธยา"
        b.url = "https://www.krungsrionline.com/BAY.KOL.WebSite/Common/Login.aspx"
        b.image = require("@/assets/images/banks/ayudhya.png"),
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            bank_app: (() => {
                const a = new PaymentModel.BankService()
                a.id = "KMA_APP"
                a.channelCode = "A"
                a.channelName = "KMA_APP"
                a.methodNo = "1"
                a.nameEn = "KMA"
                a.nameTh = "KMA"
                a.images = [
                    require("@/assets/images/banks/ayudhya.png")
                ]
                return a
            })(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            push_noti: pushNotiKMA(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการท ารายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2 )หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    BBL: () => {
        const b = new PaymentModel.Bank()
        b.id = "BBL"
        b.nameEn = "Bangkok Bank"
        b.nameTh = "ธนาคารกรุงเทพ"
        b.url = "https://ibanking.bangkokbank.com/SignOn.aspx"
        b.image = require("@/assets/images/banks/bangkok.png"),
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"ชำระเงิน/บริการ\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการท ารายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2 )หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    KTB: () => {
        const b = new PaymentModel.Bank()
        b.id = "KTB"
        b.nameEn = "Krungthai Bank"
        b.nameTh = "ธนาคารกรุงไทย"
        b.image = require("@/assets/images/banks/krungthai.png")
        b.url = "https://www.ktbnetbank.com/consumer/"
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    SCB: () => {
        const b = new PaymentModel.Bank()
        b.id = "SCB"
        b.nameEn = "Siam Commercial Bank"
        b.nameTh = "ธนาคารไทยพาณิชย์"
        b.image = require("@/assets/images/banks/scb.jpg")
        b.url = "https://www.scbeasy.com/v1.4/site/presignon/index.asp"
        b.services = {
            thai_qr: ThaiQR(),
            atm: atm(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"ชำระเงิน/บริการ\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการท ารายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2 )หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    TTB: () => {
        const b = new PaymentModel.Bank()
        b.id = "TTB"
        b.nameEn = "TMBThanachart"
        b.nameTh = "ธนาคารทหารไทยธนชาต"
        b.image = require("@/assets/images/banks/TTB.png")
        b.services = {
            thai_qr: ThaiQR(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay(),
            atm: atm()
        }
        b.url = "https://www.ttbbank.com/th"

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
            "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."
        
        return b
    },

    UOB: () => {
        const b = new PaymentModel.Bank()
        b.id = "UOB"
        b.url = "https://pib.uobthailand.com/PIBLogin/Public/processPreCapture.do?keyId=lpc"
        b.nameEn = "UOB Bank"
        b.nameTh = "ธนาคารยูโอบี"
        b.image = require("@/assets/images/banks/uob.png")
        b.services = {
            thai_qr: ThaiQR(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"ชำระเงิน/บริการ\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการท ารายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2 )หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    GSB: () => {
        const b = new PaymentModel.Bank()
        b.id = "GSB"
        b.nameEn = "Government Savings Bank"
        b.nameTh = "ธนาคารออมสิน"
        b.url = "https://ib.gsb.or.th/retail/security/commonLogin.jsp"
        b.image = require("@/assets/images/banks/oomsin.png")
        b.services = {
            thai_qr: ThaiQR(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    ICBC: () => {
        const b = new PaymentModel.Bank()
        b.id = "ICBC"
        b.nameEn = "Industrial and Commercial Bank of China"
        b.nameTh = "ธนาคาร ICBC"
        b.image = require("@/assets/images/banks/icbc.png")
        b.url = "https://corpebank.icbc.com.cn/icbc/corporbank/index.jsp?areaCode=0165&dse_locale=th-TH"
        b.services = {
            thai_qr: ThaiQR(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    MIZUHO: () => {
        const b = new PaymentModel.Bank()
        b.id = "MIZUHO"
        b.nameEn = "MIZUHO Bank"
        b.nameTh = "ธนาคาร MIZUHO"
        b.image = require("@/assets/images/banks/mizuho.png")
        b.url = "https://web.ib.mizuhobank.co.jp/servlet/LOGBNK0000000B.do"
        b.services = {
            thai_qr: ThaiQR(),
            credit_card: creditCard(),
            promptpay: promptpay(),
            internet_banking: internetBanking(),
            wechatpay: wechatpay(),
            unionpay: unionpay()
        }

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    },

    // CENPAY: () => {
    //     const b = new PaymentModel.Bank()
    //     b.id = "CENPAY"
    //     b.nameEn = "CenPay"
    //     b.nameTh = "CenPay"
    //     b.image = require("@/assets/images/banks/cenpay.jpg")
    //     b.services = {}

    //     const barcodeInstruction = new PaymentModel.BankInstruction()
    //     barcodeInstruction.title = instructionTitleBarcode()
    //     barcodeInstruction.steps = [
    //         "ดาวน์โหลด Bill payment",
    //         "ทำธุรกรรมผ่านตู้ ATM",
    //         "เลือก \"บริการอื่นๆ\"",
    //         "เลือก \"จ่ายบิล/ชำระเงิน\"",
    //         "เลือก “ชำระด้วยบาร์โค้ด”",
    //         "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
    //         "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
    //         "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
    //     ]

    //     b.instructions.push(barcodeInstruction)
    //     b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

    //     return b
    // },

    CIMB: () => {
        const b = new PaymentModel.Bank()
        b.id = "CIMB"
        b.nameEn = "CIMB Bank"
        b.nameTh = "ธนาคาร CIMB"
        b.image = require("@/assets/images/banks/cimb.png")
        b.services = {
            atm: atm()
        }
        b.url = "https://www.cimbthai.com/th/personal/index.html"

        const barcodeInstruction = new PaymentModel.BankInstruction()
        barcodeInstruction.title = instructionTitleBarcode()
        barcodeInstruction.steps = [
            "ดาวน์โหลด Bill payment",
            "ทำธุรกรรมผ่านตู้ ATM",
            "เลือก \"บริการอื่นๆ\"",
            "เลือก \"จ่ายบิล/ชำระเงิน\"",
            "เลือก “ชำระด้วยบาร์โค้ด”",
            "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
            "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID (Ref2) หมายเลขอ้างอิงชำระเงิน",
            "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ"
        ]

        b.instructions.push(barcodeInstruction)
        b.instructionNote = "ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3 – 5 วันทำการ."

        return b
    }
})

export async function getBanks() {
    return Object.values(Banks).map(f => f())
}

export async function getBankById(bid: string) {
    return (await (getBanks())).find(b => b.id === bid) || null
}
