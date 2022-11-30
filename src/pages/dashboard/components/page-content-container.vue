<template>
  <div class="page-content-container">
    <div
      class="page-content-column column-left"
      ref="column-left"
      @scroll="onLeftColScroll"
    >
      <slot name="column-left"></slot>
    </div>
    <div class="page-content-column column-right">
      <v-toolbar flat class="right-toolbar">
        <v-spacer></v-spacer>

        <div class="lang-switcher-container">
          <template v-for="(lang, idx) in langs">
            <div
              class="lang-btn-container"
              :key="lang.value"
              :data-lang="lang.value"
              :class="{ active: lang.active }"
            >
              <v-btn text @click="setLang(lang.value)">
                <span class="lang-label">{{ lang.label }}</span>
              </v-btn>
            </div>
            <div class="vl" v-if="idx < langs.length - 1" :key="'vl' + idx" />
          </template>
        </div>

        <!-- notification -->
        <v-badge
          bordered
          top
          color="#ea4b60"
          dot
          offset-x="22"
          offset-y="22"
          v-model="alertNoti"
        >
          <v-btn icon @click="notoClick()">
            <fa-icon name="bell" type="fal" :size="24" />
          </v-btn>
        </v-badge>

        <v-btn icon @click="logout">
          <fa-icon name="power-off" type="fal" :size="24" />
        </v-btn>
      </v-toolbar>
      <slot name="column-right"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { LANGUAGES } from "@/lang";
import { LanguageUtils } from "@/utils";
import { AuthService } from "@/services";
import { ROUTER_NAMES } from "@/router";
import { VuexServices } from "@/services";
import { PostModel } from "@/models";

@Component({
  name: "cpn-page-container",
})
export default class PageContentContainerComponent extends Vue {
  @VuexServices.Root.VXNotifications()
  private notifications!: PostModel.Notification[];

  private notificationCount = 1;

  private get langs() {
    const cl = this.$i18n.locale;
    return [
      {
        label: "TH",
        value: LANGUAGES.TH,
        active: cl === LANGUAGES.TH,
      },
      {
        label: "EN",
        value: LANGUAGES.EN,
        active: cl === LANGUAGES.EN,
      },
    ];
  }

  private onLeftColScroll() {
    try {
      // @ts-ignore
      const div: HTMLDivElement = this.$refs["column-left"];
      //   console.log(div.offsetHeight + div.scrollTop);
      //   console.log(div.scrollHeight);
      //   console.log(div.scrollTop);
      //   console.log(div.scrollHeight - div.clientHeight - 100);
      if (div.scrollTop >= div.scrollHeight - div.clientHeight - 100) {
        this.$emit("onLeftColumnScrollEnd");
      }
    } catch (e) {
      //
    }
  }

  private get alertNoti() {
    return this.notifications.some((n) => !n.isRead);
  }

  private notoClick() {
    if (this.$route.name === ROUTER_NAMES.dashboard_notification) {
      return;
    }

    this.$router.push({
      name: ROUTER_NAMES.dashboard_notification,
    });
  }

  private setLang(lang: string) {
    LanguageUtils.setLang(lang);
  }

  private async logout() {
    AuthService.logout();
    return this.$router.replace({ name: ROUTER_NAMES.login });
  }
}
</script>
<style lang="scss" >
@import "../../../styles/vars.scss";
.page-content-container {
  width: 100%;
  display: flex;
  flex-direction: row;

  .page-content-column {
    height: 100vh;
    position: relative;
    overflow-y: auto;
    padding-bottom: $footer-height;

    &.column-left {
      width: $dashboard-left-col-width;
      max-width: $dashboard-left-col-width;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }

    &.column-right {
      width: $dashboard-right-col-width;
      max-width: $dashboard-right-col-width;
      padding-top: 64px;
    }
  }

  .right-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    .v-toolbar__content {
      padding-right: 24px;
      padding-left: 24px;
    }

    .lang-switcher-container {
      flex-direction: row;
      display: flex;

      .lang-btn-container {
        button {
          padding-left: 4px;
          padding-right: 4px;
          min-width: 40px;

          .lang-label {
            font-size: 16px;
            color: $color-primary-dark;
          }
          margin-right: 4px;
          margin-left: 4px;
        }

        &.active {
          .lang-label {
            color: $color-primary;
          }
        }
      }
      .vl {
        width: 2px;
        background: $color-primary-dark;
        margin-top: 6px;
        margin-bottom: 6px;
      }
    }
  }
}
</style>