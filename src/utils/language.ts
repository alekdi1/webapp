import i18n from "@/plugins/i18n"
import { LANGUAGES } from "@/lang"
import VTF from "@/plugins/vuetify"
import moment from "moment"

export {
	i18n
}

export function lang<T>(th: T, en: T): T {
	return isEn() ? en : th
}

export function getCurrentLang() {
	return i18n.locale
}

export function setLang(lang: string) {
	i18n.locale = lang
	VTF.framework.lang.current = lang
	localStorage.setItem("lang", lang)
}

export function switchLang() {
	setLang(isEn() ? LANGUAGES.TH : LANGUAGES.EN)
}

export function isTh() {
	return i18n.locale === LANGUAGES.TH
}

export function isEn() {
	return i18n.locale === LANGUAGES.EN
}

export function getLangYear(date: Date|moment.Moment) {
	const year = moment(date).year()
	return lang(year + 543, year)
}
