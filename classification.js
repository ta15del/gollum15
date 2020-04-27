const C45 = require('c4.5');
const fileSystem = require('fs');
const CSVparser = require('papaparse');
const swal = require('sweetalert2');

const apiWHOIS = 'https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=[YOUR API KEY]X&outputFormat=JSON&domainName='; 
const apiHTTPSLookup = 'https://mxtoolbox.com/api/v1/lookup/HTTPS/';
const apiWOT = 'https://api.mywot.com/0.4/public_link_json2?hosts=';
const apiWOTkey = '/&callback=process&key=[YOUR API KEY]';

const url =  window.location.href;
const parser = new URL(url);

function domainURL(link){
    var parser = new URL(link);
    var host = ''; 
    var hn = parser.hostname.split('.').reverse();
    if (hn[1] == 'co') {
        host = hn[2] + '.' + hn[1] + '.' + hn[0];
    } else {
        host = hn[1] + '.' + hn[0];
    }
    return host; 
}

function isValidURL(string) {
    var res = string.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null);
};

async function DOM_parser(){
    const parsers = new DOMParser();
    var response = await fetch(url);
    switch (response.status) {
        // status "OK"
        case 200:
            var string = await response.text();
            var dom = parsers.parseFromString(string, 
                'text/html');
            break;
        // status "Not Found"
        case 404:
            console.log('Not Found');
            break;
    }
    return { string: string, dom: dom }
}

function isNumeric(n) {
    return !isNaN(n);
}

function URLofAnchor_CrossSite(parser){
    const anchors = parser.getElementsByTagName('a');
    let count_anchor_crossSite = 0;
    for (let anchor of anchors) {
        let href = anchor.attributes.href;
        if (href){
            getDomainFromAnchor = isValidURL(href.value);
            if (getDomainFromAnchor == true){
                var url_domain = domainURL(url);
                var getDomainFromAnchor = domainURL(href.value);
                if (getDomainFromAnchor != url_domain){
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

function faviconRedirection(parser){
    try {
        const favicon = parser.querySelector('link[rel="shortcut icon"], link[rel="icon"]').href;

        var getDomainFromFavicon = domainURL(favicon);
        var url_domain = domainURL(url);
        if (getDomainFromFavicon != url_domain){
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

async function connection(url){
    let response = await fetch(url);   
    let commits = await response.json(); // read response body and parse as JSON
    return commits;
}

async function domainRegistrationLength(){
    var domainurl = domainURL(url);
    let domainInfo = await connection(apiWHOIS + domainurl);
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

async function ageOfDomain(){
    var domainurl = domainURL(url);
    let ageOfDomainInfo = await connection(apiWHOIS + domainurl);
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

async function httpsLookup(){
    var domainurl = domainURL(url);
    let httpsLookupInfo = await connection(apiHTTPSLookup + domainurl);
    if (httpsLookupInfo){
        if (httpsLookupInfo['Failed'].length > 0 && httpsLookupInfo['Information'].length == 0) {
            httpslookup = "tidak memiliki";
        } else {
            httpslookup = "memiliki";
        }
    } else {
        httpslookup = "tidak memiliki";
    }
    
    return httpslookup;
}

async function registrationURL_inWHOIS(){
    var domainurl = domainURL(url);
    let urlInWHOISInfo = await connection(apiWHOIS+ domainurl);
    if (urlInWHOISInfo){
        if (urlInWHOISInfo.WhoisRecord.dataError || urlInWHOISInfo.WhoisRecord.parseCode == 0) {
            urlInWHOIS = "tidak terdaftar";
        } else {
            urlInWHOIS = "terdaftar";
        }
    } else {
        urlInWHOIS = "tidak terdaftar";
    }
    
    return urlInWHOIS;
}

async function securityWOT_status(){
    var domainurl = domainURL(url);
    let WOTstatus = await fetch(apiWOT + domainurl + apiWOTkey)
        .then((response) => response.text())
        .then((responseText) => {
            var res = responseText.replace('process(','');
            var string = res.replace(')','');
            var obj = JSON.parse(string);
            var arr = [];
            if (obj[domainurl].categories){
                for (let [key, value] of Object.entries(obj[domainurl].categories)) {
                    arr.push(key);
                }
                var found = arr.find(function(key) { 
                    return (key == "301" || key == "302" || key == "303" || key == "304" || key == "501"); 
                }); 
                
                if (found){
                    return ("aman");
                } else {
                    return ("tidak aman");
                }
            } else {
                return ("tidak aman");
            }
            
        })
        .catch((error) => {
            console.error(error);
            return ("tidak aman");
        });
    return WOTstatus;
}

function longURLCharacter(){
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

function requestURL_CrossSite(parser){
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
                var url_domain = domainURL(url);
                var getDomainFromImg = domainURL(img_src.value);
                if (getDomainFromImg != url_domain){
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
                var url_domain = domainURL(url);
                var getDomainFromVideo = domainURL(video_src.value);
                if (getDomainFromVideo != url_domain){
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
                var url_domain = domainURL(url);
                var getDomainFromAudio = domainURL(audio_src.value);
                if (getDomainFromAudio != url_domain){
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

function numberOfSubdomain(){
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

(async () => {
  var all_features = [];
  var dom = await DOM_parser();

  let https_lookup = await httpsLookup();
  let domain_registration_length = await domainRegistrationLength();
  let age_of_domain = await ageOfDomain();
  let registration_URL = await registrationURL_inWHOIS();
  let adding_prefix_suffix = prefixSuffix_inDomain(parser.hostname);
  let ip_address = ipAddress_inDomain(parser.hostname);
  let URL_of_anchor = URLofAnchor_CrossSite(dom.dom);
  let favicon_redirection = faviconRedirection(dom.dom);
  let iframe = iFrame(dom.dom);
  let links_in_tags = linksInTags(dom.dom);
  let submitting_information_to_email = submittingInformationToEmail(dom.string);
  let number_of_images = numberOfImages(dom.dom);
  let security_WOT = await securityWOT_status();
  let long_URL = longURLCharacter();
  let request_URL = requestURL_CrossSite(dom.dom);
  let number_of_subdomain = numberOfSubdomain();

  await all_features.push(favicon_redirection,request_URL,iframe,submitting_information_to_email,URL_of_anchor,number_of_images,
    security_WOT,links_in_tags,ip_address,long_URL,adding_prefix_suffix,number_of_subdomain,https_lookup,registration_URL,
    domain_registration_length,age_of_domain);
  // console.log(all_features);

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

        if (model.classify(all_features)=='phishing'){
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