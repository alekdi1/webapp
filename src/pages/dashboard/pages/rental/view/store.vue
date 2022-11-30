<template>
  <div class="rental-store">
    <store-avatar :store="store" color="primary-dark" v-if="!isQuotation" />

    <cpn-name-avatar :name="store.cofName" color="primary-dark" v-else />

    <div class="store-name cpn-text-h6 text-primary font-weight-bold mt-3">
      {{ store.contractName || store.cofName }}
    </div>

    <div class="store-branch font-weight-bold cpn-text-subtitle-1">
      {{ store.branchName }}
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { RentalModel } from "@/models";
import StoreAvatarView from "./store-avatar.vue";

@Component({
  components: {
    "store-avatar": StoreAvatarView,
  },
})
export default class RentalStore extends Vue {
  @Prop({ default: () => new RentalModel.RentalDetail() })
  private store!: RentalModel.RentalDetail | RentalModel.Quotation;

  private get isQuotation() {
    return this.store instanceof RentalModel.Quotation;
  }
}
</script>
<style lang="scss" scoped>
.rental-store {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 8px 16px;
}
</style>
