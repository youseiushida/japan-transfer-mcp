/**
 * 経路検索結果を自然な文章形式でフォーマットする
 */
export function formatRouteSearchResponse(result: any, searchUrl: string, from: string, to: string, datetime: string): string {
    const lines: string[] = [];
    
    // ヘッダー情報
    lines.push(`🚃 **${from}** から **${to}** への経路検索結果`);
    lines.push(`📅 検索日時: ${datetime}`);
    lines.push(`🔗 検索URL: ${searchUrl}`);
    lines.push(`⏰ 検索実行時刻: ${result.searchTime}`);
    lines.push('');
    
    if (!result.routes || result.routes.length === 0) {
        lines.push('❌ 該当する経路が見つかりませんでした。');
        return lines.join('\n');
    }
    
    lines.push(`📋 **${result.routes.length}件の経路が見つかりました**`);
    lines.push('');
    
    // 各経路の詳細
    result.routes.forEach((route: any, index: number) => {
        lines.push(`## 🛤️ 経路${route.routeNumber}: ${route.timeInfo.departure} → ${route.timeInfo.arrival}`);
        
        // 基本情報
        const basicInfo: string[] = [];
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
        if (route.totalDistance) {
            basicInfo.push(`📏 距離: ${route.totalDistance}km`);
        }
        
        if (basicInfo.length > 0) {
            lines.push(basicInfo.join(' | '));
        }
        
        // タグ情報
        if (route.tags && route.tags.length > 0) {
            const tagText = route.tags.map((tag: any) => {
                switch (tag.type) {
                    case 'fast': return '⚡早い';
                    case 'comfortable': return '😌楽';
                    case 'cheap': return '💰安い';
                    case 'car': return '🚗車';
                    default: return tag.label;
                }
            }).join(' ');
            lines.push(`🏷️ ${tagText}`);
        }
        
        // CO2情報
        if (route.co2Info) {
            lines.push(`🌱 CO2排出量: ${route.co2Info.amount}${route.co2Info.reductionRate ? ` (${route.co2Info.comparison}${route.co2Info.reductionRate}削減)` : ''}`);
        }
        
        lines.push('');
        
        // 経路詳細
        if (route.segments && route.segments.length > 0) {
            lines.push('### 📍 経路詳細');
            
            route.segments.forEach((segment: any, segIndex: number) => {
                if (segment.type === 'station' && segment.station) {
                    const station = segment.station;
                    let stationLine = '';
                    
                    // 駅タイプによるアイコン
                    switch (station.type) {
                        case 'start':
                            stationLine = `🚩 **出発**: ${station.name}`;
                            break;
                        case 'end':
                            stationLine = `🏁 **到着**: ${station.name}`;
                            break;
                        case 'transfer':
                            stationLine = `🔄 **乗換**: ${station.name}`;
                            break;
                        default:
                            stationLine = `📍 ${station.name}`;
                    }
                    
                    // プラットフォーム情報
                    if (station.platform) {
                        stationLine += ` (${station.platform})`;
                    }
                    
                    // 天気情報
                    if (station.weather) {
                        const weatherIcons: Record<string, string> = {
                            'sunny': '☀️',
                            'cloudy': '☁️',
                            'rainy': '🌧️',
                            'snowy': '❄️'
                        };
                        const weatherIcon = weatherIcons[station.weather.condition] || '🌤️';
                        stationLine += ` ${weatherIcon}`;
                    }
                    
                    lines.push(stationLine);
                    
                } else if (segment.type === 'transport' && segment.transport) {
                    const transport = segment.transport;
                    let transportLine = '';
                    
                    // 交通手段タイプによるアイコン
                    const transportIcons: Record<string, string> = {
                        'train': '🚃',
                        'subway': '🚇',
                        'bus': '🚌',
                        'car': '🚗',
                        'taxi': '🚕',
                        'walk': '🚶'
                    };
                    const transportIcon = transportIcons[transport.type] || '🚃';
                    
                    transportLine = `${transportIcon} ${transport.lineName}`;
                    
                    // 時刻情報
                    if (transport.timeInfo) {
                        const timeText: string[] = [];
                        if (transport.timeInfo.departure && transport.timeInfo.arrival) {
                            timeText.push(`${transport.timeInfo.departure}-${transport.timeInfo.arrival}`);
                        }
                        if (transport.timeInfo.duration) {
                            timeText.push(`${transport.timeInfo.duration}分`);
                        }
                        if (timeText.length > 0) {
                            transportLine += ` (${timeText.join(', ')})`;
                        }
                    }
                    
                    // 運賃情報
                    if (transport.fare) {
                        transportLine += ` 💰${transport.fare}円`;
                    }
                    
                    // 距離情報
                    if (transport.distance) {
                        transportLine += ` 📏${transport.distance}`;
                    }
                    
                    lines.push(`  ${transportLine}`);
                }
            });
        }
        
        // 注意事項
        if (route.routeNotices && route.routeNotices.length > 0) {
            lines.push('');
            lines.push('### ⚠️ 注意事項');
            route.routeNotices.forEach((notice: any) => {
                lines.push(`- ${notice.title}${notice.description && notice.description !== notice.title ? `: ${notice.description}` : ''}`);
            });
        }
        
        lines.push('');
        lines.push('---');
        lines.push('');
    });
    
    return lines.join('\n');
}