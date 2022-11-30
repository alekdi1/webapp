import { Component } from "vue-property-decorator"
import Base from "@/pages/dashboard/dashboard-base"
import { EmployeeServices, StoreServices, VuexServices } from "@/services"
import { RewardModel, StoreModel } from "@/models"

@Component
export default class CustomerRewardPageBase extends Base {
    @VuexServices.CustomerReward.store.VX()
    protected store!: StoreModel.Store|null

    @VuexServices.CustomerReward.configs.VX()
    protected configs!: RewardModel.RewardConfig[]

    protected get config() {
        if (this.configs.length > 0) {
            return this.configs.find(c => c.active && c.priority === 1) || this.configs[0]
        }
        return null
    }

    protected get earnRate() {
        return this.config?.earnRate || 0
    }

    protected get pointEarned() {
        return this.config?.pointEarned || 0
    }

    protected get minPointEarn() {
        return this.config?.minPointEarn || 0
    }

    protected get redeemRate() {
        return this.config?.redeemRate || 0
    }

    protected get pointSpended() {
        return this.config?.pointSpended || 0
    }

    protected get minPointRedeem() {
        return this.config?.minPointRedeem || 0
    }

    protected get partnerCode() {
        return this.config?.partnerCode || ""
    }

    protected get branchCode1Biz() {
        return this.config?.branchCode1Biz || ""
    }

    protected filterConfig(configs: RewardModel.RewardConfig[]) {
        // sort priority and get first
        return [...configs].sort((a, b) => a.priority - b.priority)[0]
    }

    protected getAvailableConfig(configs: RewardModel.RewardConfig[], earnedPoint: number) {
        const sortedConfigs = configs.sort((a, b) => a.priority - b.priority)
        for (const config of sortedConfigs) {
            if (config.remainingPoint > 0) {
                if (earnedPoint === 0) {
                    return config
                }
                if (config.remainingPoint > earnedPoint) {
                    return config
                }
            } 
        }
        return null
    }

    protected get userPermissions() {
        const hasPermission = (permission: string) => (this.user.isOwner ? true : this.user.permissions.some(p => p.permission === permission))
        const P = EmployeeServices.PERMISSIONS
        return {
            approveVoid: hasPermission(P.rewards_cancel_point),
            history: hasPermission(P.rewards_history),
            managePoint: hasPermission(P.rewards_manage_point),
            dashboard: hasPermission(P.rewards_dashboard),
            download: hasPermission(P.rewards_history_download),
        }
    }

    protected get isQueryStoreMatchStoreData() {
        const { store, $route } = this
        if (!store) return false
        const q =  $route.query
        return (
            String(store.id) === $route.params.shop_id &&
            store.branch.code === q.branch_code &&
            store.floorRoom === q.floor_room &&
            String(store.number) === q.shop_number &&
            store.industryCode === q.industry_code
        )
    }

    protected async getStoreFromQuery() {

        let { store } = this
        const q =  this.$route.query
        const storeBranchCode = q.branch_code
        const storeFloorRoom = q.floor_room
        const storeNumber = q.shop_number
        const storeIndustryCode = q.industry_code

        let isStoreValid = false
        if (store) {
            isStoreValid = (
                store.branch.code === storeBranchCode &&
                store.floorRoom === storeFloorRoom &&
                String(store.number) === storeNumber &&
                store.industryCode === storeIndustryCode
            )
        }

        if (!isStoreValid) {
            const stores = await StoreServices.getActiveStoresByBPForReward()
            store = stores.find(s => (
                s.branch.code === storeBranchCode &&
                s.floorRoom === storeFloorRoom &&
                String(s.number) === storeNumber &&
                s.industryCode === storeIndustryCode
            )) || null

            await VuexServices.CustomerReward.store.set(store)
        }

        return store
    }
}
