import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseRouteSearchResult } from '../src/parser.js';

describe('parser.ts', () => {
  it('should parse route search results correctly for 1', () => {
    // テスト用のHTMLファイルを読み込む
    const htmlFilePath = resolve(__dirname, 'fixtures/nori.results1.html');
    const html = readFileSync(htmlFilePath, 'utf-8');
    
    // パーサーを実行
    const result = parseRouteSearchResult(html);
    
    // 結果をコンソールに出力
    console.log('=== パーサー解析結果 ===');
    console.log(JSON.stringify(result, null, 2));
    
    // 基本的な検証
    expect(result).toBeDefined();
    expect(result.routes).toBeDefined();
    expect(Array.isArray(result.routes)).toBe(true);
    expect(result.routes.length).toBeGreaterThan(0);
    
    // 各経路の検証
    result.routes.forEach((route, index) => {
      console.log(`\n--- 経路 ${index + 1} ---`);
      console.log(`ID: ${route.id}`);
      console.log(`経路番号: ${route.routeNumber}`);
      console.log(`タグ: ${JSON.stringify(route.tags)}`);
      console.log(`時刻: ${route.timeInfo.departure} → ${route.timeInfo.arrival}`);
      console.log(`料金: ${route.fareInfo.total}円`);
      console.log(`所要時間: ${route.totalTime}分`);
      console.log(`乗換回数: ${route.transfers}回`);
      console.log(`距離: ${route.totalDistance}km`);
      console.log(`CO2: ${JSON.stringify(route.co2Info)}`);
      console.log(`セグメント数: ${route.segments.length}`);
      console.log(`注意事項: ${JSON.stringify(route.routeNotices)}`);
      
      // 各セグメントの詳細
      route.segments.forEach((segment, segIndex) => {
        console.log(`  セグメント ${segIndex + 1}: ${segment.type}`);
        if (segment.type === 'station' && segment.station) {
          console.log(`    駅名: ${segment.station.name}`);
          console.log(`    タイプ: ${segment.station.type}`);
          console.log(`    プラットフォーム: ${segment.station.platform}`);
        } else if (segment.type === 'transport' && segment.transport) {
          console.log(`    路線: ${segment.transport.lineName}`);
          console.log(`    タイプ: ${segment.transport.type}`);
          console.log(`    時刻: ${segment.transport.timeInfo.departure} → ${segment.transport.timeInfo.arrival}`);
          console.log(`    料金: ${segment.transport.fare}円`);
        }
      });
      
      // 基本検証
      expect(route.id).toBeDefined();
      expect(route.routeNumber).toBe(index + 1);
      expect(route.timeInfo).toBeDefined();
      expect(route.fareInfo).toBeDefined();
      expect(route.totalTime).toBeGreaterThan(0);
      expect(route.segments).toBeDefined();
      expect(Array.isArray(route.segments)).toBe(true);
    });
    
    console.log('\n=== 解析完了 ===');
  });
  it('should parse route search results correctly for 2', () => {
    // テスト用のHTMLファイルを読み込む
    const htmlFilePath = resolve(__dirname, 'fixtures/nori.results2.html');
    const html = readFileSync(htmlFilePath, 'utf-8');
    
    // パーサーを実行
    const result = parseRouteSearchResult(html);
    
    // 結果をコンソールに出力
    console.log('=== パーサー解析結果 ===');
    console.log(JSON.stringify(result, null, 2));
    
    // 基本的な検証
    expect(result).toBeDefined();
    expect(result.routes).toBeDefined();
    expect(Array.isArray(result.routes)).toBe(true);
    expect(result.routes.length).toBeGreaterThan(0);
    
    // 各経路の検証
    result.routes.forEach((route, index) => {
      console.log(`\n--- 経路 ${index + 1} ---`);
      console.log(`ID: ${route.id}`);
      console.log(`経路番号: ${route.routeNumber}`);
      console.log(`タグ: ${JSON.stringify(route.tags)}`);
      console.log(`時刻: ${route.timeInfo.departure} → ${route.timeInfo.arrival}`);
      console.log(`料金: ${route.fareInfo.total}円`);
      console.log(`所要時間: ${route.totalTime}分`);
      console.log(`乗換回数: ${route.transfers}回`);
      console.log(`距離: ${route.totalDistance}km`);
      console.log(`CO2: ${JSON.stringify(route.co2Info)}`);
      console.log(`セグメント数: ${route.segments.length}`);
      console.log(`注意事項: ${JSON.stringify(route.routeNotices)}`);
      
      // 各セグメントの詳細
      route.segments.forEach((segment, segIndex) => {
        console.log(`  セグメント ${segIndex + 1}: ${segment.type}`);
        if (segment.type === 'station' && segment.station) {
          console.log(`    駅名: ${segment.station.name}`);
          console.log(`    タイプ: ${segment.station.type}`);
          console.log(`    プラットフォーム: ${segment.station.platform}`);
        } else if (segment.type === 'transport' && segment.transport) {
          console.log(`    路線: ${segment.transport.lineName}`);
          console.log(`    タイプ: ${segment.transport.type}`);
          console.log(`    時刻: ${segment.transport.timeInfo.departure} → ${segment.transport.timeInfo.arrival}`);
          console.log(`    料金: ${segment.transport.fare}円`);
        }
      });
      
      // 基本検証
      expect(route.id).toBeDefined();
      expect(route.routeNumber).toBe(index + 1);
      expect(route.timeInfo).toBeDefined();
      expect(route.fareInfo).toBeDefined();
      expect(route.totalTime).toBeGreaterThan(0);
      expect(route.segments).toBeDefined();
      expect(Array.isArray(route.segments)).toBe(true);
    });
    
    console.log('\n=== 解析完了 ===');
  });
});
