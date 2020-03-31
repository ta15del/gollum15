var fs = require('file-system');
var csv = require('csv');
var C45 = require('c4.5');

fs.readFile('./data.csv', function(err, data) {
  if (err) {
    console.error(err);
    return false;
  }

  csv.parse(data, function(err, data) {
    if (err) {
      console.error(err);
      return false;
    }

    var headers = data[0];
    var features = headers.slice(1,-1); // ["attr1", "attr2", "attr3"]
    var featureTypes = ['category','number','category'];
    var trainingData = data.slice(1).map(function(d) {
      return d.slice(1);
    });
    var target = headers[headers.length-1]; // "class"
    var c45 = C45();

    c45.train({
        data: trainingData,
        target: target,
        features: features,
        featureTypes: featureTypes
    }, function(error, model) {
      if (error) {
        console.error(error);
        return false;
      }

      var testData = [
        ['B',71,'False'],
        ['C',70,'True'],
      ];

      console.log(model.classify(testData[0]) === 'CLASS1'); // true
      console.log(model.classify(testData[1]) === 'CLASS2'); // true
    });
  });
});