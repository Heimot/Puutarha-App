interface Props {
    urlHost: string | undefined;
    urlPath: string;
    urlQuery?: string;
    urlMethod: string;
    urlHeaders: string;
    urlBody?: Object;
    urlFormData?: FormData;
}

const FetchData = async ({ urlHost, urlPath, urlQuery, urlMethod, urlHeaders, urlBody, urlFormData }: Props) => {
    let uq = urlQuery;
    if (uq === undefined) uq = '';
    let url = urlHost + urlPath + uq;
    let body: string | FormData = JSON.stringify(urlBody);
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

    if (urlFormData) {
        body = urlFormData;
        headersData = {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }

    if (!urlHost) return;
    let data = await fetch(url, {
        method: urlMethod,
        headers: headersData,
        body
    })

    if (!data.ok && urlPath !== '/auth/login') {
        const userId = localStorage.getItem('userId');
        let authCheck = await fetch(`${process.env.REACT_APP_API_URL}/auth/get_my_user_data?currentUserId=${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        if (!authCheck.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/'
        }
        return;
    }

    return data.json();
}

export default FetchData;