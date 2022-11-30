<template>
    <div class="fs-loading">
        <div class="loading-overlay"></div>
        <div class="loading-content">
             <v-progress-circular indeterminate color="white" :size="64"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
@import "../styles/vars.scss";
.fs-loading {
    position: fixed;
    z-index: $footer-z-idx + 10;
    right: 0;
    top: 0;
    bottom: 0;
    left: 0;

    .loading-overlay {
        opacity: 0.46;
        background-color: rgb(33, 33, 33);
        border-color: rgb(33, 33, 33);

        border-radius: inherit;
        bottom: 0;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transition: inherit;
        width: 100%;
        will-change: opacity;
    }

    .loading-content {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>