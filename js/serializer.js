/* RelaGrid: model -> canonical DSL text. */
(function (global) {
  'use strict';

  var M = global.RelaGrid.model;

  function esc(s) {
    return String(s == null ? '' : s).replace(/"/g, '\\"');
  }

  function serializeModel(model) {
    var lines = [];
    lines.push('grid ' + model.grid.cols + 'x' + model.grid.rows);
    if (model.theme && model.theme !== 'light') lines.push('theme ' + model.theme);
    if (model.title) lines.push('title "' + esc(model.title) + '"');
    if (model.source) lines.push('source "' + esc(model.source) + '"');

    if (model.zones && model.zones.length) {
      lines.push('');
      model.zones.forEach(function (z) {
        lines.push('zone ' + M.formatRange(z.range) + ' "' + esc(z.label) + '" color=' + z.color);
      });
    }

    if (model.nodes && model.nodes.length) {
      lines.push('');
      model.nodes.forEach(function (n) {
        lines.push('node ' + n.id + ' ' + M.formatGridRef(n.col, n.row) +
          ' icon=' + n.icon + ' size=' + n.size + ' color=' + n.color + ' "' + esc(n.label) + '"');
      });
    }

    if (model.edges && model.edges.length) {
      lines.push('');
      model.edges.forEach(function (e) {
        lines.push(e.from + ' ' + e.op + ' ' + e.to + ' "' + esc(e.label) + '" style=' + e.style +
          ' width=' + e.width + ' color=' + e.color);
      });
    }

    if (model.notes && model.notes.length) {
      lines.push('');
      model.notes.forEach(function (n) {
        lines.push('note ' + n.target + ' "' + esc(n.text) + '" pos=' + n.pos);
      });
    }

    return lines.join('\n').trim() + '\n';
  }

  global.RelaGrid = global.RelaGrid || {};
  global.RelaGrid.serializeModel = serializeModel;
})(window);
