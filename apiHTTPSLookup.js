const apiHTTPSLookup = 'https://mxtoolbox.com/api/v1/lookup/HTTPS/';

async function connectionToHTTPSLookup(domain){
    let response = await fetch(apiHTTPSLookup + domain);   
    let commits = await response.json();
    return commits;
}

module.exports = { connectionToHTTPSLookup };