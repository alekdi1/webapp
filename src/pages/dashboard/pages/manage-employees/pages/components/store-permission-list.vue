<template>
    <div class="permission-store-list-container">
        <div class="store-label">{{ storeLabel }}</div>

        <div class="permission-store-list">
            <v-list two-line dense>
                <v-list-item class="store-item" v-for="(store, idx) in stores" :key="'store-' + idx">
                    <v-list-item-content>
                        <v-list-item-content class="store-name">{{ store.displayName }}</v-list-item-content>
                        <v-list-item-subtitle class="branch-name">{{ displayStoreBranchAndRoom(store) }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </div>
    </div>
</template>
<script lang="ts">
import { StoreModel } from "@/models"
import { StoreServices } from "@/services"
import { LanguageUtils } from "@/utils"
import { Component, Prop, Vue } from "vue-property-decorator"

@Component
export default class PermissionStoreList extends Vue {
    @Prop({ default: () => [] })
    private stores!: StoreModel.Store[]

    private get storeLabel() {
        return LanguageUtils.lang("ร้านค้าที่มีสิทธิ์", "Stores")
    }

    private displayStoreBranchAndRoom (s: StoreModel.Store) {
        const room = StoreServices.getStorefloorRoom(s)
        let text = s.branch.displayName

        if (room) {
            text += ` ${ LanguageUtils.lang("ห้อง", "Room") } ${ room }`
        }

        return text
    }
}
</script>
<style lang="scss" scoped>
.permission-store-list-container {

    .store-label {
        font-size: 12px;
        color: #010101;
    }

    .permission-store-list {
        max-height: 280px;
        overflow-y: auto;

        .store-item {
            padding-left: 0 !important;
            .store-name {
                font-size: 15px;
                font-weight: bold;
                color: #030303;
            }

            .branch-name {
                font-size: 15px;
                color: #000000;
            }
        }
    }
}
</style>