const fs = require('fs');
const {join} = require('path');
const cheerio = require('cheerio');
const CleanCSS = require('clean-css');

let baseline = {};

function readFilesInDir(dir) {
  return new Promise((resolve, reject) => fs.readdir(dir, (error, files) => {
    if(error) {
      return reject(error);
    }

    resolve(files.filter(file => file.charAt(0) !== '.' && file.match(/\.html$/)));
  }));
}

function readFilePromise(file) {
  return new Promise((resolve, reject) => fs.readFile(file, (error, data) => {
    if(error) {
      reject(error);
    } else {
      resolve(data.toString());
    }
  }));
}

function getCleanCssFromDir(folder) {
  return readFilesInDir(folder)
          .then(files => {
            return files.reduce((promise, file) => {
              return promise.then(result => {
                return readFilePromise(join(folder, file))
                        .then(html => cheerio.load(html))
                        .then($ => $('head style').text())
                        .then(css => new CleanCSS().minify(css).styles)
                        .then(minified => {
                          result[file] = minified;
                          return result;
                        });
              });
            }, Promise.resolve({}));
          });
}

function setBaseline(folder) {
  return getCleanCssFromDir(folder).then(result => baseline = result);
}


function codeAnalyze(folder) {
  return getCleanCssFromDir(folder).then(css => {
    return Object.keys(css).map(key => ({
      percentOffBaseline: css[key].length / baseline[key].length * 100,
      filename: key
    }));
  });
}

exports.codeAnalyze = codeAnalyze;
exports.setBaseline = setBaseline;
