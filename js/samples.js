/* RelaGrid: built-in sample diagrams shown in the "サンプル" dropdown. */
(function (global) {
  'use strict';

  var SAMPLES = [
    {
      name: '3層 Web アーキテクチャ',
      category: 'システム構成',
      text: [
        'grid 4x2',
        '',
        'zone A1:B1 "Public zone" color=orange',
        'zone C1:D1 "Private zone" color=blue',
        '',
        'node client A1 icon=laptop size=1 color=slate "Client"',
        'node web    B1 icon=globe  size=1 color=orange "Web"',
        'node api    C1 icon=server size=1.2 color=blue "API"',
        'node db     D1 icon=database size=1 color=blue "DB"',
        '',
        'client -> web "HTTPS"',
        'web -> api "REST"',
        'api -> db "SQL" style=dashed',
        '',
        'note api "SLA 99.95%\\np99 < 200ms" pos=bottom'
      ].join('\n')
    },
    {
      name: 'マイクロサービス (pub/sub)',
      category: 'システム構成',
      text: [
        'grid 4x3',
        '',
        'zone A1:B1 "Edge" color=purple',
        'zone A2:D2 "Services" color=blue',
        'zone A3:D3 "Data" color=green',
        '',
        'node gw     A1 icon=shield size=1 color=purple "Gateway"',
        'node order  A2 icon=box color=blue "Order"',
        'node pay    B2 icon=card color=blue "Payment"',
        'node ship   C2 icon=plug color=blue "Shipping"',
        'node bus    D2 icon=refresh color=slate "Event Bus"',
        'node odb    A3 icon=database color=green "orders_db"',
        'node pdb    B3 icon=database color=green "pay_db"',
        'node sdb    C3 icon=database color=green "ship_db"',
        '',
        'gw -> order "POST /orders"',
        'order -> odb "write"',
        'order -> bus "OrderCreated"',
        'bus -> pay "consume"',
        'bus -> ship "consume"',
        'pay -> pdb "write"',
        'ship -> sdb "write"'
      ].join('\n')
    },
    {
      name: 'CI/CD パイプライン',
      category: 'システム構成',
      text: [
        'grid 5x1',
        '',
        'node dev    A1 icon=code    color=slate  "Dev"',
        'node build  B1 icon=gear    color=blue   "Build"',
        'node test   C1 icon=check   color=teal   "Test"',
        'node stage  D1 icon=cloud   color=orange "Staging"',
        'node prod   E1 icon=server  color=green  "Prod"',
        '',
        'dev -> build "push"',
        'build -> test "artifact"',
        'test -> stage "auto deploy"',
        'stage -> prod "manual approve" style=dashed color=red'
      ].join('\n')
    },
    {
      name: 'グループ会社内セクハラ・ストーカー事件（最高裁H30.2.15）',
      category: '法律・判例',
      source: 'https://www.thomsonreuters.co.jp/ja/westlaw-japan/column-law/2018/180507/',
      text: [
        '# 番号①〜⑤が時系列。親会社は上段、子会社は下段の枠で表し、親子の斜め線は使わない',
        'grid 6x3',
        'title "グループ会社内セクハラ・ストーカー事件と親会社の責任（最高裁 平成30年2月15日判決）"',
        'source "参考: 浜辺陽一郎「ハラスメントの内部通報に警鐘を鳴らす最高裁判決」Westlaw Japan 判例コラム 第132号（2018年5月7日）"',
        '',
        'zone A1:C1 "I社（親会社）" color=purple',
        'zone A2:C3 "T社（子会社）" color=blue',
        'zone E2:F3 "K社（子会社）" color=teal',
        '',
        'node win   B1 icon=bell  size=1   color=purple "グループ相談窓口"',
        'node i     C1 icon=box   size=1   color=purple "I社"',
        'node court D1 icon=file  size=1   color=slate  "最高裁 H30.2.15"',
        'node g     A2 icon=user  size=1   color=slate  "G（係長）"',
        'node d     B2 icon=user  size=1   color=slate  "D（同僚）"',
        'node f     C2 icon=user  size=1   color=slate  "F（課長）"',
        'node p     B3 icon=user  size=1.1 color=orange "P（被害者・T社契約社員）"',
        'node a     E3 icon=user  size=1.1 color=red    "A（加害者・K社課長）"',
        '',
        'a -> p "①つきまとい（2010.8〜2011.1）" style=dashed color=red width=2',
        'p -> g "②相談"',
        'p -> f "③相談"',
        'd -> win "④通報（2011.10）" style=dashed color=purple',
        'court -> i "⑤責任否定" color=red width=2',
        '',
        'note win "通報時、Pは既に退職済み\\n→ I社の義務違反を否定" pos=left',
        'note court "2014年 PがA・T社・K社・I社を提訴" pos=right',
        'note f "G・Fとも事実確認・対応せず" pos=right',
        'note a "交際→破局後、職場訪問・\\n自宅押しかけ" pos=right'
      ].join('\n')
    },
    {
      // 上の横長版と同じ内容を、X（旧Twitter）などに縦画像で投稿しやすい形にしたもの。
      // 3列に絞って縦に並べ替え、textscaleで文字を大きくして、投稿時に小さくなりすぎないようにしている。
      // 書き出しは「PNG 縦」（縦長のまま書き出す）を使う。
      name: 'グループ会社内セクハラ・ストーカー事件（最高裁H30.2.15）縦版・X投稿用',
      category: '法律・判例',
      source: 'https://www.thomsonreuters.co.jp/ja/westlaw-japan/column-law/2018/180507/',
      text: [
        '# 縦長・3列。番号①〜⑤が時系列。textscaleで文字を大きくしている（画像を縮小して投稿しても読みやすくするため）',
        'grid 3x6',
        'textscale 1.3',
        'title "グループ会社内セクハラ・ストーカー事件と\\n親会社の責任（最高裁 平成30年2月15日判決）"',
        'source "参考: 浜辺陽一郎「ハラスメントの内部通報に警鐘を鳴らす最高裁判決」\\nWestlaw Japan 判例コラム 第132号（2018年5月7日）"',
        '',
        'zone A3:B3 "I社（親会社）" color=purple',
        'zone A4:B6 "T社（子会社）" color=blue',
        'zone C4:C6 "K社（子会社）" color=teal',
        '',
        'node court A1 icon=file  size=1   color=slate  "最高裁 H30.2.15"',
        'node i     A3 icon=box   size=1   color=purple "I社"',
        'node win   B3 icon=bell  size=1   color=purple "グループ相談窓口"',
        'node d     B4 icon=user  size=1   color=slate  "D（同僚）"',
        'node g     A5 icon=user  size=1   color=slate  "G（係長）"',
        'node f     B5 icon=user  size=1   color=slate  "F（課長）"',
        'node p     A6 icon=user  size=1.1 color=orange "P（被害者・T社）"',
        'node a     C6 icon=user  size=1.1 color=red    "A（加害者・K社）"',
        '',
        'a -> p "①つきまとい（2010.8〜2011.1）" style=dashed color=red width=2',
        'p -> g "②相談"',
        'p -> f "③相談"',
        'd -> win "④通報（2011.10）" style=dashed color=purple',
        'court -> i "⑤責任否定" color=red width=2',
        '',
        'note court "2014年 PがA・T社・K社・I社を提訴" pos=right',
        'note win "通報時、Pは既に\\n退職済み" pos=right',
        'note f "G・Fとも事実確認・対応せず" pos=right',
        'note a "交際→破局後、職場訪問・自宅押しかけ" pos=bottom'
      ].join('\n')
    },
    {
      // 縦版・X投稿用をさらに絞った簡易版。親会社の責任が否定された理由だけが伝わるよう、
      // 相談（G・F）と提訴の注記を省き、①つきまとい→④通報→⑤責任否定の3本の矢印に絞っている。
      name: 'グループ会社内セクハラ・ストーカー事件（最高裁H30.2.15）縦版・X投稿用（簡易）',
      category: '法律・判例',
      source: 'https://www.thomsonreuters.co.jp/ja/westlaw-japan/column-law/2018/180507/',
      text: [
        '# 縦長・3列の簡易版。ノード6個・矢印3本。結論の理由（Pは通報時に退職済み）だけを注記にしている',
        'grid 3x5',
        'textscale 1.3',
        'title "親会社の責任が否定された理由\\n（最高裁 平成30年2月15日判決）"',
        'source "参考: 浜辺陽一郎 Westlaw Japan 判例コラム 第132号"',
        '',
        'zone A3:B3 "I社（親会社）" color=purple',
        'zone A4:B5 "T社（子会社）" color=blue',
        'zone C4:C5 "K社（子会社）" color=teal',
        '',
        'node court A1 icon=file  size=1   color=slate  "最高裁 H30.2.15"',
        'node i     A3 icon=box   size=1   color=purple "I社"',
        'node win   B3 icon=bell  size=1   color=purple "グループ相談窓口"',
        'node d     B4 icon=user  size=1   color=slate  "D（同僚）"',
        'node p     A5 icon=user  size=1.1 color=orange "P（被害者・T社）"',
        'node a     C5 icon=user  size=1.1 color=red    "A（加害者・K社）"',
        '',
        'a -> p "①つきまとい" style=dashed color=red width=2',
        'd -> win "④通報（2011.10）" style=dashed color=purple',
        'court -> i "⑤責任否定" color=red width=2',
        '',
        'note a "2010.8〜2011.1" pos=top',
        'note win "通報時、Pは既に\\n退職済み" pos=right'
      ].join('\n')
    }
  ];

  global.RelaGrid = global.RelaGrid || {};
  global.RelaGrid.samples = SAMPLES;
})(window);
