const apiHTTPSLookup = 'https://api.mxtoolbox.com/api/v1/Lookup/dns/?argument=';

var myHeaders = new Headers();
myHeaders.append("Authorization", 'd4d95fa8-4973-49aa-9782-81b5bce21c20');

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
};

async function connectionToHTTPSLookup(url){
    return fetch(apiHTTPSLookup + url, requestOptions)
        .then(response => response.text())
        .then((responseText) => {
            var json = JSON.parse(responseText);
            return json;
        })
        .catch(error => console.log('error', error));
}

module.exports = { connectionToHTTPSLookup };