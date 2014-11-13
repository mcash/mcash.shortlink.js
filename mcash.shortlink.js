(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
                return (root.mCASH = factory());
        });
    } else {
        // Browser globals
        root.mCASH = factory();
    }
}(this, function () {

    var MCASH_FALLBACK_DOWNLOAD_URL = "https://itunes.apple.com/no/app/mcash/id550136730?mt=8",
        MCASH_FALLBACK_DOWNLOAD_URL_ANDROID = "market://details?id=no.mcash",
        MCASH_QR_ENDPOINT = "https://api.mca.sh/shortlink/v1/qr_image/",
        MCASH_STATIC_PREFIX = "http://api.mca.sh/sdk/v1",
        MCASH_BUTTON_URL = "assets/images/mCASH_logo_symbol.png",
        IS_INSIDE_MCASH = false,
        MCASH_LOCALE_MAP = {
            no: "Betal med mCASH",
            en: "Pay with mCASH"
        },
        MCASH_DESKTOP_IOS = "https://itunes.apple.com/no/app/mcash/id550136730?mt=8",
        MCASH_DESKTOP_ANDROID = 'https://play.google.com/store/apps/details?id=no.mcash';

    function mCASHShortlink_CanOpen(result) {
        if (result["canopen"] == "mcash:") {
            IS_INSIDE_MCASH = true;
        }
    }

    function mCASHInit() {
        document.location = "canopen://mCASHShortlink_CanOpen?mcash:";
    };

    var exports = {};

    exports.scan = function(shortlinkUrl) {
    	var embedded_shortlink = "mcash://qr?code=" + shortlinkUrl;
        //Open the app, if installed

        if (navigator.userAgent.match(/Android|Dalvik/)) {
            location.href = shortlinkUrl;
        } else {
            location.href = embedded_shortlink;
            if (!IS_INSIDE_MCASH) {
                setTimeout(function() {
                    location.href = MCASH_FALLBACK_DOWNLOAD_URL;
                }, 300);
            }
        }
    }

    exports.platformHasNativeSupport = function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod|Android|Dalvik/);
    };

    exports.createmCASHButton = function(id, argstring) {
        var shortlinkUrl,
            mCASHButton,
            mCASHDiv,
            labelKey,
            greeting,
            span,
            mCASHPayImg,
            cssTag,
            headTag,
            cssId = "shortlinkcss";

        argstring = argstring || '';
        shortlinkUrl = 'http://mca.sh/s/' + id + '/' + argstring;

        //Load css if not already loaded
        if (!document.getElementById(cssId)) {
            cssTag = document.createElement("link");
            cssTag.rel = "stylesheet";
            cssTag.id = cssId;
            cssTag.type = "text/css";
            //cssTag.href = MCASH_STATIC_PREFIX + "/shortlink.min.css";
            cssTag.href = "assets/css/button.css";
            if (document.getElementsByTagName("head")[0]) {
                document.getElementsByTagName("head")[0].appendChild(cssTag);
            } else {
                headTag = document.createElement("head");
                headTag.appendChild(cssTag);
                document.body.appendChild(headTag);
            }
        }

        mCASHButton = document.createElement("button");
        mCASHDiv = document.getElementById("mcashShortlink");
        if (mCASHDiv) {
            labelKey = mCASHDiv.getAttribute("data-mcash-lang");

        } else {
            labelKey = "en";
        }
        greeting = MCASH_LOCALE_MAP[labelKey] || MCASH_LOCALE_MAP["no"];
        span = document.createElement("span");
        span.className = "label";
        span.innerHTML = greeting;

        mCASHButton.type = "button";
        mCASHButton.className = "paywithmcash";
        mCASHButton.onclick = function() {
            exports.scan(shortlinkUrl);
        };
        mCASHPayImg = document.createElement("img");
        mCASHPayImg.class = "paywithmcash";
        mCASHPayImg.src = MCASH_BUTTON_URL;
        mCASHButton.appendChild(mCASHPayImg);
        mCASHButton.appendChild(span);
        return mCASHButton;
    };

    exports.createQRcode = function(id, argstring) {
        var qrCssTag,
            headTag,
            qrCssId = "qrcss";

        var qrCode = document.createElement("img");
        argstring = argstring || '';
        qrImageUrl = MCASH_QR_ENDPOINT + id + '/' + argstring;
        qrCode.src = qrImageUrl;
        qrCode.className = "mcash-qr-image";

        //Load css if not already loaded
        if (!document.getElementById(qrCssId)) {
            qrCssTag = document.createElement("link");
            qrCssTag.rel = "stylesheet";
            qrCssTag.id = qrCssId;
            qrCssTag.type = "text/css";
            //qrCssTag.href = MCASH_STATIC_PREFIX + "/shortlink.min.css";
            qrCssTag.href = "assets/css/qr.css";
            if (document.getElementsByTagName("head")[0]) {
                document.getElementsByTagName("head")[0].appendChild(qrCssTag);
            } else {
                headTag = document.createElement("head");
                headTag.appendChild(qrCssTag);
                document.body.appendChild(headTag);
            }
        }

        // Create the bottom navigation
        var qr = document.getElementById('mcash-qr'), 
            nav = document.createElement('div');
            nav.setAttribute('id', 'mcash-nav');
            qr.appendChild(nav);

        // Create logo and download links
        var brand = document.getElementById('mcash-nav'), 
            logo = document.createElement('img'), 
            iOS = document.createElement('a'), 
            Android = document.createElement('a');

            logo.setAttribute('src', 'assets/images/mCASH_logo.png');
            logo.setAttribute('class', 'mcash-logo');

            iOS.setAttribute('id', 'iOSbadge');
            iOS.setAttribute('href', MCASH_DESKTOP_IOS);
            iOS.setAttribute('class', 'mcash-link');
            iOS.setAttribute('target', '_blank');
            iOS.innerHTML = 'iOS';

            Android.setAttribute('id', 'AndroidBadge');
            Android.setAttribute('href', MCASH_DESKTOP_ANDROID);
            Android.setAttribute('class', 'mcash-link');
            Android.setAttribute('target', '_blank');
            Android.innerHTML = 'Android';

            brand.appendChild(logo);
            brand.appendChild(Android);
            brand.appendChild(iOS);

        return qrCode;
    };

    exports.displayQRorButton = function() {
        var i,
            id,
            argstring,
            mCASHDiv,
            mCASHDivs,
            mCASHButton,
            qrCode;

        mCASHDivs = document.getElementsByClassName("mcashShortlink");

        for (i = 0; i < mCASHDivs.length; i++) {
            mCASHDiv = mCASHDivs[i];
            id = mCASHDiv.getAttribute("data-shortlink-id")
            argstring = mCASHDiv.getAttribute("data-shortlink-argstring") || '';
            if (exports.platformHasNativeSupport()) {
                mCASHButton = exports.createmCASHButton(id, argstring);
                mCASHDiv.appendChild(mCASHButton);
            } else {
                qrCode = exports.createQRcode(id, argstring);
                mCASHDiv.appendChild(qrCode);
            }
        }
    };

    return exports;
}));
