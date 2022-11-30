<template>
    <transition>
        <!-- <keep-alive :exclude="exclude">
            <router-view />
        </keep-alive> -->
        <router-view />
    </transition>
</template>
<script lang="ts">
import { VuexServices } from "@/services"
import { Component, Vue } from "vue-property-decorator"
import PAGES_NAME from "./pages/page-name"
import DBPageNames from "../page-names"

@Component({
    name: DBPageNames.payment_root
})
export default class PaymentRoot extends Vue {

    private get exclude() {
        return [
            PAGES_NAME.select_payment_method,
            PAGES_NAME.instruction,
            PAGES_NAME.payment_result,
            PAGES_NAME.confirm_payment,
            PAGES_NAME.push_noti,
            PAGES_NAME.invoice_list
        ]
    }

    private beforeDestroy() {
        VuexServices.Payment.clearStore()
    }
}

</script>