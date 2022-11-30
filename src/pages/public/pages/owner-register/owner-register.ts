import { Component } from "vue-property-decorator";
import Base from "../../public-base";
import { EmployeeServices, UserServices } from "@/services";
import { UserModel } from "@/models";
import { DialogUtils, ValidateUtils } from "@/utils";
import SubmitModal from "./submitted-modal/submitted-modal.vue";

class UserRegisterForm {
  username = "";
  password = "";
  repassword = "";
  validated = false;
  submitted = false;

  get errors() {
    return {
      emptyName: (u => {
        if (u.length === 0) {
          return "กรุณาระบุชื่อผู้ใช้";
        }
        return null;
      })(this.username),

      pLength: (p => {
        if (p.length < 8) return "รหัสผ่านไม่ถูกต้อง รหัสผ่านควรมีตัวอักษรอย่างน้อย 8 ตัวตัวอักษร";
        return null;
      })(this.password),

      character: (p => {
        // const checkValidateUsername = p.indexOf(" ") != -1
        // if (ValidateUtils.validPassword(p) || !ValidateUtils.validatePasswordLetter(p) || checkValidateUsername) {
        if (ValidateUtils.validPassword(p) || !ValidateUtils.validatePasswordLetter(p)) {
          return "รหัสผ่านไม่ถูกต้อง รหัสผ่านควรประกอบด้วยตัวอักษรภาษาอังกฤษตัวใหญ่ ตัวเล็ก ตัวเลข และ สัญลักษณ์";
        }
        return null;
      })(this.password),

      mismatch: ((p, c) => {
        if (p !== c) return "รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบ";
        return null;
      })(this.password, this.repassword),

      isvalidUsername: (u => {
        if (u.length > 0) {
          const pattern = /^(?:[A-Z\d][A-Z\d@_-]{3,20}|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i;
          const checkValidateUsername = u.match(pattern)
          if (checkValidateUsername == null) {
            return "รูปแบบชื่อผู้ใช้งานไม่ถูกต้อง";
          }
          return null
        }
      })(this.username)
    };
  }

  get allValidated() {
    return Object.values(this.errors).every(e => e === null);
  }

  get submitDisabled() {
    return (!this.validated ? false : !this.allValidated) || this.submitted;
  }
}

class EmployeeForm {
  id = "";
  title = "";
  icon = "";
  emailOrPhone = "";
  url = "";
  submitted = false;
  validated = false;
  loading = false;

  constructor(id: string, title: string, icon: string) {
    this.id = id;
    this.title = title;
    this.icon = icon;
  }

  get errors() {
    return {
      text: (u => {
        const phone = this.emailOrPhone.replace(" ", "").replace("-", "");
        console.log("Phone", !ValidateUtils.validatePhone(phone));
        console.log("Email", !ValidateUtils.validateEmail(this.emailOrPhone));
        console.log("Length", u.length === 0);
        if (
          u.length === 0 ||
          !(
            ValidateUtils.validatePhone(phone) ||
            ValidateUtils.validateEmail(this.emailOrPhone)
          )
        )
          return "กรุณาระบุเบอร์โทรหรืออีเมลของพนักงาน";
        return null;
      })(this.emailOrPhone)
    };
  }

  get isPhone() {
    const phone = this.emailOrPhone.replace(" ", "").replace("-", "");
    return ValidateUtils.validatePhone(phone);
  }

  get allValidated() {
    return Object.values(this.errors).every(e => e === null);
  }

  get submitDisabled() {
    return (
      (!this.validated ? false : !this.allValidated) ||
      this.submitted ||
      this.loading
    );
  }
}

@Component({
  components: {
    "submit-pop-up": SubmitModal
  }
})
export default class OwnerRegisterPage extends Base {
  private userForm = new UserRegisterForm();
  private loading = false;
  private showSubmitPopUp = false;
  private showEmployeeSection = false;

  private formList = [
    new EmployeeForm(
      EmployeeServices.ROLES.manager.value,
      EmployeeServices.ROLES.manager.displayName,
      require("@/assets/images/icons/register-employee-manager.svg")
    ),
    new EmployeeForm(
      EmployeeServices.ROLES.finance_contractor.value,
      EmployeeServices.ROLES.finance_contractor.displayName,
      require("@/assets/images/icons/register-employee-finance.svg")
    ),
    new EmployeeForm(
      EmployeeServices.ROLES.staff.value,
      EmployeeServices.ROLES.staff.displayName,
      require("@/assets/images/icons/register-employee.svg")
    )
  ];

  private async mounted() {
    this.loading = true;
    await this.retrivedUserInfo();
    this.loading = false;
  }

  private get email() {
    return this.$route.query.email === null ? "" : this.$route.query.email + "";
  }

  private get token() {
    return String(this.$route.query.token || "");
  }

  private registerInfo() {
    return mapRegisterInfo(this.email, this.userForm, this.formList);
  }

  private async addEmployee() {
    await this.retrivedUserInfo();
    this.showEmployeeSection = true;
  }

  private async register() {
    const info = this.registerInfo();
    this.userForm.validated = true;
    if (this.userForm.allValidated) {
      this.loading = true;
      try {
        const response: any = await UserServices.ownerRegister(
          this.token,
          info
        );
        console.log(response);
        if (response && response?.error_code === 400) {
          const checkDuplicate = response.message.search("already exists.");
          if (checkDuplicate > -1) {
            throw {
              title: "ขออภัย",
              message: `ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว กรุณาเปลี่ยนเป็นชื่อผู้ใช้อื่น`
            };
          } else {
            throw {
              title: "ขออภัย",
              message: `ไม่สามารถสร้างบัญชีผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ Call center โทร 02-021-9999`
            };
          }
        } else if (response?.status.toLowerCase() === "success") {
          this.showSubmitPopUp = true
        }
      } catch (e) {
        DialogUtils.showErrorDialog({ title: e.title, text: e.message || e});
      }
      this.loading = false;
    }
  }

  private copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
  }

  private async employeeRegister(staff: EmployeeForm) {
    staff.validated = true;
    console.log(staff);
    if (staff.allValidated) {
      staff.loading = true;
      try {
        const params: {
          token: string;
          role: string;
          email?: string;
          phone_number?: string;
        } = {
          role: staff.id,
          token: this.token
        };

        if (staff.isPhone) {
          params.phone_number = staff.emailOrPhone;
        } else {
          params.email = staff.emailOrPhone;
        }

        await UserServices.registerEmployee(params);
        await this.retrivedUserInfo();
        staff.submitted = true;
      } catch (e) {
        DialogUtils.showErrorDialog({ text: e.message || e});
      }
      staff.loading = false;
    }
  }

  private async retrivedUserInfo() {
    try {
      const { token } = this;
      if (!token) {
        throw new Error("No authorized token");
      }

      const info = await UserServices.retriveEmployee(token);

      if (info.ownerName) {
        this.userForm.username = info.ownerName;
        this.userForm.submitted = true;
        this.showEmployeeSection = true;
      }

      for (const staff of info.staffs) {
        const f = this.formList.find(s => s.id === staff.role);
        if (f) {
          f.emailOrPhone = staff.email || staff.phone || "";
          f.submitted = true;
          f.url = staff.url;
        }
        console.log(this.formList);
      }
    } catch (e) {
      console.log("error =>", e.message);
      if (e.message === "Invalid token.") {
        this.userForm.submitted = true;
        DialogUtils.showErrorDialog({
          text: `ไม่สามารถสร้างบัญชีผู้ใช้งานได้ เนื่องจากลิงค์ไม่ถูกต้อง กรุณาติดต่อ call center โทร 02-021-9999`
        });
      } else {
        DialogUtils.showErrorDialog({
          text: e.message || JSON.stringify(e)
        });
      }
    }
  }

  isLetter(event: any) {
    const char = String.fromCharCode(event.keyCode); // Get the character
    if (/^[A-Za-z0-9]|[@._-]+$/.test(char)) return true;
    // Match with regex
    else event.preventDefault(); // If not match, don't add to input text
  }

  isPassword(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode);
    if (/^[A-Za-z0-9#?!@$%^&*-\]]+$/.test(char)) return true;
    else event.preventDefault();
  }
}

function mapStaffInfo(s: EmployeeForm) {
  const r = new UserModel.StaffRegister();
  r.role = s.id;

  if (s.isPhone) {
    r.phone = s.emailOrPhone;
  } else {
    r.email = s.emailOrPhone;
  }

  return r;
}

function mapRegisterInfo(
  email: string,
  o: UserRegisterForm,
  s: EmployeeForm[]
) {
  const r = new UserModel.OwnerRegister();
  r.username = o.username;
  r.password = o.password;
  r.email = email;

  const nrs: UserModel.StaffRegister[] = [];
  for (const i of s) {
    if (i.emailOrPhone) {
      nrs.push(mapStaffInfo(i));
    }
  }

  r.staffs = nrs;

  return r;
}
