var url =  window.location.href;
var parser = new URL(url);

var apiWHOIS = ''; // your API WHOIS URL
var apiHTTPSLookup = ''; // your API HTTPS LOOKUP URL
var apiWOT = ''; // your API Web Of Trust URL
var apiWOTkey = ''; // your API Key Web Of Trust

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
        urlOfAnchorCrossSite = 'lebih dari 67%';
    } else if (percent_urlOfAnchorCrossSite <= 67 && percent_urlOfAnchorCrossSite >= 31){
        urlOfAnchorCrossSite = 'diantara 31% - 67%';
    } else {
        urlOfAnchorCrossSite = 'dibawah 31%';
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
        console.log(err);
    }
   return (favicon_redirection);
}

function prefixSuffix_inDomain(url_parser) {
    try {
        var res = url_parser.match(/^(http(s)?:\/\/.)?(www\.)?[a-zA-Z0-9@:%._\+~#=]*\-[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
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

function iframeRedirection(parser){
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
        linkInTags = 'lebih dari 81%';
    } else if (percent_linkInTags <= 81 && percent_linkInTags >= 17) {
        linkInTags = 'diantara 17% - 81%';
    } else {
        linkInTags = 'dibawah 17%';
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
        numbOfimages = 'lebih dari 20';
    } else if (images.length <= 20 && images.length > 10){
        numbOfimages = 'diantara 10 - 20';
    } else {
        numbOfimages = 'dibawah 11';
    }
    return (numbOfimages);
}

async function connection(url){
    let response = await fetch(url);   
    let commits = await response.json(); // read response body and parse as JSON
    return commits;
}

async function domainRegistrationLength(){
    let domainInfo = await connection(apiWHOIS + parser.hostname);

    var dateFirst = new Date(domainInfo.WhoisRecord.registryData.updatedDate);
    var dateSecond = new Date(domainInfo.WhoisRecord.registryData.expiresDate);
    var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
    var diffDays = (timeDiff / (1000 * 3600 * 24))/365;
    if (diffDays > 1) {
        domain = "lebih satu tahun";
    } else {
        domain = "lebih kecil sama dengan satu tahun" ;
    }
    return domain;
}

async function ageOfDomain(){
    let ageOfDomainInfo = await connection(apiWHOIS + parser.hostname);

    var dateFirst = new Date(ageOfDomainInfo.WhoisRecord.registryData.updatedDate);
    var dateSecond = new Date();
    var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
    var diffDays = (timeDiff / (1000 * 3600 * 24))/30;
    if (diffDays < 6) {
        ageDomain = "dibawah 6 bulan";
    } else {
        ageDomain = "diatas 5 bulan";
    }
    return ageDomain;
}

async function httpsLookup(){
    let httpsLookupInfo = await connection(apiHTTPSLookup + parser.hostname);

    if (httpsLookupInfo['Failed'].length > 0 && httpsLookupInfo['Information'].length == 0) {
        httpslookup = "tidak memiliki";
    } else {
        httpslookup = "memiliki";
    }
    return httpslookup;
}

async function registrationURL_inWHOIS(){
    let urlInWHOISInfo = await connection(apiWHOIS+ parser.hostname);

    if (urlInWHOISInfo.WhoisRecord.dataError || urlInWHOISInfo.WhoisRecord.parseCode == 0) {
        urlInWHOIS = "tidak terdaftar";
    } else {
        urlInWHOIS = "terdaftar";
    }
    return urlInWHOIS;
}

async function securityWOT_status(){
    let WOTstatus = await fetch(apiWOT + parser.hostname + apiWOTkey)
        .then((response) => response.text())
        .then((responseText) => {
            var res = responseText.replace('process(','');
            var string = res.replace(')','');
            var obj = JSON.parse(string);
            var arr = [];
            for (let [key, value] of Object.entries(obj[parser.hostname].categories)) {
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
        })
        .catch((error) => {
            console.error(error);
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

function requestURL(parser){
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
    if (total_requestURL_crossSite > 61){
        requestUrl = 'lebih dari 65%';
    } else if (total_requestURL_crossSite <= 61 && total_requestURL_crossSite >= 22){
        requestUrl = 'diantara 22% - 65%';
    } else {
        requestUrl = 'dibawah 22%';
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
        numberOf_subdomain = 'lebih dari dua';
    } else if (count_subdomain == 2){
        numberOf_subdomain = 'dua';
    } else {
        numberOf_subdomain = 'kurang dari dua';
    }
    return (numberOf_subdomain);
}

(async () => {
    var all_features = [];
    let https_lookup = await httpsLookup();
    let domain_registration_length = await domainRegistrationLength();
    let age_of_domain = await ageOfDomain();
    let abnormal_URL = await registrationURL_inWHOIS();
    let adding_prefix_suffix = prefixSuffix_inDomain(parser.hostname);
    let ip_address = ipAddress_inDomain(parser.hostname);
    var dom = await DOM_parser();
    let URL_of_anchor = URLofAnchor_CrossSite(dom.dom);
    let favicon_redirection = faviconRedirection(dom.dom);
    let iframe_redirection = iframeRedirection(dom.dom);
    let links_in_tags = linksInTags(dom.dom);
    let submitting_information_to_email = submittingInformationToEmail(dom.string);
    let number_of_images = numberOfImages(dom.dom);
    let security_WOT = await securityWOT_status();
    let long_URL = longURLCharacter();
    let request_URL = requestURL(dom.dom);
    let number_of_subdomain = numberOfSubdomain();

    all_features.push(favicon_redirection,request_URL,iframe_redirection,submitting_information_to_email,URL_of_anchor,number_of_images,security_WOT,links_in_tags,ip_address,long_URL,adding_prefix_suffix,number_of_subdomain,https_lookup,abnormal_URL,domain_registration_length,age_of_domain);
    console.log("URL hostname : " + parser.hostname);
    console.log("https lookup feature phish : " + https_lookup);
    console.log("domain registration feature phish : " + domain_registration_length);
    console.log("age of domain feature phish : " + age_of_domain);
    console.log("abnormal URL : " + abnormal_URL);
    console.log("prefix suffix : " + adding_prefix_suffix);
    console.log("IP Address : " + ip_address);
    console.log("URL of Anchor : " + URL_of_anchor);
    console.log("Favicon : " + favicon_redirection);
    console.log("Iframe : " + iframe_redirection);
    console.log("Links In Tags : " + links_in_tags);
    console.log("Submitting Information to Email : " + submitting_information_to_email);
    console.log("Number of Images : " + number_of_images);
    console.log("Security WOT: " + security_WOT);
    console.log("Long URL: " + long_URL);
    console.log("Request URL: " + request_URL);
    console.log("Number of Subdomain: " + number_of_subdomain);
    console.log(all_features);
})();