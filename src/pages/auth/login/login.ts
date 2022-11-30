import { Component } from "vue-property-decorator"
import { AuthService, StoreServices, UserServices } from "@/services"
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import Base from "../auth-base"
import { App } from "@/config"
import { UserModel } from "@/models"
import ctjs from "crypto-js"
import moment from "moment"

export class LoginForm {
    username = ""
    password = ""

    get validateUsername() {
        return !this.username
    }

    get validatePassword() {
        return !this.password
    }
}

class ProfileForm {
    private id = ctjs.MD5(Date.now().toString() + Math.random())
    firstname = ""
    lastname = ""
    email = ""
    phone = ""
    validate = false
    show = false
    loading = false

    get text() {
        const { lang, i18n } = LanguageUtils
        return {
            title: lang("กรุณากรอกข้อมูลเพิ่มเติม", "Please input more infomation"),
            firstname: lang("ชื่อ", "Firstname"),
            lastname: lang("นามสกุล", "นามสกุล"),
            phl_firstname: lang("กรุณากรอกชื่อพนักงาน", "Please fill employee firstname"),
            phl_lastname: lang("กรุณากรอกนามสกุลพนักงาน", "Please fill employee lastname"),
            email: i18n.t("email").toString(),
            phl_email: lang("employeeemail@email.com", "employeeemail@email.com"),
            phone: i18n.t("phone_number").toString(),
            phl_phone: lang("กรุณากรอกเบอร์โทรศัพท์พนักงาน", "Please fill employee phone number"),
            sent_date: lang("ส่งข้อมูล", "Send data")
        }
    }

    get errors() {
        const { lang } = LanguageUtils
        const { email, phone, firstname, lastname } = this
        return {

            email: (v => {
                // if (!v) {
                //     return lang("กรุณากรอกอีเมล", "Please input email")
                // }

                if (!v && !phone) {
                    return lang("กรุณากรอกเบอร์โทรศัพท์หรืออีเมล", "Please input phone or email")
                }

                if (v && !ValidateUtils.validateEmail(v)) {
                    return lang("อีเมลไม่ถูกต้อง", "Email invalid")
                }

                return null
            })(email),

            phone: (v => {
                // if (!v) {
                //     return lang("กรุณากรอกเบอร์โทรศัพท์", "Please input phone")
                // }

                if (!v && !email) {
                    return lang("กรุณากรอกเบอร์โทรศัพท์หรืออีเมล", "Please input phone or email")
                }

                if (v && !ValidateUtils.validatePhone(v)) {
                    return lang("เบอร์โทรศัพท์ไม่ถูกต้อง", "Phone invalid")
                }

                return null
            })(phone),

            firstname: (v => {
                if (!v) {
                    return lang("กรุณากรอกชื่อ", "Please input firstname")
                }

                return null
            })(firstname),

            lastname: (v => {
                if (!v) {
                    return lang("กรุณากรอกนามสกุล", "Please input lastname")
                }

                return null
            })(lastname)
        }
    }

    get allValidated() {
        return Object.values(this.errors).every(e => e === null)
    }
}

class ConsentDialog {
    show = false
    loading = false
    checkedConsent = false
    checkedTermAndCondition = false
    consentHtmlTh = ""
    consentHtmlEn = ""
    version = 0
    tncHtmlTh = ""
    tncHtmlEn = ""

    get canConfirm() {
        return this.checkedTermAndCondition
    }

    get tncHtml() {
        return LanguageUtils.lang(this.tncHtmlTh, this.tncHtmlEn)
    }

    get consentHtml() {
        return LanguageUtils.lang(this.consentHtmlTh, this.consentHtmlEn)
    }
}



@Component
export default class LoginPage extends Base {
    private loginForm = new LoginForm()
    private isLoging = false
    private validateFail = false
    private howTo = new HowToCPN()
    private consentDialog = new ConsentDialog()
    private authUser: UserModel.AuthUser | null = null
    private user: UserModel.User | null = null
    private profileForm = new ProfileForm()
    private splashLoading = true
    private isAcceptConsent = false;
    private isAcceptTernAndCondition = false;
    private isHasCPNTID = false;
    private isShowConsent = false;
    private isShowTermAndCondition = false;
    private setting_new_password = "setting_new_password";
    private setting_before_notification = "setting_before_notification";
    private setting_count_incurrect = "setting_count_incurrect";
    private setting_create_new_account = "setting_create_new_account";
    private setting_create_new_password = "setting_create_new_password";
    private setting_privacy_policy = "setting_privacy_policy";
    private expireSetting: any = null;
    private passxcount = false;
    private passlock = false;
    private wrongPasswordCount = 0;
    private passwordexpire = false;
    private passwordexpireclosing = false;
    private genarateLinkExpire = "";
    private numberofdayleft = 0;
    // private profileFormtest = true



    private async mounted() {
        this.expireSetting = await StoreServices.getSettingExpireDate();
        this.splashLoading = true
    }

    private hideSplasgScreen() {
        this.splashLoading = false
    }

    private get text() {
        return {
            username: this.$t("pages.auth.username").toString(),
            password: this.$t("pages.auth.password").toString(),
            forgot_username: this.$t("pages.auth.forgot_username").toString(),
            forgot_password: this.$t("pages.auth.forgot_password").toString(),
            login: this.$t("pages.auth.login").toString(),
            how_to_cpn: this.$t("pages.auth.how_to_cpn").toString(),
            how_to_cpn2: this.$t("pages.auth.how_to_cpn2").toString(),
            change_lang: this.$t("pages.auth.change_lang").toString()
        }
    }

    private get callCenterPhone() {
        return App.call_center_phone
    }

    private checkSubmitForm(e: KeyboardEvent) {
        if (String(e.key).toLocaleLowerCase() === "enter" && this.allFillIn) {
            this.login()
        }
    }

    // private async submitProfile() {
    //     this.profileForm.validate = true
    //     if (!this.profileForm.allValidated) {
    //         return
    //     }
    //     this.profileForm.loading = true
    //     try {
    //         const { user } = this
    //         if (!user) {
    //             throw new Error("No user data")
    //         }
    //         const { email, phone, firstname, lastname } = this.profileForm
    //         const rs = await UserServices.updateUserProfile({ email, phone, firstname, lastname }, this.authUser?.token || "")
    //         this.profileForm.show = false
    //         this.checkUserConsent()
    //     } catch (e) {
    //         DialogUtils.showErrorDialog({
    //             text: e.message || "ไม่สามารถส่งข้อมูลได้"
    //         })
    //     }
    //     this.profileForm.loading = false
    // }

    private calcelProfile() {
        this.profileForm.show = false
    }

    private get contactCenterUrl() {
        return "https://www.centralpattana.co.th/en/contact-us/cpn-contact-information"
    }

    private get policyUrl() {
        return App.policy_url
    }

    private async checkProfile() {
        const token = this.authUser?.token || ""
        const user = await UserServices.getUserInfo(token)
        if (!user || user == null) {
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("Session หมดอายุ กรุณาล็อคอินใหม่อีกครั้ง", "Session time out Please login again.")
            })
            return this.$router.replace({
                name: ROUTER_NAMES.login
            })
        }

        this.user = user
        this.isAcceptTernAndCondition = user.isAcceptTnC;
        this.isHasCPNTID = user.cpntid != "";
        if (this.user.wrongPasswordCount >= this.expireSetting.find((x: any) => x.path == this.setting_count_incurrect).value) {
            this.passlock = true;
            AuthService.clearLocalAuthUser()
            return;
        }

        if (!this.isHasCPNTID) {
            try {
                if(user.firstName && user.lastName){
                    const createResponse = await UserServices.createPersonalProfile(user.id);
                    this.checkUserConsent()
                }else{
                    this.checkUserConsent(0)
                }
            } catch (e) {
                console.log(e);
                this.checkUserConsent(0)
                // return this.$router.replace({
                //     name: ROUTER_NAMES.login
                // })
            }
        } else {
            this.checkUserConsent()
        }
    }

    private async login() {
        this.isLoging = true
        this.validateFail = false

        const { username, password } = this.loginForm
        try {
            const ua = await AuthService.login(username, password)
            this.authUser = ua
            AuthService.storeAuthUserToLocal(ua)
            await this.checkProfile()

        } catch (e) {
            if (!App.is_production) {
                console.log(e)
            }
            const title = LanguageUtils.lang("ขออภัย", "Sorry")
            let text = LanguageUtils.lang("ระบบปิดปรับปรุงการให้บริการชั่วคราว หากมีข้อสงสัยหรือติดปัญหา กรุณาติดต่อ 02-021-9999", "The system is temporarily closed for maintenance, please contact 02-021-9999 for more information.")

            const { response } = e

            if (response) {
                if (!App.is_production) {
                    console.log(response)
                }
                const { status, data } = response
                const monthMinusOneName =  moment(data?.data?.effective_start_date).locale(LanguageUtils.lang('th', 'en')).format('DD MMM YYYY');
                const monthMinusOneNameEnd =  moment(data?.data?.effective_end_date).locale(LanguageUtils.lang('th', 'en')).format('DD MMM YYYY');
                
                
                if (status == 401) {
                    if(data.error_code == 'user_pending'){
                        text = LanguageUtils.lang("คุณสามารถเข้าใช้งาน Central Pattana SERVE ได้ในวันที่ " +monthMinusOneName, "Sorry. You can login Central Pattana SERVE on "+monthMinusOneName)
                        DialogUtils.showErrorDialog({ text, title }) 
                        this.isLoging = false
                        return;
                    }else if(data.error_code == 'close_logout'){
                        text = LanguageUtils.lang("คุณไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อ 02-021-9999  ", "Sorry. Login unsuccessful, please contact 02-021-9999 ")
                        DialogUtils.showErrorDialog({ text, title })
                        this.isLoging = false
                        return;
                    }else if(data.error_code == 'user_expired'){
                        text = LanguageUtils.lang("คุณไม่สามารถเข้าใช้งาน Central Pattana SERVE ได้ตั้งวันที่  "+monthMinusOneNameEnd, "Sorry. You cannot login to Central Pattana SERVE since "+monthMinusOneNameEnd)
                        DialogUtils.showErrorDialog({ text, title })
                        this.isLoging = false
                        return;
                    }else if(data.message == 'Not Found Username !.'){
                        text = LanguageUtils.lang("ขออภัย กรุญากรอกรหัสผู้ใช้งานและรหัสผ่านให้ถูกต้อง", "Sorry. Your username or password are incorrect. Please try again. ")
                        DialogUtils.showErrorDialog({ text, title })
                        this.isLoging = false
                        return;
                    }
                    else{
                        DialogUtils.showErrorDialog({ text, title })
                        this.isLoging = false
                        return;
                    }
                    
                    
                } else if (status == 402) {
                    const request = {
                        username: username,
                        count: 1
                    }
                    const updatePassword = await UserServices.updatePasswordCount(request);
                    const setting_count_incurrect = this.expireSetting.find((x: any) => x.path == this.setting_count_incurrect)
                    this.wrongPasswordCount = setting_count_incurrect.value - updatePassword.wrong_password_count;
                    this.isLoging = false
                    this.passxcount = true;

                    if (this.wrongPasswordCount <= 0) {
                        this.passxcount = false
                        this.passlock = true;
                    }
                    return;
                    // Password Incurrect
                } else if (status !== 401 || status !== 402) {
                    if (status >= 500) {
                        text = e.toJSON?.()?.message || "Server error"
                    }
                }
                else {
                    const getDisplayDate = (md: moment.Moment) => md.format("DD MMM ") + (LanguageUtils.lang(md.year() + 543, md.year())).toString().substr(2, 2)

                    switch (data?.error_code) {
                        case AuthService.ERROR_CODE.force_logout: {
                            text = LanguageUtils.lang(`คุณไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อ ${App.call_center_phone}`, `You cannot login, please contact ${App.call_center_phone}.`)
                            break
                        }

                        case AuthService.ERROR_CODE.user_expired: {
                            try {
                                const expiredDate = data?.data.effective_end_date
                                if (expiredDate) {
                                    const md = moment(expiredDate, "YYYY-MM-DD").locale(this.$i18n.locale)
                                    if (md.isValid()) {
                                        text = LanguageUtils.lang(
                                            `คุณไม่สามารถเข้าใช้งาน ${App.app_name} ได้ตั้งแต่วันที่ ${getDisplayDate(md)}`,
                                            `You can't login ${App.app_name} since ${getDisplayDate(md)}`
                                        )
                                    }
                                }
                            } catch (e) {
                                console.log("Error while parse effective_end_date")
                            }
                            break
                        }

                        case AuthService.ERROR_CODE.user_pending: {
                            try {
                                const startDate = data?.data.effective_start_date
                                if (startDate) {
                                    const md = moment(startDate, "YYYY-MM-DD").locale(this.$i18n.locale)
                                    if (md.isValid()) {
                                        text = LanguageUtils.lang(
                                            `คุณสามารถเข้าใช้งาน ${App.app_name} ได้ในวันที่ ${getDisplayDate(md)}`,
                                            `You can login ${App.app_name} on ${getDisplayDate(md)}`
                                        )
                                    }
                                }
                            } catch (e) {
                                console.log("Error while parse effective_start_date")
                            }
                            break
                        }
                    }
                }
            }

            this.validateFail = true
            DialogUtils.showErrorDialog({ text, title })
        }
        this.isLoging = false
    }

    private async checkUserConsent(isHasCPNTID = 1) {
        try {
            const token = this.authUser?.token || ""
            const rs = await AuthService.getUserConsentStatus(token)
            console.log("rs",rs);
            if (!rs || rs == null) {
                return this.$router.replace({
                    name: ROUTER_NAMES.login
                })
            }

           
            if(rs.calpdh){
                this.consentDialog.checkedConsent = rs.status.consent
                this.consentDialog.checkedTermAndCondition = rs.status.tnc
                this.user = rs.data.user
                const consentStatus = rs.data.consent.consent_status ? rs.data.consent.consent_status.toLowerCase() : "e";
    
                if (rs.status.consent && rs.status.tnc) {
                    this.returnToHomePage();
                } else {
                    if (["e", "n"].includes(consentStatus)) {
                        const consentResult = await AuthService.getConsent(token);
                        this.consentDialog.consentHtmlEn = consentResult.consentHtmlEn
                        this.consentDialog.consentHtmlTh = consentResult.consentHtmlTh
                        this.consentDialog.tncHtmlEn = consentResult.termAndConditionEn
                        this.consentDialog.tncHtmlTh = consentResult.termAndConditionTh
                        this.consentDialog.version = consentResult.version
                        this.consentDialog.show = true
                        this.isShowConsent = true;
                        this.isShowTermAndCondition = rs.status.tnc == false;
                    } else if (["u"].includes(consentStatus)) {
                        const getResultSettingExpireDate = this.expireSetting;
                        const privacy_policy = getResultSettingExpireDate.find((x: any) => x.path == "setting_privacy_policy");
                        const consentDate = moment(rs.data.consent.consent_date, "YYYY-MM-DD").locale(this.$i18n.locale);
                        const addDays = moment(rs.data.consent.consent_date).add(privacy_policy.value, 'days');
                        if ((moment().startOf('day').isSameOrAfter(addDays.startOf('day'))) || rs.data.consent.consent_date == null) {
                            const consentResult = await AuthService.getConsent(token);
                            this.consentDialog.consentHtmlEn = consentResult.consentHtmlEn
                            this.consentDialog.consentHtmlTh = consentResult.consentHtmlTh
                            this.consentDialog.tncHtmlEn = consentResult.termAndConditionEn
                            this.consentDialog.tncHtmlTh = consentResult.termAndConditionTh
                            this.consentDialog.version = consentResult.version
                            this.consentDialog.show = true
                            this.isShowConsent = true;
                            this.isShowTermAndCondition = rs.status.tnc == false;
                            this.consentDialog.checkedConsent = (consentStatus == "y")
                        } else {
                            this.returnToHomePage();
                        }
                    }
                    else if (!rs.status.tnc) {
                        this.consentDialog.show = true
                        this.isShowConsent = false;
                        this.isShowTermAndCondition = rs.status.tnc == false;
                    } else {
                        this.isShowConsent = consentStatus == "Y" ? false : true;
                        this.isShowTermAndCondition = rs.status.tnc;
                        if (consentStatus == "Y" && rs.status.tnc) {
    
                            this.returnToHomePage();
                        }
                    }
                }
    
            }else{
                if (!rs.status.tnc) {
                    this.consentDialog.checkedTermAndCondition = rs.status.tnc
                    this.user = rs.data.user
                    this.consentDialog.show = true
                    this.isShowConsent = false;
                    this.isShowTermAndCondition = rs.status.tnc == false;
                }else{
                    this.returnToHomePage();
                }
            }

        } catch (e) {
            
            this.returnToHomePage();
            console.log("Check consent error: ", e.message || e)
        }
    }

    private get allFillIn() {
        return !(this.loginForm.validateUsername || this.loginForm.validatePassword)
    }

    private switchLang() {
        LanguageUtils.switchLang()
    }

    private get toForgotPwd() {
        return {
            name: ROUTER_NAMES.forgot_password
        }
    }

    private async checkPasswordClosingExpire() {
        const getResultSetting = this.expireSetting;
        const closingExpire = getResultSetting.find((x: any) => x.path == this.setting_before_notification);
        const passwordExpire = getResultSetting.find((x: any) => x.path == this.setting_new_password);

        // for test
        // closingExpire.value = 5
        // passwordExpire.value = 1

        const lastExpirePasswordDate = moment(this.user?.passwordExpireDate, "YYYY-MM-DD").locale(this.$i18n.locale);
        const passwordExpireDate = moment(lastExpirePasswordDate.format('YYYY-MM-DD'), "YYYY-MM-DD").locale(this.$i18n.locale).add(passwordExpire.value, 'days');
        const closingExpireDate = moment(passwordExpireDate.format('YYYY-MM-DD'), "YYYY-MM-DD").locale(this.$i18n.locale).add(-(closingExpire.value), 'days');

        console.log("closingExpireDate --> ", closingExpireDate.format('YYYY-MM-DD'))

        const current = moment().startOf('day');
        const numberofleft = moment.duration(passwordExpireDate.diff(current)).asDays();
        this.numberofdayleft = numberofleft;

        // const given = moment("2022-05-27", "YYYY-MM-DD");
        // const testday = moment.duration(given.diff(current)).asDays();
        //Difference in number of days
        console.log(current.valueOf())
        console.log(closingExpireDate.valueOf())

        //test

        // const dummy_noti = moment().subtract(1, "days")
        // const dummy_expire = moment().add(1, "days")
        // if (current.valueOf()>=dummy_noti.valueOf() && current.valueOf() < dummy_expire.valueOf()) {
        //     return true
        // } else {
        //     return false;
        // }

        //new code
        if (current.valueOf()>=closingExpireDate.valueOf() && current.valueOf() < passwordExpireDate.valueOf()) {
            return true
        } else {
            return false;
        }

        // old code
        // if (moment().startOf('day').isSame(moment(closingExpireDate.format('YYYY-MM-DD'), "YYYY-MM-DD").locale(this.$i18n.locale).startOf('day'))) {
        //     return true
        // } else {
        //     return false;
        // }
    }

    private async checkPasswordIsexpired() {
        const getResultSetting = this.expireSetting;
        const passwordExpire = getResultSetting.find((x: any) => x.path == this.setting_new_password);

        // for test
        // passwordExpire.value = 20

        const lastExpirePasswordDate = moment(this.user?.passwordExpireDate, "YYYY-MM-DD").locale(this.$i18n.locale);
        const passwordExpireDate = moment(lastExpirePasswordDate.format('YYYY-MM-DD'), "YYYY-MM-DD").locale(this.$i18n.locale).add(passwordExpire.value, 'days');
        console.log("passwordExpireDate --> ", passwordExpireDate.format('YYYY-MM-DD'))
        if (moment().startOf('day').valueOf() >= passwordExpireDate.valueOf()) {
            return true
        } else {
            return false;
        }
        // if (moment().startOf('day').isSame(moment(passwordExpireDate.format('YYYY-MM-DD'), "YYYY-MM-DD").locale(this.$i18n.locale).startOf('day'))) {
        //     return true
        // } else {
        //     return false;
        // }
    }

    private async confirmConsentDialog() {
        this.consentDialog.loading = true

        if (this.consentDialog.checkedTermAndCondition == false) {
            return;
        }
        try {
            const rs = await AuthService.acceptConsentAndTnC(
                // eslint-disable-next-line
                this.user!,
                this.consentDialog.version,
                this.authUser?.token || "",
                {
                    consent: this.consentDialog.checkedConsent,
                    tnc: this.consentDialog.checkedTermAndCondition
                }
            )
            console.log("accept-data", rs)
        } catch (e) {
            console.log(e.message || e)
        }
        this.consentDialog.loading = !true
        this.consentDialog.show = false
        if (this.authUser) {
            this.returnToHomePage();
        }
    }

    private async returnToHomePage() {
        const checkPasswordIsexpired = await this.checkPasswordIsexpired()
        const checkIsClosingExpire = await this.checkPasswordClosingExpire()

        // console.log("checkPasswordIsexpired --> ", checkPasswordIsexpired)
        // console.log("checkIsClosingExpire --> ", checkIsClosingExpire)

        if (checkPasswordIsexpired) {
            console.log("Show modal Closing Expire")
            await this.GenarateNewLinkResetPassword();
            this.passwordexpire = true;
            return;
        } else if (checkIsClosingExpire) {
            console.log("Show modal Expire")
            await this.GenarateNewLinkResetPassword();
            this.passwordexpireclosing = true;
            return;
        }

        AuthService.storeAuthUserToLocal(this.authUser!)
        UserServices.updatePasswordCount({
            username: this.user?.username,
            count: 0
        });
        return this.$router.replace({
            name: ROUTER_NAMES.dashboard_home_page,
            query: {
                state: ctjs.SHA1(JSON.stringify(this.authUser)).toString()
            }
        })
    }

    private async GenarateNewLinkResetPassword() {
        const userId = this.user ? this.user.id : null;
        if (!userId) {
            return;
        }
        const genarateLinkExpire = await UserServices.genarateResetPassword(userId);
        this.genarateLinkExpire = genarateLinkExpire.link;
    }

    private async returnToforgot_password() {

        return this.$router.replace({
            name: ROUTER_NAMES.forgot_password,

        })
    }

    private Gotonewpassword() {
        window.location.href = this.genarateLinkExpire;
        this.passwordexpire = false;
    }
    
    private async gotodashboard() {
       
        AuthService.storeAuthUserToLocal(this.authUser!)
        UserServices.updatePasswordCount({
            username: this.user?.username,
            count: 0
        });
        return this.$router.replace({
            name: ROUTER_NAMES.dashboard_home_page,
            query: {
                state: ctjs.SHA1(JSON.stringify(this.authUser)).toString()
            }
        })
    }



    private get toForgotUsername() {
        return {
            name: ROUTER_NAMES.forgot_username
        }
    }

    private get tncLink() {
        return {
            name: ROUTER_NAMES.public_tnc
        }
    }
}

class HowToCPN {
    show = false
    title = "Central Pattana ผู้ช่วยมือขวาของคุณ ใช้งานอะไรได้บ้าง"
    content = `
    เป็นกรอบในการดำเนินธุรกิจของบริษัทซึ่งยึดมั่นในคุณธรรม จริยธรรม และคำนึงถึงผลประโยชน์ที่สมดุลของผู้มีส่วนได้เสียทุกฝ่าย
	<ul>89
        <li>พัฒนาโครงการอสังหาริมทรัพย์แบบผสมที่มีคุณภาพทั้งในประเทศและต่างประเทศ</li>
        <li>เข้าซื้อโครงการคุณภาพที่ตั้งอยู่ในทำเลที่ดีทั้งใน
        ประเทศและต่างประเทศ โดยเป็นโครงการที่มี
        ศักยภาพในการพัฒนาและสามารถเพิ่มมูลค่าได้
        ในอนาคต</li>
        <li>ปรับปรุงโครงการที่มีอยู่ในปัจจุบันอย่างต่อเนื่อง
        เพื่อเพิ่มศักยภาพและผลตอบแทนของโครงการ</li>
        <li>ศึกษาโอกาสการลงทุนในธุรกิจที่เกี่ยวเนื่องและ
        เกื้อหนุน เพื่อกระจายแหล่งรายได้ให้กับบรัษัทฯ</li>
    </ul>`
}
