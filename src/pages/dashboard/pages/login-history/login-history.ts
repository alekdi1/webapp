import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import { UserServices } from "@/services"
import { UserModel } from "@/models"
import { DialogUtils, TimeUtils } from "@/utils"
import moment from "moment"

@Component
export default class LoginHistoryPage extends Base {
    private isLoading = false
    private history: UserModel.HistoryLogin[] = []

    private async mounted () {
        await this.loginHistory()
    }

    private get text () {
        return {
            title: this.$t("pages.login_history.title").toString(),
            latest_login: this.$t("pages.login_history.latest_login").toString()
        }
    }


    private get isQRUser () {
        return this.user.isQRUser
    }

    private async loginHistory () {
        this.isLoading = true
        try {
            const history = await UserServices.getHistoryLogin()
            this.history = history
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private displayLastLoginDateTime (date: string) {
        return TimeUtils.convertToLocalDateFormat(moment(date)) + " " + TimeUtils.convertToLocalTimeFormat(moment(date))
    }
}
