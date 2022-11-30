import { Component } from "vue-property-decorator"
import Base from "../footer-base"
import { InvoiceServices, LogServices, PaymentMethodServices, PaymentServices, StoreServices, VuexServices } from "@/services"
import { InvoiceModel, PaymentModel, UserModel } from "@/models"
import numeral from "numeral"
import moment from "moment"
import { ROUTER_NAMES } from "@/router"
import { InvoiceItem } from "@/pages/dashboard/models"
import { DialogUtils, FileUtils, LanguageUtils, StorageUtils, ValidateUtils } from "@/utils"
import { Parser } from "json2csv"
import cryptoJs from "crypto-js"
import { Endpoints } from "@/config"
import { compile } from "vue/types/umd"
import { EmailReceipt } from "@/models/payment"

const displayPrice = (n: number) => numeral(n).format("0,0.00")

const getWindow = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}

@Component({
    name: "cpn-dbs-payment-footer"
})
export default class DashboardPaymentFooter extends Base {
    @VuexServices.Payment.VXSelectedInvoices()
    private invoices!: InvoiceModel.Invoice[]

    @VuexServices.Payment.VXPushNoti()
    private pushNoti!: { loading: boolean, phone: string }

    @VuexServices.Payment.VXPromptpayState()
    private promptpayState!: PaymentModel.PromptpayState | null

    @VuexServices.Root.VXUser()
    private user!: UserModel.User

    @VuexServices.Payment.VXPaymentMethod()
    private paymentMethod!: PaymentModel.PaymentMethod | null

    @VuexServices.Root.VXFullScreenLoading()
    private fsLoading!: boolean

    @VuexServices.Payment.VXSelectReceiptType()
    private selectTypeReceipt!: PaymentModel.SelectTypeReceipt | null

    private window = getWindow()
    private exporting = ""
    private dialog = false
    private userNo = ""
    private receiptPayment: any = null;

    private orderRefResult = {
        ref: "",
        orderDate: "",
        items: ((): any[] => [])()
    }

    private async mounted() {
        this.userNo = this.user.companyName
        const bpNumber = this.user.customerNo
        if (
            this.invoices.length === 0 &&
            this.$route.name !== ROUTER_NAMES.payment_invoice_list &&
            this.$route.name !== ROUTER_NAMES.payment_result
        ) {
            return this.$router.replace({
                name: ROUTER_NAMES.payment_invoice_list
            })
        }

        this.calculateLayout()
        window.addEventListener("resize", this.calculateLayout)

    }

    private beforeDestroy() {
        window.removeEventListener("resize", this.calculateLayout)
    }

    private get totalPrice() {
        const total = this.filteredItems.reduce((sum, inv) => sum + inv.selectedPrice, 0)
        return PaymentServices.calculatePaymentItemPriceWidthMethod(total, this.paymentMethod?.service)
    }

    private get totalPriceBeforeFee() {
        return this.filteredItems.reduce((sum, inv) => sum + inv.selectedPrice, 0)
    }

    private get totalFee() {
        return PaymentServices.calculatePriceFee(this.totalPriceBeforeFee, this.paymentMethod?.service).amount
    }

    private get displayTotalFee() {
        return displayPrice(this.totalFee)
    }

    private get displayTotalPriceBeforeFee() {
        return displayPrice(this.totalPriceBeforeFee)
    }

    private get displayTotalPrice() {
        return displayPrice(this.totalPrice)
    }

    private get isEmpty() {
        return this.filteredItems.length === 0
    }

    private showInvoiceListDialog() {
        this.dialog = !this.dialog
    }

    private get items() {
        return this.invoices.map(v => new InvoiceItem(v))
    }

    private get filteredItems() {
        return this.items.filter(i => !i.isPartial)
    }

    private calculateLayout() {
        this.window = getWindow()
    }

    private get dialogContentHeight() {
        return this.window.height - 320
    }

    private get text() {
        return {
            continue: this.$t("continue").toString(),
            baht: this.$t("baht").toString(),
            total_payment: this.$t("total_payment").toString(),
            branch: this.$t("branch").toString(),
            fee: LanguageUtils.lang("ค่าบริการ", "Service charge"),
            all_payment_items: this.$t("pages.payment.all_payment_items").toString(),
            duedate: this.$t("invoice.duedate").toString(),
            payment: this.$t("pages.payment.payment").toString(),
            confirm_payment: this.$t("pages.payment.confirm_payment").toString(),
            // tt_download_pdf: LanguageUtils.lang(
            //     "กรุณาใส่ Tax ID หรือ<br/>เลขบัตรประชาชนเพื่อเข้าถึงไฟล์",
            //     "Please input Tax ID or<br/>Citizen id to access file"
            // ),
            tt_download_pdf: LanguageUtils.lang(
                "กรุณาใส่ Tax ID หรือ<br/>เลขบัตรประชาชน<br/>เพื่อดาวน์โหลดใบแจ้งหนี้ฉบับเต็ม",
                "Please input Tax ID or<br/>Citizen id <br/>to download the full invoice."
            ),
            tt_export_file: LanguageUtils.lang(
                "ดาวน์โหลดข้อมูลใบแจ้งหนี้<br/>ตามรายการที่ท่านเลือก",
                "Download the invoice information<br/> according to the item you selected."
            ),
            payment_method: LanguageUtils.lang("ช่องทางชำระ", "Payment method"),
            payment_before_fee: LanguageUtils.lang("ยอดชำระ", "Payment")
        }
    }

    private get process() {
        switch (this.$route.name) {
            case ROUTER_NAMES.payment_invoice_list: return "invoice_list"
            case ROUTER_NAMES.payment_confirm_payment: return "confirm_payment"
            case ROUTER_NAMES.payment_select_payment_method: return "select_payment_method"
            case ROUTER_NAMES.payment_push_noti: return "payment_push_noti"
            case ROUTER_NAMES.payment_promptpay: return "payment_promptpay"
            default: return ""
        }
    }

    private async nextClick() {

        const itms = this.invoices.map(v => new InvoiceItem(v)) || []
        const sumInvoices = itms.filter(i => !i.isPartial).reduce((total, inv) => total + inv.selectedPrice, 0)
        if (sumInvoices == 0) {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากยอดที่ต้องชำระเท่ากับ 0 บาท กรุณาติดต่อเจ้าหน้าที่ 02-021-9999", "")
            });
            return;
        } else if (sumInvoices < 0) {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากส่วนลดเกินยอดที่ต้องชำระ", "")
            });
            return;
        } else {
            switch (this.$route.name) {
                case ROUTER_NAMES.payment_invoice_list: return this.$router.push({
                    name: ROUTER_NAMES.payment_confirm_payment,
                    query: {
                        invoices: this.invoices.map(v => v.id)
                    }
                })

                case ROUTER_NAMES.payment_confirm_payment: {
                    return this.$router.replace({
                        name: ROUTER_NAMES.payment_select_payment_method,
                        query: {
                            invoices: this.invoices.map(v => v.id)
                        }
                    })
                }

                case ROUTER_NAMES.payment_select_payment_method: return this.$router.replace({
                    name: ROUTER_NAMES.payment_result,
                    query: {
                        invoices: this.invoices.map(v => v.id)
                    }
                })
            }
        }
    }

    private async makePayment() {
        const clearSelectedItems = () => VuexServices.Payment.setSelectedInvoices([])
        const { invoices, paymentMethod, user } = this
        

        if (!this.selectTypeReceipt?.branch && !this.selectTypeReceipt?.email && this.selectTypeReceipt?.isChooseOnlinePayment) {
            DialogUtils.showErrorDialog({
                title: LanguageUtils.lang("กรุณาเลือกช่องทางรับใบเสร็จ", ""),
                text: LanguageUtils.lang("คุณสามารถเลือกรับใบเสร็จได้หลายช่องทางที่คุณสะดวก", "")
            })
            return;
        } else if (this.selectTypeReceipt?.email && !this.selectTypeReceipt?.ishasReceiptemail) {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("กรุณาสมัครช่องทางรับใบเสร็จทางอีเมล", "")
            })
            return;
        }

        try {
            if (!paymentMethod) {
                throw new Error("No payment method")
            }

            if (!paymentMethod.branch && this.selectTypeReceipt?.branch) {
                

                await VuexServices.Root.setFullScreenLoading(!1)
                await DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("กรุณาเลือกสาขาที่ต้องการรับใบเสร็จ", "Please select a branch to receive a receipt.")
                })

                const select = document.getElementById("select-branch-input")
                select?.scrollIntoView()
                select?.focus()
                return
            }

            if (this.selectTypeReceipt && this.selectTypeReceipt?.email) {
                
                try {
                    VuexServices.Root.setFullScreenLoading(true)
                    const receiptEmail = await StoreServices.getSubscribeReceipt(this.user.bpNumber);
                    this.receiptPayment = receiptEmail;
                    const EmReceipt = new EmailReceipt();
                    EmReceipt.ccEmails = receiptEmail.ccEmails
                    EmReceipt.emails = receiptEmail.emails
                    paymentMethod.emailreceipt = EmReceipt;
                    VuexServices.Root.setFullScreenLoading(false)
                } catch (e) {
                    VuexServices.Root.setFullScreenLoading(false)
                    this.receiptPayment = null;
                }
            }

            // return;

            const SELECTED_PAYMENT_SERVICE = paymentMethod.service?.id || ""

            console.log(SELECTED_PAYMENT_SERVICE)
            // ---------- promptpay ----------
            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.promptpay().id) {
                const p = new PaymentModel.PromptpayState()
                p.price = this.totalPrice
                VuexServices.Root.setFullScreenLoading(!1)
                await VuexServices.Payment.setPromptpayState(p)
                console.log("GOTO promptpay")
                return this.$router.push({
                    name: ROUTER_NAMES.payment_promptpay,
                    query: {
                        pm: PaymentMethodServices.promptpay().id,
                        hash: this.getOrderHash()
                    }
                })
            }
            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.internetBanking().id) {
                console.log("internetBanking instruction")
                await VuexServices.Root.setFullScreenLoading(!1)
                // await clearSelectedItems()
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_instruction,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.internetBanking().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            }
            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.atm().id) {
                console.log("ATM instruction")
                await VuexServices.Root.setFullScreenLoading(!1)
                // await clearSelectedItems()
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_instruction,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.atm().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            } if (PaymentMethodServices.cash().id ===  SELECTED_PAYMENT_SERVICE) {
                console.log("Method bank counter cash")
                await VuexServices.Root.setFullScreenLoading(!1)
                // await clearSelectedItems()
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_instruction,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.cash().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            } if (PaymentMethodServices.cheque().id ===  SELECTED_PAYMENT_SERVICE) {
                console.log("Method bank counter cheque")
                await VuexServices.Root.setFullScreenLoading(!1)
                // await clearSelectedItems()
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_instruction,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.cheque().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            }
            const rp = ROUTER_NAMES.payment_select_payment_method
            VuexServices.Root.setFullScreenLoading(true)

            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.pushNotiKMA().id) {
                await VuexServices.Root.setFullScreenLoading(!1)
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_push_noti,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.pushNotiKMA().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            }

            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.pushNotiKPlus().id) {
                await VuexServices.Root.setFullScreenLoading(!1)
                return this.$router.replace({
                    name: ROUTER_NAMES.payment_push_noti,
                    query: {
                        // refkey: rs.refKey,
                        pm: PaymentMethodServices.pushNotiKPlus().id,
                        bank: paymentMethod.bank?.id || ""
                    }
                })
            // }
            // // bank counter
            // else if (PaymentMethodServices.cash().channelName === rs.paymentChannelName) {
            //     console.log("Method bank counter cash")
            //     await VuexServices.Root.setFullScreenLoading(!1)
            //     await clearSelectedItems()
            //     return this.$router.replace({
            //         name: ROUTER_NAMES.payment_instruction,
            //         query: {
            //             refkey: rs.refKey,
            //             pm: PaymentMethodServices.cash().id,
            //             bank: paymentMethod.bank?.id || ""
            //         }
            //     })
            // } else if (PaymentMethodServices.cheque().channelName === rs.paymentChannelName) {
            //     console.log("Method bank counter cheque")
            //     await VuexServices.Root.setFullScreenLoading(!1)
            //     await clearSelectedItems()
            //     return this.$router.replace({
            //         name: ROUTER_NAMES.payment_instruction,
            //         query: {
            //             refkey: rs.refKey,
            //             pm: PaymentMethodServices.cheque().id,
            //             bank: paymentMethod.bank?.id || ""
            //         }
            //     })
            // } else if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.atm().id) {
            //     console.log("ATM instruction")
            //     await VuexServices.Root.setFullScreenLoading(!1)
            //     await clearSelectedItems()
            //     return this.$router.replace({
            //         name: ROUTER_NAMES.payment_instruction,
            //         query: {
            //             refkey: rs.refKey,
            //             pm: PaymentMethodServices.atm().id,
            //             bank: paymentMethod.bank?.id || ""
            //         }
            //     })
            }
            await VuexServices.Root.setFullScreenLoading(!!1)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.makePayment))
            const rs = await PaymentServices.makePayment(invoices, paymentMethod, user)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.makePayment))
            
            setOrderRefItems(rs.refKey, rs.paymentItems)
            this.orderRefResult.items = rs.paymentItems
            this.orderRefResult.orderDate = rs.paymentDate
            this.orderRefResult.ref = rs.refKey

            if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.ThaiQR().id) {
                console.log("ThaiQR instruction")
                const pwRs = await PaymentServices.createPaymentGatewayOrder(rs.refKey, rs.paymentItems, paymentMethod, rs.paymentDate, this.user)
                if (!pwRs.success) {
                    throw new Error(LanguageUtils.lang(pwRs.messageTh, pwRs.messageEn))
                }
                await VuexServices.Root.setFullScreenLoading(!1)
                if (pwRs.paymentUrl) {
                    // window.location.href = pwRs.paymentUrl
                    StorageUtils.setItem(rs.refKey, pwRs.paymentUrl)
                    await clearSelectedItems()
                    return this.$router.replace({
                        name: ROUTER_NAMES.payment_instruction,
                        query: {
                            refkey: rs.refKey,
                            pm: PaymentMethodServices.ThaiQR().id,
                            bank: paymentMethod.bank?.id || ""
                        }
                    })
                } else {
                    console.log("No payment url")
                    await VuexServices.Root.setFullScreenLoading(!1)
                }
            } else if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.wechatpay().id) {
                console.log("WeChay instruction")  // ! Nutto

                LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))
                const pwRs = await PaymentServices.createPaymentGatewayOrder(rs.refKey, rs.paymentItems, paymentMethod, rs.paymentDate, this.user)
                LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.createPaymentGatewayOrder))

                if (!pwRs.success) {
                    throw new Error(LanguageUtils.lang(pwRs.messageTh, pwRs.messageEn))
                }
                await VuexServices.Root.setFullScreenLoading(!1)

                if (pwRs.paymentUrl) {
                    // window.location.href = pwRs.paymentUrl
                    StorageUtils.setItem(rs.refKey, pwRs.paymentUrl)
                    await clearSelectedItems()
                    return this.$router.replace({
                        name: ROUTER_NAMES.payment_instruction,
                        query: {
                            refkey: rs.refKey,
                            pm: PaymentMethodServices.wechatpay().id,
                            bank: paymentMethod.bank?.id || ""
                        }
                    })
                } else {
                    console.log("No payment url")
                    await VuexServices.Root.setFullScreenLoading(!1)
                }
            // } else if (SELECTED_PAYMENT_SERVICE === PaymentMethodServices.internetBanking().id) {
            //     console.log("internetBanking instruction")
            //     await VuexServices.Root.setFullScreenLoading(!1)
            //     await clearSelectedItems()
            //     return this.$router.replace({
            //         name: ROUTER_NAMES.payment_instruction,
            //         query: {
            //             // refkey: rs.refKey,
            //             pm: PaymentMethodServices.internetBanking().id,
            //             bank: paymentMethod.bank?.id || ""
            //         }
            //     })
            } else if (rs.refKey) {
                /**
                 * support method
                 * - alipay
                 * - credit
                 * - Thai QR
                 */
                LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))
                const pwRs = await PaymentServices.createPaymentGatewayOrder(rs.refKey, rs.paymentItems, paymentMethod, rs.paymentDate, this.user)
                LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.createPaymentGatewayOrder))

                console.log(pwRs)
                if (!pwRs.success) {
                    throw new Error(LanguageUtils.lang(pwRs.messageTh, pwRs.messageEn))
                }
                if (pwRs.paymentUrl) {
                    await clearSelectedItems()
                    window.location.href = pwRs.paymentUrl
                } else {
                    await VuexServices.Root.setFullScreenLoading(!1)
                    DialogUtils.showErrorDialog({ text: "No payment url" })
                }
            } else {
                console.log("No ref key")
                await VuexServices.Root.setFullScreenLoading(!1)
                DialogUtils.showErrorDialog({ text: "No transaction ref key" })
            }
        } catch (e) {
            console.log("makePayment error", e.message || e)
            await VuexServices.Root.setFullScreenLoading(!1)
            DialogUtils.showErrorDialog({ text: e.message || "" })
        }
    }

    private get canConfirm() {
        const { paymentMethod, totalPrice } = this
        return totalPrice > 0 && !!paymentMethod && !!paymentMethod.service
    }

    private get exportIcon() {
        return require("@/assets/images/icons/export-file.svg")
    }

    private async downloadSelectedInvoicesPDF() {
        this.exporting = "pdf"
        try {
            const { invoices } = this

            LogServices.addApiLog(new LogServices.PLog("payment download pdf", this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))
            const invoiceResponse = await InvoiceServices.downloadInvoicesPDF(this.user.customerNo, invoices)
            LogServices.addApiLog(new LogServices.PLog("payment download pdf", this.userNo, "onApiCallFinsih", Endpoints.createPaymentGatewayOrder))

            // await FileUtils.downloadFile(invoiceResponse.binaryString, "invoices.pdf", "PDF")
            await FileUtils.downloadFile(invoiceResponse.file.content, "invoices.pdf", invoiceResponse.file.extension)
        } catch (e) {
            console.log(e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.exporting = ""
    }

    private async exportCSV() {
        this.exporting = "csv"
        try {
            const fields = csvFields()
            const now = moment().format("DD/MM/YYYY")

            interface Row {
                downloadDate: string
                customerNo: string
                invoiceNo: string
                invoiceDate: string
                invoiceItemName: string
                priceIncVat: string
                netTax: string
                netPrice: string
                vat: string
                tax: string
            }

            const rows: Row[] = []

            const formatPrice = (n: any) => numeral(n).format("0,0.00")
            const invoices = [...this.invoices].sort((y, z) => z.createdDateTime.localeCompare(y.createdDateTime))

            for (let i = 0; i < invoices.length; i++) {
                const invoice = invoices[i]
                const size = invoice.paymentDetail.paymentItems.length
                for (let j = 0; j < size; j++) {
                    const pi = invoice.paymentDetail.paymentItems[j]
                    if (pi.selected) {
                        const row: Row = {
                            downloadDate: i === 0 ? now : "",
                            customerNo: i === 0 ? this.user.customerNo : "",
                            invoiceNo: j === 0 ? invoice.id : "",
                            invoiceDate: j === 0 ? (() => {
                                const md = moment(invoice.createdDate)
                                return md.isValid() ? md.format("DD.MM.YYYY") : ""
                            })() : "",
                            invoiceItemName: pi.name || "",
                            priceIncVat: formatPrice(pi.price + pi.vat),
                            netTax: "",
                            netPrice: formatPrice(pi.price),
                            vat: formatPrice(pi.vat),
                            tax: formatPrice(pi.tax)
                        }

                        rows.push(row)

                        for (const discount of pi.discounts) {
                            const disRow: Row = {
                                downloadDate: "",
                                customerNo: "",
                                invoiceNo: "",
                                invoiceDate: "",
                                invoiceItemName: discount.name || "",
                                priceIncVat: formatPrice(-1 * (Math.abs(discount.value) + Math.abs(discount.vat))),
                                netTax: "",
                                netPrice: formatPrice(-1 * Math.abs(discount.value)),
                                vat: formatPrice(-1 * Math.abs(discount.vat)),
                                tax: formatPrice(-1 * Math.abs(discount.tax))
                            }
                            rows.push(disRow)
                        }
                    }
                }
            }

            const json2csvParser = new Parser<Row>({ fields })
            const csv = json2csvParser.parse(rows)
            const url = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`
            const fileName = "invoices.csv"
            FileUtils.downloadDataUrlFile(url, fileName)
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.exporting = ""
    }

    private async submitPushNoti() {

        const { phone } = this.pushNoti
        const { invoices, user } = this
        await VuexServices.Root.setFullScreenLoading(true)
        await VuexServices.Payment.setPushNotiLoading(true)
        try {
            console.log(phone)
            if (!this.paymentMethod) {
                throw new Error("No payment method selected")
            }
            const ref = String(this.$route.query.refkey || "")
            // const items = getOrderRefItems(ref)
            // console.log("items --> ", items)
            // if (!items) {
            //     throw new Error("No payment items")
            // }

            const rp = ROUTER_NAMES.payment_push_noti
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.makePayment))
            const rs = await PaymentServices.makePayment(invoices, this.paymentMethod, user)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.makePayment))
    
            setOrderRefItems(rs.refKey, rs.paymentItems)
            this.orderRefResult.items = rs.paymentItems
            this.orderRefResult.orderDate = rs.paymentDate
            this.orderRefResult.ref = rs.refKey
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))
            const pwRs = await PaymentServices.createPaymentGatewayOrder(rs.refKey, this.orderRefResult.items, this.paymentMethod, this.orderRefResult.orderDate, this.user, phone)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))

            if (!pwRs.success) {
                await VuexServices.Root.setFullScreenLoading(false)
                throw new Error(LanguageUtils.lang(pwRs.messageTh, pwRs.messageEn))
            }
            
            await VuexServices.Root.setFullScreenLoading(false)
            await VuexServices.Payment.setSelectedInvoices([])
            await VuexServices.Payment.setPushNotiLoading(false)
            clearOrderRefItems(rs.refKey)
            return this.$router.replace({
                name: ROUTER_NAMES.payment_instruction,
                query: {
                    refkey: rs.refKey,
                    order_id: pwRs.orderId,
                    total_amount: pwRs.totalAmount,
                    pm: this.paymentMethod.service?.id || "",
                    bank: this.paymentMethod.bank?.id || ""
                }
            })

        } catch (e) {
            await VuexServices.Root.setFullScreenLoading(false)
            await VuexServices.Payment.setPushNotiLoading(false)
            DialogUtils.showErrorDialog({ text: e.message || e || "Push noti error" })
        }
        await VuexServices.Root.setFullScreenLoading(false)
        await VuexServices.Payment.setPushNotiLoading(false)
    }

    private get pushNotiPhoneValid() {
        return ValidateUtils.validatePhone(this.pushNoti.phone)
    }

    private get promptpayPhoneValid() {
        return ValidateUtils.validatePhone(this.promptpayState?.phone || "")
    }

    private get displayPaymentMethod() {
        const { paymentMethod } = this
        
        if (paymentMethod) {
            if(paymentMethod.service?.Hidebankname){
                return `${paymentMethod.service?.displayName || ""}`
            }else{
                return `${paymentMethod.service?.displayName || ""}${paymentMethod.bank ? `<span class="pl-2">${paymentMethod.bank.displayName}</span>` : ""}`
            }
        }
        return ""
    }

    private async submitPromptpayPayment() {
        VuexServices.Root.setFullScreenLoading(true)
        

        try {
            if (this.selectTypeReceipt && this.selectTypeReceipt?.email) {
                try {
                    const receiptEmail = await StoreServices.getSubscribeReceipt(this.user.bpNumber);
                    const EmReceipt = new EmailReceipt();
                    EmReceipt.ccEmails = receiptEmail.ccEmails
                    EmReceipt.emails = receiptEmail.emails
                    this.paymentMethod!.emailreceipt = EmReceipt;
                } catch (e) {
                    this.receiptPayment = null;
                }
            }

            const rp = ROUTER_NAMES.payment_promptpay
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.makePayment))
            // eslint-disable-next-line
            const rs = await PaymentServices.makePayment(this.invoices, this.paymentMethod!, this.user)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.makePayment))
            const refkey = rs.refKey
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallStart", Endpoints.createPaymentGatewayOrder))
            // eslint-disable-next-line
            const pwRs = await PaymentServices.createPaymentGatewayOrder(refkey, rs.paymentItems, this.paymentMethod!, rs.paymentDate, this.user, this.promptpayState?.phone)
            LogServices.addApiLog(new LogServices.PLog(rp, this.userNo, "onApiCallFinsih", Endpoints.createPaymentGatewayOrder))

            const hash = this.getOrderHash({
                makePaymentResult: rs,
                paymentGatewayResult: pwRs
            })

            if (!pwRs.success) {
                throw new Error(LanguageUtils.lang(pwRs.messageTh, pwRs.messageEn))
            }

            await VuexServices.Payment.setPromptpayStatePrice(this.totalPrice)
            await VuexServices.Payment.setSelectedInvoices([])

            this.$router.replace({
                name: ROUTER_NAMES.payment_instruction,
                query: {
                    refkey,
                    hash,
                    pm: PaymentMethodServices.promptpay().id,
                    order_id: pwRs.orderId
                }
            })
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }

        VuexServices.Root.setFullScreenLoading(false)
    }

    private getOrderHash(payloads: { [x: string]: any } = {}) {
        return cryptoJs.SHA256(JSON.stringify({
            paymentMethod: this.paymentMethod,
            invoices: this.invoices,
            user: this.user,
            ...payloads
        })).toString()
    }
}

function csvFields() {
    return [
        {
            label: "วันที่โอน",
            value: "downloadDate"
        },
        {
            label: "เลขที่ Virtual/ เลขที่ Customer",
            value: "customerNo"
        },
        {
            label: "เลขที่ใบแจ้งหนี้",
            value: "invoiceNo"
        },
        {
            label: "วันที่แจ้งหนี้",
            value: "invoiceDate"
        },
        {
            label: "รายการ",
            value: "invoiceItemName"
        },
        {
            label: "จำนวนเงิน (รวม Vat)",
            value: "priceIncVat"
        },
        {
            label: "จำนวนที่โอน (Net Tax)",
            value: "netTax"
        },
        {
            label: "จำนวนเงิน (ก่อนรวม Vat)",
            value: "netPrice"
        },
        {
            label: "Vat",
            value: "vat"
        },
        {
            label: "Tax",
            value: "tax"
        }
    ]
}

function setOrderRefItems(ref: string, items: any[]) {
    if (ref) {
        StorageUtils.setItem(ref, items, "SESSION")
    }
}

function getOrderRefItems(ref: string) {
    if (ref) {
        const items = StorageUtils.getItem(ref, "SESSION")
        if (Array.isArray(items)) {
            return items
        }
        return null
    }
    return null
}

function clearOrderRefItems(ref: string) {
    StorageUtils.removeItem(ref, "SESSION")
}