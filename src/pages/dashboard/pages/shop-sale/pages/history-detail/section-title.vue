<template>
    <div class="section-title-container">
        <div class="title-text" v-html="title" />
        <div class="subtitle-text" v-html="subtitle" v-if="subtitle"/>
    </div>
</template>
<style lang="scss" scoped>
.section-title-container {
    border-left: 5px solid var(--v-primary-base);
    padding-left: 8px;
    min-height: 32px;
    .title-text {
        font-size: 15px;
        font-weight: bold;
        color: #000000;
    }

    .subtitle-text {
        font-size: 11px;
        font-weight: normal;
        color: #000000;
    }
}
</style>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
    name: "shop-sale-section-title",
    props: {
        title: {
            type: String,
            default: ""
        },
        subtitle: {
            type: String,
            default: ""
        }
    }
})
</script>
