import Vue from "vue"
import VueI18n from "vue-i18n"
import messages, { LANGUAGES } from "@/lang"

Vue.use(VueI18n)

const locale = localStorage.getItem("lang") === LANGUAGES.EN ? LANGUAGES.EN : LANGUAGES.TH

const i18n = new VueI18n({
	locale,
	messages,
	fallbackLocale: LANGUAGES.TH
})

export default i18n
