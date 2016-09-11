const fs = require('fs');
const {join} = require('path');
const mkdirpCallback = require('mkdirp');
const static = require('node-static');
const Nightmare = require('nightmare');
const {start} = require('./server')

const port = 9090;

function readFilesInDir(dir) {
  return new Promise((resolve, reject) => fs.readdir(dir, (error, files) => {
    if(error) {
      return reject(error);
    }

    resolve(files.filter(file => file.charAt(0) !== '.' && file.match(/\.html$/)));
  }));
}

function mkdirp(path) {
  return new Promise((resolve, reject) => mkdirpCallback(path, error => error ? reject(error) : resolve()))
}

function screenshotDir(screenshotDir, outputDir) {
  console.log(`screenshotting ${screenshotDir}`);
  var server = start(screenshotDir, port);
  const nightmare = Nightmare({ show: false });

  return mkdirp(outputDir)
    .then(() => readFilesInDir(screenshotDir))
    .then((files) => {
      return files.reduce((memo, file) => {
        return memo.then(() => {
          console.log(`shooting ${join(screenshotDir, file)}`);
          const filename = file.replace(/\..+$/, '');

          return nightmare
            .goto(`http://localhost:${port}/${file}?_=${Math.random()}`)
            .wait('body')
            .viewport(320, 568)
            .screenshot(`${outputDir}/${filename}-mobile.png`)
            .viewport(768, 1024)
            .screenshot(`${outputDir}/${filename}-tablet.png`)
            .viewport(1280, 800)
            .screenshot(`${outputDir}/${filename}-laptop.png`)
        });
      }, Promise.resolve())
      .then(() => nightmare.end())
      .then(() => {
        console.log('stopping server');
        return new Promise(resolve => server.close(resolve))
      })
    });
}


//
// takeScreenshot('losningsforslag', 'base-images')
//   .then(() => takeScreenshot('oppgave', 'images'))
//   .then(() => compareImages('base-images', 'images'))
//   .then(diffs => {
//     server.close();
//
//     diffs.forEach((diff) => {
//       console.log(diff);
//       diff.getDiffImage().pack().pipe(fs.createWriteStream(`${__dirname}/diff-images/${diff.filename}`));
//     });
//   })
//   .catch(console.log.bind(console));

exports.screenshotDir = screenshotDir;
