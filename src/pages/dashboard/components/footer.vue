<template>
  <v-footer color="primary-dark" padless class="cpn-dashboard-footer">
    <div class="footer-row" v-if="contentType === 'column'">
      <div class="footer-col menu-col">
        <slot name="column-left"></slot>
      </div>
      <div class="footer-col middle-col">
        <slot name="column-middle"></slot>
      </div>
      <div class="footer-col right-col">
        <slot name="column-right"></slot>
      </div>
    </div>
    <!-- default footer -->
    <template v-else>
      <div class="footer-row-default">
        <div class="footer-col col-tnc flex-grow-0">
          <div class="tnc-link-row">
            <template v-for="(btn, idx) in tncBtns">
              <v-btn
                text
                :key="'btn-' + idx"
                class="tnc-link-btn"
                :href="btn.url"
                target="_blank"
              >
                <span class="btn-text">{{ btn.label }}</span>
              </v-btn>
              <div
                class="py-2"
                v-if="idx < tncBtns.length - 1"
                :key="'btn-vl-' + idx"
              >
                <div class="vl" />
              </div>
            </template>
          </div>
        </div>
        <div class="footer-col col-copyright flex-grow-1">
          <div class="copyright-text">{{ $t("footer.copyright") }}</div>
        </div>
        <div class="footer-col col-line px-3">
          <template v-if="false">
            <v-img
              :src="require('@/assets/images/line-icon-circle.png')"
              width="24"
              height="24"
            />
            <div class="line-name">Tenant Service</div>
          </template>
        </div>
        <div class="footer-col col-call-center pl-3">
          <v-btn text :href="'tel:' + callCenterPhone">
            <div class="d-flex align-center">
              <fa-icon name="phone-alt" type="fas" color="primary" :size="20" />
              <div class="call-center-contact pl-3">
                <div class="text-left">
                  {{ $t("footer.cpn_call_center") }} {{ callCenterPhone }}
                </div>
                <div class="text-left"></div>
              </div>
            </div>
          </v-btn>
        </div>
      </div>
    </template>
    <!-- <div class="copyright-row flex-shrink-1">
            <span class="copyright-text">{{ $t('footer.copyright') }}</span>
        </div> -->
  </v-footer>
</template>
<script lang="ts">
// Ref: https://router.vuejs.org/guide/essentials/named-views.html#nested-named-views
import { Component, Prop, Vue } from "vue-property-decorator";
import { App as AppConfig } from "@/config";

type ContentType = "default" | "column";

@Component({
  name: "cpn-dsb-footer",
})
export default class FooterComponent extends Vue {
  @Prop({ default: (): ContentType => "default" })
  private contentType!: ContentType;

  private callCenterPhone = AppConfig.call_center_phone;

  private get tncBtns() {
    return [
      {
        route: "",
        label: "Terms of Use",
        url: "/help/term-and-condition",
        // url: AppConfig.policy_url
      },
      {
        route: "",
        label: "Privacy policy",
        url: AppConfig.agreement_url,
      },
    ];
  }
}
</script>
<style lang="scss">
@import "../../../styles/vars.scss";

$py: 12px;
$cpr-height: 28px;
$px: 32px;
.cpn-dashboard-footer {
  background: $color-primary-dark;
  height: $footer-height;
  position: absolute !important;
  bottom: 0;
  left: 0;
  right: 0;
  // z-index: $footer-z-idx;

  $row-height: $footer-height;
  .footer-row {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    height: $row-height;
    align-items: center;
    border-bottom: 1px solid white;
    .footer-col {
      &.menu-col {
        width: $dashboard-menu-width;
        padding-left: px;
      }

      &.middle-col {
        width: $dashboard-left-col-width;
      }

      &.right-col {
        width: $dashboard-right-col-width;
        padding-right: $px;
      }

      &:not(:last-child) {
        border-right: 1px solid white;
      }
      height: $row-height - ($py * 2);
    }
  }
  .footer-row-default {
    height: $footer-height - $cpr-height;
    width: 100%;
    display: flex;
    flex-direction: row;

    .footer-col {
      padding-top: 8px;
      padding-bottom: 8px;
      height: 100%;
      display: flex;
      align-items: center;

      .line-name {
        color: white !important;
        padding-left: 8px;
        font-weight: 300;
        font-size: 18px;
      }

      .call-center-contact {
        color: white;
        font-weight: 300;
        font-size: 14px;
        line-height: 16px;
        text-transform: capitalize;
      }
    }

    .col-tnc {
      flex-direction: row;
      justify-content: flex-start;

      .tnc-link-row {
        display: flex;
        flex-direction: row;

        .vl {
          height: 100%;
          width: 1px;
          background: white;
          margin-right: 2px;
          margin-left: 2px;
        }

        .tnc-link-btn {
          .btn-text {
            color: white;
            text-transform: capitalize;
          }
        }
      }
    }
    padding-right: $px;
    padding-left: $px;
  }
  .col-copyright {
    flex-direction: row;
    justify-content: center;
    .copyright-text {
      color: white;
    }
  }
  // .copyright-row {
  //     height: $cpr-height;
  //     width: 100%;
  //     max-width: 100%;
  //     min-width: 100%;
  //     // border-top: 1px solid white;
  //     display: flex;
  //     justify-content: center;
  //     align-items: center;
  //     padding-right: $px;
  //     padding-left: $px;

  //     .copyright-text {
  //         color: white;
  //     }
  // }
}
</style>
