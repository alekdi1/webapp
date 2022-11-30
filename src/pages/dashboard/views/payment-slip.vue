<template>
  <div class="payment-slip" ref="slip" style="background: white">
    <div class="d-flex flex-column justify-center align-center">
      <div class="d-flex justify-center align-center mt-10 mb-5">
        <div class="company-text-container">
          <div class="font-logo-top font-weight-black bold navy-text">
            SERVE
          </div>
          <div class="d-flex">
            <div class="font-logo-bottom font-weight-black">CENTRAL</div>
            <div class="font-logo-bottom font-weight-black gold-text">
              PATTANA
            </div>
          </div>
        </div>
      </div>

      <div
        style="width: 100%; text-align: center"
        class="text-primary cpn-text-h5 w-100 mt-3 mb-7"
      >
        {{ text.payment_success }}
      </div>
    </div>

    <div class="slip-data-table">
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.company_name }}
        </div>
        <span class="d-flex justify-end ml-auto set-text-right">
          {{ data.companyName }}
        </span>
      </div>
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.transaction_no }}
        </div>
        <span class="d-flex justify-end ml-auto set-text-right">
          {{ data.paymentId }}
        </span>
      </div>
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.tax_no }}
        </div>
        <span class="d-flex justify-end ml-auto set-text-right">
          {{ data.orderId }}
        </span>
      </div>
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.total_payment }}
        </div>
        <span
          class="
            d-flex
            justify-end
            total-price-text
            ml-auto
            font-weight-bold
            set-text-right
          "
        >
          {{ data.displayTotalAmount }} {{ text.baht }}
        </span>
      </div>
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.vat }}
        </div>
        <span class="d-flex justify-end ml-auto set-text-right">
          {{ data.displayVat }} {{ text.baht }}
        </span>
      </div>
      <div class="d-flex flex-row my-4 cpn-content-default">
        <div class="set-text-left">
          {{ text.payment_date }}
        </div>
        <span class="d-flex justify-end ml-auto set-text-right">
          {{ data.displayPaymentDate }}
        </span>
      </div>
      <div class="note-container mt-10 mb-4">
        <cpn-note-text class="text-left"
          >หมายเหตุ : ค่าธรรมเนียมขึ้นอยู่กับธนาคาร และหลังจากมีการชำระเงิน ระบบ
          Central Pattana Serve จะมีการอัพเดตข้อมูลการชำระเงินภายใน 24
          ชม.</cpn-note-text
        >
      </div>
      <v-divider />
      <div class="d-flex flex-row my-4 cpn-content-default">
        {{ text.memo }} : {{ data.note }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { PaymentSlip } from "@/pages/dashboard/models";
import { DialogUtils, LanguageUtils } from "@/utils";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

@Component
export default class PaymentSlipView extends Vue {
  @Prop({ default: () => new PaymentSlip() })
  private data!: PaymentSlip;

  public async download() {
    try {
      const isFileSaverSupported = !!new Blob();
      console.log(isFileSaverSupported);
      // @ts-ignore
      const paymenrResultEl: HTMLDivElement = this.$refs.slip;
      console.log(this.$refs.slip);
      const { clientWidth: width, clientHeight: height } = paymenrResultEl;
      console.log(width);
      console.log(height);
      const blob = await htmlToImage.toBlob(paymenrResultEl, {
        height,
        width,
        pixelRatio: 1,
      });
      // const blob = await htmlToImage.toBlob(paymenrResultEl, {
      //   height: 777,
      //   width: 509,
      //   pixelRatio: 1,
      // });

      if (!blob) {
        throw new Error("Error while convert file");
      }

      const filename = `slip-${this.data.orderId}.png`;
      saveAs(blob, filename);
    } catch (e) {
      DialogUtils.showErrorDialog({
        text: e.message || "Download error",
      });
    }
  }

  private get text() {
    return {
      step_finish: this.$t("pages.payment.step_finish").toString(),
      payment_success: this.$t("pages.payment.payment_success").toString(),
      company_name: this.$t("pages.payment.company_name").toString(),
      transaction_no: this.$t("transaction_no").toString(),
      tax_no: LanguageUtils.lang("หมายเลขอ้างอิง", "Reference id"),
      total_payment: this.$t("total_payment").toString(),
      vat: this.$t("vat").toString(),
      baht: this.$t("baht").toString(),
      memo: this.$t("pages.payment.memo").toString(),
      payment_date: this.$t("pages.payment.payment_date").toString(),
      download_slip: this.$t("pages.payment.download_slip").toString(),
      back_to_main: this.$t("pages.payment.back_to_main").toString(),
    };
  }
}
</script>

<style lang="scss" scoped>
.payment-slip {
  padding-top: 40px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 40px;
  .total-price-text {
    font-weight: 500;
  }

  .note-text {
    opacity: 0.8 !important;
  }
}

.gold-text {
  color: var(--v-primary-base);
}

.navy-text {
  color: #05135d;
}

.bold {
  font-weight: bold;
}

.font-logo-top {
  font-size: 6rem !important;
  font-family: "CPN", sans-serif !important;
  letter-spacing: -0.015625em !important;
  line-height: 0.8;
}

.font-logo-bottom {
  font-size: 32px !important;
  font-family: "CPN", sans-serif !important;
  letter-spacing: 0.0073529412em !important;
}

.set-text-right {
  width: 100%;
  text-align: right;
}
.set-text-left {
  width: 60%;
  text-align: left;
}
</style>