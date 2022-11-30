import { Component } from "vue-property-decorator"
import Base from "../../public-base"
import OrdinaryComponent from "./components/ordinary/ordinary.vue"
import CooperationComponent from "./components/cooperation/cooperation.vue"

@Component({
    components: {
        "cpn-ordinary-register": OrdinaryComponent,
        "cpn-cooperation-register": CooperationComponent
    }
})
export default class OnlineRegisterPage extends Base {
    private isOrdinary = true
    private isAcceptedPdpa = false
    private acceptPdpa = false

    private setAcceptPdpa () {
        this.acceptPdpa = !this.acceptPdpa
    }

    private closePdpaPopup () {
        if (this.acceptPdpa) {
            this.isAcceptedPdpa = true
        }
    }

    private get disabled () {
        return this.acceptPdpa
    }

    private setOrdinary (isOrdinary: boolean) {
        this.isOrdinary = isOrdinary
    }

    private get pdpaDialog () {
        return `
                บริษัท เซ็นทรัล พัฒนา จำกัด (มหาชน) ให้ความสำคัญกับความเป็นส่วนตัวในข้อมูลส่วนบุคคลของท่าน
                เพื่อให้สอดคล้องและเป็นการปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 
                ในกรณีที่ท่านมีการมอบเอกสารยืนยันตัวบุคคลที่ให้กับเรา เช่น สำเนาบัตรประจำตัวประชาชน หรือเอกสารราชการอื่นๆ 
                อาจปรากฎข้อมูลที่ละเอียดอ่อน (Sensitive Data) เช่น เชื้อชาติ หมู่โลหิต ศาสนา 
                ท่านสามารถปกปิดข้อมูลที่ละเอียดอ่อนก่อนนำส่งเอกสารให้แก่บริษัทฯ ได้ กรณีท่านไม่ได้ปกปิดข้อมูลที่ละเอียดอ่อนดังกล่าว 
                บริษัทฯ สงวนสิทธิในการปกปิดข้อมูลที่ละเอียดอ่อนบนเอกสารที่ได้รับ โดยไม่ถือเป็นการเก็บรวบรวมข้อมูลที่ละเอียดอ่อนของท่าน
        `
    }
}
