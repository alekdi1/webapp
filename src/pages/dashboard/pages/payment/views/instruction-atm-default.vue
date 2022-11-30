<template>
    <cpn-instruction-atm-container>
        <table style="width: 100%;">
            <tr v-for="(s, i) in steps" :key="i">
                <td style="width: 28px;">{{ i+1 }}.</td>
                <td>
                    <div class="py-2">{{ s }}</div>
                </td>
            </tr>
        </table>

        <div class="note my-3">หมายเหตุ: {{ note }}</div>
    </cpn-instruction-atm-container>
</template>
<script lang="ts">
/* eslint-disable */
import { Component } from "vue-property-decorator"
import Base from "./bank-base"

@Component
export default class InstructionAtmDefault extends Base {
    private model = 0

    private get steps() {
        return [
            `ดาวน์โหลด Bill payment`,
            `ทำธุรกรรมผ่านตู้ ATM`,
            `เลือก "ชำระเงิน/บริการ"`,
            `เลือก “ชำระด้วยบาร์โค้ด”`,
            `นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง`,
            `ตรวจสอบข้อมูลและเลือก “ยืนยันการท ารายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2 )หมายเลขอ้างอิงชำระเงิน`,
            `เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ`
        ]
    }

    private get note() {
        return `ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 24 ชม.`
    }
}
</script>
<style lang="scss" scoped>
 
.instruction {
    padding-bottom: 60px;
    overflow-y: auto;
}
</style>