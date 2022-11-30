import { Component, Prop, Vue } from "vue-property-decorator"

@Component
export default class UserOnBoardComponent extends Vue {
    @Prop({ default: false })
    private isOnBoard!: boolean

    private overlay = true

    private isLastImage = false

    private isReplay = false

    private currentStep = 0

    private get text () {
        return {
            on_board_continue: this.$t("pages.user_on_board.on_board_continue").toString(),
            on_board_finish: this.$t("pages.user_on_board.on_board_finish").toString(),
            on_board_replay: this.$t("pages.user_on_board.on_board_replay").toString(),
        }
    }

    private get step () {
        return [
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-1.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-2.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-3.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-4.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-5.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-6.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-7.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-8.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-9.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-10.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-11.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-12.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-13.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-14.png")
            },
            {
                image: require("@/assets/images/user-on-board/production-user-onboard-payment-15.png")
            }
        ]
    }

    private get currentOnBoardImage () {
        if (this.currentStep === 0) {
            return this.step[0]
        } else if (this.currentStep === 1) {
            return this.step[1]
        } else if (this.currentStep === 2) {
            return this.step[2]
        } else if (this.currentStep === 3) {
            return this.step[3]
        } else if (this.currentStep === 4) {
            return this.step[4]
        } else if (this.currentStep === 5) {
            return this.step[5]
        } else if (this.currentStep === 6) {
            return this.step[6]
        } else if (this.currentStep === 7) {
            return this.step[7]
        } else if (this.currentStep === 8) {
            return this.step[8]
        } else if (this.currentStep === 9) {
            return this.step[9]
        } else if (this.currentStep === 10) {
            return this.step[10]
        } else if (this.currentStep === 11) {
            return this.step[11]
        } else if (this.currentStep === 12) {
            return this.step[12]
        } else if (this.currentStep === 13) {
            return this.step[13]
        }
        this.isLastImage = true
        return this.step[14]
    }

    private continueOnBoard () {
        this.currentStep = this.isReplay ? this.currentStep : this.currentStep + 1
        this.isReplay = false
    }

    private finishOnboard () {
        localStorage.setItem("firstVisitPayment", "false")
        this.overlay = false
    }

    private replayOnboard () {
        this.isLastImage = false
        this.currentStep = 0
        this.isReplay = true
    }
}
