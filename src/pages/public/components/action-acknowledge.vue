<template>
    <div class="public-action-acknowledge-view">
        <div class="status-content-container d-flex flex-column align-center">
            <div class="icon-container">
                <fa-icon name="check-circle" type="fal" :size="64" color="white"/>
            </div>

            <slot name="title">
                <div class="status-title">{{ title }}</div>
            </slot>

            <slot name="content">
                <div class="status-content">{{ content }}</div>
            </slot>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

@Component
export default class ActionAcknowledge extends Vue {
    @Prop({ default: "success" }) private status!: string
    @Prop({ default: "" }) private title!: string
    @Prop({ default: "" }) private content!: string

    private isLoading = false
}

</script>
<style lang="scss">
.public-action-acknowledge-view {
    background: #0c0c0c;
    width: 100%;
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;

    .status-content-container {
        padding-top: 80px;
        padding-bottom: 24px;
        padding-left: 24px;
        padding-right: 24px;
        flex: 1;
        width: 100%;

        .status-content {
            font-size: 16px;
            color: #ffffff;
        }

        .icon-container {
            margin-bottom: 20px;
        }

        .status-title {
            font-size: 20px;
            color: #ffffff;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
    }
}
</style>