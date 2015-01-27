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
    var exports = {};
    var _timeout;

    exports.redirect_to = function (url) {
        location.href = url;
    };

    exports.kill_redirect = function () {
        if (typeof _timeout === "number") {
            _timeout = clearTimeout(_timeout);
        }
    };

    var MCASH_FALLBACK_DOWNLOAD_URL = 'https://itunes.apple.com/no/app/mcash/id550136730?mt=8',
        MCASH_SHORTLINK_ENDPOINT = 'http://mca.sh/',
        MCASH_SHORTLINK_DEFAULT_PREFIX = 's',
        MCASH_SHORTLINK_RE = /^[a-z]$/,
        MCASH_LOGO = 'assets/images/mCASH_logo.png',
        MCASH_LOGO_ALTERNATE = 'assets/images/mCASH_logo_white.png',
        MCASH_BUTTON_CSS = 'assets/css/button.css',
        MCASH_QR_CSS = 'assets/css/qr.css',
        MCASH_LOCALE_MAP = {
            no: 'Åpne med',
            en: 'Open with'
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
                match = document.scripts[i].src && document.scripts[i].src.match(/^(.*)mcash\.shortlink(\-min)?\.js$/);
                if (match && match[1]) {
                    parser = document.createElement('a');
                    parser.href = match[1];
                    return parser.href;
                }
            }
            return '/';
        },

        scan = function (shortlinkUrl) {
            var embedded_shortlink = 'mcash://qr?code=' + shortlinkUrl;

            exports.redirect_to(embedded_shortlink);
            _timeout = setTimeout(function () {
                exports.redirect_to(MCASH_FALLBACK_DOWNLOAD_URL);
            }, 300);

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

        createmCASHButton = function (mCASHDiv, unique_id, prefix, alternate, shortlink_url) {
            var labelKey = mCASHDiv.getAttribute('data-mcash-lang') || 'no',
                greeting = MCASH_LOCALE_MAP[labelKey] || MCASH_LOCALE_MAP.no,
                span,
                mCASHPayImg,
                mCASHButton,
                mCASHButtonWrap,
                wrapper;

            loadCSS('shortlinkcss', prefix + MCASH_BUTTON_CSS);

            wrapper = document.createElement('div');
            wrapper.className = 'mcash-wrapper';

            mCASHButtonWrap = document.createElement('span');
            mCASHButtonWrap.className = 'mcash-btnwrap';

            span = document.createElement('span');
            span.className = 'mcash-label';
            span.innerHTML = greeting;

            mCASHPayImg = document.createElement('img');
            mCASHPayImg.src = prefix + (alternate ? MCASH_LOGO_ALTERNATE : MCASH_LOGO);

            mCASHButton = document.createElement('button');
            mCASHButton.type = 'button';
            mCASHButton.className = 'paywithmcash' + (alternate ? ' mcash-green' : '');
            mCASHButton.onclick = function () {
                scan(shortlink_url);
            };
            //mCASHButton.appendChild(mCASHPayImg);
            //mCASHButton.appendChild(span);

            mCASHButton.appendChild(mCASHButtonWrap);
            mCASHButtonWrap.appendChild(span);
            mCASHButtonWrap.appendChild(mCASHPayImg);

            wrapper.appendChild(mCASHButton);
            mCASHDiv.appendChild(wrapper);
        },

        createQRcode = function (mCASHDiv, unique_id, prefix, alternate, shortlink_url) {
            var Android,
                iOS,
                logo,
                nav,
                qrCode,
                wrapper;

            loadCSS('qrcss', prefix + MCASH_QR_CSS);

            wrapper = document.createElement('div');
            wrapper.className = 'mcash-wrapper' + (alternate ? ' mcash-green' : '');

            qrCode = document.createElement('div');
            qrCode.className = 'mcash-qr-image';

            // Create QR code
            new QRCode(qrCode, {
                text: shortlink_url,
                width: 180,
                height: 180,
                correctLevel: QRCode.CorrectLevel.L,
            });

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
        };

    exports.displayQRorButton = function () {
        var mCASHDivs = document.getElementsByClassName('mcash-shortlink'),
            native = platformHasNativeSupport(),
            mCASHDiv,
            alternate,
            id,
            static_prefix = getPrefix(),
            shortlink_prefix,
            shortlink_url,
            i;

        for (i = 0; i < mCASHDivs.length; i++) {
            mCASHDiv = mCASHDivs[i];
            id = mCASHDiv.getAttribute('data-shortlink-id');
            if (id && id.trim()) {
                shortlink_prefix = mCASHDiv.getAttribute('data-shortlink-prefix') || '';
                if (!MCASH_SHORTLINK_RE.exec(shortlink_prefix)) {
                    shortlink_prefix = MCASH_SHORTLINK_DEFAULT_PREFIX;
                }
                id = id.trim() + '/' + (mCASHDiv.getAttribute('data-shortlink-argstring') || '');
                alternate = mCASHDiv.getAttribute('data-alternate') === 'true';
                shortlink_url = MCASH_SHORTLINK_ENDPOINT + shortlink_prefix + '/' + id;

                if (native) {
                    createmCASHButton(mCASHDiv, id, static_prefix, alternate, shortlink_url);
                } else {
                    createQRcode(mCASHDiv, id, static_prefix, alternate, shortlink_url);
                }
            }
        }
    };

    return exports;
}));
