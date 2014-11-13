(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            root.mCASH = factory();
            return root.mCASH;
        });
    } else {
        // Browser globals
        root.mCASH = factory();
    }
}(this, function () {
    'use strict';

    var MCASH_FALLBACK_DOWNLOAD_URL = "https://itunes.apple.com/no/app/mcash/id550136730?mt=8",
        MCASH_FALLBACK_DOWNLOAD_URL_ANDROID = "market://details?id=no.mcash",
        MCASH_QR_ENDPOINT = "https://api.mca.sh/shortlink/v1/qr_image/",
        MCASH_STATIC_PREFIX = "http://api.mca.sh/sdk/v1/",
        MCASH_BUTTON_URL = "assets/images/mCASH_logo_symbol.png",
        MCASH_LOGO = 'assets/images/mCASH_logo.png',
        MCASH_BUTTON_CSS = "assets/css/button.css",
        MCASH_QR_CSS = "assets/css/qr.css",
        IS_INSIDE_MCASH = false,
        MCASH_LOCALE_MAP = {
            no: "Betal med mCASH",
            en: "Pay with mCASH"
        },
        MCASH_DESKTOP_IOS = "https://itunes.apple.com/no/app/mcash/id550136730?mt=8",
        MCASH_DESKTOP_ANDROID = 'https://play.google.com/store/apps/details?id=no.mcash',

        mCASHShortlink_CanOpen = function (result) {
            if (result.canopen === "mcash:") {
                IS_INSIDE_MCASH = true;
            }
        },

        mCASHInit = function () {
            document.location = "canopen://mCASHShortlink_CanOpen?mcash:";
        },

        exports = {};

    exports.scan = function (shortlinkUrl) {
        var embedded_shortlink = "mcash://qr?code=" + shortlinkUrl;
        //Open the app, if installed

        if (navigator.userAgent.match(/Android|Dalvik/)) {
            location.href = shortlinkUrl;
        } else {
            location.href = embedded_shortlink;
            if (!IS_INSIDE_MCASH) {
                setTimeout(function () {
                    location.href = MCASH_FALLBACK_DOWNLOAD_URL;
                }, 300);
            }
        }
    };

    exports.platformHasNativeSupport = function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod|Android|Dalvik/);
    };

    exports.createmCASHButton = function (id, argstring) {
        var mCASHDiv = document.getElementById("mcashShortlink"),
            labelKey = mCASHDiv ? mCASHDiv.getAttribute("data-mcash-lang") : 'en',
            greeting = MCASH_LOCALE_MAP[labelKey] || MCASH_LOCALE_MAP.no,
            cssId = "shortlinkcss",
            shortlinkUrl = 'http://mca.sh/s/' + id + '/' + (argstring || ''),
            span,
            mCASHPayImg,
            mCASHButton,
            cssTag,
            headTag;

        //Load css for the button
        if (!document.getElementById(cssId)) {
            cssTag = document.createElement("link");
            cssTag.rel = "stylesheet";
            cssTag.id = cssId;
            cssTag.type = "text/css";
            cssTag.href = MCASH_STATIC_PREFIX + MCASH_BUTTON_CSS;
            if (document.getElementsByTagName("head")[0]) {
                document.getElementsByTagName("head")[0].appendChild(cssTag);
            } else {
                headTag = document.createElement("head");
                headTag.appendChild(cssTag);
                document.body.appendChild(headTag);
            }
        }

        mCASHButton = document.createElement("button");
        span = document.createElement("span");

        span.className = "label";
        span.innerHTML = greeting;

        mCASHButton.type = "button";
        mCASHButton.className = "paywithmcash";
        mCASHButton.onclick = function () {
            exports.scan(shortlinkUrl);
        };

        mCASHPayImg = document.createElement("img");
        mCASHPayImg.class = "paywithmcash";
        mCASHPayImg.src = MCASH_STATIC_PREFIX + MCASH_BUTTON_URL;
        mCASHButton.appendChild(mCASHPayImg);
        mCASHButton.appendChild(span);
        return mCASHButton;
    };

    exports.createQRcode = function (id, argstring) {
        var qr = document.getElementById('mcash-qr'),
            qrCssId = "qrcss",
            qrImageUrl = MCASH_QR_ENDPOINT + id + '/' + (argstring || ''),
            Android,
            brand,
            headTag,
            iOS,
            logo,
            nav,
            qrCode,
            qrCssTag;

        qrCode = document.createElement("img");
        qrCode.src = qrImageUrl;
        qrCode.className = "mcash-qr-image";

        // Load css for the QR
        if (!document.getElementById(qrCssId)) {
            if (document.getElementsByTagName("head")[0]) {
                qrCssTag = document.createElement("link");
                qrCssTag.rel = "stylesheet";
                qrCssTag.id = qrCssId;
                qrCssTag.type = "text/css";
                qrCssTag.href = MCASH_STATIC_PREFIX + MCASH_QR_CSS;
                document.getElementsByTagName("head")[0].appendChild(qrCssTag);
            } else {
                headTag = document.createElement("head");
                headTag.appendChild(qrCssTag);
                document.body.appendChild(headTag);
            }
        }

        // Create the bottom navigation
        nav = document.createElement('div');
        nav.setAttribute('id', 'mcash-nav');
        qr.appendChild(nav);

        // Create logo and download links
        logo = document.createElement('img');
        logo.setAttribute('src', MCASH_STATIC_PREFIX + MCASH_LOGO);
        logo.setAttribute('class', 'mcash-logo');

        iOS = document.createElement('a');
        iOS.setAttribute('href', MCASH_DESKTOP_IOS);
        iOS.setAttribute('class', 'mcash-link mcash-ios');
        iOS.setAttribute('target', '_blank');
        iOS.setAttribute('title', 'Download mCASH from App Store');
        iOS.innerHTML = 'iOS';

        Android = document.createElement('a');
        Android.setAttribute('href', MCASH_DESKTOP_ANDROID);
        Android.setAttribute('class', 'mcash-link mcash-android');
        Android.setAttribute('target', '_blank');
        Android.setAttribute('title', 'Download mCASH from Google Play');
        Android.innerHTML = 'Android';

        brand = document.getElementById('mcash-nav');
        brand.appendChild(logo);
        brand.appendChild(Android);
        brand.appendChild(iOS);

        return qrCode;
    };

    exports.displayQRorButton = function () {
        var mCASHDivs = document.getElementsByClassName("mcashShortlink"),
            argstring,
            i,
            id,
            mCASHButton,
            mCASHDiv,
            qrCode,
            static_prefix;


        for (i = 0; i < mCASHDivs.length; i++) {
            mCASHDiv = mCASHDivs[i];
            id = mCASHDiv.getAttribute("data-shortlink-id");
            argstring = mCASHDiv.getAttribute("data-shortlink-argstring") || '';
            static_prefix = mCASHDiv.getAttribute("data-static-prefix") || '';

            if (static_prefix) {
                MCASH_STATIC_PREFIX = static_prefix;
            }

            if (exports.platformHasNativeSupport()) {
                mCASHButton = exports.createmCASHButton(id, argstring, static_prefix);
                mCASHDiv.appendChild(mCASHButton);
            } else {
                qrCode = exports.createQRcode(id, argstring);
                mCASHDiv.appendChild(qrCode);
            }
        }
    };

    return exports;
}));
