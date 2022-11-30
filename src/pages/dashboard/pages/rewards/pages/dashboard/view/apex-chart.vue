<template>
    <div class="apex-chart-custom-container" ref="chartContainer">
        <apexchart ref="apexchart" type="line" :height="CHART_HEIGHT" :options="chartOptions" :series="series"></apexchart>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator"
import VueApexCharts from "vue-apexcharts"
import { ApexOptions } from "apexcharts"
import { ChartDataset } from "../model"

Vue.use(VueApexCharts)
Vue.component("apexchart", VueApexCharts)

const colors = [
	"#f8bf32",
	"#7da580",
	"#5DADE2",
	"#E74C3C",
	"#A569BD",
	"#5D6D7E"
]


@Component
export default class CPNCustomApexChart extends Vue {

    @Prop({ default: () => [] })
    private datasets!: ChartDataset[]

    @Prop({ default: () => ([]) })
	private labels!: (string|number)[]

    private id = Math.random().toString(36).replace("0.", "")

    private currentIndex = -1

    private CHART_HEIGHT = 240

    @Watch("datasets")
	private onDataSetsChange() {
		console.log("datasets change", this.datasets)
        this.setIndexFromDataSet()
	}

    private setIndexFromDataSet() {
        this.currentIndex = (this.datasets[0]?.data.length || 0) - 1
    }

    private selectDataAtIndex(idx: number) {
        this.currentIndex = idx
        this.$emit("onDataIndexChange", idx)
    }

    private reload() {
        try {
            const apexchart = this.$refs["apexchart"] as Vue
            // console.log(apexchart)
            // @ts-ignore
            apexchart.refresh()
        } catch (e) {
            console.log(e.message)
        }
    }

    private get chartOptions(): ApexOptions {
        const { currentIndex, datasets, labels } = this
        const MARKER_SIZE = 6
        const FONT_FAMILY = "CPN"

        interface ChartEventOptions {
            dataPointIndex: number
            selectedDataPoints: number[][]
            seriesIndex: number
        }

        return {
            colors,
            chart: {
                id: "chart_" + this.id,
                height: this.CHART_HEIGHT,
                type: "line",
                animations: {
                    enabled: true,
                    easing: "linear",
                    dynamicAnimation: {
                        speed: 1000
                    }
                },
                toolbar: {
                    show: true,
                    tools: {
                        download: false,
                        reset: true
                    }
                },
                zoom: {
                    type: "xy",
                    enabled: true,
                    autoScaleYaxis: true,
                },
                events: {
                    // eslint-disable-next-line
                    dataPointSelection: (e: Event, chartContext, options: ChartEventOptions) => {
                        this.selectDataAtIndex(options.dataPointIndex)
                    },

                    // eslint-disable-next-line
                    updated: (chartContext, options: ChartEventOptions) => {

                        const apexchart = this.$refs["apexchart"] as Vue
                        const div = apexchart.$el as HTMLDivElement

                        const xaxisG = div.querySelector("g.apexcharts-xaxis-texts-g") as SVGGElement|null
                        const texts = xaxisG?.querySelectorAll("text")

                        texts?.forEach((textElement) => {
                            textElement.addEventListener("click", () => {
                                const tspan = textElement.querySelector("tspan")
                                const text = tspan?.textContent
                                const dataIndex = labels.findIndex(l => l === text)
                                console.log(text, dataIndex)
                                this.selectDataAtIndex(dataIndex)
                            })
                        })
                    }
                },
                
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                width: 3
            },
            markers: {
                size: MARKER_SIZE,
                hover: {
                    sizeOffset: 1
                },
                strokeWidth: 0,
                discrete: [
                    ...datasets.map((s, seriesIndex) => s.data.map((_, dataPointIndex) => ({
                        seriesIndex,
                        dataPointIndex,
                        size: currentIndex === dataPointIndex ? MARKER_SIZE : 2,
                        fillColor: colors[seriesIndex],
                    })))
                    .flat()
                ]
            },
            xaxis: {
                categories: this.labels,
                labels: {
                    style: {
                        fontFamily: FONT_FAMILY
                    }
                }
            },
            yaxis: {
                forceNiceScale: !false,
                labels: {
                    style: {
                        fontFamily: FONT_FAMILY
                    }
                }
            },
            legend: {
                show: false
            },
            grid: {
                strokeDashArray: 4
            },
            tooltip: {
                enabled: true,
                marker: {
                    show: true,
                },
                followCursor: false,
                shared: false,
                intersect: true,
                style: {
                    fontFamily: FONT_FAMILY,
                }
            }
        }
    }

    private get series() {
        return this.datasets.map((d, idx) => ({
            name: d.displayLabel || "serie-" + (idx + 1),
            data: d.data
        }))
    }

    private mounted() {
        this.setIndexFromDataSet()
    }
}
</script>

<style lang="scss">
.apex-chart-custom-container {
    .apexcharts-xaxis-texts-g {
        text {
            &:hover {
                cursor: pointer;
            }
        }
    }
}
</style>