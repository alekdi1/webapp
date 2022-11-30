import { ROUTER_NAMES } from "@/router"
import { Component } from "vue-property-decorator"
import Base from "../../public-base"

@Component
export default class RedirectAppPage extends Base {

    private clickRedirect() {
        // @ts-ignore 
        window.location.href = "cpnserve://"
    }

    // private beforeCreate() {
    //     window.location.href = "cpnserve://"
    // }

    private created() {
        window.location.href = "cpnserve://"
    }

    // private beforeMount() {
    //     window.location.href = "cpnserve://"
    // }

    private mounted() {
        window.location.href = "cpnserve://"
        // document.getElementById('my-cpnserve-app').click();
    }
}
