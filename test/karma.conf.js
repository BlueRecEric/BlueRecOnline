// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-05-08 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-dynforms/dynamic-forms.js',
      'bower_components/lodash/lodash.js',
      'bower_components/angular-google-maps/dist/angular-google-maps.js',
      'bower_components/angular-jwt/dist/angular-jwt.js',
      'bower_components/angular-loading-bar/build/loading-bar.js',
      'bower_components/angular-md5/angular-md5.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/moment/moment.js',
      'bower_components/angular-moment/angular-moment.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-smart-table/dist/smart-table.js',
      'bower_components/angular-strap/dist/angular-strap.js',
      'bower_components/angular-strap/dist/angular-strap.tpl.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/angular-ui-utils/ui-utils.js',
      'bower_components/angularjs-slider/dist/rzslider.js',
      'bower_components/ngAutocomplete/src/ngAutocomplete.js',
      'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'bower_components/v-button/dist/v-button.js',
      'bower_components/angular-socialshare/angular-socialshare.js',
      'bower_components/angularUtils-pagination/dirPagination.js',
      'bower_components/AngularJS-Toaster/toaster.js',
      'bower_components/angular-local-storage/dist/angular-local-storage.js',
      'bower_components/angular-uuid4/angular-uuid4.js',
      'bower_components/quick-ng-repeat/quick-ng-repeat.js',
      'bower_components/fastclick/lib/fastclick.js',
      'bower_components/classlist/classList.js',
      'bower_components/stateful-fastclick/dist/stateful-fastclick.js',
      'bower_components/angular-stateful-fastclick/lib/angular-stateful-fastclick.js',
      'bower_components/angular-ui-mask/dist/mask.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
