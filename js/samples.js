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
        '# 所属はゾーン（会社の枠）で表し、線は事件の要所だけに絞る',
        'grid 6x4',
        'title "グループ会社内セクハラ・ストーカー事件と親会社の責任（最高裁 平成30年2月15日判決）"',
        'source "参考: 浜辺陽一郎「ハラスメントの内部通報に警鐘を鳴らす最高裁判決」Westlaw Japan 判例コラム 第132号（2018年5月7日）"',
        '',
        'zone D1:D2 "I社（親会社）" color=purple',
        'zone A2:C4 "T社（子会社）" color=blue',
        'zone E2:E4 "K社（子会社）" color=teal',
        '',
        'node i     D1 icon=box   size=1   color=purple "I社"',
        'node win   D2 icon=bell  size=1   color=purple "グループ相談窓口"',
        'node t     B2 icon=box   size=1   color=blue   "T社（Pの雇用主）"',
        'node g     A3 icon=user  size=1   color=slate  "G（係長）"',
        'node d     B3 icon=user  size=1   color=slate  "D（同僚）"',
        'node f     C3 icon=user  size=1   color=slate  "F（課長）"',
        'node p     B4 icon=user  size=1.1 color=orange "P（被害者・契約社員）"',
        'node k     E3 icon=box   size=1   color=teal   "K社（Aの雇用主）"',
        'node a     E4 icon=user  size=1.1 color=red    "A（加害者・課長）"',
        'node court F1 icon=file  size=1   color=slate  "最高裁 H30.2.15"',
        '',
        'i -> t "親子会社"',
        'i -> k "親子会社"',
        'a -> p "交際→破局後つきまとい" style=dashed color=red width=2',
        'p -> g "相談"',
        'p -> f "相談"',
        'd -> win "通報（2011.10）" style=dashed color=purple',
        'court -> i "責任否定" color=red',
        '',
        'note f "G・Fとも事実確認・対応せず" pos=right',
        'note a "職場訪問・自宅押しかけ\\n（2010.8〜2011.1）" pos=right',
        'note court "2014年 PがA・T社・K社・I社を提訴\\n親会社I社の信義則上の義務違反を否定\\n（通報時Pは既に退職）" pos=bottom'
      ].join('\n')
    }
  ];

  global.RelaGrid = global.RelaGrid || {};
  global.RelaGrid.samples = SAMPLES;
})(window);
