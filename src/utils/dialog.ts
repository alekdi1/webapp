import swal from "sweetalert2"
import i18n from "@/plugins/i18n"
import vuetify from "@/plugins/vuetify"
import { PostService } from "@/services"

interface DialogParams {
    title?: string
    text?: string,
    timer?: number
}

const SWAL_CLASS_CONFIG = {
    container: "cpn-swal-dialog-container",
    popup: "error-dialog-popup",
    denyButton: "cpn-swal-btn",
    closeButton: "cpn-swal-btn",
    cancelButton: "cpn-swal-btn",
    confirmButton: "cpn-swal-btn"
}

export function showErrorDialog(p: DialogParams) {

    let html = ""
    if (p.title) {
        html += `<div class="error-title">${p.title}</div>`
    }
    html += "<div class='error-message'>" + (p.text || "") + "</div>"

    return swal.fire({
        customClass: SWAL_CLASS_CONFIG,
        allowOutsideClick: false,
        showCloseButton: false,
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: `<div class="cancel-btn-icon-container"><var class="material-icons">close</var></div>`,
        confirmButtonColor: vuetify.framework.theme.currentTheme.primary?.toString(),
        cancelButtonColor: "#000",
        confirmButtonText: i18n.t("ok").toString(),
        icon: 'error',
        html,
        timer: p.timer
    })
}

export function showSuccessDialog(p: DialogParams) {
    return swal.fire({
        icon: "success",
        customClass: SWAL_CLASS_CONFIG,
        title: p.title,
        text: p.text,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: `<span class="btn-text">${i18n.t("close")}</span>`,
        cancelButtonColor: vuetify.framework.theme.currentTheme.primary?.toString(),
        allowOutsideClick: false,
        timer: p.timer
    })
}

export async function showDeleteFavDialog(p: DialogParams, id: string) {
    const result = await swal.fire({
        title: p.title,
        text: p.text,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: `<span class="btn-text">${i18n.t("confirm")}</span>`,
        confirmButtonColor: vuetify.framework.theme.currentTheme.primary?.toString(),
        cancelButtonText: `<span class="btn-text">${i18n.t("cancel")}</span>`,
        cancelButtonColor: vuetify.framework.theme.currentTheme.dark?.toString()
    })

    if (result.isConfirmed) {
        await PostService.deleteFavoritePost(id)
    }
}

export async function showSuccessWithActionDialog(p: DialogParams) {
    let html = ""
    if (p.title) {
        html += `<div class="success-title">${p.title}</div>`
    }
    html += "<div class='success-message'>" + (p.text || "") + "</div>"

    return await swal.fire({
        customClass: SWAL_CLASS_CONFIG,
        allowOutsideClick: false,
        showCloseButton: false,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: `${i18n.t("confirm")}`,
        confirmButtonColor: vuetify.framework.theme.currentTheme.primary?.toString(),
        cancelButtonText: `<div class="cancel-btn-icon-container"><var class="material-icons">close</var></div>`,
        cancelButtonColor: "#000",
        html
    })
}

export async function showOTPExpiredWithActionDialog(p: DialogParams) {
    let html = ""
    html += "<div class='success-message'>" + (p.text || "") + "</div>"

    return await swal.fire({
        customClass: SWAL_CLASS_CONFIG,
        allowOutsideClick: false,
        showCloseButton: false,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: `${i18n.t("resend_otp_again")}`,
        confirmButtonColor: vuetify.framework.theme.currentTheme.primary?.toString(),
        cancelButtonText: `<div class="cancel-btn-icon-container"><var class="material-icons">close</var></div>`,
        cancelButtonColor: "#000",
        html
    })
}
