<template>
  <div class="instruction d-flex" style="height: 100%; position: relative">
    
    <div class="instruction-content-container d-flex flex-column">
      <div
        class="instruction-title cpn-text-h5 font-weight-bold"
        style="align-self: flex-start"
      >
        {{ title }}
      </div>

      <div class="flex-grow-1 pt-3 d-flex justify-center align-center">
        <div class="d-flex flex-column align-center justify-center app-content">
          <div v-if="bankImg">
            <v-img
              class="bank-image"
              :width="32"
              :height="32"
              aspect-ratio="1"
              :src="bankImg"
            />
          </div>

          <div class="app-desc mt-4" v-html="descText" />

          <div class="note-text mt-2">{{ note }}</div>

          <div class="instruction-detail-container mt-2">
            หลังจากทำรายการชำระเงินเสร็จสมบูรณ์แล้ว กรุณากดปุ่มทำรายการต่อ เพื่อรับหลักฐานการชำระเงิน
          </div>

          <div class="instruction-detail-container font-weight-bold mt-2">ยอดชำระทั้งหมด {{ displayPrice }} บาท</div>
        </div>
      </div>
    </div>

    <div class="continue-btn-container py-4 d-flex flex-column  btn-container mx-5">
      <v-btn
        @click="goToPaymentResult"
        min-width="100%"
        rounded
        height="48"
        color="primary"
        class="continue-btn mb-3"
      >
        <span class="btn-text text-uppercase">ทำรายการต่อ</span>
      </v-btn>

      <v-btn
				class="mb-3"
				@click="backToHome"
				:disabled="loading"
				rounded
				color="primary"
				:height="48"
				block
			>
				<div class="btn-text text-uppercase">{{ $t("go_back_to_main") }}</div>
			</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import Base from "./instruction-base"
import { LanguageUtils, NumberUtils } from "@/utils"
import { Component } from "vue-property-decorator"
import { PaymentMethodServices } from "@/services"
import { ROUTER_NAMES } from "@/router"

@Component
export default class InstructionPushNoti extends Base {
  private get title() {
    return LanguageUtils.lang("ชำระผ่านเบอร์มือถือที่ลงทะเบียน Mobile Banking", "Register mobile phone via mobile banking");
  }

  private get note() {
    return "(รอข้อความแจ้งเตือนภายใน 15 นาที)"
  }

  private get bankImg() {
    return this.bank?.image || ""
  }

  private get descText() {
    const { pm } = this.$route.query

    if (pm === PaymentMethodServices.pushNotiKPlus().id) {
      return "กรุณาเปิด KPlus Application<br>เพื่อทำการชำระเงิน"
    }

    if (pm === PaymentMethodServices.pushNotiKMA().id) {
      return "กรุณาเปิด KMA Application<br>เพื่อทำการชำระเงิน"
    }
    return ""
  }

  private get totalAmount() {
    return Number(this.$route.query.total_amount || 0)
  }

  private get orderId() {
    return String(this.$route.query.order_id || "")
  }

  private get displayPrice() {
    return NumberUtils.getPriceFormat(this.totalAmount)
  }

  private goToPaymentResult() {
    this.$router.push({
      name: ROUTER_NAMES.payment_result,
      query: {
        order_id: this.orderId
      }
    })
  }
}
</script>
<style lang="scss" scoped>
@import "../../../../../styles/vars.scss";

.bank-image {
  border-radius: 8px !important;
}

.app-desc {
  font-size: 15px;
  text-align: center;
  color: #000000;
}

.note-text {
  font-size: 15px;
  text-align: center;
  color: #666666;
}

.instruction-detail-container {
  width: 350px;
  text-align: center;
}

.continue-btn {
  background: $color-primary !important;
}

</style>
