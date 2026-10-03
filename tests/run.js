/* RelaGrid regression tests: parser / serializer / model helpers.
 * Usage: node tests/run.js   (no dependencies; exits non-zero on failure) */
'use strict';
var path = require('path');
var assert = require('assert');

global.window = global;
global.RelaGrid = {};
['icons', 'colors', 'model', 'parser', 'serializer', 'samples'].forEach(function (f) {
  require(path.join(__dirname, '..', 'js', f + '.js'));
});
var RG = global.RelaGrid;
var BS = String.fromCharCode(92);   // 1文字のバックスラッシュ

var failed = 0;
function test(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + e.message); }
}
function errors(dsl) { return RG.parseDSL(dsl).errors.length; }
function warnings(dsl) { return RG.parseDSL(dsl).warnings; }

RG.samples.forEach(function (s) {
  test('sample "' + s.name + '": no errors/warnings, round-trips', function () {
    var r = RG.parseDSL(s.text);
    assert.strictEqual(r.errors.length, 0);
    assert.strictEqual(r.warnings.length, 0);
    var r2 = RG.parseDSL(RG.serializeModel(r.model));
    assert.strictEqual(r2.errors.length, 0);
    assert.deepStrictEqual(r2.model.nodes, r.model.nodes);
    assert.deepStrictEqual(r2.model.zones.map(function (z) { return z.range; }), r.model.zones.map(function (z) { return z.range; }));
    assert.deepStrictEqual(r2.model.notes.map(function (n) { return n.text; }), r.model.notes.map(function (n) { return n.text; }));
  });
});

test('backslash / quote / # in strings survive a round trip', function () {
  var m = RG.model.createDefaultModel();
  m.title = 'x' + BS + ' "q" # y';
  m.nodes.push({ id: 'a', col: 1, row: 1, icon: 'box', size: 1, color: 'slate', label: 'C:' + BS });
  m.notes.push({ id: 'n', target: 'a', text: 'l1' + BS + 'nl2', pos: 'right' });
  var r = RG.parseDSL(RG.serializeModel(m));
  assert.strictEqual(r.errors.length, 0);
  assert.strictEqual(r.model.title, m.title);
  assert.strictEqual(r.model.nodes[0].label, 'C:' + BS);
  assert.strictEqual(r.model.notes[0].text, 'l1' + BS + 'nl2');
});

test('grid size limits', function () {
  assert.strictEqual(errors('grid 5000x5000'), 1);
  assert.strictEqual(errors('grid 0x3'), 1);
  assert.strictEqual(errors('grid 27x1'), 1);
  assert.strictEqual(errors('grid 26x30'), 0);
});

test('node id validation', function () {
  assert.strictEqual(errors('node a A1' + '\n' + 'node a B1'), 1);   // duplicate
  assert.strictEqual(errors('node grid A1'), 1);                    // reserved word
  assert.strictEqual(errors('node 1a A1'), 1);                      // leading digit
  assert.ok(RG.isValidId('n1') && RG.isValidId('_x-y'));
  assert.ok(!RG.isValidId('a b') && !RG.isValidId('x=1') && !RG.isValidId('->') && !RG.isValidId('node'));
});

test('warnings: shared cell, outside grid, unknown refs/values, self edge', function () {
  assert.strictEqual(warnings('node a A1\nnode b A1').length, 1);
  assert.strictEqual(warnings('grid 2x2\nnode a C1').length, 1);
  assert.strictEqual(warnings('node a A1\na -> zz').length, 1);
  assert.strictEqual(warnings('node a A1\na -> a').length, 1);
  var w = warnings('theme x\nnode a A1 icon=constructor color=zzz\nnode b B1\na -> b style=wavy color=a(b\nnote a "t" pos=up');
  assert.strictEqual(w.length, 6);
});

test('color / icon lookups ignore prototype properties', function () {
  assert.strictEqual(RG.normalizeColorName('constructor'), 'slate');
  assert.strictEqual(RG.normalizeColorName('a(b'), 'slate');
  assert.strictEqual(RG.normalizeColorName('blue'), 'blue');
  assert.strictEqual(RG.getColor('light', 'constructor'), RG.getColor('light', 'slate'));
});

test('nextElementId picks the first unused id', function () {
  var items = [{ id: 'edge1' }, { id: 'edge3' }];
  assert.strictEqual(RG.model.nextElementId(items, 'edge'), 'edge2');
  assert.strictEqual(RG.model.nextElementId([], 'note'), 'note1');
});

if (failed) { console.log('\n' + failed + ' test(s) failed'); process.exit(1); }
console.log('\nall tests passed');
