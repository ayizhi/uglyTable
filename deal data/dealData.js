let data = require('./data')

theData = data.data.data;

let reportData = theData.reportData;

console.log(reportData.length)

let tmp = [];


for (let i = 0; i < 50; i++){
	for (let r = 0 ; r < reportData.length; r++){
		tmp.push(reportData[r])
	}
}


console.log(tmp.length)

data.data.data.reportData = tmp


let fs = require('fs');

console.log(data.data.data.reportData.length)

fs.writeFile('output.js',JSON.stringify(data.data))