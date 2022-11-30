import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { BranchModel, StoreModel } from "@/models"
import { EmployeeServices, MaintainanceServices, VuexServices } from "@/services"
import { DialogUtils, LanguageUtils, StorageUtils } from "@/utils"
import { ROUTER_NAMES } from "@/router"
import { App as AppConfig } from "@/config"
import { CouponSuccess } from "@/pages/dashboard"

const SORT_TYPES = Object.freeze({
    store_name_asc: "store_name_asc",
    store_name_desc: "store_name_desc"
})

@Component
export default class MaintainanceShopListPage extends Base {
    private branchMaps = new Map<string, BranchModel.Branch>();
    private isLoading = false
    private search = ""
    private stores: StoreModel.MaintainanceStore[] = []
    private sortDialog = new SortDialog()
    private branchList: BranchModel.Branch[] = [];

    private async mounted() {
        await this.getBranchList()
        await this.getStores()
    }

    private get hasNoStore() {
        return this.stores.length === 0
    }

    private async getStores() {
        console.log("getStores --> MaintainanceShopListPage --> ")
        this.isLoading = true
        try {
            // ------------------ qr-code user ------------------
            if (this.user.isQRUser) {
                let stores = await MaintainanceServices.getStoreListByBP(this.user.customerNo)
                const qrUserBranches = this.user.branchList.filter(b => this.user.allowedBranchIds.some(bid => String(b.id) === String(bid)))
                stores = stores.filter(s => qrUserBranches.some(b => b.code === s.branchCode))
                const storesWithMaintainances: StoreModel.MaintainanceStore[] = []
                const t = stores.find(tenant => tenant.storeId === StorageUtils.getItem("QR_TENANT_NO"))
                if (t) {
                    storesWithMaintainances.push(t)
                    this.stores = storesWithMaintainances
                }
                this.isLoading = false
                return
            }

            // owner see all
            if (this.user.isOwner) {
                this.stores = await MaintainanceServices.getStoreListByBP(this.user.customerNo)
            } else {
                const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.maintenance)
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

            // console.log("stores ", this.stores)

        } catch (e) {
            console.error(e.message || e)
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private async goToMaintainanceStatus(store: StoreModel.MaintainanceStore) {
        this.$router.push({
            name: ROUTER_NAMES.maintainance_status_list,
            query: {
                bpNo: this.user.customerNo,
                tenantNo: store.storeId
            }
        })
    }

    private storeChar(storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private get text() {
        return {
            title: this.$t("pages.maintainance_shop_list.title").toString(),
            search_branch: this.$t("search_branch_or_store").toString(),
            data_not_found: this.$t("pages.maintainance_shop_list.data_not_found").toString(),
            sort_by: this.$t("sort_by").toString()
        }
    }

    private displayInProgressMaintenance(ipMaintenance: number) {
        return LanguageUtils.lang(`มี ${ipMaintenance} งานแจ้งซ่อม`, `${ipMaintenance} in progress`)
    }

    private get displayStoreList() {
        this.stores.map(x => {
            const branchCode = x.branchCode == "PKT" ? "PK2" : x.branchCode == "PK1" ? "PKT" : x.branchCode
            const findBranch = this.branchMaps.get(branchCode);
            x.brachNameMaster = findBranch != undefined ? LanguageUtils.lang("สาขา" + findBranch.nameTh, findBranch.nameEn + " branch") : x.branchCode
        })
        if(!this.sortDialog.sortBy)this.stores = [...this.stores].sort((v1, v2) => v1.displayIdAsName.localeCompare(v2.displayIdAsName))
        const srh = this.search.toLowerCase()
        return this.search ? this.stores.filter(s => (
            s.displayBranchName.toLowerCase().includes(srh) ||
            s.storeName.toLowerCase().includes(srh)
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

    private showSortDialog() {
        this.sortDialog.show = true
    }

    private sortItemClick(val: string) {
        this.sortDialog.sortBy = val === this.sortDialog.sortBy ? "" : val
        this.sortDialog.show = false

        this.sortStore(this.sortDialog.sortBy)
    }

    private sortStore(type = "") {
        switch (type) {
            case SORT_TYPES.store_name_asc:
                return this.stores = [...this.stores].sort((v1, v2) => v1.displayIdAsName.localeCompare(v2.displayIdAsName))
            case SORT_TYPES.store_name_desc:
                return this.stores = [...this.stores].sort((v1, v2) => v2.displayIdAsName.localeCompare(v1.displayIdAsName))
            default: return this.stores = [...this.stores].sort((v1, v2) => v2.storeId.localeCompare(v1.storeId))
        }
    }

    private async getBranchList() {
        let branches = [...this.user.branchList];
        if (!this.user.isOwner) {
            const permission = this.user.permissions.find(
                p => p.permission === EmployeeServices.PERMISSIONS.maintenance
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
    }
}

class SortDialog {
    show = false
    sortBy = ""

    get sortList() {
        return [
            {
                label: LanguageUtils.lang("เรียงตาม A-Z", "Sort from A-Z"),
                value: SORT_TYPES.store_name_asc
            },
            {
                label: LanguageUtils.lang("เรียงตาม Z-A", "Sort from Z-A"),
                value: SORT_TYPES.store_name_desc
            }
        ]
    }
}
