<template>
  <cpn-instruction-atm-container>
      <v-expansion-panels flat v-model="model">
        <v-expansion-panel>
          <v-expansion-panel-header>
            <span class="cpn-text-subtitle-1 font-weight-bold">
              ชำระผ่าน Barcode
            </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <table style="width: 100%">
              <tr v-for="(s, i) in barcodeSteps" :key="i">
                <td style="width: 28px">{{ i + 1 }}.</td>
                <td>
                  <div class="py-2">{{ s }}</div>
                </td>
              </tr>
            </table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider class="my-6" />
      <cpn-note-text>หมายเหตุ: {{ note }}</cpn-note-text>
      <v-divider class="my-6" />
  </cpn-instruction-atm-container>
</template>
<script lang="ts">
/* eslint-disable */
import { BankServices } from "@/services";
import { Component } from "vue-property-decorator";
import Base from "./bank-base";

@Component
export default class InstructionAtmKBank extends Base {
  private bank = BankServices.Banks.KBANK();
  private model = 0;

  private get barcodeSteps() {
    return [
      "ดาวน์โหลด Bill payment",
      "ทำธุรกรรมผ่านตู้ ATM",
      "เลือก “Barcode Payment”",
      "นำแถบบาร์โค้ดบนใบแจ้งหนี้ ไปวาง ณ จุดอ่านบาร์โค้ด โดยให้แสงสีแดง",
      "ตรวจสอบข้อมูลและเลือก “ยืนยันการทำรายการ (Invoice No. (Ref1) หมายเลขใบแจ้งค่าบริการ และ Customer ID. (Ref2) หมายเลขอ้างอิงชำระเงิน",
      "เลือก “พิมพ์” หากท่านต้องการใบบันทึกรายการ",
      "หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว ท่านสามารถดูรายการได้ที่ประวัติชำระเงิน",
    ];
  }

  private get cmpSteps() {
    return [
      `ดาวน์โหลด Bill payment`,
      `ทำธุรกรรมผ่านตู้ ATM`,
      `เลือก "บริการอื่นๆ"`,
      `เลือก "จ่ายบิล/ชำระเงิน"`,
      `เลือกกด "อื่นๆ/ระบุรหัสบริษัท Other/Specify Company ID"`,
      `เลือก"ออมทรัพย์"`,
      `ระบุ รหัสบริษัท “33730”`,
      `เลือก บัญชีธนาคาร เช่น ออมทรัพย์`,
      `ในช่อง “Invoice No. (Ref1)” หมายเลขใบแจ้งค่าบริการ`,
      `ในช่อง “ Customer ID. (Ref2 )”หมายเลขอ้างอิงชำระเงิน`,
      `ใส่จำนวนเงินและทำรายการให้สำเร็จ`,
    ];
  }

  private get note() {
    return `ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 3-5 วันทำการ`;
  }

  private get icon() {
    return require("@/assets/images/banks/kasikorn.jpg");
  }
}
</script>
<style lang="scss" scoped>
.instruction {
  padding-bottom: 60px;
  overflow-y: auto;
}
</style>