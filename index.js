var fs = require('fs')
  , path = require('path')

  , through = require('through2')
  , uglify = require('uglify-js')

  , scriptCSSPrefix = 'window.__scriptCSS__&&window.__scriptCSS__("'
  , scriptCSSSuffix = '");\n'
  , scriptCSSGlobal = uglify.minify(path.join(__dirname, 'scriptCSS.js')).code
  , scriptCSSGlobalBuffer = new Buffer(scriptCSSGlobal + '\n')

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

function gulpScriptCSS(options){
  options = options || {};

  if(!options.cssdirs && options.cssdir){
    options.cssdirs = options.cssdir;
  }

  if('string' == typeof options.cssdirs){
    options.cssdirs = [options.cssdirs];
  }

  if('string' == typeof options.main){
    options.main = [options.main];
  }

  options.specials = options.specials || {};

  return through.obj(function(file, enc, done){

    if(file.isNull()){
      return done(null, file);
    }

    var cssFiles = [];
    if(options.specials[file.relative]){
      if('string' == typeof options.specials[file.relative]){
        cssFiles = [options.specials[file.relative]];
      }else{
        cssFiles = options.specials[file.relative];
      }
    }else if(options.cssdirs){
      cssFiles = options.cssdirs.map(function(cssdir){
        return path.join(cssdir, file.basename.replace(/\.js$/, '.css'));
      });
    }

    var cssFile, cssContent = '';
    while(cssFiles.length){
      cssFile = cssFiles.pop();
      if(fs.existsSync(cssFile)){
        cssContent = scriptCSSPrefix + fs.readFileSync(cssFile, 'utf8').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + scriptCSSSuffix + cssContent;
      }
    }
    if(cssContent){
      if(file.isBuffer()){
        file.contents = Buffer.concat([
          new Buffer(cssContent),
          file.contents
        ]);
      }else if(file.isStream()){
        file.contents = file.contents.pipe(prefixStream(new Buffer(cssContent)));
      }
    }

    // add global scriptCSS function
    if(options.main){
      options.main.forEach(function(mainFile){
        if(mainFile == file.relative){
          if(file.isBuffer()){
            file.contents = Buffer.concat([
              scriptCSSGlobalBuffer,
              file.contents
            ]);
          }else if(file.isStream()){
            file.contents = file.contents.pipe(prefixStream(scriptCSSGlobalBuffer));
          }
        }
      });
    }

    return done(null, file);
  });
}

module.exports = gulpScriptCSS;
