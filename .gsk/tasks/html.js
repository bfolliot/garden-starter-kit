'use strict';

// MODULES
// ----------------------------------------------------------------------------
var fs       = require('fs');
var path     = require('path');
var gulp     = require('gulp');
var gutil    = require('gulp-util');
var plumber  = require('gulp-plumber');
var prettify = require('gulp-prettify');
var bs       = require('browser-sync');
var err      = require('../tools/errcb');
var ENV      = require('../tools/env').html;

// CONDITIONAL PIPELINE
// ----------------------------------------------------------------------------
var pipeline = require('../pipe/html/' + ENV.engine + '.js');

// On ne va compiler que les fichiers dont le nom ne commence pas par un _
// Ni ceux qui ne sont pas au format de l'engine choisi
var ext = {
  handlebars: '*.hbs',
  twig: '*.twig'
};

function getExt(engine) {
  return (ext[engine] !== undefined) ? ext[engine] : '*.*';
}

var SRC  = [
  path.join(ENV['src-dir'], '**', getExt(ENV.engine)),
  path.join('!' + ENV['src-dir'], '**', '_*')
];
var DEST = ENV['dest-dir'];


// PRETTIFY CONFIGURATION
// ----------------------------------------------------------------------------
var PRT_CONF;

try {
  // gulp-prettify est trop con pour gérer lui même les fichiers .jsbeautifyrc
  PRT_CONF = JSON.parse(fs.readFileSync('./.jsbeautifyrc'));
} catch (e) {
  gutil.log(gutil.colors.yellow('WARN:'), '[.jsbeautifyrc]', e.message);

  PRT_CONF = {
    brace_style          : 'collapse',
    end_with_newline     : true,
    indent_size          : 2,
    indent_char          : ' ',
    indent_inner_html    : false,
    indent_scripts       : 'normal',
    max_preserve_newlines: 2,
    preserve_newlines    : true,
    unformatted          : [
      'pre', 'code', 'a', 'sub', 'sup', 'b', 'i', 'u', 'strong', 'em'
    ]
  };
}

// TASK DEFINITION
// ----------------------------------------------------------------------------
// $ gulp html
// ----------------------------------------------------------------------------
// Gère la compilation des fichiers HTML
gulp.task('html', 'Compile HTML files.', function () {
  return gulp.src(SRC)
    .pipe(plumber({ errorHandler: err }))
    .pipe(pipeline())
    .pipe(prettify(PRT_CONF))
    .pipe(gulp.dest(DEST))
    .pipe(bs.stream());
});
