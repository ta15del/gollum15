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