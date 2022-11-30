import { Component, Vue,Prop } from "vue-property-decorator"

@Component
export default class HomeUserOnBoardComponent extends Vue {
    @Prop({ default: false })
    private isOnboard!: boolean

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

    
    // ------------------ On board trigger ------------------------

    private get step () {
        return [
            {
                image: require("@/assets/images/user-on-board/user-onboard-home-1.png")
            },
            {
                image: require("@/assets/images/user-on-board/user-onboard-home-2.png")
            },
            {
                image: require("@/assets/images/user-on-board/user-onboard-home-3.png")
            },
            {
                image: require("@/assets/images/user-on-board/user-onboard-home-4.png")
            }
        ]
    }

    private get currentOnBoardImage () {
        if (this.currentStep === 0) {
            return this.step[0]
        }
        if (this.currentStep === 1) {
            return this.step[1]
        }
        if (this.currentStep === 2) {
            return this.step[2]
        }
        this.isLastImage = true
        return this.step[3]
    }

    private continueOnBoard () {
        this.currentStep = this.isReplay ? this.currentStep : this.currentStep + 1
        this.isReplay = false
    }

    private finishOnboard () {
        localStorage.setItem("firstVisitHomepage", "false")
        this.overlay = false
        this.onCloseOnBoard()
    }
    
    private replayOnboard () {
        this.isLastImage = false
        this.currentStep = 0
        this.isReplay = true
    }

    private onCloseOnBoard () {
        this.$emit("openOnBoard", false)
    }
}
