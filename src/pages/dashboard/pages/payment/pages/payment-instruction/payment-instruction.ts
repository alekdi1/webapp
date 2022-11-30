import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { BankServices as BS, PaymentMethodServices as PMS } from "@/services"
import PAGE_NAME from "../page-name"

import CounterCash from "../../views/instruction-counter-cash.vue"
import CounterCheque from "../../views/instruction-counter-cheque.vue"
// import ATMKBank from "../../views/instruction-atm-kbank.vue"
// import ATMSCB from "../../views/instruction-atm-scb.vue"
// import ATMKTB from "../../views/instruction-atm-ktb.vue"
// import ATMKMA from "../../views/instruction-atm-kma.vue"
// import ATMKIAT from "../../views/instruction-atm-kiat.vue"
// import ATMTMB from "../../views/instruction-atm-tmb.vue"
// import ATMTNB from "../../views/instruction-atm-tnb.vue"
// import ATMBBL from "../../views/instruction-atm-bbl.vue"
// import ATMGSB from "../../views/instruction-atm-gsb.vue"
// import ATMICBC from "../../views/instruction-atm-icbc.vue"
// import ATMMIZUHO from "../../views/instruction-atm-mizuho.vue"
import InternetBanking from "../../views/instruction-internet-banking.vue"
import WeChat from "../../views/instruction-wechat.vue"
import ScanQR from "../../views/instruction-scan-qr.vue"
import ThaiQR from "../../views/instruction-thai-qr.vue"
import ATMDEFAULT from "../../views/instruction-atm-default.vue"
import PushNoti from "../../views/instruction-push-noti.vue"
import ATM from "../../views/instruction-atm.vue"
import PROMPTPAY from  "../../views/instruction-promptpay.vue"

@Component({
    name: PAGE_NAME.instruction,
    components: {
        "instruction-counter-cash": CounterCash,
        "instruction-counter-cheque": CounterCheque,
        // "instruction-atm-kbank": ATMKBank,
        // "instruction-atm-scb": ATMSCB,
        // "instruction-atm-ktb": ATMKTB,
        // "instruction-atm-kma": ATMKMA,
        // "instruction-atm-kiat": ATMKIAT,
        // "instruction-atm-tmb": ATMTMB,
        // "instruction-atm-tnb": ATMTNB,
        // "instruction-atm-bbl": ATMBBL,
        // "instruction-atm-gsb": ATMGSB,
        // "instruction-atm-mizuho": ATMMIZUHO,
        // "instruction-atm-icbc": ATMICBC,
        "instruction-internet-banking": InternetBanking,
        "instruction-wechat": WeChat,
        "instruction-scan-qr": ScanQR,
        "instruction-thai-qr": ThaiQR,
        "instruction-atm-default": ATMDEFAULT,
        "instruction-atm": ATM,
        "instruction-push-noti": PushNoti,
        "instruction-promptpay": PROMPTPAY
    }
})
export default class PaymentInstructionPage extends Base {

    private get views() {
        const { pm, bank } = this.$route.query

        const isATM = pm === PMS.atm().id

        return {
            ATMKBank: isATM && bank === BS.Banks.KBANK().id,
            ATMSCB: isATM && bank === BS.Banks.SCB().id,
            ATMKTB: isATM && bank === BS.Banks.KTB().id,
            ATMKMA: isATM && bank === BS.Banks.KMA().id,
            // ATMTMB: isATM && bank === BS.Banks.TMB().id,
            // ATMTNB: isATM && bank === BS.Banks.TNB().id,
            ATMBBL: isATM && bank === BS.Banks.BBL().id,
            ATMKIAT: isATM && bank === BS.Banks.KIAT().id,
            ATMGSB: isATM && bank === BS.Banks.GSB().id,
            ATMMIZUHO: isATM && bank === BS.Banks.MIZUHO().id,
            ATMICBC: isATM && bank === BS.Banks.ICBC().id,
            ATMDEFAULT: isATM,
            WECHAT: pm === PMS.wechatpay().id,
            ALIPAY: pm === PMS.alipay().id,
            THAIQR: pm === PMS.ThaiQR().id,
            INTBANKING: pm === PMS.internetBanking().id,
            PROMPTPAY: pm === PMS.promptpay().id,

            BANK_COUNTER_CASH: pm === PMS.cash().id,
            BANK_COUNTER_CHEQUE: pm === PMS.cheque().id,
            SCAN_QR: pm === PMS.scanQR().id,
            PUSH_NOTI: pm === PMS.pushNotiKMA().id || pm === PMS.pushNotiKPlus().id,
            ATM: isATM
        }
    }
}
