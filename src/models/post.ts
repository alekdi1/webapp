import moment from "moment"
import { UserCreator, UserUpdater } from "./user"
import { LanguageUtils } from "@/utils"

export class PostTypeCategories {
    /** id */
    id = 0

    /** code */
    code = ""

    /** name_th */
    nameTh = ""

    /** name_en */
    nameEn = ""
}

export class Post {
    /** id */
    id = ""

    /** title */
    title = ""

    /** youtube_link */
    videoLink = ""

    /** description */
    desc = ""

    /** detail */
    detail = ""

    /** start_date */
    startDate = ""

    /** end_date */
    endDate = ""

    /** file */
    image = ""

    file = ""

    /** is_active: 0, 1 */
    isActive = false

    /** is_favorite_by_user */
    isFavorited = false

    /** pin */
    pin = 0

    /** post_type_id */
    postTypeId = 0

    /** post_type_name */
    postTypeName = ""

    /** campaign_started  */
    hasCampaign = false

    /** users_accept_event */
    allAcceptedEventUsers: string[] = []

    /** category_id */
    catId = 0

    /** category_name */
    categoryName = ""

    /** category_code */
    categoryCode = ""

    /** branches */
    branches: string[] = []

    /** created_by */
    createdBy: UserCreator = new UserCreator()

    /** updated_by */
    updatedBy: UserUpdater = new UserUpdater()

    /** isReaded */
    isReaded = false

    /** notificationId */
    notificationId = 0

    get displayDateRange() {
        const displayDate = (dateStr: string) => {
            const md = moment(dateStr, "YYYY-MM-DD HH:mm:ss").locale(LanguageUtils.getCurrentLang())
            return LanguageUtils.lang(
                `${md.format("DD MMM")} ${String(md.year() + 543).substr(2)}`,
                md.format("DD MMM YY")
            )
        }

        return LanguageUtils.lang(
            `ตั้งแต่วันที่ ${displayDate(this.startDate)} - ${displayDate(this.endDate)}`,
            `Since ${displayDate(this.startDate)} - ${displayDate(this.endDate)}`
        )
    }

    get isExpired() {
        return this.endDate <= moment().format("YYYY-MM-DD HH:mm:ss")
    }
}

export class Notification {
    /** id */
    id = 0

    /** type */
    type = ""

    /** title */
    title = ""

    /** description */
    desc = ""

    /** reference_id */
    refId = 0

    /** published_by */
    publishedBy = 0

    /** created_at */
    createdDate = ""

    /** updated_at */
    updatedDate = ""

    /** branch_name */
    branchName = ""

    isRead = false
}

export class FavoritePostType {
    /** id */
    id = 0

    /** name */
    name = ""

    /** created_at */
    createdDate = ""

    /** updated_at */
    updatedDate = ""
}

export class FavoriteCategory {
    /** id */
    id = ""

    /** is_active: 0, 1 */
    isActive = false

    /** name_th */
    nameTh = ""

    /** name_en */
    nameEn = ""

    /** created_by */
    createdBy = 0

    /** updated_by */
    updatedBy = 0

    /** post_type_id */
    postTypeId = 0

    /** created_at */
    createdDate = ""

    /** updated_at */
    updatedDate = ""

    /** code */
    catCode = ""
}

export class FavoritePost {
    /** id */
    id = ""

    /** title */
    title = ""

    /** youtube_link */
    videoLink = ""

    /** description */
    desc = ""

    /** detail */
    detail = ""

    /** start_date */
    startDate = ""

    /** end_date */
    endDate = ""

    /** file */
    file = ""

    /** is_active: 0, 1 */
    isActive = false

    /** pin */
    pin = 0

    /** created_by */
    createdBy = 0

    /** updated_by */
    updatedBy = 0

    /** post_type_id */
    postTypeId = 0

    /** category_id */
    catId = 0

    /** created_at */
    createdDate = ""

    /** updated_at */
    updatedDate = ""

    /** post_type */
    postType = new FavoritePostType()

    /** category */
    category = new FavoriteCategory()
}

export class FavoriteGroup {
    /** group_code */
    code = ""

    /** group_name */
    name = ""

    /** posts_list */
    posts: FavoritePost[] = []
}
