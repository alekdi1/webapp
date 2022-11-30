<template>
	<router-view />
</template>
<script lang="ts">
import Vue from "vue"
import PN from "@/pages/dashboard/pages/page-names"

export default Vue.extend({
	name: PN.coupon_main
})
</script>