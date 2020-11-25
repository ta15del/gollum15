const allFeatures = require('./allFeatures');
const urlParser = require('./urlParser');
const htmlParser = require('./htmlParser');
const C45 = require('c4.5');
const fileSystem = require('fs');
const CSVparser = require('papaparse');
const swal = require('sweetalert2');
const cookies = require('./cookies');

function isNumeric(n) {
    return !isNaN(n);
}

function urlCriteria(url){
  const parser = new URL(url);
    var host = parser.hostname.split(".").reverse();
    var strs = ["org", "net", "edu", "ac", "go", "gov", "int", "mil"];
    var found = strs.find(
        function(str) {
            return (str == host[1] || str == host[0]);
        }
    );
    return found;
}

async function domCriteria(){
  var dom = await htmlParser.DOM_parser();
  var getCart = dom.string.match(/[-a-zA-Z0-9@:%._\+~#= ]*[-@:%._\+~#= ]*cart[-@:%._\+~#= ]*[-a-zA-Z0-9@:%._\+~#= ]*/);
  var getShoppingBag = dom.string.match(/[-a-zA-Z0-9@:%._\+~#= ]*[-@:%._\+~#= ]*shopping[-@:%._\+~#= ]*[-@:%._\+~#= ]*bag[-@:%._\+~#= ]*[-a-zA-Z0-9@:%._\+~#= ]*/);
  var respCart = (getCart !== null);
  var respShoppingBag = (getShoppingBag !== null);
  if (respCart == true || respShoppingBag == true){
      result = "ya";
  } else {
      result = "no";
  }
  return result;
}

(async () => {
  const url = window.location.href;
  var domain = urlParser.domainURL(url);
  var url_checking = urlCriteria(url);
  var dom_checking = await domCriteria();
  if (url_checking ) {
    console.log('Extension is nonactived because this website is not ecommerce website');
  } else {
    if (dom_checking == "ya"){
      var cookie = cookies.getCookie(domain);
      if (cookie != "") {
        console.log("There is a cookie.");
        console.log(cookie);
        if (cookie=='phishing'){
          swal.fire({
              imageUrl: 'https://www.pngkey.com/png/full/881-8812373_open-warning-icon-png.png',
              imageWidth: 50,
              imageHeight: 50,
              imageAlt: 'Image Warning',
              title: 'This is a fake website!',
              text: "Please don't visit this website, it can steal your data."
            })
        }
      } else {
        console.log(cookie);
        console.log("Processing the detection..")
        var getFeatures = await allFeatures.features(url);

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

              console.log(model.classify(getFeatures));  
              await cookies.setCookie(domain, model.classify(getFeatures), 1);  
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
            // If you want to re-build the model, uncomment this
            // fileSystem.writeFileSync('model.json', c45.toJSON());
          }});
        });
      }
    } else {
      console.log('Extension is nonactived');
    }
  };
})();
