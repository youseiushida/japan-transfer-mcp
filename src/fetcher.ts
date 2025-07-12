import axios from "axios";

const SUGGEST_URL = "https://navi.jorudan.co.jp/api/compat/suggest/agg";
const ROUTE_SEARCH_URL = "https://www.jorudan.co.jp/norikae/cgi/nori.cgi";


const fetchSuggest = async (query: string) => {
    const response = await axios.get(SUGGEST_URL, {
        params: {
            q: query,
        },
    });
    return response.data;
};
