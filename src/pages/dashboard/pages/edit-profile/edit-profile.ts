import { Component } from "vue-property-decorator";
import Base from "../../dashboard-base";
import { CPMForm } from "@/pages/dashboard/models";
import { AuthService, StoreServices, UserServices } from "@/services";
import { DialogUtils, LanguageUtils, ValidateUtils } from "@/utils";
import { StoreModel } from "@/models";
import { Branch } from "@/models/branch";
import { news_and_activities } from "@/lang/th/pages";

const SORT_TYPES = Object.freeze({
  store_name_asc: "store_name_asc",
  store_name_desc: "store_name_desc"
})

@Component
export default class EditProfilePage extends Base {
  private loading = false;
  private form = new ProfileForm();
  private stores: StoreModel.Store[] = []
  private Shopes: Shop[] = []
  private ConsentStatus: any = null;
  private displayTextConsentStatus = "";
  private isShowModal = false;
  private ConsentValue = "";
  private submitConsentloading = false;
  private dialogConsentValue = '';

  private async mounted() {
    await this.getStores()
    await this.getConsentStatus();
  }

  private async getStores() {
    this.loading = true
    try {
      if (this.user.isOwner) {
        this.stores = await StoreServices.getActiveStoresByForEditeProfilePage()
      } else {
        this.stores = await StoreServices.getShopsByUser()
      }

      this.stores = this.stores?.filter(s => s.floorRoom)
      this.sortStore()
      const shoplogs: Shop[] = []

      if (this.stores != undefined && this.stores?.length > 0) {
        console.log(this.stores)
        for (const b of this.stores) {
          console.log(b)
          const checkshop = shoplogs.filter((x: Shop) => x.shopName == b.nameTh || x.shopName.toUpperCase() == b.nameEn.toUpperCase())
          if (checkshop.length == 0) {
            const shop = new Shop();
            shop.id = b.id
            shop.industryCode = b.industryCode
            shop.shopName = b.nameTh
            shoplogs.push(shop);
          }
        }

        this.Shopes = shoplogs;

        for (const b of shoplogs) {
          const selectedbranch = this.stores.filter((x: StoreModel.Store) => x.nameTh == b.shopName|| b.shopName.toUpperCase() == x.nameEn.toUpperCase())
          for (const f of selectedbranch) {
            const branchList = b.branches.filter((x: Branch) => x.id == f.branch.id)
            if (branchList.length == 0) {
              b.branches.push(f.branch);
            }
          }
        }
      }
    } catch (e) {
      DialogUtils.showErrorDialog({ text: e.message || e })
    }
    this.loading = false
  }

  private sortStore(type = SORT_TYPES.store_name_asc) {
    const stores = this.stores
    switch (type) {
      case SORT_TYPES.store_name_asc:
        this.stores = [...stores].sort((v1, v2) => v1.displayName.localeCompare(v2.displayName))
        break
      case SORT_TYPES.store_name_desc:
        this.stores = [...stores].sort((v1, v2) => v2.displayName.localeCompare(v1.displayName))
        break
    }
  }

  private editProfileClick() {
    const f = new ProfileForm();
    f.phone.value = this.user.mobileNo;
    f.email.value = this.user.email;
    this.form = f;
    this.$router.push({
      query: {
        action: "edit",
        ts: new Date().getTime().toString()
      }
    });
  }

  private get isOwner() {
    return this.user.isOwner;
  }

  private get view() {
    switch (this.$route.query.action) {
      case "edit":
        return "edit";
      default:
        return "view";
    }
  }

  private async saveEditProfile() {
    this.form.validate = true;

    const err = Object.values(this.form.errors).find(e => e !== null);
    if (err) {
      return;
    }

    this.loading = true;
    try {
      const { phone, email } = this.form;
      await UserServices.updateUserPhoneAndEmail({
        email: email.value,
        phone: phone.value
      });

      this.user.email = email.value;
      this.user.mobileNo = phone.value;

      this.cancelEdit();
    } catch (e) {
      DialogUtils.showErrorDialog({ text: e.message || e });
    }
    this.loading = false;
  }

  private async getConsentStatus() {
    this.ConsentStatus = await AuthService.getUserConsentStatus(this.user.token);
    this.displayTextConsentStatus = this.ConsentStatus.data.consent.consent_status == "Y" ? "ยินยอม" : this.ConsentStatus.data.consent.consent_status == "N" ? "ไม่ยินยอม" : "-"
    this.ConsentValue = this.ConsentStatus.data.consent.consent_status;
    this.dialogConsentValue = this.ConsentValue;
  }

  private async submitComfirmConsent() {
    this.submitConsentloading = true;

    try {
      const rs = await AuthService.acceptConsent(
        this.user!,
        this.ConsentStatus.data.consent.consent_version,
        this.user?.token || "",
        {
          consent: this.dialogConsentValue == "Y" ? true : false,
          tnc: true
        },
        this.dialogConsentValue == "" ? "U" : this.dialogConsentValue == "Y" ? "Y" : "N"
      )

      this.submitConsentloading = false;
      console.log("rs -- saveEditProfile -->", rs)

      this.getConsentStatus();
      this.isShowModal = false;
    } catch (e) {
      DialogUtils.showErrorDialog({ title: e.message || e })
      this.submitConsentloading = false;
      this.isShowModal = false;
    }
  }

  private cancelEdit() {
    this.$router.replace({
      path: this.$route.path
    });
  }

  private get text() {
    return {
      contact_note: LanguageUtils.lang("หากท่านต้องการแก้ไขข้อมูล กรุณาติดต่อเจ้าหน้าที่ที่ดูแลร้านค้าของท่าน","Please contact staff in charge of your store to change profile"),
      status_consent: LanguageUtils.lang("สถานะความยินยอม", "Consent Status"),
      consent_desc: LanguageUtils.lang("ความยินยอมที่ท่านให้ไว้กับบริษัท เซ็นทรัลพัฒนา จำกัด(มหาชน), บริษัทในเครือ และ/หรือกลุ่มเซ็นทรัลเพื่อเก็บรวบรวม ประมวลผล รวมถึงเพื่อการวิเคราะห์กิจกรรมทางการตลาด แจ้งข้อมูลข่าวสาร นำเสนอรายการส่งเสริมการขาย และ/หรือเปิดเผยข้อมูลส่วนบุคคลของท่าน ตามนโนบายความเป็นส่วนตัวฯ","Consent you have given to Central Pattana Public Company Limited, affiliated companies and/or Central Group to collect, process including for marketing analysis, sending the newsletters, offering promotional materials, and disclose your Personal Data as set out in our Privacy Policy."),
      consent_desc_2: LanguageUtils.lang ("ทั้งนี้ ท่านสามารถอ่านและตรวจสอบรายละเอียดนโยบายความเป็นส่วนตัวของบริษัทฯ ได้ที่เว็ปไซต์","You can find the details of our Privacy Policy from the following website"),
      acceptConsent: LanguageUtils.lang("ยินยอม", "Consent"),
      notAcceptConsent: LanguageUtils.lang("ไม่ยินยอม", "No Consent"),
      editText: LanguageUtils.lang("แก้ไขข้อมูลส่วนตัว", "Edit Profile"),
      url:LanguageUtils.lang("https://www.centralpattana.co.th/th/sustainability/corporate-governance/privacy-policy", "https://www.centralpattana.co.th/en/sustainability/corporate-governance/privacy-policy"),
    };
  }

  private async showModalConsent() {
    this.dialogConsentValue = this.ConsentValue;
    this.isShowModal = !this.isShowModal;
  }

  private async clickClooseConsentValue(value: string) {
    this.dialogConsentValue = value == this.dialogConsentValue ? "" : value;
  }
}

class ProfileForm {
  validate = false;
  email = new CPMForm.FormValue();
  phone = new CPMForm.FormValue();
  avatar = new CPMForm.ImageFormValue();

  get errors() {
    const { email, phone } = this;
    return {
      email: ((email) => {
        // if (!email && !phone) {
        //   return LanguageUtils.lang("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์", "Please input email or phone number");
        // }
        if (email && !ValidateUtils.validateEmail(email)) {
          return LanguageUtils.lang("อีเมลไม่ถูกต้อง", "Email invalid");
        }
        return null;
      })(email.value),
      phone: ((phone) => {
        // if (!email && !phone) {
        //   return LanguageUtils.lang("กรุณากรอกอีเมลหรือเบอร์โทรศัพท์", "Please input email or phone number");
        // }
        if (phone && !ValidateUtils.validatePhone(phone)) {
          return LanguageUtils.lang("เบอร์โทรศัพท์ไม่ถูกต้อง", "Phone number invalid");
        }
      })(phone.value)
    };
  }
}

class Shop {
  id = ""
  industryCode = ""
  shopName = ""
  branches: Branch[] = []
}
