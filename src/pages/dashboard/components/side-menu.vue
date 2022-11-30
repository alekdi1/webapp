<template>
  <!-- ============= sidebar ============= -->
  <aside id="side-navigation" v-if="user">
    <div class="side-navigation-container">
      <div class="header-section">
        <div class="header-logo" @click="goToHome()">
          <v-img
            :src="require('@/assets/images/cpn-logo-new.png')"
            :width="150"
            contain
          />
        </div>
        <div class="app-title">
          <div class="span">{{ displayBPName }}</div>
          <div v-if="storeName" class="cpn-content-subtitle font-weight-bold">
            {{ storeName }}
          </div>
          <div v-if="branchDisplayName" class="cpn-content-subtitle">
            {{ branchDisplayName }}
          </div>
          <div v-if="storeFloorRoom" class="cpn-content-subtitle">
            {{ text.room }} {{ floorRoom }}
          </div>
        </div>

        <div class="user-section">
          <table class="user-table">
            <tr>
              <td rowspan="2" class="avatar-col">
                <cpn-user-avatar color="error" :user="user" />
              </td>
              <td>
                <span class="user-name">{{ user.fullName }}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="user-role">{{ displayRole }}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div class="menu-list-container">
        <div class="menu-list">
          <v-divider class="menu-seperator" />
          <template v-for="(g, idx) in menus">
            <div
              class="menu-group"
              :key="'group-menu-' + idx"
              v-if="isMenuGranted(g) && g.type === 'group'"
            >
              <div class="menu-group-label" v-html="g.label"></div>

              <div class="menu-items">
                <template v-for="m in g.menus">
                  <template v-if="isMenuGranted(m)">
                    <!-- enabled -->
                    <div
                      v-if="isMenuDisabledNew(m)"
                      :class="{ active: m.active }"
                      v-ripple
                      class="menu-item"
                      :key="'group-menu-item-' + m.route"
                      @click="menuClick(m)"
                    >
                      <div class="menu-icon">
                        <v-img :src="m.icon" />
                      </div>
                      <div class="menu-label" v-html="m.label">
                      </div>
                    </div>
                    <!-- disabled -->
                    <div
                      v-else
                      class="menu-item disabled"
                      :key="'group-menu-item-disabled-' + m.route"
                    >
                      <div class="menu-icon">
                        <v-img :src="m.icon" />
                      </div>
                      <div class="menu-label" v-html="m.label">
                      </div>
                    </div>
                  </template>
                </template>
              </div>
              <v-divider
                class="menu-seperator"
                :key="'group-menu-seperator' + idx"
              />
            </div>

            <div
              class="menu-items"
              v-else-if="isMenuGranted(g)"
              :key="'menu-item-' + g.route"
            >
              <!-- disabled -->
              <div class="menu-item disabled" v-if="!isMenuDisabledNew(g)">
                <div class="menu-icon">
                  <v-img :src="g.icon" />
                </div>
                <div class="menu-label">
                  {{ g.label }}
                </div>
              </div>
              <!-- enabled -->
              <div
                v-else
                :class="{ active: g.active }"
                v-ripple
                class="menu-item"
                @click="menuClick(g)"
              >
                <div class="menu-icon">
                  <v-img :src="g.icon" />
                </div>
                <div class="menu-label">
                  {{ g.label }}
                </div>
              </div>
              <v-divider
                class="menu-seperator"
                :key="'group-menu-seperator' + idx"
              />
            </div>
          </template>
          <div class="menu-items app-version">
            <div class="menu-item">
              <div class="menu-label">App version {{ APP_VERSION }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import i18n from "@/plugins/i18n"
import { ROUTER_NAMES } from "@/router"
import { AppService, EmployeeServices, VuexServices } from "@/services"
import { AppModel, UserModel } from "@/models"
import { App as AppConfig } from "@/config"
import { RewardServices } from "@/services"

const t = (key: string) => i18n.t("pages.dashboard." + key).toString()

@Component({
    name: "cpn-dbs-sidebar"
})
export default class DashboardSideMenu extends Vue {

    @VuexServices.Root.VXAppConfig()
    protected appConfig!: AppModel.AppConfig

    @VuexServices.Root.VXUser()
    private user!: UserModel.User

    private APP_VERSION = AppConfig.app_version

    // eslint-disable-next-line
    private isMenuDisabled(menu: SideMenuItem) {
        return false
    }

    private get text() {
        return {
            room: this.$t("room").toString()
        }
    }

    private get displayRole() {
        return this.user?.displayRole || ""
    }

    private get displayBPName () {
        return this.user.bpName
    }

    private get storeName() {
        return String(this.$route.query.shop_name || "")
    }

    private get storeFloorRoom() {
        return String(this.$route.query.shop_unit || "")
    }

    private get branchDisplayName() {
        return String(this.$route.query.branch_name || "")
    }

    private get floorRoom() {
        let isMultipleRoom = false
        let room = this.storeFloorRoom
        if (room.includes(";")) {
            room = room.split(";")[0]
            isMultipleRoom = true
        }
        if (room.includes(",")) {
            room = room.split(",")[0]
            isMultipleRoom = true
        }
        if (room.includes("_")) {
            room = room.split("_")[1]
        }
        return isMultipleRoom ? `${room}*` : room
    }

    private get menus() {
        const r = this.$route.name || ""
        const rn = ROUTER_NAMES

        if (this.user?.isQRUser) {
            return [
                (() => {
                    const g = new SideMenuGroup()
                    g.label = t("menu_label_mamange_store")
                    g.menus.push(
                      new SideMenuItem(
                        t("menu_coupon"),
                        rn.coupon_code,
                        require("@/assets/images/icons/coupon.svg"),
                        [
                            rn.coupon_branch,
                            rn.coupon_code,
                            rn.coupon_detail,
                            rn.coupon_confirm,
                            rn.coupon_success,
                            rn.coupon_wrong,
                        ].includes(r)
                        ),
                        new SideMenuItem(
                        t("menu_coupon_history"),
                        rn.coupon_history_coupon_list_by_shop,
                        require("@/assets/images/coupon-history-01.svg"),
                            [
                            rn.coupon_history_shop_list,
                            rn.coupon_history_coupon_list_by_shop,
                            ].includes(r)
                        ),
                        new SideMenuItem(
                            t("menu_maintainance"),
                            rn.maintainance_status_list,
                            require("@/assets/images/dashboard-repair-pose.svg"),
                            [
                                rn.maintainance_shop_list,
                                rn.maintainance_status_list,
                                rn.maintainance_repair_form,
                                rn.maintainance_survey,
                                rn.maintainance_survey_success
                            ].includes(r)
                        )
                    )
                    return g
                })(),

                (() => {
                    const g = new SideMenuGroup()
                    g.label = t("menu_label_news")

                    g.menus.push(
                      new SideMenuItem(
                            t("menu_annoucement"), //ประกาศศูนย์การค้า
                            rn.dashboard_annoucement,
                            require("@/assets/images/dashboard-annoucement.png"),
                            [
                                rn.dashboard_annoucement,
                                rn.dashboard_annoucement_detail
                            ].includes(r)
                        ),
                   
                        new SideMenuItem(
                            t("menu_news_and_activities"), //ข่าวสารและกิจกรรม
                            rn.dashboard_news_and_activities,
                            require("@/assets/images/dashboard-news-and-activities.svg"),
                            [
                                rn.dashboard_news_and_activities,
                                rn.dashboard_news_and_activities_detail
                            ].includes(r)
                        ),
                        new SideMenuItem(
                            t("menu_promotion"),//โปรโมชั่น
                            rn.dashboard_promotion,
                            require("@/assets/images/dashboard-promotion.svg"),
                            [
                                rn.dashboard_promotion,
                                rn.dashboard_promotion_detail
                            ].includes(r)
                        ),

                        new SideMenuItem(
                            t("menu_shopping_center_info"), //ข้อมูลศูนย์การค้า
                            rn.dashboard_shopping_center_list, 
                            require("@/assets/images/dashboard-shopping-center-info.svg"),
                            [
                                rn.dashboard_shopping_center_info,
                                rn.dashboard_shopping_center_list
                            ].includes(r)
                        ),

                        // new SideMenuItem(
                        //     t("menu_business_insights"),
                        //     rn.dashboard_business_insights,
                        //     require("@/assets/images/dashboard-business-insights.svg"),
                        //     [
                        //         rn.dashboard_business_insights,
                        //         rn.dashboard_business_insights_detail
                        //     ].includes(r)
                        // ),

                 

                       
     

                        new SideMenuItem(
                            t("menu_shopping_mall_map"), //แผนผังศูนย์การค้า
                            rn.dashboard_shopping_center_map,
                            require("@/assets/images/dashboard-shopping-mall-map.svg"),
                            rn.dashboard_shopping_center_map === r
                        )
                    )
                    return g
                })()
            ]
        }

        const menus = [
            // billing payment
            (() => {
                const g = new SideMenuGroup()
                g.label = t("menu_label_billing_payment")

                g.menus.push(
                    new SideMenuItem(
                        t("menu_payment"),
                        rn.payment_invoice_list,
                        require("@/assets/images/dashboard-payment.svg"),
                        [
                            rn.payment_invoice_list,
                            rn.payment_confirm_payment,
                            rn.payment_select_payment_method,
                            rn.payment_result,
                            rn.payment_instruction,
                            rn.payment_push_noti
                        ]
                        .includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_payment_history"),
                        rn.dashboard_payment_history,
                        require("@/assets/images/dashboard-payment-history.svg"),
                        rn.dashboard_payment_history === r
                    ),

                    new SideMenuItem(
                        t("menu_request_invoice_and_receipt"),
                        rn.request_invoice_and_receipt_store_list,
                        require("@/assets/images/dashboard-request-invoice-and-receipt.svg"),
                        [
                            rn.request_invoice_and_receipt_store_list,
                            rn.request_form,
                            rn.request_summary,
                            rn.request_result
                        ]
                        .includes(r)
                    )
                )
                return g
            })(),

            // mamange store
            (() => {
                const g = new SideMenuGroup()
                g.label = t("menu_label_mamange_store")
                g.menus.push(
                    new SideMenuItem(
                        t("menu_rental_value"),
                        rn.rental_info_list,
                        require("@/assets/images/dashboard-rental-value.svg"),
                        [
                            rn.rental_info_list,
                            rn.rental_expired_list,
                            rn.rental_detail,
                            rn.rental_expired_detail,
                            rn.rental_quotation,
                            rn.rental_renew_success,
                            rn.rental_refund_detail,
                            rn.rental_refund_success
                        ].includes(r)
                    )
                )

                // ----------- for dev & test -----------

                if (RewardServices.isFeatureAvailable() && RewardServices.isFeatureDisabled()) {
                    g.menus.push(
                        new SideMenuItem(
                            t("menu_customer_reward"),
                            rn.rewards_shop_list,
                            require("@/assets/images/dashboard-rewards.svg"),
                            [
                                rn.rewards_shop_list,
                                rn.rewards_main,
                                rn.rewards_search_the1_member,
                                rn.rewards_earn_redeem_form,
                                rn.rewards_redeem_otp,
                                rn.rewards_earn_redeem_error,
                                rn.rewards_earn_redeem_success,
                                rn.rewards_transaction_history,
                                rn.rewards_transaction_download_history,
                                rn.rewards_transaction_download_success,
                                rn.rewards_transaction_cancellation_form,
                                rn.rewards_approve_void,
                                rn.rewards_approve_void_success,
                                rn.rewards_dashboard
                            ].includes(r)
                        )
                    )
                }

                g.menus.push(
                    new SideMenuItem(
                        t("menu_shop_sale"),
                        rn.shop_sale_select_branch,
                        require("@/assets/images/dashboard-shop-sale.svg"),
                        [
                            rn.shop_sale_select_branch,
                            rn.shop_sale_main_select_option,
                            rn.shop_sale_history_detail,
                            rn.shop_sale_history_list,
                            rn.shop_sale_sales_form,
                            rn.shop_sale_sales_form_edit,
                            rn.shop_sale_create_success
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_watch_sale"),
                        rn.watch_sale,
                        require("@/assets/images/dashboard-ordering.svg"),
                        [
                            rn.watch_sale_select_branch,
                            rn.watch_sale_main_select_option,
                            rn.watch_sale_at_month,
                            rn.watch_sale_history_list
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_maintainance"),
                        rn.maintainance_shop_list,
                        require("@/assets/images/dashboard-repair-pose.svg"),
                        [
                            rn.maintainance_shop_list,
                            rn.maintainance_status_list,
                            rn.maintainance_repair_form,
                            rn.maintainance_survey,
                            rn.maintainance_survey_success,
                            rn.maintainance_form_success
                        ].includes(r)
                    ),

                    (() => {
                        const m = new SideMenuItem(
                            t("menu_manage_employees"),
                            rn.manage_emp_list,
                            require("@/assets/images/dashboard-manage-employees.svg"),
                            rn.dashboard_manage_employees === r
                        )

                        m.active = [
                            rn.manage_emp_list,
                            rn.manage_emp_detail,
                            rn.manage_emp_form_add,
                            rn.manage_emp_form_edit
                        ].includes(r)

                        return m
                    })(),

                    new SideMenuItem(
                        t("menu_my_qr_code"),
                        rn.dashboard_my_qr_code,
                        require("@/assets/images/dashboard-my-qr-code.svg"),
                        rn.dashboard_my_qr_code === r
                    ),
                )

                if (this.user.permissions.map(x => x.permission).includes(EmployeeServices.PERMISSIONS.coupon_main) || this.user.isOwner ) {
                    g.menus.push(new SideMenuItem(
                        t("menu_coupon"),
                        rn.coupon_branch,
                        require("@/assets/images/icons/coupon.svg"),
                        [
                            rn.coupon_branch,
                            rn.coupon_code,
                            rn.coupon_detail,
                            rn.coupon_confirm,
                            rn.coupon_success,
                            rn.coupon_wrong,
                        ].includes(r)
                    ))
                }

                if (this.user.permissions.map(x => x.permission).includes(EmployeeServices.PERMISSIONS.coupon_history) || this.user.isOwner ) {
                    g.menus.push(new SideMenuItem(
                        t("menu_coupon_history"),
                        rn.coupon_history_shop_list,
                        require("@/assets/images/coupon-history-01.svg"),
                            [
                            rn.coupon_history_shop_list,
                            rn.coupon_history_coupon_list_by_shop,
                        ].includes(r)
                    ))
                }

                return g
            })(),

            // news
            (() => {
                const g = new SideMenuGroup()
                g.label = t("menu_label_news")

                g.menus.push(
                    new SideMenuItem(
                        t("menu_annoucement"),
                        rn.dashboard_annoucement,
                        require("@/assets/images/dashboard-annoucement.png"),
                        [
                            rn.dashboard_annoucement,
                            rn.dashboard_annoucement_detail
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_news_and_activities"),
                        rn.dashboard_news_and_activities,
                        require("@/assets/images/dashboard-news-and-activities.svg"),
                        [
                            rn.dashboard_news_and_activities,
                            rn.dashboard_news_and_activities_detail
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_promotion"),
                        rn.dashboard_promotion,
                        require("@/assets/images/dashboard-promotion.svg"),
                        [
                            rn.dashboard_promotion,
                            rn.dashboard_promotion_detail
                        ].includes(r)
                    ),

                    // new SideMenuItem(
                    //     t("menu_business_insights"),
                    //     rn.dashboard_business_insights,
                    //     require("@/assets/images/dashboard-business-insights.svg"),
                    //     [
                    //         rn.dashboard_business_insights,
                    //         rn.dashboard_business_insights_detail
                    //     ].includes(r)
                    // ),

                    new SideMenuItem(
                        t("menu_shopping_center_info"),
                        rn.dashboard_shopping_center_list,
                        require("@/assets/images/dashboard-shopping-center-info.svg"),
                        [
                            rn.dashboard_shopping_center_info,
                            rn.dashboard_shopping_center_list
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_shopping_mall_map"),
                        rn.dashboard_shopping_center_map,
                        require("@/assets/images/dashboard-shopping-mall-map.svg"),
                        rn.dashboard_shopping_center_map === r
                    ),

                    new SideMenuItem(
                        t("menu_favorite"),
                        rn.dashboard_favorite,
                        require("@/assets/images/dashboard-favorite.svg"),
                        rn.dashboard_favorite === r
                    )
                )
                return g
            })(),

            // my account
            (() => {
                const g = new SideMenuGroup()
                g.label = t("menu_label_my_account")

                g.menus.push(
                    new SideMenuItem(
                        t("menu_edit_profile"),
                        rn.dashboard_edit_profile,
                        require("@/assets/images/dashboard-edit-profile.svg"),
                        rn.dashboard_edit_profile === r
                    ),

                    new SideMenuItem(
                        t("menu_change_username_pwd"),
                        rn.dashboard_change_username_pwd,
                        require("@/assets/images/dashboard-change-pwd.svg"),
                        [
                            rn.dashboard_change_pwd,
                            rn.dashboard_change_username,
                            rn.dashboard_change_username_pwd
                        ].includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_reg_e_invoice"),
                        rn.reg_e_invoice_receipt_menu,
                        require("@/assets/images/dashboard-reg-e-invoice.svg"),
                        [
                            rn.reg_e_invoice_receipt_menu,
                            rn.reg_e_invoice_receipt_detail
                        ].includes(r)
                    ),
                )
                return g
            })(),

            // new SideMenuItem(
            //     t("menu_satisfaction_questionnaire"),
            //     rn.dashboard_satisfaction_questionnaire,
            //     require("@/assets/images/dashboard-satisfaction-questionnaire.svg"),
            //     rn.dashboard_satisfaction_questionnaire === r
            // ),

            // help
            (() => {
                const g = new SideMenuGroup()
                g.label = t("menu_label_help")

                g.menus.push(
                    // new SideMenuItem(
                    //     t("menu_how_to_use_cpn_app"),
                    //     rn.dashboard_how_to_use_cpn_app,
                    //     require("@/assets/images/dashboard-how-to-use-cpn-app.svg"),
                    //     rn.dashboard_how_to_use_cpn_app === r
                    // ),

                    new SideMenuItem(
                        t("menu_contact_branch"),
                        rn.dashboard_contact_us_select_branch,
                        require("@/assets/images/dashboard-contact-branch.svg"),
                        [
                            rn.dashboard_contact_us_select_branch,
                            rn.dashboard_contact_us_form
                        ]
                        .includes(r)
                    ),

                    new SideMenuItem(
                        t("menu_faq"),
                        rn.dashboard_faq,
                        require("@/assets/images/dashboard-faq.svg"),
                        rn.dashboard_faq === r
                    ),

                    new SideMenuItem(
                        t("menu_tnc"),
                        rn.dashboard_tnc,
                        require("@/assets/images/dashboard-tnc.svg"),
                        rn.dashboard_tnc === r
                    ),

                    new SideMenuItem(
                        t("menu_pvp"),
                        rn.dashboard_pvp,
                        require("@/assets/images/dashboard-pvp.svg"),
                        rn.dashboard_pvp === r
                    )
                )
                return g
            })(),

            new SideMenuItem(
                t("menu_login_history"),
                rn.dashboard_login_history,
                require("@/assets/images/dashboard-login-history.svg"),
                rn.dashboard_login_history === r
            ),
        ]

        return menus
    }

    private isMenuGranted(menu: SideMenuItem | SideMenuGroup) {        
        const checkConfig = (rn: string) => {
            if (this.user?.isQRUser) {
                return true
            }

            const { permissions } = this.user
            const menuKey = AppService.getRouteKey(rn)   

            let granted = true
            if (menuKey === null || this.user.isOwner) {
                granted = true
            } else {
                granted = this.appConfig.userPagePermissions[menuKey] !== false
                const { permissions } = this.user
                const permissionKey = EmployeeServices.getRoutePermission(rn)
                if (!permissionKey) {
                    return true
                }

                if (Array.isArray(permissionKey)) {
                    return this.user?.permissions.some(p => permissionKey.includes(p.permission)) === true
                }

                return permissions.some(p => p.permission === permissionKey)
            }
            return granted
        }

        if (menu instanceof SideMenuGroup) {
            return menu.menus.some(sm => checkConfig(sm.route))
        } else {
            return checkConfig(menu.route)
        }
    }

    private isMenuDisabledNew(menu: SideMenuItem | SideMenuGroup) {        
        const checkConfig = (rn: string) => {
            if (this.user?.isQRUser) {
                return true
            }

            const { permissions } = this.user
            const menuKey = AppService.getRouteKey(rn)   

            let granted = true
            if (menuKey === null) {
                granted = true
            } else {
                granted = this.appConfig.userPagePermissions[menuKey] !== false
            }

            if (!this.user.isOwner && granted) {
                const { permissions } = this.user
                const permissionKey = EmployeeServices.getRoutePermission(rn)
                if (!permissionKey) {
                    return true
                }

                if (Array.isArray(permissionKey)) {
                    return this.user?.permissions.some(p => permissionKey.includes(p.permission)) === true
                }

                return permissions.some(p => p.permission === permissionKey)
            }
            return granted
        }

        if (menu instanceof SideMenuGroup) {
            return menu.menus.some(sm => checkConfig(sm.route))
        } else {
            return checkConfig(menu.route)
        }
    }

    private menuClick(m: SideMenuItem) {
        if (m.route === ROUTER_NAMES.dashboard_pvp) {
            return window.open(AppConfig.privacy_policy_url, "_blank")
        }

        if (this.$route.name !== m.route) {
            this.$router.push({
                name: m.route
            })
        }
    }

    private get drawer() {
        return true
    }

    private goToHome () {
        this.$router.push({
            name: ROUTER_NAMES.dashboard_home_page
        })
    }

    private mounted() {
        // const { menus } = this
        // console.log(this.appConfig.userPagePermissions)
        // for (const menu of menus) {
            
        //     if (menu instanceof SideMenuGroup) {
        //         for (const sm of menu.menus) {
        //             console.log(this.isMenuGranted(sm), sm)
        //         }
        //     } else {
        //         console.log(this.isMenuGranted(menu), menu)
        //     }
        // }
    }
}

interface SideMenuItemOption {
    disabled?: boolean
}

class SideMenuItem {
    label = ""
    route = ""
    icon = ""
    active = false
    disabled = false

    constructor(label: string, route: string, icon: string, active: boolean, opts: SideMenuItemOption = {}) {
        this.label = label
        this.route = route
        this.icon = icon
        this.active = active === true
        this.disabled = opts.disabled === true
    }

    get type() {
        return "item"
    }
}

class SideMenuGroup {
    label = ""
    menus: SideMenuItem[] = []

    get active() {
        return this.menus.some(m => m.active)
    }

    get type() {
        return "group"
    }
}

</script>
<style lang="scss" scoped>
@import "../../../styles/vars.scss";
#side-navigation {
  transform: translateX(0%) !important;
  position: absolute;
  height: 100%;
  width: $dashboard-menu-width;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  .side-navigation-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .header-section {
      padding-left: 32px;
      padding-right: 20px;
      padding-top: 32px;
      padding-bottom: 8px;
    }

    .header-logo {
      width: 100%;
      border-radius: 8px !important;
      cursor: pointer;
    }

    .app-title {
      margin-top: 24px;
      font-size: 24px;
      font-weight: 700;
    }

    .user-section {
      margin-top: 16px;
      .user-table {
        width: 100%;

        tr {
          td {
            &.avatar-col {
              width: 56px;
              vertical-align: top;
            }

            .user-name {
              font-size: 20px;
              font-weight: 700;
            }

            .user-role {
              font-size: 16px;
              font-weight: 300;
            }
          }
        }
      }
    }

    .menu-list-container {
      flex-grow: 1;
      overflow-y: auto;
    }

    .menu-list {
      padding-left: 32px;
      padding-right: 32px;
      padding-bottom: 28px + $footer-height;

      .menu-seperator {
        margin-top: 8px;
        margin-bottom: 8px;
      }

      .menu-group {
        &:not(:first-child) {
          margin-top: 16px;
        }
        .menu-group-label {
          font-weight: 600;
          font-size: 20px;
          padding-left: 8px;
          border-left: 4px solid $color-primary;
          margin-bottom: 12px;
        }
      }

      .menu-items {
        margin-left: -12px;
        .menu-item {
          &:hover {
            background: #ecf0f1;
            cursor: pointer;
          }

          &.active {
            .menu-label {
              font-weight: 700;
            }
            background: rgb(217, 202, 171);
          }

          margin-bottom: 2px;

          border-radius: 12px;
          padding-left: 10px;
          padding-top: 8px;
          padding-bottom: 8px;
          padding-right: 10px;
          display: flex;
          flex-direction: row;
          align-items: center;

          .menu-icon {
            width: 28px;
            height: 28px;
          }

          .menu-label {
            padding-left: 8px;
            font-weight: 300;
          }

          &.disabled {
            &:hover {
              background: initial !important;
              cursor: no-drop !important;
            }

            .menu-label {
              color: #b2bec3 !important;
            }
          }
        }
      }
    }
  }

  .app-version {
    .menu-item {
      &:hover {
        background: unset !important;
        cursor: unset !important;
      }
    }
  }
}
</style>
