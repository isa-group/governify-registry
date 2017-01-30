'use strict';
module.exports = function (grunt) {

    // Load plugin tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-release-github');

    grunt.loadNpmTasks('grunt-run');

    grunt.loadNpmTasks('grunt-banner');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        license: grunt.file.read('LICENSE_notice', {
            encoding: 'utf8'
        }).toString(),
        releaseNote: grunt.file.read('release-notes', {
            encoding: 'utf8'
        }).toString(),
        usebanner: {
            // license: {
            //     options: {
            //         position: 'top',
            //         banner: '/*!\n<%= license %>*/\n',
            //         replace: true
            //     },
            //     files: {
            //         src: ['**/*.js']
            //     }
            // },
            readme: {
                options: {
                    position: 'bottom',
                    banner: '### Latest release\n\n<%= releaseNote %>',
                    replace: /###\sLatest\srelease(\s||.)+/g,
                    linebreak: false
                },
                files: {
                    src: ['README.md']
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'index.js', 'server.js', './**/*.js', 'tests/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        run: {
            test: {
                exec: 'npm test'
            }
        },
        release: {
            options: {
                changelog: true, //default: false
                changelogFromGithub: true,
                githubReleaseBody: 'See [CHANGELOG.md](./CHANGELOG.md) for details.',
                //changelogText: '\nhello\n <%= grunt.config.get("pkg.changelog") %>',
                npm: false, //default: true
                //npmtag: true, //default: no tag
                beforeBump: ['usebanner'], // optional grunt tasks to run before file versions are bumped
                afterBump: [], // optional grunt tasks to run after file versions are bumped
                beforeRelease: [], // optional grunt tasks to run after release version is bumped up but before release is packaged
                afterRelease: [], // optional grunt tasks to run after release is packaged
                updateVars: ['pkg'], // optional grunt config objects to update (this will update/set the version property on the object specified)
                github: {
                    repo: "isa-group/governify-registry",
                    usernameVar: 'GITHUB_USERNAME',
                    accessTokenVar: "GITHUB_ACCESS_TOKEN"
                }
            }
        },
        watch: {
            scripts: {
                files: ['./**/*.js'],
                tasks: ['jshint', 'uglify']
            }
        }
    });

    // Default task(s).
    // grunt.registerTask('default', ['jshint', 'uglify']);
    // grunt.registerTask('build', ['jshint', 'mochaTest', 'uglify']);

    //set version as environment variable to be used from Travis CI
    grunt.registerTask('setVersionEnv', function () {
        grunt.file.write('.version', grunt.config('pkg.version'));
    });

    //'jshint',
    grunt.registerTask('test', ['run:test', 'setVersionEnv']);

    grunt.registerTask('license', ['usebanner']);

    //Execute grunt release to make a new relase.

    // grunt.registerTask('dev', ['watch']);

};
