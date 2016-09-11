// -------------
// * getRemoteBranches()
// * checkout branch
// * pull
// * has anyting changed
// * screenshot
// * next / done?
// * wait 1 min, repeat

const {createWriteStream, createReadStream} = require('fs');
const {join} = require('path');
const {start:startServer, directoryListing} = require('./src/server');
const {getBranches, checkout, pull} = require('./src/repo');
const {screenshotDir} = require('./src/screenshot');
const {compareDir} = require('./src/compare');
const {setBaseline, codeAnalyze} = require('./src/code');
const {addCodeDiff, addImageDiff, getScore} = require('./src/score');

const gameDir = join(__dirname, '../css-byggeklosser');

const srcDir = join(__dirname, 'src');
const outputDir = join(__dirname, 'dist');
const port = 8080;

function checkContestants() {
  console.log('Checking Contestants');
  getBranches()
    .then(branches => {
      return branches.reduce((promise, branch) => {
        return promise
                .then(() => checkout(branch))
                .then(() => pull())
                // .then(() => hasChanged())
                .then(() => codeAnalyze(join(gameDir, 'oppgave')))
                .then(result => addCodeDiff(branch, result))
                .then(() => screenshotDir(join(gameDir, 'oppgave'), join(outputDir, branch)))
                .then(() => compareDir(join(outputDir, 'baseline'), join(outputDir, branch)))
                .then(result => addImageDiff(branch, result))
      }, Promise.resolve());
    })
    .then(() => new Promise(resolve => {
      console.log('waiting 30 seconds');
      setTimeout(resolve, 30000)
    }))
    .then(checkContestants);
}

function copyIndexHtml() {
  return new Promise((resolve, reject) => {

    let writeStream = createWriteStream(join(outputDir, 'index.html'))
    createReadStream(join(srcDir, 'index.html')).pipe(writeStream);

    writeStream.on('finish', resolve);
  })

}

// initialize
startServer(outputDir, port, (request, response, dir) => {
  const {url} = request;

  if(url === '/score.json') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(getScore()));
  } else {
    directoryListing(request, response, dir);
  }
});

copyIndexHtml()
  .then(() => checkout('master'))
  .then(() => pull())
  .then(() => setBaseline(join(gameDir, 'losningsforslag')))
  .then(() => screenshotDir(join(gameDir, 'losningsforslag'), join(outputDir, 'baseline')))
  .then(checkContestants)
  .catch(console.log.bind(console));
