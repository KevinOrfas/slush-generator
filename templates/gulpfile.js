var gulp = require('gulp'),
    del = require('del');

var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync'),
    reload      = browserSync.reload;

var input = {
    'sass': 'assets/styles/sass/**/*.scss',
    'scripts': 'assets/scripts/**/*.js',
    'vendor': 'assets/scripts/vendor/**/*.js',
    'images' : 'assets/images/**/*',
    'graphics' : 'assets/graphics/**/*',
    'fonts' : 'assets/fonts/**/*'
  },
  output = {
    'css' : 'assets/styles',
    'styles': 'dist/assets/styles',
    'scripts': 'dist/assets/scripts',
    'images' : 'dist/assets/images',
    'graphics' : 'dist/assets/graphics',
    'fonts' : 'dist/assets/fonts'
  };


// define the serve task and add the connect and watch task to it
gulp.task('serve', ['browser-sync', 'watch']);

// Static server
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./",
            routes: {
              '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('./*.html').on('change', reload);
});

gulp.task('watch', function () {
  gulp.watch(input.scripts, ['jshint', reload]);
  gulp.watch(input.sass, ['sass']);
});

gulp.task('sass', function() {
  return gulp.src(input.sass)
    .pipe($.sass())
    .pipe($.autoprefixer('last 2 version'))
    .pipe(gulp.dest(output.css))
    .pipe(reload({stream: true}))
    .pipe($.notify({ message: 'CSS in the folder' }));
});

// configure the jshint task
gulp.task('jshint', function() {
  return gulp.src(input.scripts)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('build-css', function() {
  return gulp.src(input.sass)
    .pipe($.sourcemaps.init()) // Process the original sources
      .pipe($.sass({ style: 'expanded' }))
      .pipe($.autoprefixer('last 2 version'))
      .pipe($.minifyCss())
      .pipe($.rename({suffix: '.min'}))
    .pipe($.sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest(output.styles))
    .pipe($.notify({ message: 'Styles task complete' }));
});


gulp.task('build-js', function() {
  return gulp.src([input.scripts, input.vendor])
    .pipe($.sourcemaps.init())
      .pipe($.concat('bundle.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe($.util.env.type === 'production' ? $.rename({suffix: '.min'}) : $.util.noop()) 
      .pipe($.util.env.type === 'production' ? $.uglify() : $.util.noop()) 
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(output.scripts))
    .pipe($.notify({ message: 'Scripts task complete' }));;
});

gulp.task('html', function () {
  gulp.src('./*.html')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
  return gulp.src(input.images)
    .pipe($.cache($.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(output.images))
    .pipe($.notify({ message: 'Images task complete' }));
});

gulp.task('graphics', function() {
  return gulp.src(input.graphics)
    .pipe(gulp.dest(output.graphics))
    .pipe($.notify({ message: 'Graphics task complete' }));
});

gulp.task('fonts', function () {
  return gulp.src(input.fonts)
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(output.fonts));
});

gulp.task('clean', function(cb) {
    del('dist', cb)
});

gulp.task('build', ['build-css', 'build-js', 'html', 'images', 'graphics', 'fonts'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
