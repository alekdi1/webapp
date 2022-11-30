import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import Step from "../../components/stepper/stepper.vue"
import { PaymentModel, BranchModel, InvoiceModel } from "@/models"
import { EmployeeServices, BranchService, VuexServices, PaymentMethodServices, BankServices, StoreServices } from "@/services"
import PAGE_NAME from "../page-name"
import * as Models from "@/models"

class Bank extends PaymentModel.Bank { }

const getWindow = () => ({
    width: window.innerWidth,
    height: window.innerHeight
})

@Component({
    name: PAGE_NAME.select_payment_method,
    components: {
        "cpn-payment-stepper": Step
    }
})
export default class SelectPaymentMethodPage extends Base {
    @VuexServices.Payment.VXSelectedInvoices()
    private invoices!: InvoiceModel.Invoice[]

    private selectedMethod = ""
    private selectedMethodOption = ""
    private filteredBank: Bank | null = null
    private selectBranch = new SelectBranch()
    private selectedBranch: BranchModel.Branch | null = null
    private branchList: BranchModel.Branch[] = []
    private note = ""
    private maxNote = 50
    private dialog = false
    private selectEmailReceipt = false;
    private selectBranchReceipt = false;
    private receiptPayment: any = null;
    private isShowModal = false;
    private isAcceptConsentandTerm = false;
    private ReceiptccEmail = ""
    private ReceiptEmail = ""
    private isClickedConfirm = false
    private loadingConfirmReceipt = false;
    private isHideEmailReceipt = false;
    private isHideBranchReceipt = false;
    private conditionReceipt = `<div class=WordSection1>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'>ยินดีต้อนรับและขอขอบคุณท่านที่เลือกใช้บริการรับ
                        </span><span lang=TH style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์
                            และใบรับอิเล็กทรอนิกส์ </span><span lang=TH style='font-size:12.0pt;font-family:
                        CPN;color:black'>(</span><span style='font-size:12.0pt;font-family:CPN;color:black'>E-Tax
                            Invoice &amp; E-Receipt )</span><span style='font-size:12.0pt;font-family:CPN;
                        color:black'><br>
                            <span lang=TH>โปรดอ่านข้อตกลงและเงื่อนไขการใช้บริการโดยละเอียดก่อนการสมัครใช้บริการ</span></span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'>ในข้อตกลงนี้ ให้</span><span
                            style='font-size:12.0pt;font-family:CPN;color:black'>&nbsp;<b><span
                                    lang=TH>ผู้ขอใช้บริการ</span></b>&nbsp;<span lang=TH>หมายถึง ผู้เช่า/ผู้รับบริการ
                                พื้นที่ในศูนย์การค้าของ กลุ่มบริษัท
                                เซ็นทรัลพัฒนา จำกัด (มหาชน) (<b>บริษัท</b></span>) <span lang=TH>
                                โดยบริษัทได้อนุมัติให้ใช้บริการ</span></span><span lang=TH
                            style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์
                            และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;font-family:
                        CPN;color:black'> </span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span style='font-size:12.0pt;
                    font-family:"Segoe UI Symbol",sans-serif'>❖</span><b><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์ (</span></b><b><span
                                style='font-size:12.0pt;font-family:CPN;color:black'>e-Tax Invoice)<span lang=TH> หมายถึง</span></span></b></p>
                    <p class=MsoNormal style='line-height:normal'><span style='font-size:12.0pt;
                    font-family:CPN;color:black'> - <span lang=TH>ใบกำกับภาษี ตามมาตรา </span>86/4 <span lang=TH>แห่งประมวลรัษฎากร
                            </span></span></p>
                    <p class=MsoNormal style='line-height:normal'><span style='font-size:12.0pt;
                    font-family:CPN;color:black'>- <span lang=TH>ใบลดหนี้ตามมาตรา </span>86/10<span lang=TH>แห่งประมวลรัษฎากร
                            </span></span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'>ที่ได้มีการจัดทำข้อความขึ้นเป็นข้อมูลอิเล็กทรอนิกส์
                            ซึ่งได้ลงลายมือชื่อดิจิทัล (</span><span style='font-size:12.0pt;font-family:
                        CPN;color:black'>Digital Signature) <span lang=TH>ด้วยวิธีการที่กรมสรรพากรกำหนด </span></span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><b><span style='font-size:12.0pt;
                    font-family:"Segoe UI Symbol",sans-serif'>❖</span></b><b><span style='font-size:12.0pt;font-family:CPN;color:black'> <span
                                    lang=TH>ใบรับอิเล็กทรอนิกส์ (</span>e-Receipt)
                                <span lang=TH>หมายถึง </span></span></b>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'> - ใบรับ ตามมาตรา </span><span style='font-size:12.0pt;
                    font-family:CPN;color:black'>105 <span lang=TH>ทวิ แห่งประมวลรัษฎากร
                                ที่ได้มีการจัดทำข้อความขึ้นเป็นข้อมูล อิเล็กทรอนิกส์ ซึ่งได้ลงลายมือชื่อดิจิทัล
                                (</span>Digital Signature) <span lang=TH>ด้วยวิธีการที่กรมสรรพากรกำหนด</span></span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'>โดยเอกสารดังกล่าวจะส่งมอบ </span><span lang=TH
                            style='font-size:12.0pt;font-family:CPN;color:black'>ให้แก่ผู้ซื้อสินค้าหรือผู้รับบริการ
                            ด้วยวิธีการทางอิเล็กทรอนิกส์ตามที่ได้ตกลงกัน ซึ่งเป็นไปตามพระราชบัญญัติ ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์
                            พ.ศ.</span><span style='font-size:12.0pt;font-family:CPN;color:black'>2544</span><span lang=TH
                            style='font-size:12.0pt;font-family:CPN;color:black'> เพื่อใช้ในการอ้างอิง
                        </span><b><span lang=TH style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                        font-family:CPN;color:black'> ที่ผู้ขอใช้บริการจะได้รับในลักษณะเอกสารอิเล็กทรอนิกส์
                            (</span><span style='font-size:12.0pt;font-family:CPN;color:black'>PDF File) <span
                                lang=TH>ผ่านจดหมายอิเล็กทรอนิกส์ (</span>E-mail) <span lang=TH>ของผู้ขอใช้บริการ
                                ซึ่งผู้ขอใช้บริการจะต้องทำการกรอกรหัสผ่าน (</span>Password) <span
                                lang=TH>จึงจะทำการเปิดเอกสารได้</span></span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span lang=TH style='font-size:
                    12.0pt;font-family:CPN;color:black'>ข้อตกลงนี้ใช้บังคับระหว่าง บริษัท ในกลุ่ม บมจ.เซ็นทรัลพัฒนา
                            กับ ผู้ขอใช้บริการ โดยผู้ขอใช้บริการยินยอมผูกพันและปฏิบัติ
                            ตามข้อตกลงและเงื่อนไขการใช้บริการรับ</span><b><span lang=TH style='font-size:
                        12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์ และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH
                            style='font-size:12.0pt;font-family:CPN;color:black'> โดยการตอบตกลงด้านล่างนี้
                            ให้ถือว่าผู้ขอใช้บริการ เข้าใจและตกลงที่จะใช้บริการรับ</span><b><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                        font-family:CPN;color:black'> ตามข้อกำหนดและเงื่อนไขในข้อตกลงนี้ทุกประการ</span>
                    </p>
                    <p class=MsoNormal style='line-height:normal'><span style='font-size:12.0pt;
                    font-family:CPN;color:black'>&nbsp;</span></p>
                    <p class=MsoNormal style='line-height:normal'><span style='font-size:12.0pt;
                    font-family:CPN;color:black'>&nbsp;</span></p>
                    <p class=MsoNormal style='line-height:normal'><b><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:black'>เงื่อนไขบริการ รับ</span></b><b><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:black'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span></b>
                    </p>
                    <ul type=disc>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริการรับ</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> คือ การให้บริการส่งใบเสร็จรับเงิน ใบกำกับภาษี
                                ใบลดหนี้/ใบเสร็จ และใบลดหนี้/ใบกำกับภาษี ในรูปแบบอิเล็กทรอนิกส์
                                บริษัทจะจัดส่งรายละเอียดในลักษณะเอกสารอิเล็กทรอนิกส์
                                (</span><span style='font-size:12.0pt;font-family:CPN;color:black'>PDF File) <span
                                    lang=TH>ให้แก่ท่านผ่านทางระบบจดหมายอิเล็กทรอนิกส์
                                    ที่ท่านได้แจ้งลงทะเบียนไว้ในการสมัครใช้บริการนี้ โดยทางบริษัท
                                    จะจัดส่งให้แก่ท่านเมื่อได้จัดส่งสินค้าหรือรับชำระเงินจากท่าน
                                    ซึ่งผู้ขอใช้บริการจะต้องทำการกรอกรหัสผ่าน
                                    (</span>Password) <span lang=TH>เพื่อเข้าใช้บริการ ตรวจสอบ
                                    หรือดำเนินการจัดพิมพ์</span></span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ของผู้ขอใช้บริการได้ด้วยตนเอง</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>ผู้ขอใช้บริการจะต้องลงทะเบียนขอรับบริการนี้
                                    กับบริษัท โดยสมบูรณ์ผ่าน </span>Central Pattana Serve Application <span
                                    lang=TH>ก่อนที่จะสามารถรับบริการนี้ได้</span></span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>ผู้ขอใช้บริการรับทราบดีกว่า
                                    ผู้ขอใช้บริการมีหน้าที่ดูแล รักษาข้อมูลส่วนตัวของผู้ขอใช้บริการ เช่น
                                    รหัสผ่าน
                                    ซึ่งถือเป็นข้อมูลที่มีความสำคัญด้วยความรับผิดชอบของผู้ขอใช้บริการเอง
                                    หากผู้ขอใช้บริการประมาทเลินเล่อ จนเป็นสาเหตุให้มีผู้ใด ทุจริต
                                    ลักลอบนำข้อมูลส่วนตัวของผู้ขอใช้บริการสมัครเข้าใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์
                                    กับบริษัท และก่อให้เกิดความเสียหายกับผู้ขอใช้บริการแล้ว บริษัท
                                    ขอสงวนสิทธิ์ที่จะไม่รับผิดชอบต่อผู้ขอใช้บริการ ไม่ว่ากรณีใดๆ
                                    จากความเสียหายที่เกิดขึ้น</span>&nbsp;<span lang=TH>และหากบริษัทได้รับความเสียหายใดๆ
                                    จากความประมาทเลินเล่อดังกล่าวของผู้ขอใช้บริการแล้ว
                                    ผู้ขอใช้บริการต้องรับผิดชอบในความเสียหายที่เกิดขึ้นนั้นต่อบริษัท</span></span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>ในการรับข้อมูล</span></span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ผู้ขอใช้บริการและบริษัท ตกลงให้ถือเสมือนการจัดส่ง
                                และได้รับ</span><span lang=TH style='font-size:12.0pt;font-family:CPN;
                            color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์ และใบรับอิเล็กทรอนิกส์</span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:black'>
                                เป็นไปตามที่กฎหมายที่เกี่ยวข้องกำหนดและตกลงให้บริษัทสามารถอ้างอิงข้อมูล</span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'>
                                เป็นต้นฉบับเอกสารที่เป็นพยานหลักฐานในการพิสูจน์ว่ามีการจัดส่งไปยังผู้ขอใช้บริการและผู้ขอใช้บริการได้รับ</span><span
                                lang=TH style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> แล้ว</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>ในการเข้าถึง
                                    การเก็บข้อมูล หรือการพิมพ์ รายละเอียดหรือ</span></span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> นี้ หรือเพื่อเก็บบันทึก ผู้ขอใช้บริการควรใช้โปรแกรม </span><span
                                style='font-size:12.0pt;font-family:CPN;color:black'>Internet Explorer version 5.5 <span lang=TH>หรือสูงกว่า
                                    และควรลงโปรแกรม </span>Adobe Acrobat Reader plug-in <span
                                    lang=TH>หรือโปรแกรมอื่นที่ใช้สำหรับการเปิดใช้ไฟล์นามสกุล </span>PDF <span lang=TH>หรือในรูปแบบ
                                </span>PDF File <span lang=TH>ได้</span></span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริษัท จะจัดส่ง</span></span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ในรูปแบบของ </span><span style='font-size:12.0pt;
                            font-family:CPN;color:black'>PDF File <span lang=TH>ให้ผู้ใช้บริการทาง </span>E-mail
                                Address <span lang=TH>ที่ผู้ขอใช้บริการระบุไว้ ในการสมัครใช้บริการแทนการจัดส่งทางช่องทางปกติ
                                    ทั้งนี้ ผู้ขอใช้บริการสามารถเรียกดู</span></span><span lang=TH
                                style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                และใบรับอิเล็กทรอนิกส์</span><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ได้ที่ </span><span style='font-size:12.0pt;font-family:
                            CPN;color:black'>E-mail Address <span lang=TH>ที่ผู้ขอใช้บริการระบุ
                                    หากผู้ขอใช้บริการมีความประสงค์จะเปลี่ยนแปลง </span>E-mail Address <span
                                    lang=TH>สามารถแจ้งการเปลี่ยนแปลงผ่านช่องทาง </span>Central Pattana Serve Application</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริการ</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> นี้ บริษัท ยังมิได้คิดค่าธรรมเนียมการสมัครหรือการใช้บริการ
                                รวมถึงค่าธรรมเนียมในกรณีขอเปลี่ยนแปลงแก้ไขข้อมูลหรือยกเลิกบริการ</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริษัท
                                    ขอสงวนสิทธิ์ในการระงับการให้บริการส่ง</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ให้แก่ผู้ขอใช้บริการบางรายเมื่อผู้ขอใช้บริการมีคุณสมบัติไม่ตรงกับเงื่อนไขของบริษัท
                                โดยบริษัท จะดำเนินการจัดส่ง</span><b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ทางปกติแทน</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริษัท
                                    ขอสงวนสิทธิ์ในการเปลี่ยนแปลงรูปแบบข้อมูล ระยะเวลาการจัดส่งข้อมูล
                                    หรือส่งจดหมายอิเล็กทรอนิกส์ เปลี่ยนแปลงและรูปแบบไฟล์ข้อมูล
                                    หรือรายละเอียดอื่นใดของการให้บริการ</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ที่จะจัดส่งให้ผู้ใช้บริการ โดยบริษัท
                                จะแจ้งให้ทราบล่วงหน้าภายในระยะเวลาอันสมควร</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>การให้บริการ</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> นี้ มีขึ้นเพื่อประโยชน์ในการตรวจสอบรายละเอียดการรับชำระเงิน
                                รายละเอียดต่างๆ ของผู้ขอใช้บริการเท่านั้น
                                ผู้ขอใช้บริการไม่สามารถใช้เอกสารนี้เพื่ออ้างอิงหรือเป็นหลักฐานประกอบการสมัครใช้บริการ
                                หรือใช้เพื่อการอื่นใดในทางที่จะทำให้บริษัท </span><span style='font-size:
                            12.0pt;font-family:CPN;color:black'>CPN <span lang=TH>ได้รับความเสียหายโดยเด็ดขาด</span></span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>บริษัท
                                    ขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขการใช้บริการรับ</span></span><b><span lang=TH
                                    style='font-size:12.0pt;font-family:CPN;color:windowtext'>ใบกำกับภาษีอิเล็กทรอนิกส์
                                    และใบรับอิเล็กทรอนิกส์</span></b><span lang=TH style='font-size:12.0pt;
                            font-family:CPN;color:black'> ได้ตามที่บริษัทเห็นสมควร นอกจากนี้บริษัท
                                มีสิทธิ์ที่จะยกเลิกหรือระงับการบริการดังกล่าวได้ ไม่ว่าทั้งหมดหรือบางส่วน
                                หรือเฉพาะแต่ผู้ใช้บริการรายใด รายหนึ่งเมื่อใดก็ได้
                                โดยบริษัทจะแจ้งให้ผู้ขอใช้บริการทราบล่วงหน้าภายในระยะเวลาอันสมควร</span>
                        </li>
                        <li class=MsoNormal style='color:black;line-height:normal'><span style='font-size:12.0pt;font-family:CPN;color:black'>-
                                <span lang=TH>ผู้ขอใช้บริการตกลงว่า
                                    บริษัทจะไม่รับผิดต่อการกระทำใดๆ
                                    ที่เป็นสิทธิของบริษัทหรือจากการให้บริการตามที่ระบุไว้ในข้อตกลงและเงื่อนไขนี้
                                    โดยผู้ขอใช้บริการจะไม่ยกขึ้นเป็นข้ออ้างเพื่อเรียกร้องค่าเสียหายใดๆ
                                    หรือฟ้องร้องทั้งในทางแพ่งและทางอาญาต่อบริษัททั้งสิ้น
                                    เว้นแต่ความเสียหายหรือความรับผิดนั้นเกิดจากการกระทำโดยจงใจหรือประมาทเลินเล่ออย่างร้ายแรงของบริษัท</span></span>
                        </li>
                    </ul>
                    <p class=MsoNormal><span style='font-size:12.0pt;line-height:107%;font-family:
                    CPN;color:black'>&nbsp;</span></p>
                </div>`;
    private permissionConstatnt = EmployeeServices.PERMISSIONS
    private checkIsHasPermissionEReceipt = false;
    private isSelectOnlineBankingMethod = false;
    private window = getWindow()

    @VuexServices.Payment.VXBanks()
    private banks!: Bank[]

    @VuexServices.Payment.VXPaymentMethod()
    private paymentMethod!: PaymentModel.PaymentMethod | null

    private async mounted() {
        this.checkIsHasPermissionEReceipt = this.user.permissions.map(x => x.permission).includes(this.permissionConstatnt.e_invoice_receipt)
        const bpNumber = this.user.customerNo
        this.ReceiptEmail = this.user.email
        try {
            this.receiptPayment = await StoreServices.getSubscribeReceipt(bpNumber);
            if (this.checkIsHasPermissionEReceipt || this.user.isOwner) {
                if (this.receiptPayment != null) {
                    this.selectEmailReceipt = true
                    const receiptSelectType = new Models.PaymentModel.SelectTypeReceipt();
                    receiptSelectType.branch = false
                    receiptSelectType.email = true
                    receiptSelectType.ishasReceiptemail = this.receiptPayment == null ? false : true
                    receiptSelectType.isChooseOnlinePayment = this.isSelectOnlineBankingMethod;
                    await VuexServices.Payment.setReceiptType(receiptSelectType)
                }
            }
        } catch (e) {
            this.receiptPayment = null;
        }
        if (this.receiptPayment == null) {
            this.selectEmailReceipt = true
            await VuexServices.Payment.setReceiptType(new Models.PaymentModel.SelectTypeReceipt())
        }

        console.log("VuexServices.Payment --> ", VuexServices.Payment.getReceiptType())
        this.getDatas()
        window.addEventListener("resize", this.calculateLayout)
    }

    private calculateLayout() {
        this.window = getWindow()
    }

    private beforeDestroy() {
        window.removeEventListener("resize", this.calculateLayout)
    }

    private async getDatas() {
        await this.getBanks()
        await this.getBranch()

        // ------------- check restore form --------------
        const { paymentMethod } = this
        if (paymentMethod) {
            switch (paymentMethod.service?.id) {
                case PaymentMethodServices.promptpay().id: {
                    this.selectedMethod = PaymentMethodServices.promptpay().id
                    break
                }

                // TODO other method
                // revert save function
            }

            this.selectedBranch = paymentMethod.branch || null
        }
    }

    private get branchOptions() {
        return this.branchList.filter(f => !BranchService.isHeadOffice(f))
    }

    private async getBanks() {
        try {
            const banks = await BankServices.getBanks()
            await VuexServices.Payment.setBanks(banks)
        } catch (e) {
            console.log("getBanks error ", e.message || e)
        }
    }

    private async getBranch() {
        try {
            this.branchList = await BranchService.getBranchList()
            const mainBranch = this.branchList.filter((x: any) => x.code == "HOF")
            console.log("mainBranch ", mainBranch)
        } catch (e) {
            console.log("getBranch error ", e.message || e)
        }
    }

    private get text() {
        const t = (k: string) => this.$t("pages.payment." + k).toString()
        return {
            step_select_method: t("step_select_method"),
            desc_support_all_bank: t("desc_support_all_bank"),
            label_select_bank: t("label_select_bank"),
            cash: LanguageUtils.lang("เงินสด", "Cash"),
            cheque: LanguageUtils.lang("เช็ค", "Cheque"),
            pay_by_card: LanguageUtils.lang("ชำระผ่านบัตร", "Pay by"),
            label_select_bank_dialog: t("label_select_bank_dialog"),
            label_select_receipt_branch: t("label_select_receipt_branch"),
            label_note: t("label_note"),
            mb: LanguageUtils.lang("โมบายแบงก์กิ้ง", "Mobile banking"),
            push_noti: LanguageUtils.lang("Push Noti", "Push Noti"),
            bank_app: LanguageUtils.lang("App ของธนาคาร", "Bank application"),
            inc_vat: LanguageUtils.lang("มีค่าธรรมเนียม 2.5%", "inc. 2.5% fee"),
            thai_qr: LanguageUtils.lang("Thai QR", "Thai QR"),
            //test
            term_select_receipt_desc: LanguageUtils.lang(`คุณสามารถดาวน์โหลดใบเสร็จอิเล็กทรอนิกส์ย้อนหลังได้ด้วยตัวเอง โดยใช้เวลา 3-5 วันทำการ<br>
                                                        - ทั้งนี้ขึ้นอยู่กับวิธีการชำระเงินและระยะเวลาชำระเงิน<br>
                                                        - ใบเสร็จฉบับนี้สามารถนำไปใช้เป็นหลักฐานตัวจริงได้<br>`, "You can download e-Receipt manually which will take 3-5 business days to proceed<br>- duration depends on payment method and payment time<br>- this receipt can be used as an official receipt for reference"),
            email_receipt_text: LanguageUtils.lang("ต้องการรับใบเสร็จทางอีเมล", "Request e-Receipt via email"),
            branch_receipt_text: LanguageUtils.lang("ต้องการให้จัดส่งใบเสร็จไปที่สาขา", "Request receipt to be sent to branch"),
            email_text: LanguageUtils.lang("อีเมล", "Email"),
            email_send_text: LanguageUtils.lang("ใบเสร็จจะถูกส่งไปทางอีเมลที่ท่านได้ให้ไว้", "Register Invoice By Email, e-Receipt"),
            email_not_accept_receipt: LanguageUtils.lang("*ยังไม่ได้ลงทะเบียนรับใบเสร็จไปที่อีเมล", "You have not registered Invoice by Email, e-Receipt yet"),
            register_receipt: LanguageUtils.lang("ลงทะเบียนขอใบเสร็จอิเล็คทรอนิกส์", "Register Invoice By Email, e-Receipt"),
            text_close: LanguageUtils.lang("ปิด", "Close"),
            e_invoice_desc: "E-Invoice จะถูกส่งเฉพาะค่าใช้จ่ายประจำเดือนเท่านั้น",
            e_receipt_desc: LanguageUtils.lang ("E-Receipt จะถูกส่งเฉพาะค่าใช้จ่ายประจำเดือนเท่านั้น","E-Receipt report will be sent monthly"),
            multi_email_desc: LanguageUtils.lang ("กรณีที่ต้องการส่งหลายอีเมลกรุณาใส่เครื่องหมาย , คั่นชื่ออีเมล", "Please put a , in case to send multiple email."),
            reg_e_invoice: "สมัครรับใบแจ้งหนี้อีเล็กทรอนิกส์",
            ok: LanguageUtils.lang("ตกลง", "Ok"),
            register_page_title: LanguageUtils.lang("สมัคร E-Receipt", "E-Receipt Register"),
            accept_condition: LanguageUtils.lang("ข้าพเจ้ายอมรับเงื่อนไข", "I accept the terms"),
            terms_text: LanguageUtils.lang("ข้อตกลงและเงื่อนไข", "Terms and Conditions"),
            cancel_text: LanguageUtils.lang("ยกเลิก", "Cancel"),
            error_isAcceptTheTerms: LanguageUtils.lang("กรุณากดยอมรับเงื่อนไข", "Please accept the terms and conditions.")
        }
    }

    private displayVatPercent(p = 0) {
        return LanguageUtils.lang(`มีค่าบริการ ${p}% (รองรับเฉพาะลูกค้าบุคคลธรรมดาเท่านั้น) `, `There is service fee. ${p}% and supports only individual customers`)
        // return LanguageUtils.lang(`มีค่าธรรมเนียม ${ p }%`, `inc. ${ p }% fee`)
    }

    private get bankServices() {
        return this.filteredBank?.services || {}
    }

    private get paymentMethods() {
        const { text } = this
        return {
            promptpay: (() => {
                const promptpay = PaymentMethodServices.promptpay()
                return {
                    id: promptpay.id,
                    name: promptpay.displayName,
                    icon: promptpay.image || require("@/assets/images/payment/promptpay.png")
                }
            })(),

            alipay: (() => {
                const alipay = PaymentMethodServices.alipay()
                return {
                    id: alipay.id,
                    name: alipay.displayName,
                    icon: alipay.image || require("@/assets/images/payment/alipay.png")
                }
            })(),

            wechatpay: (() => {
                const wechatpay = PaymentMethodServices.wechatpay()
                return {
                    id: wechatpay.id,
                    name: wechatpay.displayName,
                    icon: wechatpay.image || require("@/assets/images/payment/wechat.png")
                }
            })(),

            mobile_banking: (() => {

                const options = [
                    {
                        title: LanguageUtils.lang("ชำระผ่านเบอร์มือถือที่ลงทะเบียน Mobile Banking", "Register mobile phone via mobile banking"),
                        id: "push_noti",
                        services: [
                            {
                                id: "push_noti_k_plus",
                                name: "K Plus",
                                image: require("@/assets/images/banks/kasikorn.jpg")
                            },
                            {
                                id: "push_noti_kma",
                                name: "KMA",
                                image: require("@/assets/images/banks/kma.png")
                            }
                        ]
                    },
                    {
                        title: "Thai QR",
                        id: "thai_qr",
                        services: this.banks.filter(b => !!b.services.thai_qr).map(b => ({
                            id: b.id,
                            name: b.displayName,
                            image: b.image
                        }))
                    }
                ]

                return {
                    id: "mobile_banking",
                    name: this.text.mb,
                    selected: options.some(o => o.id === this.selectedMethod),
                    icon: require("@/assets/images/payment/mobile-banking.svg"),
                    options
                }
            })(),

            atm: (() => {
                const atm = PaymentMethodServices.atm()
                return {
                    id: atm.id,
                    name: atm.displayName,
                    icon: atm.image || require("@/assets/images/payment/atm.png"),
                    banks: this.banks.filter(b => !!b.services.atm)
                }
            })(),

            internet_banking: (() => {
                return {
                    id: "internet_banking",
                    name: LanguageUtils.lang("อินเทอร์เน็ตแบงก์กิ้ง", "Internet banking"),
                    icon: require("@/assets/images/payment/internet-banking.svg"),
                    banks: this.banks.map(b => ({
                        ...b,
                        name: LanguageUtils.lang(b.nameTh, b.nameEn)
                    }))
                        .filter(b => !!b.services.internet_banking)
                }
            })(),

            bank_counter: (() => {
                const options = [
                    {
                        id: PaymentMethodServices.cash().id,
                        label: text.cash,
                        banks: this.banks.filter(b => !!b.services.cash)
                    },
                    {
                        id: PaymentMethodServices.cheque().id,
                        label: text.cheque,
                        banks: this.banks.filter(b => !!b.services.cheque)
                    }
                ]

                return {
                    id: "bank_counter",
                    name: LanguageUtils.lang("เคาน์เตอร์ธนาคาร", "Bank Counter"),
                    icon: require("@/assets/images/payment/counter-service.svg"),
                    selected: options.map(p => p.id).includes(this.selectedMethod),
                    options
                }
            })(),

            credit_card: (() => {
                return {
                    id: "credit_card",
                    name: LanguageUtils.lang("บัตรเครดิต/บัตรเดบิต", "Credit card/Debit Cards"),
                    icon: require("@/assets/images/payment/credit-card.png"),
                    options: [
                        {
                            id: PaymentMethodServices.creditCard().id,
                            label: text.pay_by_card,
                            tax: this.appConfig.payment.otherPayFeePercent,
                            images: [
                                {
                                    img: require("@/assets/images/payment/visa.png"),
                                    label: "VISA"
                                },
                                {
                                    img: require("@/assets/images/payment/mastercard.png"),
                                    label: "MasterCard"
                                },
                                {
                                    img: require("@/assets/images/payment/jcb.png"),
                                    label: "JCB"
                                }
                            ]
                        },
                        {
                            id: PaymentMethodServices.unionpay().id,
                            label: text.pay_by_card,
                            tax: this.appConfig.payment.unionPayFeePercent,
                            images: [
                                {
                                    img: require("@/assets/images/payment/unionpay.png"),
                                    label: "UnionPay"
                                }
                            ]
                        }
                    ]
                }
            })()
        }
    }

    private async selectMethod(m: string, methodOption = "") {
        const paymentCash = ['CASH', 'ATM', 'internet_banking', 'CHEQUE']
        this.isSelectOnlineBankingMethod = !paymentCash.includes(m)
        if (paymentCash.includes(m)) {
            this.isHideEmailReceipt = false
            this.isHideBranchReceipt = true
            this.selectBranchReceipt = false
            this.selectEmailReceipt = true
        } else {
            this.isHideEmailReceipt = false
            this.isHideBranchReceipt = false
            this.selectBranchReceipt = false
            this.selectEmailReceipt = true
        }
        console.log("select payment --> ", m)

        const receiptSelectType = new Models.PaymentModel.SelectTypeReceipt();
        receiptSelectType.branch = this.selectBranchReceipt
        receiptSelectType.email = this.selectEmailReceipt
        receiptSelectType.isChooseOnlinePayment = this.isSelectOnlineBankingMethod;
        receiptSelectType.ishasReceiptemail = this.receiptPayment == null ? false : true
        await VuexServices.Payment.setReceiptType(receiptSelectType)

        this.selectedMethod = m
        this.selectedMethodOption = methodOption
        await this.savePaymentMethod()
    }

    public showFilterBankDialog() {
        this.dialog = true
    }

    private get dialogContentHeight() {
        return this.window.height - 320
    }

    private selectBank(b: Bank) {
        if (this.filteredBank && this.filteredBank.id === b.id) {
            this.filteredBank = null
        } else {
            this.filteredBank = b
        }
        this.selectedMethodOption = ""
        this.selectedMethod = ""
        this.dialog = false
    }

    private isBankSelected(b: Bank) {
        return !!this.filteredBank && b.id === this.filteredBank.id
    }

    private selectBranchClick(b: BranchModel.Branch) {
        this.selectedBranch = b
        let { paymentMethod } = this
        if (!paymentMethod) {
            paymentMethod = new PaymentModel.PaymentMethod()
        } else {
            paymentMethod = Object.assign(new PaymentModel.PaymentMethod(), paymentMethod)
        }
        paymentMethod.branch = b
        VuexServices.Payment.setPaymentMethod(paymentMethod)
    }

    private async onNoteInput() {
        let { paymentMethod } = this
        if (!paymentMethod) {
            paymentMethod = new PaymentModel.PaymentMethod()
        } else {
            paymentMethod = Object.assign(new PaymentModel.PaymentMethod(), paymentMethod)
        }
        paymentMethod.note = this.note
        VuexServices.Payment.setPaymentMethod(paymentMethod)
    }

    private get selectedBranchName() {
        return this.selectedBranch ? this.selectedBranch.displayName : ""
    }

    // ------------------- select payment -------------------

    private async savePaymentMethod() {
        const { selectedMethod, selectedMethodOption, banks, filteredBank, paymentMethod } = this
        const pm = paymentMethod ? Object.assign(new PaymentModel.PaymentMethod(), paymentMethod) : new PaymentModel.PaymentMethod()
        const set = () => VuexServices.Payment.setPaymentMethod(pm)

        if (filteredBank) {
            pm.bank = filteredBank
            switch (selectedMethodOption) {
                case PaymentMethodServices.ThaiQR().id: {
                    pm.service = PaymentMethodServices.ThaiQR()
                    return set()
                }

                case PaymentMethodServices.pushNotiKPlus().id: {
                    pm.service = PaymentMethodServices.pushNotiKPlus()
                    return set()
                }

                case PaymentMethodServices.pushNotiKMA().id: {
                    pm.service = PaymentMethodServices.pushNotiKPlus()
                    return set()
                }

                case PaymentMethodServices.creditCard().id: {
                    pm.service = PaymentMethodServices.creditCard()
                    return set()
                }

                case PaymentMethodServices.unionpay().id: {
                    pm.service = PaymentMethodServices.unionpay()
                    return set()
                }

                case PaymentMethodServices.promptpay().id: {
                    pm.service = PaymentMethodServices.promptpay()
                    return set()
                }

                case PaymentMethodServices.alipay().id: {
                    pm.service = PaymentMethodServices.alipay()
                    return set()
                }

                case PaymentMethodServices.wechatpay().id: {
                    pm.service = PaymentMethodServices.wechatpay()
                    return set()
                }

                case PaymentMethodServices.internetBanking().id: {
                    pm.service = PaymentMethodServices.internetBanking()
                    return set()
                }

                case PaymentMethodServices.atm().id: {
                    pm.service = PaymentMethodServices.atm()
                    return set()
                }

                case PaymentMethodServices.cash().id: {
                    pm.service = PaymentMethodServices.cash()
                    return set()
                }

                case PaymentMethodServices.cheque().id: {
                    pm.service = PaymentMethodServices.cheque()
                    return set()
                }

            }
        } else {
            switch (selectedMethod) {
                case "push_noti": {
                    if (selectedMethodOption === "push_noti_k_plus") {
                        const bank = banks.find(b => b.id === "KBANK")
                        pm.bank = bank
                        if (bank) {
                            pm.service = bank.services.push_noti
                        }
                        return set()
                    } else if (selectedMethodOption === "push_noti_kma") {
                        const bank = banks.find(b => b.id === "KMA")
                        pm.bank = bank
                        if (bank) {
                            pm.service = bank.services.push_noti
                        }
                        return set()
                    }
                    break
                }

                case "thai_qr": {
                    const bank = banks.find(b => b.id === selectedMethodOption)
                    pm.bank = bank
                    if (bank) {
                        pm.service = bank.services.thai_qr
                    }
                    return set()
                }

                case "internet_banking": {
                    const bank = banks.find(b => b.id === selectedMethodOption)
                    if (bank) {
                        pm.bank = bank
                        pm.service = bank.services.internet_banking
                        return set()
                    }
                    break
                }

                case "credit_card": {
                    if (selectedMethodOption === PaymentMethodServices.creditCard().id) {
                        pm.service = PaymentMethodServices.creditCard()
                        return set()
                    } else if (selectedMethodOption === PaymentMethodServices.unionpay().id) {
                        pm.service = PaymentMethodServices.unionpay()
                        return set()
                    }

                    break
                }

                // bank counter cash
                case PaymentMethodServices.cash().id: {
                    const bank = this.banks.find(b => b.id === selectedMethodOption)
                    if (bank) {
                        pm.bank = bank
                        pm.service = PaymentMethodServices.cash()
                        return set()
                    }
                    break
                }

                // bank counter cheque
                case PaymentMethodServices.cheque().id: {
                    const bank = this.banks.find(b => b.id === selectedMethodOption)
                    console.log("cheque --> ", bank)
                    if (bank) {
                        pm.bank = bank
                        pm.service = PaymentMethodServices.cheque()
                        return set()
                    }
                    break
                }

                case PaymentMethodServices.atm().id: {
                    const bank = banks.find(b => b.id === selectedMethodOption)
                    console.log("ATM", bank)
                    if (bank) {
                        pm.bank = bank
                    }
                    pm.service = PaymentMethodServices.atm()
                    return set()
                }

                case PaymentMethodServices.alipay().id: {
                    pm.bank = null
                    pm.service = PaymentMethodServices.alipay()
                    return set()
                }

                case PaymentMethodServices.wechatpay().id: {
                    pm.bank = null
                    pm.service = PaymentMethodServices.wechatpay()
                    return set()
                }

                case PaymentMethodServices.promptpay().id: {
                    pm.bank = null
                    pm.service = PaymentMethodServices.promptpay()
                    return set()
                }
            }
        }
    }

    private async checkSelectReceiptMethod(event: any) {
        const value = parseInt(event.target.value);
        const isChecked = event.target.checked;
        // console.log(this.isSelectOnlineBankingMethod)
        // console.log(value)
        if (this.isSelectOnlineBankingMethod) {
            if (value == 1 && this.selectBranchReceipt && isChecked) {
                event.target.checked = isChecked;
                this.selectEmailReceipt = isChecked;
                this.selectBranchReceipt = false;
            } else if (value == 2 && this.selectEmailReceipt && isChecked) {
                event.target.checked = isChecked;
                this.selectBranchReceipt = isChecked;
                this.selectEmailReceipt = false;
            } else {
                event.target.checked = true;
            }
        } else {
            if (value == 1) {
                this.selectEmailReceipt = isChecked;
                this.selectBranchReceipt = false;
                event.target.checked = isChecked;
         
            } else if (value == 2) {
                // this.selectBranchReceipt = this.isSelectOnlineBankingMethod ? isChecked : false;
                // event.target.checked = this.isSelectOnlineBankingMethod ? isChecked : false;
                this.selectBranchReceipt = isChecked;
                this.selectEmailReceipt = false;
                event.target.checked = isChecked;
            }

            // if (!this.isSelectOnlineBankingMethod) {
            //     this.selectBranchReceipt = false;
            // }
        }
        const receiptSelectType = new Models.PaymentModel.SelectTypeReceipt();
        receiptSelectType.branch = this.selectBranchReceipt
        receiptSelectType.email = this.selectEmailReceipt
        receiptSelectType.isChooseOnlinePayment = this.isSelectOnlineBankingMethod;
        receiptSelectType.ishasReceiptemail = this.receiptPayment == null ? false : true
        await VuexServices.Payment.setReceiptType(receiptSelectType)
    }

    private acceptTermAndConditionReceipt(event: any) {
        const isChecked = event.target.checked;
        if (isChecked == true) {
            this.isAcceptConsentandTerm = true
        } else {
            this.isAcceptConsentandTerm = false
        }
    }

    private get HTMLCCEmails() {
        if (this.receiptPayment != null) {
            return this.receiptPayment.ccEmails.map((a: any) => `<span>${a}</span>`).join(",<br />")
        }
        return ``;
    }

    private get HTMLEmails() {
        if (this.receiptPayment != null) {
            return this.receiptPayment.emails.map((a: any) => `<span>${a}</span>`).join(",<br />")
        }
        return ``;
    }

    private registerReceipt() {
        this.isShowModal = this.isShowModal == false ? true : false
    }

    private closeModal() {
        this.isShowModal = false;
        this.isClickedConfirm = false;
    }

    private readCondition() {
        console.log("readCondition --> ", this.isShowModal)
        // @ts-ignore
        const $condition_receipt: any = this.$refs["condition-receipt"]
        const height = $condition_receipt.style.height;
        if (height == "0px") {
            $condition_receipt.style.height = '235px';
        } else {
            $condition_receipt.style.height = '0px';
        }
    }

    private async confirmRegisterReceipt() {
        this.isClickedConfirm = true;
        // if (this.validateEmail(this.ReceiptEmail, false) || this.validateEmail(this.ReceiptccEmail, true) || !this.isAcceptConsentandTerm) {
        //     this.loadingConfirmReceipt = false;
        //     return;
        // }
        if (this.validateEmail(this.ReceiptEmail, false) || !this.isAcceptConsentandTerm) {
            this.loadingConfirmReceipt = false;
            return;
        }
        const params = {
            emails: this.ReceiptEmail.split(",").map(email => email.trim()),
            ccEmails: this.ReceiptccEmail.split(",").map(email => email.trim()),
            bpNumber: this.user.customerNo,
            isAccept: this.isAcceptConsentandTerm == true ? 1 : 0,
        }
        try {
            this.loadingConfirmReceipt = true;
            const rs = await StoreServices.subscribeReceipt(params)
            console.log("rs --> ", rs)
            const bpNumber = this.user.customerNo
            const rsReceipt = await StoreServices.getSubscribeReceipt(bpNumber)
            this.receiptPayment = rsReceipt;
            this.isShowModal = false;
            this.isClickedConfirm = false;

            const selectTypeReceipt = VuexServices.Payment.getReceiptType();
            console.log("selectTypeReceipt --> ", selectTypeReceipt)
            if (selectTypeReceipt != null) {
                selectTypeReceipt.ishasReceiptemail = true
                await VuexServices.Payment.setReceiptType(selectTypeReceipt);
            }

        } catch (e) {
            this.loadingConfirmReceipt = false;
            DialogUtils.showErrorDialog({
                text: e.message || LanguageUtils.lang("เกิดข้อผิดพลาด กรุณาลองใหม่อีดครั้ง", "Something Wrong please try again"),
            })
        }
        this.loadingConfirmReceipt = false;
    }

    private validateEmail(requestEmail: string, isCCemail: boolean) {
        let error_text = ""
        if (requestEmail.length > 256) {
            error_text = LanguageUtils.lang("ไม่สามารถกรอกข้อมูลเกิน 256  Charecter", "Cannot fill more than 256 Charecter.")
            return error_text
        }
        if (!requestEmail) {
            error_text = isCCemail ? LanguageUtils.lang("กรุณากรอก CC อีเมล", "Please input CC email.") : LanguageUtils.lang("กรุณากรอกอีเมล", "Please input email.")
            return error_text
        }
        if(requestEmail.split(",").map(requestEmail => requestEmail.trim()).length >1)  return LanguageUtils.lang("กรุณากรอกแค่ 1 อีเมล์", "Please input only 1 email.")
        const tempEmail: string[] = []
        for (const rawEmail of requestEmail.split(",")) {
            const email = rawEmail.trim()
            if (!ValidateUtils.validateEmail(email)) {
                error_text = LanguageUtils.lang("อีเมลไม่ถูกต้อง", "Email invalid.")
                return error_text
            }

            if (tempEmail.includes(email)) {
                error_text = LanguageUtils.lang("อีเมลซ้ำ", "Duplicate email")
                return error_text
            }
            tempEmail.push(email)
        }
        return error_text
    }
}

class SelectBranch {
    menu = false
}
