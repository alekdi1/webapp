import { Component } from "vue-property-decorator"
import Base from "../../../dashboard/dashboard-base"

@Component
export default class Redirect extends Base {


     private mounted() {

        const redirectUrl = this.$route.query.redirect;
        console.log(redirectUrl);
        alert(redirectUrl);
       
        window.location.href = redirectUrl.toString()?? "/login";
    }
}
