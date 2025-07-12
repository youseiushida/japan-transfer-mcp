# https://navi.jorudan.co.jp/api/compat/suggest/agg

```url
https://navi.jorudan.co.jp/api/compat/suggest/agg?callback=my_callbacl_function&query=%E5%8F%96%E6%89%8B&max_R=11&max_B=11&max_S=11&format=jsonp&kinds=&excludeSpot=JGn&Rfilter=&Bfilter=&geosys=tky%2Cjpn&geounit=ms&_=1752033283219
```
## payload
### callback
JSONPを返す先の関数名。

### query
部分一致対象の文字列。これに一致する駅名等が返される。

### max_R
駅/空港の最大返却数。
### max_B
バス停/港の最大返却数。
### max_S
スポットの最大返却数。

### format
返却形式。jsonp/jsonを指定する。

### kinds
返却対象とする施設種別をカンマ区切りで指定します。  
R = 鉄道駅 / 空港, B = バス停 / 港, S = スポット。空文字列の場合はすべてを対象にします。

### excludeSpot (推測)
指定したスポット種別を結果から除外します。  
例: JGn は「ジョルダン汎用スポット」を除外。

### Rfilter (推測)
鉄道駅 / 空港に対して追加で絞り込み条件を与えます。  
詳細仕様は非公開ですが、路線コードや都道府県コードが入ることがあります。空文字列ならフィルタなし。

### Bfilter (推測)
バス停 / 港を対象とする追加フィルタ。空文字列ならフィルタなし。

### geosys (推測)
座標系 (測地系) をカンマ区切りで指定します。
- `tky`  : 旧日本測地系 (Tokyo Datum)
- `jpn`  : 日本測地系 2000/2011 (JGD2000/JGD2011)
- `wgs84`: 世界測地系 WGS-84（API が返す JSON 例で確認）
複数指定する場合は `tky,jpn` のようにカンマで連結します。

取手駅での比較例 (geounit=deg):
- `wgs84`: lon `140.3.47.72173020423452`, lat `35.53.44.75280514158271`
- `tky` / `jpn`: lon `140.3.59.39999999996644`, lat `35.53.33.199999999991974`

上記のように、`wgs84` は `tky/jpn` と比べて経度が約 +11.7″、緯度が約 -11.6″ だけずれており、おおよそ 360 m 程度の差になります。`jpn` と `tky` は本 API では同一座標を返すようです。

### geounit (推測)
座標値の単位と表記方法を指定します。
- `ms`  : ミリ秒角 (10^-3 秒角) を整数化した値。
          例) `lat":"129224752"` → 129 224 752 ÷1000 ÷3600 ≈ **35.895765°**
- `deg` : 度分秒 (D°M'S") をドット区切りで文字列化。
          例) `lat":"35.53.44.75280514158271"` → 35° + 53′/60 + 44.752805″/3600 ≈ **35.895765°**
省略時の挙動:
`geosys`,`geounit` の両方を指定しない場合、本 API は **WGS-84 + 十進度 (小数表記)** で返却します。

例 (パラメータ省略):
```
"location": {
  "lon": "140.06325603616784",
  "lat": "35.895764668094884"
}
```
これは `geosys=wgs84` かつ十進度に換算した値と一致します。

### _ (推測)
ブラウザ側で付与されるキャッシュバスター用のタイムスタンプ。API には影響しません。

## response
### respInfo
- libVersion: ライブラリのバージョン
- timestamp: リクエストのタイムスタンプ
- dataTime: データの更新日時
- status: リクエストのステータス
- version: データのバージョン

### R
鉄道駅 / 空港のリスト。

### B
バス停 / 港のリスト。

### S
スポットのリスト。

### 各要素のフィールド
- poiName: 施設名
- prefName: 都道府県名
- poiYomi: 読み
- cityName: 市区町村名
- nodeKind: 施設種別 (R=鉄道駅/空港, B=バス停/港, S=スポット)
- location: 緯度経度
- cityCode: 市区町村コード
- address: 住所
- provider: 提供者情報
    - label: 提供者名
    - identity: 提供者のURL
    - logo: 提供者のロゴURL

## examples
### https://navi.jorudan.co.jp/api/compat/suggest/agg?callback=my_callback_function&query=%E5%8F%96%E6%89%8B&max_R=1&max_B=1&max_S=1&format=jsonp&kinds=&excludeSpot=JGn&Rfilter=&Bfilter=&geosys=tky%2Cjpn&geounit=ms&_=1752033283219

response:
``` jsonp
my_callback_function({
  "respInfo": {
    "libVersion": "3.1.6",
    "timestamp": 1752037162,
    "dataTime": "2025-07-03 21:02:00",
    "status": "OK",
    "version": "2.6"
  },
  "R": [
    {
      "poiName": "取手",
      "prefName": "茨城県",
      "poiYomi": "とりで",
      "cityName": "取手市",
      "nodeKind": "R",
      "location": {
        "lon": "504227721",
        "lat": "129224752"
      },
      "cityCode": 8217
    }
  ],
  "S": [
    {
      "poiName": "取手市民会館",
      "spotCode": "E92054081",
      "nodeKind": "S",
      "cityName": "取手市",
      "prefName": "茨城県",
      "poiYomi": "トリデシミンカイカン",
      "provider": {
        "label": "ジョルダン",
        "identity": "jorudan.co.jp",
        "logo": ""
      },
      "cityCode": 8217,
      "location": {
        "lon": "504239886",
        "lat": "129201451"
      },
      "address": "茨城県取手市東1-1-5"
    }
  ],
  "B": [
    {
      "poiName": "取手〔根羽村コミュニティ〕",
      "prefName": "長野県",
      "poiYomi": "とりで",
      "cityName": "根羽村",
      "nodeKind": "B",
      "location": {
        "lon": "495346275",
        "lat": "127027226"
      },
      "cityCode": 20410
    }
  ]
})
```


# https://www.jorudan.co.jp/norikae/cgi/nori.cgi

```url
https://www.jorudan.co.jp/norikae/cgi/nori.cgi?eki1=%E5%8F%96%E6%89%8B&eki2=%E4%BA%AC%E9%83%BD&via_on=1&eki3=%E9%9D%99%E5%B2%A1&eki4=%E5%8C%97%E4%B9%9D%E5%B7%9E%E7%A9%BA%E6%B8%AF&eki5=&eki6=&Dyy=2025&Dmm=7&Ddd=9&Dhh=12&Dmn1=5&Dmn2=4&Cway=0&Clate=1&Cfp=1&Czu=2&C7=1&C2=0&C3=1&C1=3&cartaxy=1&bikeshare=1&sort=time&C4=1&C5=0&C6=3&S=%E6%A4%9C%E7%B4%A2&Cmap1=&rf=nr&pg=0&eok1=&eok2=R-&eok3=R-&eok4=R-&eok5=&eok6=&Csg=1
```
## payload
### eki1 / eki2
出発駅名 / 到着駅名（UTF-8 URL エンコード）。

### via_on
経由駅入力欄の有効/無効を示すフラグ。
- `1`: 経由駅を指定する（入力欄 ON）
- `-1`: 経由駅を指定しない（入力欄 OFF）

#### vstp
`via_on=1` のときに現れるオプション。
- `vstp=1` を付与すると「経由駅で停車」にチェックが入る。

### eki3 – eki6 （推測）
経由駅 1〜4。空文字列の場合は未指定。

### Dyy / Dmm / Ddd
検索対象の日付。西暦年 (4 桁)、月 (1-12)、日 (1-31)。

### Dhh / Dmn1 / Dmn2
検索時刻。`Dhh` が時 (0-23)、`Dmn1` が分の 10 の位、`Dmn2` が分の 1 の位。例: `5` と `4` で **54 分**。

### Czu
割引種別（会員クラブ）を示すセレクトボックス。
UI では「割引」のプルダウンに対応しており、主に下記の値が確認できる。
- `2`: ジパング倶楽部
- `1`: ジパング倶楽部（加入初年度3回まで）
- `3`: 大人の休日倶楽部ジパング
- `4`: 大人の休日倶楽部ミドル
- `5`: おとなび・JR西日本ジパング倶楽部
- `6`: JR四国ジパング倶楽部

### Clate
「出来るだけ遅く出発する」に対応するチェックボックス。
チェック時のみ `Clate=1` が付与される。

### sort
検索結果の並べ替え方法（セレクトボックス）。
- `rec`: おすすめ順 (デフォルト)
- `time`: 到着が早い・出発が遅い順
- `fast`: 所要時間順
- `change`: 乗換回数順
- `cheap`: 安い順

### Cfp
運賃の表示種別（ラジオボタン）。
- `1`: ICカード利用料金
- `2`: 切符利用料金

### C1
有料特急（新幹線・特急）の扱い。
- `0`: おまかせ
- `3`: なるべく利用
- `4`: ひかえる
- `1`: 使わない

### C2
飛行機（空路）の利用可否。
- `0`: おまかせ
- `1`: 使わない

### C3
高速バスの利用可否。
- `0`: おまかせ
- `1`: 使わない

### C4
座席種別の優先順位。
- `5`: おまかせ (デフォルト)
- `0`: 指定席優先
- `1`: 自由席優先
- `2`: グリーン席優先

### C5
優先列車の指定。
- `0`: のぞみ優先 (デフォルト)
- `1`: ひかりも表示
- `2`: 各駅停車優先
- `3`: 直通列車優先（有料会員向け、UI では disabled）

### C6
乗換時間の余裕設定。
- `1`: 短め
- `2`: 標準 (デフォルト)
- `3`: 余裕を持つ

### C7
定期券の種別（定期の種類）。
- `1`: 通勤
- `5`: オフピーク通勤
- `2`: 通学（大学生）
- `3`: 通学（高校生）
- `4`: 通学（中学生）

### cartaxy / bikeshare （推測）
`cartaxy` は「車・タクシーを検索する」、`bikeshare` は「自転車(シェアサイクル)を検索する」のトグル。`1` = 有効。

### Cway
検索対象とする時間区分を指定。
- `0`: 出発時刻を基準に検索
- `1`: 到着時刻を基準に検索
- `2`: 始発（その日の最初の列車）
- `3`: 終電（その日の最後の列車）

### Cmap1 / rf / pg （推測）
UI 関連の内部パラメータ。`pg` はページ番号、`rf=nr` はリファラコードと思われる。

### eok1 – eok6 （推測）
各駅入力欄に対して入力補助ウィジェットが返すステータスコード。`R-` は鉄道駅確定を示すものと推定。

### Csg （推測）
検索開始を示す内部フラグ。`1` 固定。

### S
検索ボタン (`検索`) の値。実質的には送信トリガー。