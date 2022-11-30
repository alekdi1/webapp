import { StoreServices } from "@/services"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import Names from "../page-names"
import { CPMForm } from "@/pages/dashboard/models"

const t = (k: string) => LanguageUtils.i18n.t("pages.reg_inv_receipt." + k).toString()

const SERVICES = {
    e_invoice: StoreServices.SUBSCRIBE_SERVICES.invoice,
    e_receipt: StoreServices.SUBSCRIBE_SERVICES.receipt
}

const MESSAGE = {
    success_e_invoice: "เราจะเริ่มส่งใบแจ้งหนี้อีเล็กทรอนิกส์ให้คุณในเดือนถัดไป",
    cancel_e_invoice: "เราได้ยกเลิกใบแจ้งหนี้อีเล็กทรอนิกส์ให้คุณเรียบร้อยแล้ว",
    success_e_recp: "เราจะเริ่มส่งใบเสร็จรับเงินอีเล็กทรอนิกส์ให้คุณในเดือนถัดไป",
    cancel_e_recp: "เราได้ยกเลิกใบเสร็จรับเงินอีเล็กทรอนิกส์ให้คุณเรียบร้อยแล้ว",
    condition: `<div class=WordSection1>
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
            </div>`,
    term: `<div class=WordSection1>
                <p class=MsoNormal style='margin-bottom:18.75pt;line-height:normal'><span lang=TH
                style='font-family:CPN;color:black'>ยินดีต้อนรับและขอขอบคุณท่านที่เลือกใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์</span><span
                style='font-family:CPN;color:black'><br>
                <span lang=TH>โปรดอ่านข้อตกลงและเงื่อนไขการใช้บริการโดยละเอียดก่อนการสมัครใช้บริการ
                </span></span>
                </p>
                <p class=MsoNormal style='margin-bottom:18.75pt;line-height:normal'><span lang=TH
                style='font-family:CPN;color:black'>ในข้อตกลงนี้ ให้ <b>ผู้ขอใช้บริการ</b>
                หมายถึง ผู้เช่า/ผู้รับบริการ พื้นที่ในศูนย์การค้าของ กลุ่มบริษัท เซ็นทรัลพัฒนา จำกัด
                (มหาชน) (<b>บริษัท</b></span><span style='font-family:CPN;color:black'>) <span
                    lang=TH>โดยบริษัทได้อนุมัติให้ใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์ <b>ใบแจ้งหนี้อิเล็กทรอนิกส์</b>
                หมายถึง เอกสารสำหรับการแจ้งยอดค่าใช้จ่าย ประจำเดือน เพื่อใช้ในการอ้างอิง
                ตรวจสอบ ชำระเงิน รวมไปถึงการสื่อสารระหว่างบริษัท กับผู้เช่า/ผู้รับบริการ
                ใบแจ้งหนี้อิเล็กทรอนิกส์ ที่ผู้ขอใช้บริการจะได้รับ ในลักษณะเอกสารอิเล็กทรอนิกส์
                (</span>PDF File) <span lang=TH>ผ่านจดหมายอิเล็กทรอนิกส์ (</span>E-mail) <span
                    lang=TH>ของผู้ขอใช้บริการ ซึ่งผู้ขอใช้บริการจะต้องทำการกรอกรหัสผ่าน (</span>Password)
                <span lang=TH>จึงจะทำการเปิดเอกสารได้ </span></span>
                </p>
                <p class=MsoNormal style='margin-bottom:18.75pt;line-height:normal'><span lang=TH
                style='font-family:CPN;color:black'>ข้อตกลงนี้ใช้บังคับระหว่าง บริษัท
                ในกลุ่มบมจ.เซ็นทรัลพัฒนา กับ ผู้ขอใช้บริการ
                โดยผู้ขอใช้บริการยินยอมผูกพันและปฎิบัติ
                ตามข้อตกลงและเงื่อนไขการใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์
                โดยการตอบตกลงด้านล่างนี้ ให้ถือว่าผู้ขอใช้บริการ
                เข้าใจและตกลงที่จะใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์ตามข้อกำหนดและเงื่อนไขในข้อตกลงนี้ทุกประการ
                </span>
                </p>
                <p class=MsoNormal style='line-height:normal'><b><span lang=TH
                style='font-family:CPN;color:black'>เงื่อนไขบริการ รับใบแจ้งหนี้อิเล็กทรอนิกส์ </span></b></p>
                <ul type=disc>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์
                    คือ การให้บริการส่งใบแจ้งหนี้ ในรูปแบบอิเล็กทรอนิกส์ บริษัท
                    จะจัดส่งรายละเอียดในลักษณะเอกสารอิเล็กทรอนิกส์ (</span>PDF File) <span
                        lang=TH>ให้แก่ท่านผ่านทางระบบจดหมายอิเล็กทรอนิกส์
                    ที่ท่านได้แจ้งลงทะเบียนไว้ในการสมัครใช้บริการนี้ โดยทางบริษัท
                    จะจัดส่งให้แก่ท่านเป็นประจำทุกเดือน
                    หรือทุกช่วงระยะเวลาที่บริษัท กำหนด
                    ซึ่งผู้ขอใช้บริการจะต้องทำการกรอกรหัสผ่าน (</span>Password) <span lang=TH>เพื่อเข้าใช้บริการ
                    ตรวจสอบ หรือดำเนินการจัดพิมพ์ใบแจ้งหนี้บัญชีอิเล็กทรอนิกส์
                    ของผู้ขอใช้บริการได้ด้วยตนเอง </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ผู้ขอใช้บริการจะต้องลงทะเบียนขอรับบริการนี้
                    กับบริษัท โดยสมบูรณ์ผ่าน </span>Central Pattana Serve Application <span
                        lang=TH>ก่อนที่จะสามารถรับบริการนี้ได้ </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ผู้ขอใช้บริการรับทราบดีกว่า
                    ผู้ขอใช้บริการมีหน้าที่ดูแล รักษาข้อมูลส่วนตัวของผู้ขอใช้บริการ เช่น
                    รหัสผ่าน
                    ซึ่งถือเป็นข้อมูลที่มีความสำคัญด้วยความรับผิดชอบของผู้ขอใช้บริการเอง
                    หากผู้ขอใช้บริการประมาทเลินเล่อ จนเป็นสาเหตุให้มีผู้ใด ทุจริต
                    ลักลอบนำข้อมูลส่วนตัวของผู้ขอใช้บริการสมัครเข้าใช้บริการรับใบแจ้งหนี้อิเล็กทรอนิกส์
                    กับบริษัท และก่อให้เกิดความเสียหายกับผู้ขอใช้บริการแล้ว บริษัท
                    ขอสงวนสิทธิ์ที่จะไม่รับผิดชอบต่อผู้ขอใช้บริการ ไม่ว่ากรณีใดๆ
                    จากความเสียหายที่เกิดขึ้น และหากบริษัทได้รับความเสียหายใดๆ
                    จากความประมาทเลินเล่อดังกล่าวของผู้ขอใช้บริการแล้ว
                    ผู้ขอใช้บริการต้องรับผิดชอบในความเสียหายที่เกิดขึ้นนั้นต่อบริษัท </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ในการรับข้อมูลใบแจ้งหนี้อิเล็กทรอนิกส์
                    ผู้ขอใช้บริการและบริษัท ตกลงให้ถือเสมือนการจัดส่ง
                    และได้รับใบแจ้งหนี้และเอกสารอื่นๆ ในรูปแบบเอกสารใบแจ้งหนี้รายเดือนปรกติ
                    เป็นไปตามที่กฎหมายที่เกี่ยวข้องกำหนด</span> <br>
                    <span
                        lang=TH>และตกลงให้บริษัทสามารถอ้างอิงข้อมูลใบแจ้งหนี้อิเล็กทรอนิกส์เป็นต้นฉบับเอกสารที่เป็นพยานหลักฐานในการพิสูจน์ว่ามีการจัดส่งไปยังผู้ขอใช้บริการและผู้ขอใช้บริการได้รับใบแจ้งหนี้แล้ว
                    </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>เมื่อผู้ขอใช้บริการแจ้งความจำนงขอสมัครใช้บริการกับบริษัท
                    เรียบร้อยแล้ว บริษัท จะจัดส่งจดหมายแจ้งทางที่อยู่อิเล็กทรอนิกส์ หรือ </span>E-mail
                    Address <span lang=TH>เพื่อเป็นการแจ้งเตือน
                    พร้อมส่งรายละเอียดในลักษณะเอกสารอิเล็กทรอนิกส์ (</span>PDF File) <span
                        lang=TH>ให้แก่ผู้ขอใช้บริการตรวจสอบใบแจ้งหนี้อิเล็กทรอนิกส์
                    ล่วงหน้าก่อนถึงกำหนดการชำระหนี้ในแต่ละงวดไม่น้อยกว่า
                    </span>3 <span lang=TH>วัน โดยในจดหมายอิเล็กทรอนิกส์แจ้งเตือนดังกล่าว
                    ซึ่งผู้ขอใช้บริการจะต้องการกรอกรหัสผ่าน
                    (</span>Password) <span lang=TH>เพื่อเข้าใช้บริการใบแจ้งหนี้อิเล็กทรอนิกส์
                    ซึ่งประกอบด้วยข้อมูลเกี่ยวกับค่าใช้จ่ายต่างๆ ของผู้ใช้บริการ รวมถึงแต่ไม่จำกัดเพียง
                    ข้อมูลเกี่ยวกับยอดค้างชำระ วันที่สรุปยอด วันที่ครบกำหนดชำระเงิน เป็นต้น </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ในการเข้าถึง การเก็บข้อมูล
                    หรือการพิมพ์ รายละเอียดของเงื่อนไขหรือใบแจ้งหนี้อิเล็กทรอนิกส์นี้
                    หรือเพื่อเก็บบันทึก ผู้ขอใช้บริการควรใช้โปรแกรม </span>Internet Explorer
                    version 5.5 <span lang=TH>หรือสูงกว่า และควรลงโปรแกรม </span>Adobe Acrobat
                    Reader plug-in <span lang=TH>หรือโปรแกรมอื่นที่ใช้สำหรับการเปิดใช้ไฟล์นามสกุล
                    </span>PDF <span lang=TH>หรือในรูปแบบ </span>PDF File <span lang=TH>ได้ </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ผู้ขอใช้บริการสามารถพิมพ์ใบแจ้งหนี้ดังกล่าว
                    เพื่อชำระเงินตามช่องทางที่บริษัทได้ประกาศแจ้งไว้ เพื่อความชัดเจนและถูกต้อง
                    แนะนำให้ใช้เครื่องพิมพ์ที่มีความละเอียดในการพิมพ์ที่สูงกว่า </span>600 dpi
                    </span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริษัท
                    จะจัดส่งใบแจ้งหนี้อิเล็กทรอนิกส์ในรูปแบบของ </span>PDF File <span lang=TH>ให้ผู้ใช้บริการทาง
                    </span>E-mail Address <span lang=TH>ที่ผู้ขอใช้บริการระบุไว้
                    ในการสมัครใช้บริการแทนการจัดส่งทางช่องทางไปรษณีย์ ทั้งนี้
                    ผู้ขอใช้บริการสามารถเรียกดูใบแจ้งหนี้อิเล็กทรอนิกส์ได้ที่ </span>E-mail
                    Address <span lang=TH>ที่ผู้ขอใช้บริการระบุ
                    หากผู้ขอใช้บริการมีความประสงค์จะเปลี่ยนแปลง </span>E-mail Address <span
                        lang=TH>สามารถแจ้งการเปลี่ยนแปลงผ่านช่องทาง </span>Central Pattana Serve
                    Application </span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริการใบแจ้งหนี้ทางอิเล็กทรอนิกส์นี้
                    บริษัท ยังมิได้คิดค่าธรรมเนียมการสมัครหรือการใช้บริการ
                    รวมถึงค่าธรรมเนียมในกรณีขอเปลี่ยนแปลงแก้ไขข้อมูลหรือยกเลิกบริการ </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริษัท
                    ขอสงวนสิทธิ์ในการระงับการให้บริการส่งใบแจ้งหนี้อิเล็กทรอนิกส์
                    ให้แก่ผู้ขอใช้บริการบางรายเมื่อผู้ขอใช้บริการมีคุณสมบัติไม่ตรงกับเงื่อนไขของบริษัท
                    โดยบริษัท จะดำเนินการจัดส่งใบแจ้งหนี้ทางปกติแทน </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริษัท ขอสงวนสิทธิ์ในการเปลี่ยนแปลงรูปแบบข้อมูล
                    ระยะเวลาการจัดส่งข้อมูล หรือส่งจดหมายอิเล็กทรอนิกส์ และรูปแบบไฟล์ข้อมูล
                    หรือรายละเอียดอื่นใดของการให้บริการใบแจ้งหนี้อิเล็กทรอนิกส์
                    ที่จะจัดส่งให้ผู้ใช้บริการ โดยบริษัท
                    จะแจ้งให้ทราบล่วงหน้าภายในระยะเวลาอันสมควร </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>การให้บริการใบแจ้งหนี้อิเล็กทรอนิกส์
                    นี้ มีขึ้นเพื่อประโยชน์ในการตรวจสอบค่าใช้จ่าย รายละเอียดต่างๆ
                    ของผู้ขอใช้บริการเท่านั้น
                    ผู้ขอใช้บริการไม่สามารถใช้เอกสารนี้เพื่ออ้างอิงหรือเป็นหลักฐานประกอบการสมัครใช้บริการ
                    หรือใช้เพื่อการอื่นใดในทางที่จะทำให้บริษัท </span>เซ็นทรัลพัฒนา จำกัด (มหาชน) <span lang=TH>ได้รับความเสียหายโดยเด็ดขาด
                    </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>บริษัท
                    ขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดและเงื่อนไขการใช้บริการรับใบแจ้งหนี้บัญชีอิเล็กทรอนิกส์
                    ได้ตามที่บริษัทเห็นสมควร นอกจากนี้บริษัท
                    มีสิทธิ์ที่จะยกเลิกหรือระงับการบริการดังล่าวได้ ไม่ว่าทั้งหมดหรือบางส่วน
                    หรือเฉพาะแต่ผู้ใช้บริการรายใด รายหนึ่งเมื่อใดก็ได้
                    โดยบริษัทจะแจ้งให้ผู้ขอใช้บริการทราบล่วงหน้าภายในระยะเวลาอันสมควร </span></span>
                </li>
                <li class=MsoNormal style='color:black;margin-bottom:18.75pt;line-height:normal'><span
                    style='font-family:CPN'>- <span lang=TH>ผู้ขอใช้บริการตกลงว่า
                    บริษัทจะไม่รับผิดต่อการกระทำใดๆ
                    ที่เป็นสิทธิของบริษัทหรือจากการให้บริการตามที่ระบุไว้ในข้อตกลงและเงื่อนไขนี้
                    โดยผู้ขอใช้บริการจะไม่ยกขึ้นเป็นข้ออ้างเพื่อเรียกร้องค่าเสียหายใดๆ
                    หรือฟ้องร้องทั้งในทางแพ่งและทางอาญาต่อบริษัททั้งสิ้น
                    เว้นแต่ความเสียหายหรือความรับผิดนั้นเกิดจากการกระทำโดยจงใจหรือประมาทเลินเล่ออย่างร้ายแรงของบริษัท
                    </span></span>
                </li>
                </ul>
                <p class=MsoNormal><span style='line-height:107%;font-family:CPN'>&nbsp;</span></p>
            </div>`,
}

@Component({
    name: Names.reg_e_invoice_receipt_detail
})
export default class RegEInvoiceReceiptDetailPage extends Base {
    private loading: string | boolean = false
    private form = new SubscriptionForm()
    private isSubscribed = false
    private acknowledge = {
        subtitle: "",
        title: "",
    }
    private emails: string[] = []
    private ccEmails: string[] = []
    private isAcceptConsentandTerm = false;
    private discription = ""
    private isShowModal = false;

    private get storeId() {
        return this.$route.params.store_id
    }

    private get serviceId() {
        return this.$route.params.service
    }

    private get isReceipt() {
        return this.serviceId === "receipt"
    }

    private async mounted() {
        await this.getRegisterData()
    }

    private get HTMLCCEmails() {
        return this.ccEmails.map(email => `<span>${email}</span>`).join(",<br />")
    }

    private get HTMLEmails() {
        return this.emails.map(email => `<span>${email}</span>`).join(",<br />")
    }

    private backToHome() {
        this.$router.replace({
            path: this.$route.path
        })
    }

    private get showResult() {
        return this.$route.query.result === "success"
    }

    private async getRegisterData() {
        this.loading = true
        try {
            const { selectedService } = this
            const bpNumber = this.user.customerNo
            this.form.emails.value = !this.isEdit ? this.user.email : this.form.emails.value

            if (selectedService.e_invoice) {
                const rs = await StoreServices.getSubscribeInvoice(bpNumber)
                console.log("Invoice", rs)
                this.form.CCEmails.value = rs.ccEmails.join(",")
                this.form.emails.value = rs.emails.join(",")
                this.ccEmails = rs.ccEmails
                this.emails = rs.emails
                this.isSubscribed = true
                this.form.isAcceptTheTerms = rs.isAccept == 1 ? true : false; //
                this.isAcceptConsentandTerm = rs.isAccept == 1 ? true : false; //
            } else if (selectedService.e_receipt) {
                const rs = await StoreServices.getSubscribeReceipt(bpNumber)
                console.log("Receipt", rs)
                this.form.CCEmails.value = rs.ccEmails.join(",")
                this.form.emails.value = rs.emails.join(",")
                this.ccEmails = rs.ccEmails
                this.emails = rs.emails
                this.isSubscribed = true
                this.form.isAcceptTheTerms = rs.isAccept == 1 ? true : false; //
                this.isAcceptConsentandTerm = rs.isAccept == 1 ? true : false; //
            } else {
                throw new Error("service not match")
            }
            console.log("this.form --> ", this.form)

        } catch (e) {
            const { response } = e
            if (response?.status !== 404) {
                DialogUtils.showErrorDialog({
                    text: response?.data?.message || e.message || "Cannot get data"
                })
            }
        }
        this.loading = false
    }

    private get selectedService() {
        const { serviceId } = this
        return {
            e_invoice: serviceId === SERVICES.e_invoice,
            e_receipt: serviceId === SERVICES.e_receipt
        }
    }

    private get text() {
        return {
            page_title: this.isReceipt ? t("title_reg_e_receipt") : t("title_reg_e_invoice"),
            cancel_e_invoice: this.isReceipt ? t("cancel_e_receipt") : t("cancel_e_invoice"),
            reg_e_invoice: this.isReceipt ? t("reg_e_receipt") : t("reg_e_invoice"),
            e_invoice_desc: t("e_invoice_desc"),
            e_receipt_desc: t("e_receipt_desc"),
            edit: this.$t("edit").toString(),
            multi_email_desc: t("multi_email_desc"),
            submitted_message: this.$t("pages.reg_e_inv_recp.submitted_message"),
            accept_condition: LanguageUtils.lang("ข้าพเจ้ายอมรับเงื่อนไข", "I accept the terms"),
            terms_text: LanguageUtils.lang("ข้อตกลงและเงื่อนไข", "Terms and Conditions"),
            text_close: LanguageUtils.lang("ปิด", "Close"),
        }
    }

    private get isEdit() {
        return this.$route.query.action === "edit"
    }

    private get showForm() {
        return this.isEdit || !this.isSubscribed
    }

    private async submitReg() {
        this.form.validated = true
        this.form.isAcceptTheTerms = this.isAcceptConsentandTerm;
        if (!this.form.allValidated) {
            return
        }
        this.loading = true
        try {

            const { selectedService, form } = this
            const params = {
                emails: form.emailsArray,
                ccEmails: form.ccEmailsArray,
                bpNumber: this.user.customerNo,
                isAccept: form.isAcceptTheTerms == true ? 1 : 0,
            }

            if (selectedService.e_invoice) {
                const rs = await StoreServices.subscribeInvoice(params)
            } else if (selectedService.e_receipt) {
                const rs = await StoreServices.subscribeReceipt(params)
            } else {
                throw new Error("service not match")
            }

            this.isSubscribed = true
            this.emails = form.emailsArray
            this.ccEmails = form.ccEmailsArray
            this.acknowledge.subtitle = this.selectedService.e_invoice ? MESSAGE.success_e_invoice : MESSAGE.success_e_recp
            this.showSuccess()
            this.getRegisterData()
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private editSubscribed() {
        this.form = new SubscriptionForm()
        this.form.emails.value = this.emails.join(",")
        this.form.CCEmails.value = this.ccEmails.join(",")
        this.$router.push({
            path: this.$route.path,
            query: {
                action: "edit"
            }
        })
    }

    private async saveEdit() {
        this.form.isAcceptTheTerms = this.isAcceptConsentandTerm;
        this.form.validated = true
        if (!this.form.allValidated) {
            return
        }

        this.loading = true
        try {
            const { selectedService, form } = this

            const params = {
                emails: form.emailsArray,
                ccEmails: form.ccEmailsArray,
                bpNumber: this.user.customerNo,
                isAccept: form.isAcceptTheTerms == true ? 1 : 0
            }

            if (selectedService.e_invoice) {
                const rs = await StoreServices.editSubscribeInvoice(params)
            } else if (selectedService.e_receipt) {
                const rs = await StoreServices.editSubscribeReceipt(params)
            } else {
                throw new Error("service not match")
            }
            this.isSubscribed = true
            this.emails = form.emailsArray
            this.ccEmails = form.ccEmailsArray
            this.acknowledge.subtitle = this.selectedService.e_invoice ? MESSAGE.success_e_invoice : MESSAGE.success_e_recp
            this.showSuccess()
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private async cancelSubscribed() {
        this.loading = "cancel"
        try {
            const { selectedService } = this

            if (selectedService.e_invoice) {
                const rs = await StoreServices.deleteSubscribeInvoice(this.user.customerNo)
                console.log("Edit Invoice ", rs)
            } else if (selectedService.e_receipt) {
                const rs = await StoreServices.deleteSubscribeReceipt(this.user.customerNo)
                console.log("Edit Receipt ", rs)
            } else {
                throw new Error("service not match")
            }
            this.isAcceptConsentandTerm = false;
            this.isSubscribed = false
            this.form = new SubscriptionForm()
            this.acknowledge.subtitle = this.selectedService.e_invoice ? MESSAGE.cancel_e_invoice : MESSAGE.cancel_e_recp
            this.showSuccess()
        } catch (e) {
            console.log(e.message)
            DialogUtils.showErrorDialog({
                text: e.message || e
            })
        }
        this.loading = false
    }

    private showSuccess() {
        this.$router.replace({
            path: this.$route.path,
            query: {
                result: "success",
                ts: new Date().getTime().toString()
            }
        })
    }

    private checkReadNotifications(event: any) {
        const value = event.target.value;
        const isChecked = event.target.checked;
        if (isChecked) {
            this.form.isAcceptTheTerms = true;
        } else {
            this.form.isAcceptTheTerms = false;
        }
        this.isAcceptConsentandTerm = this.form.isAcceptTheTerms
    }

    private readCondition() {
        const { selectedService } = this
        if (selectedService.e_invoice) {
            this.discription = MESSAGE.term
        } else if (selectedService.e_receipt) {
            this.discription = MESSAGE.condition
        }
        this.isShowModal = true;
        // const routeData = this.$router.resolve({ path: '/help/term-and-condition' });
        // console.log("routeData ", routeData)
        // window.open(routeData.href, '_blank');
    }

    private closeModal() {
        this.isShowModal = false;
        console.log("isShowModal --> ", this.isShowModal)
    }
}

class SubscriptionForm {
    validated = false
    emails = new CPMForm.FormValue()
    CCEmails = new CPMForm.FormValue()
    isAcceptTheTerms = false;

    get MAX_LENGTH() {
        return 256
    }

    get allEmailSize() {
        const emailsStr = String(this.emails.value).replaceAll(",", "").replaceAll(" ", "")
        const CCEmailsStr = String(this.CCEmails.value).replaceAll(",", "").replaceAll(" ", "")
        return emailsStr.length + CCEmailsStr.length
    }

    get errors() {
        const { lang } = LanguageUtils
        const { emails, CCEmails, emailsArray, isAcceptTheTerms } = this
        const lengthError = this.allEmailSize > this.MAX_LENGTH ? lang("ไม่สามารถกรอกข้อมูลเกิน 256  Charecter", "Cannot fill more than 256 Charecter.") : null

        const validateEmails = (emails: string) => (
            emails.split(",").every(email => ValidateUtils.validateEmail(email.trim()))
        )

        return {
            emails: (v => {
                if (!v) return lang("กรุณากรอกอีเมล์", "Please input email.")
                if (!validateEmails(v)) return lang("อีเมล์ไม่ถูกต้อง", "Email invalid.")
                if (emailsArray.length > 1) return lang("กรุณากรอกแค่ 1 อีเมล์", "Please input only 1 email.")
                return lengthError
            })(emails.value),

            // ccemails: (v => {
            //     if (!v) return lang("กรุณากรอก CC อีเมล์", "Please input CC email.")
            //     if (lengthError) return lengthError

            //     const tempEmail: string[] = []
            //     for (const rawEmail of v.split(",")) {
            //         const email = rawEmail.trim()
            //         if (!ValidateUtils.validateEmail(email)) {
            //             return lang("อีเมล์ไม่ถูกต้อง", "Email invalid.")
            //         }

            //         if (tempEmail.includes(email)) {
            //             return lang("อีเมล์ซ้ำ", "Duplicate email")
            //         }

            //         tempEmail.push(email)
            //     }

            //     return null
            // })(CCEmails.value),

            isAcceptTheTerms: (v => {
                if (v == false) return lang("กรุณากดยอมรับเงื่อนไข", "Please accept the terms and conditions.")
                return null
            })(isAcceptTheTerms),
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get emailsArray() {
        return this.emails.value.split(",").map(email => email.trim())
    }

    get ccEmailsArray() {
        return this.CCEmails.value.split(",").map(email => email.trim())
    }
}

