const apiWOT = 'https://scorecard.api.mywot.com/v3/targets?t=';

var myHeaders = new Headers();
myHeaders.append("X-User-ID", "8470812");
myHeaders.append("X-Api-Key", "YOUR API KEY");

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