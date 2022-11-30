import { Component } from "vue-property-decorator";
import Base from "../../dashboard-base";
import { ROUTER_NAMES as rn } from "@/router";
import { ROUTER_NAMES } from "@/router"
import ctjs, { kdf } from "crypto-js"

import {
  VuexServices,
  UserServices,
  PostService,
  NotificationServices,
  EmployeeServices,
  FileService,
  StoreServices,
  MaintainanceServices,
  RewardServices
} from "@/services";
import { PostModel, UserModel } from "@/models";
import { TimeUtils, DialogUtils, StringUtils,LanguageUtils } from "@/utils";
import AnnoucementModal from "./components/annoucement/annoucement.vue";
import HomeUserOnBoardModal from "./components/home-user-on-board/home-user-on-board.vue";
import i18n from "@/plugins/i18n";
import moment from "moment";
import { lang } from "@/utils/language";

import { transactionHistoryReport } from "@/services/reward.service";
import CouponHistoryShopListPage from "../coupon-history/pages/shop-list/shop-list";

const t = (key: string) => i18n.t("pages.dashboard." + key).toString();

function getFavoriteMenuTemplate() {
  const defalutMenu: (MenuItem | null)[] = [];
  for (let i = 0; i < 6; i++) {
    defalutMenu.push(null);
  }
  return defalutMenu;
}

const newsCats = PostService.POST_NEWS_SUB_CATEGORY_NAMES;

@Component({
  components: {
    "cpn-annoucement-modal": AnnoucementModal,
    "cpn-user-on-board-home-modal": HomeUserOnBoardModal
  }
})
export default class HomePage extends Base {
  private isOnBoarding = false;
  private isAdding = false;
  private isDeleting = false;
  private isNewsLoading = false;
  private isNotificationLoading = false;
  private userFavMenu = getFavoriteMenuTemplate();
  private addMenuIndex = -1;
  private showButtomSheet = false;
  private showDeleteIcon = false;
  private selectedAddMenuItem: MenuItem | null = null;
  private newsContents: NewsItem[] = [];
  private hasPopup = true;
  private popup: PostModel.Post | null = null;
  private notifications: PostModel.Notification[] = [];
  private permissionMenus: MenuItem[] = [];
  private isOnPop = false;

  private async mounted() {
    this.checkFirstVisit();
    this.getPermissionMenus();
    await this.getPopUp();
    await this.getFavMenu();
    await this.getNewsContents();
    await this.getNotifications();
    // this.updateCountPasswordWrong();
  }

  private get text() {
    return {
      add_fav_menu: this.$t("pages.homepage.add_fav_menu").toString(),
      no_new_news: this.$t("pages.homepage.no_new_news").toString(),
      select_fav_menu: this.$t("pages.homepage.select_fav_menu").toString(),
      confirm: this.$t("confirm").toString(),
      see_all: this.$t("pages.homepage.see_all").toString(),
      betweenDate: lang("ตั้งแต่วันที่", "Since")
    };
  }

  private get isQRUser() {
    return this.user.isQRUser;
  }

  // ------------------- Is first visit ? -----------------------
  private onNotFirstVisitOrFinishOnBoard(isOnboarding: boolean) {
    this.isOnBoarding = isOnboarding;
  }

  private checkFirstVisit() {
    const isFirstVisit = localStorage.getItem("firstVisitHomepage");
    this.isOnBoarding =
      isFirstVisit === null || JSON.parse(isFirstVisit) === true;
  }

  // -------------------- Favorite menu -------------------------

  private async getFavMenu() {
    if (this.isQRUser) {
      return;
    }
    const favMenus = await UserServices.getUserFavMenu();
    const menus = getFavoriteMenuTemplate();
    const pm = this.permissionMenus;

    for (const menu of favMenus) {
      if (pm.some(p => menu.id === p.id)) {
        const m = pm.find(i => i.id === menu.id);
        if (m) {
          menus[menu.position] = m;
          m.show = false;
        }
      }
    }

    this.userFavMenu = menus;
  }

  private async updateFavMenu() {
    const menus: UserModel.UserFavMenu[] = [];
    for (const [idx, favMenu] of this.userFavMenu.entries()) {
      if (favMenu) {
        const m = new UserModel.UserFavMenu();
        m.id = favMenu.id;
        m.name = favMenu.route;
        m.position = idx;
        menus.push(m);
      }
    }

    try {
      await UserServices.updateUserFavMenu(menus);
      await this.getFavMenu();
    } catch (e) {
      DialogUtils.showErrorDialog({ text: e.message || e });
    }
  }

  private addNewFavMenu(idx: number) {
    this.selectedAddMenuItem = null;
    this.addMenuIndex = idx;
    this.showButtomSheet = true;
  }

  private selectAddFavMenu(item: MenuItem) {
    this.selectedAddMenuItem = item;
  }




  private async notiClick(item: NotificationItem) {
    const { TYPES } = NotificationServices
    const notification = this.notifications.find((x: PostModel.Notification) => x.refId == item?.refId); // for real
    const notiId = notification ? notification.id : 0;


    switch (item.type) {
      case TYPES.contact_us: return this.$router.push({
          name: ROUTER_NAMES.contact_answer_question_detail,
          params: {
              id: String(item.refId)
          },
          query: {
              noti_id: String(item.item.id),
              ts: new Date().getTime().toString()
          }
      })

      case TYPES.maintenance: {
          try {
              const rs = await MaintainanceServices.getMaintainanceByNotiRefId(String(item.refId))
              return this.$router.push({
                  name: ROUTER_NAMES.maintainance_status_list,
                  query: {
                      bpNo: this.user.bpNumber,
                      tenantNo: rs.tenantId,
                      status: "success"
                  }
              })
          } catch (e) {
              console.log(e)
              DialogUtils.showErrorDialog({
                  text: e.message || "Get maintainance detail error"
              })
          }

          break
      }

      case TYPES.promotion: return this.$router.push({
          name: ROUTER_NAMES.dashboard_promotion_detail,
          params: {
              id: String(item.refId)
          }
      })

      case TYPES.post: return this.$router.push({
          name: ROUTER_NAMES.dashboard_news_and_activities_detail,
          params: {
              id: String(item.refId)
          }
      })

      case TYPES.payment_success: return this.$router.push({
          name: ROUTER_NAMES.payment_result,
          query: {
              order_id: String(item.refId),
              show_from: "notification",
              state: ctjs.SHA1(JSON.stringify(item) + JSON.stringify(this.user) + ROUTER_NAMES.payment_result).toString(),
              noti_id: String(notiId)
          }
      })

      case TYPES.payment_pending: return this.$router.push({
          name: ROUTER_NAMES.payment_invoice_list,
          query: {
              order_id: String(item.refId),
              show_from: "notification",
              notification_id: String(item.item.id),
              state: ctjs.SHA1(JSON.stringify(item) + JSON.stringify(this.user) + ROUTER_NAMES.payment_invoice_list).toString()
          }
      })

      case TYPES.branch_annonuce: return this.$router.push({
          name: ROUTER_NAMES.dashboard_annoucement_detail,
          params: {
              id: String(item.refId)
          }
      })

      case TYPES.request_void:
      case TYPES.reject_void:
      case TYPES.approve_void: {

          try {
              const transData = await RewardServices.getTransactionById(String(item.refId))
              const rn = TYPES.reject_void === item.type ?
                  ROUTER_NAMES.rewards_transaction_history : ROUTER_NAMES.rewards_approve_void
              const store = transData.shop_detail
              return this.$router.push({
                  name: rn,
                  query: {
                      show_from: "notification",
                      noti_id: String(item.item.id),
                      transaction_id: transData.transaction_id,
                      item_id: String(transData.id),
                      action: "expand",
                      shop_name: store.shop_name,
                      shop_unit: store.floor_room,
                      branch_name: store.branch_name,
                      shop_number: store.shop_number,
                      industry_code: store.industry_code,
                      branch_code: store.branch_code,
                      floor_room: store.floor_room,
                      hs: ctjs.SHA1(JSON.stringify(store) + rn + new Date().getTime()).toString(),
                      status_tab: transData.status
                  },
                  params: {
                      shop_id: String(store.id)
                  }
              })
          } catch (e) {
              console.log(e)
              DialogUtils.showErrorDialog({
                  text: e.message || "Get reward transaction detail error"
              })
          }
          break
      }
  }
  
  }

  

  private async confirmAddFavMenu() {
    this.userFavMenu[this.addMenuIndex] = this.selectedAddMenuItem;
    this.isAdding = true;
    await this.updateFavMenu();
    this.isAdding = false;
    this.showButtomSheet = false;
    this.addMenuIndex = -1;
  }

  private deleteFavMenu() {
    this.showDeleteIcon = true;
  }

  private selectedDeleteFavMenu(idx: number) {
    this.addMenuIndex = idx;
    this.addMenuIndex = -1;
    this.userFavMenu[idx] = null;
  }

  private async confirmDeleteFavMenu() {
    this.isDeleting = true;
    await this.updateFavMenu();
    this.isDeleting = false;
    this.showDeleteIcon = false;
  }

  // -------------------- Get BP Name --------------------------
  private get displayBPName() {
    return this.isQRUser ? this.user.role : this.user.firstName;
  }

  // -------------------- Notification -------------------------
  private async getNotifications() {
    this.isNotificationLoading = true;
    try {
      let notifications: PostModel.Notification[] = [];
      if (this.isQRUser) {
        notifications = await NotificationServices.getGuestOnlyForYou(
          this.user.companyName
        );
      } else {
        notifications = await NotificationServices.getOnlyForYou();
      }
      const reverseNotifications = notifications.reverse();
      this.notifications =
        reverseNotifications.length > 10
          ? reverseNotifications.slice(0, 10)
          : reverseNotifications;
    } catch (e) {
      DialogUtils.showErrorDialog({ text: e.message || e });
    }
    this.isNotificationLoading = false;
  }

  private get isAnnoucementEmpty() {
    return this.notifications.length === 0;
  }

  private getNewsRoute(type: string) {
    switch (type) {
      case newsCats.insight:
        return rn.dashboard_business_insights;
      case newsCats.promotion:
        return rn.dashboard_promotion;
      case newsCats.news_event:
        return rn.dashboard_news_and_activities;
      default:
        return rn.dashboard_news_and_activities;
    }
  }

  // ------------------------ Pop up --------------------------
  private async getPopUp() {
    const { postType } = VuexServices.Root.getAppConfig();
    const popUp = postType.find(
      i => i.name === PostService.POST_CATEGORY_NAMES.pop_up
    );
    if (!popUp) return;
    const opts = {
      postType: popUp.id,
      active: 1,
      branch: this.user.allowedBranchIds.join(","),
      ...(!this.isQRUser ? { userId: this.user.id } :{ bpNumber: this.user.customerNo  })
    };
    let popup
    if(this.user.role == 'QR'){
      popup = await PostService.getPostsGuest(opts)
    }else{
      popup = await PostService.getPosts(opts)
    }
    console.log("popup ", popup)
    if (popup.length === 0) {
      this.popup = null;
      return;
    }
    const dataPopup: any = popup[0]
    const startDate = moment(dataPopup.startDate);
    const endDate = moment(dataPopup.endDate);
    const datenow = moment(new Date(),"YYYY-MM-DD HH:mm:ss");
    console.log(new Date().toLocaleDateString())
    // console.log(endDate)
    // console.log(datenow)
    // console.log(datenow.isBetween(dataPopup.startDate, dataPopup.endDate))
    if (datenow.isBetween(startDate, endDate)) {
      this.popup = popup[0];
    }
    console.log(this.popup)
  }

  // -------------------- News content -------------------------
  private async getNewsContents() {
    this.isNewsLoading = true;
    const { postType } = VuexServices.Root.getAppConfig();
    const news = postType.find(
      i => i.name === PostService.POST_CATEGORY_NAMES.news
    );
    const contents: NewsItem[] = [];
    if (news) {
      const categories = await PostService.getCategories(news.id);
      const catCodes = categories.filter(i =>
        [newsCats.insight, newsCats.promotion, newsCats.news_event].includes(
          i.code
        )
      );
      const catGroupByCode: CategoriesGroup = catCodes.reduce((r, a) => {
        r[a.code] = r[a.code] || [];
        r[a.code].push(a);
        return r;
      }, Object.create(null));

      const mergeCatGroup: any[] = [];

      for (const [key, catGroup] of Object.entries(catGroupByCode)) {
        const catIds = catGroup.map((i: PostModel.PostTypeCategories) => i.id);
        for (let i = 0; i < catIds.length; i++) {
          const f = {
            key: key,
            cat_id: catIds[i]
          }
          mergeCatGroup.push(f);
        }
      }

      for (const h of mergeCatGroup) {
        try {
          // const opts = {
          //   pageSize: 100,
          //   sortBy: "created_at",
          //   sortOpt: "desc",
          //   category: catIds.join(","),
          //   // active: 1,
          //   branch: this.user.allowedBranchIds.join(","),
          //   read: 0,
          //   ...(!this.user.isQRUser && { userId: this.user.id })
          // };
          const items = await PostService.getPostDescUnReaded(h.cat_id);
          if (items) {
            const latestItem = items
            const title = h.key === PostService.POST_NEWS_SUB_CATEGORY_NAMES.news_event ? "NEWS EVENT" : h.key;
            const newsItem = new NewsItem(
              latestItem.id,
              latestItem.categoryCode,
              title,
              latestItem.title,
              latestItem.image,
              latestItem.desc,
              latestItem.startDate,
              latestItem.endDate
            );
            newsItem.code = h.key
            newsItem.route = this.getNewsRoute(h.key);
            contents.push(newsItem);
          }
        } catch (e) {
          // console.log(e)
        }
      }

      const checkDupicatenewsContents: NewsItem[] = [];
      const sortContent = contents.sort((v1, v2) => v2.catTitle.localeCompare(v1.catTitle))
      for (const f of sortContent) {
        const checkDub = checkDupicatenewsContents.filter(x => x.code == f.code)
        if (checkDub.length == 0) {
          checkDupicatenewsContents.push(f);
        }
      }
      this.newsContents = checkDupicatenewsContents;
    }
    this.isNewsLoading = false;
  }

  private getRouteName(item: NewsItem) {
    switch (item.code) {
      case newsCats.insight:
        return rn.dashboard_business_insights_detail;
      case newsCats.promotion:
        return rn.dashboard_promotion_detail;
      case newsCats.news_event:
        return rn.dashboard_news_and_activities_detail;
      default:
        return "";
    }
  }

  private getImage(imageUrl: string) {
    if (imageUrl && StringUtils.isUrl(imageUrl) && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null)) {
      return imageUrl
    }
    return require("@/assets/images/cpn-placeholder.jpg")
  }

  private displayDate(date: string) {
    return TimeUtils.convertToLocalDateFormat(moment(date));
  }

  private goToSelectedMenu(menu: MenuItem) {
    if (!this.showDeleteIcon) {
      this.$router.push({
        name: menu.route
      });
    }
  }

  private goToNews(item: NewsItem) {
    this.$router.push({
      name: item.route
    });
  }

  private goToPost(item: NewsItem) {
    const rn = this.getRouteName(item);
    this.$router.push({
      name: rn,
      params: {
        id: item.id
      }
    });
  }
  ///เมนู Home > Favorite แสดงเมนูที่สามารถเพิ่มได้ตามสิทธิ์ที่มี
  private get allMenus() {
    const P = EmployeeServices.PERMISSIONS;
    // console.log(EmployeeServices.PERMISSIONS)
    return [
      // manange store
      new MenuItem(
        "1",
        t("menu_maintainance"),
        rn.maintainance,
        require("@/assets/images/dashboard-repair-pose.svg"),
        P.maintenance
      ),
      new MenuItem(
        "2",
        t("menu_rental_value"),
        rn.rental_info_list,
        require("@/assets/images/dashboard-rental-value.svg"),
        P.contract_info
      ),
      new MenuItem(
        "3",
        t("menu_manage_employees"),
        rn.dashboard_manage_employees,
        require("@/assets/images/dashboard-manage-employees.svg"),
        P.employee_management
      ),
      new MenuItem(
        "4",
        t("menu_my_qr_code"),
        rn.dashboard_my_qr_code,
        require("@/assets/images/dashboard-my-qr-code.svg"),
        P.qr_code
      ),

      // billing payment
      new MenuItem(
        "5",
        t("menu_payment"),
        rn.payment_invoice_list,
        require("@/assets/images/dashboard-payment.svg"),
        P.payment
      ),
      new MenuItem(
        "6",
        t("menu_payment_history"),
        rn.dashboard_payment_history,
        require("@/assets/images/dashboard-payment-history.svg"),
        P.payment
      ),
      new MenuItem(
        "7",
        t("menu_request_invoice_and_receipt"),
        rn.request_invoice_and_receipt_store_list,
        require("@/assets/images/dashboard-request-invoice-and-receipt.svg"),
        P.payment
      ),

      // news
      new MenuItem(
        "8",
        t("menu_shopping_center_info"),
        rn.dashboard_shopping_center_list,
        require("@/assets/images/dashboard-shopping-center-info.svg"),
        ""
      ),
      // new MenuItem(
      //     "9",
      //     t("menu_business_insights"),
      //     rn.dashboard_business_insights,
      //     require("@/assets/images/dashboard-business-insights.svg")
      // ),
      new MenuItem(
        "10",
        t("menu_news_and_activities"),
        rn.dashboard_news_and_activities,
        require("@/assets/images/dashboard-news-and-activities.svg"),
        ""
      ),
      new MenuItem(
        "11",
        t("menu_promotion"),
        rn.dashboard_promotion,
        require("@/assets/images/dashboard-promotion.svg"),
        ""
      ),
      new MenuItem(
        "12",
        t("menu_shopping_mall_map"),
        rn.dashboard_shopping_center_map,
        require("@/assets/images/dashboard-shopping-mall-map.svg"),
        ""
      ),

      // my account
      new MenuItem(
        "13",
        t("menu_edit_profile"),
        rn.dashboard_edit_profile,
        require("@/assets/images/dashboard-edit-profile.svg"),
        ""
      ),

      new MenuItem(
        "14",
        t("menu_change_pwd"),
        rn.dashboard_change_pwd,
        require("@/assets/images/dashboard-change-pwd.svg"),
        ""
      ),

      new MenuItem(
        "15",
        t("menu_reg_e_invoice"),
        rn.reg_e_invoice_receipt_menu,
        require("@/assets/images/dashboard-reg-e-invoice.svg"),
        ""
      ),

      new MenuItem(
        "16",
        t("menu_satisfaction_questionnaire"),
        rn.dashboard_satisfaction_questionnaire,
        require("@/assets/images/dashboard-satisfaction-questionnaire.svg"),
        ""
      ),

      // help
      new MenuItem(
        "17",
        t("menu_how_to_use_cpn_app"),
        rn.dashboard_how_to_use_cpn_app,
        require("@/assets/images/dashboard-how-to-use-cpn-app.svg"),
        ""
      ),
      new MenuItem(
        "18",
        t("menu_faq"),
        rn.dashboard_faq,
        require("@/assets/images/dashboard-faq.svg"),
        ""
      ),
      new MenuItem(
        "19",
        t("menu_contact_branch"),
        rn.dashboard_contact_us_select_branch,
        require("@/assets/images/dashboard-contact-branch.svg"),
        ""
      ),
      new MenuItem(
        "20",
        t("menu_tnc"),
        rn.dashboard_tnc,
        require("@/assets/images/dashboard-tnc.svg"),
        ""
      ),
      new MenuItem(
        "21",
        t("menu_pvp"),
        rn.dashboard_pvp,
        require("@/assets/images/dashboard-pvp.svg"),
        ""
      ),
      new MenuItem(
        "22",
        t("menu_watch_sale"),
        rn.watch_sale,
        require("@/assets/images/dashboard-ordering.svg"),
        ""
      ),
      new MenuItem(
        "23",
        t("menu_coupon"),
        rn.coupon_branch,
        require("@/assets/images/icons/coupon.svg"),
        ""
      ),

    ];
  }

  private getPermissionMenus() {
    if (this.user.isOwner) {
      this.permissionMenus = this.allMenus;
      return;
    }

    const userMenus: MenuItem[] = [];

    // const { userPagePermissions } = VuexServices.Root.getAppConfig()
    console.log(this.user.permissions)
    for (const menu of this.allMenus) {
      const permission = EmployeeServices.getRoutePermission(menu.route);
     
      if (
        (menu.permission ||
          this.user.permissions.some(p => {
            // console.log(p)
            return Array.isArray(permission)
              ? permission.includes(p.permission)
              : p.permission === permission
          }
          ))
      ) {
        userMenus.push(menu);
      }
    }

    this.permissionMenus = userMenus;
  }

  private async updateCountPasswordWrong() {
    await UserServices.updatePasswordCount({
      username: this.user.username,
      count: 0
    });
  }
}

class MenuItem {
  id = "";
  label = "";
  route = "";
  icon = "";
  permission = "";
  show = true;

  constructor(
    id: string,
    label: string,
    route: string,
    icon: string,
    permission: string
  ) {
    this.id = id;
    this.label = label;
    this.route = route;
    this.icon = icon;
    this.permission = permission;
  }
}

class NewsItem {
  id = "";
  code = "";
  catTitle = "";
  title = "";
  image = "";
  route = "";
  detail = "";
  date = "";
  endDate = "";

  constructor(
    id: string,
    code: string,
    catTitle: string,
    title: string,
    image: string,
    detail: string,
    date: string,
    endDate: string,
  ) {
    this.id = id;
    this.code = code;
    this.catTitle = catTitle;
    this.title = title;
    this.image = image;
    this.detail = detail;
    this.date = date;
    this.endDate = endDate;
  }
}

interface CategoriesGroup {
  insight?: PostModel.PostTypeCategories[];
  promotion?: PostModel.PostTypeCategories[];
  news_event?: PostModel.PostTypeCategories[];
}
class NotificationItem {
  item: PostModel.Notification
  constructor(noti: PostModel.Notification) {
      this.item = noti
  }

  get refId() {
      return this.item.refId
  }

  get title() {
      return this.item.title || ""
  }

  get desc() {
      return this.item.desc || ""
  }

  get isReaded() {
      return this.item.isRead
  }

  get isNew() {
      return !this.item.isRead
  }

  get type() {
      return this.item.type
  }

  get iconImage(): string {
      switch (this.item.type) {
          case NotificationServices.TYPES.payment: return require("@/assets/images/notification/noti-invoice.svg")
          default: return require("@/assets/images/notification/noti-default.svg")
      }
  }

  get displayDate() {
      const md = moment(this.item.createdDate, moment.ISO_8601)
      return md.isValid() ? `${md.locale(LanguageUtils.getCurrentLang()).format("DD MMM")} ${LanguageUtils.getLangYear(md)}` : ""
  }
}