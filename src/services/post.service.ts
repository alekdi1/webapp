import { PostModel, UserModel } from "@/models"
import { Endpoints } from "@/config"
import * as VXS from "./vuex.service"
import ApiClient from "@/modules/api"
import { LanguageUtils } from "@/utils"

export const POST_CATEGORY_NAMES = {
    faqs: "faqs",
    news: "news",
    pop_up: "pop_up",
    branch_info: "branch_info",
    branch_annonuce: "branch_annonuce"
}

export const POST_NEWS_SUB_CATEGORY_NAMES = {
    insight: "insight",
    promotion: "promotion",
    news_event: "news_event"
}

function getPostListQuery(opts: any = {}) {

    let query = "?"

    if (opts["postType"]) {
        query = query + `post_type=${opts["postType"]}&`
    }

    if (opts["branch"] == "") {
        query = query + `filter_branch=${opts["branch"] == "" ? "0" : opts["branch"]}&`
    } else {
        query = query + `filter_branch=${opts["branch"]}&`
    }

    if (opts["category"]) {
        query = query + `filter_category=${opts["category"]}&`
    }

    if (opts["postId"]) {
        query = query + `post_id=${opts["postId"]}&`
    }

    if (opts["pageSize"]) {
        query = query + `page_size=${opts["pageSize"]}&`
    }

    if (opts["sortBy"]) {
        query = query + `sort_by=${opts["sortBy"]}&`
    }

    if (opts["sortOpt"]) {
        query = query + `sort_option=${opts["sortOpt"]}&`
    }

    if (opts["active"]) {
        query = query + `is_active=${opts["active"]}&`
    }

    if (opts["userId"]) {
        query = query + `user_id=${opts["userId"]}`
    }

    if (opts["read"]) {
        query = query + `read=${opts["read"]}`
    }

    if (opts["bpNumber"]) {
        query = query + `bp_number=${opts["bpNumber"]}`
    }

    return opts ? query.replace(/&*$/, "") : ""
}

export async function getPosts(opts: any = {}) {
    const { method, url } = Endpoints.getPost
    const query = getPostListQuery(opts)

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + query,
        })
        if (resp.status === "Success") {
            const items: PostModel.Post[] = resp.data.items.map((p: any) => mapPost(p))
            resp.items = items
            return items
        }
        return Promise.reject(new Error("Get post list error"))
    } catch (e) {
        return Promise.reject(new Error("Get post list error"))
    }
}

export async function getPostsGuest(opts: any = {}) {
    const { method, url } = Endpoints.getPostGuest
    const query = getPostListQuery(opts)
    console.log(url)

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + query,
        })
        if (resp.status === "Success") {
            const items: PostModel.Post[] = resp.data.items.map((p: any) => mapPost(p))
            resp.items = items
            return items
        }
        return Promise.reject(new Error("Get post list error"))
    } catch (e) {
        return Promise.reject(new Error("Get post list error"))
    }
}

export async function getPostById(postId: string, userId?: string) {
    const { method, url } = Endpoints.getPost

    let query = `/${postId}`

    if (userId) {
        query = query + `?user_id=${userId}&is_active=1`
    }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + query,
        })

        const { status, data } = resp
        if (status === "Success") {
            if (data) {
                return mapPost(resp.data)
            }
            return null
        }
        return Promise.reject(LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired."))
    } catch (e) {
        return Promise.reject(LanguageUtils.lang("ขออภัย รายการที่คุณเลือกหมดเขตแล้ว", "Sorry, the item you selected has expired."))
    }
}

export async function getCategories(postId?: number) {
    const { method, url } = Endpoints.getCategories

    let params = ""

    if (postId) {
        params = `?post_type_id=${postId}`
    }

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + params,
        })

        if (resp.status === "Success") {
            const { data } = resp
            return Array.isArray(data) ? data.map(i => mapCategory(i)) : []
        }
        return Promise.reject(new Error("Get all catgories fail"))
    } catch (e) {
        return Promise.reject(new Error("Get all catgories fail"))
    }
}

export async function submitJoinEvent(postId: number) {
    const { method, url } = Endpoints.submitJoinEvent
    const body = {
        post_id: postId
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: body
        })
    } catch (e) {
        return Promise.reject(new Error("Failed to join this event"))
    }
}

export function mapCategory(d: any = {}) {
    const cat = new PostModel.PostTypeCategories()
    cat.id = d.id
    cat.code = d.code
    cat.nameTh = d.name_th
    cat.nameEn = d.name_en
    return cat
}

export function mapCreator(d: any = {}) {
    const uc = new UserModel.UserCreator()
    uc.id = d.id
    uc.firstName = d.first_name
    uc.lastName = d.last_name
    uc.createdAt = d.created_at
    return uc
}

export function mapUpdater(d: any = {}) {
    const ut = new UserModel.UserUpdater()
    ut.id = d.id
    ut.firstName = d.first_name
    ut.lastName = d.last_name
    ut.updatedAt = d.updated_at
    return ut
}

export function mapPost(d: any = {}) {
    const p = new PostModel.Post()
    p.id = d.id
    p.title = d.title
    p.videoLink = d.youtube_link
    p.desc = d.description
    p.detail = d.detail
    p.startDate = d.start_date
    p.endDate = d.end_date
    p.image = d.file
    p.file = d.file || ""
    p.isActive = d.is_active === 1
    p.isFavorited = d.is_favorite_by_user || false
    p.pin = d.pin
    p.postTypeId = d.post_type_id
    p.postTypeName = d.post_type_name || ""
    p.hasCampaign = d.campaign_started === 1
    p.allAcceptedEventUsers = Array.isArray(d.users_accept_event) ? d.users_accept_event : [] || []
    p.catId = d.category_id
    p.categoryName = d.category_name || ""
    p.categoryCode = d.category_code || ""
    p.branches = Array.isArray(d.branches) ? d.branches : [] || []
    p.isReaded = d.read == 1 ? true : false
    p.notificationId = d.notificationId || 0

    p.createdBy = mapCreator(d.created_by)

    p.updatedBy = mapUpdater(d.updated_by)

    return p
}

export async function getFAQs() {
    const config = VXS.Root.getAppConfig()
    const user = VXS.Root.getUser()

    const faqConfig = config.postType.find(p => p.name === POST_CATEGORY_NAMES.faqs)

    if (!faqConfig) {
        throw new Error("No FAQ config")
    }

    if (!user) {
        throw new Error("No user")
    }

    const query = {
        postType: faqConfig.id,
        branch: user.allowedBranchIds.join(",")
    }
    const faqs = await getPosts(query)

    return faqs
}

function mapFavoritePostType(d: any = {}) {
    const t = new PostModel.FavoritePostType()
    t.id = d.id
    t.name = d.name
    t.createdDate = d.created_at
    t.updatedDate = d.updated_at
    return t
}

function mapFavoriteCategory(d: any = {}) {
    const c = new PostModel.FavoriteCategory()
    c.id = d.id
    c.isActive = d.is_active === 1
    c.nameTh = d.name_th
    c.nameEn = d.name_en
    c.createdBy = d.created_by
    c.updatedBy = d.updated_by
    c.postTypeId = d.post_type_id
    c.createdDate = d.created_at
    c.updatedDate = d.updated_at
    c.catCode = d.code
    return c
}

function mapFavoritePost(d: any = {}) {
    const p = new PostModel.FavoritePost()
    p.id = d.id
    p.title = d.title
    p.videoLink = d.youtube_link
    p.desc = d.description
    p.detail = d.detail
    p.startDate = d.start_date
    p.endDate = d.end_date
    p.file = d.file
    p.isActive = d.is_active === 1
    p.pin = d.pin
    p.createdBy = d.created_by
    p.updatedBy = d.updated_by
    p.postTypeId = d.post_type_id
    p.catId = d.category_id
    p.createdDate = d.created_at
    p.updatedDate = d.updated_at
    p.postType = mapFavoritePostType(d.post_type)
    p.category = mapFavoriteCategory(d.category)
    return p
}

function mapFavoritePostGroup(d: any = {}) {
    const g = new PostModel.FavoriteGroup()
    g.code = d.group_code
    g.name = d.group_name
    const l = d.posts_list
    g.posts = Array.isArray(l) ? l.map(p => mapFavoritePost(p)) : []
    return g
}

export async function getUserAllFavoritePost() {
    const { method, url } = Endpoints.getUserFavoritePostByGroup

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url
        })

        if (resp.status === "Success") {
            const { data } = resp
            return Array.isArray(data) ? data.map(i => mapFavoritePostGroup(i)) : []
        }
        return Promise.reject(new Error("Get user favorite by group failed"))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function getFavoritePostById(id: string) {
    const { method, url } = Endpoints.getUserFavoritePost

    try {
        const resp = await ApiClient.request({
            method: method,
            url: url.replace(":post_id", id)
        })
        if (resp.status === "Success") {
            return mapFavoritePostGroup(resp.data)
        }
        return Promise.reject(new Error("Get user favorite by id failed"))
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function deleteFavoritePost(id: string) {
    const { method, url } = Endpoints.deleteUserFavoritePost

    try {
        await ApiClient.request({
            method: method,
            url: url.replace(":post_id", id)
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export async function addFavoritePost(postId: string) {
    const { method, url } = Endpoints.addUserFavoritePost

    const body = {
        "post_id": postId
    }

    try {
        await ApiClient.request({
            method: method,
            url: url,
            data: body
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}

export function getFavoritePostFromGroups(groups: PostModel.FavoriteGroup[]) {
    return groups.map(i => i.posts).flat()
}

export function updatePostIsReaded(postId: number) {
    const { method, url } = Endpoints.updatePostIsReaded
    const body = {
        post_id: postId
    }
    try {
        ApiClient.request({
            method: method,
            url: url,
            data: body
        })
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}
export async function getPostDescUnReaded(categoryid: number) {
    const { method, url } = Endpoints.getPostDescUnReaded
    try {
        const resp = await ApiClient.request({
            method: method,
            url: url + "?categoryid=" + categoryid
        })
        if (resp.status === "Success") {
            if (resp.data.length > 0) {
                return mapPost(resp.data[0])
            }
            return null
        }
    } catch (e) {
        return Promise.reject(new Error(e))
    }
}
