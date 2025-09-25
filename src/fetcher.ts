import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { SuggestQuery, SuggestResponse, RouteSearchQuery } from "./type";

const SUGGEST_URL = "https://navi.jorudan.co.jp/api/compat/suggest/agg";
const ROUTE_SEARCH_URL = "https://www.jorudan.co.jp/norikae/cgi/nori.cgi";

// Cookie をリダイレクト間で保持するためのクライアント
const cookieJar = new CookieJar();
const httpClient = wrapper(
    axios.create({
        jar: cookieJar,
        withCredentials: true,
        // グローバルヘッダは最小限。サイト要件のあるReferer/UAは必要箇所で付与
    })
);


export const fetchSuggest = async (query: SuggestQuery): Promise<SuggestResponse> => {
    const response = await httpClient.get(SUGGEST_URL, {
        params: {
            ...query
        },
    });
    return response.data;
};

export const fetchRouteSearch = async (query: RouteSearchQuery): Promise<{url: string, data: string}> => {
    const response = await httpClient.get(ROUTE_SEARCH_URL, {
        params: {
            ...query
        },
        headers: {
            Referer: "https://www.jorudan.co.jp/norikae/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "ja-JP,ja;q=0.9"
        },
    });
    return {
        url: (response as any).request?.res?.responseUrl || response.config.url + "?" + new URLSearchParams(response.config.params as any).toString(),
        data: response.data
    };
};