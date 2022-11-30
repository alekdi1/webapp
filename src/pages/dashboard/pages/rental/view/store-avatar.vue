<template>
    <v-avatar class="rental-store-avatar" :color="color" :size="size">
        <span class="store-avatar-name headline">{{ char }}</span>
    </v-avatar>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { RentalModel } from "@/models"

@Component
export default class RentalStoreAvatar extends Vue {
    @Prop({ default: () => new RentalModel.RentalDetail() })
    private store!: RentalModel.RentalDetail

    @Prop({ default: "primary" })
    private color!: string

    @Prop({ default: 56 })
    private size!: number

    private get char() {
        return String(this.store.contractName[0] || "").toUpperCase()
    }
}

</script>
<style lang="scss" scoped>
.rental-store-avatar {
    display: flex;
    justify-content: center;
    align-items: center;

    .store-avatar-name {
        color: #fff;
    }
}
</style>
