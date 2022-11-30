import crytoJS from "crypto-js"

export default {
    app_version: process.env.VUE_APP_APP_VERSION || "0.0.0",
    app_id: process.env.VUE_APP_APP_ID || "cpn_serve_web",
    app_secret: process.env.VUE_APP_APP_SECRET || "uZ8Ab1s5dBeknfJWrMgT7q82PG4KhraU",
    api_key_payment_gw: process.env.VUE_APP_API_KEY_PAYMENT_GW || "SHcoj8ZQXkV0pi4PV5Hn8EDXBTdQxN9W",
    local_storage_key: process.env.VUE_APP_STR_KEY || crytoJS.SHA1("VUE_APP_STR_KEY" + process.env.NODE_ENV + window.location.origin).toString(),
    call_center_phone: process.env.VUE_APP_CALL_CENTER_PHONE || "02-021-9999",
    policy_url: process.env.VUE_APP_POLICY_URL || "https://cpnserve.cpn.co.th/webservice/policy.html",
    privacy_policy_url: process.env.VUE_APP_PRIVACY_POLICY_URL || "https://www.centralpattana.co.th/th/sustainability/corporate-governance/privacy-policy",
    agreement_url: process.env.VUE_APP_AGREEMENT_URL || "https://www.centralpattana.co.th/th/sustainability/corporate-governance/privacy-policy",
    center_branch_code: process.env.VUE_APP_CENTER_BRANCH_CODE || "HOF",
    // center_branch_code: process.env.VUE_APP_CENTER_BRANCH_CODE || "CWT",
    app_name: "Central Pattana Serve",
    payment_authorization: process.env.VUE_APP_PAYMENT_AUTHORIZATION || "eyJjb250cmFjdElkIjoiMTIzNDU2Nzg5MCJ9",
    is_production: String(process.env.NODE_ENV).toLowerCase().trim() === "production",
    shop_sale_secret: process.env.VUE_APP_SHOP_SALE_SECRET || "gQs1fRzPSf8qJBcvvko4q2PssQkI15QI",
    shop_sale_api_key: process.env.VUE_APP_SHOP_SALE_API_KEY || "cny7T5NHsONM3jJNnkzQnaeB8nDHV9zZ",
    reward_associate_secret: process.env.VUE_APP_REWARD_ASSOCIATE_SECRET || "a18d0aa50539010164c5ab95ab9e70a65d4a8c67b60e4ed37ee96163dbdfe8dd76c44411a14cdbed5f5aa9ddd2f7d3eb77e835f0c87e3c0be97f41743d56e155",
    reward_associate_token: process.env.VUE_APP_REWARD_ASSOCIATE_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcmltbyIsImF1ZCI6IktiYW5rIiwia2V5IjoiYXNzb2NpYXRlIiwiYXNzb2NpYXRlIjoiS2JhbmsiLCJpYXQiOjE1MTYyMzkwMjJ9.ARdIYKaBFe8LpJvF9gj4B4YxyU7uaZr5kCaruvLMZ3E",
    reward_partner_code: process.env.VUE_APP_REWARD_PARTNER_CODE || "ATA",
    reward_branch_code: process.env.VUE_APP_REWARD_BRANCH_CODE || "000001"
}
