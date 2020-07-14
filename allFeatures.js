const urlParser = require('./urlParser');
const htmlParser = require('./htmlParser');
const apiHTTPSLookup = require('./apiHTTPSLookup');
const apiWHOIS = require('./apiWHOIS');
const apiWOT = require('./apiWOT');
const url =  window.location.href;

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

async function features(){
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
    let long_URL = longURLCharacter();
    let request_URL = requestURL_CrossSite(dom.dom, domain);
    let number_of_subdomain = numberOfSubdomain();

    var all_features = [];
    await all_features.push(ip_address,submitting_information_to_email,adding_prefix_suffix,iframe,number_of_images,favicon_redirection,request_URL,
        long_URL,links_in_tags,URL_of_anchor,number_of_subdomain,age_of_domain,https_lookup,registration_URL,domain_registration_length,security_WOT);

    return all_features;
}

module.exports = { features };