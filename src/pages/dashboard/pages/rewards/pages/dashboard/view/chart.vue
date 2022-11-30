<script lang="ts">
import { Component, Mixins, Prop, Watch } from "vue-property-decorator"
import { Line, mixins } from "vue-chartjs"

const colors = [
	"#f8bf32",
	"#7da580",
	"#5DADE2",
	"#E74C3C",
	"#A569BD",
	"#5D6D7E"
]

@Component({
	extends: Line,
	mixins: [mixins.reactiveProp]
})
export default class ChartComponent extends Mixins(mixins.reactiveProp, Line) {

	@Prop({ default: () => ([]) })
	private labels!: (string|number)[]

	@Prop({ default: () => ([]) })
	private datasets!: number[][]

	private pointIdx = -1

	mounted () {
		this.renderChartData()
	}

	@Watch("datasets")
	private onDataSetsChange() {
		console.log("datasets change", this.datasets)
		this.renderChartData()
	}

	private updateChart() {
		try {
			// @ts-ignore
			this._data._chart.update()
			console.log("Chart updated")
		} catch (e) {
			console.log("update chart error: " + e.message)
		}
	}

	private renderChartData() {
		const { labels, datasets } = this

		this.pointIdx = (datasets[0]?.length || 0) - 1

		/**
		 * Ref
		 * https://thewebdev.info/2020/08/18/chart-js%E2%80%8A-%E2%80%8Aaxis-labels-and-instance-methods/
		 */

		this.renderChart({
			labels,
			datasets: datasets
			.map((data, index) => ({
				hideInLegendAndTooltip: true,
				data,
				fill: false,
				borderColor: colors[index],
				pointBorderWidth: (({ dataIndex }) => {
					if (dataIndex !== this.pointIdx) {
						return 1
					}
					return 6
				}),
				pointStyle: "circle",
				pointHoverRadius: 6,
				
			}))
		},
		{
			legend: {
				display: false
			},
			scales: {
				xAxes: [
					{
						gridLines: {
							display: false
						},
						ticks: {
							fontColor: "#000000",
							fontFamily: "CPN",
							fontSize: 10
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							borderDash: [6],
							color: "#e1e1e1",
							circular: true,
							borderDashOffset: 4,
							lineWidth: 1,
							zeroLineBorderDash: [],
							drawBorder: false
						},
						ticks: {
							fontColor: "#000000",
							fontFamily: "CPN",
							fontSize: 9,
							beginAtZero: true
						}
					}
				]
			},
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: 1000,
				easing: "linear"
			},
			tooltips: {
				titleFontColor: "#FFFFFF",
				titleFontFamily: "CPN",
				titleFontSize: 12,
				bodyFontColor: "#FFFFFF",
				bodyFontFamily: "CPN",
				bodyFontSize: 10,
				custom: tooltip => {
					if (!tooltip) return
					tooltip.displayColors = false
					tooltip.xPadding = 12
				},
				callbacks: {
					// use label callback to return the desired label
					label: tooltipItem => tooltipItem.xLabel + ": " + tooltipItem.yLabel,
					// remove title
					title: () => ""
				}
			},
			onClick: (e, activeElements) => {

				if (Array.isArray(activeElements) && activeElements.length > 0) {
					const ae = activeElements[0]

					// @ts-ignore
					this.pointIdx = ae._index ?? -1

					this.updateChart()

					this.$emit("onDataIndexChange", this.pointIdx)
				}
			}
		})
	}

	private selectDataAtIndex(idx = 0) {
		this.pointIdx = idx
		this.updateChart()
	}
}
</script>
