import Vue from "vue"

import FontawesomeIconComponent from "./fontawesome-icon/fontawesome-icon.vue"
import Button from "./button.vue"
import CheckIcon from "./check-icon.vue"
import NoteText from "./note-text.vue"
import Loading from "./loading.vue"
import FullScreenLoading from "./full-screen-loading.vue"
import UserAvatar from "./user-avatar.vue"
import NameAvatar from "./name-avatar.vue"
import ImgViewer from "./img-viewer.vue"
// @ts-ignore
import VueBarcode from "vue-barcode"
// @ts-ignore
import OtpInput from "@bachdgvn/vue-otp-input"

Vue.component("fa-icon", FontawesomeIconComponent)
Vue.component("cpn-btn", Button)
Vue.component("cpn-check-icon", CheckIcon)
Vue.component("cpn-note-text", NoteText)
Vue.component("cpn-loading", Loading)
Vue.component("cpn-fs-loading", FullScreenLoading)
Vue.component("cpn-user-avatar", UserAvatar)
Vue.component("cpn-name-avatar", NameAvatar)
Vue.component("cpn-image-viewer", ImgViewer)
Vue.component("cpn-barcode", VueBarcode)
Vue.component("cpn-otp-input", OtpInput)