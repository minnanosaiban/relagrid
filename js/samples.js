/* RelaGrid: built-in sample diagrams shown in the "サンプル" dropdown. */
(function (global) {
  'use strict';

  var SAMPLES = [
    {
      name: '3層 Web アーキテクチャ',
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
    }
  ];

  global.RelaGrid = global.RelaGrid || {};
  global.RelaGrid.samples = SAMPLES;
})(window);
