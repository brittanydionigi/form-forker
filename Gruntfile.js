module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'js/*.js'
      ]
    },
    jsvalidate: {
      files: '<%=jshint.all%>'
    },

    mocha: {
      index: ['test/index.html'],
      options: {
        run: true,
        globals: []
      }
    },
    jsbeautifier: {
      files: ["js/*.js", "css/*.css"],
      options: {
        html: {
          braceStyle: "collapse",
          indentChar: " ",
          indentScripts: "keep",
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ["a", "sub", "sup", "b", "i", "u"],
          wrapLineLength: 0
        },
        css: {
          indentChar: " ",
          indentSize: 2
        },
        js: {
          braceStyle: "collapse",
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: " ",
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
    release: {
      options: {
        bump: true, //default: true
        file: 'bower.json', //default: package.json
        add: false, //default: true
        commit: false, //default: true
        tag: false, //default: true
        push: false, //default: true
        pushTags: false, //default: true
        npm: false, //default: true
        tagName: 'some-tag-<%= version %>', //default: '<%= version %>'
        commitMessage: 'Check out my release <%= version %>', //default: 'release <%= version %>'
        tagMessage: 'Tagging version <%= version %>' //default: 'Version <%= version %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-jsvalidate');
  grunt.loadNpmTasks('grunt-release');

  // grunt.registerTask('default', ['install-hook', 'jshint', 'jsvalidate', 'jsbeautifier', 'mocha']);
  // grunt.registerTask('default', []);
  // grunt.registerTask('precommit', ['jsvalidate', 'jshint', 'jsbeautifier', 'mocha']);

  // grunt.registerTask('install-hook', function() {
  //   var fs = require('fs');
  //   grunt.file.copy('hooks/pre-commit', '.git/hooks/pre-commit');
  //   fs.chmodSync('.git/hooks/pre-commit', '755');
  // });

};
