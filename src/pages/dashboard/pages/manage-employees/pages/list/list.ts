import { Component } from "vue-property-decorator"
import Base from "../manage-employees-base"
import { EmpModel } from "@/models"
import { DialogUtils, LanguageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import { EmployeeServices } from "@/services"
import CPNServeApp from "@/app"

@Component
export default class EmpListPage extends Base {

    private loading = false
    private search = ""
    private deleteDialog = new DeleteDialog()
    private employees: EmpModel.Employee[] = []
    private displayList: Employee[] = []

    private get text() {
        const t = (k: string) => this.$t("pages.manage_emp." + k).toString()

        return {
            title_emp_list: t("title_emp_list"),
            search_branch: LanguageUtils.lang("ค้นหาชื่อผู้ใช้งาน", "Find Name."),
            add_new_emp: t("add_new_emp"),
            user_id: LanguageUtils.lang("ชื่อผู้ใช้งาน", "Username")
        }
    }

    private clearSearch() {
        this.search = ""
    }

    private viewDetail(e: Employee) {
        this.$emit("onEmpChange", e.emp)
        this.$router.push({
            name: ROUTER_NAMES.manage_emp_detail,
            params: {
                emp_id: e.emp.id
            }
        })
    }

    private get empList() {
        const srh = this.search.replaceAll(" ","").toLowerCase()
        return this.search ? this.employees.filter(s => ( s.firstname.toLowerCase().replaceAll(" ","").includes(srh) 
        || s.lastname.toLowerCase().replaceAll(" ","").includes(srh) 
        || (s.firstname.toLowerCase().replaceAll(" ","") + s.lastname.toLowerCase().replaceAll(" ","")).includes(srh)
        || s.username.toLowerCase().replaceAll(" ","").includes(srh)
        )).map(z => new Employee(z)) : this.employees.map(z => new Employee(z))
    }

    private editEmp(emp: Employee) {
        this.$emit("onEmpChange", emp.emp)
        this.$router.push({
            name: ROUTER_NAMES.manage_emp_form_edit,
            params: {
                emp_id: emp.emp.id
            },
            query: {
                ts: new Date().getTime().toString()
            }
        })
    }

    private deleteEmp(emp: Employee) {
        this.deleteDialog = new DeleteDialog(emp.emp)
        this.deleteDialog.show = true
    }
    
    private permissionshop(emp: Employee) {
        // console.log(this.user.permissions)
        // console.log(this.employees)
        // console.log(emp)
        const my_permissions = this.user.permissions
        const employee_permissions = this.employees.find(e=>e.id==emp.id)?.permissions || []
        let same_shops = true
        if(!this.user.isOwner){
            if(my_permissions.length >= employee_permissions?.length){
                employee_permissions.filter(e=> {
                    const dummyarray = my_permissions.filter(e2=>{
                        if(e.permission == e2.permission){
                            const dummy2 = e.shops.filter(e3=>{
                                const dummy3 = e2.shops.filter(e4=>e3.id == e4.id)
                                // console.log(dummy3)
                                    if(dummy3.length==0){
                                        same_shops = false
                                    }
                                    return dummy3.length>0
                                })
                            
                            // same_permission.push({[e.permission]:{org:e.shops,new:e2.shops}} )
                        }
                        return e.permission == e2.permission
                    })
                    if(dummyarray.length==0){
                        same_shops = false
                    }
                    
                    // console.log(dummyarray)
                })
            }else{
                same_shops = false
            }
        }
        
        return same_shops
    }

    private addNewEmp() {
        this.$router.push({
            name: ROUTER_NAMES.manage_emp_form_add,
            query: {
                ts: new Date().getTime().toString()
            }
        })
    }

    private async confirmDeleteEmp() {
        this.deleteDialog.loading = true
        try {
            console.log("confirm delete", this.deleteDialog.emp.id)
            await EmployeeServices.deleteEmployee(this.deleteDialog.emp.id)
            console.log(`Emp ${this.deleteDialog.emp.id} deleted`)

            const idx = this.employees.findIndex(e => e.id === this.deleteDialog.emp.id)
            if (idx > -1) {
                this.$delete(this.employees, idx)
            }
        } catch (e) {
            console.log(e.message || e)
            DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ลบไม่สำเร็จ", "Error while delete user")
            })
        }
        this.deleteDialog.loading = false
        this.deleteDialog.show = false
    }

    private mounted() {
        this.getEmps()
    }

    private async getEmps() {
        this.loading = true
        try {
            if (this.user.isOwner) {
                this.employees = await EmployeeServices.getEmployees(this.user.customerNo)
            } else {
                const my_permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.employee_management)
                if (!my_permission) {
                    throw new Error(LanguageUtils.lang("คุณไม่มีสิทธิ์เข้าใช้งาน", "You have no permission to use this feature"))
                }

                const emps = await EmployeeServices.getEmployees(this.user.customerNo)
                this.employees = emps.filter(s => { 
                    
                    // return (s.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.employee_management)?.shops.filter(p=> permission.shops.some(ps => ps.displayName === p.displayName && ps.branch.code === p.branch.code)).length || 0) > 0 })
                    return (s.permissions.find(p => (p.shops.filter(s=> this.user.permissions.filter(permission => permission.shops.some(ps => ps.displayName === s.displayName && ps.branch.code === s.branch.code)).length || 0 ).length || 0 ) > 0 ) )  })
            }
        } catch (e) {
            console.log(e)
        }
        this.loading = !true
    }
}

class Employee {
    emp: EmpModel.Employee
    constructor(emp: EmpModel.Employee) {
        this.emp = emp
    }

    get id() {
        return this.emp.id
    }
    get fullName() {
        return this.emp.fullName
    }

    get displayBranchList() {
        return ""
    }

    get displayRole() {
        const r = Object.values(EmployeeServices.ROLES).find(r => r.value === this.emp.role.name)
        return r?.displayName || this.emp.role.name
    }

    get username() {
        return this.emp.username
    }
}

class DeleteDialog {
    show = false
    emp: EmpModel.Employee
    loading = false

    constructor(emp = new EmpModel.Employee()) {
        this.emp = emp
    }

    get content() {
        return LanguageUtils.lang(
            `ลบผู้ใช้ '${this.emp.fullName}' หรือไม่`,
            `Delete employee '${this.emp.fullName}' ?`
        )
    }
}
