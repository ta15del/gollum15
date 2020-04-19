var fs = require('fs');
var C45 = require('c4.5');
var Papa = require('papaparse');

function isNumeric(n) {
  return !isNaN(n);
}

function testCSV(filename, callback) {
  function fileLoaded(err, data) {
    if (err) {
      console.error(err);
      return
    }
    
    const datas = fs.createReadStream(filename);
    parseCSV(datas);
  }

  function parseCSV(file) {
    Papa.parse(file, {
        complete: function(result) {
          var headers = result.data[0];
          var features = headers.slice(1,-1);
          var target = headers[headers.length-1];

          var trainingData = result.data.slice(1).map(function(d) {
            return d.slice(1);
          });

          var featureTypes = trainingData[0].map(function(d) {
            return isNumeric(d) ? 'number' : 'category';
          });
          train(trainingData, target, features, featureTypes);
    }});
  }

  function train(trainingData, target, features, featureTypes) {
    var c45 = C45();

    c45.train({
      data: trainingData,
      target: target,
      features: features,
      featureTypes: featureTypes
    }, function(error, model) {
    if (error) {
      console.error(error);
    } else {
      callback(function(testData, targets) {
        targets.forEach(function(target, i) {
          console.log('data test:\n' + testData[i] +'\nhasil => ' + model.classify(testData[i]));
        });
      }, model);
    }
  });
}

  fs.readFile(filename, fileLoaded);
}

testCSV('data_TA.csv', function(classifyTest) {
  var testData = [
    ['onsite','dibawah 22%','tidak menggunakan','tidak menggunakan fungsi mailto','dibawah 31%','diantara 10 - 20','aman','dibawah 17%','tidak memiliki','pendek','tidak menggunakan','sama dengan satu','memiliki','terdaftar','lebih satu tahun','diatas 5 bulan']
  ];
  var targets = ['phishing','nonphishing'];

  classifyTest(testData, targets);
});
  