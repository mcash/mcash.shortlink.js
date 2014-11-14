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

    var MCASH_FALLBACK_DOWNLOAD_URL = 'https://itunes.apple.com/no/app/mcash/id550136730?mt=8',
        MCASH_QR_ENDPOINT = 'https://api.mca.sh/shortlink/v1/qr_image/',
        MCASH_SHORTLINK_ENDPOINT = 'http://mca.sh/s/',
        MCASH_LOGO = 'assets/images/mCASH_logo.png',
        MCASH_LOGO_ALTERNATE = 'assets/images/mCASH_logo_white.png',
        MCASH_BUTTON_CSS = 'assets/css/button.css',
        MCASH_QR_CSS = 'assets/css/qr.css',
        IS_INSIDE_MCASH = false,
        MCASH_LOCALE_MAP = {
            no: 'Betal med',
            en: 'Pay with'
        },
        MCASH_DESKTOP_IOS = 'https://itunes.apple.com/no/app/mcash/id550136730?mt=8',
        MCASH_DESKTOP_ANDROID = 'https://play.google.com/store/apps/details?id=no.mcash',

        platformHasNativeSupport = function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod|Android|Dalvik/);
        },

        getPrefix = function () {
            var parser,
                match,
                i;

            for (i = 0; i < document.scripts.length; i++) {
                match = document.scripts[i].src && document.scripts[i].src.match(/^(.*)mcash\.shortlink\.js$/);
                if (match && match[1]) {
                    parser = document.createElement('a');
                    parser.href = match[1];
                    return parser.pathname;
                }
            }
            return '/';
        },

        scan = function (shortlinkUrl) {
            var embedded_shortlink = 'mcash://qr?code=' + shortlinkUrl;
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
        },

        loadCSS = function (cssId, href) {
            if (!document.getElementById(cssId)) {
                var headTag = document.getElementsByTagName('head'),
                    cssTag = document.createElement('link');

                if (!headTag) {
                    headTag = [document.createElement('head')];
                    document.body.appendChild(headTag[0]);
                }

                cssTag.rel = 'stylesheet';
                cssTag.id = cssId;
                cssTag.type = 'text/css';
                cssTag.href = href;
                headTag[0].appendChild(cssTag);
            }
        },

        createmCASHButton = function (mCASHDiv, unique_id, prefix, alternate) {
            var labelKey = mCASHDiv.getAttribute('data-mcash-lang') || 'en',
                greeting = MCASH_LOCALE_MAP[labelKey] || MCASH_LOCALE_MAP.en,
                span,
                mCASHPayImg,
                mCASHButton,
                wrapper;

            loadCSS('shortlinkcss', prefix + MCASH_BUTTON_CSS);

            wrapper = document.createElement('div');
            wrapper.className = 'mcash-wrapper';

            span = document.createElement('span');
            span.className = 'mcash-label';
            span.innerHTML = greeting;

            mCASHPayImg = document.createElement('img');
            mCASHPayImg.src = prefix + (alternate ? MCASH_LOGO_ALTERNATE : MCASH_LOGO);

            mCASHButton = document.createElement('button');
            mCASHButton.type = 'button';
            mCASHButton.className = 'paywithmcash' + (alternate ? ' mcash-green' : '');
            mCASHButton.onclick = function () {
                scan(MCASH_SHORTLINK_ENDPOINT + unique_id);
            };
            mCASHButton.appendChild(mCASHPayImg);
            mCASHButton.appendChild(span);

            wrapper.appendChild(mCASHButton);
            mCASHDiv.appendChild(wrapper);
        },

        createQRcode = function (mCASHDiv, unique_id, prefix, alternate) {
            var Android,
                iOS,
                logo,
                nav,
                qrCode,
                wrapper;

            loadCSS('qrcss', prefix + MCASH_QR_CSS);

            wrapper = document.createElement('div');
            wrapper.className = 'mcash-wrapper' + (alternate ? ' mcash-green' : '');

            qrCode = document.createElement('img');
            qrCode.src = MCASH_QR_ENDPOINT + unique_id;
            qrCode.className = 'mcash-qr-image';

            // Create the bottom navigation
            nav = document.createElement('div');
            nav.setAttribute('class', 'mcash-nav');

            // Create logo and download links
            logo = document.createElement('img');
            logo.setAttribute('src', prefix + MCASH_LOGO);
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

            nav.appendChild(logo);
            nav.appendChild(iOS);
            nav.appendChild(Android);

            if (!alternate) {
                logo.src = prefix + MCASH_LOGO;
            } else {
                logo.src = prefix + MCASH_LOGO_ALTERNATE;
                iOS.setAttribute('class', 'mcash-link mcash-ios-w');
                Android.setAttribute('class', 'mcash-link mcash-android-w');
            }

            wrapper.appendChild(qrCode);
            wrapper.appendChild(nav);
            mCASHDiv.appendChild(wrapper);
        },

        exports = {};

    exports.displayQRorButton = function () {
        var mCASHDivs = document.getElementsByClassName('mcash-shortlink'),
            native = platformHasNativeSupport(),
            mCASHDiv,
            alternate,
            id,
            static_prefix = getPrefix(),
            i;

        for (i = 0; i < mCASHDivs.length; i++) {
            mCASHDiv = mCASHDivs[i];
            id = mCASHDiv.getAttribute('data-shortlink-id');
            if (id && id.trim()) {
                id = id.trim() + '/' + (mCASHDiv.getAttribute('data-shortlink-argstring') || '');
                alternate = mCASHDiv.getAttribute('data-alternate') === 'true';

                if (native) {
                    createmCASHButton(mCASHDiv, id, static_prefix, alternate);
                } else {
                    createQRcode(mCASHDiv, id, static_prefix, alternate);
                }
            }
        }
    };

    return exports;
}));
