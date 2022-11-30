import { Component } from "vue-property-decorator";
import Base from "../../../../dashboard-base";
import ViewInvoiceDetail from "../../components/invoice-detail/invoice-detail.vue";
import UserOnBoardModal from "../../components/user-on-board/user-on-board.vue";
import { BranchModel, InvoiceModel } from "@/models";
import { InvoiceItem } from "@/pages/dashboard/models";
import {
  EmployeeServices,
  InvoiceServices,
  VuexServices,
  LogServices,
} from "@/services";
import i18n from "@/plugins/i18n";
import PAGE_NAME from "../page-name";
import { DialogUtils, LanguageUtils } from "@/utils";
import numeral from "numeral";
import { ROUTER_NAMES } from "@/router";
import { Endpoints } from "@/config";
import { Invoice } from "@/models/invoice";
// import { mapInvoiceData } from "@/services/invoice.service";

class Branch extends BranchModel.Branch { }

const SORT_TYPES = Object.freeze({
  duedate_asc: "duedate_asc",
  duedate_desc: "duedate_desc",
  store_name_asc: "store_name_asc",
  store_name_desc: "store_name_desc",
  invoice_no_asc: "invoice_no_asc",
  invoice_no_desc: "invoice_no_desc"
});

const ITEM_PER_PAGE = 50;

@Component({
  name: PAGE_NAME.invoice_list,
  components: {
    "cpn-payment-invoice-detail": ViewInvoiceDetail,
    "cpn-user-on-board-payment-modal": UserOnBoardModal
  }
})
export default class PaymentInvoiceList extends Base {
  @VuexServices.Payment.VXSelectedInvoices()
  private selectedInvoices!: InvoiceModel.Invoice[];
  private currentInvoice: InvoiceModel.Invoice | null = null;
  private sortDialog = new SortDialog();
  private isShowModal = false;
  private isFirstVisit = false;
  private loading = false;
  private search = "";
  private selectedBranches: Branch[] = [];
  private showMenu = false;
  private errorMessage = "";
  private branchList: Branch[] = [];
  private invoiceList: InvoiceItem[] = [];
  private invoiceBranches: Branch[] = [];
  private filteredInvoiceList: InvoiceItem[] = [];
  private displayInvoiceList: InvoiceItem[] = [];
  private currentPage = 1;
  private inputTimeout = 0;
  private route = ROUTER_NAMES.payment_invoice_list;
  private userNo = "";
  private invoiceDict: Invoicekey[] = []
  private branchMaps = new Map<string, Branch>();

  private async mounted() {
    this.userNo = this.user.customerNo;
    LogServices.addApiLog(
      new LogServices.PLog(this.route, this.userNo, "onPageLoad")
    );
    this.checkFirstVisit();
    try {
      await this.getBranchList();
      await this.getInvoices();
    } catch (e) {
      DialogUtils.showErrorDialog({
        text: e.message || "Error"
      });
    }
    LogServices.addApiLog(
      new LogServices.PLog(this.route, this.userNo, "onReady")
    );
  }

  private async selectBranch(branch: Branch) {
    const idx = this.selectedBranches.findIndex(b => b.id === branch.id);
    if (idx === -1) {
      this.selectedBranches.push(branch);
    } else {
      this.$delete(this.selectedBranches, idx);
    }

    this.updateDisplayInvoice(true);
  }

  private updateDisplayInvoice(reset = false) {
    let items = [...this.invoiceList];
    this.currentPage = reset ? 1 : this.currentPage;
    // check filter branch, 
    if (this.selectedBranches.length > 0) {
      items = items.filter(i =>
        this.selectedBranches.some(b => b.code === i.branchItm.id)
      );
    }

    // check sort
    items = (() => {
      switch (this.sortDialog.sortBy) {
        case SORT_TYPES.duedate_asc:
          return items.sort((v1, v2) =>
            v1.item.endDateTime.localeCompare(v2.item.endDateTime)
          );
        case SORT_TYPES.duedate_desc:
          return items.sort((v1, v2) =>
            v2.item.endDateTime.localeCompare(v1.item.endDateTime)
          );

        case SORT_TYPES.store_name_asc:
          return items.sort((v1, v2) =>
            v1.item.shop.displayName.localeCompare(v2.item.shop.displayName)
          );
        case SORT_TYPES.store_name_desc:
          return items.sort((v1, v2) =>
            v2.item.shop.displayName.localeCompare(v1.item.shop.displayName)
          );

        case SORT_TYPES.invoice_no_asc:
          return items.sort((v1, v2) => v1.item.id.localeCompare(v2.item.id));
        case SORT_TYPES.invoice_no_desc:
          return items.sort((v1, v2) => v2.item.id.localeCompare(v1.item.id));

        // default sort by created lastest
        default:
          return items.sort((v1, v2) =>
            v2.item.createdDateTime.localeCompare(v1.item.createdDateTime)
          );
      }
    })();

    const startPage = (this.currentPage - 1) * ITEM_PER_PAGE;

    // check over page
    if (startPage < items.length) {
      const displayItems = reset ? [] : [...this.displayInvoiceList];
      displayItems.push(
        ...items.slice(startPage, this.currentPage * ITEM_PER_PAGE)
      );

      this.displayInvoiceList = displayItems;
    }
    this.filteredInvoiceList = [...items];
  }

  private get selectedInvoicesCount() {
    return this.selectedInvoices.length;
  }

  private onLeftColumnScrollEnd() {
    this.currentPage++;
    this.updateDisplayInvoice(false);
  }

  private updateInvoiceBranch() {
    const branchMap = new Map<string, Branch>();
    for (const inv of this.invoiceList) {
      const bc = inv.item.branch.id;
      let branch = branchMap.get(bc);
      if (!branch) {
        branch = this.branchList.find(b => b.code === bc);
        if (!branch) {
          branch = new Branch();
          branch.id = bc;
          branch.nameEn = inv.item.branch.nameEn;
          branch.nameTh = inv.item.branch.nameTh;
          branch.code = bc;
        }

        branchMap.set(bc, branch);
      }
    }

    const branchList: Branch[] = [];
    for (const branch of branchMap.values()) {
      branchList.push(branch);
    }

    this.invoiceBranches = branchList;
  }

  private get text() {
    return {
      title: this.$t("pages.payment.title"),
      duedate: this.$t("invoice.duedate").toString(),
      _invoice: this.$t("invoice._invoice").toString(),
      baht: this.$t("baht").toString(),
      total_payment: this.$t("total_payment").toString(),
      vat: this.$t("vat").toString(),
      vat_discount: this.$t("vat_discount").toString(),
      withholding_tax: this.$t("withholding_tax").toString(),
      withholding_tax_discount: this.$t("withholding_tax_discount").toString(),
      invoice_no: this.$t("invoice.invoice_no").toString(),
      select_all: this.$t("select_all").toString(),
      search_branch: this.$t("pages.payment.search_branch").toString(),
      sort_by: this.$t("sort_by").toString(),
      no_invoice_text: this.$t("pages.payment.no_invoice_text").toString(),
      no_shop_name: LanguageUtils.lang("ไม่มีชื่อร้านค้า", "No shop name")
    };
  }

  private showSortDialog() {
    this.sortDialog.show = true;
  }

  private get selectedInvoiceItems() {
    return this.selectedInvoices.map(d => new InvoiceItem(d));
  }

  private get currentViewInvoice() {
    const i = this.currentInvoice;
    return i ? new InvoiceItem(i) : null;
  }

  private async invoiceItemClick(v: InvoiceItem) {
    this.currentInvoice = v.item;
  }

  private get currentInvoiceId() {
    return this.currentInvoice?.uniqueId || "";
  }

  private get branchOptions() {
    const { branchList, search } = this;
    const dummy = search
      ? branchList.filter(b => (b.nameEn + b.nameTh).search(search) > -1)
      : branchList;
      dummy.sort(function(a, b) {
        const nameA = LanguageUtils.lang(a.nameTh, a.nameEn).toUpperCase() // ignore upper and lowercase
        const nameB = LanguageUtils.lang(b.nameTh, b.nameEn).toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
      });
      return dummy
  }

  private async getInvoices() {
    this.loading = true;
    try {
      let branchList: string[] = [];
      if (this.selectedBranches.length > 0) {
        this.selectedBranches.map(b => {
          if (b.code === "PKT" || b.id === "PKT") {
            // b.code = "PK1";
            // b.id = "PK1";
            branchList.push('PK1')
          } else if (b.code === "PK2" || b.id === "PK2") {
            // b.code = "PKT";
            // b.id = "PKT";
            branchList.push('PKT')
          } else if (b.code === "CNT" || b.id === "CNT") {
            // b.code = "PKT";
            // b.id = "PKT";
            branchList.push('CWN')
          }
          
          // return b.code || b.id;
        });
      } else {
        if (!this.user.isOwner) {
         this.branchList.map(b => {
          if (b.code === "PKT" || b.id === "PKT") {
            // b.code = "PK1";
            // b.id = "PK1";
            branchList.push('PK1')
          } else if (b.code === "PK2" || b.id === "PK2") {
            // b.code = "PKT";
            // b.id = "PKT";
            branchList.push('PKT')
          } else if (b.code === "CNT" || b.id === "CNT") {
            // b.code = "PKT";
            // b.id = "PKT";
            branchList.push('CWN')
          }
            // return b.code || b.id;
          });
        } else {
          branchList = [];
        }
      }

      let items: InvoiceModel.Invoice[] = [];
      if (!this.user.isOwner) {
        const permission = this.user.permissions.find(
          p => p.permission === EmployeeServices.PERMISSIONS.payment
        );
        console.log(permission)
        const filter: any[] = []
        permission?.shops?.map(e=>{filter.push({branchId : e.branch.code==='PK2'?'PKT': (e.branch.code==='PKT'?'PK1':(e.branch.code==='CNT'?'CWN':e.branch.code)),
        // shopId : e.id,
        shopId : e.number.toString().padStart(6, "0"),
        industryCode : e.industryCode})});
        console.log(filter)
        const formatShopNumber = (shopNumber: string | number) =>
          numeral(shopNumber).format("000000");
        if (permission) {
          LogServices.addApiLog(
            new LogServices.PLog(
              this.route,
              this.userNo,
              "onApiCallStart",
              Endpoints.getInvoice
            )
          );
          items = await InvoiceServices.getInvoiceList(
            branchList,
            this.user.customerNo,
            filter
          );
          LogServices.addApiLog(
            new LogServices.PLog(
              this.route,
              this.userNo,
              "onApiCallFinsih",
              Endpoints.getInvoice
            )
          );

          const mapKeys: { [x: string]: boolean | undefined } = {};
          for (const shop of permission.shops) {
            const key = `${formatShopNumber(shop.number)}-${shop.branch.code=='PK2'?'PKT': (shop.branch.code=='PKT'?'PK1':((shop.branch.code==='CNT'?'CWN':shop.branch.code)))}-${shop.industryCode}`;
            mapKeys[key] = true;
          }
          items = items.filter(v => {
            const k = `${v.shop.id}-${v.branch.id}-${v.shop.industryCode}`;
            return mapKeys[k] === true;
          });
          console.log("Filtered: ", items.length);
        } else {
          items = [];
          throw new Error(
            LanguageUtils.lang(
              "คุณไม่มีสิทธิ์เข้าใช้งาน",
              "You have no permission to use this feature"
            )
          );
        }
      } else {
        LogServices.addApiLog(
          new LogServices.PLog(
            this.route,
            this.userNo,
            "onApiCallStart",
            Endpoints.getInvoice
          )
        );
        items = await InvoiceServices.getInvoiceList(
          branchList,
          this.user.customerNo
        );
        LogServices.addApiLog(
          new LogServices.PLog(
            this.route,
            this.userNo,
            "onApiCallFinsih",
            Endpoints.getInvoice
          )
        );
      }

      items.map(x => {
        const branchCode = x.businessArea == "PKT" ? "PK2" : x.businessArea == "PK1" ? "PKT" : (x.businessArea == "CNT" ? "CWN" : x.businessArea)
        const findBranch = this.branchList.find(d => d.code == branchCode);
        x.branchDescTH = findBranch != undefined ? findBranch.nameTh : x.businessArea
        x.branchDescEN = findBranch != undefined ? findBranch.nameEn : x.businessArea
      })

      this.invoiceList = items.map(z => new InvoiceItem(z));
      this.updateInvoiceBranch();
      this.updateDisplayInvoice(true);

    } catch (e) {
      DialogUtils.showErrorDialog({
        text:
          e.message ||
          LanguageUtils.lang(
            "ไม่สามารถดึงข้อมูลใบเเจ้งหนี้ได้",
            "Cannot get invoices data"
          )
      });
    }
    this.loading = false;
  }

  private clearSearch() {
    this.search = "";
    clearTimeout(this.inputTimeout);
    this.showMenu = false;
  }

  private removeSelectedBranch(branch: Branch) {
    this.selectedBranches = this.selectedBranches.filter(
      b => b.id !== branch.id
    );
    this.updateDisplayInvoice(true);
  }

  private isSelected(b: Branch) {
    return this.selectedBranches.findIndex(z => z.id === b.id) > -1;
  }

  private onSearchFocus() {
    if (this.branchList.length > 0) {
      setTimeout(() => {
        this.showMenu = true;
      }, 250);
    }
  }

  private async searchBranch() {
    this.loading = true;
    try {
      this.showMenu = true;
      this.loading = false;
    } catch (e) {
      console.log("Search error");
      this.errorMessage = e.message || "";
    }
  }

  private onSearchInput() {
    this.errorMessage = "";
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

  // ------------------ On board trigger ------------------------
  private checkFirstVisit() {
    const isFirstVisit = localStorage.getItem("firstVisitPayment");
    this.isFirstVisit =
      isFirstVisit === null || JSON.parse(isFirstVisit) === true;
  }

  private async toggleSelectInvoice(v: InvoiceItem) {
    this.invoiceDict = [];
    this.currentInvoice = v.item;
    const items = [...this.selectedInvoices];
    const idx = items.findIndex(i => v.uniqueId === i.uniqueId);
    const allSelectedInvoices: InvoiceItem[] = [...this.selectedInvoices.map(d => new InvoiceItem(d)), v]

    //ใบแจ้งหนี้ 
    const invoices: InvoiceItem[] = allSelectedInvoices.filter(x =>
      x.id.startsWith("101") && x.invoiceReference.startsWith("101") ||
      x.id.startsWith("110") && x.invoiceReference.startsWith("110") ||
      x.id.startsWith("201") && x.invoiceReference.startsWith("201") ||
      x.id.startsWith("251") && x.invoiceReference.startsWith("251") ||
      x.id.startsWith("992") && x.invoiceReference.startsWith("992")
    )

    //ใบลดหนี้/แจ้งหนี้ 
    const invoicesTypeDiscount: InvoiceItem[] = allSelectedInvoices.filter(x =>
      x.id.startsWith("15") && x.invoiceReference.startsWith("11") ||
      x.id.startsWith("15") && x.invoiceReference.startsWith("992") ||
      x.id.startsWith("213")
    )

    //ใบลดหนี้/ใบเสร็จรับเงิน
    const invoicesTypeDiscountReceipt: InvoiceItem[] = allSelectedInvoices.filter(x =>
      x.id.startsWith("15") && x.invoiceReference.startsWith("231") ||
      x.id.startsWith("15") && x.invoiceReference.startsWith("233") ||
      x.id.startsWith("211")
    )

    //ใบลดหนี้/ใบกำกับภาษี
    const invoicesTypeDiscountTax: InvoiceItem[] = allSelectedInvoices.filter(x =>
      x.id.startsWith("15") && x.invoiceReference.startsWith("230") ||
      x.id.startsWith("15") && x.invoiceReference.startsWith("232") ||
      x.id.startsWith("212")
    )

    // console.log("invoices ", invoices)
    // console.log("invoicesTypeDiscount ", invoicesTypeDiscount)
    // console.log("invoicesTypeDiscountReceipt ", invoicesTypeDiscountReceipt)
    // console.log("invoicesTypeDiscountTax ", invoicesTypeDiscountTax)
    // console.log("idx ", idx)

    if (invoicesTypeDiscount.length > 0) {
      DialogUtils.showErrorDialog({
        text: LanguageUtils.lang("หากประสงค์ใช้ใบลดหนี้/ใบแจ้งหนี้ กรุณาติดต่อเจ้าหน้าที่ 02-021-9999 ในเวลาทำการ จันทร์ - ศุกร์ 09:00 - 18:30 น.", "")
      });
      return;
    }

    if (invoices.length == 0 && (invoicesTypeDiscount.length > 0 || invoicesTypeDiscountReceipt.length > 0 || invoicesTypeDiscountTax.length > 0) && this.selectedInvoices.length == 0) {
      DialogUtils.showErrorDialog({
        text: LanguageUtils.lang("กรุณาเลือกใบแจ้งหนี้ก่อนเลือกส่วนลดใบแจ้งหนี้", "")
      });
      return;
    }

    if (idx === -1) {
      items.push(v.item);
      let newSelectedInvoices: InvoiceItem[] = [];
      newSelectedInvoices = [...invoices]

      if (invoices.length > 0) {
        for (const c of invoices) {
          const key = `${c.taxCode}-${c.businessArea}-${c.compCode}`;
          const addKey = new Invoicekey();
          if (this.invoiceDict.filter(x => x.key == key).length == 0) {
            addKey.key = key;
            addKey.invoices = invoices.filter(x => x.taxCode == c.taxCode && x.businessArea == c.businessArea && x.compCode == c.compCode)
            addKey.balance = addKey.invoices.reduce(((sum, cur) => sum + cur.invoicePrice), 0);
            this.invoiceDict.push(addKey);
          }
        }

        let totalSumInvoices: number = invoices.reduce((sum, cur) => sum + cur.invoicePrice, 0);
        for (const c of allSelectedInvoices) {
          if (invoicesTypeDiscount.filter(x => x.id == c.id).length > 0) {
            const invoicesforThisInvoiceDiscount = invoices.filter(x => x.taxCode == c.taxCode && x.compCode == c.compCode && x.businessArea == c.businessArea)
            if (invoicesforThisInvoiceDiscount.length == 0) {
              if (invoices.filter(x => x.taxCode == c.taxCode).length == 0) {
                DialogUtils.showErrorDialog({
                  text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากคนละประเภทรายได้​", "")
                });
                return;
              }
              if (invoices.filter(x => x.compCode == c.compCode).length == 0) {
                DialogUtils.showErrorDialog({
                  text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากคนละร้านค้า​", "")
                });
                return;
              }
              if (invoices.filter(x => x.businessArea == c.businessArea).length == 0) {
                DialogUtils.showErrorDialog({
                  text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากคนละสาขา ", "")
                });
                return;
              }
            }

            if (invoicesforThisInvoiceDiscount.length > 0) {
              const sumInvoiceByInvoice = this.invoiceDict.find(x => x.key == `${c.taxCode}-${c.businessArea}-${c.compCode}`)
              if (sumInvoiceByInvoice != undefined) {

                //all
                const sumAllThisInvoice = sumInvoiceByInvoice.invoicesSum;
                const calculateSunByAllInvoice = (totalSumInvoices - sumAllThisInvoice) + (sumAllThisInvoice + c.invoicePrice);

                //byinvoice
                const sumBalanceInvoice = sumInvoiceByInvoice.balance;
                const sumByInvoiceBalance = sumBalanceInvoice + c.invoicePrice

                if (sumByInvoiceBalance == 0 || calculateSunByAllInvoice == 0) {
                  DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("หากประสงค์ใช้ใบลดหนี้ ที่ยอดชำระเท่ากับ 0 บาท กรุณาติดต่อเจ้าหน้าที่ 02-021-9999 ในเวลาทำการ จันทร์ - ศุกร์ 09:00 - 18:30 น.", "")
                  });
                  return;
                } else if (sumByInvoiceBalance < 0 || calculateSunByAllInvoice < 0) {
                  DialogUtils.showErrorDialog({
                    text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากส่วนลดเกินยอดที่ต้องชำระ​", "")
                  });
                  return;
                } else {
                  totalSumInvoices = (totalSumInvoices - sumAllThisInvoice) + (sumAllThisInvoice + c.invoicePrice);
                  sumInvoiceByInvoice.balance += c.invoicePrice;
                  const findinvoice = this.invoiceList.find(i => i.uniqueId === c.uniqueId);
                  if (findinvoice != undefined) {
                    newSelectedInvoices.push(findinvoice);
                  }
                }
              }
            }
          }

          if (invoicesTypeDiscountReceipt.filter(x => x.id == c.id).length > 0) {
            const ReceiptSunWithInvoice = totalSumInvoices + c.invoicePrice
            if (ReceiptSunWithInvoice == 0) {
              DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("หากประสงค์ใช้ใบลดหนี้ ที่ยอดชำระเท่ากับ 0 บาท กรุณาติดต่อเจ้าหน้าที่ 02-021-9999 ในเวลาทำการ จันทร์ - ศุกร์ 09:00 - 18:30 น.", "")
              });
              return;
            } else if (ReceiptSunWithInvoice < 0) {
              DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากส่วนลดเกินยอดที่ต้องชำระ", "")
              });
              return;
            } else {
              totalSumInvoices = (totalSumInvoices + c.invoicePrice);
              const findinvoice = this.invoiceList.find(i => i.uniqueId === c.uniqueId);
              if (findinvoice != undefined) {
                newSelectedInvoices.push(findinvoice);
              }
            }
          }
          if (invoicesTypeDiscountTax.filter(x => x.id == c.id).length > 0) {
            const ReceiptSunWithInvoice = totalSumInvoices + c.invoicePrice
            if (ReceiptSunWithInvoice == 0) {
              DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("หากประสงค์ใช้ใบลดหนี้ ที่ยอดชำระเท่ากับ 0 บาท กรุณาติดต่อเจ้าหน้าที่ 02-021-9999 ในเวลาทำการ จันทร์ - ศุกร์ 09:00 - 18:30 น.", "")
              });
              return;
            } else if (ReceiptSunWithInvoice < 0) {
              DialogUtils.showErrorDialog({
                text: LanguageUtils.lang("ไม่สามารถใช้ใบลดหนี้ได้ เนื่องจากส่วนลดเกินยอดที่ต้องชำระ", "")
              });
              return;
            } else {
              totalSumInvoices = (totalSumInvoices + c.invoicePrice);
              const findinvoice = this.invoiceList.find(i => i.uniqueId === c.uniqueId);
              if (findinvoice != undefined) {
                newSelectedInvoices.push(findinvoice);
              }
            }
          }
        }
        console.log("totalSumInvoices ", totalSumInvoices)
        VuexServices.Payment.setSelectedInvoices(items);
      }
    } else {
      // ---- function claer selected modal
      // if (invoices.filter(x => x.id == v.id).length > 0 && (invoicesTypeDiscount.length > 0 || invoicesTypeDiscountReceipt.length > 0 || invoicesTypeDiscountTax.length > 0)) {
      //   this.isShowModal = true;
      // }
      items.splice(idx, 1);
      VuexServices.Payment.setSelectedInvoices(items);
    }
    // console.log("items ", items)
    console.log("selectedInvoices ", this.selectedInvoices)
  }

  private isInvoiceSelected(i: InvoiceItem) {
    return this.selectedInvoiceItems.some(v => v.uniqueId === i.uniqueId);
  }

  private get isSelectedAll() {
    return (
      this.filteredInvoiceList.length > 0 &&
      this.filteredInvoiceList.length === this.selectedInvoiceItems.length &&
      this.selectedInvoiceItems.every(si =>
        this.filteredInvoiceList.some(di => di.uniqueId === si.uniqueId)
      )
    );
  }

  private async toggleSelectAll() {
    const { isSelectedAll } = this;
    const items = isSelectedAll ? [] : [...this.filteredInvoiceList];
    this.currentInvoice = isSelectedAll ? null : items[0].item;
    VuexServices.Payment.setSelectedInvoices(items.map(i => i.item));
  }

  private sortItemClick(val: string) {
    this.sortDialog.sortBy = val === this.sortDialog.sortBy ? "" : val;
    this.sortDialog.show = false;

    this.updateDisplayInvoice(true);
  }

  private get isNoInvoice() {
    return this.invoiceList.length === 0;
  }

  private get displayInvoiceBranches() {
    const { invoiceBranches, search } = this;
    const updateInvoiceBranches = invoiceBranches.map(el => {
      if (el.code === "PKT") {
        el.nameTh = "เซ็นทรัล ภูเก็ต ฟลอเรสต้า"
        el.nameEn = "Central Phuket Floresta"
      }
      if (el.code === "PK1") {
        el.nameTh = "เซ็นทรัลเฟสติวัล ภูเก็ต"
        el.nameEn = "Central Festival Phuket"
      }
      if (el.code === "CNT") {
        console.log(el)
      }
      return el
    })
    const dummy = search
      ? updateInvoiceBranches.filter(V => V.displayName.includes(search))
      : updateInvoiceBranches;
      
      dummy.sort(function(a, b) {
        const nameA = a.displayName.toUpperCase() // ignore upper and lowercase
        const nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
        if (!nameA) {
          return 1;
        }
        if (!nameB) {
            return -1;
        }
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
      });
      return dummy
  }

  private closeModal() {
    if (this.currentInvoice != null) {
      const selectedNow: InvoiceModel.Invoice[] = this.selectedInvoices;
      selectedNow.push(this.currentInvoice);
      VuexServices.Payment.setSelectedInvoices(selectedNow);
      this.isShowModal = false;
    }
  }

  private async confirmModal() {
    const emtyInvoices: InvoiceModel.Invoice[] = [];
    VuexServices.Payment.setSelectedInvoices(emtyInvoices);
    this.isShowModal = false;
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

class SortDialog {
  show = false;
  sortBy = "";

  get sortList() {
    const t = (key: string) => i18n.t("pages.payment." + key).toString();
    return [
      {
        label: t("sort_by_duedate"),
        value: SORT_TYPES.duedate_desc
      },
      {
        label: t("sort_by_store_name"),
        value: SORT_TYPES.store_name_desc
      },
      {
        label: t("sort_by_invoice_no"),
        value: SORT_TYPES.invoice_no_desc
      }
    ];
  }
}

class Invoicekey {
  key = ""
  invoices: InvoiceItem[] = []
  get invoicesSum() {
    if (this.invoices.length > 0) {
      return this.invoices.reduce(((sum, cur) => sum + cur.invoicePrice), 0)
    } else {
      return 0;
    }
  }
  balance = 0
}


