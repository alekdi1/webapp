import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { EmpModel } from "@/models"

@Component
export default class ManageEmployeesPage extends Base {
    protected employee: EmpModel.Employee|null = null

    private setEmp(emp: EmpModel.Employee|null) {
        this.employee = emp
    }
}
