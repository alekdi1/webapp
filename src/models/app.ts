export class PostType {
    /** id */
    id = 0

    /** name */
    name = ""
}

export class NotificationConfig {
    types: {[x: string]: string} = {}
}

export class LeavePageConfig {
    id = 0
    menu = ""
    active = false

    /** time in minutes */
    time = 0
}

export class The1Biz {
    earnRateBaht = 25
    earnRatePoint = 1
    redeemRatePoint = 8
    redeemRateBaht = 1
}

export class AppConfig {
    payment = {
        unionPayFeePercent: 0,
        otherPayFeePercent: 0
    }

    postType: PostType[] = []
    notification = new NotificationConfig()
    leavePages: LeavePageConfig[] = []
    userPagePermissions: {[menu: string]: boolean} = {}
    this1Biz = new The1Biz()
}
