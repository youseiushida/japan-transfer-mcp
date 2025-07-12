import axios from "axios";
import { SuggestQuery, SuggestResponse, RouteSearchQuery } from "./type";

const SUGGEST_URL = "https://navi.jorudan.co.jp/api/compat/suggest/agg";
const ROUTE_SEARCH_URL = "https://www.jorudan.co.jp/norikae/cgi/nori.cgi";


export const fetchSuggest = async (query: SuggestQuery): Promise<SuggestResponse> => {
    const response = await axios.get(SUGGEST_URL, {
        params: {
        ...query
        },
    });
    return response.data;
};

export const fetchRouteSearch = async (query: RouteSearchQuery): Promise<{url: string, data: string}> => {
    const response = await axios.get(ROUTE_SEARCH_URL, {
        params: {
            ...query
        },
    });
    return {
        url: response.request?.res?.responseUrl || response.config.url + "?" + new URLSearchParams(response.config.params).toString(),
        data: response.data
    };
};