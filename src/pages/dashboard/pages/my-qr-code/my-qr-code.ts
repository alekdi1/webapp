import { Component } from "vue-property-decorator"
import { EmployeeServices, MaintainanceServices, VuexServices } from "@/services"
import { BranchModel, StoreModel } from "@/models"
import { DialogUtils, LanguageUtils } from "@/utils"
import Base from "../../dashboard-base"
import VueQRCode from "vue-qrcode"
import { App as AppConfig } from "@/config"
import * as htmlToImage from "html-to-image"

@Component({
    components: {
        "vue-qrcode": VueQRCode
    }
})
export default class MyQRCodePage extends Base {
    @VuexServices.Root.VXBranches()
    private StoreBranchList!: BranchModel.Branch[] | null
    private branchMaps = new Map<string, BranchModel.Branch>();
    private branchList: BranchModel.Branch[] = [];

    private isLoading = false
    private isDownloading = false
    private search = ""
    private stores: StoreModel.MaintainanceStore[] = []
    private selectedStore: StoreModel.MaintainanceStore | null = null


    private async mounted() {
        // if (!this.StoreBranchList || this.StoreBranchList.length <= 0) {
            await this.getBranchList();
        // } else {
        //     this.StoreBranchList.map(x => {
        //         this.branchMaps.set(x.code, x);
        //     })
        // }
        // console.log("this.branchList --> ", this.branchList)
        console.log("this.branchMaps --> ", this.branchMaps)
        await this.getStores()
    }

    private async getStores() {
        this.isLoading = true
        try {
            // this.stores = await MaintainanceServices.getStoreListByBP(this.user.customerNo)
            if (this.user.isOwner) {
                this.stores = await MaintainanceServices.getStoreListByBP(this.user.customerNo)
            } else {
                const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.qr_code)
                if (!permission) {
                    throw new Error(LanguageUtils.lang("คุณไม่มีสิทธิ์เข้าใช้งาน", "You have no permission to use this feature"))
                }

                const stores = await MaintainanceServices.getStoreListByBP(this.user.customerNo)
                this.stores = stores.filter(s => permission.shops.some(ps => ps.displayName === s.storeName && (ps.branch.code=='PK2'?'PKT': (ps.branch.code=='PKT'?'PK1':ps.branch.code)) === s.branchCode))

                // --------- debug ---------
                if (!AppConfig.is_production) {
                    const allStores = stores.map(s => s.storeName)
                    const filteredStores = this.stores.map(s => s.storeName)
                    const permissionStores = permission.shops.map(ps => ps.displayName)
                }
            }
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e })
        }

        this.isLoading = false
    }

    private async getBranchList() {
        let branches = [...this.user.branchList];
        if (!this.user.isOwner) {
            const permission = this.user.permissions.find(
                p => p.permission === EmployeeServices.PERMISSIONS.qr_code
            );
            if (!permission) {
                throw new Error(
                    LanguageUtils.lang(
                        "คุณไม่มีสิทธิ์เข้าใช้งาน",
                        "You have no permission to use this feature"
                    )
                );
            }

            const mapBranch: { [x: string]: BranchModel.Branch } = {};
            for (const shop of permission.shops) {
                const code = shop.branch.code;
                if (code) {
                    let b = mapBranch[code];
                    if (!b) {
                        b = branches.find(ub => ub.code === code) || shop.branch;
                        mapBranch[code] = b;
                    }
                }
            }

            branches = Object.values(mapBranch);
        }
        this.branchList = branches;
        this.branchList.map(x => {
            this.branchMaps.set(x.code, x);
        })
        VuexServices.Root.setBranches(this.branchList);
    }

    private async setSelectedStore(store: StoreModel.MaintainanceStore) {
        this.selectedStore = store
    }

    private storeChar(storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private get qrCodeUrl() {
        const baseURL = window.location.origin
        return `${baseURL}/?role=QR&bpNo=${this.user.customerNo}&tenantNo=${this.selectedStore?.storeId}&qrBranch=${this.selectedStore?.branchCode}`
    }

    private async downloadQRCode() {
        try {
            const qrElement = document.getElementById("qrcode") as HTMLImageElement
            const pngUrl = await htmlToImage.toPng(qrElement, { canvasWidth: 720, canvasHeight: 720, backgroundColor: "white" })

            if (!pngUrl) {
                throw new Error("Error while generate qr code")
            }

            const link = document.createElement("a")
            link.href = pngUrl
            link.download = `qr-code-${this.selectedStore?.displayIdAsName}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (e) {
            DialogUtils.showErrorDialog({
                text: e.message || "Download error"
            })
        }
    }

    private get text() {
        return {
            title: this.$t("pages.my_qr.title").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            data_not_found: this.$t("pages.my_qr.data_not_found").toString(),
            detail: this.$t("pages.my_qr.detail").toString(),
            download: this.$t("download").toString()
        }
    }

    private get displayStoreList() {
        console.log(this.stores)
        return this.search ? this.stores.filter(s => (
            this.displayMasterBranch(s.branchCode).toLowerCase().includes(this.search.toLowerCase()) ||
            s.storeName.toLowerCase().includes(this.search.toLowerCase())
        )) : this.stores
    }

    private displayMasterBranch(branchCode: string) {
        let code = "";
        if (branchCode === "PK1") {
            code = "PKT";
        } else if (branchCode === "PKT") {
            code = "PK2";
        } else {
            code = branchCode;
        }
        const branch = this.branchMaps.has(code) ? this.branchMaps.get(code) : null;
        if (branch) {
            return LanguageUtils.lang("สาขา" + branch.nameTh, branch.nameEn + " branch");
        }
        return "";
    }
}
