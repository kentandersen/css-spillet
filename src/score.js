let scoreTable = {}

function addImageDiff(teamName, diff) {
  scoreTable = Object.assign({}, scoreTable, {
    [teamName]: Object.assign({}, scoreTable[teamName], { diff })
  });

  return scoreTable[teamName];
}

function addCodeDiff(teamName, code) {
  scoreTable = Object.assign({}, scoreTable, {
    [teamName]: Object.assign({}, scoreTable[teamName], { code })
  });

  return scoreTable[teamName];
}

function getScore() {
  return scoreTable;
}

exports.addImageDiff = addImageDiff;
exports.addCodeDiff = addCodeDiff;
exports.getScore = getScore;

//
// testbranch4: {
//   diff: [
//     { filename: 'oppgave1-laptop.png', misMatchPercentage: 6.89 },
//     { filename: 'oppgave1-mobile.png', misMatchPercentage: 37.56 },
//     { filename: 'oppgave1-tablet.png', misMatchPercentage: 11.48 }
//   ],
//   code: [
//     { filename: 'oppgave1.html', percentOffBaseline: 0 }
//   ]
// }
