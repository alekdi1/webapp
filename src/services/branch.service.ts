import { BranchModel, MaintainanceModel } from "@/models";
import { Endpoints, App } from "@/config";
import ApiClient from "@/modules/api";
import { User } from "@/models/user";

export const BRANCH_TYPES = {
  head_office: "head_office"
};

export const CENTER_BRANCH_CODE = App.center_branch_code;

export function isHeadOffice(b: BranchModel.Branch) {
  return b.code === CENTER_BRANCH_CODE;
}

export function filterNoneHeadOffice(branches: BranchModel.Branch[]) {
  return branches.filter(b => !["HOF", "HOF1", "HOF2"].includes(b.code));
}

export function filterQRBranch(user: User) {
  return filterNoneHeadOffice(user.branchList).filter(b =>
    user.allowedBranchIds.some(bid => String(bid) === String(b.id))
  );
}

export async function getBranchList(ids: string[] = []) {
  try {
    const { url, method } = Endpoints.getBranchesAllName;
    let qs = "?";
    if (ids.length > 0) {
      qs += `branch_code=${ids.join(",")}&`;
    }

    qs += "is_active=1";

    const rs = await ApiClient.request({
      method,
      url: url + qs
    });

    const { data } = rs;
    if (window.location.pathname === "/register") {
      return Array.isArray(data) ? data.map(b => mapServiceBranch(b)) : [];
    } else {
      const branchList = Array.isArray(data) ? data.map(b => mapServiceBranch(b)).filter(el => el.code !== "HOF1" && el.code !== "HOF2") : [];
      // const branchListMaster = Array.isArray(data) ? data.map(b => mapServiceBranch(b)) : [];
      const BEBranchList = checkDisplayBranchName(branchList);
      return BEBranchList;
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function getBranchAllNameList(ids: string[] = []) {
  try {
    const { url, method } = Endpoints.getBranchesAllName;
    let qs = "?";
    if (ids.length > 0) {
      qs += `branch_code=${ids.join(",")}&`;
    }

    qs += "is_active=1";

    const rs = await ApiClient.request({
      method,
      url: url + qs
    });

    const { data } = rs;
    if (window.location.pathname === "/register") {
      return Array.isArray(data) ? data.map(b => mapServiceBranch(b)) : [];
    } else {
      const branchList = Array.isArray(data) ? data.map(b => mapServiceBranch(b)).filter(el => el.code !== "HOF1" && el.code !== "HOF2") : [];
      // const branchListMaster = Array.isArray(data) ? data.map(b => mapServiceBranch(b)) : [];
      const BEBranchList = checkDisplayBranchName(branchList);
      return BEBranchList;
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

/** id or ids with comma in string format e.g. ctw or CTW,icy */
export async function getBranchIds(branchCode?: string) {
  const { method, url } = Endpoints.getBranchIds;

  try {
    const resp = await ApiClient.request({
      method: method,
      url: branchCode ? `${url}?branch_code=${branchCode}` : url
    });

    if (resp.status === "Success") {
      const { data } = resp;
      const barnchResult = Array.isArray(data) ? data.map(b => mapServiceBranch(b)) : [];
      return checkDisplayBranchName(barnchResult);
      // return barnchResult
    }
    return Promise.reject(new Error("Get branch id error"));
  } catch (e) {
    return Promise.reject(e);
  }
}

function mapServiceBranch(d: any = {}) {
  const b = new BranchModel.Branch();
  b.id = d.id;
  b.code = d.branch_code;
  b.nameTh = d.branch_name_th || d.branch_name || "";
  b.nameEn = d.branch_name_en || d.branch_name || "";
  b.active = d.is_active === 1;
  b.directory = d.directory || "";
  b.phone = d.tel || "";
  b.fullAddress = d.address || "";
  b.file = d.file || "";
  b.information = d.information || "";
  b.officeHours = d.office_hours || "";

  return b;
}

function checkDisplayBranchName(branchs: BranchModel.Branch[]) {
  const scores = new Map<string, string>();
  scores.set("AYY", "AYY")
  scores.set("BNA", "BNA")
  scores.set("BNT", "BNA")
  scores.set("CBR", "CBR")
  scores.set("CMA", "CMA")
  scores.set("CMI", "CMI")
  scores.set("CRI", "CRI")
  scores.set("CTW", "CTW")
  scores.set("CWG", "CWG")
  scores.set("CNT", "CWN")
  scores.set("CWN", "CWN")
  scores.set("CWT", "CWT")
  scores.set("HOF", "HOF")
  scores.set("HYI", "HYI")
  scores.set("KKN", "KKN")
  scores.set("LPG", "LPG")
  scores.set("LPO", "LPO")
  scores.set("LPT", "LPO")
  scores.set("MHC", "MHC")
  scores.set("NKM", "NKM")
  scores.set("NKR", "NKR")
  scores.set("PDT", "PDT")
  // scores.set("PKT", "PK2")
  scores.set("PKA", "PKO")
  scores.set("PKB", "PKO")
  scores.set("PKO", "PKO")
  // scores.set("PK1", "PKT")
  scores.set("PNL", "PNL")
  scores.set("PTB", "PTB")
  scores.set("PTC", "PTC")
  scores.set("RID", "RID")
  scores.set("RM2", "RM2")
  scores.set("RM3", "RM3")
  scores.set("R9T", "RM9")
  scores.set("RM9", "RM9")
  scores.set("RTB", "RTB")
  scores.set("RYG", "RYG")
  scores.set("SLY", "SLY")
  scores.set("SMI", "SMI")
  scores.set("SRC", "SRC")
  scores.set("SRT", "SRT")
  scores.set("SVB", "SVB")
  scores.set("UBN", "UBN")
  scores.set("UDN", "UDN")

  const BEMasterBranhc: BranchModel.Branch[] = [];

  for (const b of branchs) {
    let branch = new BranchModel.Branch();
    branch = b;
    if (scores.has(branch.code)) {
      const BEkeybranch = scores.get(branch.code)
      const BEbranch = branchs.find(x => x.code == BEkeybranch);
      if (BEbranch != undefined) {
        branch.nameEn = BEbranch.nameEn;
        branch.nameTh = BEbranch.nameTh;
      }
    }
    BEMasterBranhc.push(branch);
  }

  return BEMasterBranhc;
}

export async function getBranchByCode(id: string) {
  const bs = await getBranchList([id]);
  return bs.length > 0 ? bs[0] : null;
}

export async function getBranchById(id: string) {
  const { method, url } = Endpoints.getBranchById(id);

  try {
    const rs = await ApiClient.request({
      method,
      url
    });
    const { data } = rs;
    if (data) {
      return mapServiceBranch(data);
    }
    return Promise.reject(new Error(`Branch '${id}' not found`));
  } catch (e) {
    return Promise.reject(e);
  }
}

export function getCenterBranch() {
  return getBranchByCode(CENTER_BRANCH_CODE);
}

// Tenant id !== Tenant no
export async function getBPByTenantId(tenantId: string) {
  const { method, url } = Endpoints.getBPByTenantId;

  const headers = {
    authorization: "eyJjb250cmFjdElkIjoiMTIzNDU2Nzg5MCJ9"
  };

  try {
    const rs = await ApiClient.request({
      method,
      url: url + `?tenantID=${tenantId}`,
      headers
    });
    return mapBPByTenantId(rs);
  } catch (e) {
    return Promise.reject(e);
  }
}

function mapBPByTenantId(data: any) {
  const d = new MaintainanceModel.MaintenanceByTenantId();
  d.bpName = data.bPName;
  d.bpNo = data.bpNumber;
  return d;
}
