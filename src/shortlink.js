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

    var MCASH_SHORTLINK_ENDPOINT = 'http://mca.sh/',
        MCASH_SHORTLINK_DEFAULT_PREFIX = 's',
        MCASH_SHORTLINK_RE = /^[a-z]$/,
        MCASH_LOGO = 'assets/images/mCASH_logo_white.png',
        MCASH_LOGO_ALTERNATE = 'assets/images/mCASH_logo_green.png',
        MCASH_BUTTON_CSS = 'assets/css/button.css',
        MCASH_QR_CSS = 'assets/css/qr.css',
        MCASH_LOCALE_MAP = {
	    nb: 'Åpne med',
            no: 'Åpne med',
            en: 'Open with'
        },
        MCASH_DOWNLOAD_IOS = 'https://itunes.apple.com/no/app/mcash/id550136730?mt=8',
        MCASH_DOWNLOAD_ANDROID = 'https://play.google.com/store/apps/details?id=no.mcash',

        platformHasNativeSupport = function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod|Android|Dalvik/);
        },

        getPrefix = function () {
            var parser,
                match,
                i;

            for (i = 0; i < document.scripts.length; i++) {
                match = document.scripts[i].src && document.scripts[i].src.match(/^(.*)mcash\.shortlink(\.min)?\.js$/);
                if (match && match[1]) {
                    parser = document.createElement('a');
                    parser.href = match[1];
                    return parser.href;
                }
            }
            return '/';
        },

        android_scan = function (g_intent, custom, alt) {
            var timer,
                heartbeat,
                iframe_timer,

                clearTimers = function () {
                    clearTimeout(timer);
                    clearTimeout(heartbeat);
                    clearTimeout(iframe_timer);
                },

                intervalHeartbeat = function () {
                    if (document.webkitHidden || document.hidden) {
                        clearTimers();
                    }
                },

                tryIframeApproach = function () {
                    var iframe = document.createElement("iframe");
                    iframe.style.border = "none";
                    iframe.style.width = "1px";
                    iframe.style.height = "1px";
                    iframe.onload = function () {
                        exports.redirect_to(alt);
                    };
                    iframe.src = custom;
                    document.body.appendChild(iframe);
                },

                tryWebkitApproach = function () {
                    exports.redirect_to(custom);
                    timer = setTimeout(function () {
                        exports.redirect_to(alt);
                    }, 2500);
                };

            heartbeat = setInterval(intervalHeartbeat, 200);
            if (navigator.userAgent.match(/Chrome/)) {
                exports.redirect_to(g_intent);
            } else if (navigator.userAgent.match(/Firefox/)) {
                tryWebkitApproach();
                iframe_timer = setTimeout(function () {
                    tryIframeApproach();
                }, 1500);
            } else {
                tryIframeApproach();
            }
        },

        scan = function (shortlinkUrl) {
            var is_ios = navigator.userAgent.match(/iPhone|iPad|iPod/),
                common_part = '://qr?code=' + encodeURI(shortlinkUrl),
                redirect_url = is_ios ? 'mcash' + common_part :
                        'intent' + common_part + '#Intent;scheme=mcash;package=no.mcash;end';

            if (is_ios) {
                exports.redirect_to(redirect_url);
                setTimeout(function () {
                    exports.redirect_to(MCASH_DOWNLOAD_IOS);
                }, 300);
            } else {
                android_scan(redirect_url, 'mcash' + common_part, MCASH_DOWNLOAD_ANDROID);
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

        createmCASHButton = function (mCASHDiv, prefix, alternate, shortlink_url) {
	    var userLanguage = window.navigator.languages ? window.navigator.languages[0] : (window.navigator.language || window.navigator.userLanguage),
                language = userLanguage && userLanguage.split('-')[0],
                labelKey = mCASHDiv.getAttribute('data-shortlink-lang'),
                greeting = MCASH_LOCALE_MAP[labelKey] || MCASH_LOCALE_MAP[language] || MCASH_LOCALE_MAP.en,
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

            mCASHButton.appendChild(mCASHButtonWrap);
            mCASHButtonWrap.appendChild(span);
            mCASHButtonWrap.appendChild(mCASHPayImg);

            wrapper.appendChild(mCASHButton);
            mCASHDiv.appendChild(wrapper);
        },

        createQRcode = function (mCASHDiv, prefix, alternate, shortlink_url) {
            var Android,
                iOS,
                logo,
                nav,
                qrCode,
                logoWrap,
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
                correctLevel: QRCode.CorrectLevel.L
            });

            // Create the bottom navigation
            nav = document.createElement('div');
            nav.setAttribute('class', 'mcash-nav');

            logoWrap = document.createElement('a');
            logoWrap.href = 'https://mcash.no/';
            logoWrap.target = '_blank';

            // Create logo and download links
            logo = document.createElement('img');
            logo.setAttribute('src', prefix + MCASH_LOGO);
            logo.setAttribute('class', 'mcash-logo');

            iOS = document.createElement('a');
            iOS.setAttribute('href', MCASH_DOWNLOAD_IOS);
            iOS.setAttribute('class', 'mcash-link mcash-ios');
            iOS.setAttribute('target', '_blank');
            iOS.setAttribute('title', 'Download mCASH from App Store');
            iOS.innerHTML = 'iOS';

            Android = document.createElement('a');
            Android.setAttribute('href', MCASH_DOWNLOAD_ANDROID);
            Android.setAttribute('class', 'mcash-link mcash-android');
            Android.setAttribute('target', '_blank');
            Android.setAttribute('title', 'Download mCASH from Google Play');
            Android.innerHTML = 'Android';

            logoWrap.appendChild(logo);
            nav.appendChild(logoWrap);
            nav.appendChild(iOS);
            nav.appendChild(Android);

            if (!alternate) {
                logo.src = prefix + MCASH_LOGO;
            } else {
                logo.src = prefix + MCASH_LOGO_ALTERNATE;
                iOS.setAttribute('class', 'mcash-link mcash-ios-green');
                Android.setAttribute('class', 'mcash-link mcash-android-green');
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
                alternate = mCASHDiv.getAttribute('data-shortlink-alternate') === 'true';
                shortlink_url = MCASH_SHORTLINK_ENDPOINT + shortlink_prefix + '/' + id;

                if (native) {
                    createmCASHButton(mCASHDiv, static_prefix, alternate, shortlink_url);
                } else {
                    createQRcode(mCASHDiv, static_prefix, alternate, shortlink_url);
                }
            }
        }
    };

    return exports;
}));
