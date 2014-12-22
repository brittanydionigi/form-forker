module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/*.js',
        'test/*.js'
      ]
    },
    jsvalidate: {
      files: '<%=jshint.all%>'
    },
    qunit: {
      all: ['test/index.html']
    },
    jsbeautifier: {
      files: ['src/*.js', 'css/*.css'],
      options: {
        html: {
          braceStyle: 'collapse',
          indentChar: ' ',
          indentScripts: 'keep',
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u'],
          wrapLineLength: 0
        },
        css: {
          indentChar: ' ',
          indentSize: 2
        },
        js: {
          braceStyle: 'collapse',
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: ' ',
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: false,
          keepArrayIndentation: false,
          keepFunctionIndentation: false,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 0
        }
      }
    },
    githooks: {
      all: {
        // Will run the jshint and test:unit tasks at every commit
        'pre-commit': 'jshint jsvalidate jsbeautifier qunit uglify'
      }
    },
    uglify: {
      my_target: {
        files: {
          'dist/jquery.form-forker.min.js': ['src/jquery.form-forker.js']
        }
      }
    },
    release: {
      options: {
        additionalFiles: 'bower.json',
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'jsvalidate', 'jsbeautifier', 'qunit', 'uglify']);
};
