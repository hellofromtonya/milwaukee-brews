const VERSION = '0.0.1';

// General Requirements

const browserSync = require('browser-sync');
const gulp = require('gulp');
const gutil = require('gulp-util');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');


// Style Dependencies
const autoprefixer = require('autoprefixer');
const cssnano = require('gulp-cssnano');
const mqpacker = require('css-mqpacker');
const postcss = require( 'gulp-postcss' );
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');

// Script Dependencies
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');

// Set src paths.
const paths = {
  'css': ['src/sass/*.scss'],
  'scripts': [
    // 'js/resources.js',
    // 'js/views/GameBoard.js',
    // 'js/views/Modal.js',
    // 'js/pieces/GamePiece.js',
    // 'js/pieces/Enemy.js',
    // 'js/pieces/GamePiecePool.js',
    // 'js/pieces/EnemyPool.js',
    // 'js/pieces/CollectiblePool.js',
    // 'js/pieces/Player.js',
    // 'js/GameController.js',
    'js/app.js'
  ]
};

const destFolder = 'assets/' + VERSION + '/';

/**
 * Handle errors and alert the user.
 */
function handleErrors() {
  const args = Array.prototype.slice.call(arguments);

  notify.onError({
    'title': 'Task Failed [<%= error.message %>',
    'message': 'See console.',
    'sound': 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).apply(this, args);

  gutil.beep(); // Beep 'sosumi' again.

  // Prevent the 'watch' task from stopping.
  this.emit('end');
}

/****************************
 * Style Tasks
 ***************************/

/**
 * Compile Sass and run stylesheet through PostCSS.
 *
 * https://www.npmjs.com/package/gulp-sass
 * https://www.npmjs.com/package/gulp-postcss
 * https://www.npmjs.com/package/gulp-autoprefixer
 * https://www.npmjs.com/package/css-mqpacker
 */
gulp.task('postcss', () =>
    gulp.src(paths.css)

    // handle errors
        .pipe(plumber({'errorHandler': handleErrors}))

        // Init the sourcemaps
        .pipe(sourcemaps.init())

        // Let's compile the Sass
        .pipe(sass({
          // 'includePaths': [].concat(bourbon, neat),
          'errLogToConsole': true,
          'outputStyle': 'expanded' // Options: nested, expanded, compact, compressed
        }))

        // Autoprefix and package up the media queries
        // moving them to the bottom
        .pipe(postcss([
          autoprefixer({
            'browsers': ['last 2 version']
          }),
          mqpacker({
            'sort': true
          })
        ]))

        // Create our sourcemap
        .pipe(sourcemaps.write())

        // Move it off to the destination and sync
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream())
);

/**
 * Minify and optimize style.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task('cssnano', ['postcss'], () =>
    gulp.src(destFolder + 'style.css')
    // handle errors
        .pipe(plumber({'errorHandler': handleErrors}))
        .pipe(cssnano({
          'safe': true // Use safe optimizations.
        }))
        // rename to our .min version
        .pipe(rename('style.min.css'))
        // Move it off to the destination and sync
        .pipe(gulp.dest(destFolder))
        .pipe(browserSync.stream())
);

/**
 * Sass linting.
 *
 * https://www.npmjs.com/package/sass-lint
 */
gulp.task('sass:lint', () =>
    gulp.src([
      'src/sass/**/*.scss',
    ])
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
);

/****************************
 * Scripts Tasks
 ***************************/

/**
 * Concatenate and transform JavaScript.
 *
 * https://www.npmjs.com/package/gulp-concat
 * https://github.com/babel/gulp-babel
 */
gulp.task('concat', () =>
    gulp.src(paths.scripts)

    // Deal with errors.
        .pipe(plumber(
            {'errorHandler': handleErrors}
        ))

        // Convert ES6+ to ES2015.
        .pipe(babel({
          presets: ['ES2015']
        }))

        // Concatenate partials into a single script.
        .pipe(concat('app.js'))

        // Save the file.
        .pipe(gulp.dest(destFolder))
);

/**
 * Minify compiled JavaScript.
 *
 * https://www.npmjs.com/package/gulp-uglify
 */
gulp.task('uglify', ['concat'], () =>
    gulp.src(destFolder + 'app.js')
        .pipe(plumber({'errorHandler': handleErrors}))
        .pipe(rename({'suffix': '.min'}))

        // Convert ES6+ to ES2015.
        .pipe(babel({
          presets: ['ES2015']
        }))
        .pipe(uglify({
          'mangle': false
        }))
        .pipe(gulp.dest(destFolder))
);

/**
 * JavaScript linting.
 *
 * https://www.npmjs.com/package/gulp-eslint
 */
gulp.task('js:lint', () =>
    gulp.src(['scripts/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
);
/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task('watch', function() {

  browserSync({
    'open': false,
    'injectChanges': true,
    'proxy': 'http://localhost:63342/ufend-neighborhood-map/index.html',
    'watchOptions': {
      'debounceDelay': 1000
    }
  });

  // Run tasks when files change.
  gulp.watch(paths.css, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
});

/**
 * Create individual tasks.
 */
gulp.task('scripts', ['uglify']);
gulp.task('styles', ['cssnano']);
gulp.task('lint', ['js:lint']);
gulp.task('default', ['styles', 'scripts']);