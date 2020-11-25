const fs = require('fs');
const FileSaver = require('file-saver');
const feature = require('./allFeatures');
const C45 = require('c4.5');
const fileSystem = require('fs');
const CSVparser = require('papaparse');

function isNumeric(n) {
    return !isNaN(n);
}

var content = [];

(async () => {
    var str = fs.readFileSync('./test.txt', 'utf8');
    var url = str.split('\r\n');
    var time_start_model_build = performance.now();
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
                }, async function(error, model) {
                    if (error) {
                    console.error(error);
                    }
                    var time_end_model_build = performance.now();
                    var time_model_build = time_end_model_build-time_start_model_build;
                    console.log("Processing ....");
                    for (let i = 0; i <= url.length-1; i++) {
                        try {
                            console.log(i);
                            var time_first = performance.now();
                            var link = url[i];
                            var getFeatures = await feature.features(url[i]);
                            var result = await model.classify(getFeatures);
                            var time_last = performance.now();
                            var time_ms = ((time_last - time_first) + time_model_build);
                            content.push(link + ',' + result + ',' + time_ms + '\n');
                            console.log(content);
                        } catch(err){
                            content.push(link + ',' + "error" + ',' + time_ms + '\n');
                        }
                    }
                    var file = new File(content, "test.csv", {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                    FileSaver.saveAs(file);
                    console.log("Done!");
                });       
            }});
        });
})();