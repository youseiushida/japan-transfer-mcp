#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import { get_encoding } from 'tiktoken';
import { pathToFileURL } from 'url';

import { fetchSuggest, fetchRouteSearch } from './fetcher.js';
import { parseRouteSearchResult } from './parser.js';
import { formatRouteSearchResponse } from './formatter.js';

const encoder = get_encoding('cl100k_base');

const server = new McpServer({
    name: "japan-transfer-mcp",
    version: "0.0.2"
});



server.registerTool("search_station_by_name",
    {
        title: "Search for stations by name",
        description: "Search for stations by name",
        inputSchema: {
            query: z.string().describe("The name of the station to search for (must be in Japanese)"),
            maxTokens: z.number().optional().describe("The maximum number of tokens to return"),
            onlyName: z.boolean().optional().describe("Whether to only return the name of the station. If you do not need detailed information, it is generally recommended to set this to true."),
        }
    },
    async ({ query, maxTokens, onlyName }) => {
        try {
            const response = await fetchSuggest({
                query,
                format: "json",
            })
            const railwayPlaces = response.R?.map((place) => {
                if (onlyName) {
                    return place.poiName
                }
                // placeの中身を自然な日本語文章で展開し、citycodeも含めて変数を埋め込む
                // 例: "東京駅（東京都千代田区, citycode: 13101, 緯度: 35.681167, 経度: 139.767125, よみ: とうきょうえき）"
                return `${place.poiName}（${place.prefName}${place.cityName ? place.cityName : ''}, citycode: ${place.cityCode ?? '不明'}, 緯度: ${place.location.lat}, 経度: ${place.location.lon}, よみ: ${place.poiYomi}）`;
            })
            const busPlaces = response.B?.map((place) => {
                if (onlyName) {
                    return place.poiName
                }
                return `${place.poiName}（${place.prefName}${place.cityName ? place.cityName : ''}, citycode: ${place.cityCode ?? '不明'}, 緯度: ${place.location.lat}, 経度: ${place.location.lon}, よみ: ${place.poiYomi}）`;
            })
            const spots = response.S?.map((place) => {
                if (onlyName) {
                    return place.poiName
                }
                return `${place.poiName}（${place.prefName}${place.cityName ? place.cityName : ''}${place.address ? ' ' + place.address : ''}, citycode: ${place.cityCode ?? '不明'}, 緯度: ${place.location.lat}, 経度: ${place.location.lon}, よみ: ${place.poiYomi}）`;
            })
            // railwayPlaces, busPlaces, spots を順に交互に配列化（R1,B1,S1,R2,B2,S2,...のような感じで）
            const maxLen = Math.max(
                railwayPlaces ? railwayPlaces.length : 0,
                busPlaces ? busPlaces.length : 0,
                spots ? spots.length : 0
            );
            const merged: string[] = [];
            for (let i = 0; i < maxLen; i++) {
                if (railwayPlaces && railwayPlaces[i] !== undefined) merged.push(railwayPlaces[i]);
                if (busPlaces && busPlaces[i] !== undefined) merged.push(busPlaces[i]);
                if (spots && spots[i] !== undefined) merged.push(spots[i]);
            }
            // merged配列を上から順に,区切りで連結し、maxTokensの範囲内で切り詰める
            // maxTokensが未指定の場合は全て連結
            let result = "";
            let tokenCount = 0;
            let max = typeof maxTokens === "number" ? maxTokens : Infinity;
            for (let i = 0; i < merged.length; i++) {
                const next = (result ? "," : "") + merged[i];
                const tokens = encoder.encode(result + next);
                if (tokens.length > max) break;
                result += (result ? "," : "") + merged[i];
                tokenCount = tokens.length;
            }
            return {
                content: [{
                    type: "text",
                    text: result
                }]
            }
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Contact retrieval error: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            };
        }
    }
);

server.registerTool("search_route_by_station_name",
    {
        title: "Search for routes by station name",
        description: "Search for routes by station name",
        inputSchema: {
            from: z.string().describe("The name of the departure station. The value must be a name obtained from search_station_by_name."),
            to: z.string().describe("The name of the arrival station. The value must be a name obtained from search_station_by_name."),
            datetimeType: z.enum(["departure", "arrival","first","last"]).describe("The type of datetime to use for the search"),
            datetime: z.string().optional().describe("The datetime to use for the search. Format: YYYY-MM-DD HH:MM:SS. If not provided, the current time in Japan will be used."),
            maxTokens: z.number().optional().describe("The maximum number of tokens to return"),
        },
    },
    async ({ from, to, datetimeType, datetime, maxTokens }) => {
        try {
            if (!datetime) {
                // 日本の時刻（Asia/Tokyo）でISO形式（YYYY-MM-DD HH:MM:SS）にする
                const now = new Date();
                const jpNow = new Date(now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
                const pad = (n: number) => n.toString().padStart(2, "0");
                datetime = `${jpNow.getFullYear()}-${pad(jpNow.getMonth() + 1)}-${pad(jpNow.getDate())} ${pad(jpNow.getHours())}:${pad(jpNow.getMinutes())}:${pad(jpNow.getSeconds())}`;
            }
            // 日時の解析
            const datePart = datetime.split(" ")[0];
            const timePart = datetime.split(" ")[1];
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute] = timePart.split(":").map(Number);
            
            // 駅タイプの判定（簡単な判定）
            const isFromBusStop = from.includes("〔") || from.includes("［");
            const isToBusStop = to.includes("〔") || to.includes("［");
            
            const response = await fetchRouteSearch({
                eki1: from,
                eki2: to,
                Dyy: year,
                Dmm: month,
                Ddd: day,
                Dhh: hour,
                Dmn1: Math.floor(minute / 10), // 分の10の位
                Dmn2: minute % 10, // 分の1の位
                Cway: (() => {
                    switch (datetimeType) {
                        case "departure":
                            return 0;
                        case "arrival":
                            return 1;
                        case "first":
                            return 2;
                        case "last":
                            return 3;
                        default:
                            return 0;
                    }
                })(),
                // デフォルト値を補完
                via_on: -1, // 経由駅なし
                Cfp: 1, // ICカード利用料金
                Czu: 2, // ジパング倶楽部
                C7: 1, // 通勤定期
                C2: 0, // 飛行機利用: おまかせ
                C3: 0, // 高速バス利用: おまかせ
                C1: 0, // 有料特急: おまかせ
                cartaxy: 1, // 車・タクシー検索: 有効
                bikeshare: 1, // シェアサイクル検索: 有効
                sort: "time", // 到着が早い・出発が遅い順
                C4: 5, // 座席種別: おまかせ
                C5: 0, // 優先列車: のぞみ優先
                C6: 2, // 乗換時間: 標準
                S: "検索", // 検索ボタン
                Cmap1: "", // UI関連
                rf: "nr", // リファラ
                pg: 0, // ページ番号
                eok1: isFromBusStop ? "B-" : "R-", // 駅1: 鉄道駅またはバス停
                eok2: isToBusStop ? "B-" : "R-", // 駅2: 鉄道駅またはバス停
                Csg: 1 // 検索開始フラグ
            })
            // HTMLレスポンスを解析
            const parsedResult = parseRouteSearchResult(response.data);
            
            // 自然な文章でレスポンスを構築
            let resultText = formatRouteSearchResponse(parsedResult, response.url, from, to, datetime);
            
            // maxTokensによる制限
            if (maxTokens) {
                const tokens = encoder.encode(resultText);
                if (tokens.length > maxTokens) {
                    // トークン数が制限を超える場合は、ルートの数を減らす
                    const limitedResult = {
                        ...parsedResult,
                        routes: parsedResult.routes.slice(0, Math.max(1, Math.floor(parsedResult.routes.length * maxTokens / tokens.length)))
                    };
                    resultText = formatRouteSearchResponse(limitedResult, response.url, from, to, datetime);
                }
            }
            
            return {
                content: [{
                    type: "text",
                    text: resultText
                }]
            }
        } catch (error) {
            return {
                content: [{
                    type: "text",
                    text: `Route search error: ${error instanceof Error ? error.message : String(error)}`
                }],
                isError: true
            };
        }
    }
);


// メインモジュールとして実行された場合のみconnectする。

const currentFileUrl = import.meta.url;
const scriptFileUrl = pathToFileURL(process.argv[1]).href;

if (currentFileUrl === scriptFileUrl) { 
    const transport = new StdioServerTransport();  
    await server.connect(transport);  
};

export default server;
