<template>
    <div class="rental-data">

        <table class="rental-data-table">
            <!-- ------------- Group, Contract No, Type -------------- -->
            <tr v-for="(row, idx) in datas1" :key="idx + '-' + randomString()">
                <td class="column-label">
                    <div class="data-label" v-html="row.label" />
                </td>
                <td class="column-data">
                    <div class="data-value" v-html="row.value" />
                </td>
            </tr>

            <!-- ------------- Floor ------------- -->
            <tr>
                <td class="column-label">
                    <div class="data-label" v-html="text.room_no" />
                </td>
                <td class="column-data">
                    <v-expansion-panels v-if="rooms.length > 0" v-model="panel" flat class="rooms-expansion">
                        <v-expansion-panel>
 
                            <v-expansion-panel-header >
                                <div>
                                    <div class="room-floor">
                                        {{ floorText }} {{ rooms[0].floor }}
                                    </div>
                                </div>
                            </v-expansion-panel-header>

                            <v-expansion-panel-content>
                                <template v-for="(r, idx) in rooms">
                                    <div class="floor"  :key="'floor-' + idx">
                                        <div class="room-floor" v-if="idx > 0">ชั้น {{ r.floor }}</div>
                                        <div class="rooms">{{ r.rooms }}</div>
                                    </div>
                                </template>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </td>
            </tr>

            <!-- ------------------ Date range ------------------ -->
            <tr>
                <td class="column-label">
                    <div class="data-label" v-html="text.label_start_end_date" />
                </td>
                <td class="column-data">
                    <div class="data-value" v-html="startEndDate" />
                    <div class="status-badge expire-soon" v-if="isExpiring">
                        {{ displayDate }}
                    </div>
                    <div class="status-badge expired" v-if="isExpired">
                        {{ displayExpiredText }}
                    </div>
                </td>
            </tr>

            <!-- ------------------ Price, Address ------------------ -->
            <tr v-for="(row, idx) in datas2" :key="idx + '-' + randomString()">
                <td class="column-label">
                    <div class="data-label" v-html="row.label" />
                </td>
                <td class="column-data">
                    <div class="data-value" v-html="row.value" />
                </td>
            </tr>
        </table>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator"
import { LanguageUtils, TimeUtils } from "@/utils"
import { RentalServices } from "@/services"
import { RentalModel } from "@/models"
import moment from "moment"

interface ViewData {
    label: string
    value: any
}

@Component
export default class RentalData extends Vue {
    @Prop({ default: () => new RentalModel.RentalDetail() })
    private data!: RentalModel.RentalDetail

    @Prop({ default: "" })
    private status!: string

    private panel = 0

    private get datas1(): ViewData[]  {
        const { lang } = LanguageUtils
        return [
            {
                label: lang("กลุ่ม", "Group"),
                value: this.data.industryName|| "-"
            },
            {
                label: lang("เลขที่สัญญา", "Contract number"),
                value: this.data.contractNumber|| "-"
            },
            {
                label: lang("ประเภทสัญญา", "Contract type"),
                value: this.data.contractTypeName|| "-"
            }
        ]
    }

    private randomString() {
        return Math.random().toString(36).replace("0.", "")
    }

    private get text() {
        const { lang } = LanguageUtils
        return {
            label_start_end_date: lang("วันเริ่มและสิ้นสุด", "Start date and end date"),
            room_no: lang("หมายเลขห้อง", "Room no")
        }
    }

    private get startEndDate() {
        const start = TimeUtils.convertToLocalDateFormat(moment(this.data.start))
        const end = TimeUtils.convertToLocalDateFormat(moment(this.data.end))
        return `${start} - ${end}`
    }

    private get datas2(): ViewData[] {
        const { lang } = LanguageUtils
        const datas: ViewData[] = []

        if (this.data.pricePerMonth) {
            datas.push({
                label: lang("ราคาค่าเช่า", "Rental price"),
                value: this.data.pricePerMonth
            })
        }

        if (this.data.pricePerSqm) {
            datas.push({
                label: lang("ราคาต่อตร.ม.", "Price per sq m."),
                value: this.data.pricePerSqm
            })
        }

        datas.push({
            label: lang("ที่อยู่ลูกค้า(ทำสัญญา)", "Customer address (contract)"),
            value: this.data.contractAddress || "-"
        })

        return datas
    }

    private get isExpired () {
        const status = RentalServices.RENTAL_STATUS
        return [status.expired, status.refund].includes(this.status)
    }

    private get isExpiring () {
        return [RentalServices.RENTAL_STATUS.expiring].includes(this.status || this.data.info.type)
    }

    private get displayExpiredText () {
        const { lang } = LanguageUtils
        return this.status === RentalServices.RENTAL_STATUS.expired ? lang("สัญญาเช่าหมดอายุแล้ว", "The contract has expired") : lang("หมดสัญญา", "Out of contract")
    }

    private get displayDate () {
        const dateToday = moment().format("YYYY-MM-DD")
        const dateEnd = moment(this.data.info.dateTime, "YYYY-MM-DD")
        const subtractedDate = dateEnd.diff(dateToday, "day", true) + 1
        return LanguageUtils.lang(`จะหมดสัญญาในอีก ${subtractedDate} วัน`, `${subtractedDate} days remaining`)
    }

    /**
     * Split between floor by `;`
     * Split floor and room by `_`
     * Split between room by `,`
     */
    private get rooms() {
        const floors = this.data.floorRoom.split(";")

        const floorGroup: Floor[] = []

        for (const floor of floors) {
            const f = new Floor()
            const floorAndRooms = floor.split("_")
            f.floor = floorAndRooms[0]
            f.rooms = floorAndRooms[1]
            floorGroup.push(f)
        }

        return floorGroup
    }

    private get floorText () {
        return LanguageUtils.lang("ชั้น", "Floor")
    }
}
class Floor {
    floor = ""
    rooms = ""
}
</script>
<style lang="scss" >
.rental-data {
    table.rental-data-table {
        width: 100%;
        tr {
            td {
                vertical-align: top;
                &.column-label {
                    width: 40%;
                    .data-label {
                        font-size: 15px;
                        font-weight: bold;
                        color: #000000;
                    }
                }

                &.column-data {
                    .data-value {
                        font-size: 15px;
                        color: #000000;
                    }
                }

                padding-top: 8px;
                padding-bottom: 8px;

                .status-badge {
                    padding: 4px 8px;
                    color: white;
                    display: inline-block;
                    font-size: 12px;
                    &.expire-soon {
                        background: #d95765;
                    }
                    &.expired {
                        background: #acacac;
                    }
                }

                .rooms-expansion {
                    z-index: 0 !important;

                    .v-expansion-panel-header {
                        padding-top: 0;
                        padding-bottom: 0;
                        min-height: unset !important;
                        padding-left: 0  !important;
                        padding-right: 0  !important;
                    }

                    .v-expansion-panel-content__wrap {
                        padding-left: 0  !important;
                        padding-right: 0  !important;
                    }

                    .room-floor {
                        display: inline-block !important;
                        background: #ebebeb;
                        padding: 4px 8px;
                        font-size: 15px;
                        color: #000000;
                        align-items: center;
                        line-height: initial !important;
                    }

                    .rooms {
                        margin-top: 8px;
                        margin-bottom: 16px;
                    }
                }
            }
        }
    }
}
</style>
