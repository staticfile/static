var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    del = require('del');

gulp.task('default', ['clean'], function() {
     gulp.src(['./4.1.10/lang/*.js'])
         .pipe(rename({suffix: '.min'}))
         .pipe(uglify())
         .pipe(gulp.dest('./4.1.10/lang'));

     gulp.src(['./4.1.11/lang/*.js'])
         .pipe(rename({suffix: '.min'}))
         .pipe(uglify())
         .pipe(gulp.dest('./4.1.11/lang'));

     gulp.src(['./4.1.10/plugins/**/*.js'])
         .pipe(rename({suffix: '.min'}))
         .pipe(uglify())
         .pipe(gulp.dest('./4.1.10/plugins'));

     gulp.src(['./4.1.11/plugins/**/*.js'])
         .pipe(rename({suffix: '.min'}))
         .pipe(uglify())
         .pipe(gulp.dest('./4.1.11/plugins'));

     gulp.src(['./4.1.10/themes/**/*.css'])
         .pipe(rename({suffix: '.min'}))
         .pipe(minify())
         .pipe(gulp.dest('./4.1.10/themes'));

     gulp.src(['./4.1.11/themes/**/*.css'])
         .pipe(rename({suffix: '.min'}))
         .pipe(minify())
         .pipe(gulp.dest('./4.1.11/themes'));

});

gulp.task('clean', function () {
    del(['./4.1.10/lang/*.min.js', './4.1.10/plugins/**/*.min.js', './4.1.10/themes/**/*.min.css',
         './4.1.11/lang/*.min.js', './4.1.11/plugins/**/*.min.js', './4.1.11/themes/**/*.min.css'])
});
