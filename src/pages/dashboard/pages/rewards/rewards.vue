<template>
	<router-view />
</template>
<script lang="ts">
import PN from "@/pages/dashboard/pages/page-names"
import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { VuexServices } from "@/services"

@Component({
	name: PN.customer_rewards_root
})
export default class CustomerRewardRoot extends Base {

	private beforeDestroy() {
		VuexServices.CustomerReward.clear()
	}
}
</script>