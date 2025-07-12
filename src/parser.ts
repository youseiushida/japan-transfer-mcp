import * as cheerio from 'cheerio';
import {
  RouteSearchResult,
  Route,
  RouteSegment,
  StationInfo,
  TransportInfo,
  RouteTag,
  TimeInfo,
  FareInfo,
  CO2Info,
  WeatherInfo,
  StationService,
  RouteNotice,
} from './type.js';

/**
 * HTMLテキストを解析して乗換案内の検索結果を返す
 * @param html ジョルダンの検索結果HTML
 * @returns 解析された検索結果
 */
export function parseRouteSearchResult(html: string): RouteSearchResult {
  const $ = cheerio.load(html);
  
  // 検索結果の主要コンテナを特定
  const $results = $('#results.js_routeBlocks');
  
  if ($results.length === 0) {
    throw new Error('検索結果が見つかりません。HTMLの構造が期待されたものと異なる可能性があります。');
  }

  
  // 各経路を解析
  const routes = parseRoutes($, $results);

  
  return {
    routes,
    searchTime: new Date().toISOString()
  };
}


/**
 * 各経路を解析
 */
function parseRoutes($: cheerio.CheerioAPI, $results: cheerio.Cheerio<any>): Route[] {
  const routes: Route[] = [];
  
  $results.find('.bk_result').each((index, routeElement) => {
    const route = parseRoute($, $(routeElement), index + 1);
    if (route) {
      routes.push(route);
    }
  });
  
  return routes;
}

/**
 * 個別の経路を解析
 */
function parseRoute($: cheerio.CheerioAPI, $route: cheerio.Cheerio<any>, routeIndex: number): Route | null {
  try {
    const id = $route.attr('id') || `route_${routeIndex}`;
    const routeNumber = routeIndex;
    
    // 評価タグを解析
    const tags = parseRouteTags($route);
    
    // 時刻情報を解析
    const timeInfo = parseTimeInfo($route);
    
    // 料金情報を解析
    const fareInfo = parseFareInfo($route);
    
    // 所要時間を解析
    const totalTime = parseTotalTime($route);
    
    // 乗換回数を解析
    const transfers = parseTransfers($route);
    
    // 距離を解析
    const totalDistance = parseDistance($route);
    
    // CO2情報を解析
    const co2Info = parseCO2Info($route);
    
    // 経路セグメントを解析
    const segments = parseRouteSegments($route);
    
    // 路線注意事項を解析
    const routeNotices = parseRouteNotices($route);
    
    return {
      id,
      routeNumber,
      tags,
      timeInfo,
      fareInfo,
      totalTime,
      transfers,
      totalDistance,
      co2Info,
      segments,
      routeNotices
    };
  } catch (error) {
    console.warn(`経路 ${routeIndex} の解析に失敗:`, error);
    return null;
  }
}

/**
 * 経路の評価タグを解析
 */
function parseRouteTags($route: cheerio.Cheerio<any>): RouteTag[] {
  const tags: RouteTag[] = [];
  
  $route.find('.hyouka').each((_, el) => {
    const $el = $route.parent().find(el);
    const title = $el.attr('title') || '';
    const text = $el.text().trim();
    
    if (title === '早い' || text === '早') {
      tags.push({ type: 'fast', label: '早い' });
    } else if (title === '楽' || text === '楽') {
      tags.push({ type: 'comfortable', label: '楽' });
    } else if ($el.hasClass('hyouka_car')) {
      tags.push({ type: 'car', label: '車' });
    }
  });
  
  return tags;
}

/**
 * 時刻情報を解析
 */
function parseTimeInfo($route: cheerio.Cheerio<any>): TimeInfo {
  const timeText = $route.find('.data_tm').text();
  const timeMatch = timeText.match(/\((\d{1,2}:\d{2})\)発.*\((\d{1,2}:\d{2})\)着/);
  
  if (timeMatch) {
    return {
      departure: timeMatch[1],
      arrival: timeMatch[2]
    };
  }
  
  // 分表示の場合
  const altTimeMatch = timeText.match(/(\d{1,2}:\d{2})発.*(\d{1,2}:\d{2})着/);
  if (altTimeMatch) {
    return {
      departure: altTimeMatch[1],
      arrival: altTimeMatch[2]
    };
  }
  
  return {
    departure: '',
    arrival: ''
  };
}

/**
 * 料金情報を解析
 */
function parseFareInfo($route: cheerio.Cheerio<any>): FareInfo {
  // より具体的なセレクターを使用
  const fareElement = $route.find('.data_line_1 .data_total dd b');
  
  if (fareElement.length === 0) {
    // フォールバック: 従来のセレクター
    const fareText = $route.find('.data_total dd').text();
    const fareMatch = fareText.match(/([\d,]+)円/);
    const total = fareMatch ? parseInt(fareMatch[1].replace(/,/g, '')) : 0;
    
    const additionalInfo = fareText.includes('＋') ? 
      fareText.split('＋')[1]?.trim() : undefined;
    
    return {
      total,
      additionalInfo
    };
  }
  
  // 新しいセレクターで取得
  const fareText = fareElement.text();
  const fareMatch = fareText.match(/([\d,]+)円/);
  const total = fareMatch ? parseInt(fareMatch[1].replace(/,/g, '')) : 0;
  
  // 追加情報を取得（b要素の後にあるテキスト）
  const ddElement = $route.find('.data_line_1 .data_total dd');
  const fullText = ddElement.text();
  const additionalInfo = fullText.includes('＋') ? 
    fullText.split('＋')[1]?.trim() : undefined;
  
  return {
    total,
    additionalInfo
  };
}

/**
 * 所要時間を解析
 */
function parseTotalTime($route: cheerio.Cheerio<any>): number {
  const timeText = $route.find('.data_total-time dd').text();
  
  // 時間と分の両方がある場合 (例: 3時間59分)
  const hourMinuteMatch = timeText.match(/(\d+)時間(\d+)分/);
  if (hourMinuteMatch) {
    const hours = parseInt(hourMinuteMatch[1]);
    const minutes = parseInt(hourMinuteMatch[2]);
    return hours * 60 + minutes;
  }
  
  // 分のみの場合 (例: 22分)
  const minuteMatch = timeText.match(/(\d+)分/);
  if (minuteMatch) {
    return parseInt(minuteMatch[1]);
  }
  
  // 時間のみの場合 (例: 2時間) - 念のため
  const hourMatch = timeText.match(/(\d+)時間/);
  if (hourMatch) {
    return parseInt(hourMatch[1]) * 60;
  }
  
  return 0;
}

/**
 * 乗換回数を解析
 */
function parseTransfers($route: cheerio.Cheerio<any>): number {
  const transferText = $route.find('.data_norikae-num dd').text();
  const transferMatch = transferText.match(/(\d+)回/);
  return transferMatch ? parseInt(transferMatch[1]) : 0;
}

/**
 * 距離を解析
 */
function parseDistance($route: cheerio.Cheerio<any>): number | undefined {
  const distanceText = $route.find('dl').filter((_, el) => $route.parent().find(el).find('dt').text() === '距離').find('dd').text();
  const distanceMatch = distanceText.match(/(\d+\.?\d*)km/);
  return distanceMatch ? parseFloat(distanceMatch[1]) : undefined;
}

/**
 * CO2情報を解析
 */
function parseCO2Info($route: cheerio.Cheerio<any>): CO2Info | undefined {
  const co2Element = $route.find('.data_norikae-eco dd');
  const co2Text = co2Element.text();
  
  if (!co2Text) return undefined;
  
  const amountMatch = co2Text.match(/(\d+\.?\d*[a-zA-Z]+)/);
  const reductionMatch = co2Text.match(/(\d+\.?\d*%)\s*削減/);
  
  if (amountMatch) {
    return {
      amount: amountMatch[1],
      reductionRate: reductionMatch ? reductionMatch[1] : undefined,
      comparison: co2Text.includes('自動車比') ? '自動車比' : undefined
    };
  }
  
  return undefined;
}

/**
 * 経路セグメントを解析
 */
function parseRouteSegments($route: cheerio.Cheerio<any>): RouteSegment[] {
  const segments: RouteSegment[] = [];
  
  $route.find('.route table tr').each((_, row) => {
    const $row = $route.parent().find(row);
    
    // ヘッダー行をスキップ
    if ($row.find('th').length > 0) return;
    
    // 駅行の場合
    if ($row.hasClass('eki')) {
      const station = parseStationInfo($row);
      if (station) {
        segments.push({
          type: 'station',
          station
        });
      }
    }
    
    // 交通手段行の場合
    if ($row.hasClass('rosen')) {
      const transport = parseTransportInfo($row);
      if (transport) {
        segments.push({
          type: 'transport',
          transport
        });
      }
    }
  });
  
  return segments;
}

/**
 * 駅情報を解析
 */
function parseStationInfo($row: cheerio.Cheerio<any>): StationInfo | null {
  const nameElement = $row.find('.nm strong');
  const name = nameElement.text().trim();
  
  if (!name) return null;
  
  // 駅タイプの判定
  let type: 'start' | 'end' | 'transfer' = 'transfer';
  if ($row.hasClass('eki_s')) type = 'start';
  else if ($row.hasClass('eki_e')) type = 'end';
  
  // 天気情報
  const weatherImg = $row.find('.tenki');
  const weather = parseWeatherInfo(weatherImg);
  
  // プラットフォーム情報
  const platform = $row.find('.ph div').text().trim() || undefined;
  
  // サービス情報
  const services = parseStationServices($row);
  
  return {
    name,
    type,
    weather,
    platform,
    services
  };
}

/**
 * 交通手段情報を解析
 */
function parseTransportInfo($row: cheerio.Cheerio<any>): TransportInfo | null {
  const lineNameElement = $row.find('.rn a, .rn div');
  const lineName = lineNameElement.text().trim();
  
  if (!lineName) return null;
  
  // 交通手段タイプの判定
  let type: 'train' | 'subway' | 'bus' | 'car' | 'taxi' | 'walk' = 'train';
  const iconSrc = $row.find('.gf img').attr('src') || '';
  
  if ($row.hasClass('k_walk')) type = 'walk';
  else if (iconSrc.includes('nr2.gif')) type = 'subway';
  else if (iconSrc.includes('nr5.gif')) type = 'bus';
  else if (iconSrc.includes('nr13.gif')) type = 'car';
  
  // 時刻情報
  const timeText = $row.find('.tm').text();
  // 括弧ありの場合 (20:51)-(20:58) と括弧なしの場合 20:51-20:58 の両方に対応
  const timeMatch = timeText.match(/\(?(\d{1,2}:\d{2})\)?-\(?(\d{1,2}:\d{2})\)?/) || 
                   timeText.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  const durationMatch = timeText.match(/(\d+)分/);
  
  const timeInfo = {
    departure: timeMatch ? timeMatch[1] : '',
    arrival: timeMatch ? timeMatch[2] : '',
    duration: durationMatch ? parseInt(durationMatch[1]) : 0
  };
  
  // 料金情報
  const fareText = $row.find('.fr').text();
  const fareMatch = fareText.match(/(\d+)円/);
  const fare = fareMatch ? parseInt(fareMatch[1]) : undefined;
  
  // 距離情報
  const distance = $row.find('.km').text().trim() || undefined;
  
  // 運行会社の抽出
  const operatorMatch = lineName.match(/\[(.*?)\]/);
  const operator = operatorMatch ? operatorMatch[1] : undefined;
  
  // 方面・行先の抽出
  const direction = lineName.includes('行') ? 
    lineName.split('（')[1]?.replace('）', '') : undefined;
  
  return {
    type,
    lineName,
    direction,
    operator,
    timeInfo,
    fare,
    distance
  };
}

/**
 * 天気情報を解析
 */
function parseWeatherInfo($weatherImg: cheerio.Cheerio<any>): WeatherInfo | undefined {
  const src = $weatherImg.attr('src') || '';
  const alt = $weatherImg.attr('alt') || '';
  
  if (!src) return undefined;
  
  let condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' = 'sunny';
  if (src.includes('cloudy')) condition = 'cloudy';
  else if (src.includes('rainy')) condition = 'rainy';
  else if (src.includes('snowy')) condition = 'snowy';
  
  return {
    condition,
    iconUrl: src,
    description: alt
  };
}

/**
 * 駅サービス情報を解析
 */
function parseStationServices($row: cheerio.Cheerio<any>): StationService[] {
  const services: StationService[] = [];
  
  $row.find('.nrk-route-tbl__ekilink a').each((_, link) => {
    const $link = $row.parent().find(link);
    const className = $link.attr('class') || '';
    const text = $link.text().trim();
    const url = $link.attr('href');
    
    let type: StationService['type'] = 'map';
    if (className.includes('time')) type = 'timetable';
    else if (className.includes('rosenzu')) type = 'route_map';
    else if (className.includes('kounai')) type = 'floor_plan';
    else if (className.includes('coupon')) type = 'coupon';
    else if (className.includes('gourmet')) type = 'gourmet';
    else if (text.includes('出口')) type = 'exit_info';
    
    services.push({
      type,
      name: text,
      url
    });
  });
  
  return services;
}

/**
 * 路線注意事項を解析
 */
function parseRouteNotices($route: cheerio.Cheerio<any>): RouteNotice[] {
  const notices: RouteNotice[] = [];
  
  $route.find('.nrb_unk tr').each((_, row) => {
    const $row = $route.parent().find(row);
    const title = $row.find('td').text().trim();
    
    if (title) {
      notices.push({
        type: 'route_change',
        title,
        description: title
      });
    }
  });
  
  return notices;
}
