import { Component } from "vue-property-decorator"
import Base from "../../dashboard-base"
import Name from "../page-names"

@Component({
    name: Name.contact_branch_root
})
export default class ContactBranchPage extends Base {

    private get exclude() {
        return [
            Name.contact_form,
            Name.answer_question_detail
        ]
    }
}
