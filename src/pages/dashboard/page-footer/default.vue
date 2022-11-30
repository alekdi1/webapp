<template>
    <cpn-dsb-footer />
</template>
<script lang="ts">
import { Component } from "vue-property-decorator"
import Base from "./footer-base"

@Component({
    name: "cpn-dbs-default-footer"
})
export default class DashboardDefaultFooter extends Base {}

</script>
