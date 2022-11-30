<template>
    <fa-icon :size="size" :name="icon.name" :type="icon.type" :color="icon.color" />
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

@Component({
    name: "cpn-check-icon"
})
export default class CheckIcon extends Vue {
    @Prop({ default: false, type: Boolean }) private checked!: boolean
    @Prop({ default: 24, type: Number }) private size!: number

    private get icon() {
        return this.checked ?
        // checked icon
        {
            name: "check-circle",
            color: "primary",
            type: "fas"
        }
        :
        // uncheck icon
        {
            name: "circle",
            color: "secondary",
            type: "fas"
        }
    }
}
</script>
