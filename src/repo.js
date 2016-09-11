const {join} = require('path');
const {exec} = require('child_process');

function uniq(a) {
   return Array.from(new Set(a));
}

function gitExec(command) {
  return new Promise((resolve, reject) => {
    let options = {
      cwd: join(__dirname, '../../css-byggeklosser')
    };

    exec(command, options, (error, stdout) => {
      if(error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}


function getBranches() {
  return gitExec('git fetch')
    .then(() => gitExec('git branch --all'))
    .then(d => d.split('\n'))
    .then(a => a.map(b => b.trim()))
    .then(a => a.map(b => b.replace('* ', '').replace('remotes/origin/', '')))
    .then(a => uniq(a))
    .then(a => a.filter(b => b !== 'master' && b !== 'baseline'))
}

function checkout(branchName) {
  console.log(`checking out repo ${branchName}`);
  return gitExec(`git checkout ${branchName}`)
}

function pull() {
  console.log('pulling repo');
  return gitExec(`git pull`).then(output => console.log(output) || output);
}

function getBranchName() {
  return gitExec(`git rev-parse --abbrev-ref HEAD`);
}

function getLastCommitSha() {
  return gitExec(`git rev-parse HEAD`);

}

//
// let changeMap = {};
// function hasChanged(branch) {
//   const branch = getBranchName();
//   const currentSha = getLastCommitSha();
//
//   return changeMap[branch] === currentSha;
// }

exports.getBranches = getBranches;
exports.checkout = checkout;
exports.pull = pull;
