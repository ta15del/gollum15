var url =  window.location.href;
var parser = new URL(url);

var apiWHOIS = 'https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=at_zvhf1WQ4hpAgahW74sjylSwyNHnRX&outputFormat=JSON&domainName='; 
var apiHTTPSLookup = 'https://mxtoolbox.com/api/v1/lookup/HTTPS/';

function domainURL(link){
    var parser = new URL(link); 
    var hn = parser.hostname.split('.').reverse();
    var host = hn[1] + '.' + hn[0];
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

function url_of_anchor(parser){
    const anchors = parser.getElementsByTagName('a');
    let count_phish = 0;
    for (let anchor of anchors) {
        let href = anchor.attributes.href;
        if (href){
            getDomainFromAnchor = isValidURL(href.value);
            if (getDomainFromAnchor == true){
                var url_domain = domainURL(url);
                var getDomainFromAnchor = domainURL(href.value);
                if (getDomainFromAnchor != url_domain){
                    count_phish = count_phish + 1;
                }
            }             
        }
    }
    var percent_urlOfAnchorPhish = (count_phish/anchors.length)*100;
    if (percent_urlOfAnchorPhish > 67){
        urlOfAnchorPhish = 'ya';
    } else if (percent_urlOfAnchorPhish <= 67 && percent_urlOfAnchorPhish >= 31){
        urlOfAnchorPhish = 'suspicious';
    } else {
        urlOfAnchorPhish = 'tidak';
    }
    return (urlOfAnchorPhish);
}

function favicon(parser){
    try {
        const favicon = parser.querySelector('link[rel="shortcut icon"], link[rel="icon"]').href;
        //var fav_url = domainURL(favicon);
        var getDomainFromFavicon = domainURL(favicon);
        var url_domain = domainURL(url);
        if (getDomainFromFavicon != url_domain){
            faviconPhish = 'ya';
        } else {
            faviconPhish = 'tidak';
        }
    } catch(err){
        faviconPhish = 'ya';
    }
   return (faviconPhish);
}

function prefix_suffix(url_parser) {
    try {
        var res = url_parser.match(/^(http(s)?:\/\/.)?(www\.)?[a-zA-Z0-9@:%._\+~#=]*\-[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        result = (res !== null);
        if (result == true){
            prefixSuffix = "ya";
        } else {
            prefixSuffix = "tidak";
        }
        return(prefixSuffix);
    } catch(err){
        console.log(err);
    }
};

function ip_address(url_parser) {
    try { 
        var res = url_parser.match(/^(http(s)?:\/\/.)?(www\.)?[0-9]*\.[0-9]*\.[0-9]*\.[0-9.]*[a-zA-Z0-9@:%_\+.~#?&//=]*/g);
        result = (res !== null);
        if (result == true){
            ipAddress = "ya";
        } else {
            ipAddress = "tidak";
        }
        return(ipAddress);
    } catch(err){
        console.log(err);
    }
}

function iframe_tag(parser){
    const iframe = parser.getElementsByTagName('iframe');
    if (iframe.length != 0){
        iframePhish = 'ya';
    } else {
        iframePhish = 'tidak';
    }
    return (iframePhish);
}

function links_in_tags(parser){
    const links = parser.getElementsByTagName('link');
    const meta = parser.getElementsByTagName('meta');
    let count_linkInTags = links.length + meta.length + parser.scripts.length;
    var all_elements = parser.getElementsByTagName ('*');
    let percent_linkInTags = (count_linkInTags/all_elements.length)*100;
    if (percent_linkInTags > 81){
        linkInTagsPhish = 'ya';
    } else if (percent_linkInTags <= 81 && percent_linkInTags >= 17) {
        linkInTagsPhish = 'suspicious';
    } else {
        linkInTagsPhish = 'tidak';
    }
    return (linkInTagsPhish);
}

function find_mailto(string) {
    var getStringMailto = string.match(/[-a-zA-Z0-9@:%._\+~#= ]*mailto[-a-zA-Z0-9@:%._\+~#= ]*/);
    resp = (getStringMailto !== null);
    if (resp == true){
        mailtoPhish = "ya";
    } else {
        mailtoPhish = "tidak";
    }
    return (mailtoPhish);
}

function number_of_images(parser){
    const images = parser.getElementsByTagName('img');
    if (images.length > 20){
        imagesPhish = 'tidak';
    } else if (images.length <= 20 && images.length > 10){
        imagesPhish = 'suspicious';
    } else {
        imagesPhish = 'ya';
    }
    return (imagesPhish);
}

async function connection(url){
    let response = await fetch(url);   
    let commits = await response.json(); // read response body and parse as JSON
    return commits;
}

async function domainRegistration(){
    let domain = "";
    let domainInfo = await connection(apiWHOIS + parser.hostname);
    var dateFirst = new Date(domainInfo.WhoisRecord.registryData.updatedDate);
    var dateSecond = new Date(domainInfo.WhoisRecord.registryData.expiresDate);
    var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
    var diffDays = (timeDiff / (1000 * 3600 * 24))/365;
    if (diffDays > 1) {
        domain = "tidak";
    } else {
        domain = "ya" ;
    }
    return domain;
}

async function ageOfDomain(){
    let ageDomain ="";
    let ageOfDomainInfo = await connection(apiWHOIS + parser.hostname);
    var dateFirst = new Date(ageOfDomainInfo.WhoisRecord.registryData.updatedDate);
    var dateSecond = new Date();
    var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
    var diffDays = (timeDiff / (1000 * 3600 * 24))/30;
    if (diffDays < 6) {
        ageDomain = "ya";
    } else {
        ageDomain = "tidak";
    }
    return ageDomain;
}

async function httpsLookup(){
    let httpslookup = "";
    let httpsLookupInfo = await connection(apiHTTPSLookup + parser.hostname);
    if (httpsLookupInfo['Failed'].length > 0 && httpsLookupInfo['Information'].length == 0) {
        httpslookup = "ya";
    } else {
        httpslookup = "tidak";
    }
    return httpslookup;
}

async function abnormalURL(){
    let abnormalUrls = "";
    let abnormalUrlInfo = await connection(apiWHOIS+ parser.hostname);
    if (abnormalUrlInfo.WhoisRecord.dataError || abnormalUrlInfo.WhoisRecord.parseCode == 0) {
        abnormalUrls = "ya";
    } else {
        abnormalUrls = "tidak";
    }
    return abnormalUrls;
}

(async () => {
    let httpsLookup_phish = await httpsLookup();
    let domainRegistartionLength_phish = await domainRegistration();
    let ageOfDomain_phish = await ageOfDomain();
    let abnormalUrl_phish = await abnormalURL();
    let prefixSuffix_phish = prefix_suffix(parser.hostname);
    let ipAddress_phish = ip_address(parser.hostname);
    var dom = await DOM_parser();
    let urlOfAnchor_phish = url_of_anchor(dom.dom);
    let favicon_phish = favicon(dom.dom);
    let iframe_phish = iframe_tag(dom.dom);
    let linksInTags_phish = links_in_tags(dom.dom);
    let mailto_phish = find_mailto(dom.string);
    let numberOfImages_phish = number_of_images(dom.dom);

    console.log("URL hostname : " + parser.hostname);
    console.log("https lookup feature phish : " + httpsLookup_phish);
    console.log("domain registration feature phish : " + domainRegistartionLength_phish);
    console.log("age of domain feature phish : " + ageOfDomain_phish);
    console.log("abnormal URL : " + abnormalUrl_phish);
    console.log("prefix suffix : " + prefixSuffix_phish);
    console.log("IP Address : " + ipAddress_phish);
    console.log("URL of Anchor : " + urlOfAnchor_phish);
    console.log("Favicon : " + favicon_phish);
    console.log("Iframe : " + iframe_phish);
    console.log("Links In Tags : " + linksInTags_phish);
    console.log("Submitting Information to Email : " + mailto_phish);
    console.log("Number of Images : " + numberOfImages_phish);
})();