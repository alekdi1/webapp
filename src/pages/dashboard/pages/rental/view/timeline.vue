<template>
    <div class="rental-timeline-container">
        <div class="rental-timeline">
            <div class="timeline-item" v-for="(row, idx) in data" :key="'timeline-' + idx">
                <div class="timeline-status">
                    <div class="status-icon-container">
                        <fa-icon name="check-circle" type="fas" :size="20" color="primary" v-if="row.active" />
                        <fa-icon name="circle" type="far" :size="20" color="primary" v-else />
                    </div>
                    <div class="line" />
                </div>
                <div class="timeline-content">
                    <div class="timeline-title" v-html="row.title" />
                    <div class="timeline-detail" v-html="row.detail" />
                </div>
            </div>

        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { TimelineItem } from "../model"

@Component
export default class RentalTimelineView extends Vue {
    @Prop({ default: () => [] })
    private data!: TimelineItem[]
}
</script>
<style lang="scss">
.rental-timeline-container {
    .rental-timeline {
        .timeline-item {
            display: flex;
            flex-direction: row;
            min-height: 80px;
            .timeline-status {
                flex-shrink: 0;
                width: 32px;
                flex-direction: column;
                display: flex;
                align-items: center;

                .status-icon-container {
                    height: 20px;
                }

                .line {
                    border-left: 2px dotted var(--v-primary-base);
                    height: 100%;
                }
            }
            .timeline-content {
                padding-left: 24px;
                padding-right: 16px;
                flex-grow: 1;
                .timeline-title {
                    font-size: 15px;
                    color: #000000;
                    font-weight: bold;
                }

                .timeline-detail {
                    font-size: 15px;
                    font-weight: normal;
                    font-stretch: normal;
                    font-style: normal;
                    line-height: 1.2;
                    letter-spacing: 0.15px;
                    text-align: left;
                    color: #000000;
                }
            }

            &:last-child {
                min-height: initial;

                .timeline-status {
                    .line {
                        display: none !important;
                    }
                }
            }
        }
    }
}
</style>