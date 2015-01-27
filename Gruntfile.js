module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        jasmine: {
            customTemplate: {
                src: 'dest/<%= pkg.name %>.js',
                options: {
                    host: 'http://localhost:8080/',
                    specs: 'tests/spec/**/*.js',
                    summary: true,
                    template: 'tests/shortlink.tmpl',
                    vendor: [
                        'http://code.jquery.com/jquery-2.1.1.min.js'
                    ]
                }
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'src/**/*.js',
                'tests/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    keepalive: false
                }
            }
        },
        concat: {
            dist: {
                src: ['src/shortlink.js', 'src/qrcode.js'],
                dest: 'dest/<%= pkg.name %>.js',
            },
            options: {
                banner: "" +
                    "(function (root, factory) {\n" +
                    "    if (typeof define === 'function' && define.amd) {\n" +
                    "        // AMD. Register as an anonymous module.\n" +
                    "        define([], function () {\n" +
                    "            root.mCASH = factory();\n" +
                    "            return root.mCASH;\n" +
                    "        });\n" +
                    "    } else {\n" +
                    "        // Browser globals\n" +
                    "        root.mCASH = factory();\n" +
                    "    }\n" +
                    "}(this, function () {\n" +
                    "    'use strict';\n" +
                    "    var exports = {};\n",

                footer: "return exports;\n}));",
                stripBanners: true,
                process: function (src, filepath) {
                    return src.replace(/^[^]*var exports\s*=\s*{\s*}\s*;([^]+)return exports;[^]+$/m, '$1');
                },
            },
        },
        uglify: {
            options: {
                mangle: true
            },
            build: {
                src: 'dest/<%= pkg.name %>.js',
                dest: 'dest/<%= pkg.name %>-min.js'
            }
        }
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('minify', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('test', ['minify', 'connect', 'jasmine']);

    grunt.registerTask('default', ['test']);
};
