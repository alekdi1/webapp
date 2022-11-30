import { CPMForm } from "@/pages/dashboard/models"
import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { DialogUtils, LanguageUtils, StorageUtils, TimeUtils, ValidateUtils } from "@/utils"
import { MaintainanceServices, VuexServices } from "@/services"
import { MaintainanceModel } from "@/models"
import { ROUTER_NAMES } from "@/router"
import moment from "moment"

const getTopics = () => {
    return [
        {
            id: "damaged_door",
            name: "ประตูชำรุด"
        },
        {
            id: "damage_ceiling",
            name: "ฝ้าชำรุด"
        },
        {
            id: "damaged_floor",
            name: "พื้นชำรุด"
        },
        {
            id: "water_drop_ceiling",
            name: "น้ำหยดจากฝ้า"
        },
        {
            id: "change_bulb",
            name: "เปลี่ยนหลอด"
        },
        {
            id: "full_poweroff",
            name: "ไฟดับทั้งร้าน"
        },
        {
            id: "electric_shock",
            name: "ไฟช๊อต"
        },
        {
            id: "damaged_plug",
            name: "ปลั๊กไฟชำรุด"
        },
        {
            id: "blocked_tube",
            name: "ท่อน้ำทิ้งตัน"
        },
        {
            id: "no_water",
            name: "น้ำไม่ไหล"
        },
        {
            id: "leaking",
            name: "ท่อน้ำหยด, ซึม"
        },
        {
            id: "celing_floor_leaking",
            name: "น้ำซึมพื้น, ผนัง"
        },
        {
            id: "hot_air_conditioner",
            name: "แอร์ไม่เย็น"
        },
        {
            id: "leaking_air_conditioner",
            name: "น้ำแอร์รั่ว"
        },
        {
            id: "noisy_air_conditioner",
            name: "แอร์มีเสียงดัง"
        },
        {
            id: "smelly_air_conditioner",
            name: "แอร์มีกลิ่น"
        }
    ].map(i => {
        const t = new Topic()
        t.id = i.id
        t.name = i.name
        return t
    })
}

const getTimeRange = () => {
    return [
        {
            label: "9:00-12:00",
            maximumTime: moment().set("hour", 12).set("minute", 0),
        },
        {
            label: "12:00-15:00",
            maximumTime: moment().set("hour", 15).set("minute", 0),
        },
        {
            label: "15:00-18:00",
            maximumTime: moment().set("hour", 18).set("minute", 0),
        },
        {
            label: "18:00-21:00",
            maximumTime: moment().set("hour", 21).set("minute", 0),
        }
    ].map(i => {
        const t = new TimeRange()
        t.label = i.label
        t.maximumTime = i.maximumTime
        return t
    })
}

@Component
export default class RepairFormPage extends Base {
    @VuexServices.Root.VXMaintainanceItem()
    private previousMaintainance!: MaintainanceModel.Maintainance

    private form = new MaintainanceForm()

    private get bpNo() {
        return this.user.customerNo || String(this.$route.query.bpNo || "")
    }

    private get tenantNo() {
        return this.previousMaintainance?.tenantCode || String(this.$route.query.tenantNo || "") || StorageUtils.getItem("QR_TENANT_NO")
    }

    private async mounted() {
        await this.restoreForm()
    }

    private formatedDesc(desc: string) {
        const idxStart = desc.indexOf("[")
        const idxEnd = desc.indexOf("]")
        if (idxStart > -1 && idxEnd > idxStart) {
            return desc.substring(idxEnd + 1)
        }
        return desc
    }

    private async restoreForm() {
        if (this.previousMaintainance) {
            const pv = await this.previousMaintainance
            this.form.topic.value = pv.typeName === "อื่นๆ" ? pv.typeOther : pv.typeName
            const selectedTopic = this.form.topics.find(t => t.name === this.form.topic.value)
            if (selectedTopic) {
                this.form.selectTopic(selectedTopic)
            }
            const desc = this.formatedDesc(pv.desc)
            this.form.moreDetail.value = desc
            this.form.time = pv.time.requestTime
            this.form.contactName.value = pv.contactName
            this.form.phone.value = pv.phoneNumber

            const imgs = pv.imageUrls
            if (imgs.length > 0) {
                for (const [i, url] of imgs.entries()) {
                    this.form.imgs[i].value = url
                }
            }
        }
    }

    private async submitMaintainanceForm() {
        this.form.validated = true

        if (this.form.allValidated) {
            this.form.loading = true
            try {
                const { contactName, imgs, phone, topic, moreDetail, date, time } = this.form
                const requestCreateMaintainance = {
                    ...!this.user.isQRUser && { userId: this.user.id },
                    bpId: this.bpNo,
                    tenantId: this.tenantNo,
                    topic: topic.value,
                    description: moreDetail.value,
                    images: (() => {
                        const files: (File | string)[] = []
                        for (const img of imgs) {
                            const { value, file } = img
                            if (file) {
                                files.push(file)
                            } else if (value) {
                                files.push(value)
                            }
                        }
                        return files
                    })(),
                    contactName: contactName.value,
                    phone: phone.value,
                    date: date,
                    time: time,
                }
                console.log("requestCreateMaintainance ", requestCreateMaintainance)
                const rs = await MaintainanceServices.createMaintainance(requestCreateMaintainance);

                if (rs === "Created") {
                    await VuexServices.Root.setMaintainanceItem(null)

                    this.$router.replace({
                        name: ROUTER_NAMES.maintainance_form_success,
                        query: {
                            bpNo: this.bpNo,
                            tenantNo: this.tenantNo
                        }
                    })
                    return
                }

                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang(`การส่งข้อมูลล้มเหลว: ${rs.result}`, `Error while sending data: ${rs}`)
                })

            } catch (e) {
                DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("การส่งข้อมูลล้มเหลว", "Error while sending data")
                })
            }

            this.form.loading = false
        }
    }
}

class MaintainanceForm {
    topic = new CPMForm.FormValue()
    topics = getTopics()
    selectedTopic: Topic | null = null
    moreDetail = new CPMForm.FormValue()
    date = ""
    selectedDate = ""
    time = ""
    times = getTimeRange()
    selectedTime: TimeRange | null = null
    contactName = new CPMForm.FormValue()
    phone = new CPMForm.FormValue()
    loading = false
    validated = false
    maxInfo = 120
    minDate = moment().format("YYYY-MM-DD")

    imgs = [
        new CPMForm.ImageFormValue(),
        new CPMForm.ImageFormValue(),
        new CPMForm.ImageFormValue()
    ]

    selectTopic(t: Topic) {
        this.selectedTopic = t
        this.topic.value = t.name
    }

    isTopicSelected(t: Topic) {
        return this.selectedTopic?.id === t.id
    }

    selectDate() {
        /** `this.selectedDate` format: YYYY-MM-DD */
        this.date = this.selectedDate + "T00:00"
    }

    get displayDate() {
        if (!this.date) {
            this.selectedDate = this.minDate;
            this.selectDate();
            return TimeUtils.convertToLocalDateFormat(moment(this.minDate, "YYYY-MM-DD"))
        } else {
            const currentSelectedDate = moment(this.selectedDate, "YYYY-MM-DD")
            return TimeUtils.convertToLocalDateFormat(currentSelectedDate)
        }
    }

    selectTimeRange(t: TimeRange) {
        if (this.selectedTime?.label == t.label) {
            this.selectedTime = null
            this.time = ""
        } else {
            this.selectedTime = t
            this.time = t.label
        }
    }

    disabledTimeRange(t: TimeRange) {
        const currentdate = new Date();
        const closetime: string = t.label.split("-")[1]
        const currenttime: string = currentdate.toTimeString().split(" ")[0]

        if (!this.date) {
            return true
        } else {
            const selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
            const checkDate = new Date(this.selectedDate);
            const result = this.getTime(currenttime) >= this.getTime(closetime);
            if (result && (checkDate <= new Date())) {
                return true
            }
            return selectedDate.isSame(t.maximumTime) ? selectedDate.isAfter(t.maximumTime) : false
        }
    }

    getTime(time: string) {
        const currentdate = new Date();
        const firstparttime = time.substring(0, 2);
        const secondparttime = time.substring(3, 5);
        return new Date(currentdate.getFullYear(), currentdate.getMonth(), 2, parseInt(firstparttime), parseInt(secondparttime), 0, 0);
    }

    isTimeSelected(t: TimeRange) {
        return this.selectedTime?.label === t.label
    }

    onFileChange(e: Event, id: string) {
        const idx = this.imgs.findIndex(img => img.id === id)
        if (idx > -1) {
            const img = this.imgs[idx]
            img.onFileInput(e)
        }
        this.imgs = [...this.imgs]
    }

    remove(id: string) {
        const idx = this.imgs.findIndex(img => img.id === id)
        if (idx > -1) {
            const img = this.imgs[idx]
            img.file = null
            img.fileDataUrl = ""
        }
        this.imgs = [...this.imgs]
    }

    get errors() {
        const { lang } = LanguageUtils
        return {
            topic: (v => {
                if (!v) return lang("กรุณาระบุการแจ้งซ่อม", "Please input topic")
                return null
            })(this.topic.value),

            date: (v => {
                if (!v) return lang("กรุณาระบุวันที่เข้าซ่อม", "Please select date")
                return null
            })(this.date),

            contactName: (v => {
                if (!v) return lang("กรุณาระบุเวลาเข้าซ่อม", "Please select time")
                return null
            })(this.contactName.value),

            phone: (v => {
                if (!v) return lang("กรุณาระบุเบอร์โทรศัพท์มือถือ", "Please input phone number")
                if (!ValidateUtils.validatePhone(v)) return lang("เบอร์โทรศัพท์มือถือไม่ถูกต้อง", "Phone number invalid")
                return null
            })(this.phone.value)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }

    get submitDisabled() {
        return !this.validated ? false : !this.allValidated
    }
}

class Topic {
    id = ""
    name = ""
}

class TimeRange {
    label = ""
    maximumTime = moment()
}
