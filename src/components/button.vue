<template>
    <v-btn
        class="cpn-btn"
        rounded
        :color="color"
        :block="block"
        :loading="loading"
        :height="height"
        :disabled="disabled"
    >
        <slot></slot>
    </v-btn>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

@Component({
    name: "cpn-button"
})
export default class CPNButton extends Vue {
    @Prop({ default: false })
    private disabled!: boolean

    @Prop({ default: false })
    private loading!: boolean

    @Prop({ default: false })
    private block!: boolean

    @Prop({ default: "primary" })
    private color!: string

    @Prop({ default: 46 })
    private height!: number
}
</script>