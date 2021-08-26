/*
    grunt build:production: build all files
    grunt watcher: start watcher while developing
*/

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            app: {
                src: 'build/compass/app.scss',
                dest: 'www/css/app.css'
            }
        },

        postcss: {
            development: {
                options: {
                    // inline sourcemaps
                    map: true,
                    processors: [
                        // add vendor prefixes
                        require('autoprefixer')({browsers: 'last 2 versions'})
                    ]
                },

                src: 'www/css/*.css'
            },

            production: {
                options: {
                    // inline sourcemaps
                    map: false,
                    processors: [
                        // add vendor prefixes
                        require('autoprefixer')({browsers: 'last 2 versions'}),
                        // minify css
                        require('cssnano')()
                    ]
                },

                src: 'www/css/*.css'
            }
        },

        watch: {
            site_package_css: {
                files: 'build/compass/**/*.scss',
                tasks: ['sass', 'postcss:development']
            }
        }
    });

    grunt.loadNpmTasks('grunt-node-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');

    // tasks
    grunt.registerTask('default', 'help', function () {
        grunt.log.write("grunt watcher\n\t start watcher for develope\ngrunt build:production\n\t build all files");
    });

    grunt.registerTask('watcher', ['sass', 'postcss:development', 'watch']);
    grunt.registerTask('build:production', ['sass', 'postcss:production']);
    grunt.registerTask('build:development', ['sass', 'postcss:development']);
};
