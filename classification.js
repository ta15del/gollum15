var fs = require('fs');
var test = require('tape');
const assert = require('assert')
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
          // console.log('header:', headers);
          // console.log('feature:', features);
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
          //console.log(model.classify(testData[i])=='phishing') // true or false
          console.log('data test ke:' + i +', hasil => ' + model.classify(testData[i]));
          assert.equal(model.classify(testData[i]), target);
        });
      }, model);
    }
  });
}

  fs.readFile(filename, fileLoaded);
}
test('TA', function (t) {
  t.plan(1);

  testCSV('data_TA.csv', function(classifyTest) {
    var testData = [
      ['onsite','dibawah 22%','tidak menggunakan','tidak menggunakan fungsi mailto','dibawah 31%','diantara 10 - 20','aman','dibawah 17%','tidak memiliki','pendek','tidak menggunakan','sama dengan satu','memiliki','terdaftar','lebih satu tahun','diatas 5 bulan']
      //['onsite','dibawah 22%','menggunakan','tidak menggunakan fungsi mailto','dibawah 31%','dibawah 11','tidak aman','lebih dari 81%','tidak memiliki','pendek','menggunakan','sama dengan dua','memiliki','terdaftar','lebih kecil sama dengan satu tahun','dibawah 6 bulan'],
    ];
    var targets = ['nonphishing'];

    classifyTest(testData, targets);
    t.ok(true)
  });
})
  