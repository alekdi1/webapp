<template>
  <div class="public-page-content-container">
    <v-row style="height: 100%" class="ma-0 pa-0">
      <v-col class="left-col pa-0" xs="12" cols="12" md="3">
        <div class="header-logo">
          <v-img
            :src="require('@/assets/images/cpn-logo-new.png')"
            :width="80"
            cover
          />
        </div>
      </v-col>
      <v-col class="col-center" xs="12" cols="" md="6">
        <slot name="center-column"></slot>
      </v-col>
    </v-row>
    <v-footer
      color="primary-dark"
      class="cpn-public-footer"
      v-resize="onResize"
      padless
    >
      <div v-if="isDesktopSize" class="footer-row-default">
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
        <div class="footer-col col-line flex-shrink-1 px-3">
          <div class="contact-info d-flex">
            <div class="line-contact" v-if="false">
              <div style="width: 36px; height: 36px">
                <v-img
                  :src="require('@/assets/images/line-icon-circle.png')"
                  width="36"
                  height="36"
                />
              </div>
              <div class="line-name">Tenant Service</div>
            </div>
            <v-btn text :href="'tel:' + callCenterPhone">
              <div class="d-flex align-center">
                <fa-icon
                  name="phone-alt"
                  type="fas"
                  color="primary"
                  :size="28"
                />
                <div class="call-center-contact pl-3">
                  <div class="text-left">
                    {{ $t("footer.cpn_call_center") }} {{ callCenterPhone }}
                  </div>
                </div>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
      <div v-else class="footer-row-default">
        <div class="footer-col col-tnc flex-grow-1 align-center justify-center">
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
        <div class="footer-col footer-separator justify-center align-center">
          <v-divider color="white" vertical />
        </div>
        <div
          class="footer-col col-line flex-grow-1 align-center justify-center"
        >
          <div class="contact-info">
            <v-btn text :href="'tel:' + callCenterPhone">
              <div class="d-flex align-center justify-center">
                <fa-icon
                  name="phone-alt"
                  type="fas"
                  color="primary"
                  :size="28"
                />
                <div class="call-center-contact pl-3">
                  <div class="text-left">
                    <div class="cpn-text-caption">
                      Central Pattana Call Center
                    </div>
                    <div class="cpn-text-body-1">{{ callCenterPhone }}</div>
                  </div>
                </div>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
      <!-- <div class="copyright-row flex-shrink-1">
                <span class="copyright-text">{{ $t('footer.copyright') }}</span>
            </div> -->
    </v-footer>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { App } from "@/config";

@Component({
  name: "cpn-dsb-footer",
})
export default class FooterComponent extends Vue {
  private callCenterPhone = App.call_center_phone;
  private windowSize = { x: 0, y: 0 };

  private mounted() {
    this.onResize();
  }

  onResize() {
    this.windowSize = { x: window.innerWidth, y: window.innerHeight };
  }

  private get tncBtns() {
    return [
      {
        route: "",
        label: "Terms of Use",
        url: "/term-and-condition",
      },
      {
        route: "",
        label: "Privacy policy",
        url: App.agreement_url,
      },
    ];
  }

  private get isDesktopSize() {
    return this.windowSize.x > 960;
  }
}
</script>
<style lang="scss">
@import "../../../styles/vars.scss";

.public-page-content-container {
  height: 100vh;
  box-shadow: 0 0 8px #00000080;
  margin: 0 auto;
  width: 100%;
  max-width: $dashboard-width;
  overflow-x: hidden;
  position: relative;

  @media (min-width: $dashboard-width) {
    .cpn-public-footer {
      $ofs: calc((100% - #{$dashboard-width}) / 2) !important;
      left: $ofs;
    }
  }

  @media (min-width: 960px) {
    overflow-y: hidden;

    $w: calc((100% - #{$dashboard-left-col-width}) / 2) !important;
    .left-col {
      width: $w;
      max-width: $w;
      min-width: $w;
    }

    .footer-row-default {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    .col-center {
      width: $dashboard-left-col-width !important;
      max-width: $dashboard-left-col-width !important;
      border-left: 1px solid rgba(0, 0, 0, 0.12);
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      overflow-y: auto;
      max-height: 100%;
    }

    .header-logo {
      position: fixed;
      left: 20px;
      top: 20px;
    }

    .cpn-public-footer {
      height: $footer-height;
    }
  }

  .col-center {
    padding-bottom: $footer-height;
    min-height: 100%;
  }

  .header-logo {
    margin: 20px;
    position: relative;
  }

  .cpn-public-footer {
    width: 100%;
    max-width: $dashboard-width;
    position: fixed;
    bottom: 0;
    left: 0;

    .footer-row-default {
      height: $footer-height - 28px;
      width: 100%;
      max-width: $dashboard-width !important;
      display: flex;
      flex-direction: row;
      margin: auto;

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

          .tnc-link-btn {
            .btn-text {
              color: white;
              text-transform: capitalize;
            }
          }
        }
        .vl {
          height: 100%;
          width: 1px;
          background: white;
          margin-right: 2px;
          margin-left: 2px;
        }
      }
      padding-right: 32px;
      padding-left: 32px;
    }
    .col-copyright {
      flex-direction: row;
      justify-content: center;
      .copyright-text {
        color: white;
      }
    }
    .copyright-row {
      height: 28px;
      width: 100%;
      max-width: 100%;
      min-width: 100%;
      // border-top: 1px solid white;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-right: 32px;
      padding-left: 32px;

      .copyright-text {
        color: white;
      }
    }
  }

  .line-contact {
    display: flex;
    align-items: center;
    flex-direction: row;
  }

  @media (max-width: 960px) {
    .cpn-public-footer {
      height: $footer-height;
      .footer-row-default {
        padding: 0 10px;
      }
      .cpn-text-caption {
        font-size: 0.5rem !important;
      }
      .btn-text {
        font-size: 2vmin;
        color: white;
        text-transform: capitalize;
      }
      .tnc-link-btn {
        padding: 5px;
      }
    }
    .footer-separator {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  }
}
</style>
