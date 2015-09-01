## gulp-scriptcss
use javascript to insert css to html head

### options
- main <String|Array>, which file do you want to add `window.addStyle` function.
- cssdir <String|Array>, cssdirs to find css files
- specials <Object>, some files have special conditons


### example
```js
var gulp = require('gulp')
  , uglify = require('gulp-uglify')
  , scriptCSS = require('gulp-scriptcss')

gulp
  .src(['js/**/*.js'])
  .pipe(uglify())
  .pipe(scriptCSS({
    main: 'main.js',
    specials: {
      'main.js': [
        'css/main1.css',
        'css/main2.css'
      ]
    },
    cssdir: 'css'
  }))
  .pipe(gulp.dest('dist'));
```

### License
MIT
