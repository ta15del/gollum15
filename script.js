// Store the URL into variable 
var url =  window.location.href; 
      
// Created a URL object using URL() method 
var parser = new URL(url);

var hn = parser.hostname.split('.').reverse();
var host = hn[1] + '.' + hn[0];
var subdomain = '';
var getsubdomain = url.split("/")[2].split(".")[0];
if(getsubdomain == 'www'){
    subdomain = '';
} else {
    subdomain = getsubdomain;
}


alert(
    "URL : " + url + ", " +
    "protocol : " + parser.protocol + ", " +
    "host : " + parser.host + ", " +
    "port : " + parser.port + ", " +
    "hostname : " + parser.hostname + ", "+
    "domain : " + host + ", " +
    "subdomain : " + subdomain
)
// // Protocol used in URL 
// chrome.runtime.sendMessage(document.write("protocol:" + parser.protocol + "<br>")); 
       
// // Host of the URL 
// chrome.runtime.sendMessage(document.write(parser.host + "<br>")); 
       
// // Port in the URL 
// chrome.runtime.sendMessage(document.write(parser.port + "<br>")); 
       
// // Hostname of the URL 
// chrome.runtime.sendMessage(document.write(parser.hostname + "<br>")); 
       
// // Search in the URL 
// chrome.runtime.sendMessage(document.write(parser.search + "<br>")); 
       
// // Search parameter in the URL 
// chrome.runtime.sendMessage(document.write(parser.searchParams + "<br>"));