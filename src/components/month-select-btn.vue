<template>
    <v-card flat class="month-select-btn" :class="{ selected }" @click="click">
        <div class="d-flex align-center">
            <div class="check-icon-container" >
                <fa-icon name="check" color="white" type="far" :size="20" v-if="selected"/>
            </div>

            <div class="month-label">{{ displayMonth }}</div>
        </div>
    </v-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import moment from "moment"

@Component
export default class MonthSelectButton extends Vue {
    @Prop({ default: true })
    private selected!: boolean

    @Prop({ default: new Date() })
    private date!: Date

    private get displayMonth() {
        return moment(this.date).locale(this.$i18n.locale).format("MMM")
    }

    private click() {
        this.$emit("click")
    }
}
</script>
<style lang="scss" scoped>
.month-select-btn {
    &::before {
        background: transparent !important;
    }

    display: inline-flex;
    border-radius: 10px !important;
    background: #e1e1e1;
    padding: 8px;

    .month-label {
        padding-left: 12px;
        padding-right: 12px;
        font-weight: 600;
        font-size: 16px;
        color: #ffffff;
    }

    .check-icon-container {
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ffffff;
    }

    &.selected {
        .check-icon-container {
            background: rgb(194, 171, 120);
        }

        background: #b39656;
    }
}
</style>