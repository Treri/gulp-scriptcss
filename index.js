var fs = require('fs')
  , path = require('path')

  , gutil = require('gulp-util')
  , through = require('through2')
  , chalk = require('chalk')
  , PluginError = gutil.PluginError

  , PLUGIN_NAME = 'gulp-scriptcss'

module.exports = function(options){
  options = options || {};

  if(!options.cssdir){
    gutil.log(chalk.red(PLUGIN_NAME + ': cssdir is not set'));
    // throw new PluginError(PLUGIN_NAME, 'cssdir is not set');
    return through.obj(function(file, enc, done){
      done(null, file);
    });
  }

  if('string' == typeof options.cssdir){
    options.cssdir = [options.cssdir];
  }

  if('string' == typeof options.main){
    options.main = [options.main];
  }

  options.specials = options.specials || {};

  var addStylePrefix = 'window.addStyle&&addStyle("';
  var addStyleSuffix = '");\n';
  var addStyleGlobal = '"function"==typeof window.addStyle||(window.addStyle=function(e){var t=document.createElement("style");t.setAttribute("type","text/css"),t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.getElementsByTagName("head")[0].appendChild(t)});\n';

  return through.obj(function(file, enc, done){

    var cssFiles = [];
    if(options.specials[file.relative]){
      if('string' == typeof options.specials[file.relative]){
        cssFiles = [options.specials[file.relative]];
      }else{
        cssFiles = options.specials[file.relative];
      }
    }else{
      cssFiles = options.cssdir.map(function(cssdir){
        return path.join(cssdir, file.basename.replace(/\.js$/, '.css'));
      });
    }

    var cssFile, cssContent = '';
    while(cssFiles.length){
      cssFile = cssFiles.pop();
      if(fs.existsSync(cssFile)){
        cssContent = addStylePrefix + fs.readFileSync(cssFile, 'utf8').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + addStyleSuffix + cssContent;
      }
    }
    if(cssContent){
      file.contents = Buffer.concat([
        new Buffer(cssContent),
        file.contents
      ]);
    }

    // add global addStyle function
    if(options.main){
      options.main.forEach(function(mainFile){
        if(mainFile == file.relative){
          file.contents = Buffer.concat([
            new Buffer(addStyleGlobal),
            file.contents
          ]);
        }
      });
    }

    done(null, file);
  });
}