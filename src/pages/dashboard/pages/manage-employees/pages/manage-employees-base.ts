import { Component, Prop } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { EmpModel } from "@/models"

@Component
export default class ManageEmpBase extends Base {
    @Prop({ default: null })
    protected employee!: EmpModel.Employee|null
}
