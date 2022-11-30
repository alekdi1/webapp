import Vue from "vue"
import App from "@/App.vue"
import router from "@/router"
import store from "@/store"
import vuetify from "@/plugins/vuetify"
import "roboto-fontface/css/roboto/roboto-fontface.css"
import i18n from "@/plugins/i18n"
import "@/components/__register"
const VueInputMask = require("vue-inputmask").default
 
Vue.use(VueInputMask)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: createElement => createElement(App)
}).$mount("#app")
