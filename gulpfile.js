/*jshint node: true, strict: false */

var fs = require('fs');
var gulp = require('gulp');

// ----- lint ----- //

var jshint = require('gulp-jshint');

gulp.task( 'lint-js', function() {
  return gulp.src('draggabilly.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'lint-test', function() {
  return gulp.src('test/unit/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

gulp.task( 'lint-task', function() {
  return gulp.src('gulpfile.js')
    .pipe( jshint() )
    .pipe( jshint.reporter('default') );
});

var jsonlint = require('gulp-json-lint');

gulp.task( 'lint-json', function() {
  return gulp.src( '*.json' )
    .pipe( jsonlint() )
    .pipe( jsonlint.report('verbose') );
});

gulp.task( 'lint', [ 'lint-js', 'lint-test', 'lint-task', 'lint-json' ] );

// -------------------------- dist -------------------------- //
// RequireJS makes pkgd

// refactored from gulp-requirejs-optimize
// https://www.npmjs.com/package/gulp-requirejs-optimize/

var gutil = require('gulp-util');
var through2 = require('through2');
var requirejs = require('requirejs');

function rjsOptimize( options ) {
  var stream;

  requirejs.define( 'node/print', [], function() {
    return function(msg) {
      gutil.log( msg );
    };
  });

  options = options || {};

  stream = through2.obj( function ( file, enc, cb ) {
    if ( file.isNull() ) {
      this.push( file );
      return cb();
    }

    options.logLevel = 2;

    options.out = function( text ) {
      var outFile = new gutil.File({
        path: file.relative,
        contents: new Buffer( text )
      });
      cb( null, outFile );
    };

    gutil.log('RequireJS optimizing');
    requirejs.optimize( options, null, function( err ) {
      var gulpError = new gutil.PluginError( 'requirejsOptimize', err.message );
      stream.emit( 'error', gulpError );
    });
  });

  return stream;
}

// regex for banner comment
var reBannerComment = new RegExp('^\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)\\s*');

function getBanner() {
  var src = fs.readFileSync( 'draggabilly.js', 'utf8' );
  var matches = src.match( reBannerComment );
  var banner = matches[0].replace( 'Draggabilly', 'Draggabilly PACKAGED' );
  return banner;
}

var replace = require('gulp-replace');
var rename = require('gulp-rename');

function addBanner( str ) {
  return replace( /^/, str );
}

gulp.task( 'requirejs', function() {
  var banner = getBanner();
  // HACK src is not needed
  // should refactor rjsOptimize to produce src
  return gulp.src('draggabilly.js')
    .pipe( rjsOptimize({
      baseUrl: 'bower_components',
      optimize: 'none',
      include: [
        'jquery-bridget/jquery.bridget',
        'draggabilly/draggabilly'
      ],
      paths: {
        draggabilly: '../',
        jquery: 'empty:'
      }
    }) )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('draggabilly.pkgd.js') )
    .pipe( gulp.dest('dist') );
});

// ----- uglify ----- //

var uglify = require('gulp-uglify');

gulp.task( 'uglify', function() {
  var banner = getBanner();
  return gulp.src('dist/draggabilly.pkgd.js')
    .pipe( uglify() )
    // add banner
    .pipe( addBanner( banner ) )
    .pipe( rename('draggabilly.pkgd.min.js') )
    .pipe( gulp.dest('dist') );
});

// ----- dist ----- //

gulp.task( 'dist', [ 'requirejs', 'uglify' ] );

// ----- default ----- //

gulp.task( 'default', [
  'lint',
  'dist'
]);

// -------------------------- site-content -------------------------- //

var highlightjs = require('highlight.js');
var marked = require('marked');

// alias XML syntax highlighting as HTML
highlightjs.LANGUAGES.html = highlightjs.LANGUAGES.xml;
// alias js as javascript
highlightjs.LANGUAGES.js = highlightjs.LANGUAGES.javascript;

marked.setOptions({
  highlight: function( code, lang ) {
    return lang ? highlightjs.highlight( lang, code ).value : code;
  }
});

gulp.task( 'site-content', function() {
  var readmeHTML = marked( fs.readFileSync( 'README.md', 'utf8' ) );

  return gulp.src('assets/page.html')
    .pipe( replace( '{{{ content }}}', readmeHTML ) )
    .pipe( rename('index.html') )
    .pipe( gulp.dest('build') );
});

var concat = require('gulp-concat');

// ----- site-css ----- //

gulp.task( 'site-css', function() {
  return gulp.src([
    'bower_components/normalize.css/normalize.css',
    'assets/page.css'
  ])
    .pipe( concat('styles.css') )
    .pipe( gulp.dest('build') );
});

// ----- site-copy ----- //

gulp.task( 'site-copy', function() {
  gulp.src([
    'dist/*',
    'assets/scripts.js',
    'bower_components/doc-ready/doc-ready.js'
  ])
    .pipe( gulp.dest('build') );
});

// ----- site ----- //

gulp.task( 'site', [ 'site-content', 'site-css', 'site-copy' ] );