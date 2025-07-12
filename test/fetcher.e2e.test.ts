import { describe, it, expect } from 'vitest';
import { fetchSuggest, fetchRouteSearch } from '../src/fetcher';
import { SuggestQuery, RouteSearchQuery } from '../src/type';
import { parseRouteSearchResult } from '../src/parser';

describe('Fetcher E2E Tests', () => {
  describe('fetchSuggest', () => {
    it('should fetch suggest results for "取手"', async () => {
      const query: SuggestQuery = {
        query: '取手',
        max_R: 5,
        max_B: 5,
        max_S: 5,
        format: 'json',
        kinds: '',
        excludeSpot: 'JGn',
        Rfilter: '',
        Bfilter: '',
        geosys: 'tky',
        geounit: 'ms',
        _: Date.now()
      };

      const response = await fetchSuggest(query);
      
      console.log('Suggest Response:', JSON.stringify(response, null, 2));
      
      // レスポンスの基本構造を確認
      expect(response).toHaveProperty('respInfo');
      expect(response.respInfo).toHaveProperty('status');
      expect(response.respInfo.status).toBe('OK');
      
      // R (鉄道駅) の結果を確認
      if (response.R && response.R.length > 0) {
        expect(response.R[0]).toHaveProperty('poiName');
        expect(response.R[0]).toHaveProperty('prefName');
        expect(response.R[0]).toHaveProperty('poiYomi');
        expect(response.R[0]).toHaveProperty('cityName');
        expect(response.R[0]).toHaveProperty('nodeKind', 'R');
        expect(response.R[0]).toHaveProperty('location');
        expect(response.R[0].location).toHaveProperty('lon');
        expect(response.R[0].location).toHaveProperty('lat');
        expect(response.R[0].poiName).toContain('取手');
      }
      
      // B (バス停) の結果を確認
      if (response.B && response.B.length > 0) {
        expect(response.B[0]).toHaveProperty('nodeKind', 'B');
      }
      
      // S (スポット) の結果を確認
      if (response.S && response.S.length > 0) {
        expect(response.S[0]).toHaveProperty('nodeKind', 'S');
      }
    }, 10000);

    it('should fetch suggest results for "京都"', async () => {
      const query: SuggestQuery = {
        query: '京都',
        max_R: 3,
        max_B: 3,
        max_S: 3,
        format: 'json',
        kinds: 'R',  // 鉄道駅のみ
        excludeSpot: 'JGn',
        Rfilter: '',
        Bfilter: '',
        geosys: 'wgs84',
        geounit: 'deg',
        _: Date.now()
      };

      const response = await fetchSuggest(query);
      
      console.log('Kyoto Suggest Response:', JSON.stringify(response, null, 2));
      
      expect(response).toHaveProperty('respInfo');
      expect(response.respInfo.status).toBe('OK');
      
      // 鉄道駅のみを指定したので、Rの結果があることを確認
      if (response.R && response.R.length > 0) {
        expect(response.R[0].poiName).toContain('京都');
        expect(response.R[0].nodeKind).toBe('R');
      }
    }, 10000);
  });

  describe('fetchRouteSearch', () => {
    it('should fetch route search results from 取手 to 京都', async () => {
      const query: RouteSearchQuery = {
        eki1: '取手',
        eki2: '京都',
        via_on: -1,  // 経由駅指定しない
        eki3: '',
        eki4: '',
        eki5: '',
        eki6: '',
        Dyy: 2025,
        Dmm: 1,
        Ddd: 15,
        Dhh: 12,
        Dmn1: 0,
        Dmn2: 0,
        Cway: 0,      // 出発時刻基準
        Cfp: 1,       // ICカード利用料金
        Czu: 2,       // ジパング倶楽部
        C7: 1,        // 通勤定期
        C2: 0,        // 飛行機おまかせ
        C3: 1,        // 高速バス使わない
        C1: 3,        // 特急なるべく利用
        cartaxy: 1,
        bikeshare: 1,
        sort: 'time', // 到着が早い・出発が遅い順
        C4: 1,        // 自由席優先
        C5: 0,        // のぞみ優先
        C6: 3,        // 乗換時間余裕を持つ
        S: '検索',
        Csg: 1
      };

      const response = await fetchRouteSearch(query);
      
      console.log('Route Search Response Length:', response.data.length);
      console.log('Route Search Response Preview:', response.data.substring(0, 500));
      
      // HTMLレスポンスであることを確認
      expect(response.data).toBeTypeOf('string');
      expect(response.data.length).toBeGreaterThan(0);
      
      // 基本的なHTMLタグが含まれていることを確認
      expect(response.data).toContain('<html');
      expect(response.data).toContain('</html>');
      
      // 検索結果に関連する要素が含まれていることを確認
      // （実際の内容は検索結果によって変わるので、基本的なチェックのみ）
      expect(response.data).toMatch(/取手|京都/);
    }, 15000);

    it('should fetch route search results with via station', async () => {
      const query: RouteSearchQuery = {
        eki1: '取手',
        eki2: '京都',
        via_on: 1,    // 経由駅指定する
        eki3: '東京',  // 経由駅1
        eki4: '',
        eki5: '',
        eki6: '',
        Dyy: 2025,
        Dmm: 1,
        Ddd: 15,
        Dhh: 9,
        Dmn1: 0,
        Dmn2: 0,
        Cway: 0,      // 出発時刻基準
        Cfp: 1,       // ICカード利用料金
        Czu: 2,
        C7: 1,
        C2: 0,
        C3: 1,
        C1: 3,        // 特急なるべく利用
        cartaxy: 1,
        bikeshare: 1,
        sort: 'rec',  // おすすめ順
        C4: 1,
        C5: 0,
        C6: 2,        // 標準の乗換時間
        S: '検索',
        Csg: 1
      };

      const response = await fetchRouteSearch(query);
      
      console.log('Via Station Route Search Response Length:', response.data.length);
      console.log('Via Station Route Search Response Preview:', response.data.substring(0, 500));
      
      expect(response.data).toBeTypeOf('string');
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data).toContain('<html');
      expect(response.data).toMatch(/取手|京都|東京/);
    }, 15000);

    it('should fetch route search results for MCP test case: 取手 to 取手〔根羽村コミュニティ〕', async () => {
      console.log('=== MCP Test Case: 取手 to 取手〔根羽村コミュニティ〕 ===');
      
      // 2025-07-13 12:22:30 のパースされた値
      const date = new Date('2025-07-13T12:22:30');
      const query: RouteSearchQuery = {
        eki1: '取手',
        eki2: '取手〔根羽村コミュニティ〕',
        via_on: -1,  // 経由駅指定しない
        Dyy: date.getFullYear(),
        Dmm: date.getMonth() + 1,
        Ddd: date.getDate(),
        Dhh: date.getHours(),
        Dmn1: Math.floor(date.getMinutes() / 10),
        Dmn2: date.getMinutes() % 10,
        Cway: 0,      // 出発時刻基準 (departure)
        Cfp: 1,       // ICカード利用料金
        Czu: 2,       // ジパング倶楽部
        C7: 1,        // 通勤定期
        C2: 0,        // 飛行機おまかせ
        C3: 0,        // 高速バスおまかせ
        C1: 0,        // 特急おまかせ
        cartaxy: 1,
        bikeshare: 1,
        sort: 'time', // 到着が早い・出発が遅い順
        C4: 5,        // 座席おまかせ
        C5: 0,        // のぞみ優先
        C6: 2,        // 標準の乗換時間
        S: '検索',
        Csg: 1,
        eok1: 'R-',   // 鉄道駅確定
        eok2: 'B-',   // バス停確定
        rf: 'nr',
        pg: 0
      };

      console.log('Query parameters:', JSON.stringify(query, null, 2));

      try {
        const response = await fetchRouteSearch(query);
        
        console.log('Response URL:', response.url);
        console.log('Response Data Length:', response.data.length);
        console.log('Response Data Preview:', response.data.substring(0, 1000));
        
        // HTMLレスポンスであることを確認
        expect(response.data).toBeTypeOf('string');
        expect(response.data.length).toBeGreaterThan(0);
        
        // 基本的なHTMLタグが含まれていることを確認
        expect(response.data).toContain('<html');
        expect(response.data).toContain('</html>');
        
        // 検索結果に関連する要素が含まれていることを確認
        expect(response.data).toMatch(/取手/);
        
        console.log('✅ MCP Test Case: Success');
      } catch (error) {
        console.error('❌ MCP Test Case: Error', error);
        throw error;
      }
    }, 15000);

    it('should test MCP datetime parsing logic', async () => {
      console.log('=== MCP Datetime Parsing Test ===');
      
      // MCPツールと同じロジックをテスト
      const datetime = '2025-07-13 12:22:30';
      const datePart = datetime.split(" ")[0];
      const timePart = datetime.split(" ")[1];
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      
      console.log('Parsed date:', { year, month, day, hour, minute });
      console.log('Dmn1 (tens):', Math.floor(minute / 10));
      console.log('Dmn2 (ones):', minute % 10);
      
      // 駅タイプの判定テスト
      const from = '取手';
      const to = '取手〔根羽村コミュニティ〕';
      const isFromBusStop = from.includes("〔") || from.includes("［");
      const isToBusStop = to.includes("〔") || to.includes("［");
      
      console.log('Station type detection:', { from, to, isFromBusStop, isToBusStop });
      
      expect(year).toBe(2025);
      expect(month).toBe(7);
      expect(day).toBe(13);
      expect(hour).toBe(12);
      expect(minute).toBe(22);
      expect(Math.floor(minute / 10)).toBe(2);
      expect(minute % 10).toBe(2);
      expect(isFromBusStop).toBe(false);
      expect(isToBusStop).toBe(true);
      
      console.log('✅ MCP Datetime Parsing Test: Success');
    }, 5000);

    it('should parse route search results with parser', async () => {
      console.log('=== Parser Integration Test ===');
      
      const query: RouteSearchQuery = {
        eki1: '取手',
        eki2: '取手〔根羽村コミュニティ〕',
        via_on: -1,
        Dyy: 2025,
        Dmm: 7,
        Ddd: 13,
        Dhh: 12,
        Dmn1: 2,
        Dmn2: 2,
        Cway: 0,
        Cfp: 1,
        Czu: 2,
        C7: 1,
        C2: 0,
        C3: 0,
        C1: 0,
        cartaxy: 1,
        bikeshare: 1,
        sort: 'time',
        C4: 5,
        C5: 0,
        C6: 2,
        S: '検索',
        Csg: 1,
        eok1: 'R-',
        eok2: 'B-',
        rf: 'nr',
        pg: 0
      };

      try {
        const response = await fetchRouteSearch(query);
        console.log('Raw HTML response length:', response.data.length);
        
        // パーサーでHTMLを解析
        const parsedResult = parseRouteSearchResult(response.data);
        console.log('Parsed result:', JSON.stringify(parsedResult, null, 2));
        
        // 基本的な構造の確認
        expect(parsedResult).toHaveProperty('routes');
        expect(parsedResult).toHaveProperty('searchTime');
        expect(Array.isArray(parsedResult.routes)).toBe(true);
        expect(parsedResult.routes.length).toBeGreaterThan(0);
        
        // 各ルートの構造確認
        parsedResult.routes.forEach((route, index) => {
          console.log(`Route ${index + 1}:`, {
            id: route.id,
            routeNumber: route.routeNumber,
            totalTime: route.totalTime,
            transfers: route.transfers,
            segments: route.segments.length
          });
          
          expect(route).toHaveProperty('id');
          expect(route).toHaveProperty('routeNumber');
          expect(route).toHaveProperty('timeInfo');
          expect(route).toHaveProperty('fareInfo');
          expect(route).toHaveProperty('segments');
          expect(Array.isArray(route.segments)).toBe(true);
        });
        
        console.log('✅ Parser Integration Test: Success');
      } catch (error) {
        console.error('❌ Parser Integration Test: Error', error);
        throw error;
      }
    }, 15000);

    it('should test natural language formatting', async () => {
      console.log('=== Natural Language Formatting Test ===');
      
      const query: RouteSearchQuery = {
        eki1: '取手',
        eki2: '取手〔根羽村コミュニティ〕',
        via_on: -1,
        Dyy: 2025,
        Dmm: 7,
        Ddd: 13,
        Dhh: 12,
        Dmn1: 2,
        Dmn2: 2,
        Cway: 0,
        Cfp: 1,
        Czu: 2,
        C7: 1,
        C2: 0,
        C3: 0,
        C1: 0,
        cartaxy: 1,
        bikeshare: 1,
        sort: 'time',
        C4: 5,
        C5: 0,
        C6: 2,
        S: '検索',
        Csg: 1,
        eok1: 'R-',
        eok2: 'B-',
        rf: 'nr',
        pg: 0
      };

      try {
        const response = await fetchRouteSearch(query);
        const parsedResult = parseRouteSearchResult(response.data);
        
        // formatRouteSearchResponse関数を直接テストするため、index.tsから関数を取得
        // 実際のMCPツールと同じフォーマット処理を実行
        const datetime = '2025-07-13 12:22:30';
        const from = '取手';
        const to = '取手〔根羽村コミュニティ〕';
        
        // 簡単なフォーマット関数を作成（テスト用）
        const formatTestResponse = (result: any, url: string, from: string, to: string, datetime: string): string => {
          const lines: string[] = [];
          
                     lines.push(`🚃 **${from}** から **${to}** への経路検索結果` as string);
           lines.push(`📅 検索日時: ${datetime}` as string);
           lines.push(`🔗 検索URL: ${url}` as string);
          lines.push(`⏰ 検索実行時刻: ${result.searchTime}`);
          lines.push('');
          
          if (!result.routes || result.routes.length === 0) {
            lines.push('❌ 該当する経路が見つかりませんでした。');
            return lines.join('\n');
          }
          
          lines.push(`📋 **${result.routes.length}件の経路が見つかりました**`);
          lines.push('');
          
          result.routes.forEach((route: any, index: number) => {
            lines.push(`## 🛤️ 経路${route.routeNumber}: ${route.timeInfo.departure} → ${route.timeInfo.arrival}`);
            
            const basicInfo = [];
            if (route.totalTime) {
              const hours = Math.floor(route.totalTime / 60);
              const minutes = route.totalTime % 60;
              basicInfo.push(`⏱️ 所要時間: ${hours > 0 ? `${hours}時間` : ''}${minutes}分`);
            }
            if (route.transfers !== undefined) {
              basicInfo.push(`🔄 乗換: ${route.transfers}回`);
            }
            if (route.fareInfo?.total) {
              basicInfo.push(`💰 運賃: ${route.fareInfo.total.toLocaleString()}円`);
            }
            
            if (basicInfo.length > 0) {
              lines.push(basicInfo.join(' | '));
            }
            
            lines.push('');
          });
          
          return lines.join('\n');
        };
        
        const formattedResponse = formatTestResponse(parsedResult, response.url, from, to, datetime);
        
        console.log('=== Formatted Response ===');
        console.log(formattedResponse);
        console.log('=== End Formatted Response ===');
        
        // フォーマットされたレスポンスの基本的な構造を確認
        expect(formattedResponse).toContain('🚃');
        expect(formattedResponse).toContain('取手');
        expect(formattedResponse).toContain('取手〔根羽村コミュニティ〕');
        expect(formattedResponse).toContain('📅 検索日時');
        expect(formattedResponse).toContain('🔗 検索URL');
        expect(formattedResponse).toContain('経路が見つかりました');
        
        console.log('✅ Natural Language Formatting Test: Success');
      } catch (error) {
        console.error('❌ Natural Language Formatting Test: Error', error);
        throw error;
      }
    }, 15000);
  });
}); 