import moment from "moment"
import { LanguageUtils } from "@/utils"

export function convertToLocalDateFormat(date: moment.Moment, format = "ll") {
    return LanguageUtils.getCurrentLang() === "en" ? date.locale(LanguageUtils.getCurrentLang()).format(format) : date.locale(LanguageUtils.getCurrentLang()).add(543, "year").format(format)
}

export function convertToLocalTimeFormat(date: moment.Moment) {
    const timeOption = LanguageUtils.lang("น.", "")
    return date.locale(LanguageUtils.getCurrentLang()).format("HH.mm") + " " + timeOption
}
