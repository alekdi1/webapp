<template>
    <svg
        @click="$emit('click')"
        v-if="icon"
        aria-hidden="true" 
        focusable="false"
        :data-prefix="icon.prefix"
        :data-icon="icon.name"
        role="img"
        :style="svgCss"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="`0 0 ${ icon.viewBox.width } ${ icon.viewBox.height }`"
        class="svg-inline--cpn" :class="['cpn-' + icon.name]"
    >
        <path fill="currentColor" :d="icon.path" class="" v-if="icon.prefix !== 'fad'"></path>

        <g class="cpn-group" v-else>
            <path :class="[`cpn-${key}`]" v-for="(path, key) in icon.path" :key="key" fill="currentColor" :d="path" ></path>
        </g>
    </svg>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"
import { ColorUtils } from "@/utils"
import { IconTypePrefix } from "./model"
import ICONS from "./icons"

@Component({
    name: "fa-icon"
})
export default class FontawesomeIconComponent extends Vue {

    @Prop({ default: "" }) private name!: string
    @Prop({ default: "" }) private type!: IconTypePrefix
    @Prop({ default: 24 }) private size!: number
    @Prop({ default: "primary-dark" }) private color!: string

    private get icon() {
        try {
            const icon = ICONS[this.name]

            if (!icon) {
                throw new Error(`icon name '${this.name}' was not found`)
            }

            const path = icon.path[this.type]

            if (!path) {
                throw new Error(`icon name '${this.name}' type '${this.type}' was not found`)
            }

            return {
                name: icon.name,
                prefix: this.type,
                path,
                viewBox: icon.viewBox
            }
        } catch (e) {
            console.warn(e.message || e)
            return null
        }
    }

    private get cssDim() {
        return ({
            width: `${this.size}px`,
            "max-height": `${this.size}px`
        })
    }

    private get cssColor() {
        const { color } = this
        const theme = this.$vuetify.theme.currentTheme

        let shade = ""
        const splColor = color.split(" ").filter(c => c.trim() !== "")
        if (splColor.length > 1) {
            shade = splColor[1]
        }
        const colorName = splColor[0]

        const themeColor = theme[colorName]
        if (themeColor) {
            let c = ""
            if (shade) {
                c = `--v-${colorName}-${shade}`
            } else {
                c = `--v-${colorName}-base`
            }
            return {
                color: `var(${c})`
            }
        }

        if (ColorUtils.isColor(color)) {
            return {
                color
            }
        }

        return {}
    }

    private get svgCss() {
        return {
            ...this.cssDim,
            ...this.cssColor
        }
    }
}
</script>

<style lang="scss" scoped>

.svg-inline--cpn {
    .cpn-primary {
        opacity: 1;
    }

    .cpn-secondary {
        opacity: 0.4;
    }
}

</style>