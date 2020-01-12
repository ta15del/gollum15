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

function makeHttpObject() {
    try {return new XMLHttpRequest();}
    catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP");}
    catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP");}
    catch (error) {}
  
    throw new Error("Could not create HTTP request object.");
  }
  var request = makeHttpObject();
  request.open("GET", "your_url", true);
  request.send(null);
  request.onreadystatechange = function() {
    if (request.readyState == 4)
      alert(
        "URL : " + url + ", " +
        "protocol : " + parser.protocol + ", " +
        "host : " + parser.host + ", " +
        "port : " + parser.port + ", " +
        "hostname : " + parser.hostname + ", "+
        "domain : " + host + ", " +
        "subdomain : " + subdomain + "," +
        request.responseText
    );
  };