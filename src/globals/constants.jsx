let baseUrl = import.meta.env.BASE_URL || '/'
if (!baseUrl.startsWith('/')) {
  baseUrl = '/'
}
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1)
}
export const default_skin = "6"

export const popupType = {
    DELETE: "DELETE",
    LOGOUT: "LOGOUT"
}

export const formType = {
    LOGIN_CANDIDATE: "LOGIN_CANDIDATE",
    LOGIN_EMPLOYER: "LOGIN_EMPLOYER"
}

export const blogCopy = {
  en: {
    blog: "Blog",
    homeBlog: "Home - Blog",
    blogDetail: "Blog detail",
    homeBlogDetail: "Home - Blog detail",
    recentArticles: "Recent Articles",
    noOtherArticles: "No other articles yet.",
    tags: "Tags",
    backToAllBlogs: "Back to all blogs",
    share: "Share"
  },
  ar: {
    blog: "المدونة",
    homeBlog: "الرئيسية - المدونة",
    blogDetail: "تفاصيل المقال",
    homeBlogDetail: "الرئيسية - تفاصيل المقال",
    recentArticles: "أحدث المقالات",
    noOtherArticles: "لا توجد مقالات أخرى حالياً.",
    tags: "الوسوم",
    backToAllBlogs: "العودة إلى جميع المقالات",
    share: "مشاركة"
  },
  am: {
    blog: "ብሎግ",
    homeBlog: "መነሻ - ብሎግ",
    blogDetail: "የብሎግ ዝርዝር",
    homeBlogDetail: "መነሻ - የብሎግ ዝርዝር",
    recentArticles: "አዳዲስ ጽሁፎች",
    noOtherArticles: "እስከ አሁን ምንም ሌሎች ጽሁፎች የሉም።",
    tags: "መለያዎች",
    backToAllBlogs: "ወደ ሁሉም ብሎጎች ተመለስ",
    share: "አጋራ"
  }
};

export function publicUrlFor(path) {
    const url = baseUrl + "/assets/" + path;
    return url.startsWith('/') ? url : '/' + url;
}

export function loadScript(src, fromPublic) {

    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');

        script.src = (
            fromPublic === undefined ||
            fromPublic == null ||
            fromPublic
        ) ? publicUrlFor(src) : src;

        script.addEventListener('load', function () {
            resolve();
        });
        script.addEventListener('error', function (e) {
            reject(e);
        });
        document.body.appendChild(script);
        document.body.removeChild(script);
    })
};

export function setMenuActive(currentpath, path) {
    return (currentpath === path) ? "active": "";
}

export function applyDefaultSkinStyle() {
    updateSkinStyle(default_skin, true, false);
}

export function updateSkinStyle(skin, headerLogoLight, footerLogoLight) {
    var _skin_style = document.getElementById("skin_style");
    var _skin_header_logo = document.getElementById("skin_header_logo");
    var _skin_header_logo_light = document.getElementById("skin_header_logo_light");
    var _skin_footer_dark_logo = document.getElementById("skin_footer_dark_logo");
    var _skin_footer_light_logo = document.getElementById("skin_footer_light_logo");
    var _skin_page_logo = document.getElementById("skin_page_logo");
    var _skin_maintain_logo = document.getElementById("skin_maintain_logo");
    var _skin_header_inner_logo_12 = document.getElementById("skin_header_inner_logo_12");
    var _skin_header_inner_logo_15 = document.getElementById("skin_header_inner_logo_15");
    const _logo = publicUrlFor('images/logo-dark.png');
    const _logo_light = publicUrlFor('images/logo-dark.png');
    const _logo_white = publicUrlFor('images/logo-dark.png');

    if (_skin_style)
        _skin_style.href = publicUrlFor('css/skins-type/skin-' + skin + '.css');

    if (_skin_header_logo)
        _skin_header_logo.src = _logo;

    if (_skin_header_logo_light) // initially light, on switcher change => it should change
        _skin_header_logo_light.src = _logo_light;

    if (_skin_footer_dark_logo)
        _skin_footer_dark_logo.src = _logo;

    if (_skin_footer_light_logo)
        _skin_footer_light_logo.src = _logo;

    if (_skin_page_logo)
        _skin_page_logo.src = _logo;

    if (_skin_maintain_logo)
        _skin_maintain_logo.src = _logo;

    if (_skin_header_inner_logo_12)
        _skin_header_inner_logo_12.src = _logo;

    if (_skin_header_inner_logo_15)
        _skin_header_inner_logo_15.src = _logo;
}
