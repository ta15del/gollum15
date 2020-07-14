const allFeatures = require('./allFeatures');
const C45 = require('c4.5');
const fileSystem = require('fs');
const CSVparser = require('papaparse');
const swal = require('sweetalert2');

function isNumeric(n) {
    return !isNaN(n);
}

(async () => {
  var getFeatures = await allFeatures.features();

  await fileSystem.readFile('data_phishing_nonphishing.csv', 'utf-8', function(err, data) {
      if (err) {
        console.error(err);
        return false;
      }
      CSVparser.parse(data, {
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

          var c45 = C45();

        c45.train({
            data: trainingData,
            target: target,
            features: features,
            featureTypes: featureTypes
         }, function(error, model) {
            if (error) {
            console.error(error);
            }

        if (model.classify(getFeatures)=='phishing'){
            swal.fire({
                imageUrl: 'https://www.pngkey.com/png/full/881-8812373_open-warning-icon-png.png',
                imageWidth: 50,
                imageHeight: 50,
                imageAlt: 'Image Warning',
                title: 'This is a fake website!',
                text: "Please don't visit this website, it can steal your data."
              })
        }
      });
    }});
  });
})();

