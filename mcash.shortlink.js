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
        };

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
        // embedded_shortlink = "next:{\"type\": \"screen\", \"id\": \"identification\"}";
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

        var wrapperClass = document.getElementById('mcash-qr').classList;
        wrapperClass.remove('mcash-wrapper');

        // Remove the mCASH wrapper
        var mcashWrapper = document.getElementById("mcash-nav");
        mcashWrapper.remove();

        //Load css if not already loaded
        if (!document.getElementById(cssId)) {
            cssTag = document.createElement("link");
            cssTag.rel = "stylesheet";
            cssTag.id = cssId;
            cssTag.type = "text/css";
            cssTag.href = MCASH_STATIC_PREFIX + "/shortlink.min.css";
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
        var qrCode = document.createElement("img");
        argstring = argstring || '';
        qrImageUrl = MCASH_QR_ENDPOINT + id + '/' + argstring;
        qrCode.src = qrImageUrl;
        qrCode.className = "mcash-qr-image";
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
