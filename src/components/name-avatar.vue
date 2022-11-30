<template>
    <v-avatar :color="color" :size="size">
        <span class="text-white headline">{{ nameChar }}</span>
    </v-avatar>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"

@Component({
    name: "cpn-name-avatar"
})
export default class NameAvatar extends Vue {
    @Prop({ default: () => "" })
    private name!: string

    @Prop({ default: 56 })
    private size!: number

    @Prop({ default: "primary" })
    private color!: string

    private get nameChar() {
        return this.name.length > 0 ? this.name[0].toUpperCase() : ""
    }
}
</script>
