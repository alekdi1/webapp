import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { ROUTER_NAMES } from "@/router"
import { MaintainanceServices, VuexServices } from "@/services"
import { DialogUtils, StorageUtils } from "@/utils"

function getTrackingTemplate () {
    const trackingDots: TrackingDot[] = []
    for (let i = 1; i <= 6; i++) {
        trackingDots.push(new TrackingDot(i))
    }
    return trackingDots
}

@Component
export default class MaintainanceSurveyPage extends Base {
    private selectedRate = this.defaultRate
    private currentQuestionIdx = 0
    private questionForm = new QuestionForm()
    private description = ""
    private isStarting = true
    private isClosed = true
    private trackingDots = getTrackingTemplate()

    private get surveyQuestion () {
        if (this.currentQuestionIdx < 4) {
            return this.questionForm.questions[this.currentQuestionIdx]
        }

        if (this.isDescriptionQuestion) {
            return new Question("5.คำแนะนำเพิ่ม")
        }

        return new Question("6.การแจ้งซ่อมของคุณได้รับการแก้ไขเรียบร้อยแล้วใช่หรือไม่")
    }

    private get rateButtons () {
        return [
            new RateButton (
                "แย่",
                require("@/assets/images/icons/survey-rate-1-active.svg"),
                require("@/assets/images/icons/survey-rate-1-deactive.svg"),
                1
            ),
            new RateButton (
                "ไม่ค่อยประทับใจ",
                require("@/assets/images/icons/survey-rate-2-active.svg"),
                require("@/assets/images/icons/survey-rate-2-deactive.svg"),
                2
            ),
            new RateButton (
                "พอใช้",
                require("@/assets/images/icons/survey-rate-3-active.svg"),
                require("@/assets/images/icons/survey-rate-3-deactive.svg"),
                3
            ),
            new RateButton (
                "ดี",
                require("@/assets/images/icons/survey-rate-4-active.svg"),
                require("@/assets/images/icons/survey-rate-4-deactive.svg"),
                4
            ),
            new RateButton (
                "ดีมาก",
                require("@/assets/images/icons/survey-rate-5-active.svg"),
                require("@/assets/images/icons/survey-rate-5-deactive.svg"),
                5
            )
        ]
    }

    private get defaultRate () {
        return new RateButton (
            "",
            require("@/assets/images/icons/survey-rate-4-deactive.svg"),
            require("@/assets/images/icons/survey-rate-4-deactive.svg"),
            0
        )
    }

    private get rateImages () {
        return this.selectedRate ? this.selectedRate.activeImg : require("@/assets/images/icons/survey-rate-4-deactive.svg")
    }

    private get rateCaption () {
        return this.selectedRate ? this.selectedRate.caption : ""
    }

    private isSelectedRate (itm: RateButton) {
        return this.selectedRate ? itm.value === this.selectedRate.value : false
    }

    private get isFirst () {
        return this.currentQuestionIdx === 0
    }

    private get isDescriptionQuestion () {
        return this.currentQuestionIdx  === 4
    }
    
    private get isLast () {
        return this.currentQuestionIdx === 5
    }

    private toggleIsClosed (isClosed: boolean) {
        this.isClosed = isClosed
    }

    
    private displayActiveDot (idx: number) {
        return this.currentQuestionIdx === idx
    }

    private back () {
        this.currentQuestionIdx = this.currentQuestionIdx - 1
        if (this.currentQuestionIdx < 5) {
            const rate = this.questionForm.questions[this.currentQuestionIdx].rate
            this.selectedRate = this.rateButtons[rate - 1]
        }
    }

    private next () {
        if (this.currentQuestionIdx < 4) {
            this.questionForm.questions[this.currentQuestionIdx].rate = this.selectedRate.value
        }

        if (this.isDescriptionQuestion) {
            this.questionForm.description = this.description
        }

        this.currentQuestionIdx = this.currentQuestionIdx + 1

        const currentQuestion = this.questionForm.questions[this.currentQuestionIdx]
        if (currentQuestion && currentQuestion.rate) {
            this.selectedRate = this.rateButtons[currentQuestion.rate - 1]
        }
        else {
            this.selectedRate = this.defaultRate
        }
    }

    private get tenantNo() {
        return String(this.$route.query.tenantId || "") || StorageUtils.getItem("QR_TENANT_NO")
    }

    private get maintainanceId() {
        return String(this.$route.query.mrId || "")
    }

    private async submitSurvey () {
        try {
            const data = {
                mrId: this.maintainanceId,
                q1: this.questionForm.questions[0].rate,
                q2: this.questionForm.questions[1].rate,
                q3: this.questionForm.questions[2].rate,
                q4: this.questionForm.questions[3].rate,
                description: this.questionForm.description
            }

            await MaintainanceServices.rateSurvey(this.tenantNo, data)

            if  (this.isClosed) {
                await VuexServices.Root.setMaintainanceItem(null)
                this.$router.push({
                    name: ROUTER_NAMES.maintainance_survey_success
                })
                return
            }

            this.$router.push({
                name: ROUTER_NAMES.maintainance_repair_form,
                query: {
                    bpNo: this.user.customerNo,
                    tenantNo: this.tenantNo
                }
            })
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
    }

    private get text () {
        return {
            title: this.$t("pages.maintainance_assessment.title").toString(),
            start_assessment_title: this.$t("pages.maintainance_assessment.start_assessment_title").toString(),
            start_assessment_note: this.$t("pages.maintainance_assessment.start_assessment_note").toString(),
            start_assessment: this.$t("pages.maintainance_assessment.start_assessment").toString(),
            comment_note: this.$t("pages.maintainance_assessment.comment_note").toString(),
            close_maintainance: this.$t("pages.maintainance_assessment.close_maintainance").toString(),
            re_maintainance: this.$t("pages.maintainance_assessment.re_maintainance").toString(),
            select_sastify_level: this.$t("pages.maintainance_assessment.select_sastify_level").toString(),
            back: this.$t("pages.maintainance_assessment.back").toString(),
            continue: this.$t("pages.maintainance_assessment.continue").toString(),
            submit: this.$t("pages.maintainance_assessment.submit").toString()
        }
    }
}

class RateButton {
    caption = ""
    activeImg = ""
    deactiveImg = ""
    value = 0

    constructor (caption: string, activeImg: string, deactiveImg: string, value: number) {
        this.caption = caption
        this.activeImg = activeImg
        this.deactiveImg = deactiveImg
        this.value = value
    }
}

class Question {
    question = ""
    rate = 0

    constructor (question: string) {
        this.question =  question
    }
}

class QuestionForm {
    mrId = ""
    questions: Question[] = [
        new Question("1.ความรวดเร็วในการให้บริการ"),
        new Question("2.การให้บริการด้วยกิริยา และวาจาที่สุภาพ"),
        new Question("3.ความถูกต้องในการแก้ไขปัญหา"),
        new Question("4.การให้คำแนะนำเพิ่มเติม"),
    ]
    description = ""
}

class TrackingDot {
    value = 0

    constructor (value: number) {
        this.value = value
    }
}
