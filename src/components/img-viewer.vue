<template>
    <v-dialog v-model="dialog" content-class="cpn-image-viewer-dialog">
        <template v-if="dialog">
            <div v-if="loading" class="d-flex justify-center">
                <cpn-loading color="white"/>
            </div>
            <div v-else class="image-view-container">
                <div class="d-flex justify-center align-center" style="position: relative;">
                    <img @loadstart="onLoadStart" class="img-view" @load="onImageLoaded" v-if="url" :src="url" @error="onError" :style="{'max-height': (dimension.height - 200) + 'px'}"/>

                    <v-btn @click="closeDialog" fab color="primary" :size="64" id="close-image-viewer-btn" >
                        <v-icon color="white" :size="28">close</v-icon>
                    </v-btn>
                </div>
            </div>
        </template>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

const getWindow = () => ({
    width: window.innerWidth,
    height: window.innerHeight
})

@Component
export default class ImageViewer extends Vue {
    private dialog = false
    private loading = false
    private url = ""

    private dimension = getWindow()

    private onDimensionChange() {
        this.dimension = getWindow()
    }

    private closeDialog() {
        this.dialog = false
    }

    private mounted() {
        window.addEventListener("resize", this.onDimensionChange)
    }

    private beforeDestroy() {
        window.removeEventListener("resize", this.onDimensionChange)
    }

    public show(url = "") {
        this.dialog = true
        this.url = url
    }

    public setLoading(loading = false) {
        this.loading = loading
    }

    public setImage(url: string) {
        this.url = url
    }

    private onImageLoaded(e: Event) {
        console.log(e)
        this.loading = false
    }

    private onLoadStart() {
        this.loading = true
    }

    private onError(e: any) {
        console.log("error", e)
    }
}

</script>
<style lang="scss" >
.cpn-image-viewer-dialog {
    overflow-y: visible;
    border-radius: 16px !important;
    /* box-shadow: unset !important; */
    display: contents;
 
    .image-view-container {
        max-width: 90%;
        display: contents;
        max-height: 90vh;
    }

    img {
        max-width: 90%;
        max-height: 90vh;
        border-radius: 16px;
    }
    
    #close-image-viewer-btn {
        position: absolute;
        bottom: -24px;
        z-index: 10;
    }
}
</style>