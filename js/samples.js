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
        'grid 6x4',
        '',
        'zone A3:C4 "T社の関係者" color=blue',
        '',
        'node i A1 icon=shield size=1.2 color=purple "I社（親会社）"',
        'node t B2 icon=box   size=1   color=blue   "T社（子会社）"',
        'node k F2 icon=box   size=1   color=teal   "K社（子会社）"',
        'node g A3 icon=user  size=1   color=slate  "G（係長・上司）"',
        'node d C3 icon=user  size=1   color=slate  "D（同僚）"',
        'node f E3 icon=user  size=1   color=slate  "F（課長）"',
        'node p B4 icon=user  size=1.1 color=orange "P（被害者・契約社員）"',
        'node a F4 icon=user  size=1.1 color=red    "A（加害者・K社課長）"',
        '',
        'i -> t "親子会社"',
        'i -> k "親子会社"',
        'k -> t "製造請負発注"',
        't -> g "雇用（係長）"',
        't -> d "雇用（同僚）"',
        't -> f "雇用（課長）"',
        't -> p "雇用（契約社員）"',
        'k -> a "雇用（課長）"',
        'a -> p "交際→破局後ストーカー行為" style=dashed color=red width=2',
        'p -> g "相談 (2010年3-9月)"',
        'p -> f "相談 (2010年10月)"',
        'd -> i "相談窓口へ通報 (2011年10月)" style=dashed color=purple',
        '',
        'note i "2014年提訴（P→A・I社・T社・K社）\\n最高裁H30.2.15：I社の責任否定" pos=right',
        'note a "破局後、職場訪問・自宅押しかけ等" pos=left'
      ].join('\n')
    }
  ];

  global.RelaGrid = global.RelaGrid || {};
  global.RelaGrid.samples = SAMPLES;
})(window);
