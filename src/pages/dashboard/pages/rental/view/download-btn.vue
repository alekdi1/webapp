<template>
    <div class="download-btn-container">
        <v-btn @click="click" text :loading="loading" :disabled="disabled" height="auto">
            <div class="d-flex flex-column align-center">
                <div class="download-icon">
                    <v-img :src="icon" width="64"/>
                </div>

                <div class="btn-text" v-if="text">{{ text }}</div>
            </div>
        </v-btn>
        
    </div>
</template>
<style lang="scss" scoped>
.download-btn-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    button {
        padding-top: 16px !important;
        padding-bottom: 16px !important;

        .btn-text {
            font-size: 12px;
            color: #000000;
            margin-top: 8px;
        }
    }

}
</style>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
    props: {
        text: {
            type: String,
            default: ""
        },
        loading: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        icon(): string {
            return require("@/assets/images/icons/file-download.svg")
        }
    },
    methods: {
        click() {
            return this.$emit("click")
        }
    }
})
</script>