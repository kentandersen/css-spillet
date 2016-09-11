const fs = require('fs');
const {join} = require('path');
const resemble = require('node-resemble-js');

function fileExist(file) {
  return new Promise((resolve, reject) => fs.stat(file, (error, stat) => {
    (error) ? reject(error) : resolve(stat);
  }));
}

function readFilesInDir(dir) {
  return new Promise((resolve, reject) => fs.readdir(dir, (error, files) => {
    if(error) {
      return reject(error);
    }

    resolve(files.filter(file => file.charAt(0) !== '.' && file.match(/\.png$/)));
  }));
}

function compareDir(baseImageDir, newImageDir) {

  return readFilesInDir(baseImageDir)
    .then((files) => {

      return files.reduce((memo, filename) => {
        return memo.then((result) => {
          return new Promise((resolve, reject) => {
            const baseImage = join(baseImageDir, filename);
            const newImage = join(newImageDir, filename);

            Promise.all([fileExist(baseImage), fileExist(newImage)])
              .then(() => {
                console.log(`Comparing ${baseImage} and ${newImage}`);
                resemble(baseImage)
                .compareTo(newImage)
                .onComplete(({getDiffImage, misMatchPercentage}) => {
                  const diffOutputStream = fs.createWriteStream(join(newImageDir, filename.replace('.png', '-diff.png')));
                  getDiffImage().pack().pipe(diffOutputStream);

                  diffOutputStream.on('finish', function(){
                    result.push({filename, misMatchPercentage: Number(misMatchPercentage)})
                    resolve(result);
                  });
                });
              })
              .catch(() => resolve(result)); // swallow errors
          });
        });

      }, Promise.resolve([]));
  });
}


exports.compareDir = compareDir;
