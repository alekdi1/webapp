<template>
    <div class="feed-item" v-if="feed">
        <div class="feed-title">
            {{ feed.title }}
        </div>
        <div class="feed-description">{{ feed.desc }}</div>

        <div class="mt-2">
            <v-img class="rounded-xl" :aspect-ratio="20/9" :src="feed.image"/>
        </div>
        <div class="d-flex justify-start align-center mt-3">
            <v-btn text class="pa-0">
                <div class="mr-2">
                    <v-img :src="require('@/assets/images/icons/view-all-content.svg')" :width="12" :height="12"/>
                </div>
                <span class="label-view-more">{{ $t("see_more") }}</span>
            </v-btn>
        </div>
    </div>
</template>
<style lang="scss" scoped>

.feed-item {
    .feed-title {
        font-size: 16px;
        font-weight: bold;
        color: #ffffff;
    }

    .feed-description {
        font-size: 14px;
        color: #ffffff;
    }

    .label-view-more {
        font-size: 14px;
        color: #ffffff;
    }
}
</style>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator"
import { FeedModel } from "@/models"

@Component
export default class FeedItemView extends Vue {
    @Prop({ default: null }) private feed!: FeedModel.FeedItem|null

    private viewMoreClick() {
        const link = this.feed?.link
        if (link) {
            window.location.href = link
        }
    }
}
</script>
