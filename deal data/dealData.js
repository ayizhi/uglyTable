let data = require('./data')

theData = data.data.data;

let reportData = theData.reportData;

console.log(reportData.length)

let tmp = [];


for (let i = 0; i < 10; i++){
	for (let r = 0 ; r < reportData.length; r++){
		tmp.push(reportData[r])
	}
}


console.log(tmp.length)

data.data.data.reportData = tmp



console.log(data.data.data.reportData.length)

let fs = require('fs');


fs.writeFile('output.js',JSON.stringify(data.data))