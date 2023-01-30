interface Props {
    urlHost: string | undefined;
    urlPath: string;
    urlQuery?: string;
    urlMethod: string;
    urlHeaders: string;
    urlBody?: Object;
}

const FetchData = async ({ urlHost, urlPath, urlQuery, urlMethod, urlHeaders, urlBody }: Props) => {
    let uq = urlQuery;
    if (uq === undefined) uq = '';
    let url = urlHost + urlPath + uq;
    let body = JSON.stringify(urlBody);
    let headersData = {};
    if (urlHeaders === "NoAuth") {
        headersData = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    } else if (urlHeaders === "Auth") {
        headersData = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }

    if (!urlHost) return;
    let data = await fetch(url, {
        method: urlMethod,
        headers: headersData,
        body
    })

    return data.json();
}

export default FetchData;