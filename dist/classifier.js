(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
const urlParser = require('./urlParser');
const htmlParser = require('./htmlParser');
const apiHTTPSLookup = require('./apiHTTPSLookup');
const apiWHOIS = require('./apiWHOIS');
const apiWOT = require('./apiWOT');


function isValidURL(string) {
    var res = string.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null);
};

function URLofAnchor_CrossSite(parser, domainURL){
    const anchors = parser.getElementsByTagName('a');
    let count_anchor_crossSite = 0;
    for (let anchor of anchors) {
        let href = anchor.attributes.href;
        if (href){
            getDomainFromAnchor = isValidURL(href.value);
            if (getDomainFromAnchor == true){
                var getDomainFromAnchor = urlParser.domainURL(href.value);
                if (getDomainFromAnchor != domainURL){
                    count_anchor_crossSite = count_anchor_crossSite + 1;
                }
            }             
        }
    }
    var percent_urlOfAnchorCrossSite = (count_anchor_crossSite/anchors.length)*100;
    if (percent_urlOfAnchorCrossSite > 67){
        urlOfAnchorCrossSite = '> 67%';
    } else if (percent_urlOfAnchorCrossSite <= 67 && percent_urlOfAnchorCrossSite >= 31){
        urlOfAnchorCrossSite = '>= 31% dan <= 67%';
    } else {
        urlOfAnchorCrossSite = '< 31%';
    }
    return (urlOfAnchorCrossSite);
}

function faviconRedirection(parser, domainURL){
    try {
        const favicon = parser.querySelector('link[rel="shortcut icon"], link[rel="icon"]').href;
        var getDomainFromFavicon = urlParser.domainURL(favicon);
        if (getDomainFromFavicon != domainURL){
            favicon_redirection = 'cross site';
        } else {
            favicon_redirection = 'on site';
        }
    } catch(err){
        favicon_redirection = 'on site';
    }
   return (favicon_redirection);
}

function prefixSuffix_inDomain(url_parser) {
    try {
        var res = url_parser.match(/(http(s)?:\/\/.)?(www\.)?[a-zA-Z0-9@:%._\+~#=]*\-[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        result = (res !== null);

        if (result == true){
            prefixsuffix = "menggunakan";
        } else {
            prefixsuffix = "tidak menggunakan";
        }
        return(prefixsuffix);
    } catch(err){
        console.log(err);
    }
}

function ipAddress_inDomain(url_parser) {
    try { 
        var res = url_parser.match(/^(http(s)?:\/\/.)?(www\.)?[0-9]*\.[0-9]*\.[0-9]*\.[0-9.]*[a-zA-Z0-9@:%_\+.~#?&//=]*/g);
        result = (res !== null);
        var ipaddress="";
        if (result == true){
            ipaddress = "memiliki";
        } else {
            ipaddress = "tidak memiliki";
        }
        return(ipaddress);
    } catch(err){
        console.log(err);
    }
}

function iFrame(parser){
    const getIframe = parser.getElementsByTagName('iframe');
    if (getIframe.length != 0){
        iframe = 'menggunakan';
    } else {
        iframe = 'tidak menggunakan';
    }
    return (iframe);
}

function linksInTags(parser){
    const links = parser.getElementsByTagName('link');
    const meta = parser.getElementsByTagName('meta');
    let count_linkInTags = links.length + meta.length + parser.scripts.length;
    var all_elements = parser.getElementsByTagName ('*');
    let percent_linkInTags = (count_linkInTags/all_elements.length)*100;
    if (percent_linkInTags > 81){
        linkInTags = '> 81%';
    } else if (percent_linkInTags <= 81 && percent_linkInTags >= 17) {
        linkInTags = '>= 17% dan <= 81%';
    } else {
        linkInTags = '< 17%';
    }
    return (linkInTags);
}

function submittingInformationToEmail(string) {
    var getStringMailto = string.match(/[-a-zA-Z0-9@:%._\+~#= ]*mailto[-a-zA-Z0-9@:%._\+~#= ]*/);
    resp = (getStringMailto !== null);
    if (resp == true){
        mailto = "menggunakan fungsi mailto";
    } else {
        mailto = "tidak menggunakan fungsi mailto";
    }
    return (mailto);
}

function numberOfImages(parser){
    const images = parser.getElementsByTagName('img');
    if (images.length > 20){
        numbOfimages = '> 20';
    } else if (images.length <= 20 && images.length >= 10){
        numbOfimages = '>= 10 dan <= 20 ';
    } else {
        numbOfimages = '< 10';
    }
    return (numbOfimages);
}

async function domainRegistrationLength(domainInfo){
    if (domainInfo){
        var dateFirst = new Date(domainInfo.WhoisRecord.registryData.updatedDate);
        var dateSecond = new Date(domainInfo.WhoisRecord.registryData.expiresDate);
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        var diffDays = (timeDiff / (1000 * 3600 * 24))/365;
        if (diffDays > 1) {
            domain = "> 1 tahun";
        } else {
            domain = "<= 1 tahun";
        }
    } else {
        domain = "<= 1 tahun";
    }
    
    return domain;
}

async function ageOfDomain(ageOfDomainInfo){
    if (ageOfDomainInfo){
        var dateFirst = new Date(ageOfDomainInfo.WhoisRecord.registryData.updatedDate);
        var dateSecond = new Date();
        var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        var diffDays = (timeDiff / (1000 * 3600 * 24))/30;
        if (diffDays < 6) {
            ageDomain = "<= 5 bulan";
        } else {
            ageDomain = "> 5 bulan";
        }
    } else {
        ageDomain = "<= 5 bulan";
    }

    return ageDomain;
}

async function httpsLookup(httpsLookupInfo){
    if (httpsLookupInfo){
        if (httpsLookupInfo['Passed'].length == 0 && httpsLookupInfo['Information'].length == 0) {
            httpslookup = "tidak memiliki";
        } else {
            httpslookup = "memiliki";
        }
    } else {
        httpslookup = "tidak memiliki";
    }
    
    return httpslookup;
}

async function registrationURL_inWHOIS(urlInWHOISInfo){
    if (urlInWHOISInfo){
        if (urlInWHOISInfo.WhoisRecord.dataError == "IN_COMPLETE_DATA" || urlInWHOISInfo.WhoisRecord.parseCode == 0) {
            urlInWHOIS = "tidak terdaftar";
        } else {
            urlInWHOIS = "terdaftar";
        }
    } else {
        urlInWHOIS = "tidak terdaftar";
    }
    
    return urlInWHOIS;
}

async function securityWOT_status(jsonWOT){
    var arr = [];
    if (jsonWOT){
        if (jsonWOT[0].categories){
            for (let key of jsonWOT[0].categories){
                arr.push(key.id);
            }
            var found = arr.find(function(key) { 
                return (key == "301" || key == "302" || key == "303" || key == "304" || key == "501"); 
            }); 
            
            if (found){
                WOTstatus = "aman";
            } else {
                WOTstatus = "tidak aman";
            }
        } else {
            WOTstatus = "tidak aman";
        }
            
    } else {
        WOTstatus = "tidak aman";
    }

    return WOTstatus;
}

function longURLCharacter(url){
    var longCharacters = url.length;
    if (longCharacters > 75){
        longurl = "panjang";
    } else if (longCharacters <= 75 && longCharacters >= 54){
        longurl = "menengah";
    } else {
        longurl = "pendek";
    }
    return longurl;
}

function requestURL_CrossSite(parser, domainURL){
    const images = parser.getElementsByTagName('img');
    const videos = parser.getElementsByTagName('video');
    const audios = parser.getElementsByTagName('audio');
    
    var total_request = images.length + videos.length + audios.length;
    let count_img_crossSite = 0;
    let count_video_crossSite = 0;
    let count_audio_crossSite = 0;

    for (let image of images) {
        let img_src = image.attributes.src;
        if (img_src){
            getDomainFromImg = isValidURL(img_src.value);
            if (getDomainFromImg == true){
                var getDomainFromImg = urlParser.domainURL(img_src.value);
                if (getDomainFromImg != domainURL){
                    count_img_crossSite = count_img_crossSite + 1;
                }
            }             
        }
    }

    for (let video of videos) {
        let video_src = video.attributes.src;
        if (video_src){
            getDomainFromVideo = isValidURL(video_src.value);
            if (getDomainFromVideo == true){
                var getDomainFromVideo = urlParser.domainURL(video_src.value);
                if (getDomainFromVideo != domainURL){
                    count_video_crossSite = count_video_crossSite + 1;
                }
            }             
        }
    }

    for (let audio of audios) {
        let audio_src = audio.attributes.src;
        if (audio_src){
            getDomainFromAudio = isValidURL(audio_src.value);
            if (getDomainFromAudio == true){
                var getDomainFromAudio = urlParser.domainURL(audio_src.value);
                if (getDomainFromAudio != domainURL){
                    count_audio_crossSite = count_audio_crossSite + 1;
                }
            }             
        }
    }

    var total_requestURL_crossSite = ((count_img_crossSite + count_video_crossSite + count_audio_crossSite)/total_request)*100
    if (total_requestURL_crossSite > 65){
        requestUrl = '> 65%';
    } else if (total_requestURL_crossSite <= 65 && total_requestURL_crossSite >= 22){
        requestUrl = '>= 22% dan <= 65%';
    } else {
        requestUrl = '< 22%';
    }
    return (requestUrl);
}

function numberOfSubdomain(url){
    var count_subdomain = 0;
    var subDomainLenght = 0;

    var linkSplit = url.split("//");
    var linkSplitSubdomain = linkSplit[1].split(".").reverse();

    if (linkSplitSubdomain[linkSplitSubdomain.length-1] == 'www') {
        subDomainLenght = linkSplitSubdomain.length-1;
    } else {
        subDomainLenght = linkSplitSubdomain.length;
    }

    if (linkSplitSubdomain[1] == 'co') {
        for (i = 3; i < subDomainLenght; i++) {
            count_subdomain=count_subdomain+1;
          }
    } else {
        for (i = 2; i < subDomainLenght.length; i++) {
            count_subdomain=count_subdomain+1;
          }
    }
    if (count_subdomain > 2){
        numberOf_subdomain = '>2';
    } else if (count_subdomain == 2){
        numberOf_subdomain = '2';
    } else {
        numberOf_subdomain = '>= 0 dan < 2';
    }
    return (numberOf_subdomain);
}

async function features(url){
    var dom = await htmlParser.DOM_parser(url);
    var parser = urlParser.convertToURL(url);
    var domain = urlParser.domainURL(url);
    var api_whois = await apiWHOIS.connectionToWHOIS(domain);
    var api_wot = await apiWOT.connectionToWOT(domain);
    var api_https_lookup = await apiHTTPSLookup.connectionToHTTPSLookup (domain);

    let https_lookup = await httpsLookup(api_https_lookup);
    let domain_registration_length = await domainRegistrationLength(api_whois);
    let age_of_domain = await ageOfDomain(api_whois);
    let registration_URL = await registrationURL_inWHOIS(api_whois);
    let security_WOT = await securityWOT_status(api_wot);
    let adding_prefix_suffix = prefixSuffix_inDomain(parser.hostname);
    let ip_address = ipAddress_inDomain(parser.hostname);
    let URL_of_anchor = URLofAnchor_CrossSite(dom.dom, domain);
    let favicon_redirection = faviconRedirection(dom.dom, domain);
    let iframe = iFrame(dom.dom);
    let links_in_tags = linksInTags(dom.dom);
    let submitting_information_to_email = submittingInformationToEmail(dom.string);
    let number_of_images = numberOfImages(dom.dom);
    let long_URL = longURLCharacter(url);
    let request_URL = requestURL_CrossSite(dom.dom, domain);
    let number_of_subdomain = numberOfSubdomain(url);

    var all_features = [];
    await all_features.push(ip_address,submitting_information_to_email,adding_prefix_suffix,iframe,number_of_images,favicon_redirection,request_URL,
        long_URL,links_in_tags,URL_of_anchor,number_of_subdomain,age_of_domain,https_lookup,registration_URL,domain_registration_length,security_WOT);

    return all_features;
}

module.exports = { features };
},{"./apiHTTPSLookup":3,"./apiWHOIS":4,"./apiWOT":5,"./htmlParser":8,"./urlParser":12}],3:[function(require,module,exports){
const apiHTTPSLookup = 'https://mxtoolbox.com/api/v1/lookup/HTTPS/';

async function connectionToHTTPSLookup(domain){
    let response = await fetch(apiHTTPSLookup + domain);   
    let commits = await response.json();
    return commits;
}

module.exports = { connectionToHTTPSLookup };
},{}],4:[function(require,module,exports){
const apiWHOIS = 'https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_goemvjGAPuDjZ2qySOZeVhHOnk4Cc&outputFormat=JSON&domainName=';

async function connectionToWHOIS(domain){
    let response = await fetch(apiWHOIS + domain);   
    let commits = await response.json();
    return commits;
}

module.exports = { connectionToWHOIS };
},{}],5:[function(require,module,exports){
const apiWOT = 'https://scorecard.api.mywot.com/v3/targets?t=';

var myHeaders = new Headers();
myHeaders.append("X-User-ID", "8470812");
myHeaders.append("X-Api-Key", "86fc2c70bcba96e5a6e47ec0653a150f2899f306");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

async function connectionToWOT(domain){
    return fetch(apiWOT + domain, requestOptions)
        .then(response => response.text())
        .then((responseText) => {
            var json = JSON.parse(responseText);
            return json;
        })
        .catch(error => console.log('error', error));
}

module.exports = { connectionToWOT };
},{}],6:[function(require,module,exports){
(function (process){
const allFeatures = require('./allFeatures');
const urlParser = require('./urlParser');
const htmlParser = require('./htmlParser');
const C45 = require('c4.5');

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

        await process.nextTick(function(){(function(err, data) {
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
        })(null,"URL;ip_address_in_domain;submitting_information_to_email;prefix_suffix_in_domain;iframe;number_of_images;favicon_redirection;request_url_cross_site;long_url_character;links_in_tags;url_of_anchor_cross_site;number_of_subdomain;age_of_domain;https_lookup;registration_url_in_WHOIS;domain_registration_length;security_WOT_status;result\r\nhttps://amazon.de.p122421.com/login/1573372838/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://amazon.de.de-prime.info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://amazon-php-login-aggiornamento-obbligatorio.ddnsgeek.com/centro_clienti/openid.assoc_handle=978/e1c2a91e8f/page/sella-no-otp/index1.php;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://cekpromopesanan.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sellercentral.amazon.it/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https://sellercentral.amazon.it/home&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.assoc_handle=sc_it_amazon_v2&openid.mode=checkid_setup&language=en_IT&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&pageId=sc_it_amazon_v2&openid.ns=http://specs.openid.net/auth/2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.IfL5O4dRmfisb4UvJS3kxfr7IXig5tnuvR6pgoES_4le1nYI4h5JBA.F7oYQqnmCpqgVt2_.DfP4y_7cUGVx6Bav7Q6bit-3eYoro6eopLWRNWbEySMJ6jitN26SH1Ssf6kG14wV4foFl8VF8vLGQFbrmP0H5FIcGmNxbnNxq5QA-rugXoy-jBce65DkyKs-LgeRlMeF9WkHAm24ECSm-WkZqYZiP5fsKNssHU1_1mh-Hho6DVkg-o0QA7_MtmJ-bBMdW-r4x7Qoh8P60-hPkDaVIoc6J-xlz7pZ1d-IhZYG7xw49wvF81KoaXTrlMeX2jkGMkAYSpHQhg.5937ZfiK0ET_w7XXCPZmgQ;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;panjang;> 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;aman;phishing\r\nhttps://rosiprint.com/156808323-1404895579.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;> 65%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-83/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://aws.amazon.com.signin.login.account.invoice.2331548.spielort-mobiliar.com?Z289MSZzMT02MjEwNjEmczI9MTc0MjU5OTUzJnMzPUdMQg=;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ec2-13-58-239-93.us-east-2.compute.amazonaws.com/Ops.aspx?gz=fbb2&gzh=copenhagen@fighters.dk&gzh1=fbb220191105180331665copenhagen@fighters.dk;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://app.salesloft.com/t/10833/c/987d1f81-c812-4bd5-9649-6956a80ce7ae/NB2HI4B2F4XXO53XFZQWE2LMNF2HS3TFOR3W64TLFZRW63JP/www-abilitynetwork-com;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://sales.abilitynetwork.com/t/10833/c/987d1f81-c812-4bd5-9649-6956a80ce7ae/NB2HI4B2F4XXO53XFZQWE2LMNF2HS3TFOR3W64TLFZRW63JP/www-abilitynetwork-com;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www121.ofertoucomprecodeblackfridayveemver.com/ec0f13fd2f15163f71032783ae7ab9de/produto/53430000/ar-condicionado-split-dual-inverter-lg-artcool-12.000-btus-quente-e-frio-220v;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ixjalo.top/special/moncler.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://store-ijfg8801k.mybigcommerce.com/ca;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://my3-ne.twork-ref030.pw/home/my3/app/index?id=1287e0fd7fc2c3fbf2d9b9a0b25ad21c1287e0fd7fc2c3fbf2d9b9a0b25ad21c&session=1287e0fd7fc2c3fbf2d9b9a0b25ad21c1287e0fd7fc2c3fbf2d9b9a0b25ad21c#/Store;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://bestshopdubai.com/voscomptes/mabanque.bnpparibas/3de0c17cc8e5d9b3625413c474f14ed9/index.php;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.safetyrevfn.top/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://comer-upgrade.xyz/logins.asp;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://d-cardl.com/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://vgfyfys.drdfgfs.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://32.19.192.35.bc.googleusercontent.com/app/itaumobile/perso/indexfis.php;memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://efgfs.gyiygyfs.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://217.59.1.154:8080/boa/login.php4;memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://82.91.17.5/boa/login.php4;memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ssl5.fioport.de/vermarktung/spknrw/(S(vmzzfm1pgzlhgzce4lvo4vqu))/login.aspx?ReturnUrl=%2fvermarktung%2fspknrw%2fErrorFallback.aspx%3faspxerrorpath%3d%2fvermarktung%2fspknrw%2fPreviewer.aspx&aspxerrorpath=/vermarktung/spknrw/Previewer.aspx;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://calawex732.temp.swtest.ru/cgi/phpb/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay-card-error.coffeecup.com/ebay.com.html;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-83/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-25/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-66/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://shopfini-short.life/6rBdr;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/460330-mechanical-engineer;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/460256-beer-require-coffee-problem-solving-civil-engineer?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/460373-engineer-because-freakin-is-not-an-official-job-title?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.americanas.blackofertasecreta.com/produto/chosen/134510102/smartphone-samsung-galaxy-a50-android-9-0-tela-6-4-octa-core-128gb-4g-camera-tripla-25mp-5mp-8mp-preto;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nq90.getenjoyment.net/amzon/check.php;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://babocha.s3.us-east-2.amazonaws.com/tantos+-+Copy+(15).html;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;menengah;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/460278-everyone-is-created-equal-only-the-finest-become-civil-engineer?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://aws.amazon.com.signin.login.account.invoice.78415487.siciliastandup.com/amazon/72366949_44459_20/Sign-In.php;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://aws.amazon.com.signin.login.account.invoice.21354584.siciliastandup.com?Z289MSZzMT02MjU2NTEmczI9NzIzNjY5NDkmczM9R0xC;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://oferta-americanas-blackfriday-mkt.joomla.com/produto/134315981/smartphone-samsung-galaxy-a70-128gb-dual-chip-android-9-0-tela-6-7-octa-core-4g-camera-tripla-32mp-5mp-8mp-uw-wriite.php;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.bopies.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www2.amazon.co.jp.tttbhgfdfdsmjhh.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wellingandco.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://lrhb8.com/statics/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://signin.aws.amazon.com.signin.redirect.uri.https.545135123.iran-emrooz.net/amazon/174257341_269290_20/Sign-In.php;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://console.aws.amazon.com.console.home.21854311548.iran-emrooz.net?Z289MSZzMT02MjcwNDAmczI9MTc0MjU3MzQyJnMzPUdMQg=;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://kopa938zar.de/eBaySignInUsingSSL1pUserIdcopartnerIdsiteidruhttpsmyebaydeebayde/Rechnung11.11.2019.htm;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://powerboutique.email/skins/slgl.ln.lsap.log.3333932110869e3c3e6a4691469ab054d6810e11676a/163788138444.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www2.amazon.co.jp.wwwhajkhbscjh.monster/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.ebay.co.uk-online.customer-ukdeskhelp.com/chat/chat?locale=en;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;menengah;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.adidas.com.br/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://tiendaonline2.orange.es/store/moviles-apple/iphone6-plus-16gb-oro-seminuevo?utm_source=orange&utm_medium=home&utm_term=buscador&utm_campaign=movil&AAC_PROMO_CODE=38000;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1573372838/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://217.59.1.154:8080/boa/shopping_cart.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://82.91.17.5/boa/checkout_success.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.ebay.co.uk/itm/2818750339?epid=1352350767&hash=item41y0a4e7e5:miwcrQgfpJCBssPa90oIbuw&var=580845717935;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sellercentral.amazon.de/ap/signin?clientContext=262-8321894-1963829&openid.return_to=https%3A%2F%2Fsellercentral.amazon.de%2Fgp%2Fhomepage.html&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=sc_de_amazon_v2&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.1pC6r9oCbFMYb5siNmFNLtCWFdXjwATxeWO_tXuZYdNGFQYyIUGhDw.bhaXAOyyLISw8yY_.C0toxONSwthjrMMWTdHC0kcwT8kxzqoQRmDeTx9E2ncjEHzJ8uYY7ydSadYmhg0T9FybH73uhLDTGVdM2Yc26clkTsa692pAkgZQB3OPsKDotHGQf2w4XDem0qHv0sCwrPa-Gr8NyMGUEFTvWB4A6jmO3_8CLZyvkPfA2PuXgxBn56Dizep9OG8LEo97pMUXMJVV3ieTHm8zXRwq_GE74C8NhvExUM5goM3DW8PKYQsnJ7wgkn57zmR0_5-D6JmKGtY.ZNb0OtX8NWiugxBMZBTybA;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;panjang;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1573695844/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sellercentral.amazon.de/ap/signin?openid.return_to=https%3A%2F%2Fsellercentral.amazon.de%2Fgp%2Fhomepage.html&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=sc_de_amazon_v2&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&ssoResponse=eyJ6aXAiOiJERUYiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiQTI1NktXIn0.beubBPSSkgZUynI6AyzlzJryaxLBIN-wCd1c1vlGnCius4IfC5T8Ig.mgPsai8czfyayhIh.OfXj1q9xDOsb4vU8ICfF7kCcy_MSNYDMnMSu-fcKF6_0UuoNnITmI9v1tbiZ-wh7qvBNOqfTEbgBMp1hpP8c2Y6y1wVO7KouZMAmuLEM1HvEL1tzCzfKyh4u5Eu1zo8nk3qxkp_a7LkgLmZUrEBlg3J1pOiGxY8HWWqAygJShyZNRFpTi0S50Xvl9KopVgsPpoPye-02o6-XoAfhMWg1KLq3MsiHh0M9bYyacPx7Xzw-WUKR0NjLKlfliyhFGoaXiR4.nGHDF_is8ju_Qdan-PsBmw;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.ebay.co.uk/itm/2818750339?epid=1352350767&hash=item41y0a4e7e5:miwcrQgfpJCBssPa90oIbuw&var=580845717935;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://blacknovember-saldao.com/shopping/NzgwODkzMzA2;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.com-good-condition-apple-iphone-8-plus-256gb.space-gray.xyz/A634575%25258757hpid=880&hash=item1tg_g_QdX-ng%25252525jgv/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://it-amazon-prime-2019-php.freeddns.org/centro_clienti/openid.assoc_handle=341/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.com-item-iphone-7plus-128-gig.zet-matte-jet-black.xyz/A6345759872%252568ghpid=87680&hash=item1eddgg645/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://mehrcardvip.com/wp-includes/ID3/www.alibaba.com/alibaba/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-87/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/terminos-de-compra/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/carros-usados-en-venta/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/precio-de-autos-usados/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/autos-seminuevos/page/4/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/autos-seminuevos/page/5/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/autos-seminuevos/page/3/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/autos-seminuevos/page/2/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/autos-seminuevos/page/7/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-45/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-86/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://lp.nationalinv.com/wp-content/plugins/elementor/core/utils/d_dratting_groundsel.html;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-36/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-95/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-74/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-71/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-15/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-21/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-8/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-31/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-10/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-30/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://netflix.hotmaster.dns-cloud.net/clienteseguro/site/index.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;menengah;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://icloud.appleid.apple.com.dataupdated.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-28/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-11/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-59/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://login.my3-three.com;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-6/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-91/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.moteefe.com/store/thompsontees/thompson234?color=navy-blue&product=men-s-t-shirt;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://canadabodyparts.com/customer/account/login/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://canadabodyparts.com/customer/account/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.moteefe.com/BROWN1?color=oxford-navy&product=unisex-hoodie;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/463607-dog-grandma-greatest-dog-grandma-gifts;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://dentalpharma.hu/upload20b/Nhfd58ed6h2ch05e2.php?em=ZWdhbmdsQGxlZ2Fsc2hpZWxkLmNvbQ==&52537b3d69c0778347a2f4fd0cf694043cdc88893c09429f5de98be24b66c1ba5d43e62ed3ce51afdc779b075b9e17184123853914db3fb127ffcc049d975e5bd0fd16f1158062a10c2b0e660a044aa56b88eafe5ec6a37afa8a;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.moteefe.com/27465750-THOMAS?color=navy-blue&product=men-s-t-shirt;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay.us.contact-secure-receipt-help.ga/?fbclid=IwAR0lB6YZUYY66LwdRaJ4sjRTeJ9_fqX49BMi-hmqyywbkZFhdxrEgaAXYvQ;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/463610-dog-rescue-oklahoma?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/463627-its-not-a-party-until-a-wiener-comes-out?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/462094-vintage-distressed-american-flag-fishing-pole?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/t-shirt/?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1573372838/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www2.amazon.co.jp.qqqhjhsgbnshj.monster;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://t.umblr.com/redirect?z=https%3A%2F%2Famazon-customer-service.accountsissue-info.com%2F%3Famalsoleh&t=Y2Y2Zjg0NGUyMDlmNTllMThhMTgzNzA2ZDA0YWVhZjU5MTMxZjMzYyxzOHhkcDQ1WQ%3D%3D&b=t%3AI10hePd7ACfuP7-cdWHSsg&p=https%3A%2F%2Frakaap182713.tumblr.com%2Fpost%2F188411168372%2Fhttpsamazon-customer-serviceaccountsissue-info&m=1;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://thepicklestore.com/rqs/pay.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/463624-i-was-normal-two-dogs-ago?refId=24190;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/461807-funny-fishing-quote-fishing-solve-most-of-my-problem?refId=24190;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/462161-colorado-elk-hunting-co-state-flag-hunter?refId=24190;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://svipboots.club/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://anandcollection.co.uk/xweb/invoice/invoice/login.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://busanamuslimah.id/iam/dl/?email=leance.tan@sophos.com;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sroxma-ab2cc.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://world.taobao.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;> 81%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://xamua-7cb66.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://eleven-bot-399b7.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://kouaad-fcb97.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://flape-man.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://cabs-ole.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://lime-asap.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.bioprofarma.com/English/css/Billing/update/amazon.com/Amazon;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://servicemazoneorder.demoparlour.com/secure/resolve-account/473d4d311e246ebbe678/cc352b42004772d3a6752e65c99e8a9b/9e00798d5f5c563036c12b69e9659111/cgi/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;< 31%;2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos04.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos26.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos23.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos22.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon-us-west-amazonaws.bjsansam.com/Ops.aspx?j0=fbc4&j0h=laura@dgpcm.com&j0hzf=fbc420191116195537780laura@dgpcm.com;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.apple.com.findmy-ios.info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://apple.co/2K3bEYC;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos21.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos20.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos19.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos1.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria17.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria15.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/bulldozers.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria18.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria09.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/motoconformadoras.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria14.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria19.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria06.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos11.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos10.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos09.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos08.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos07.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos06.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos05.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos03.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos02.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos25.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos24.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos30.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos29.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/autos27.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria07.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria02.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/excavadoras.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria13.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria12.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria05.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria04.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://consumersaudio.com/m/enterpassword.php?333ib61573851012279de053b05ef8455f65d79703b847dc279de053b05ef8455f65d79703b847dc279de053b05ef8455f65d79703b847dc279de053b05ef8455f65d79703b847dc279de053b05ef8455f65d79703b847dc&AP___=katie@methodfinancialplanning.com&error=;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;panjang;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria01.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria00.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/retroexcavadoras.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/formulario.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/tracto.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/vehiculos.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/maquinaria.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/cobre.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://finanzasgob.mx/index.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.finanzasgob.mx/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://store.steampowered.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;phishing\r\nhttp://signin-ebay-de-adduser.2kool4u.net/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://servicemazoneorder.demoparlour.com/secure/resolve-account/473d4d311e246ebbe678/cc352b42004772d3a6752e65c99e8a9b/9e00798d5f5c563036c12b69e9659111/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://servicemazoneorder.demoparlour.com/secure/resolve-account/473d4d311e246ebbe678;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://servicemazoneorder.demoparlour.com/secure/resolve-account/473d4d311e246ebbe678/cc352b42004772d3a6752e65c99e8a9b/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://apple.com.es.view-now.info;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://system.amazon.co.jp.systeminfodo.tk/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://einloggen-ebay-de.totalh.net;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://user-anda.webnode.com/about-us/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://unitus.mk.ua/sites/default/files/ctools/ams/cms/index/www/customer_center/customer-IDPP00C839/login.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;>= 17% dan <= 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.safetyrever.top/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://realshopclub.su/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://vgioyffs.atyiyd.xyz/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.brandairjordan.ru/adidas-ace16-purecontrol-ultra-boost-us10-by1600-triple-white-cream-black-volt-p-65783.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://soropen.github.io/fau/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://hotpriceclub.ru/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://gndcvfgjis.ybhhkjff.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://teehag.com/product/t-shirt/463607-dog-grandma-greatest-dog-grandma-gifts?refId=24190;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.apple.com.es.view-now.info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://httpndegninebaydewsebayisapidllsigninusicgrslwuseridwoabtnecgi.aba.cx/igncgididshaydlledsayIrsAPIdllSignUsingSSLUId&coetynerIdsitesdfecontentebdecgisign/secure/signinbayde/132c0/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://wsindegninebaydewsebayisapidllsigninusicgrslwuseridwoabtnecgi.aba.cx/ebsigncgididshaydlletdsayIrsSAPIdllSignUsingSSLUId&coetynerIdsitesdfecontentcgisign/secure/signinbayde/bfcfe/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.lyrebirdstudio.net.au/wp-content/mail/alibaba/login.alibaba.com.php??email=nobody@mycraftmail.com&;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://kama-87c1b.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sofe-inchena.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://yidst.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ncrd0.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://b9nt1.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ercl.jkjhgj.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://sicherheit-e-bay-kleinanzeigen-fd.com/login.php;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://apple.com.br-support.id/install;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-79/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-68/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-73/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-23/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-98/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-39/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-55/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-20/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-97/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-42/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://fox-consulting.pl/old/wp-admin/user/trademe/2a8e34c5c6197fdd421e98056789b579/log.htm?ip=38.135.95.34;memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://genisse.github.io/nes/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://yon-rotena.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://amao-dc021.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://forfaitsiilimiter2.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://os-ri-mode.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mon-tome.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://8mltd.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ondo-maro.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.safetyrevfo.top/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://anna-prone.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://place-data-22105.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://dion.tyjyepp0.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/?r=YUXXjfSY;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/?r=YUUXSY;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;< 31%;> 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/?r=YUUXSY/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;< 31%;> 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/?r=YUUNSY;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/?r=YUUNJY;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay.co.uk.e350040a85332ldtidx.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://uyfgs.cdtrds.xyz/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://amazon.co.jp.e834d8357afe20be57f60ec435deeb8c1da9386f.info/615ed7fb1504b0c724a296d7a69e6c7b2f9ea2c57c1d8206c5afdf392ebdfd25/signin.php?country=KRRepublic+of+Korea&lang=ja-JP;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://racingwheelsbike.com/signinassignin.ebay.itwseBayISAPI.dllSignasaaaInruhttps3A2F2Fwwawe/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://bnh8r.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://echanta-mess.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://echanta-mess.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sfun-ocine.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ugen-orabe.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://apple.co/2K3bEYC;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://dna-olme.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ddgi5.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://amazon.co.jp.e834d8357afe20be57f60ec435deeb8c1da9386f.info/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;menengah;< 17%;< 31%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.apple.com.findmy-ios.info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;< 17%;< 31%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://daisma-e7e6c.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://oaism-72827.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://olet-mado.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://orige-moci.web.app;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://seminuevos-sigma.com/producto/producto-55/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.trusteeslaw.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay.us.contact-customer-article-help.ga/?fbclid=IwAR0lB6YZUYY66LwdRaJ4sjRTeJ9_fqX49BMi-hmqyywbkZFhdxrEgaAXYvQ;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.mgstyingzhiyou.zj-wiijee.com/static/userid.htm;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay.us.find-articles-contact-help.ga?fbclid=IwAR0lB6YZUYY66LwdRaJ4sjRTeJ9_fqX49BMi-hmqyywbkZFhdxrEgaAXYvQ;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay.us.find-contact-help-secure.ga/?fbclid=IwAR0lB6YZUYY66LwdRaJ4sjRTeJ9_fqX49BMi-hmqyywbkZFhdxrEgaAXYvQ;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.todosprodutos.com.br/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1574085644/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1574078443/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://amazonww.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://g1gec.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.111ea.org/dp/themes/seven/images/home/amazon/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://shengjiangjihs.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://woundht.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://hasmob.com/other/alibaba.com/Login.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://deces06.weebly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://k7ag8.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://servicemazoneorder.demoparlour.com/secure/resolve-account/a3596661f80beea17926/cc352b42004772d3a6752e65c99e8a9b/9e00798d5f5c563036c12b69e9659111/cgi/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;>= 17% dan <= 81%;< 31%;2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sbtyx.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://hasmob.com/other/alibaba.com/Login.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://raesewsart.com/esewsarlokcke/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://boitemobile-vocals.wixsite.com/monsite;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://deces06.weebly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://mobile-freesms.wixsite.com/minsida;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://calls-tring.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://27ypt.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://calls-tring.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://au-ma-di.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://md7jm.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://usmin-moda.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://fone-op.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://4n335.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://baren-od.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://rmher.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://osale-mape.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://one-usan.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://fines-gining.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://shen-amode.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://gotan-one.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://zk1u2.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://fau-mars.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://kaunte-mone.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://coquen-alt.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://soden-olma.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://lote-masme.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://dmacenda.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://isfane-osade.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://das-thing.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://name-ocina.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://font-makeupe.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://sugen-oda.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://dna-olme.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.typeform.com/?utm_source=typeform.com&utm_medium=typeform&utm_content=typeform-incorrectURL&utm_campaign=no-uid;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.huawei.com/mx/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.apple.com.br-inc.co/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.moteefe.com/BROWN1?color=oxford-navy&product=unisex-hoodie;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;menengah;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://elsapeterson.gq;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://001video.com/products_new55q/index.php?azd=ZGVhbkB4b2NvbGF0bC5jb20message-id:;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.tokopedia.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://shopee.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bukalapak.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.lazada.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://blibli.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.jd.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bhinneka.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://loasp-eb772.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ernest-mode.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.sociolla.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ralali.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.blanja.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zalora.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://aliexpress.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;panjang;>= 17% dan <= 81%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.jakartanotebook.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://yon-rotena.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://jghjghhg545z.weebly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.amazon.co.jp.webhost2.ddnsfree.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://club-fox.ru/img/www.loginalibaba.com/alibaba/alibaba/login.alibaba.com.php?email=xxx@yyy.aaue.dk;tidak memiliki;menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mms-sms-x.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.courgeon-immobilier.fr/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://remboursement-web.fr/d/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nocturnalarchitecture.com/alibaba/Login.htm;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://elevenia.co.id/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.ilotte.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.laku6.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.sophieparis.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.jakmall.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.plazakamera.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.mapemall.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttp://www.bimatamagroup.com/tmp/alibaba/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://osiris.instanthosting.com.au/~redfin/terms/Server_Script/ebax/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://vocaleproidorange.web.app/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;< 31%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.onlinecreditcenter6.com/eSecurity/Login/login.action?clientId=amazon&accountType=plcc&langId=en;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;aman;phishing\r\nhttps://al-amaleka.com/classes/_notes/Godly/Alibaba.com/Login.htm;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://aliwirewire.com/inzali/Alibaba.com/Login.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/chaseind.php?cmd=login_submit&id=2155c661def3f3078d0dd7352ffc15fb2155c661def3f3078d0dd7352ffc15fb&session=2155c661def3f3078d0dd7352ffc15fb2155c661def3f3078d0dd7352ffc15fb;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/chaseind.php?cmd=login_submit&id=d405f6b82ba137638ae70b565a422afdd405f6b82ba137638ae70b565a422afd&session=d405f6b82ba137638ae70b565a422afdd405f6b82ba137638ae70b565a422afd;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/chaseind.php?cmd=login_submit&id=2155c661def3f3078d0dd7352ffc15fb2155c661def3f3078d0dd7352ffc15fb&session=2155c661def3f3078d0dd7352ffc15fb2155c661def3f3078d0dd7352ffc15fb;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/chaseind.php?cmd=login_submit&id=f0a702111fc71ae00619814b18fd2a5ef0a702111fc71ae00619814b18fd2a5e&session=f0a702111fc71ae00619814b18fd2a5ef0a702111fc71ae00619814b18fd2a5e;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/update.profile.php?cmd=login_submit;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://wudustore.com/web/chase/update.profile.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://wudustore.com/web/chase/update.profile.php?cmd=login_submit&id=9f142178f6131bae689c9173900062b59f142178f6131bae689c9173900062b5&session=9f142178f6131bae689c9173900062b59f142178f6131bae689c9173900062b5;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://gadgets4use.com/shop-2/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://lotusvisa.com.au/wp-includes/images/smilies/alibaba/alibaba/login.alibaba.com.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;>= 17% dan <= 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://thuvienbachmai.vn/amazon.co.uk.Methodservicesap_signin_detailsencodingUTF8ignoreXOvFLsxWlBBx112AuthStatePaymentMethodUpdate.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?tracelog=notificationtips2016310&to=jim@thejimburkefamily.com&biz_type=&crm_mtn_tracelog_template=200413050&crm_mtn_tracelog_task_id=a370715a-08c1-4f44-a701-9df87dab1ac4&crm_mtn_tracelog_from_sys=service_feedback&crm_mtn_tracelog_log_id=17975007852;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.cazanele-dunarii.ro/wp-content/themes/twentyfifteen/inc/Login.htm?_raxc=61cuel4bq8cad;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://jewelryaholic.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;aman;phishing\r\nhttp://www.lotusvisa.com.au/wp-includes/images/smilies/alibaba/alibaba/login.alibaba.com.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;>= 17% dan <= 81%;< 31%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://materiel-agricole-pellenc.com/translations/en/2013057_exception.htm;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;menengah;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://vannalux.kz/115-dushevye-nabory;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.tamarises.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://canopy4u.com.au/pkginfo/themes/34.237.113.1132108/sucursalpersonas.transaccionesbancolombia.com/mua/index.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;panjang;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.sicilshop.com/prodottitipici/it/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://mintandchopsticks.com/wp-includes/images/media/Your/Apple/ID/verification/customer/secure/center;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;aman;phishing\r\nhttps://www.etsy.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;> 1 tahun;aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?tracelog=notificationtips2016310/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://nmosina.ru/alibaba/ALIBABA/11f8ee2adb3feb3fb57bebe83d03e168/page1.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nmosina.ru/alibaba/ALIBABA/11f8ee2adb3feb3fb57bebe83d03e168/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nmosina.ru/alibaba/ALIBABA/9ab877e8df0b6e043eab0b5266796a69/page1.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nmosina.ru/alibaba/ALIBABA/9ab877e8df0b6e043eab0b5266796a69;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.nmosina.ru/alibaba/ALIBABA/89b43fb1ee59109c36ecd0929cec07ae/page1.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.nmosina.ru/alibaba/ALIBABA/89b43fb1ee59109c36ecd0929cec07ae;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;> 81%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.donnarogersimagery.com/wp-includes/pomo/login.alibaba.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ozelisabetim.com/wp-content/themes/twentytwelve/css/a/Alibaba.com/Alibaba.com/Login.htm;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.apple.com.fmi-et.us/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.de.p122421.com/login/1574118096/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.tutorley.com/ali/Alibaba.co.uk/168162d6e52f1e2184173f353871873b/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.apple.com.es.view-now.info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://apple.com.es.view-now.info/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://travel-market.com.ua/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;< 22%;pendek;< 17%;>= 31% dan <= 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://icloud.com.apple-eu.support/find_location;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://profiling.koha.collecto.ca/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.villavillanola.com/artists/clues/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;cross site;< 22%;pendek;> 81%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://radioabbasfm.com.br/images/login.alibaba.com.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;< 22%;pendek;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://lesentretienslaflamme.com/Alib/Login.htm;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://skinsafecosmetics.com/config/settings/Alibaba.com/Login.htm;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.skinsafecosmetics.com/config/settings/Alibaba.com/Login.htm;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://pages.ebay.de/einkaufen/ebay-kaeuferschutz.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.ebay-kauferschutz.de;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.etsy.com/shop/BowlsByLuigi;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://housbymedia.com/wp-content/upgrade/Alibaba.com/login.html?url_type=header_homepage;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://al-amaleka.com/classes/_notes/Godly/Alibaba.com/Login.htm;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?to=freedom.ponie&tracelog=notificationavoidphishing20160310;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?to=freedom.ponie&tracelog=notificationtips2016310;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://housbymedia.com/wp-content/upgrade/Alibaba.com/login.html?url_type=header_homepage&to=sales1@zskongstar.com&biz_type=&crm_mtn_tracelog_template=200413050&crm_mtn_tracelog_task_id=a3dfa61c-5fb5-4b17-bc6a-c13b3d14d432&crm_mtn_tracelog_from_sys=service_feedback&crm_mtn_tracelog_log_id=19069624366;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.housbymedia.com/wp-content/upgrade/Alibaba.com/login.html?url_type=header_homepage&to=sales1@zskongstar.com&biz_type=&crm_mtn_tracelog_template=200413050&crm_mtn_tracelog_task_id=a3dfa61c-5fb5-4b17-bc6a-c13b3d14d432&crm_mtn_tracelog_from_sys=service_feedback&crm_mtn_tracelog_log_id=19069624366;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://leckerreinschneideir.de/anmelden.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;> 81%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay-windows-10.jaleco.com/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;>= 31% dan <= 67%;2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?url_type=header_homepage;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://gotdy.com/logs/Alibaba.com/Login.htm?url_type=header_homepage&biz_type=&crm_mtn_tracelog_task_id=94312d17-cdf0-42b4-a919-c132dd8956cc&crm_mtn_tracelog_log_id=14196436424;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.alsultanah.com/login.jsp.htm?tracelog=notificationtips2016310/u0026amp;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.apple.com.fmi-et.us/expire/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;> 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.orami.co.id;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://ottencoffee.co.id;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.alfacart.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://fabelio.com;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.mothercare.co.id;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.pemmz.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.qoo10.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://berrybenka.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.sephora.co.id;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://hijabenka.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://lozy.id;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.hijup.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://bro.do/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.matahari.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.bobobobo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://m.bukupedia.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://eci.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.sorabel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.orori.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.maskoolin.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://tees.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.muslimarket.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://serviceforcustomeralpha.com/info/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.304clothing.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://3dmlifestyle.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.30agear.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://316steel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.amazon.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.flipkart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.myntra.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ebay.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.quikr.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.olx.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.jabong.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://offer.alibaba.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.fiverr.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.warbyparker.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.toms.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.birchbox.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.dollarshaveclub.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://woocommerce.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopify.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://magento.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.prestashop.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.opencart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://bonobos.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.leesa.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.everlane.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.greats.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.modcloth.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.asos.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://ambsn.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://shopdressup.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://bohemiantraders.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://ryder.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://moreporks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.dick-moby.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.thehorse.com.au/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://mahabis.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.poketo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://jackiesmith.com.ar/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://grovemade.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://eu.muroexe.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.helbak.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mollyjogger.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.skullcandy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.thingindustries.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://ratiocoffee.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.frankbody.com/int/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.theletterjsupply.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.100percentpure.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.allbirds.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.oipolloi.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.blackbutterflyclothing.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.greenglasscoffee.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://dibruno.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sisuguard.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://daintyjewells.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://shopboxhill.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://teahaus.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.simplychocolate.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://bonbonbon.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://northernism.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.studioproper.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.quadlockcase.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://themodernshop.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://49thcoffee.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.18karatwholesale.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.luxyhair.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ilovebiko.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.unconditional.uk.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.tannergoods.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.studioneat.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://soworthloving.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.hardgraft.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.pipsnacks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.happinessabscissa.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.nickmayerart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.chubbiesshorts.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.madsencycles.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://tattly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.deathwishcoffee.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.littlesparrow.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.twelvesaturdays.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://williamabraham.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://cuppow.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.greatgeorgewatches.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.henkaa.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.manitobah.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.solerebels.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bioliteenergy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.allbirds.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.novoshoes.com.au/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.novowatch.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.curbellplastics.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://firerockgolf.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.overdrive.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sterlitech.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.blake-envelopes.com/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.envelopes.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://easydns.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://sklz.implus.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://diamondcandles.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.beardbrand.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.wetseal.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.framer.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.michalorenjewelry.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.fanstereo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sashanassar.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sheabrand.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.peakdesign.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.made.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.airbnb.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://querohms.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://adoboloco.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.houseofwhiskyscotland.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.lobotz.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://wakamiglobal.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.trendyresumes.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://rotimatic.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.striiiipes.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://jackrudycocktailco.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://pickybars.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://bookstore.entrepreneur.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://damniloveindonesia.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.farfetch.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.fossil.com;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.gogobli.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.kesupermarket.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.kiwi.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.klook.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ogahrugi.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.nike.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.nutrimart.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.pazzion.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://prelo.co.id/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://global.rakuten.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.romwe.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ruparupa.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopbop.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zataru.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.strawberrynet.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.thebodyshop.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.thedresscodes.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://harvestcakes.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://in.via.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.watsons.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://mobile.mi.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zoya.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.weebly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bigcartel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://poweronpoweroff.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://rebeccaatwood.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.baronfig.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://vipp.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.etsy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zibbet.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://selz.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.cratejoy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://jet.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bonanza.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://folksy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.videdressing.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ecrater.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sears.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bigcartel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.stylelend.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://reverb.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.wayfair.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.sendowl.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ecwid.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://sellfy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.onbuy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.tesco.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.snapdeal.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://deals.souq.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.tmall.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.gittigidiyor.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.casasbahia.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.dafiti.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zalando.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.theiconic.com.au/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mydeal.com.au/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zomato.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.gucci.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.chanel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.vans.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.converse.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.hm.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.showpo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.handy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.hayneedle.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.suning.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.walgreens.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.boots.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopping.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.gumtree.com.au/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zulily.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.proflowers.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.givenchy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://eu.louisvuitton.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.talbots.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.hurley.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopping24.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.chewy.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://ateliernewyork.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://ff8ca.weblium.site/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.domki-sodas.pl/?rzz=barry.bennett%40pwgsc.gc.ca;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;< 22%;menengah;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.joinsmarty.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://savetogooglephotos.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://frangosulagroavicola.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://frangosulme.com/index.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.ustream.tv/recorded/125249344%20https://ustream.tv/recorded/125249486%20https://ustream.tv/recorded/125249496%20https://ustream.tv/recorded/125249482;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;< 22%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://magahluihzah.org/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ventasabritas.com/producto/ford-escape-2015/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://ventasabritas.com/producto/fiat-500-sport-2015/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ventasabritas.com/producto/ford-raptor-4x4-2014/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.magalumaisdigital.com/promocao.php;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.masterlocksleutelkluis.nl/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mrovca.com/en/szukaj;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://store.steampowered.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://girlsjewelryusa.com/collections/suknie-wieczorowe;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;menengah;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://vinabivn.com/products/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;>= 17% dan <= 81%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.aicademytech.com/products/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.otto.de/app/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mykipay.com/wp-content/themes/electro/new/n../web.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www.bestspraygun.com/product/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.qvmks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mks.qvmks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.moteefe.com/WOOD999?color=jet-black&product=unisex-hoodie;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://mglufimdeano2019.com/VVaad22as44f510000/index.php?&id=24;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://diasdenovembro.com/Produto/identificacao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ofertasde2020.com/magazineluiza.com.br-48656214/produto_m.php?om.br/jogo-de-panelas-tramontina-antiaderente-de-aluminio-vermelho-10-pecas-turim-20298-722/p/144129900/ud/panl/&id=1;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://liquidacaofinaldeano.com/0244a0588880041auff0/index.php?&id=2;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://clienteofertasonline.com/!!xxa-da54dad11/index.php?rtphone-motorola-moto-g7-64gb-4gb-tela-6-24-full-hd-camera-12-5mp-dual-traseira-onix/p/ak35egh8fh/te/mtg7/&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www-liquida-fim-de-ano.com/2144akjhc014akyr8870/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://clienteofertasonline.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magaluliquidacaobr.com/1840aigaga2518100074/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://peempeem.com/wp-content/themes/peempeem/nic/Alibaba/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;menengah;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ofertasde2020.com/magazineluiza.com.br-48656214/index.php?om.br/jogo-de-panelas-tramontina-antiaderente-de-aluminio-vermelho-10-pecas-turim-20298-722/p/144129900/ud/panl/&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magalupromocionalbr.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.amazon.co.jp.iopkbm9b7ee0128167e28b9.info/3cba81c5c6cac4ce77157631fc2dc277/signin.php?country=ID-Indonesia&lang=en;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://35.239.86.243/promocao.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://243.86.239.35.bc.googleusercontent.com/25181aihj521800084/index.php?&id=1;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;panjang;< 17%;> 67%;> 2;> 5 bulan;memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.mobileheadlightrestorationservice.com/near-us/js/mm/e7109cbf2f64eea05dd4d6c8ab6bc402/cirlo.php?cmd=login_submit&id=$praga$praga&session=$praga$praga;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://diadeliquidacao.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ofertasmagazl.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://oferta-de-natal.com/54a4a1Dhbv_sas47PP/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://auth-corp-node1.com/Login.php?ssl=true&session=f8SAV1xC5uDSTb8W26EFo5NgSrxXzw5PFYpAZXc5rQYl17h4eWJC2wTUYrSyYXnDVNdVKq1bg0xh7OmmK5ZMCSHBjz9hwxVsk8n5ypgPpN6xCtTnySabLRM5qWnXtipOqN;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.importantb.top/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.importantc.top/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magadestaqueofertas-com.umbler.net/magazine//produto.php?linkcompleto=smartphone-samsung-galaxy-a7-duos-dual-chip-4g-android-4.4-cam.-13mp-tela-5.5-proc.-octa-core/p/2128699/te/gaa5/&id=10&fbclid=IwAR1e_09N9w2Wg4q9UCrEGueqUuIxBxiQaWgGReMGmOAkXkMFv8yzucc82NE;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.fimdeanomagazineluiza.com.br/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://fimdeanomagazineluiza.com.br/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magalunovasano.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://promocaoliquidamaga2881.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://mkb120.ca/scripts/composer/alibaba/alibaba/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://co.jp.amazon-managementi-oon.icu/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://luluamiga.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.studiogiardasrls.it/BRd09K41503T7073a/Undone/81481/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://thecutebag.co/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://act-fire.kz/llehsd/trider/lia/oj/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://act-fire.kz/llehsd/trider/lia/2/oj;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;> 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mceventoshermosillo.com/wp-admin/mGo/ecf28032069acafd1a9863d9a5dda831/?%3Fauth=2&client-request-id=bcc7c79d-ad79-43ec-9c70-d12e378805d20cDovL3d3dy5hc@&from=PortalLanding&home=1&login=;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://magalumaiisonline.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magazine-luizapromocao.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magalumaiisonline.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.magalumaiisonline.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magazine-luiza9.xtechcommerce.com/?fbclid=IwAR2fF83Nezc9E971kEokkCMJgjk1cMmmE1OGpFfIaYzbpIZsMj3e4lGSSx8;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://organicwebs.com/client/tb/Alibaba;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ni-iku-amzja.13a4318bd68e27001e72a-akaunto.business/Zr0sH;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amz-jp.preferences-id.13b4288bd68e27001e72a-akaunto.page/ap/signin?openid.pape.max_auth_age=9fc56c4292c198201f3a30e8278c96e8f82b099f&locale=ja_;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://gamesforprizes.site/giveaway/s101/index.html?ip=110.137.27.162&countryname=ID&cep=xqqBajW2cCE1IVvtqJnK7sOslXPjoZNPELu__5QCkEP-sr73xp3wN43MMlcGHG3lKk_BAKT_qwEa4IyE07Wy5aGD_8MGpaS4T3ptVV_xbkG7qjy4fyLGyJ46maXk9ybKUhLO8LIHUbaLBE2OcIdK8Lq0Cim7VQ4Dd0yBDmKQLfbs6v7Uz9TnmlC1JCL5s6GTRsYY5E1oAAAprCnKm8JraCge6ki_sv4vqe9deh3JI75quljvtEfJw8A0D4OXAaQ0QmsAauAsjD2bN9HNeNpYZl7rT-4sY7ZjBLyfRl-cWAxsBiDC3Ahs9rf-mlU1t-IhinJtV96yvqMRZ0p3F9kWmq6nf3XV4PhloBD-gbpqs2I&lptoken=15a7774b97c164db20b1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;panjang;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://consumergiveaways.club/giveaway/it/amz1/dsk.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;menengah;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://isabellacano.com/files/Alibaba.com/images/data/1/1/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebayspay.webcindario.com/index_files/saved_resource(2).html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://magazineluizaliquidacao.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nordichairistanbul.com/wp-admin/oWa/e7efa338542a36e8c7aa19371e9ad4df/?login=%7B%7Bemail%7D%7D;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nordichairistanbul.com/wp-admin/oWa/e7efa338542a36e8c7aa19371e9ad4df/?login={{email}};tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://amazon.co.jp.a8d4b3d45211f96df16a3db4516d3718.buzz/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;menengah;< 17%;< 31%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://korea-collagen.com/telekom/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magazine-luiza9.xtechcommerce.com/?fbclid=IwAR2fF83Nezc9E971kEokkCMJgjk1cMmmE1OGpFfIaYzbpIZsMj3e4lGSSx8;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;panjang;< 17%;> 67%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://ofertaespecialde-natal.com/6akloia01744a577004/index.php?&id=2;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ofertaespecialde-natal.com/00448541a094841f0644/index.php?rtphone-samsung-galaxy-a70-128gb-azul-4g-6gb-ram-tela-67-cam-tripla-selfie-32mp/p/155554800/te/galx/&id=2;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www21.red-ofertas-natal-vempraloja.com/prod18f6079aefda78081dbe4f9982651c54lnk/smartphone-samsung-galaxy-s9-128gb-preto-4g-4gb-ram-tela-5-8-cam-12mp-cam-selfie-8mp/p/2202828/te/gas9;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.noobcopynb.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;panjang;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www86.presentes-promocoes-premier.com/prod86e27ae2423907c786f35056594ed052lnk/iphone-8-plus-apple-256gb-dourado-4g-tela-55-retina-cam-dupla-selfie-7mp-ios-12/p/2223839/te/teip;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ofertaespecialde-natal.com/22405a7jvbbgteklaopjnm/index.php?rtphone-samsung-galaxy-a50-128gb-branco-4g-4gb-ram-tela-64-cam-tripla-cam-selfie-25mp/p/155558900/te/galx/&id=1;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://158.118.193.35.bc.googleusercontent.com/0244a0588880041auff0/index.php?ra-eletrica-cadence-urban-inspire-30-xicaras-preto-e-azul/p/217728100/ep/ceac/&id=1&fbclid=IwAR2UkXc6Ir1G5-vI36P4JeBhHOFMS9SGtFWUNZwe1i31ZhNEAFwsJeq-L9k;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;> 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://35.193.118.158/0244a0588880041auff0/index.php?fbclid=IwAR2UkXc6Ir1G5-vI36P4JeBhHOFMS9SGtFWUNZwe1i31ZhNEAFwsJeq-L9k&id=1;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;> 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www84.presentes-promocoes-premier.com/prod1aa681837013d535fc94b74ff45b20e2lnk/iphone-8-plus-apple-256gb-dourado-4g-tela-55-retina-cam-dupla-selfie-7mp-ios-12/p/2223839/te/teip;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www74.presentes-promocoes-premier.com/prod5d7c5f1e3e0b6d5c669ea87afe683925lnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www40.presentes-promocoes-premier.com/prod0fe1e8e0c3338d8757ace102596adfcelnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR3h8slQ97wVoor4y1s06osRC8gd9DoatOhBU8xyZl_yMcbFE0J946FEobQ;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www34.presentes-promocoes-premier.com/prode93eed73fc7eed7089b8aeffd3a29b72lnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR0QEI96DEwwHNhun_MSnjFv7VRTQQpkgfaIadqPoiQqtmBdcuOwoBbeShg</a;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www43.presentes-promocoes-premier.com/prod3ba6ee9f18d76786d6e5414b2cf36cfelnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR1KZzbrmAKWc-9bhpQQ0X6aUJh5UTtq4g6_gQEsjUXTryCgAsd1w4bCaEc;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www53.presentes-promocoes-premier.com/prodfee1a13c175451dad7a125f9856b521flnk/iphone-8-plus-apple-256gb-dourado-4g-tela-55-retina-cam-dupla-selfie-7mp-ios-12/p/2223839/te/teip;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://uryell.com.br/bc/host/alibaba/alibaba.com/login.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://nordichairistanbul.com/wp-admin/oWa/ac253937d3b0a3f7a601c9f761a5a821/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://nordichairistanbul.com/wp-admin/oWa/0f110c22f303e33482192ce8d79bd511/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://www74.natal-promo-certas.com/prod9edd7ac774892e1391e6350e8799abcalnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR0cK18srrbpd6y66fc1vztv4KpovXPqwe2LAN5LkgXNV_BWs1j4ssHgAsg;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www56.natal-promo-certas.com/prod4f684a425c97c066c5a940683e69296flnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR37WpkDYTgkgc_Gy2cnlo3apQxVX3jki4uoEGK0Lw1u6ceRJa6f5B4vVFk;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www82.natal-promo-certas.com/prodf45d5281bddc2c4e9b7ad3580a9cf63blnk/smart-tv-4k-led-55-samsung-un55ru7100gxzd-wi-fi-bluetooth-3-hdmi-2-usb/p/1934272/et/tv4k?fbclid=IwAR3o1u3N_0PD3c2AWfHSjXOlaY4HGy4A8KiEqNZsoLLHdy2vxm63iHFaJ7c;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ebay-apply-card-pays.tumblr.com/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://cd8672d0-8fb1-4fd2-9bd3-31919394198f.htmlcomponentservice.com/get_draft?id=cd8672_d5e338bfbbcaa0e461de2e371ac0c8f8.html;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttps://americanas-r.joomla.com/smart/tv/samsung/produto.php;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://yedekparcadergisi.com/ism/Ali/test/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://americanas-r.joomla.com/smart/tv/samsung/produto.php?=Smart-TV-LED-55-Samsung-Ultra-HD-4k-55NU7100-com-Conversor-Digital;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;> 1 tahun;tidak aman;phishing\r\nhttp://www.uryell.com.br/bc/host/alibaba/alibaba.com/login.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=xxx@yyy.invalid_;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://widebaybuilding.com.au/error/35f1593c764fa83323732d792003392d/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.phoneinstitut.fr/index.php?cliente=riveron%40terra.com.br%2F8A91VF820HPO4PT;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;panjang;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.promark.fr/cliente_id/ssurroji/62WTPBXG2SS8AROOQM?cliente=joseds.lima@terra.com.br/9EI6Q7B56XE;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://highstreetfashions.com/1/1/1/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email={{email}};tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.phoneinstitut.fr/index.php?cliente=shsd7%40uol.com.br%2FXQ805RXMBT0HURA1ATGQZT61%2Ffinalizacao.cgi;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;panjang;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://35.239.43.13/promocao.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;> 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.phoneinstitut.fr/index.php?cliente=riveron%40terra.com.br%2F8A91VF820HPO4PTEZVK90F2W%2Ffinalizacao.aspx;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;panjang;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.promark.fr/cliente_id/dihugo/EVND5HI2QSWK8R9C43?cliente=riveron@terra.com.br/8A91VF820HPO4PTEZVK90F2W/finalizacao.aspx;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://zara-shops.ru/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://bershka-shops.ru/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://aktualizacja.jst.pl/mmmg/login.alibaba.com/login.html;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ventasabritas.com/producto/honda-crv-2015/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://alibaba.account.confirmation.zade.com/validate.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://alibaba.account.confirmation.zade.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;>= 22% dan <= 65%;pendek;< 17%;>= 31% dan <= 67%;> 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=xxx@yyy.invalid;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay-motors-pro.onyxinnovations.gknu.com/logins/index.php;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;menengah;> 81%;> 67%;2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://ebay-add-cart.com/livenow1;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://astralisconsulting.com.au/the-amazon-notification/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;on site;> 65%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://nsp.biz.ua/registraciya-v-nsp/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.mimarfid.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=unknown@avira.invalid_;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://allegrolokalnie.club/login/form?authorization_uri=https://allegrolokalnie.club/payment?id=2837465905;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=_xxx@yyy.com_;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.ormks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://mks.ormks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://allegrolokalnie.club/login/form;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=_xxx@yyy.com_/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://leckerreinschneideir.de/anmelden.php?assoc_handle=wxNWyVnqSHrau3jzY7ckKZt8Tl0CAv&identifier_select=Nxyl70238n91FZewKgRQ&openid_claim=fm3hBOa7KrxdewQsPDyR&pape_max=cCs70pbrnK3DJ4YtMeIH5gTZFjif6o;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://app.salmacorp.net/alibaba.com/alibaba/login.alibaba.com.php?email=unknown@avira.invalid/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;panjang;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://kj-kj.de/www.ebay.de-signin.ebay.dewseBayISAPIdllSignIn/AQMkADAwATY0MDABLWVlADMwLWFiMjMtMDACLTAwCgBGAAADZiRnufZ6FEmMaP9utIGIjgcA/help/ws.php;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://allegrolokalnie.club/login/form?authorization_uri=https:%2F%2Fallegrolokalnie.club%2Fpayment%3Fid%3D2837465905;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://allegrolokalnie.club/product?id=2837465905;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://34.95.239.208/promocao.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magazineluizasaldao.com/045atggynmay!004ajn/index.php?o-de-panelas-tramontina-antiaderente-de-aluminio-vermelho-10-pecas-turim-20298-722/p/144129900/ud/panl/?origin=aut&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://janeiroliquidadopromo.com/2144akjhc014akyr8870/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magaluiza.site/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://35.226.135.48/1840aigaga2518100074/index.php?id=1;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;> 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://48.135.226.35.bc.googleusercontent.com/1840aigaga2518100074/index.php?&id=1;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;panjang;>= 17% dan <= 81%;> 67%;> 2;> 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://liquidacaolojapromocionaloficial.com/0244a0588880041auff0/index.php?o-de-panelas-tramontina-turim-antiaderente-vermelha-10-pecas/p/6697590/ud/panl/&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://sualiquidacaomagapromo.com/1840aigaga2518100074/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magazineluiza.descontosparavoce.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://191.239.241.99:64000/netshoes/api.php;memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;>= 22% dan <= 65%;pendek;> 81%;>= 31% dan <= 67%;> 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://oferta-especial-do-dia.website/magazineluiza.com.br-15147551/index.php?&id=1;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://masesquentamagazine.com/22405a7jvbbgteklaopjnm/index.php?&id=2;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www65.ano-novo-prime.com/prodc83c2a62f8df09ab8aa4b819b5284d0clnk/ar-condicionado-split-hi-wall-12000-btus-electrolux-eco-turbo-q-f-220v-ve12r/p/6380150/ar/arar;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www39.inicio-de-ano-premiado.com/prodc78d0dad28fdf230fa346f069ae77e97lnk/smartphone-samsung-galaxy-j6-32gb-dual-android-8-1-tela-6-3gb-camera-13mp-5mp-frontal-8mp-vermelho/p/ej15e481jc/te/galx;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magazineluizavirou.com/25181aihj521800084/index.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magazineluizapromocionall.com/1840aigaga2518100074/index.php?rtphone-samsung-galaxy-a50-128gb-branco-4g-4gb-ram-tela-64-cam-tripla-cam-selfie-25mp/p/155558900/te/sga5/&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;panjang;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://limpaestoquepromocoes.xyz/00448541a094841f0644/index.php?&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;menengah;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://www.magazineluizaparavoce.com.br/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://magazineluizaparavoce.com.br/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magaluoutlet.com/22405a7jvbbgteklaopjnm/index.php?o-de-panelas-tramontina-antiaderente-de-aluminio-vermelho-10-pecas-turim-20298-722/p/144129900/ud/panl/?origin=aut&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;>= 22% dan <= 65%;panjang;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magaluoutlet.com/6akloia01744a577004/index.php?o-de-panelas-tramontina-antiaderente-de-aluminio-vermelho-10-pecas-turim-20298-722/p/144129900/ud/panl/?origin&id=1;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;>= 22% dan <= 65%;panjang;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magazineluizavirou.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://promo-2020.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://promo4kjaneiro.bounceme.net/megaoferta/TV-60/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;pendek;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://mulheresmaravi.com/Pohhgasjvvvsa_s/index.php?tadeira-eletrica-sem-oleo-air-fryer-philco-air-fry-saude-preta-3l-com-timer/p/215689600/ep/efso/&id=2;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;> 65%;panjang;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://oferta-especial-de-2020.online/magazineluiza.com.br-48656214/index.php?&id=1;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;> 20;cross site;>= 22% dan <= 65%;panjang;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://magaziinenovas.black/25181aihj521800084/index.php?&id=2;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;menengah;>= 17% dan <= 81%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ofertamagazineluiza.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.ofertamagazineluiza.com/promocao.php;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;cross site;>= 22% dan <= 65%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.ezbuy.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.qoo10.co.id/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://zilingo.com/id-id/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.8wood.id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.pomelofashion.com/id/id/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.reebonz.com/id;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.vmall.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.hc360.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.yhd.com;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.gome.com.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.111.com.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.okbuy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.okhqb.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.zbird.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.mbaobao.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://handuyishe.world.tmall.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.yaofang.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttp://www.lining.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.jqw.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttp://www.xiu.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.kongfz.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttp://www.shishangqiyi.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.bookschina.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.shopin.net/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://cn.china.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.lamabang.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.tootoo.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.quwan.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://china.makepolo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.gongchang.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.homekoo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.wm18.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.opsteel.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://en.yiwugo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.eachnet.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.baimao.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.chinabidding.com.cn;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.eelly.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.winxuan.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.wbiao.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.yougou.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.vancl.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.ymatou.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://www.sfbest.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.juanpi.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.s.cn/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttp://www.youboy.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://www.womai.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://bj.jumei.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://shopping.rediff.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://yebhi.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.primeabgb.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://deltapage.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bitfang.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.theitwares.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zoomin.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://gadgetsguru.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://machpowertools.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.theitdepot.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.vijaysales.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.tradus.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://jjmehta.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://appleid.apple.com-sign.kvhw8ma.work/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;< 22%;pendek;< 17%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://locked.appleid.apple.com.services-and-support.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;on site;< 22%;menengah;< 17%;> 67%;> 2;> 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://appleid.apple.com-signtoupdate.kvhw8ma.work;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;on site;< 22%;pendek;< 17%;> 67%;2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://hs-giveaways.ca/deutsche-shop.php;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;< 17%;> 67%;> 2;<= 5 bulan;tidak memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://paytm.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;>= 31% dan <= 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.limeroad.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.fabindia.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopclues.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://latestone.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.croma.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.gonoise.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://togofogo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.ajio.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.6pm.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.coolwinks.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://yepme.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bluestone.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://fashionandyou.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.voonik.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.voylla.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.mirraw.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.caratlane.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.faballey.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.nykaa.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.purplle.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://prettysecrets.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.koovs.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.clovia.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.shyaway.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.firstcry.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.netmeds.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.healthkart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://id.bookmyshow.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.makemytrip.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.shopify.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.woocommerce.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zibbet.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.coca-cola.co.id/;tidak memiliki;tidak menggunakan fungsi mailto;menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.craftsvilla.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.woodenstreet.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.urbanladder.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.printvenue.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.pupkart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://petshopindia.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.uread.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://khelmart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.giftcart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.archiesonline.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.igp.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://lote-masme.web.app/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.buytea.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttp://shavinsharp.com/sar/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttp://sia.cv/true/ali2;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;tidak terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://ernest-mode.web.app/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://loasp-eb772.web.app/;tidak memiliki;menggunakan fungsi mailto;menggunakan;menggunakan;< 10;cross site;> 65%;pendek;> 81%;> 67%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;phishing\r\nhttps://www.nixon.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.swooneditions.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://finisterre.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.finerylondon.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.nastygal.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.glossier.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.mrporter.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.selfridges.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.johnlewis.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.dior.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://world.coach.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.vip.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mogu.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://row.jimmychoo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.illamasqua.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.marahoffman.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;< 10;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.kenzo.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.lalaberlin.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.stellamccartney.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://forloveandlemons.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttp://asia.christianlouboutin.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.victoriabeckham.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.manoloblahnik.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.larssonjennings.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://world.sportmax.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.blissworld.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.qoo10.co.id/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://wowma.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://zozo.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mercari.com/jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.dmm.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://shopping.yahoo.co.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://310nutrition.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://365inlove.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.32barblues.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.ibushak.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.50spoodleskirts.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.3inute.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.ibraggiotti.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.icing.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;aman;nonphishing\r\nhttps://www.iconery.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;<= 1 tahun;tidak aman;nonphishing\r\nhttps://www.kohls.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://shopping.yahoo.co.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://auctions.yahoo.co.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.amazon.co.jp/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.macys.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.elcorteingles.es/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.lowes.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bestbuy.com/en-ca;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.ebay.es/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mediamarkt.es/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.homesciencetools.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.amazon.es/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.custombarres.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.jeeppeople.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.extra.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.dafiti.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://truelinkswear.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.crossrope.com/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.netshoes.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://cutterbuck.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.casasbahia.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.magazineluiza.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.amazon.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mercadolivre.com.br/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttp://freshfronks.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://aztecasoccer.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;>= 22% dan <= 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://paytmmall.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;>= 10 dan <= 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.1mg.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.zugucase.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.ticketmaster.com.mx/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://in.bookmyshow.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.indiamart.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.physiqapparel.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;tidak aman;nonphishing\r\nhttps://www.newchapter.com/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;> 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.bestbuy.com.mx/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.otto.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.mediamarkt.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.lidl.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.thomann.de/intl/id/index.html;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;tidak menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://en.zalando.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;cross site;> 65%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.saturn.de/;tidak memiliki;tidak menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing\r\nhttps://www.tchibo.de/;tidak memiliki;menggunakan fungsi mailto;tidak menggunakan;menggunakan;> 20;on site;< 22%;pendek;< 17%;< 31%;>= 0 dan < 2;<= 5 bulan;memiliki;terdaftar;> 1 tahun;aman;nonphishing")});
      }
    } else {
      console.log('Extension is nonactived');
    }
  };
})();

}).call(this,require('_process'))
},{"./allFeatures":2,"./cookies":7,"./htmlParser":8,"./urlParser":12,"_process":1,"c4.5":9,"papaparse":10,"sweetalert2":11}],7:[function(require,module,exports){
// function getCookie(c_name)
// {
//     if(typeof localStorage != "undefined") {
//         return localStorage.getItem(c_name);
//     } else {
//         return "";
//     }
// }

// function setCookie(c_name, value, expiredays) {
//     var exdate = new Date();
//     exdate.setDate(exdate.getDate() + expiredays);
//     if(typeof localStorage != "undefined") {
//         localStorage.setItem(c_name, value);
//     } else {
//         document.cookie = c_name + "=" + escape(value) +
//         ((expiredays === null) ? "" : ";expires=" + exdate.toUTCString());
//     }
// }

function setCookie(cookie_name, cookie_value, expires_days) {
    var date_now = new Date();
    date_now.setTime(date_now.getTime() + (expires_days * 24 * 60 * 60 * 1000));
    var expires_time = "expires="+date_now.toUTCString();
    document.cookie = cookie_name + "=" + cookie_value + ";" + expires_time + ";path=/";
}
  
  function getCookie(cookie_name) {
    var get_cname = cookie_name + "=";
    var cookie_split = document.cookie.split(';');
    for(var i = 0; i < cookie_split.length; i++) {
      var cookies = cookie_split[i];
      while (cookies.charAt(0) == ' ') {
        cookies = cookies.substring(1);
      }
      if (cookies.indexOf(get_cname) == 0) {
        return cookies.substring(get_cname.length, cookies.length);
      }
    }
    return "";
}

module.exports = { setCookie, getCookie };
},{}],8:[function(require,module,exports){
async function DOM_parser(){
    var string = document.documentElement.outerHTML;
    const parsers = new DOMParser();
    var dom = parsers.parseFromString(string, 'text/html');
    return { string: string, dom: dom }
}

module.exports = { DOM_parser };
},{}],9:[function(require,module,exports){
(function(root) {
  'use strict';

  function unique(col) {
    var u = {}, a = [];
    for(var i = 0, l = col.length; i < l; ++i){
      if(u.hasOwnProperty(col[i])) {
        continue;
      }
      a.push(col[i]);
      u[col[i]] = 1;
    }
    return a;
  }

  function find(col, pred) {
    var value;
    col.forEach(function(item) {
      var result = pred(item);
      if (result) {
        value = item;
      }
    });
    return value;
  }

  function max(array, fn) {
    var max = -Infinity;
    var index;
    for (var i = 0; i < array.length; i++) {
      var result = fn(array[i]);
      if (result >= max) {
        max = result;
        index = i;
      }
    }
    return typeof index !== 'undefined' ? array[index] : max;
  }

  function sortBy(col, fn) {
   col = [].slice.call(col);
   return col.sort(fn);
  }

  function C45() {
    if (!(this instanceof C45)) {
      return new C45();
    }
    this.features = [];
    this.targets = [];
    this.model = {}
    this.target = ''
  }

  C45.prototype = {
    /**
     * train
     *
     * @param {object} options
     * @param {array} options.data - training data
     * @param {string} options.target - class label
     * @param {array} options.features - features names
     * @param {array} options.featureTypes - features type (ie 'category', 'number')
     * @param {function} callback - callback, containing error and model as parameters
     */
    train: function(options, callback) {
      var data = options.data;
      var target = options.target;
      var features = options.features;
      var featureTypes = options.featureTypes;

      featureTypes.forEach(function(f) {
        if (['number','category'].indexOf(f) === -1) {
          callback(new Error('Unrecognized feature type'));
          return;
        }
      });

      var targets = unique(data.map(function(d) {
        return d[d.length-1];
      }));
      this.features = features;
      this.targets = targets;
      this.target = target

      var classify = this.classify.bind(this)

      var model = {
        features: this.features,
        targets: this.targets,

        // model is the generated tree structure
        model: this._c45(data, target, features, featureTypes, 0),

        classify: function (sample) {
          return classify(this.model, sample)
        },

        toJSON: function() {
          return JSON.stringify(this.model)
        }
      };

      this.model = model.model

      callback(null, model);
    },

    getModel: function() {
      var classify = this.classify.bind(this)
      var model = this.model

      return {
        features: this.features,
        targets: this.targets,
        classify: function (sample) {
          return classify(model, sample)
        },
        toJSON: function() {
          return JSON.stringify(this.model)
        }
      }
    },

    _c45: function(data, target, features, featureTypes, depth) {
      var targets = unique(data.map(function(d) {
        return d[d.length-1];
      }));

      if (!targets.length) {
        return {
          type: 'result',
          value: 'none data',
          name: 'none data'
        };
      }

      if (targets.length === 1) {
        return {
          type: 'result',
          value: targets[0],
          name: targets[0]
        };
      }

      if (!features.length) {
        var topTarget = this.mostCommon(targets);
        return {
          type: 'result',
          value: topTarget,
          name: topTarget
        };
      }

      var bestFeatureData = this.maxGain(data, target, features, featureTypes);
      var bestFeature = bestFeatureData.feature;

      var remainingFeatures = features.slice(0);
      remainingFeatures.splice(features.indexOf(bestFeature), 1);

      if (featureTypes[this.features.indexOf(bestFeature)] === 'category') {
        var possibleValues = unique(data.map(function(d) {
          return d[this.features.indexOf(bestFeature)];
        }.bind(this)));
        var node = {
          name: bestFeature,
          type: 'feature_category',
          values: possibleValues.map(function(v) {
            var newData = data.filter(function(x) {
              return x[this.features.indexOf(bestFeature)] === v;
            }.bind(this));
            var childNode = {
              name: v,
              type: 'feature_value',
              child: this._c45(newData, target, remainingFeatures, featureTypes, depth+1)
            };
            return childNode;
          }.bind(this))
        };
      } else if (featureTypes[this.features.indexOf(bestFeature)] === 'number') {
        var possibleValues = unique(data.map(function(d) {
          return d[this.features.indexOf(bestFeature)];
        }.bind(this)));
        var node = {
          name: bestFeature,
          type: 'feature_number',
          cut: bestFeatureData.cut,
          values: []
        };

        var newDataRight = data.filter(function(x) {
          return parseFloat(x[this.features.indexOf(bestFeature)]) > bestFeatureData.cut;
        }.bind(this));
        var childNodeRight = {
          name: bestFeatureData.cut.toString(),
          type: 'feature_value',
          child: this._c45(newDataRight, target, remainingFeatures, featureTypes, depth+1)
        };
        node.values.push(childNodeRight);

        var newDataLeft = data.filter(function(x) {
          return parseFloat(x[this.features.indexOf(bestFeature)]) <= bestFeatureData.cut;
        }.bind(this));
        var childNodeLeft = {
          name: bestFeatureData.cut.toString(),
          type: 'feature_value',
          child: this._c45(newDataLeft, target, remainingFeatures, featureTypes, depth+1),
        };
        node.values.push(childNodeLeft);
      }
      return node;
    },

    maxGain: function(data, target, features, featureTypes) {
      var g45 = features.map(function(feature) {
        return this.gain(data, target, features, feature, featureTypes);
      }.bind(this));
      return max(g45, function(e) {
        return e.gain;
      });
    },

    gain: function(data, target, features, feature, featureTypes) {
      var setEntropy = this.entropy(data.map(function(d) {
        return d[d.length-1];
      }));
      if (featureTypes[this.features.indexOf(feature)] === 'category') {
        var attrVals = unique(data.map(function(d) {
          return d[this.features.indexOf(feature)];
        }.bind(this)));
        var setSize = data.length;
        var entropies = attrVals.map(function(n) {
          var subset = data.filter(function(x) {
            return x[feature] === n;
          });
          return (subset.length/setSize) * this.entropy(
            subset.map(function(d) {
              return d[d.length-1];
            })
          );
        }.bind(this));
        var sumOfEntropies = entropies.reduce(function(a, b) {
          return a + b;
        }, 0);
        return {
          feature: feature,
          gain: setEntropy - sumOfEntropies,
          cut: 0
        };
      } else if (featureTypes[this.features.indexOf(feature)] === 'number') {
        var attrVals = unique(data.map(function(d) {
          return d[this.features.indexOf(feature)];
        }.bind(this)));
        var gainVals = attrVals.map(function(cut) {
          var cutf = parseFloat(cut);
          var gain = setEntropy - this.conditionalEntropy(data, feature, cutf, target);
          return {
              feature: feature,
              gain: gain,
              cut: cutf
          };
        }.bind(this));
        var maxgain = max(gainVals, function(e) {
          return e.gain;
        });
        return maxgain;
      }
    },

    entropy: function(vals) {
      var uniqueVals = unique(vals);
      var probs = uniqueVals.map(function(x) {
        return this.prob(x, vals);
      }.bind(this));
      var logVals = probs.map(function(p) {
        return -p * this.log2(p);
      }.bind(this));
      return logVals.reduce(function(a, b) {
        return a + b;
      }, 0);
    },

    conditionalEntropy: function(data, feature, cut, target) {
      var subset1 = data.filter(function(x) {
        return parseFloat(x[this.features.indexOf(feature)]) <= cut;
      }.bind(this));
      var subset2 = data.filter(function(x) {
        return parseFloat(x[this.features.indexOf(feature)]) > cut;
      }.bind(this));
      var setSize = data.length;
      return subset1.length/setSize * this.entropy(
        subset1.map(function(d) {
          return d[d.length-1];
        })
      ) + subset2.length/setSize*this.entropy(
        subset2.map(function(d) {
          return d[d.length-1];
        })
      );
    },

    prob: function(target, targets) {
      return this.count(target,targets)/targets.length;
    },

    mostCommon: function(targets) {
      return sortBy(targets, function(target) {
        return this.count(target, targets);
      }.bind(this)).reverse()[0];
    },

    count: function(target, targets) {
      return targets.filter(function(t) {
        return t === target;
      }).length;
    },

    log2: function(n) {
      return Math.log(n) / Math.log(2);
    },

    toJSON: function() {
      return JSON.stringify({
        features: this.features,
        targets: this.targets,
        target: this.target,
        model: this.model,
      })
    },

    classify: function classify(model, sample) {
      // root is feature (attribute) containing all sub values
      var root = model;

      if (typeof root === 'undefined') {
        throw new Error('model is undefined')
      }

      while (root.type !== 'result') {
        var childNode;

        if (root.type === 'feature_number') {
          var featureName = root.name;
          var sampleVal = parseFloat(sample[featureName]);

          if (sampleVal <= root.cut) {
            childNode = root.values[1];
          } else {
            childNode = root.values[0];
          }
        } else {
          // feature syn attribute
          var feature = root.name;
          var sampleValue = sample[this.features.indexOf(feature)];

          // sub value , containing 2 childs
          childNode = find(root.values, function(x) {
            return x.name === sampleValue;
          });
        }

        // non trained feature
        if (typeof childNode === 'undefined') {
          return 'unknown';
        }
        root = childNode.child;
      }
      return root.value;
    },

    restore: function(options) {
      this.features = options.features || []
      this.targets = options.targets || ''
      this.target = options.target || ''
      this.model = options.model || {}
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = C45;
    }
    exports.C45 = C45;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return C45;
    });
  } else {
    root.C45 = C45;
  }

})(this);

},{}],10:[function(require,module,exports){
/* @license
Papa Parse
v5.2.0
https://github.com/mholt/PapaParse
License: MIT
*/
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof module&&"undefined"!=typeof exports?module.exports=t():e.Papa=t()}(this,function s(){"use strict";var f="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==f?f:{};var n=!f.document&&!!f.postMessage,o=n&&/blob:/i.test((f.location||{}).protocol),a={},h=0,b={parse:function(e,t){var i=(t=t||{}).dynamicTyping||!1;U(i)&&(t.dynamicTypingFunction=i,i={});if(t.dynamicTyping=i,t.transform=!!U(t.transform)&&t.transform,t.worker&&b.WORKERS_SUPPORTED){var r=function(){if(!b.WORKERS_SUPPORTED)return!1;var e=(i=f.URL||f.webkitURL||null,r=s.toString(),b.BLOB_URL||(b.BLOB_URL=i.createObjectURL(new Blob(["(",r,")();"],{type:"text/javascript"})))),t=new f.Worker(e);var i,r;return t.onmessage=_,t.id=h++,a[t.id]=t}();return r.userStep=t.step,r.userChunk=t.chunk,r.userComplete=t.complete,r.userError=t.error,t.step=U(t.step),t.chunk=U(t.chunk),t.complete=U(t.complete),t.error=U(t.error),delete t.worker,void r.postMessage({input:e,config:t,workerId:r.id})}var n=null;b.NODE_STREAM_INPUT,"string"==typeof e?n=t.download?new l(t):new p(t):!0===e.readable&&U(e.read)&&U(e.on)?n=new g(t):(f.File&&e instanceof File||e instanceof Object)&&(n=new c(t));return n.stream(e)},unparse:function(e,t){var n=!1,_=!0,m=",",v="\r\n",s='"',a=s+s,i=!1,r=null;!function(){if("object"!=typeof t)return;"string"!=typeof t.delimiter||b.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter);("boolean"==typeof t.quotes||"function"==typeof t.quotes||Array.isArray(t.quotes))&&(n=t.quotes);"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(i=t.skipEmptyLines);"string"==typeof t.newline&&(v=t.newline);"string"==typeof t.quoteChar&&(s=t.quoteChar);"boolean"==typeof t.header&&(_=t.header);if(Array.isArray(t.columns)){if(0===t.columns.length)throw new Error("Option columns is empty");r=t.columns}void 0!==t.escapeChar&&(a=t.escapeChar+s)}();var o=new RegExp(q(s),"g");"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return u(null,e,i);if("object"==typeof e[0])return u(r||h(e[0]),e,i)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:h(e.data[0])),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),u(e.fields||[],e.data||[],i);throw new Error("Unable to serialize unrecognized input");function h(e){if("object"!=typeof e)return[];var t=[];for(var i in e)t.push(i);return t}function u(e,t,i){var r="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var n=Array.isArray(e)&&0<e.length,s=!Array.isArray(t[0]);if(n&&_){for(var a=0;a<e.length;a++)0<a&&(r+=m),r+=y(e[a],a);0<t.length&&(r+=v)}for(var o=0;o<t.length;o++){var h=n?e.length:t[o].length,u=!1,f=n?0===Object.keys(t[o]).length:0===t[o].length;if(i&&!n&&(u="greedy"===i?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===i&&n){for(var d=[],l=0;l<h;l++){var c=s?e[l]:l;d.push(t[o][c])}u=""===d.join("").trim()}if(!u){for(var p=0;p<h;p++){0<p&&!f&&(r+=m);var g=n&&s?e[p]:p;r+=y(t[o][g],p)}o<t.length-1&&(!i||0<h&&!f)&&(r+=v)}}return r}function y(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);var i=e.toString().replace(o,a),r="boolean"==typeof n&&n||"function"==typeof n&&n(e,t)||Array.isArray(n)&&n[t]||function(e,t){for(var i=0;i<t.length;i++)if(-1<e.indexOf(t[i]))return!0;return!1}(i,b.BAD_DELIMITERS)||-1<i.indexOf(m)||" "===i.charAt(0)||" "===i.charAt(i.length-1);return r?s+i+s:i}}};if(b.RECORD_SEP=String.fromCharCode(30),b.UNIT_SEP=String.fromCharCode(31),b.BYTE_ORDER_MARK="\ufeff",b.BAD_DELIMITERS=["\r","\n",'"',b.BYTE_ORDER_MARK],b.WORKERS_SUPPORTED=!n&&!!f.Worker,b.NODE_STREAM_INPUT=1,b.LocalChunkSize=10485760,b.RemoteChunkSize=5242880,b.DefaultDelimiter=",",b.Parser=w,b.ParserHandle=i,b.NetworkStreamer=l,b.FileStreamer=c,b.StringStreamer=p,b.ReadableStreamStreamer=g,f.jQuery){var d=f.jQuery;d.fn.parse=function(o){var i=o.config||{},h=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&f.FileReader)||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)h.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},i)})}),e(),this;function e(){if(0!==h.length){var e,t,i,r,n=h[0];if(U(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,i=n.inputElem,r=s.reason,void(U(o.error)&&o.error({name:e},t,i,r));if("skip"===s.action)return void u();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config))}else if("skip"===s)return void u()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){U(a)&&a(e,n.file,n.inputElem),u()},b.parse(n.file,n.instanceConfig)}else U(o.complete)&&o.complete()}function u(){h.splice(0,1),e()}}}function u(e){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=E(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new i(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&U(this._config.beforeFirstChunk)){var i=this._config.beforeFirstChunk(e);void 0!==i&&(e=i)}this.isFirstChunk=!1,this._halted=!1;var r=this._partialLine+e;this._partialLine="";var n=this._handle.parse(r,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var s=n.meta.cursor;this._finished||(this._partialLine=r.substring(s-this._baseIndex),this._baseIndex=s),n&&n.data&&(this._rowCount+=n.data.length);var a=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(o)f.postMessage({results:n,workerId:b.WORKER_ID,finished:a});else if(U(this._config.chunk)&&!t){if(this._config.chunk(n,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);n=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(n.data),this._completeResults.errors=this._completeResults.errors.concat(n.errors),this._completeResults.meta=n.meta),this._completed||!a||!U(this._config.complete)||n&&n.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),a||n&&n.meta.paused||this._nextChunk(),n}this._halted=!0},this._sendError=function(e){U(this._config.error)?this._config.error(e):o&&this._config.error&&f.postMessage({workerId:b.WORKER_ID,error:e,finished:!1})}}function l(e){var r;(e=e||{}).chunkSize||(e.chunkSize=b.RemoteChunkSize),u.call(this,e),this._nextChunk=n?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(r=new XMLHttpRequest,this._config.withCredentials&&(r.withCredentials=this._config.withCredentials),n||(r.onload=y(this._chunkLoaded,this),r.onerror=y(this._chunkError,this)),r.open(this._config.downloadRequestBody?"POST":"GET",this._input,!n),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var t in e)r.setRequestHeader(t,e[t])}if(this._config.chunkSize){var i=this._start+this._config.chunkSize-1;r.setRequestHeader("Range","bytes="+this._start+"-"+i)}try{r.send(this._config.downloadRequestBody)}catch(e){this._chunkError(e.message)}n&&0===r.status&&this._chunkError()}},this._chunkLoaded=function(){4===r.readyState&&(r.status<200||400<=r.status?this._chunkError():(this._start+=this._config.chunkSize?this._config.chunkSize:r.responseText.length,this._finished=!this._config.chunkSize||this._start>=function(e){var t=e.getResponseHeader("Content-Range");if(null===t)return-1;return parseInt(t.substring(t.lastIndexOf("/")+1))}(r),this.parseChunk(r.responseText)))},this._chunkError=function(e){var t=r.statusText||e;this._sendError(new Error(t))}}function c(e){var r,n;(e=e||{}).chunkSize||(e.chunkSize=b.LocalChunkSize),u.call(this,e);var s="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,n=e.slice||e.webkitSlice||e.mozSlice,s?((r=new FileReader).onload=y(this._chunkLoaded,this),r.onerror=y(this._chunkError,this)):r=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var t=Math.min(this._start+this._config.chunkSize,this._input.size);e=n.call(e,this._start,t)}var i=r.readAsText(e,this._config.encoding);s||this._chunkLoaded({target:{result:i}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(r.error)}}function p(e){var i;u.call(this,e=e||{}),this.stream=function(e){return i=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e,t=this._config.chunkSize;return t?(e=i.substring(0,t),i=i.substring(t)):(e=i,i=""),this._finished=!i,this.parseChunk(e)}}}function g(e){u.call(this,e=e||{});var t=[],i=!0,r=!1;this.pause=function(){u.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){u.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){r&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):i=!0},this._streamData=y(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),i&&(i=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=y(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=y(function(){this._streamCleanUp(),r=!0,this._streamData("")},this),this._streamCleanUp=y(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function i(m){var a,o,h,r=Math.pow(2,53),n=-r,s=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)(e[-+]?\d+)?\s*$/,u=/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,t=this,i=0,f=0,d=!1,e=!1,l=[],c={data:[],errors:[],meta:{}};if(U(m.step)){var p=m.step;m.step=function(e){if(c=e,_())g();else{if(g(),0===c.data.length)return;i+=e.data.length,m.preview&&i>m.preview?o.abort():(c.data=c.data[0],p(c,t))}}}function v(e){return"greedy"===m.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function g(){if(c&&h&&(k("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+b.DefaultDelimiter+"'"),h=!1),m.skipEmptyLines)for(var e=0;e<c.data.length;e++)v(c.data[e])&&c.data.splice(e--,1);return _()&&function(){if(!c)return;function e(e){U(m.transformHeader)&&(e=m.transformHeader(e)),l.push(e)}if(Array.isArray(c.data[0])){for(var t=0;_()&&t<c.data.length;t++)c.data[t].forEach(e);c.data.splice(0,1)}else c.data.forEach(e)}(),function(){if(!c||!m.header&&!m.dynamicTyping&&!m.transform)return c;function e(e,t){var i,r=m.header?{}:[];for(i=0;i<e.length;i++){var n=i,s=e[i];m.header&&(n=i>=l.length?"__parsed_extra":l[i]),m.transform&&(s=m.transform(s,n)),s=y(n,s),"__parsed_extra"===n?(r[n]=r[n]||[],r[n].push(s)):r[n]=s}return m.header&&(i>l.length?k("FieldMismatch","TooManyFields","Too many fields: expected "+l.length+" fields but parsed "+i,f+t):i<l.length&&k("FieldMismatch","TooFewFields","Too few fields: expected "+l.length+" fields but parsed "+i,f+t)),r}var t=1;!c.data.length||Array.isArray(c.data[0])?(c.data=c.data.map(e),t=c.data.length):c.data=e(c.data,0);m.header&&c.meta&&(c.meta.fields=l);return f+=t,c}()}function _(){return m.header&&0===l.length}function y(e,t){return i=e,m.dynamicTypingFunction&&void 0===m.dynamicTyping[i]&&(m.dynamicTyping[i]=m.dynamicTypingFunction(i)),!0===(m.dynamicTyping[i]||m.dynamicTyping)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&(function(e){if(s.test(e)){var t=parseFloat(e);if(n<t&&t<r)return!0}return!1}(t)?parseFloat(t):u.test(t)?new Date(t):""===t?null:t):t;var i}function k(e,t,i,r){var n={type:e,code:t,message:i};void 0!==r&&(n.row=r),c.errors.push(n)}this.parse=function(e,t,i){var r=m.quoteChar||'"';if(m.newline||(m.newline=function(e,t){e=e.substring(0,1048576);var i=new RegExp(q(t)+"([^]*?)"+q(t),"gm"),r=(e=e.replace(i,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<r[0].length;if(1===r.length||s)return"\n";for(var a=0,o=0;o<r.length;o++)"\n"===r[o][0]&&a++;return a>=r.length/2?"\r\n":"\r"}(e,r)),h=!1,m.delimiter)U(m.delimiter)&&(m.delimiter=m.delimiter(e),c.meta.delimiter=m.delimiter);else{var n=function(e,t,i,r,n){var s,a,o,h;n=n||[",","\t","|",";",b.RECORD_SEP,b.UNIT_SEP];for(var u=0;u<n.length;u++){var f=n[u],d=0,l=0,c=0;o=void 0;for(var p=new w({comments:r,delimiter:f,newline:t,preview:10}).parse(e),g=0;g<p.data.length;g++)if(i&&v(p.data[g]))c++;else{var _=p.data[g].length;l+=_,void 0!==o?0<_&&(d+=Math.abs(_-o),o=_):o=_}0<p.data.length&&(l/=p.data.length-c),(void 0===a||d<=a)&&(void 0===h||h<l)&&1.99<l&&(a=d,s=f,h=l)}return{successful:!!(m.delimiter=s),bestDelimiter:s}}(e,m.newline,m.skipEmptyLines,m.comments,m.delimitersToGuess);n.successful?m.delimiter=n.bestDelimiter:(h=!0,m.delimiter=b.DefaultDelimiter),c.meta.delimiter=m.delimiter}var s=E(m);return m.preview&&m.header&&s.preview++,a=e,o=new w(s),c=o.parse(a,t,i),g(),d?{meta:{paused:!0}}:c||{meta:{paused:!1}}},this.paused=function(){return d},this.pause=function(){d=!0,o.abort(),a=U(m.chunk)?"":a.substring(o.getCharIndex())},this.resume=function(){t.streamer._halted?(d=!1,t.streamer.parseChunk(a,!0)):setTimeout(t.resume,3)},this.aborted=function(){return e},this.abort=function(){e=!0,o.abort(),c.meta.aborted=!0,U(m.complete)&&m.complete(c),a=""}}function q(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function w(e){var O,D=(e=e||{}).delimiter,I=e.newline,T=e.comments,A=e.step,L=e.preview,F=e.fastMode,z=O=void 0===e.quoteChar?'"':e.quoteChar;if(void 0!==e.escapeChar&&(z=e.escapeChar),("string"!=typeof D||-1<b.BAD_DELIMITERS.indexOf(D))&&(D=","),T===D)throw new Error("Comment character same as delimiter");!0===T?T="#":("string"!=typeof T||-1<b.BAD_DELIMITERS.indexOf(T))&&(T=!1),"\n"!==I&&"\r"!==I&&"\r\n"!==I&&(I="\n");var M=0,j=!1;this.parse=function(a,t,i){if("string"!=typeof a)throw new Error("Input must be a string");var r=a.length,e=D.length,n=I.length,s=T.length,o=U(A),h=[],u=[],f=[],d=M=0;if(!a)return R();if(F||!1!==F&&-1===a.indexOf(O)){for(var l=a.split(I),c=0;c<l.length;c++){if(f=l[c],M+=f.length,c!==l.length-1)M+=I.length;else if(i)return R();if(!T||f.substring(0,s)!==T){if(o){if(h=[],b(f.split(D)),S(),j)return R()}else b(f.split(D));if(L&&L<=c)return h=h.slice(0,L),R(!0)}}return R()}for(var p=a.indexOf(D,M),g=a.indexOf(I,M),_=new RegExp(q(z)+q(O),"g"),m=a.indexOf(O,M);;)if(a[M]!==O)if(T&&0===f.length&&a.substring(M,M+s)===T){if(-1===g)return R();M=g+n,g=a.indexOf(I,M),p=a.indexOf(D,M)}else{if(-1!==p&&(p<g||-1===g)){if(!(p<m)){f.push(a.substring(M,p)),M=p+e,p=a.indexOf(D,M);continue}var v=x(p,m,g);if(v&&void 0!==v.nextDelim){p=v.nextDelim,m=v.quoteSearch,f.push(a.substring(M,p)),M=p+e,p=a.indexOf(D,M);continue}}if(-1===g)break;if(f.push(a.substring(M,g)),C(g+n),o&&(S(),j))return R();if(L&&h.length>=L)return R(!0)}else for(m=M,M++;;){if(-1===(m=a.indexOf(O,m+1)))return i||u.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:h.length,index:M}),E();if(m===r-1)return E(a.substring(M,m).replace(_,O));if(O!==z||a[m+1]!==z){if(O===z||0===m||a[m-1]!==z){-1!==p&&p<m+1&&(p=a.indexOf(D,m+1)),-1!==g&&g<m+1&&(g=a.indexOf(I,m+1));var y=w(-1===g?p:Math.min(p,g));if(a[m+1+y]===D){f.push(a.substring(M,m).replace(_,O)),a[M=m+1+y+e]!==O&&(m=a.indexOf(O,M)),p=a.indexOf(D,M),g=a.indexOf(I,M);break}var k=w(g);if(a.substring(m+1+k,m+1+k+n)===I){if(f.push(a.substring(M,m).replace(_,O)),C(m+1+k+n),p=a.indexOf(D,M),m=a.indexOf(O,M),o&&(S(),j))return R();if(L&&h.length>=L)return R(!0);break}u.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:h.length,index:M}),m++}}else m++}return E();function b(e){h.push(e),d=M}function w(e){var t=0;if(-1!==e){var i=a.substring(m+1,e);i&&""===i.trim()&&(t=i.length)}return t}function E(e){return i||(void 0===e&&(e=a.substring(M)),f.push(e),M=r,b(f),o&&S()),R()}function C(e){M=e,b(f),f=[],g=a.indexOf(I,M)}function R(e){return{data:h,errors:u,meta:{delimiter:D,linebreak:I,aborted:j,truncated:!!e,cursor:d+(t||0)}}}function S(){A(R()),h=[],u=[]}function x(e,t,i){var r={nextDelim:void 0,quoteSearch:void 0},n=a.indexOf(O,t+1);if(t<e&&e<n&&(n<i||-1===i)){var s=a.indexOf(D,n);if(-1===s)return r;n<s&&(n=a.indexOf(O,n+1)),r=x(s,n,i)}else r={nextDelim:e,quoteSearch:t};return r}},this.abort=function(){j=!0},this.getCharIndex=function(){return M}}function _(e){var t=e.data,i=a[t.workerId],r=!1;if(t.error)i.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){r=!0,m(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:v,resume:v};if(U(i.userStep)){for(var s=0;s<t.results.data.length&&(i.userStep({data:t.results.data[s],errors:t.results.errors,meta:t.results.meta},n),!r);s++);delete t.results}else U(i.userChunk)&&(i.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!r&&m(t.workerId,t.results)}function m(e,t){var i=a[e];U(i.userComplete)&&i.userComplete(t),i.terminate(),delete a[e]}function v(){throw new Error("Not implemented.")}function E(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var i in e)t[i]=E(e[i]);return t}function y(e,t){return function(){e.apply(t,arguments)}}function U(e){return"function"==typeof e}return o&&(f.onmessage=function(e){var t=e.data;void 0===b.WORKER_ID&&t&&(b.WORKER_ID=t.workerId);if("string"==typeof t.input)f.postMessage({workerId:b.WORKER_ID,results:b.parse(t.input,t.config),finished:!0});else if(f.File&&t.input instanceof File||t.input instanceof Object){var i=b.parse(t.input,t.config);i&&f.postMessage({workerId:b.WORKER_ID,results:i,finished:!0})}}),(l.prototype=Object.create(u.prototype)).constructor=l,(c.prototype=Object.create(u.prototype)).constructor=c,(p.prototype=Object.create(p.prototype)).constructor=p,(g.prototype=Object.create(u.prototype)).constructor=g,b});
},{}],11:[function(require,module,exports){
/*!
* sweetalert2 v9.10.12
* Released under the MIT License.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Sweetalert2 = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  var consolePrefix = 'SweetAlert2:';
  /**
   * Filter the unique values into a new array
   * @param arr
   */

  var uniqueArray = function uniqueArray(arr) {
    var result = [];

    for (var i = 0; i < arr.length; i++) {
      if (result.indexOf(arr[i]) === -1) {
        result.push(arr[i]);
      }
    }

    return result;
  };
  /**
   * Capitalize the first letter of a string
   * @param str
   */

  var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  /**
   * Returns the array ob object values (Object.values isn't supported in IE11)
   * @param obj
   */

  var objectValues = function objectValues(obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
  /**
   * Convert NodeList to Array
   * @param nodeList
   */

  var toArray = function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  };
  /**
   * Standardise console warnings
   * @param message
   */

  var warn = function warn(message) {
    console.warn("".concat(consolePrefix, " ").concat(message));
  };
  /**
   * Standardise console errors
   * @param message
   */

  var error = function error(message) {
    console.error("".concat(consolePrefix, " ").concat(message));
  };
  /**
   * Private global state for `warnOnce`
   * @type {Array}
   * @private
   */

  var previousWarnOnceMessages = [];
  /**
   * Show a console warning, but only if it hasn't already been shown
   * @param message
   */

  var warnOnce = function warnOnce(message) {
    if (!(previousWarnOnceMessages.indexOf(message) !== -1)) {
      previousWarnOnceMessages.push(message);
      warn(message);
    }
  };
  /**
   * Show a one-time console warning about deprecated params/methods
   */

  var warnAboutDepreation = function warnAboutDepreation(deprecatedParam, useInstead) {
    warnOnce("\"".concat(deprecatedParam, "\" is deprecated and will be removed in the next major release. Please use \"").concat(useInstead, "\" instead."));
  };
  /**
   * If `arg` is a function, call it (with no arguments or context) and return the result.
   * Otherwise, just pass the value through
   * @param arg
   */

  var callIfFunction = function callIfFunction(arg) {
    return typeof arg === 'function' ? arg() : arg;
  };
  var isPromise = function isPromise(arg) {
    return arg && Promise.resolve(arg) === arg;
  };

  var DismissReason = Object.freeze({
    cancel: 'cancel',
    backdrop: 'backdrop',
    close: 'close',
    esc: 'esc',
    timer: 'timer'
  });

  var isJqueryElement = function isJqueryElement(elem) {
    return _typeof(elem) === 'object' && elem.jquery;
  };

  var isElement = function isElement(elem) {
    return elem instanceof Element || isJqueryElement(elem);
  };

  var argsToParams = function argsToParams(args) {
    var params = {};

    if (_typeof(args[0]) === 'object' && !isElement(args[0])) {
      _extends(params, args[0]);
    } else {
      ['title', 'html', 'icon'].forEach(function (name, index) {
        var arg = args[index];

        if (typeof arg === 'string' || isElement(arg)) {
          params[name] = arg;
        } else if (arg !== undefined) {
          error("Unexpected type of ".concat(name, "! Expected \"string\" or \"Element\", got ").concat(_typeof(arg)));
        }
      });
    }

    return params;
  };

  var swalPrefix = 'swal2-';
  var prefix = function prefix(items) {
    var result = {};

    for (var i in items) {
      result[items[i]] = swalPrefix + items[i];
    }

    return result;
  };
  var swalClasses = prefix(['container', 'shown', 'height-auto', 'iosfix', 'popup', 'modal', 'no-backdrop', 'no-transition', 'toast', 'toast-shown', 'toast-column', 'show', 'hide', 'close', 'title', 'header', 'content', 'html-container', 'actions', 'confirm', 'cancel', 'footer', 'icon', 'icon-content', 'image', 'input', 'file', 'range', 'select', 'radio', 'checkbox', 'label', 'textarea', 'inputerror', 'validation-message', 'progress-steps', 'active-progress-step', 'progress-step', 'progress-step-line', 'loading', 'styled', 'top', 'top-start', 'top-end', 'top-left', 'top-right', 'center', 'center-start', 'center-end', 'center-left', 'center-right', 'bottom', 'bottom-start', 'bottom-end', 'bottom-left', 'bottom-right', 'grow-row', 'grow-column', 'grow-fullscreen', 'rtl', 'timer-progress-bar', 'timer-progress-bar-container', 'scrollbar-measure', 'icon-success', 'icon-warning', 'icon-info', 'icon-question', 'icon-error']);
  var iconTypes = prefix(['success', 'warning', 'info', 'question', 'error']);

  var getContainer = function getContainer() {
    return document.body.querySelector(".".concat(swalClasses.container));
  };
  var elementBySelector = function elementBySelector(selectorString) {
    var container = getContainer();
    return container ? container.querySelector(selectorString) : null;
  };

  var elementByClass = function elementByClass(className) {
    return elementBySelector(".".concat(className));
  };

  var getPopup = function getPopup() {
    return elementByClass(swalClasses.popup);
  };
  var getIcons = function getIcons() {
    var popup = getPopup();
    return toArray(popup.querySelectorAll(".".concat(swalClasses.icon)));
  };
  var getIcon = function getIcon() {
    var visibleIcon = getIcons().filter(function (icon) {
      return isVisible(icon);
    });
    return visibleIcon.length ? visibleIcon[0] : null;
  };
  var getTitle = function getTitle() {
    return elementByClass(swalClasses.title);
  };
  var getContent = function getContent() {
    return elementByClass(swalClasses.content);
  };
  var getHtmlContainer = function getHtmlContainer() {
    return elementByClass(swalClasses['html-container']);
  };
  var getImage = function getImage() {
    return elementByClass(swalClasses.image);
  };
  var getProgressSteps = function getProgressSteps() {
    return elementByClass(swalClasses['progress-steps']);
  };
  var getValidationMessage = function getValidationMessage() {
    return elementByClass(swalClasses['validation-message']);
  };
  var getConfirmButton = function getConfirmButton() {
    return elementBySelector(".".concat(swalClasses.actions, " .").concat(swalClasses.confirm));
  };
  var getCancelButton = function getCancelButton() {
    return elementBySelector(".".concat(swalClasses.actions, " .").concat(swalClasses.cancel));
  };
  var getActions = function getActions() {
    return elementByClass(swalClasses.actions);
  };
  var getHeader = function getHeader() {
    return elementByClass(swalClasses.header);
  };
  var getFooter = function getFooter() {
    return elementByClass(swalClasses.footer);
  };
  var getTimerProgressBar = function getTimerProgressBar() {
    return elementByClass(swalClasses['timer-progress-bar']);
  };
  var getCloseButton = function getCloseButton() {
    return elementByClass(swalClasses.close);
  }; // https://github.com/jkup/focusable/blob/master/index.js

  var focusable = "\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex=\"0\"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n";
  var getFocusableElements = function getFocusableElements() {
    var focusableElementsWithTabindex = toArray(getPopup().querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])')) // sort according to tabindex
    .sort(function (a, b) {
      a = parseInt(a.getAttribute('tabindex'));
      b = parseInt(b.getAttribute('tabindex'));

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }

      return 0;
    });
    var otherFocusableElements = toArray(getPopup().querySelectorAll(focusable)).filter(function (el) {
      return el.getAttribute('tabindex') !== '-1';
    });
    return uniqueArray(focusableElementsWithTabindex.concat(otherFocusableElements)).filter(function (el) {
      return isVisible(el);
    });
  };
  var isModal = function isModal() {
    return !isToast() && !document.body.classList.contains(swalClasses['no-backdrop']);
  };
  var isToast = function isToast() {
    return document.body.classList.contains(swalClasses['toast-shown']);
  };
  var isLoading = function isLoading() {
    return getPopup().hasAttribute('data-loading');
  };

  var states = {
    previousBodyPadding: null
  };
  var setInnerHtml = function setInnerHtml(elem, html) {
    // #1926
    elem.textContent = '';

    if (html) {
      var parser = new DOMParser();
      var parsed = parser.parseFromString(html, "text/html");
      toArray(parsed.querySelector('head').childNodes).forEach(function (child) {
        elem.appendChild(child);
      });
      toArray(parsed.querySelector('body').childNodes).forEach(function (child) {
        elem.appendChild(child);
      });
    }
  };
  var hasClass = function hasClass(elem, className) {
    if (!className) {
      return false;
    }

    var classList = className.split(/\s+/);

    for (var i = 0; i < classList.length; i++) {
      if (!elem.classList.contains(classList[i])) {
        return false;
      }
    }

    return true;
  };

  var removeCustomClasses = function removeCustomClasses(elem, params) {
    toArray(elem.classList).forEach(function (className) {
      if (!(objectValues(swalClasses).indexOf(className) !== -1) && !(objectValues(iconTypes).indexOf(className) !== -1) && !(objectValues(params.showClass).indexOf(className) !== -1)) {
        elem.classList.remove(className);
      }
    });
  };

  var applyCustomClass = function applyCustomClass(elem, params, className) {
    removeCustomClasses(elem, params);

    if (params.customClass && params.customClass[className]) {
      if (typeof params.customClass[className] !== 'string' && !params.customClass[className].forEach) {
        return warn("Invalid type of customClass.".concat(className, "! Expected string or iterable object, got \"").concat(_typeof(params.customClass[className]), "\""));
      }

      addClass(elem, params.customClass[className]);
    }
  };
  function getInput(content, inputType) {
    if (!inputType) {
      return null;
    }

    switch (inputType) {
      case 'select':
      case 'textarea':
      case 'file':
        return getChildByClass(content, swalClasses[inputType]);

      case 'checkbox':
        return content.querySelector(".".concat(swalClasses.checkbox, " input"));

      case 'radio':
        return content.querySelector(".".concat(swalClasses.radio, " input:checked")) || content.querySelector(".".concat(swalClasses.radio, " input:first-child"));

      case 'range':
        return content.querySelector(".".concat(swalClasses.range, " input"));

      default:
        return getChildByClass(content, swalClasses.input);
    }
  }
  var focusInput = function focusInput(input) {
    input.focus(); // place cursor at end of text in text input

    if (input.type !== 'file') {
      // http://stackoverflow.com/a/2345915
      var val = input.value;
      input.value = '';
      input.value = val;
    }
  };
  var toggleClass = function toggleClass(target, classList, condition) {
    if (!target || !classList) {
      return;
    }

    if (typeof classList === 'string') {
      classList = classList.split(/\s+/).filter(Boolean);
    }

    classList.forEach(function (className) {
      if (target.forEach) {
        target.forEach(function (elem) {
          condition ? elem.classList.add(className) : elem.classList.remove(className);
        });
      } else {
        condition ? target.classList.add(className) : target.classList.remove(className);
      }
    });
  };
  var addClass = function addClass(target, classList) {
    toggleClass(target, classList, true);
  };
  var removeClass = function removeClass(target, classList) {
    toggleClass(target, classList, false);
  };
  var getChildByClass = function getChildByClass(elem, className) {
    for (var i = 0; i < elem.childNodes.length; i++) {
      if (hasClass(elem.childNodes[i], className)) {
        return elem.childNodes[i];
      }
    }
  };
  var applyNumericalStyle = function applyNumericalStyle(elem, property, value) {
    if (value || parseInt(value) === 0) {
      elem.style[property] = typeof value === 'number' ? "".concat(value, "px") : value;
    } else {
      elem.style.removeProperty(property);
    }
  };
  var show = function show(elem) {
    var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flex';
    elem.style.opacity = '';
    elem.style.display = display;
  };
  var hide = function hide(elem) {
    elem.style.opacity = '';
    elem.style.display = 'none';
  };
  var toggle = function toggle(elem, condition, display) {
    condition ? show(elem, display) : hide(elem);
  }; // borrowed from jquery $(elem).is(':visible') implementation

  var isVisible = function isVisible(elem) {
    return !!(elem && (elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length));
  };
  /* istanbul ignore next */

  var isScrollable = function isScrollable(elem) {
    return !!(elem.scrollHeight > elem.clientHeight);
  }; // borrowed from https://stackoverflow.com/a/46352119

  var hasCssAnimation = function hasCssAnimation(elem) {
    var style = window.getComputedStyle(elem);
    var animDuration = parseFloat(style.getPropertyValue('animation-duration') || '0');
    var transDuration = parseFloat(style.getPropertyValue('transition-duration') || '0');
    return animDuration > 0 || transDuration > 0;
  };
  var contains = function contains(haystack, needle) {
    if (typeof haystack.contains === 'function') {
      return haystack.contains(needle);
    }
  };
  var animateTimerProgressBar = function animateTimerProgressBar(timer) {
    var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var timerProgressBar = getTimerProgressBar();

    if (isVisible(timerProgressBar)) {
      if (reset) {
        timerProgressBar.style.transition = 'none';
        timerProgressBar.style.width = '100%';
      }

      setTimeout(function () {
        timerProgressBar.style.transition = "width ".concat(timer / 1000, "s linear");
        timerProgressBar.style.width = '0%';
      }, 10);
    }
  };
  var stopTimerProgressBar = function stopTimerProgressBar() {
    var timerProgressBar = getTimerProgressBar();
    var timerProgressBarWidth = parseInt(window.getComputedStyle(timerProgressBar).width);
    timerProgressBar.style.removeProperty('transition');
    timerProgressBar.style.width = '100%';
    var timerProgressBarFullWidth = parseInt(window.getComputedStyle(timerProgressBar).width);
    var timerProgressBarPercent = parseInt(timerProgressBarWidth / timerProgressBarFullWidth * 100);
    timerProgressBar.style.removeProperty('transition');
    timerProgressBar.style.width = "".concat(timerProgressBarPercent, "%");
  };

  // Detect Node env
  var isNodeEnv = function isNodeEnv() {
    return typeof window === 'undefined' || typeof document === 'undefined';
  };

  var sweetHTML = "\n <div aria-labelledby=\"".concat(swalClasses.title, "\" aria-describedby=\"").concat(swalClasses.content, "\" class=\"").concat(swalClasses.popup, "\" tabindex=\"-1\">\n   <div class=\"").concat(swalClasses.header, "\">\n     <ul class=\"").concat(swalClasses['progress-steps'], "\"></ul>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.error, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.question, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.warning, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.info, "\"></div>\n     <div class=\"").concat(swalClasses.icon, " ").concat(iconTypes.success, "\"></div>\n     <img class=\"").concat(swalClasses.image, "\" />\n     <h2 class=\"").concat(swalClasses.title, "\" id=\"").concat(swalClasses.title, "\"></h2>\n     <button type=\"button\" class=\"").concat(swalClasses.close, "\"></button>\n   </div>\n   <div class=\"").concat(swalClasses.content, "\">\n     <div id=\"").concat(swalClasses.content, "\" class=\"").concat(swalClasses['html-container'], "\"></div>\n     <input class=\"").concat(swalClasses.input, "\" />\n     <input type=\"file\" class=\"").concat(swalClasses.file, "\" />\n     <div class=\"").concat(swalClasses.range, "\">\n       <input type=\"range\" />\n       <output></output>\n     </div>\n     <select class=\"").concat(swalClasses.select, "\"></select>\n     <div class=\"").concat(swalClasses.radio, "\"></div>\n     <label for=\"").concat(swalClasses.checkbox, "\" class=\"").concat(swalClasses.checkbox, "\">\n       <input type=\"checkbox\" />\n       <span class=\"").concat(swalClasses.label, "\"></span>\n     </label>\n     <textarea class=\"").concat(swalClasses.textarea, "\"></textarea>\n     <div class=\"").concat(swalClasses['validation-message'], "\" id=\"").concat(swalClasses['validation-message'], "\"></div>\n   </div>\n   <div class=\"").concat(swalClasses.actions, "\">\n     <button type=\"button\" class=\"").concat(swalClasses.confirm, "\">OK</button>\n     <button type=\"button\" class=\"").concat(swalClasses.cancel, "\">Cancel</button>\n   </div>\n   <div class=\"").concat(swalClasses.footer, "\"></div>\n   <div class=\"").concat(swalClasses['timer-progress-bar-container'], "\">\n     <div class=\"").concat(swalClasses['timer-progress-bar'], "\"></div>\n   </div>\n </div>\n").replace(/(^|\n)\s*/g, '');

  var resetOldContainer = function resetOldContainer() {
    var oldContainer = getContainer();

    if (!oldContainer) {
      return false;
    }

    oldContainer.parentNode.removeChild(oldContainer);
    removeClass([document.documentElement, document.body], [swalClasses['no-backdrop'], swalClasses['toast-shown'], swalClasses['has-column']]);
    return true;
  };

  var oldInputVal; // IE11 workaround, see #1109 for details

  var resetValidationMessage = function resetValidationMessage(e) {
    if (Swal.isVisible() && oldInputVal !== e.target.value) {
      Swal.resetValidationMessage();
    }

    oldInputVal = e.target.value;
  };

  var addInputChangeListeners = function addInputChangeListeners() {
    var content = getContent();
    var input = getChildByClass(content, swalClasses.input);
    var file = getChildByClass(content, swalClasses.file);
    var range = content.querySelector(".".concat(swalClasses.range, " input"));
    var rangeOutput = content.querySelector(".".concat(swalClasses.range, " output"));
    var select = getChildByClass(content, swalClasses.select);
    var checkbox = content.querySelector(".".concat(swalClasses.checkbox, " input"));
    var textarea = getChildByClass(content, swalClasses.textarea);
    input.oninput = resetValidationMessage;
    file.onchange = resetValidationMessage;
    select.onchange = resetValidationMessage;
    checkbox.onchange = resetValidationMessage;
    textarea.oninput = resetValidationMessage;

    range.oninput = function (e) {
      resetValidationMessage(e);
      rangeOutput.value = range.value;
    };

    range.onchange = function (e) {
      resetValidationMessage(e);
      range.nextSibling.value = range.value;
    };
  };

  var getTarget = function getTarget(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  };

  var setupAccessibility = function setupAccessibility(params) {
    var popup = getPopup();
    popup.setAttribute('role', params.toast ? 'alert' : 'dialog');
    popup.setAttribute('aria-live', params.toast ? 'polite' : 'assertive');

    if (!params.toast) {
      popup.setAttribute('aria-modal', 'true');
    }
  };

  var setupRTL = function setupRTL(targetElement) {
    if (window.getComputedStyle(targetElement).direction === 'rtl') {
      addClass(getContainer(), swalClasses.rtl);
    }
  };
  /*
   * Add modal + backdrop to DOM
   */


  var init = function init(params) {
    // Clean up the old popup container if it exists
    var oldContainerExisted = resetOldContainer();
    /* istanbul ignore if */

    if (isNodeEnv()) {
      error('SweetAlert2 requires document to initialize');
      return;
    }

    var container = document.createElement('div');
    container.className = swalClasses.container;

    if (oldContainerExisted) {
      addClass(container, swalClasses['no-transition']);
    }

    setInnerHtml(container, sweetHTML);
    var targetElement = getTarget(params.target);
    targetElement.appendChild(container);
    setupAccessibility(params);
    setupRTL(targetElement);
    addInputChangeListeners();
  };

  var parseHtmlToContainer = function parseHtmlToContainer(param, target) {
    // DOM element
    if (param instanceof HTMLElement) {
      target.appendChild(param); // Object
    } else if (_typeof(param) === 'object') {
      handleObject(param, target); // Plain string
    } else if (param) {
      setInnerHtml(target, param);
    }
  };

  var handleObject = function handleObject(param, target) {
    // JQuery element(s)
    if (param.jquery) {
      handleJqueryElem(target, param); // For other objects use their string representation
    } else {
      setInnerHtml(target, param.toString());
    }
  };

  var handleJqueryElem = function handleJqueryElem(target, elem) {
    target.textContent = '';

    if (0 in elem) {
      for (var i = 0; (i in elem); i++) {
        target.appendChild(elem[i].cloneNode(true));
      }
    } else {
      target.appendChild(elem.cloneNode(true));
    }
  };

  var animationEndEvent = function () {
    // Prevent run in Node env

    /* istanbul ignore if */
    if (isNodeEnv()) {
      return false;
    }

    var testEl = document.createElement('div');
    var transEndEventNames = {
      WebkitAnimation: 'webkitAnimationEnd',
      OAnimation: 'oAnimationEnd oanimationend',
      animation: 'animationend'
    };

    for (var i in transEndEventNames) {
      if (Object.prototype.hasOwnProperty.call(transEndEventNames, i) && typeof testEl.style[i] !== 'undefined') {
        return transEndEventNames[i];
      }
    }

    return false;
  }();

  // https://github.com/twbs/bootstrap/blob/master/js/src/modal.js

  var measureScrollbar = function measureScrollbar() {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = swalClasses['scrollbar-measure'];
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  };

  var renderActions = function renderActions(instance, params) {
    var actions = getActions();
    var confirmButton = getConfirmButton();
    var cancelButton = getCancelButton(); // Actions (buttons) wrapper

    if (!params.showConfirmButton && !params.showCancelButton) {
      hide(actions);
    } // Custom class


    applyCustomClass(actions, params, 'actions'); // Render confirm button

    renderButton(confirmButton, 'confirm', params); // render Cancel Button

    renderButton(cancelButton, 'cancel', params);

    if (params.buttonsStyling) {
      handleButtonsStyling(confirmButton, cancelButton, params);
    } else {
      removeClass([confirmButton, cancelButton], swalClasses.styled);
      confirmButton.style.backgroundColor = confirmButton.style.borderLeftColor = confirmButton.style.borderRightColor = '';
      cancelButton.style.backgroundColor = cancelButton.style.borderLeftColor = cancelButton.style.borderRightColor = '';
    }

    if (params.reverseButtons) {
      confirmButton.parentNode.insertBefore(cancelButton, confirmButton);
    }
  };

  function handleButtonsStyling(confirmButton, cancelButton, params) {
    addClass([confirmButton, cancelButton], swalClasses.styled); // Buttons background colors

    if (params.confirmButtonColor) {
      confirmButton.style.backgroundColor = params.confirmButtonColor;
    }

    if (params.cancelButtonColor) {
      cancelButton.style.backgroundColor = params.cancelButtonColor;
    } // Loading state


    var confirmButtonBackgroundColor = window.getComputedStyle(confirmButton).getPropertyValue('background-color');
    confirmButton.style.borderLeftColor = confirmButtonBackgroundColor;
    confirmButton.style.borderRightColor = confirmButtonBackgroundColor;
  }

  function renderButton(button, buttonType, params) {
    toggle(button, params["show".concat(capitalizeFirstLetter(buttonType), "Button")], 'inline-block');
    setInnerHtml(button, params["".concat(buttonType, "ButtonText")]); // Set caption text

    button.setAttribute('aria-label', params["".concat(buttonType, "ButtonAriaLabel")]); // ARIA label
    // Add buttons custom classes

    button.className = swalClasses[buttonType];
    applyCustomClass(button, params, "".concat(buttonType, "Button"));
    addClass(button, params["".concat(buttonType, "ButtonClass")]);
  }

  function handleBackdropParam(container, backdrop) {
    if (typeof backdrop === 'string') {
      container.style.background = backdrop;
    } else if (!backdrop) {
      addClass([document.documentElement, document.body], swalClasses['no-backdrop']);
    }
  }

  function handlePositionParam(container, position) {
    if (position in swalClasses) {
      addClass(container, swalClasses[position]);
    } else {
      warn('The "position" parameter is not valid, defaulting to "center"');
      addClass(container, swalClasses.center);
    }
  }

  function handleGrowParam(container, grow) {
    if (grow && typeof grow === 'string') {
      var growClass = "grow-".concat(grow);

      if (growClass in swalClasses) {
        addClass(container, swalClasses[growClass]);
      }
    }
  }

  var renderContainer = function renderContainer(instance, params) {
    var container = getContainer();

    if (!container) {
      return;
    }

    handleBackdropParam(container, params.backdrop);

    if (!params.backdrop && params.allowOutsideClick) {
      warn('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`');
    }

    handlePositionParam(container, params.position);
    handleGrowParam(container, params.grow); // Custom class

    applyCustomClass(container, params, 'container'); // Set queue step attribute for getQueueStep() method

    var queueStep = document.body.getAttribute('data-swal2-queue-step');

    if (queueStep) {
      container.setAttribute('data-queue-step', queueStep);
      document.body.removeAttribute('data-swal2-queue-step');
    }
  };

  /**
   * This module containts `WeakMap`s for each effectively-"private  property" that a `Swal` has.
   * For example, to set the private property "foo" of `this` to "bar", you can `privateProps.foo.set(this, 'bar')`
   * This is the approach that Babel will probably take to implement private methods/fields
   *   https://github.com/tc39/proposal-private-methods
   *   https://github.com/babel/babel/pull/7555
   * Once we have the changes from that PR in Babel, and our core class fits reasonable in *one module*
   *   then we can use that language feature.
   */
  var privateProps = {
    promise: new WeakMap(),
    innerParams: new WeakMap(),
    domCache: new WeakMap()
  };

  var inputTypes = ['input', 'file', 'range', 'select', 'radio', 'checkbox', 'textarea'];
  var renderInput = function renderInput(instance, params) {
    var content = getContent();
    var innerParams = privateProps.innerParams.get(instance);
    var rerender = !innerParams || params.input !== innerParams.input;
    inputTypes.forEach(function (inputType) {
      var inputClass = swalClasses[inputType];
      var inputContainer = getChildByClass(content, inputClass); // set attributes

      setAttributes(inputType, params.inputAttributes); // set class

      inputContainer.className = inputClass;

      if (rerender) {
        hide(inputContainer);
      }
    });

    if (params.input) {
      if (rerender) {
        showInput(params);
      } // set custom class


      setCustomClass(params);
    }
  };

  var showInput = function showInput(params) {
    if (!renderInputType[params.input]) {
      return error("Unexpected type of input! Expected \"text\", \"email\", \"password\", \"number\", \"tel\", \"select\", \"radio\", \"checkbox\", \"textarea\", \"file\" or \"url\", got \"".concat(params.input, "\""));
    }

    var inputContainer = getInputContainer(params.input);
    var input = renderInputType[params.input](inputContainer, params);
    show(input); // input autofocus

    setTimeout(function () {
      focusInput(input);
    });
  };

  var removeAttributes = function removeAttributes(input) {
    for (var i = 0; i < input.attributes.length; i++) {
      var attrName = input.attributes[i].name;

      if (!(['type', 'value', 'style'].indexOf(attrName) !== -1)) {
        input.removeAttribute(attrName);
      }
    }
  };

  var setAttributes = function setAttributes(inputType, inputAttributes) {
    var input = getInput(getContent(), inputType);

    if (!input) {
      return;
    }

    removeAttributes(input);

    for (var attr in inputAttributes) {
      // Do not set a placeholder for <input type="range">
      // it'll crash Edge, #1298
      if (inputType === 'range' && attr === 'placeholder') {
        continue;
      }

      input.setAttribute(attr, inputAttributes[attr]);
    }
  };

  var setCustomClass = function setCustomClass(params) {
    var inputContainer = getInputContainer(params.input);

    if (params.customClass) {
      addClass(inputContainer, params.customClass.input);
    }
  };

  var setInputPlaceholder = function setInputPlaceholder(input, params) {
    if (!input.placeholder || params.inputPlaceholder) {
      input.placeholder = params.inputPlaceholder;
    }
  };

  var getInputContainer = function getInputContainer(inputType) {
    var inputClass = swalClasses[inputType] ? swalClasses[inputType] : swalClasses.input;
    return getChildByClass(getContent(), inputClass);
  };

  var renderInputType = {};

  renderInputType.text = renderInputType.email = renderInputType.password = renderInputType.number = renderInputType.tel = renderInputType.url = function (input, params) {
    if (typeof params.inputValue === 'string' || typeof params.inputValue === 'number') {
      input.value = params.inputValue;
    } else if (!isPromise(params.inputValue)) {
      warn("Unexpected type of inputValue! Expected \"string\", \"number\" or \"Promise\", got \"".concat(_typeof(params.inputValue), "\""));
    }

    setInputPlaceholder(input, params);
    input.type = params.input;
    return input;
  };

  renderInputType.file = function (input, params) {
    setInputPlaceholder(input, params);
    return input;
  };

  renderInputType.range = function (range, params) {
    var rangeInput = range.querySelector('input');
    var rangeOutput = range.querySelector('output');
    rangeInput.value = params.inputValue;
    rangeInput.type = params.input;
    rangeOutput.value = params.inputValue;
    return range;
  };

  renderInputType.select = function (select, params) {
    select.textContent = '';

    if (params.inputPlaceholder) {
      var placeholder = document.createElement('option');
      setInnerHtml(placeholder, params.inputPlaceholder);
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
    }

    return select;
  };

  renderInputType.radio = function (radio) {
    radio.textContent = '';
    return radio;
  };

  renderInputType.checkbox = function (checkboxContainer, params) {
    var checkbox = getInput(getContent(), 'checkbox');
    checkbox.value = 1;
    checkbox.id = swalClasses.checkbox;
    checkbox.checked = Boolean(params.inputValue);
    var label = checkboxContainer.querySelector('span');
    setInnerHtml(label, params.inputPlaceholder);
    return checkboxContainer;
  };

  renderInputType.textarea = function (textarea, params) {
    textarea.value = params.inputValue;
    setInputPlaceholder(textarea, params);

    if ('MutationObserver' in window) {
      // #1699
      var initialPopupWidth = parseInt(window.getComputedStyle(getPopup()).width);
      var popupPadding = parseInt(window.getComputedStyle(getPopup()).paddingLeft) + parseInt(window.getComputedStyle(getPopup()).paddingRight);

      var outputsize = function outputsize() {
        var contentWidth = textarea.offsetWidth + popupPadding;

        if (contentWidth > initialPopupWidth) {
          getPopup().style.width = "".concat(contentWidth, "px");
        } else {
          getPopup().style.width = null;
        }
      };

      new MutationObserver(outputsize).observe(textarea, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return textarea;
  };

  var renderContent = function renderContent(instance, params) {
    var content = getContent().querySelector("#".concat(swalClasses.content)); // Content as HTML

    if (params.html) {
      parseHtmlToContainer(params.html, content);
      show(content, 'block'); // Content as plain text
    } else if (params.text) {
      content.textContent = params.text;
      show(content, 'block'); // No content
    } else {
      hide(content);
    }

    renderInput(instance, params); // Custom class

    applyCustomClass(getContent(), params, 'content');
  };

  var renderFooter = function renderFooter(instance, params) {
    var footer = getFooter();
    toggle(footer, params.footer);

    if (params.footer) {
      parseHtmlToContainer(params.footer, footer);
    } // Custom class


    applyCustomClass(footer, params, 'footer');
  };

  var renderCloseButton = function renderCloseButton(instance, params) {
    var closeButton = getCloseButton();
    setInnerHtml(closeButton, params.closeButtonHtml); // Custom class

    applyCustomClass(closeButton, params, 'closeButton');
    toggle(closeButton, params.showCloseButton);
    closeButton.setAttribute('aria-label', params.closeButtonAriaLabel);
  };

  var renderIcon = function renderIcon(instance, params) {
    var innerParams = privateProps.innerParams.get(instance); // if the give icon already rendered, apply the custom class without re-rendering the icon

    if (innerParams && params.icon === innerParams.icon && getIcon()) {
      applyCustomClass(getIcon(), params, 'icon');
      return;
    }

    hideAllIcons();

    if (!params.icon) {
      return;
    }

    if (Object.keys(iconTypes).indexOf(params.icon) !== -1) {
      var icon = elementBySelector(".".concat(swalClasses.icon, ".").concat(iconTypes[params.icon]));
      show(icon); // Custom or default content

      setContent(icon, params);
      adjustSuccessIconBackgoundColor(); // Custom class

      applyCustomClass(icon, params, 'icon'); // Animate icon

      addClass(icon, params.showClass.icon);
    } else {
      error("Unknown icon! Expected \"success\", \"error\", \"warning\", \"info\" or \"question\", got \"".concat(params.icon, "\""));
    }
  };

  var hideAllIcons = function hideAllIcons() {
    var icons = getIcons();

    for (var i = 0; i < icons.length; i++) {
      hide(icons[i]);
    }
  }; // Adjust success icon background color to match the popup background color


  var adjustSuccessIconBackgoundColor = function adjustSuccessIconBackgoundColor() {
    var popup = getPopup();
    var popupBackgroundColor = window.getComputedStyle(popup).getPropertyValue('background-color');
    var successIconParts = popup.querySelectorAll('[class^=swal2-success-circular-line], .swal2-success-fix');

    for (var i = 0; i < successIconParts.length; i++) {
      successIconParts[i].style.backgroundColor = popupBackgroundColor;
    }
  };

  var setContent = function setContent(icon, params) {
    icon.textContent = '';

    if (params.iconHtml) {
      setInnerHtml(icon, iconContent(params.iconHtml));
    } else if (params.icon === 'success') {
      setInnerHtml(icon, "\n      <div class=\"swal2-success-circular-line-left\"></div>\n      <span class=\"swal2-success-line-tip\"></span> <span class=\"swal2-success-line-long\"></span>\n      <div class=\"swal2-success-ring\"></div> <div class=\"swal2-success-fix\"></div>\n      <div class=\"swal2-success-circular-line-right\"></div>\n    ");
    } else if (params.icon === 'error') {
      setInnerHtml(icon, "\n      <span class=\"swal2-x-mark\">\n        <span class=\"swal2-x-mark-line-left\"></span>\n        <span class=\"swal2-x-mark-line-right\"></span>\n      </span>\n    ");
    } else {
      var defaultIconHtml = {
        question: '?',
        warning: '!',
        info: 'i'
      };
      setInnerHtml(icon, iconContent(defaultIconHtml[params.icon]));
    }
  };

  var iconContent = function iconContent(content) {
    return "<div class=\"".concat(swalClasses['icon-content'], "\">").concat(content, "</div>");
  };

  var renderImage = function renderImage(instance, params) {
    var image = getImage();

    if (!params.imageUrl) {
      return hide(image);
    }

    show(image); // Src, alt

    image.setAttribute('src', params.imageUrl);
    image.setAttribute('alt', params.imageAlt); // Width, height

    applyNumericalStyle(image, 'width', params.imageWidth);
    applyNumericalStyle(image, 'height', params.imageHeight); // Class

    image.className = swalClasses.image;
    applyCustomClass(image, params, 'image');
  };

  var currentSteps = [];
  /*
   * Global function for chaining sweetAlert popups
   */

  var queue = function queue(steps) {
    var Swal = this;
    currentSteps = steps;

    var resetAndResolve = function resetAndResolve(resolve, value) {
      currentSteps = [];
      resolve(value);
    };

    var queueResult = [];
    return new Promise(function (resolve) {
      (function step(i, callback) {
        if (i < currentSteps.length) {
          document.body.setAttribute('data-swal2-queue-step', i);
          Swal.fire(currentSteps[i]).then(function (result) {
            if (typeof result.value !== 'undefined') {
              queueResult.push(result.value);
              step(i + 1, callback);
            } else {
              resetAndResolve(resolve, {
                dismiss: result.dismiss
              });
            }
          });
        } else {
          resetAndResolve(resolve, {
            value: queueResult
          });
        }
      })(0);
    });
  };
  /*
   * Global function for getting the index of current popup in queue
   */

  var getQueueStep = function getQueueStep() {
    return getContainer() && getContainer().getAttribute('data-queue-step');
  };
  /*
   * Global function for inserting a popup to the queue
   */

  var insertQueueStep = function insertQueueStep(step, index) {
    if (index && index < currentSteps.length) {
      return currentSteps.splice(index, 0, step);
    }

    return currentSteps.push(step);
  };
  /*
   * Global function for deleting a popup from the queue
   */

  var deleteQueueStep = function deleteQueueStep(index) {
    if (typeof currentSteps[index] !== 'undefined') {
      currentSteps.splice(index, 1);
    }
  };

  var createStepElement = function createStepElement(step) {
    var stepEl = document.createElement('li');
    addClass(stepEl, swalClasses['progress-step']);
    setInnerHtml(stepEl, step);
    return stepEl;
  };

  var createLineElement = function createLineElement(params) {
    var lineEl = document.createElement('li');
    addClass(lineEl, swalClasses['progress-step-line']);

    if (params.progressStepsDistance) {
      lineEl.style.width = params.progressStepsDistance;
    }

    return lineEl;
  };

  var renderProgressSteps = function renderProgressSteps(instance, params) {
    var progressStepsContainer = getProgressSteps();

    if (!params.progressSteps || params.progressSteps.length === 0) {
      return hide(progressStepsContainer);
    }

    show(progressStepsContainer);
    progressStepsContainer.textContent = '';
    var currentProgressStep = parseInt(params.currentProgressStep === undefined ? getQueueStep() : params.currentProgressStep);

    if (currentProgressStep >= params.progressSteps.length) {
      warn('Invalid currentProgressStep parameter, it should be less than progressSteps.length ' + '(currentProgressStep like JS arrays starts from 0)');
    }

    params.progressSteps.forEach(function (step, index) {
      var stepEl = createStepElement(step);
      progressStepsContainer.appendChild(stepEl);

      if (index === currentProgressStep) {
        addClass(stepEl, swalClasses['active-progress-step']);
      }

      if (index !== params.progressSteps.length - 1) {
        var lineEl = createLineElement(step);
        progressStepsContainer.appendChild(lineEl);
      }
    });
  };

  var renderTitle = function renderTitle(instance, params) {
    var title = getTitle();
    toggle(title, params.title || params.titleText);

    if (params.title) {
      parseHtmlToContainer(params.title, title);
    }

    if (params.titleText) {
      title.innerText = params.titleText;
    } // Custom class


    applyCustomClass(title, params, 'title');
  };

  var renderHeader = function renderHeader(instance, params) {
    var header = getHeader(); // Custom class

    applyCustomClass(header, params, 'header'); // Progress steps

    renderProgressSteps(instance, params); // Icon

    renderIcon(instance, params); // Image

    renderImage(instance, params); // Title

    renderTitle(instance, params); // Close button

    renderCloseButton(instance, params);
  };

  var renderPopup = function renderPopup(instance, params) {
    var popup = getPopup(); // Width

    applyNumericalStyle(popup, 'width', params.width); // Padding

    applyNumericalStyle(popup, 'padding', params.padding); // Background

    if (params.background) {
      popup.style.background = params.background;
    } // Classes


    addClasses(popup, params);
  };

  var addClasses = function addClasses(popup, params) {
    // Default Class + showClass when updating Swal.update({})
    popup.className = "".concat(swalClasses.popup, " ").concat(isVisible(popup) ? params.showClass.popup : '');

    if (params.toast) {
      addClass([document.documentElement, document.body], swalClasses['toast-shown']);
      addClass(popup, swalClasses.toast);
    } else {
      addClass(popup, swalClasses.modal);
    } // Custom class


    applyCustomClass(popup, params, 'popup');

    if (typeof params.customClass === 'string') {
      addClass(popup, params.customClass);
    } // Icon class (#1842)


    if (params.icon) {
      addClass(popup, swalClasses["icon-".concat(params.icon)]);
    }
  };

  var render = function render(instance, params) {
    renderPopup(instance, params);
    renderContainer(instance, params);
    renderHeader(instance, params);
    renderContent(instance, params);
    renderActions(instance, params);
    renderFooter(instance, params);

    if (typeof params.onRender === 'function') {
      params.onRender(getPopup());
    }
  };

  /*
   * Global function to determine if SweetAlert2 popup is shown
   */

  var isVisible$1 = function isVisible$$1() {
    return isVisible(getPopup());
  };
  /*
   * Global function to click 'Confirm' button
   */

  var clickConfirm = function clickConfirm() {
    return getConfirmButton() && getConfirmButton().click();
  };
  /*
   * Global function to click 'Cancel' button
   */

  var clickCancel = function clickCancel() {
    return getCancelButton() && getCancelButton().click();
  };

  function fire() {
    var Swal = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _construct(Swal, args);
  }

  /**
   * Returns an extended version of `Swal` containing `params` as defaults.
   * Useful for reusing Swal configuration.
   *
   * For example:
   *
   * Before:
   * const textPromptOptions = { input: 'text', showCancelButton: true }
   * const {value: firstName} = await Swal.fire({ ...textPromptOptions, title: 'What is your first name?' })
   * const {value: lastName} = await Swal.fire({ ...textPromptOptions, title: 'What is your last name?' })
   *
   * After:
   * const TextPrompt = Swal.mixin({ input: 'text', showCancelButton: true })
   * const {value: firstName} = await TextPrompt('What is your first name?')
   * const {value: lastName} = await TextPrompt('What is your last name?')
   *
   * @param mixinParams
   */
  function mixin(mixinParams) {
    var MixinSwal = /*#__PURE__*/function (_this) {
      _inherits(MixinSwal, _this);

      var _super = _createSuper(MixinSwal);

      function MixinSwal() {
        _classCallCheck(this, MixinSwal);

        return _super.apply(this, arguments);
      }

      _createClass(MixinSwal, [{
        key: "_main",
        value: function _main(params) {
          return _get(_getPrototypeOf(MixinSwal.prototype), "_main", this).call(this, _extends({}, mixinParams, params));
        }
      }]);

      return MixinSwal;
    }(this);

    return MixinSwal;
  }

  /**
   * Show spinner instead of Confirm button
   */

  var showLoading = function showLoading() {
    var popup = getPopup();

    if (!popup) {
      Swal.fire();
    }

    popup = getPopup();
    var actions = getActions();
    var confirmButton = getConfirmButton();
    show(actions);
    show(confirmButton, 'inline-block');
    addClass([popup, actions], swalClasses.loading);
    confirmButton.disabled = true;
    popup.setAttribute('data-loading', true);
    popup.setAttribute('aria-busy', true);
    popup.focus();
  };

  var RESTORE_FOCUS_TIMEOUT = 100;

  var globalState = {};

  var focusPreviousActiveElement = function focusPreviousActiveElement() {
    if (globalState.previousActiveElement && globalState.previousActiveElement.focus) {
      globalState.previousActiveElement.focus();
      globalState.previousActiveElement = null;
    } else if (document.body) {
      document.body.focus();
    }
  }; // Restore previous active (focused) element


  var restoreActiveElement = function restoreActiveElement() {
    return new Promise(function (resolve) {
      var x = window.scrollX;
      var y = window.scrollY;
      globalState.restoreFocusTimeout = setTimeout(function () {
        focusPreviousActiveElement();
        resolve();
      }, RESTORE_FOCUS_TIMEOUT); // issues/900

      /* istanbul ignore if */

      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        // IE doesn't have scrollX/scrollY support
        window.scrollTo(x, y);
      }
    });
  };

  /**
   * If `timer` parameter is set, returns number of milliseconds of timer remained.
   * Otherwise, returns undefined.
   */

  var getTimerLeft = function getTimerLeft() {
    return globalState.timeout && globalState.timeout.getTimerLeft();
  };
  /**
   * Stop timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var stopTimer = function stopTimer() {
    if (globalState.timeout) {
      stopTimerProgressBar();
      return globalState.timeout.stop();
    }
  };
  /**
   * Resume timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var resumeTimer = function resumeTimer() {
    if (globalState.timeout) {
      var remaining = globalState.timeout.start();
      animateTimerProgressBar(remaining);
      return remaining;
    }
  };
  /**
   * Resume timer. Returns number of milliseconds of timer remained.
   * If `timer` parameter isn't set, returns undefined.
   */

  var toggleTimer = function toggleTimer() {
    var timer = globalState.timeout;
    return timer && (timer.running ? stopTimer() : resumeTimer());
  };
  /**
   * Increase timer. Returns number of milliseconds of an updated timer.
   * If `timer` parameter isn't set, returns undefined.
   */

  var increaseTimer = function increaseTimer(n) {
    if (globalState.timeout) {
      var remaining = globalState.timeout.increase(n);
      animateTimerProgressBar(remaining, true);
      return remaining;
    }
  };
  /**
   * Check if timer is running. Returns true if timer is running
   * or false if timer is paused or stopped.
   * If `timer` parameter isn't set, returns undefined
   */

  var isTimerRunning = function isTimerRunning() {
    return globalState.timeout && globalState.timeout.isRunning();
  };

  var defaultParams = {
    title: '',
    titleText: '',
    text: '',
    html: '',
    footer: '',
    icon: undefined,
    iconHtml: undefined,
    toast: false,
    animation: true,
    showClass: {
      popup: 'swal2-show',
      backdrop: 'swal2-backdrop-show',
      icon: 'swal2-icon-show'
    },
    hideClass: {
      popup: 'swal2-hide',
      backdrop: 'swal2-backdrop-hide',
      icon: 'swal2-icon-hide'
    },
    customClass: undefined,
    target: 'body',
    backdrop: true,
    heightAuto: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    allowEnterKey: true,
    stopKeydownPropagation: true,
    keydownListenerCapture: false,
    showConfirmButton: true,
    showCancelButton: false,
    preConfirm: undefined,
    confirmButtonText: 'OK',
    confirmButtonAriaLabel: '',
    confirmButtonColor: undefined,
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: '',
    cancelButtonColor: undefined,
    buttonsStyling: true,
    reverseButtons: false,
    focusConfirm: true,
    focusCancel: false,
    showCloseButton: false,
    closeButtonHtml: '&times;',
    closeButtonAriaLabel: 'Close this dialog',
    showLoaderOnConfirm: false,
    imageUrl: undefined,
    imageWidth: undefined,
    imageHeight: undefined,
    imageAlt: '',
    timer: undefined,
    timerProgressBar: false,
    width: undefined,
    padding: undefined,
    background: undefined,
    input: undefined,
    inputPlaceholder: '',
    inputValue: '',
    inputOptions: {},
    inputAutoTrim: true,
    inputAttributes: {},
    inputValidator: undefined,
    validationMessage: undefined,
    grow: false,
    position: 'center',
    progressSteps: [],
    currentProgressStep: undefined,
    progressStepsDistance: undefined,
    onBeforeOpen: undefined,
    onOpen: undefined,
    onRender: undefined,
    onClose: undefined,
    onAfterClose: undefined,
    onDestroy: undefined,
    scrollbarPadding: true
  };
  var updatableParams = ['title', 'titleText', 'text', 'html', 'icon', 'hideClass', 'customClass', 'allowOutsideClick', 'allowEscapeKey', 'showConfirmButton', 'showCancelButton', 'confirmButtonText', 'confirmButtonAriaLabel', 'confirmButtonColor', 'cancelButtonText', 'cancelButtonAriaLabel', 'cancelButtonColor', 'buttonsStyling', 'reverseButtons', 'imageUrl', 'imageWidth', 'imageHeight', 'imageAlt', 'progressSteps', 'currentProgressStep'];
  var deprecatedParams = {
    animation: 'showClass" and "hideClass'
  };
  var toastIncompatibleParams = ['allowOutsideClick', 'allowEnterKey', 'backdrop', 'focusConfirm', 'focusCancel', 'heightAuto', 'keydownListenerCapture'];
  /**
   * Is valid parameter
   * @param {String} paramName
   */

  var isValidParameter = function isValidParameter(paramName) {
    return Object.prototype.hasOwnProperty.call(defaultParams, paramName);
  };
  /**
   * Is valid parameter for Swal.update() method
   * @param {String} paramName
   */

  var isUpdatableParameter = function isUpdatableParameter(paramName) {
    return updatableParams.indexOf(paramName) !== -1;
  };
  /**
   * Is deprecated parameter
   * @param {String} paramName
   */

  var isDeprecatedParameter = function isDeprecatedParameter(paramName) {
    return deprecatedParams[paramName];
  };

  var checkIfParamIsValid = function checkIfParamIsValid(param) {
    if (!isValidParameter(param)) {
      warn("Unknown parameter \"".concat(param, "\""));
    }
  };

  var checkIfToastParamIsValid = function checkIfToastParamIsValid(param) {
    if (toastIncompatibleParams.indexOf(param) !== -1) {
      warn("The parameter \"".concat(param, "\" is incompatible with toasts"));
    }
  };

  var checkIfParamIsDeprecated = function checkIfParamIsDeprecated(param) {
    if (isDeprecatedParameter(param)) {
      warnAboutDepreation(param, isDeprecatedParameter(param));
    }
  };
  /**
   * Show relevant warnings for given params
   *
   * @param params
   */


  var showWarningsForParams = function showWarningsForParams(params) {
    for (var param in params) {
      checkIfParamIsValid(param);

      if (params.toast) {
        checkIfToastParamIsValid(param);
      }

      checkIfParamIsDeprecated(param);
    }
  };



  var staticMethods = /*#__PURE__*/Object.freeze({
    isValidParameter: isValidParameter,
    isUpdatableParameter: isUpdatableParameter,
    isDeprecatedParameter: isDeprecatedParameter,
    argsToParams: argsToParams,
    isVisible: isVisible$1,
    clickConfirm: clickConfirm,
    clickCancel: clickCancel,
    getContainer: getContainer,
    getPopup: getPopup,
    getTitle: getTitle,
    getContent: getContent,
    getHtmlContainer: getHtmlContainer,
    getImage: getImage,
    getIcon: getIcon,
    getIcons: getIcons,
    getCloseButton: getCloseButton,
    getActions: getActions,
    getConfirmButton: getConfirmButton,
    getCancelButton: getCancelButton,
    getHeader: getHeader,
    getFooter: getFooter,
    getTimerProgressBar: getTimerProgressBar,
    getFocusableElements: getFocusableElements,
    getValidationMessage: getValidationMessage,
    isLoading: isLoading,
    fire: fire,
    mixin: mixin,
    queue: queue,
    getQueueStep: getQueueStep,
    insertQueueStep: insertQueueStep,
    deleteQueueStep: deleteQueueStep,
    showLoading: showLoading,
    enableLoading: showLoading,
    getTimerLeft: getTimerLeft,
    stopTimer: stopTimer,
    resumeTimer: resumeTimer,
    toggleTimer: toggleTimer,
    increaseTimer: increaseTimer,
    isTimerRunning: isTimerRunning
  });

  /**
   * Enables buttons and hide loader.
   */

  function hideLoading() {
    // do nothing if popup is closed
    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams) {
      return;
    }

    var domCache = privateProps.domCache.get(this);

    if (!innerParams.showConfirmButton) {
      hide(domCache.confirmButton);

      if (!innerParams.showCancelButton) {
        hide(domCache.actions);
      }
    }

    removeClass([domCache.popup, domCache.actions], swalClasses.loading);
    domCache.popup.removeAttribute('aria-busy');
    domCache.popup.removeAttribute('data-loading');
    domCache.confirmButton.disabled = false;
    domCache.cancelButton.disabled = false;
  }

  function getInput$1(instance) {
    var innerParams = privateProps.innerParams.get(instance || this);
    var domCache = privateProps.domCache.get(instance || this);

    if (!domCache) {
      return null;
    }

    return getInput(domCache.content, innerParams.input);
  }

  var fixScrollbar = function fixScrollbar() {
    // for queues, do not do this more than once
    if (states.previousBodyPadding !== null) {
      return;
    } // if the body has overflow


    if (document.body.scrollHeight > window.innerHeight) {
      // add padding so the content doesn't shift after removal of scrollbar
      states.previousBodyPadding = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'));
      document.body.style.paddingRight = "".concat(states.previousBodyPadding + measureScrollbar(), "px");
    }
  };
  var undoScrollbar = function undoScrollbar() {
    if (states.previousBodyPadding !== null) {
      document.body.style.paddingRight = "".concat(states.previousBodyPadding, "px");
      states.previousBodyPadding = null;
    }
  };

  /* istanbul ignore file */

  var iOSfix = function iOSfix() {
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

    if (iOS && !hasClass(document.body, swalClasses.iosfix)) {
      var offset = document.body.scrollTop;
      document.body.style.top = "".concat(offset * -1, "px");
      addClass(document.body, swalClasses.iosfix);
      lockBodyScroll();
    }
  };

  var lockBodyScroll = function lockBodyScroll() {
    // #1246
    var container = getContainer();
    var preventTouchMove;

    container.ontouchstart = function (e) {
      preventTouchMove = shouldPreventTouchMove(e.target);
    };

    container.ontouchmove = function (e) {
      if (preventTouchMove) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  };

  var shouldPreventTouchMove = function shouldPreventTouchMove(target) {
    var container = getContainer();

    if (target === container) {
      return true;
    }

    if (!isScrollable(container) && target.tagName !== 'INPUT' && // #1603
    !(isScrollable(getContent()) && // #1944
    getContent().contains(target))) {
      return true;
    }

    return false;
  };

  var undoIOSfix = function undoIOSfix() {
    if (hasClass(document.body, swalClasses.iosfix)) {
      var offset = parseInt(document.body.style.top, 10);
      removeClass(document.body, swalClasses.iosfix);
      document.body.style.top = '';
      document.body.scrollTop = offset * -1;
    }
  };

  /* istanbul ignore file */

  var isIE11 = function isIE11() {
    return !!window.MSInputMethodContext && !!document.documentMode;
  }; // Fix IE11 centering sweetalert2/issues/933


  var fixVerticalPositionIE = function fixVerticalPositionIE() {
    var container = getContainer();
    var popup = getPopup();
    container.style.removeProperty('align-items');

    if (popup.offsetTop < 0) {
      container.style.alignItems = 'flex-start';
    }
  };

  var IEfix = function IEfix() {
    if (typeof window !== 'undefined' && isIE11()) {
      fixVerticalPositionIE();
      window.addEventListener('resize', fixVerticalPositionIE);
    }
  };
  var undoIEfix = function undoIEfix() {
    if (typeof window !== 'undefined' && isIE11()) {
      window.removeEventListener('resize', fixVerticalPositionIE);
    }
  };

  // Adding aria-hidden="true" to elements outside of the active modal dialog ensures that
  // elements not within the active modal dialog will not be surfaced if a user opens a screen
  // reader’s list of elements (headings, form controls, landmarks, etc.) in the document.

  var setAriaHidden = function setAriaHidden() {
    var bodyChildren = toArray(document.body.children);
    bodyChildren.forEach(function (el) {
      if (el === getContainer() || contains(el, getContainer())) {
        return;
      }

      if (el.hasAttribute('aria-hidden')) {
        el.setAttribute('data-previous-aria-hidden', el.getAttribute('aria-hidden'));
      }

      el.setAttribute('aria-hidden', 'true');
    });
  };
  var unsetAriaHidden = function unsetAriaHidden() {
    var bodyChildren = toArray(document.body.children);
    bodyChildren.forEach(function (el) {
      if (el.hasAttribute('data-previous-aria-hidden')) {
        el.setAttribute('aria-hidden', el.getAttribute('data-previous-aria-hidden'));
        el.removeAttribute('data-previous-aria-hidden');
      } else {
        el.removeAttribute('aria-hidden');
      }
    });
  };

  /**
   * This module containts `WeakMap`s for each effectively-"private  property" that a `Swal` has.
   * For example, to set the private property "foo" of `this` to "bar", you can `privateProps.foo.set(this, 'bar')`
   * This is the approach that Babel will probably take to implement private methods/fields
   *   https://github.com/tc39/proposal-private-methods
   *   https://github.com/babel/babel/pull/7555
   * Once we have the changes from that PR in Babel, and our core class fits reasonable in *one module*
   *   then we can use that language feature.
   */
  var privateMethods = {
    swalPromiseResolve: new WeakMap()
  };

  /*
   * Instance method to close sweetAlert
   */

  function removePopupAndResetState(instance, container, isToast$$1, onAfterClose) {
    if (isToast$$1) {
      triggerOnAfterCloseAndDispose(instance, onAfterClose);
    } else {
      restoreActiveElement().then(function () {
        return triggerOnAfterCloseAndDispose(instance, onAfterClose);
      });
      globalState.keydownTarget.removeEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = false;
    }

    if (container.parentNode && !document.body.getAttribute('data-swal2-queue-step')) {
      container.parentNode.removeChild(container);
    }

    if (isModal()) {
      undoScrollbar();
      undoIOSfix();
      undoIEfix();
      unsetAriaHidden();
    }

    removeBodyClasses();
  }

  function removeBodyClasses() {
    removeClass([document.documentElement, document.body], [swalClasses.shown, swalClasses['height-auto'], swalClasses['no-backdrop'], swalClasses['toast-shown'], swalClasses['toast-column']]);
  }

  function close(resolveValue) {
    var popup = getPopup();

    if (!popup) {
      return;
    }

    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams || hasClass(popup, innerParams.hideClass.popup)) {
      return;
    }

    var swalPromiseResolve = privateMethods.swalPromiseResolve.get(this);
    removeClass(popup, innerParams.showClass.popup);
    addClass(popup, innerParams.hideClass.popup);
    var backdrop = getContainer();
    removeClass(backdrop, innerParams.showClass.backdrop);
    addClass(backdrop, innerParams.hideClass.backdrop);
    handlePopupAnimation(this, popup, innerParams); // Resolve Swal promise

    swalPromiseResolve(resolveValue || {});
  }

  var handlePopupAnimation = function handlePopupAnimation(instance, popup, innerParams) {
    var container = getContainer(); // If animation is supported, animate

    var animationIsSupported = animationEndEvent && hasCssAnimation(popup);
    var onClose = innerParams.onClose,
        onAfterClose = innerParams.onAfterClose;

    if (onClose !== null && typeof onClose === 'function') {
      onClose(popup);
    }

    if (animationIsSupported) {
      animatePopup(instance, popup, container, onAfterClose);
    } else {
      // Otherwise, remove immediately
      removePopupAndResetState(instance, container, isToast(), onAfterClose);
    }
  };

  var animatePopup = function animatePopup(instance, popup, container, onAfterClose) {
    globalState.swalCloseEventFinishedCallback = removePopupAndResetState.bind(null, instance, container, isToast(), onAfterClose);
    popup.addEventListener(animationEndEvent, function (e) {
      if (e.target === popup) {
        globalState.swalCloseEventFinishedCallback();
        delete globalState.swalCloseEventFinishedCallback;
      }
    });
  };

  var triggerOnAfterCloseAndDispose = function triggerOnAfterCloseAndDispose(instance, onAfterClose) {
    setTimeout(function () {
      if (typeof onAfterClose === 'function') {
        onAfterClose();
      }

      instance._destroy();
    });
  };

  function setButtonsDisabled(instance, buttons, disabled) {
    var domCache = privateProps.domCache.get(instance);
    buttons.forEach(function (button) {
      domCache[button].disabled = disabled;
    });
  }

  function setInputDisabled(input, disabled) {
    if (!input) {
      return false;
    }

    if (input.type === 'radio') {
      var radiosContainer = input.parentNode.parentNode;
      var radios = radiosContainer.querySelectorAll('input');

      for (var i = 0; i < radios.length; i++) {
        radios[i].disabled = disabled;
      }
    } else {
      input.disabled = disabled;
    }
  }

  function enableButtons() {
    setButtonsDisabled(this, ['confirmButton', 'cancelButton'], false);
  }
  function disableButtons() {
    setButtonsDisabled(this, ['confirmButton', 'cancelButton'], true);
  }
  function enableInput() {
    return setInputDisabled(this.getInput(), false);
  }
  function disableInput() {
    return setInputDisabled(this.getInput(), true);
  }

  function showValidationMessage(error) {
    var domCache = privateProps.domCache.get(this);
    setInnerHtml(domCache.validationMessage, error);
    var popupComputedStyle = window.getComputedStyle(domCache.popup);
    domCache.validationMessage.style.marginLeft = "-".concat(popupComputedStyle.getPropertyValue('padding-left'));
    domCache.validationMessage.style.marginRight = "-".concat(popupComputedStyle.getPropertyValue('padding-right'));
    show(domCache.validationMessage);
    var input = this.getInput();

    if (input) {
      input.setAttribute('aria-invalid', true);
      input.setAttribute('aria-describedBy', swalClasses['validation-message']);
      focusInput(input);
      addClass(input, swalClasses.inputerror);
    }
  } // Hide block with validation message

  function resetValidationMessage$1() {
    var domCache = privateProps.domCache.get(this);

    if (domCache.validationMessage) {
      hide(domCache.validationMessage);
    }

    var input = this.getInput();

    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedBy');
      removeClass(input, swalClasses.inputerror);
    }
  }

  function getProgressSteps$1() {
    var domCache = privateProps.domCache.get(this);
    return domCache.progressSteps;
  }

  var Timer = /*#__PURE__*/function () {
    function Timer(callback, delay) {
      _classCallCheck(this, Timer);

      this.callback = callback;
      this.remaining = delay;
      this.running = false;
      this.start();
    }

    _createClass(Timer, [{
      key: "start",
      value: function start() {
        if (!this.running) {
          this.running = true;
          this.started = new Date();
          this.id = setTimeout(this.callback, this.remaining);
        }

        return this.remaining;
      }
    }, {
      key: "stop",
      value: function stop() {
        if (this.running) {
          this.running = false;
          clearTimeout(this.id);
          this.remaining -= new Date() - this.started;
        }

        return this.remaining;
      }
    }, {
      key: "increase",
      value: function increase(n) {
        var running = this.running;

        if (running) {
          this.stop();
        }

        this.remaining += n;

        if (running) {
          this.start();
        }

        return this.remaining;
      }
    }, {
      key: "getTimerLeft",
      value: function getTimerLeft() {
        if (this.running) {
          this.stop();
          this.start();
        }

        return this.remaining;
      }
    }, {
      key: "isRunning",
      value: function isRunning() {
        return this.running;
      }
    }]);

    return Timer;
  }();

  var defaultInputValidators = {
    email: function email(string, validationMessage) {
      return /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(string) ? Promise.resolve() : Promise.resolve(validationMessage || 'Invalid email address');
    },
    url: function url(string, validationMessage) {
      // taken from https://stackoverflow.com/a/3809435 with a small change from #1306
      return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(string) ? Promise.resolve() : Promise.resolve(validationMessage || 'Invalid URL');
    }
  };

  function setDefaultInputValidators(params) {
    // Use default `inputValidator` for supported input types if not provided
    if (!params.inputValidator) {
      Object.keys(defaultInputValidators).forEach(function (key) {
        if (params.input === key) {
          params.inputValidator = defaultInputValidators[key];
        }
      });
    }
  }

  function validateCustomTargetElement(params) {
    // Determine if the custom target element is valid
    if (!params.target || typeof params.target === 'string' && !document.querySelector(params.target) || typeof params.target !== 'string' && !params.target.appendChild) {
      warn('Target parameter is not valid, defaulting to "body"');
      params.target = 'body';
    }
  }
  /**
   * Set type, text and actions on popup
   *
   * @param params
   * @returns {boolean}
   */


  function setParameters(params) {
    setDefaultInputValidators(params); // showLoaderOnConfirm && preConfirm

    if (params.showLoaderOnConfirm && !params.preConfirm) {
      warn('showLoaderOnConfirm is set to true, but preConfirm is not defined.\n' + 'showLoaderOnConfirm should be used together with preConfirm, see usage example:\n' + 'https://sweetalert2.github.io/#ajax-request');
    } // params.animation will be actually used in renderPopup.js
    // but in case when params.animation is a function, we need to call that function
    // before popup (re)initialization, so it'll be possible to check Swal.isVisible()
    // inside the params.animation function


    params.animation = callIfFunction(params.animation);
    validateCustomTargetElement(params); // Replace newlines with <br> in title

    if (typeof params.title === 'string') {
      params.title = params.title.split('\n').join('<br />');
    }

    init(params);
  }

  /**
   * Open popup, add necessary classes and styles, fix scrollbar
   *
   * @param {Array} params
   */

  var openPopup = function openPopup(params) {
    var container = getContainer();
    var popup = getPopup();

    if (typeof params.onBeforeOpen === 'function') {
      params.onBeforeOpen(popup);
    }

    addClasses$1(container, popup, params); // scrolling is 'hidden' until animation is done, after that 'auto'

    setScrollingVisibility(container, popup);

    if (isModal()) {
      fixScrollContainer(container, params.scrollbarPadding);
    }

    if (!isToast() && !globalState.previousActiveElement) {
      globalState.previousActiveElement = document.activeElement;
    }

    if (typeof params.onOpen === 'function') {
      setTimeout(function () {
        return params.onOpen(popup);
      });
    }

    removeClass(container, swalClasses['no-transition']);
  };

  function swalOpenAnimationFinished(event) {
    var popup = getPopup();

    if (event.target !== popup) {
      return;
    }

    var container = getContainer();
    popup.removeEventListener(animationEndEvent, swalOpenAnimationFinished);
    container.style.overflowY = 'auto';
  }

  var setScrollingVisibility = function setScrollingVisibility(container, popup) {
    if (animationEndEvent && hasCssAnimation(popup)) {
      container.style.overflowY = 'hidden';
      popup.addEventListener(animationEndEvent, swalOpenAnimationFinished);
    } else {
      container.style.overflowY = 'auto';
    }
  };

  var fixScrollContainer = function fixScrollContainer(container, scrollbarPadding) {
    iOSfix();
    IEfix();
    setAriaHidden();

    if (scrollbarPadding) {
      fixScrollbar();
    } // sweetalert2/issues/1247


    setTimeout(function () {
      container.scrollTop = 0;
    });
  };

  var addClasses$1 = function addClasses(container, popup, params) {
    addClass(container, params.showClass.backdrop);
    show(popup); // Animate popup right after showing it

    addClass(popup, params.showClass.popup);
    addClass([document.documentElement, document.body], swalClasses.shown);

    if (params.heightAuto && params.backdrop && !params.toast) {
      addClass([document.documentElement, document.body], swalClasses['height-auto']);
    }
  };

  var handleInputOptionsAndValue = function handleInputOptionsAndValue(instance, params) {
    if (params.input === 'select' || params.input === 'radio') {
      handleInputOptions(instance, params);
    } else if (['text', 'email', 'number', 'tel', 'textarea'].indexOf(params.input) !== -1 && isPromise(params.inputValue)) {
      handleInputValue(instance, params);
    }
  };
  var getInputValue = function getInputValue(instance, innerParams) {
    var input = instance.getInput();

    if (!input) {
      return null;
    }

    switch (innerParams.input) {
      case 'checkbox':
        return getCheckboxValue(input);

      case 'radio':
        return getRadioValue(input);

      case 'file':
        return getFileValue(input);

      default:
        return innerParams.inputAutoTrim ? input.value.trim() : input.value;
    }
  };

  var getCheckboxValue = function getCheckboxValue(input) {
    return input.checked ? 1 : 0;
  };

  var getRadioValue = function getRadioValue(input) {
    return input.checked ? input.value : null;
  };

  var getFileValue = function getFileValue(input) {
    return input.files.length ? input.getAttribute('multiple') !== null ? input.files : input.files[0] : null;
  };

  var handleInputOptions = function handleInputOptions(instance, params) {
    var content = getContent();

    var processInputOptions = function processInputOptions(inputOptions) {
      return populateInputOptions[params.input](content, formatInputOptions(inputOptions), params);
    };

    if (isPromise(params.inputOptions)) {
      showLoading();
      params.inputOptions.then(function (inputOptions) {
        instance.hideLoading();
        processInputOptions(inputOptions);
      });
    } else if (_typeof(params.inputOptions) === 'object') {
      processInputOptions(params.inputOptions);
    } else {
      error("Unexpected type of inputOptions! Expected object, Map or Promise, got ".concat(_typeof(params.inputOptions)));
    }
  };

  var handleInputValue = function handleInputValue(instance, params) {
    var input = instance.getInput();
    hide(input);
    params.inputValue.then(function (inputValue) {
      input.value = params.input === 'number' ? parseFloat(inputValue) || 0 : "".concat(inputValue);
      show(input);
      input.focus();
      instance.hideLoading();
    })["catch"](function (err) {
      error("Error in inputValue promise: ".concat(err));
      input.value = '';
      show(input);
      input.focus();
      instance.hideLoading();
    });
  };

  var populateInputOptions = {
    select: function select(content, inputOptions, params) {
      var select = getChildByClass(content, swalClasses.select);
      inputOptions.forEach(function (inputOption) {
        var optionValue = inputOption[0];
        var optionLabel = inputOption[1];
        var option = document.createElement('option');
        option.value = optionValue;
        setInnerHtml(option, optionLabel);

        if (params.inputValue.toString() === optionValue.toString()) {
          option.selected = true;
        }

        select.appendChild(option);
      });
      select.focus();
    },
    radio: function radio(content, inputOptions, params) {
      var radio = getChildByClass(content, swalClasses.radio);
      inputOptions.forEach(function (inputOption) {
        var radioValue = inputOption[0];
        var radioLabel = inputOption[1];
        var radioInput = document.createElement('input');
        var radioLabelElement = document.createElement('label');
        radioInput.type = 'radio';
        radioInput.name = swalClasses.radio;
        radioInput.value = radioValue;

        if (params.inputValue.toString() === radioValue.toString()) {
          radioInput.checked = true;
        }

        var label = document.createElement('span');
        setInnerHtml(label, radioLabel);
        label.className = swalClasses.label;
        radioLabelElement.appendChild(radioInput);
        radioLabelElement.appendChild(label);
        radio.appendChild(radioLabelElement);
      });
      var radios = radio.querySelectorAll('input');

      if (radios.length) {
        radios[0].focus();
      }
    }
  };
  /**
   * Converts `inputOptions` into an array of `[value, label]`s
   * @param inputOptions
   */

  var formatInputOptions = function formatInputOptions(inputOptions) {
    var result = [];

    if (typeof Map !== 'undefined' && inputOptions instanceof Map) {
      inputOptions.forEach(function (value, key) {
        result.push([key, value]);
      });
    } else {
      Object.keys(inputOptions).forEach(function (key) {
        result.push([key, inputOptions[key]]);
      });
    }

    return result;
  };

  var handleConfirmButtonClick = function handleConfirmButtonClick(instance, innerParams) {
    instance.disableButtons();

    if (innerParams.input) {
      handleConfirmWithInput(instance, innerParams);
    } else {
      confirm(instance, innerParams, true);
    }
  };
  var handleCancelButtonClick = function handleCancelButtonClick(instance, dismissWith) {
    instance.disableButtons();
    dismissWith(DismissReason.cancel);
  };

  var handleConfirmWithInput = function handleConfirmWithInput(instance, innerParams) {
    var inputValue = getInputValue(instance, innerParams);

    if (innerParams.inputValidator) {
      instance.disableInput();
      var validationPromise = Promise.resolve().then(function () {
        return innerParams.inputValidator(inputValue, innerParams.validationMessage);
      });
      validationPromise.then(function (validationMessage) {
        instance.enableButtons();
        instance.enableInput();

        if (validationMessage) {
          instance.showValidationMessage(validationMessage);
        } else {
          confirm(instance, innerParams, inputValue);
        }
      });
    } else if (!instance.getInput().checkValidity()) {
      instance.enableButtons();
      instance.showValidationMessage(innerParams.validationMessage);
    } else {
      confirm(instance, innerParams, inputValue);
    }
  };

  var succeedWith = function succeedWith(instance, value) {
    instance.closePopup({
      value: value
    });
  };

  var confirm = function confirm(instance, innerParams, value) {
    if (innerParams.showLoaderOnConfirm) {
      showLoading(); // TODO: make showLoading an *instance* method
    }

    if (innerParams.preConfirm) {
      instance.resetValidationMessage();
      var preConfirmPromise = Promise.resolve().then(function () {
        return innerParams.preConfirm(value, innerParams.validationMessage);
      });
      preConfirmPromise.then(function (preConfirmValue) {
        if (isVisible(getValidationMessage()) || preConfirmValue === false) {
          instance.hideLoading();
        } else {
          succeedWith(instance, typeof preConfirmValue === 'undefined' ? value : preConfirmValue);
        }
      });
    } else {
      succeedWith(instance, value);
    }
  };

  var addKeydownHandler = function addKeydownHandler(instance, globalState, innerParams, dismissWith) {
    if (globalState.keydownTarget && globalState.keydownHandlerAdded) {
      globalState.keydownTarget.removeEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = false;
    }

    if (!innerParams.toast) {
      globalState.keydownHandler = function (e) {
        return keydownHandler(instance, e, dismissWith);
      };

      globalState.keydownTarget = innerParams.keydownListenerCapture ? window : getPopup();
      globalState.keydownListenerCapture = innerParams.keydownListenerCapture;
      globalState.keydownTarget.addEventListener('keydown', globalState.keydownHandler, {
        capture: globalState.keydownListenerCapture
      });
      globalState.keydownHandlerAdded = true;
    }
  }; // Focus handling

  var setFocus = function setFocus(innerParams, index, increment) {
    var focusableElements = getFocusableElements(); // search for visible elements and select the next possible match

    for (var i = 0; i < focusableElements.length; i++) {
      index = index + increment; // rollover to first item

      if (index === focusableElements.length) {
        index = 0; // go to last item
      } else if (index === -1) {
        index = focusableElements.length - 1;
      }

      return focusableElements[index].focus();
    } // no visible focusable elements, focus the popup


    getPopup().focus();
  };
  var arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Left', 'Right', 'Up', 'Down' // IE11
  ];
  var escKeys = ['Escape', 'Esc' // IE11
  ];

  var keydownHandler = function keydownHandler(instance, e, dismissWith) {
    var innerParams = privateProps.innerParams.get(instance);

    if (innerParams.stopKeydownPropagation) {
      e.stopPropagation();
    } // ENTER


    if (e.key === 'Enter') {
      handleEnter(instance, e, innerParams); // TAB
    } else if (e.key === 'Tab') {
      handleTab(e, innerParams); // ARROWS - switch focus between buttons
    } else if (arrowKeys.indexOf(e.key) !== -1) {
      handleArrows(); // ESC
    } else if (escKeys.indexOf(e.key) !== -1) {
      handleEsc(e, innerParams, dismissWith);
    }
  };

  var handleEnter = function handleEnter(instance, e, innerParams) {
    // #720 #721
    if (e.isComposing) {
      return;
    }

    if (e.target && instance.getInput() && e.target.outerHTML === instance.getInput().outerHTML) {
      if (['textarea', 'file'].indexOf(innerParams.input) !== -1) {
        return; // do not submit
      }

      clickConfirm();
      e.preventDefault();
    }
  };

  var handleTab = function handleTab(e, innerParams) {
    var targetElement = e.target;
    var focusableElements = getFocusableElements();
    var btnIndex = -1;

    for (var i = 0; i < focusableElements.length; i++) {
      if (targetElement === focusableElements[i]) {
        btnIndex = i;
        break;
      }
    }

    if (!e.shiftKey) {
      // Cycle to the next button
      setFocus(innerParams, btnIndex, 1);
    } else {
      // Cycle to the prev button
      setFocus(innerParams, btnIndex, -1);
    }

    e.stopPropagation();
    e.preventDefault();
  };

  var handleArrows = function handleArrows() {
    var confirmButton = getConfirmButton();
    var cancelButton = getCancelButton(); // focus Cancel button if Confirm button is currently focused

    if (document.activeElement === confirmButton && isVisible(cancelButton)) {
      cancelButton.focus(); // and vice versa
    } else if (document.activeElement === cancelButton && isVisible(confirmButton)) {
      confirmButton.focus();
    }
  };

  var handleEsc = function handleEsc(e, innerParams, dismissWith) {
    if (callIfFunction(innerParams.allowEscapeKey)) {
      e.preventDefault();
      dismissWith(DismissReason.esc);
    }
  };

  var handlePopupClick = function handlePopupClick(instance, domCache, dismissWith) {
    var innerParams = privateProps.innerParams.get(instance);

    if (innerParams.toast) {
      handleToastClick(instance, domCache, dismissWith);
    } else {
      // Ignore click events that had mousedown on the popup but mouseup on the container
      // This can happen when the user drags a slider
      handleModalMousedown(domCache); // Ignore click events that had mousedown on the container but mouseup on the popup

      handleContainerMousedown(domCache);
      handleModalClick(instance, domCache, dismissWith);
    }
  };

  var handleToastClick = function handleToastClick(instance, domCache, dismissWith) {
    // Closing toast by internal click
    domCache.popup.onclick = function () {
      var innerParams = privateProps.innerParams.get(instance);

      if (innerParams.showConfirmButton || innerParams.showCancelButton || innerParams.showCloseButton || innerParams.input) {
        return;
      }

      dismissWith(DismissReason.close);
    };
  };

  var ignoreOutsideClick = false;

  var handleModalMousedown = function handleModalMousedown(domCache) {
    domCache.popup.onmousedown = function () {
      domCache.container.onmouseup = function (e) {
        domCache.container.onmouseup = undefined; // We only check if the mouseup target is the container because usually it doesn't
        // have any other direct children aside of the popup

        if (e.target === domCache.container) {
          ignoreOutsideClick = true;
        }
      };
    };
  };

  var handleContainerMousedown = function handleContainerMousedown(domCache) {
    domCache.container.onmousedown = function () {
      domCache.popup.onmouseup = function (e) {
        domCache.popup.onmouseup = undefined; // We also need to check if the mouseup target is a child of the popup

        if (e.target === domCache.popup || domCache.popup.contains(e.target)) {
          ignoreOutsideClick = true;
        }
      };
    };
  };

  var handleModalClick = function handleModalClick(instance, domCache, dismissWith) {
    domCache.container.onclick = function (e) {
      var innerParams = privateProps.innerParams.get(instance);

      if (ignoreOutsideClick) {
        ignoreOutsideClick = false;
        return;
      }

      if (e.target === domCache.container && callIfFunction(innerParams.allowOutsideClick)) {
        dismissWith(DismissReason.backdrop);
      }
    };
  };

  function _main(userParams) {
    showWarningsForParams(userParams);

    if (globalState.currentInstance) {
      globalState.currentInstance._destroy();
    }

    globalState.currentInstance = this;
    var innerParams = prepareParams(userParams);
    setParameters(innerParams);
    Object.freeze(innerParams); // clear the previous timer

    if (globalState.timeout) {
      globalState.timeout.stop();
      delete globalState.timeout;
    } // clear the restore focus timeout


    clearTimeout(globalState.restoreFocusTimeout);
    var domCache = populateDomCache(this);
    render(this, innerParams);
    privateProps.innerParams.set(this, innerParams);
    return swalPromise(this, domCache, innerParams);
  }

  var prepareParams = function prepareParams(userParams) {
    var showClass = _extends({}, defaultParams.showClass, userParams.showClass);

    var hideClass = _extends({}, defaultParams.hideClass, userParams.hideClass);

    var params = _extends({}, defaultParams, userParams);

    params.showClass = showClass;
    params.hideClass = hideClass; // @deprecated

    if (userParams.animation === false) {
      params.showClass = {
        popup: 'swal2-noanimation',
        backdrop: 'swal2-noanimation'
      };
      params.hideClass = {};
    }

    return params;
  };

  var swalPromise = function swalPromise(instance, domCache, innerParams) {
    return new Promise(function (resolve) {
      // functions to handle all closings/dismissals
      var dismissWith = function dismissWith(dismiss) {
        instance.closePopup({
          dismiss: dismiss
        });
      };

      privateMethods.swalPromiseResolve.set(instance, resolve);

      domCache.confirmButton.onclick = function () {
        return handleConfirmButtonClick(instance, innerParams);
      };

      domCache.cancelButton.onclick = function () {
        return handleCancelButtonClick(instance, dismissWith);
      };

      domCache.closeButton.onclick = function () {
        return dismissWith(DismissReason.close);
      };

      handlePopupClick(instance, domCache, dismissWith);
      addKeydownHandler(instance, globalState, innerParams, dismissWith);

      if (innerParams.toast && (innerParams.input || innerParams.footer || innerParams.showCloseButton)) {
        addClass(document.body, swalClasses['toast-column']);
      } else {
        removeClass(document.body, swalClasses['toast-column']);
      }

      handleInputOptionsAndValue(instance, innerParams);
      openPopup(innerParams);
      setupTimer(globalState, innerParams, dismissWith);
      initFocus(domCache, innerParams); // Scroll container to top on open (#1247, #1946)

      setTimeout(function () {
        domCache.container.scrollTop = 0;
      });
    });
  };

  var populateDomCache = function populateDomCache(instance) {
    var domCache = {
      popup: getPopup(),
      container: getContainer(),
      content: getContent(),
      actions: getActions(),
      confirmButton: getConfirmButton(),
      cancelButton: getCancelButton(),
      closeButton: getCloseButton(),
      validationMessage: getValidationMessage(),
      progressSteps: getProgressSteps()
    };
    privateProps.domCache.set(instance, domCache);
    return domCache;
  };

  var setupTimer = function setupTimer(globalState$$1, innerParams, dismissWith) {
    var timerProgressBar = getTimerProgressBar();
    hide(timerProgressBar);

    if (innerParams.timer) {
      globalState$$1.timeout = new Timer(function () {
        dismissWith('timer');
        delete globalState$$1.timeout;
      }, innerParams.timer);

      if (innerParams.timerProgressBar) {
        show(timerProgressBar);
        setTimeout(function () {
          if (globalState$$1.timeout.running) {
            // timer can be already stopped at this point
            animateTimerProgressBar(innerParams.timer);
          }
        });
      }
    }
  };

  var initFocus = function initFocus(domCache, innerParams) {
    if (innerParams.toast) {
      return;
    }

    if (!callIfFunction(innerParams.allowEnterKey)) {
      return blurActiveElement();
    }

    if (innerParams.focusCancel && isVisible(domCache.cancelButton)) {
      return domCache.cancelButton.focus();
    }

    if (innerParams.focusConfirm && isVisible(domCache.confirmButton)) {
      return domCache.confirmButton.focus();
    }

    setFocus(innerParams, -1, 1);
  };

  var blurActiveElement = function blurActiveElement() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  /**
   * Updates popup parameters.
   */

  function update(params) {
    var popup = getPopup();
    var innerParams = privateProps.innerParams.get(this);

    if (!popup || hasClass(popup, innerParams.hideClass.popup)) {
      return warn("You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup.");
    }

    var validUpdatableParams = {}; // assign valid params from `params` to `defaults`

    Object.keys(params).forEach(function (param) {
      if (Swal.isUpdatableParameter(param)) {
        validUpdatableParams[param] = params[param];
      } else {
        warn("Invalid parameter to update: \"".concat(param, "\". Updatable params are listed here: https://github.com/sweetalert2/sweetalert2/blob/master/src/utils/params.js"));
      }
    });

    var updatedParams = _extends({}, innerParams, validUpdatableParams);

    render(this, updatedParams);
    privateProps.innerParams.set(this, updatedParams);
    Object.defineProperties(this, {
      params: {
        value: _extends({}, this.params, params),
        writable: false,
        enumerable: true
      }
    });
  }

  function _destroy() {
    var domCache = privateProps.domCache.get(this);
    var innerParams = privateProps.innerParams.get(this);

    if (!innerParams) {
      return; // This instance has already been destroyed
    } // Check if there is another Swal closing


    if (domCache.popup && globalState.swalCloseEventFinishedCallback) {
      globalState.swalCloseEventFinishedCallback();
      delete globalState.swalCloseEventFinishedCallback;
    } // Check if there is a swal disposal defer timer


    if (globalState.deferDisposalTimer) {
      clearTimeout(globalState.deferDisposalTimer);
      delete globalState.deferDisposalTimer;
    }

    if (typeof innerParams.onDestroy === 'function') {
      innerParams.onDestroy();
    }

    disposeSwal(this);
  }

  var disposeSwal = function disposeSwal(instance) {
    // Unset this.params so GC will dispose it (#1569)
    delete instance.params; // Unset globalState props so GC will dispose globalState (#1569)

    delete globalState.keydownHandler;
    delete globalState.keydownTarget; // Unset WeakMaps so GC will be able to dispose them (#1569)

    unsetWeakMaps(privateProps);
    unsetWeakMaps(privateMethods);
  };

  var unsetWeakMaps = function unsetWeakMaps(obj) {
    for (var i in obj) {
      obj[i] = new WeakMap();
    }
  };



  var instanceMethods = /*#__PURE__*/Object.freeze({
    hideLoading: hideLoading,
    disableLoading: hideLoading,
    getInput: getInput$1,
    close: close,
    closePopup: close,
    closeModal: close,
    closeToast: close,
    enableButtons: enableButtons,
    disableButtons: disableButtons,
    enableInput: enableInput,
    disableInput: disableInput,
    showValidationMessage: showValidationMessage,
    resetValidationMessage: resetValidationMessage$1,
    getProgressSteps: getProgressSteps$1,
    _main: _main,
    update: update,
    _destroy: _destroy
  });

  var currentInstance; // SweetAlert constructor

  function SweetAlert() {
    // Prevent run in Node env

    /* istanbul ignore if */
    if (typeof window === 'undefined') {
      return;
    } // Check for the existence of Promise

    /* istanbul ignore if */


    if (typeof Promise === 'undefined') {
      error('This package requires a Promise library, please include a shim to enable it in this browser (See: https://github.com/sweetalert2/sweetalert2/wiki/Migration-from-SweetAlert-to-SweetAlert2#1-ie-support)');
    }

    currentInstance = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var outerParams = Object.freeze(this.constructor.argsToParams(args));
    Object.defineProperties(this, {
      params: {
        value: outerParams,
        writable: false,
        enumerable: true,
        configurable: true
      }
    });

    var promise = this._main(this.params);

    privateProps.promise.set(this, promise);
  } // `catch` cannot be the name of a module export, so we define our thenable methods here instead


  SweetAlert.prototype.then = function (onFulfilled) {
    var promise = privateProps.promise.get(this);
    return promise.then(onFulfilled);
  };

  SweetAlert.prototype["finally"] = function (onFinally) {
    var promise = privateProps.promise.get(this);
    return promise["finally"](onFinally);
  }; // Assign instance methods from src/instanceMethods/*.js to prototype


  _extends(SweetAlert.prototype, instanceMethods); // Assign static methods from src/staticMethods/*.js to constructor


  _extends(SweetAlert, staticMethods); // Proxy to instance methods to constructor, for now, for backwards compatibility


  Object.keys(instanceMethods).forEach(function (key) {
    SweetAlert[key] = function () {
      if (currentInstance) {
        var _currentInstance;

        return (_currentInstance = currentInstance)[key].apply(_currentInstance, arguments);
      }
    };
  });
  SweetAlert.DismissReason = DismissReason;
  SweetAlert.version = '9.10.12';

  var Swal = SweetAlert;
  Swal["default"] = Swal;

  return Swal;

}));
if (typeof this !== 'undefined' && this.Sweetalert2){  this.swal = this.sweetAlert = this.Swal = this.SweetAlert = this.Sweetalert2}

"undefined"!=typeof document&&function(e,t){var n=e.createElement("style");if(e.getElementsByTagName("head")[0].appendChild(n),n.styleSheet)n.styleSheet.disabled||(n.styleSheet.cssText=t);else try{n.innerHTML=t}catch(e){n.innerText=t}}(document,".swal2-popup.swal2-toast{flex-direction:row;align-items:center;width:auto;padding:.625em;overflow-y:hidden;background:#fff;box-shadow:0 0 .625em #d9d9d9}.swal2-popup.swal2-toast .swal2-header{flex-direction:row}.swal2-popup.swal2-toast .swal2-title{flex-grow:1;justify-content:flex-start;margin:0 .6em;font-size:1em}.swal2-popup.swal2-toast .swal2-footer{margin:.5em 0 0;padding:.5em 0 0;font-size:.8em}.swal2-popup.swal2-toast .swal2-close{position:static;width:.8em;height:.8em;line-height:.8}.swal2-popup.swal2-toast .swal2-content{justify-content:flex-start;font-size:1em}.swal2-popup.swal2-toast .swal2-icon{width:2em;min-width:2em;height:2em;margin:0}.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:1.8em;font-weight:700}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content{font-size:.25em}}.swal2-popup.swal2-toast .swal2-icon.swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line]{top:.875em;width:1.375em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:.3125em}.swal2-popup.swal2-toast .swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:.3125em}.swal2-popup.swal2-toast .swal2-actions{flex-basis:auto!important;width:auto;height:auto;margin:0 .3125em}.swal2-popup.swal2-toast .swal2-styled{margin:0 .3125em;padding:.3125em .625em;font-size:1em}.swal2-popup.swal2-toast .swal2-styled:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(50,100,150,.4)}.swal2-popup.swal2-toast .swal2-success{border-color:#a5dc86}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line]{position:absolute;width:1.6em;height:3em;transform:rotate(45deg);border-radius:50%}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.8em;left:-.5em;transform:rotate(-45deg);transform-origin:2em 2em;border-radius:4em 0 0 4em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.25em;left:.9375em;transform-origin:0 1.5em;border-radius:0 4em 4em 0}.swal2-popup.swal2-toast .swal2-success .swal2-success-ring{width:2em;height:2em}.swal2-popup.swal2-toast .swal2-success .swal2-success-fix{top:0;left:.4375em;width:.4375em;height:2.6875em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line]{height:.3125em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=tip]{top:1.125em;left:.1875em;width:.75em}.swal2-popup.swal2-toast .swal2-success [class^=swal2-success-line][class$=long]{top:.9375em;right:.1875em;width:1.375em}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-toast-animate-success-line-tip .75s;animation:swal2-toast-animate-success-line-tip .75s}.swal2-popup.swal2-toast .swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-toast-animate-success-line-long .75s;animation:swal2-toast-animate-success-line-long .75s}.swal2-popup.swal2-toast.swal2-show{-webkit-animation:swal2-toast-show .5s;animation:swal2-toast-show .5s}.swal2-popup.swal2-toast.swal2-hide{-webkit-animation:swal2-toast-hide .1s forwards;animation:swal2-toast-hide .1s forwards}.swal2-container{display:flex;position:fixed;z-index:1060;top:0;right:0;bottom:0;left:0;flex-direction:row;align-items:center;justify-content:center;padding:.625em;overflow-x:hidden;transition:background-color .1s;-webkit-overflow-scrolling:touch}.swal2-container.swal2-backdrop-show,.swal2-container.swal2-noanimation{background:rgba(0,0,0,.4)}.swal2-container.swal2-backdrop-hide{background:0 0!important}.swal2-container.swal2-top{align-items:flex-start}.swal2-container.swal2-top-left,.swal2-container.swal2-top-start{align-items:flex-start;justify-content:flex-start}.swal2-container.swal2-top-end,.swal2-container.swal2-top-right{align-items:flex-start;justify-content:flex-end}.swal2-container.swal2-center{align-items:center}.swal2-container.swal2-center-left,.swal2-container.swal2-center-start{align-items:center;justify-content:flex-start}.swal2-container.swal2-center-end,.swal2-container.swal2-center-right{align-items:center;justify-content:flex-end}.swal2-container.swal2-bottom{align-items:flex-end}.swal2-container.swal2-bottom-left,.swal2-container.swal2-bottom-start{align-items:flex-end;justify-content:flex-start}.swal2-container.swal2-bottom-end,.swal2-container.swal2-bottom-right{align-items:flex-end;justify-content:flex-end}.swal2-container.swal2-bottom-end>:first-child,.swal2-container.swal2-bottom-left>:first-child,.swal2-container.swal2-bottom-right>:first-child,.swal2-container.swal2-bottom-start>:first-child,.swal2-container.swal2-bottom>:first-child{margin-top:auto}.swal2-container.swal2-grow-fullscreen>.swal2-modal{display:flex!important;flex:1;align-self:stretch;justify-content:center}.swal2-container.swal2-grow-row>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-grow-column{flex:1;flex-direction:column}.swal2-container.swal2-grow-column.swal2-bottom,.swal2-container.swal2-grow-column.swal2-center,.swal2-container.swal2-grow-column.swal2-top{align-items:center}.swal2-container.swal2-grow-column.swal2-bottom-left,.swal2-container.swal2-grow-column.swal2-bottom-start,.swal2-container.swal2-grow-column.swal2-center-left,.swal2-container.swal2-grow-column.swal2-center-start,.swal2-container.swal2-grow-column.swal2-top-left,.swal2-container.swal2-grow-column.swal2-top-start{align-items:flex-start}.swal2-container.swal2-grow-column.swal2-bottom-end,.swal2-container.swal2-grow-column.swal2-bottom-right,.swal2-container.swal2-grow-column.swal2-center-end,.swal2-container.swal2-grow-column.swal2-center-right,.swal2-container.swal2-grow-column.swal2-top-end,.swal2-container.swal2-grow-column.swal2-top-right{align-items:flex-end}.swal2-container.swal2-grow-column>.swal2-modal{display:flex!important;flex:1;align-content:center;justify-content:center}.swal2-container.swal2-no-transition{transition:none!important}.swal2-container:not(.swal2-top):not(.swal2-top-start):not(.swal2-top-end):not(.swal2-top-left):not(.swal2-top-right):not(.swal2-center-start):not(.swal2-center-end):not(.swal2-center-left):not(.swal2-center-right):not(.swal2-bottom):not(.swal2-bottom-start):not(.swal2-bottom-end):not(.swal2-bottom-left):not(.swal2-bottom-right):not(.swal2-grow-fullscreen)>.swal2-modal{margin:auto}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-container .swal2-modal{margin:0!important}}.swal2-popup{display:none;position:relative;box-sizing:border-box;flex-direction:column;justify-content:center;width:32em;max-width:100%;padding:1.25em;border:none;border-radius:.3125em;background:#fff;font-family:inherit;font-size:1rem}.swal2-popup:focus{outline:0}.swal2-popup.swal2-loading{overflow-y:hidden}.swal2-header{display:flex;flex-direction:column;align-items:center}.swal2-title{position:relative;max-width:100%;margin:0 0 .4em;padding:0;color:#595959;font-size:1.875em;font-weight:600;text-align:center;text-transform:none;word-wrap:break-word}.swal2-actions{display:flex;z-index:1;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;margin:1.25em auto 0}.swal2-actions:not(.swal2-loading) .swal2-styled[disabled]{opacity:.4}.swal2-actions:not(.swal2-loading) .swal2-styled:hover{background-image:linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1))}.swal2-actions:not(.swal2-loading) .swal2-styled:active{background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2))}.swal2-actions.swal2-loading .swal2-styled.swal2-confirm{box-sizing:border-box;width:2.5em;height:2.5em;margin:.46875em;padding:0;-webkit-animation:swal2-rotate-loading 1.5s linear 0s infinite normal;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border:.25em solid transparent;border-radius:100%;border-color:transparent;background-color:transparent!important;color:transparent!important;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.swal2-actions.swal2-loading .swal2-styled.swal2-cancel{margin-right:30px;margin-left:30px}.swal2-actions.swal2-loading :not(.swal2-styled).swal2-confirm::after{content:\"\";display:inline-block;width:15px;height:15px;margin-left:5px;-webkit-animation:swal2-rotate-loading 1.5s linear 0s infinite normal;animation:swal2-rotate-loading 1.5s linear 0s infinite normal;border:3px solid #999;border-radius:50%;border-right-color:transparent;box-shadow:1px 1px 1px #fff}.swal2-styled{margin:.3125em;padding:.625em 2em;box-shadow:none;font-weight:500}.swal2-styled:not([disabled]){cursor:pointer}.swal2-styled.swal2-confirm{border:0;border-radius:.25em;background:initial;background-color:#3085d6;color:#fff;font-size:1.0625em}.swal2-styled.swal2-cancel{border:0;border-radius:.25em;background:initial;background-color:#aaa;color:#fff;font-size:1.0625em}.swal2-styled:focus{outline:0;box-shadow:0 0 0 1px #fff,0 0 0 3px rgba(50,100,150,.4)}.swal2-styled::-moz-focus-inner{border:0}.swal2-footer{justify-content:center;margin:1.25em 0 0;padding:1em 0 0;border-top:1px solid #eee;color:#545454;font-size:1em}.swal2-timer-progress-bar-container{position:absolute;right:0;bottom:0;left:0;height:.25em;overflow:hidden;border-bottom-right-radius:.3125em;border-bottom-left-radius:.3125em}.swal2-timer-progress-bar{width:100%;height:.25em;background:rgba(0,0,0,.2)}.swal2-image{max-width:100%;margin:1.25em auto}.swal2-close{position:absolute;z-index:2;top:0;right:0;align-items:center;justify-content:center;width:1.2em;height:1.2em;padding:0;overflow:hidden;transition:color .1s ease-out;border:none;border-radius:0;background:0 0;color:#ccc;font-family:serif;font-size:2.5em;line-height:1.2;cursor:pointer}.swal2-close:hover{transform:none;background:0 0;color:#f27474}.swal2-close::-moz-focus-inner{border:0}.swal2-content{z-index:1;justify-content:center;margin:0;padding:0;color:#545454;font-size:1.125em;font-weight:400;line-height:normal;text-align:center;word-wrap:break-word}.swal2-checkbox,.swal2-file,.swal2-input,.swal2-radio,.swal2-select,.swal2-textarea{margin:1em auto}.swal2-file,.swal2-input,.swal2-textarea{box-sizing:border-box;width:100%;transition:border-color .3s,box-shadow .3s;border:1px solid #d9d9d9;border-radius:.1875em;background:inherit;box-shadow:inset 0 1px 1px rgba(0,0,0,.06);color:inherit;font-size:1.125em}.swal2-file.swal2-inputerror,.swal2-input.swal2-inputerror,.swal2-textarea.swal2-inputerror{border-color:#f27474!important;box-shadow:0 0 2px #f27474!important}.swal2-file:focus,.swal2-input:focus,.swal2-textarea:focus{border:1px solid #b4dbed;outline:0;box-shadow:0 0 3px #c4e6f5}.swal2-file::-webkit-input-placeholder,.swal2-input::-webkit-input-placeholder,.swal2-textarea::-webkit-input-placeholder{color:#ccc}.swal2-file::-moz-placeholder,.swal2-input::-moz-placeholder,.swal2-textarea::-moz-placeholder{color:#ccc}.swal2-file:-ms-input-placeholder,.swal2-input:-ms-input-placeholder,.swal2-textarea:-ms-input-placeholder{color:#ccc}.swal2-file::-ms-input-placeholder,.swal2-input::-ms-input-placeholder,.swal2-textarea::-ms-input-placeholder{color:#ccc}.swal2-file::placeholder,.swal2-input::placeholder,.swal2-textarea::placeholder{color:#ccc}.swal2-range{margin:1em auto;background:#fff}.swal2-range input{width:80%}.swal2-range output{width:20%;color:inherit;font-weight:600;text-align:center}.swal2-range input,.swal2-range output{height:2.625em;padding:0;font-size:1.125em;line-height:2.625em}.swal2-input{height:2.625em;padding:0 .75em}.swal2-input[type=number]{max-width:10em}.swal2-file{background:inherit;font-size:1.125em}.swal2-textarea{height:6.75em;padding:.75em}.swal2-select{min-width:50%;max-width:100%;padding:.375em .625em;background:inherit;color:inherit;font-size:1.125em}.swal2-checkbox,.swal2-radio{align-items:center;justify-content:center;background:#fff;color:inherit}.swal2-checkbox label,.swal2-radio label{margin:0 .6em;font-size:1.125em}.swal2-checkbox input,.swal2-radio input{margin:0 .4em}.swal2-validation-message{display:none;align-items:center;justify-content:center;padding:.625em;overflow:hidden;background:#f0f0f0;color:#666;font-size:1em;font-weight:300}.swal2-validation-message::before{content:\"!\";display:inline-block;width:1.5em;min-width:1.5em;height:1.5em;margin:0 .625em;border-radius:50%;background-color:#f27474;color:#fff;font-weight:600;line-height:1.5em;text-align:center}.swal2-icon{position:relative;box-sizing:content-box;justify-content:center;width:5em;height:5em;margin:1.25em auto 1.875em;border:.25em solid transparent;border-radius:50%;font-family:inherit;line-height:5em;cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.swal2-icon .swal2-icon-content{display:flex;align-items:center;font-size:3.75em}.swal2-icon.swal2-error{border-color:#f27474;color:#f27474}.swal2-icon.swal2-error .swal2-x-mark{position:relative;flex-grow:1}.swal2-icon.swal2-error [class^=swal2-x-mark-line]{display:block;position:absolute;top:2.3125em;width:2.9375em;height:.3125em;border-radius:.125em;background-color:#f27474}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left]{left:1.0625em;transform:rotate(45deg)}.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right]{right:1em;transform:rotate(-45deg)}.swal2-icon.swal2-error.swal2-icon-show{-webkit-animation:swal2-animate-error-icon .5s;animation:swal2-animate-error-icon .5s}.swal2-icon.swal2-error.swal2-icon-show .swal2-x-mark{-webkit-animation:swal2-animate-error-x-mark .5s;animation:swal2-animate-error-x-mark .5s}.swal2-icon.swal2-warning{border-color:#facea8;color:#f8bb86}.swal2-icon.swal2-info{border-color:#9de0f6;color:#3fc3ee}.swal2-icon.swal2-question{border-color:#c9dae1;color:#87adbd}.swal2-icon.swal2-success{border-color:#a5dc86;color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-circular-line]{position:absolute;width:3.75em;height:7.5em;transform:rotate(45deg);border-radius:50%}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=left]{top:-.4375em;left:-2.0635em;transform:rotate(-45deg);transform-origin:3.75em 3.75em;border-radius:7.5em 0 0 7.5em}.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=right]{top:-.6875em;left:1.875em;transform:rotate(-45deg);transform-origin:0 3.75em;border-radius:0 7.5em 7.5em 0}.swal2-icon.swal2-success .swal2-success-ring{position:absolute;z-index:2;top:-.25em;left:-.25em;box-sizing:content-box;width:100%;height:100%;border:.25em solid rgba(165,220,134,.3);border-radius:50%}.swal2-icon.swal2-success .swal2-success-fix{position:absolute;z-index:1;top:.5em;left:1.625em;width:.4375em;height:5.625em;transform:rotate(-45deg)}.swal2-icon.swal2-success [class^=swal2-success-line]{display:block;position:absolute;z-index:2;height:.3125em;border-radius:.125em;background-color:#a5dc86}.swal2-icon.swal2-success [class^=swal2-success-line][class$=tip]{top:2.875em;left:.8125em;width:1.5625em;transform:rotate(45deg)}.swal2-icon.swal2-success [class^=swal2-success-line][class$=long]{top:2.375em;right:.5em;width:2.9375em;transform:rotate(-45deg)}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-tip{-webkit-animation:swal2-animate-success-line-tip .75s;animation:swal2-animate-success-line-tip .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-line-long{-webkit-animation:swal2-animate-success-line-long .75s;animation:swal2-animate-success-line-long .75s}.swal2-icon.swal2-success.swal2-icon-show .swal2-success-circular-line-right{-webkit-animation:swal2-rotate-success-circular-line 4.25s ease-in;animation:swal2-rotate-success-circular-line 4.25s ease-in}.swal2-progress-steps{align-items:center;margin:0 0 1.25em;padding:0;background:inherit;font-weight:600}.swal2-progress-steps li{display:inline-block;position:relative}.swal2-progress-steps .swal2-progress-step{z-index:20;width:2em;height:2em;border-radius:2em;background:#3085d6;color:#fff;line-height:2em;text-align:center}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step{background:#3085d6}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step{background:#add8e6;color:#fff}.swal2-progress-steps .swal2-progress-step.swal2-active-progress-step~.swal2-progress-step-line{background:#add8e6}.swal2-progress-steps .swal2-progress-step-line{z-index:10;width:2.5em;height:.4em;margin:0 -1px;background:#3085d6}[class^=swal2]{-webkit-tap-highlight-color:transparent}.swal2-show{-webkit-animation:swal2-show .3s;animation:swal2-show .3s}.swal2-hide{-webkit-animation:swal2-hide .15s forwards;animation:swal2-hide .15s forwards}.swal2-noanimation{transition:none}.swal2-scrollbar-measure{position:absolute;top:-9999px;width:50px;height:50px;overflow:scroll}.swal2-rtl .swal2-close{right:auto;left:0}.swal2-rtl .swal2-timer-progress-bar{right:0;left:auto}@supports (-ms-accelerator:true){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){.swal2-range input{width:100%!important}.swal2-range output{display:none}}@-moz-document url-prefix(){.swal2-close:focus{outline:2px solid rgba(50,100,150,.4)}}@-webkit-keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@keyframes swal2-toast-show{0%{transform:translateY(-.625em) rotateZ(2deg)}33%{transform:translateY(0) rotateZ(-2deg)}66%{transform:translateY(.3125em) rotateZ(2deg)}100%{transform:translateY(0) rotateZ(0)}}@-webkit-keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@keyframes swal2-toast-hide{100%{transform:rotateZ(1deg);opacity:0}}@-webkit-keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@keyframes swal2-toast-animate-success-line-tip{0%{top:.5625em;left:.0625em;width:0}54%{top:.125em;left:.125em;width:0}70%{top:.625em;left:-.25em;width:1.625em}84%{top:1.0625em;left:.75em;width:.5em}100%{top:1.125em;left:.1875em;width:.75em}}@-webkit-keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@keyframes swal2-toast-animate-success-line-long{0%{top:1.625em;right:1.375em;width:0}65%{top:1.25em;right:.9375em;width:0}84%{top:.9375em;right:0;width:1.125em}100%{top:.9375em;right:.1875em;width:1.375em}}@-webkit-keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@keyframes swal2-show{0%{transform:scale(.7)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@-webkit-keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@keyframes swal2-hide{0%{transform:scale(1);opacity:1}100%{transform:scale(.5);opacity:0}}@-webkit-keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@keyframes swal2-animate-success-line-tip{0%{top:1.1875em;left:.0625em;width:0}54%{top:1.0625em;left:.125em;width:0}70%{top:2.1875em;left:-.375em;width:3.125em}84%{top:3em;left:1.3125em;width:1.0625em}100%{top:2.8125em;left:.8125em;width:1.5625em}}@-webkit-keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@keyframes swal2-animate-success-line-long{0%{top:3.375em;right:2.875em;width:0}65%{top:3.375em;right:2.875em;width:0}84%{top:2.1875em;right:0;width:3.4375em}100%{top:2.375em;right:.5em;width:2.9375em}}@-webkit-keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@keyframes swal2-rotate-success-circular-line{0%{transform:rotate(-45deg)}5%{transform:rotate(-45deg)}12%{transform:rotate(-405deg)}100%{transform:rotate(-405deg)}}@-webkit-keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@keyframes swal2-animate-error-x-mark{0%{margin-top:1.625em;transform:scale(.4);opacity:0}50%{margin-top:1.625em;transform:scale(.4);opacity:0}80%{margin-top:-.375em;transform:scale(1.15)}100%{margin-top:0;transform:scale(1);opacity:1}}@-webkit-keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@keyframes swal2-animate-error-icon{0%{transform:rotateX(100deg);opacity:0}100%{transform:rotateX(0);opacity:1}}@-webkit-keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes swal2-rotate-loading{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow:hidden}body.swal2-height-auto{height:auto!important}body.swal2-no-backdrop .swal2-container{top:auto;right:auto;bottom:auto;left:auto;max-width:calc(100% - .625em * 2);background-color:transparent!important}body.swal2-no-backdrop .swal2-container>.swal2-modal{box-shadow:0 0 10px rgba(0,0,0,.4)}body.swal2-no-backdrop .swal2-container.swal2-top{top:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-top-left,body.swal2-no-backdrop .swal2-container.swal2-top-start{top:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-top-end,body.swal2-no-backdrop .swal2-container.swal2-top-right{top:0;right:0}body.swal2-no-backdrop .swal2-container.swal2-center{top:50%;left:50%;transform:translate(-50%,-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-left,body.swal2-no-backdrop .swal2-container.swal2-center-start{top:50%;left:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-center-end,body.swal2-no-backdrop .swal2-container.swal2-center-right{top:50%;right:0;transform:translateY(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom{bottom:0;left:50%;transform:translateX(-50%)}body.swal2-no-backdrop .swal2-container.swal2-bottom-left,body.swal2-no-backdrop .swal2-container.swal2-bottom-start{bottom:0;left:0}body.swal2-no-backdrop .swal2-container.swal2-bottom-end,body.swal2-no-backdrop .swal2-container.swal2-bottom-right{right:0;bottom:0}@media print{body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown){overflow-y:scroll!important}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown)>[aria-hidden=true]{display:none}body.swal2-shown:not(.swal2-no-backdrop):not(.swal2-toast-shown) .swal2-container{position:static!important}}body.swal2-toast-shown .swal2-container{background-color:transparent}body.swal2-toast-shown .swal2-container.swal2-top{top:0;right:auto;bottom:auto;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-top-end,body.swal2-toast-shown .swal2-container.swal2-top-right{top:0;right:0;bottom:auto;left:auto}body.swal2-toast-shown .swal2-container.swal2-top-left,body.swal2-toast-shown .swal2-container.swal2-top-start{top:0;right:auto;bottom:auto;left:0}body.swal2-toast-shown .swal2-container.swal2-center-left,body.swal2-toast-shown .swal2-container.swal2-center-start{top:50%;right:auto;bottom:auto;left:0;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-center{top:50%;right:auto;bottom:auto;left:50%;transform:translate(-50%,-50%)}body.swal2-toast-shown .swal2-container.swal2-center-end,body.swal2-toast-shown .swal2-container.swal2-center-right{top:50%;right:0;bottom:auto;left:auto;transform:translateY(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-left,body.swal2-toast-shown .swal2-container.swal2-bottom-start{top:auto;right:auto;bottom:0;left:0}body.swal2-toast-shown .swal2-container.swal2-bottom{top:auto;right:auto;bottom:0;left:50%;transform:translateX(-50%)}body.swal2-toast-shown .swal2-container.swal2-bottom-end,body.swal2-toast-shown .swal2-container.swal2-bottom-right{top:auto;right:0;bottom:0;left:auto}body.swal2-toast-column .swal2-toast{flex-direction:column;align-items:stretch}body.swal2-toast-column .swal2-toast .swal2-actions{flex:1;align-self:stretch;height:2.2em;margin-top:.3125em}body.swal2-toast-column .swal2-toast .swal2-loading{justify-content:center}body.swal2-toast-column .swal2-toast .swal2-input{height:2em;margin:.3125em auto;font-size:1em}body.swal2-toast-column .swal2-toast .swal2-validation-message{font-size:1em}");
},{}],12:[function(require,module,exports){
function convertToURL(url){
    const parser = new URL(url);
    return parser;
}

function domainURL(link){
    var parser = convertToURL(link);
    var host = ''; 
    var hn = parser.hostname.split('.').reverse();
    if (hn[1] == 'co') {
        host = hn[2] + '.' + hn[1] + '.' + hn[0];
    } else {
        host = hn[1] + '.' + hn[0];
    }
    return host; 
}

module.exports = { convertToURL, domainURL };
},{}]},{},[6]);
