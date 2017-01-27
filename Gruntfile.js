'use strict';
module.exports = function (grunt) {

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.loadNpmTasks('grunt-release-github');

    grunt.loadNpmTasks('grunt-run');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        license: grunt.file.read('LICENSE', {
            encoding: 'utf8'
        }).toString(),
        // uglify: {
        //     options: {
        //         banner: '/*!\n<%= license %>*/\n'
        //     },
        //     // build: {
        //     //     src: 'app/*.js',
        //     //     dest: 'build/<%= this.name %>.min.js'
        //     // },
        //     all: {
        //         files: [{
        //             expand: true,
        //             cwd: './',
        //             src: ['index.js','server.js', './**/*.js'],
        //             dest: './build',
        //             ext: '.js',
        //         }]
        //     }
        // },
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
                beforeBump: [], // optional grunt tasks to run before file versions are bumped
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

    //Execute grunt release to make a new relase.

    // grunt.registerTask('dev', ['watch']);

};
