<template>
    <div class="d-flex align-start cpn-note-text">
        <div class="icon-container">
            <fa-icon :size="20" name="info-circle" type="fal" color="#949191"/>
        </div>
        <span class="pl-2 note-text cpn-text-subtitle-2 font-weight-light">
            <slot />
        </span>
    </div>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
    name: "cpn-note-text"
})
</script>
<style lang="scss" scoped>
.note-text {
    color: var(--v-primary-dark-base);
}
.icon-container {
    width: 20px;
    height: 20px;
}
</style>