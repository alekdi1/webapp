<template>
    <div class="emp-result">
        <div class="result-content ">
            <div class="d-flex flex-column align-center justify-center" style="height: 100%;">
                <fa-icon name="check-circle" type="fal" color="white" :size="80"/>

                <div class="status-text mt-5">SUCCESSFULLY</div>

                <div class="desc-text mt-5">
                    {{ successMessage }}
                </div>

                <div class="w100">
                    <v-btn @click="goBack" class="mt-5" block rounded color="primary" :height="48">
                        <span class="text-uppercase">{{ $t("go_back_to_main") }}</span>
                    </v-btn>
                </div>
            </div>
        </div>

        <div class="feed-content" v-if="feeds.length > 0">
            <cpn-dsb-feed-item :feed="f" v-for="(f, idx) in feeds" :key="'feed-' + idx"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
@import "../../../../../../styles/vars.scss";
.emp-result {
    $result-height: 420px;
    min-height: 100%;
    height: 100%;
    background: #0c0c0c;

    .result-content {
        padding-left: 56px;
        padding-right: 56px;
        height: $result-height;
    }

    .status-text {
        font-size: 30px;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
    }

    .desc-text {
        width: 350px;
        font-size: 18px;
        text-align: center;
        color: #ffffff;
    }

    .feed-content {
        width: 100%;
        min-height: calc(100% - #{$result-height});
        border-top-left-radius: 48px;
        border-top-right-radius: 48px;
        background: var(--v-primary-base);
        overflow-y: auto;
        padding-top: 56px;
        padding-right: 44px;
        padding-left: 44px;
        padding-bottom: $footer-height + 20px;
    }
}
</style>
<script lang="ts">
import { ROUTER_NAMES } from "@/router"
import { Component } from "vue-property-decorator"
import Base from "../manage-employees-base"
import { FeedModel } from "@/models"
import { LanguageUtils } from "@/utils"

@Component
export default class EmpResult extends Base {
    private goBack() {
        this.$router.replace({
            name: ROUTER_NAMES.manage_emp_list
        })
    }

    private get successMessage () {
        return LanguageUtils.lang("ตั้งสิทธิ์การใช้งานเรียบร้อยแล้วเราแจ้งยังผู้ใช้ใหม่ตามข้อมูลที่ระบุไว้เรียบร้อยแล้ว", "User account and permission have been created. Please check your email and Mobile phone for verification.")
    }

    private get feeds() {
        return [
            (() => {
                const f = new FeedModel.FeedItem()
                f.id = "test"
                f.title = "โปรโมชันสำหรับพนักงาน"
                f.desc = "ลดราคาอาหารใน Food park สำหรับพนักงานในตึก"
                f.image = "https://i.imgur.com/aX6Xcyk.png"

                return f
            })()
        ]
    }
}
</script>
