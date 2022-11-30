import { Component } from "vue-property-decorator"
import Base from "../../../../dashboard-base"
import { ROUTER_NAMES } from "@/router"
import { VuexServices, InvoiceServices, LogServices, EmployeeServices } from "@/services"
import { BranchModel, InvoiceModel } from "@/models"
import { DialogUtils, LanguageUtils } from "@/utils"
import { Endpoints } from "@/config"

@Component
export default class StoreListPage extends Base {

    @VuexServices.Payment.VXReqInvoiceForm()
    private requestForm!: InvoiceModel.RequestForm | null

    @VuexServices.Root.VXBranches()
    private selectedBranchList!: BranchModel.Branch[]

    private branchList: BranchModel.Branch[] = []
    private branchMaps = new Map<string, BranchModel.Branch>();

    private stores: Store[] = []
    private search = ""
    private route = ROUTER_NAMES.request_invoice_and_receipt_store_list
    private userNo = ""

    private isLoading = false

    private async mounted () {
        // console.log(this.selectedBranchList)
        // if (!this.selectedBranchList || this.selectedBranchList.length <= 0) {
            await this.getBranchList();
        // } else {
        //     this.selectedBranchList.map(x => {
        //         this.branchMaps.set(x.code, x);
        //     })
        // }
        
        this.userNo = this.user.companyName
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onPageLoad"))
        let { requestForm } = this
        if (!requestForm) {
            requestForm = new InvoiceModel.RequestForm()
            VuexServices.Payment.setReqInvoiceForm(requestForm)
        }
        await this.getStores()
        LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onReady"))        
    }

    private get text () {
        return {
            title: this.$t("pages.req_inv_n_recp.title").toString(),
            search_branch: this.$t("search_branch_or_store").toString()
        }
    }

    private async getStores () {
        this.isLoading = true
        try {
            const filters: any[] = []
            
            const permission = this.user.permissions.find(p => p.permission === EmployeeServices.PERMISSIONS.payment)
            if (!this.user.isOwner) {
                if (!permission) {
                    throw new Error(LanguageUtils.lang("คุณไม่มีสิทธิ์เข้าใช้งาน", "You have no permission to use this feature"))
                }
                
                permission?.shops?.map(e=>{filters.push({
                    branchId : e.branch.code==='PK2'?'PKT': (e.branch.code==='PKT'?'PK1':e.branch.code),
                    shopId : e.number.toString().padStart(6, "0"),
                    industryCode : e.industryCode
                })});
            }
            LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallStart", Endpoints.getBranchShop))
            const invoiceList = await InvoiceServices.getBranchShopList( this.user.customerNo,filters)
            LogServices.addApiLog(new LogServices.PLog(this.route, this.userNo, "onApiCallFinsih", Endpoints.getBranchShop))
            console.log(invoiceList)
            const storeWithBranchRaw = invoiceList.map((i: any) => {
                const dummy = this.displayMasterBranch2(i.branch.id)
                return mapStoreFromInvoice(i,dummy)
            })
            console.log(storeWithBranchRaw)
            const mapKeys: {[x: string]: boolean|undefined} = {}
            if(permission){
                for (const shop of permission.shops) {
                    const key = `${ (shop.number).toString().padStart(6, "0") }-${shop.branch.code=='PK2'?'PKT': (shop.branch.code=='PKT'?'PK1':shop.branch.code)}-${ shop.industryCode }`
                    // console.log(key)
                    // const key = `${ formatShopNumber(shop.number) }-${ shop.branch.code!='PK2' && shop.branch.code!='PK1'?shop.branch.code:'PKT' }-${ shop.industryCode }`
                    mapKeys[key] = true
                }
            }
            const storeWithBranchFilter: Store[] = []
            for (const item of storeWithBranchRaw) {
                // const k = item.shop.id + item.branch.id + item.branch_new.id
                // const idx = storeWithBranchFilter.findIndex(d => d.shop.id + d.branch.id + d.branch_new.id  === k)
                // if (idx < 0) {
                //     storeWithBranchFilter.push(item)
                // }
                if (this.user.isOwner || mapKeys[`${ item.shop.id }-${ item.branch.id }-${ item.shop.industryCode }`] === true) {
                    storeWithBranchFilter.push(item)
                }
            }
            // const userContacts = await UserServices.getContact(this.user.customerNo)
            this.stores = storeWithBranchFilter
        } catch (e) {
            DialogUtils.showErrorDialog({ text: e.message || e})
        }
        this.isLoading = false
    }

    private async selectedStore (store: Store) {
        let { requestForm } = this
        if (!requestForm) {
            requestForm = new InvoiceModel.RequestForm()
        } else {
            requestForm = Object.assign(new InvoiceModel.RequestForm(), requestForm)
        }
        requestForm.shop = store.shop
        requestForm.branch = store.branch
        await VuexServices.Payment.setReqInvoiceForm(requestForm)

        this.$router.push({
            name: ROUTER_NAMES.request_form,
            params: {
                store_id: store.shop.id
            },
            query:{
                branch_id :store.branch.id
            }
        })
    }

    private storeChar (storeName: string) {
        return storeName.length > 0 ? storeName[0].toUpperCase() : ""
    }

    private get displayStoreList() {
        const { search, stores } = this
        return search ? stores.filter(s =>
            String(s.branch_new.displayName).toLowerCase().includes(search) ||
            String(s.shop.displayName).toLowerCase().includes(search)
        ) : stores
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
    private displayMasterBranch2(branchCode: string) {
        let code = "";
        if (branchCode === "PK1") {
            code = "PKT";
        } else if (branchCode === "PKT") {
            code = "PK2";
        } else {
            code = branchCode;
        }
        const branch = this.branchMaps.has(code) ? this.branchMaps.get(code) : null;
        return {
            id:branchCode,
            nameEn:branch?.nameEn||"",
            nameTh:branch?.nameTh||"",
        };
    }

    private async getBranchList() {
        let branches = [...this.user.branchList];
        if (!this.user.isOwner) {
            const permission = this.user.permissions.find(
                p => p.permission === EmployeeServices.PERMISSIONS.payment
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
}

function mapStoreFromInvoice (d: InvoiceModel.Invoice, d2: any) {
    const s = new Store()
    s.shop = d.shop
    s.branch = d.branch
    s.branch_new.id = d2.id
    s.branch_new.nameEn = d2.nameEn
    s.branch_new.nameTh = d2.nameTh
    return s
}


class Store {
    shop = new InvoiceModel.InvoiceShop()
    branch = new InvoiceModel.InvoiceBranch()
    branch_new = new InvoiceModel.InvoiceBranch()
}
