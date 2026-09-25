/* RelaGrid: application controller — wires DSL text, GUI canvas editing,
 * inspector panel, toolbar, undo/redo, storage and export together. */
(function (global) {
  'use strict';

  var RG = global.RelaGrid;
  var M = RG.model;
  var STORAGE_KEY = 'relagrid.dsl.v1';

  document.addEventListener('DOMContentLoaded', function () {
    var dslText = document.getElementById('dslText');
    var canvas = document.getElementById('canvas');
    var inspector = document.getElementById('inspector');
    var statusBar = document.getElementById('statusBar');
    var sampleSelect = document.getElementById('sampleSelect');
    var gridCols = document.getElementById('gridCols');
    var gridRows = document.getElementById('gridRows');
    var applyGridBtn = document.getElementById('applyGrid');
    var themeToggleBtn = document.getElementById('themeToggle');
    var undoBtn = document.getElementById('undoBtn');
    var redoBtn = document.getElementById('redoBtn');
    var showGridToggle = document.getElementById('showGridToggle');
    var zoomInBtn = document.getElementById('zoomIn');
    var zoomOutBtn = document.getElementById('zoomOut');
    var zoomResetBtn = document.getElementById('zoomReset');
    var zoomLabel = document.getElementById('zoomLabel');
    var newBtn = document.getElementById('newBtn');
    var exportSvgBtn = document.getElementById('exportSvgBtn');
    var exportPngBtn = document.getElementById('exportPngBtn');
    var exportPng169Btn = document.getElementById('exportPng169Btn');
    var exportJsonBtn = document.getElementById('exportJsonBtn');
    var exportDslBtn = document.getElementById('exportDslBtn');
    var importBtn = document.getElementById('importBtn');
    var importFile = document.getElementById('importFile');
    var helpBtn = document.getElementById('helpBtn');
    var helpPanel = document.getElementById('helpPanel');
    var toolButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tool]'));

    var state = {
      model: null,
      selection: null,
      tool: 'select',
      connectFrom: null,
      undoStack: [],
      redoStack: [],
      zoom: 1,
      showGrid: true,
      nodeDefaults: { icon: 'server', color: 'blue', size: 1, label: '' },
      edgeDefaults: { op: '->', style: 'solid', width: 1, color: 'slate', label: '' },
      zoneDefaults: { label: '', color: 'blue' },
      noteDefaults: { text: '', pos: 'right' }
    };

    // ---------- small DOM helper ----------
    function h(tag, attrs, children) {
      var e = document.createElement(tag);
      if (attrs) {
        for (var k in attrs) {
          if (k === 'text') e.textContent = attrs[k];
          else if (k === 'class') e.className = attrs[k];
          else if (k === 'html') e.innerHTML = attrs[k];
          else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
          else e.setAttribute(k, attrs[k]);
        }
      }
      (children || []).forEach(function (c) { if (c) e.appendChild(c); });
      return e;
    }

    // ---------- status bar ----------
    var statusTimer = null;
    function setStatus(msg, kind) {
      statusBar.textContent = msg || '';
      statusBar.className = 'status-bar' + (kind ? ' status-' + kind : '');
    }
    function flash(msg) {
      setStatus(msg, 'warn');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(function () { setStatus(''); }, 2200);
    }

    // ---------- persistence ----------
    var saveTimer = null;
    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try { localStorage.setItem(STORAGE_KEY, dslText.value); } catch (e) { /* ignore */ }
      }, 400);
    }

    // ---------- theme / zoom ----------
    function applyTheme() {
      document.body.classList.toggle('rg-dark', state.model.theme === 'dark');
      themeToggleBtn.textContent = state.model.theme === 'dark' ? '☀ ライト' : '☾ ダーク';
    }
    function applyZoom() {
      var svg = canvas.querySelector('svg');
      if (svg) {
        svg.style.transform = 'scale(' + state.zoom + ')';
        svg.style.transformOrigin = '0 0';
      }
      zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
    }

    // ---------- render ----------
    function renderCanvas() {
      RG.render(canvas, state.model, {
        showGrid: state.showGrid,
        selection: state.selection,
        connectFrom: state.connectFrom
      });
      applyZoom();
    }

    function pruneSelection() {
      if (!state.selection) return;
      var sel = state.selection, ok = false;
      if (sel.type === 'node') ok = !!M.findNode(state.model, sel.id);
      else if (sel.type === 'edge') ok = state.model.edges.some(function (e) { return e.id === sel.id; });
      else if (sel.type === 'zone') ok = state.model.zones.some(function (z) { return z.id === sel.id; });
      else if (sel.type === 'note') ok = state.model.notes.some(function (n) { return n.id === sel.id; });
      if (!ok) state.selection = null;
    }

    function commit(newModel, opts) {
      opts = opts || {};
      if (!opts.skipHistory) {
        state.undoStack.push(M.cloneModel(state.model));
        if (state.undoStack.length > 100) state.undoStack.shift();
        state.redoStack.length = 0;
      }
      state.model = newModel;
      if (opts.selection !== undefined) state.selection = opts.selection;
      pruneSelection();
      if (!opts.fromText) dslText.value = RG.serializeModel(state.model);
      applyTheme();
      renderCanvas();
      renderInspector();
      updateUndoRedoButtons();
      scheduleSave();
    }

    function updateUndoRedoButtons() {
      undoBtn.disabled = state.undoStack.length === 0;
      redoBtn.disabled = state.redoStack.length === 0;
    }

    function undo() {
      if (!state.undoStack.length) return;
      state.redoStack.push(M.cloneModel(state.model));
      state.model = state.undoStack.pop();
      pruneSelection();
      dslText.value = RG.serializeModel(state.model);
      applyTheme();
      renderCanvas();
      renderInspector();
      updateUndoRedoButtons();
      scheduleSave();
    }
    function redo() {
      if (!state.redoStack.length) return;
      state.undoStack.push(M.cloneModel(state.model));
      state.model = state.redoStack.pop();
      pruneSelection();
      dslText.value = RG.serializeModel(state.model);
      applyTheme();
      renderCanvas();
      renderInspector();
      updateUndoRedoButtons();
      scheduleSave();
    }

    function removeElement(model, type, id) {
      if (type === 'node') {
        model.nodes = model.nodes.filter(function (n) { return n.id !== id; });
        model.edges = model.edges.filter(function (e) { return e.from !== id && e.to !== id; });
        model.notes = model.notes.filter(function (n) { return n.target !== id; });
      } else if (type === 'edge') {
        model.edges = model.edges.filter(function (e) { return e.id !== id; });
      } else if (type === 'zone') {
        model.zones = model.zones.filter(function (z) { return z.id !== id; });
      } else if (type === 'note') {
        model.notes = model.notes.filter(function (n) { return n.id !== id; });
      }
    }

    function mutateNode(id, fn) {
      var newModel = M.cloneModel(state.model);
      var n = M.findNode(newModel, id);
      if (!n) return;
      fn(n);
      commit(newModel, { selection: { type: 'node', id: n.id } });
    }
    function mutateEdge(id, fn) {
      var newModel = M.cloneModel(state.model);
      var e = newModel.edges.filter(function (x) { return x.id === id; })[0];
      if (!e) return;
      fn(e);
      commit(newModel, { selection: { type: 'edge', id: id } });
    }
    function mutateZone(id, fn) {
      var newModel = M.cloneModel(state.model);
      var z = newModel.zones.filter(function (x) { return x.id === id; })[0];
      if (!z) return;
      fn(z);
      commit(newModel, { selection: { type: 'zone', id: id } });
    }
    function mutateNote(id, fn) {
      var newModel = M.cloneModel(state.model);
      var n = newModel.notes.filter(function (x) { return x.id === id; })[0];
      if (!n) return;
      fn(n);
      commit(newModel, { selection: { type: 'note', id: id } });
    }

    // ---------- text <-> model sync ----------
    var textDebounce = null;
    dslText.addEventListener('input', function () {
      clearTimeout(textDebounce);
      textDebounce = setTimeout(function () {
        var result = RG.parseDSL(dslText.value);
        if (result.errors.length) {
          setStatus('構文エラー ' + result.errors.length + '件: ' + result.errors[0].line + '行目 — ' + result.errors[0].message, 'error');
          return;
        }
        if (result.warnings.length) {
          setStatus('警告: ' + result.warnings[0], 'warn');
        } else {
          setStatus('');
        }
        commit(result.model, { fromText: true });
      }, 300);
    });

    // ---------- icon / color pickers ----------
    function buildIconPicker(selected, onPick) {
      var wrap = h('div', { class: 'icon-picker' });
      var search = h('input', { type: 'text', placeholder: 'アイコン検索…', class: 'icon-search' });
      var grid = h('div', { class: 'icon-grid' });
      function renderGrid(filter) {
        grid.innerHTML = '';
        RG.iconOrder.filter(function (name) { return !filter || name.indexOf(filter.toLowerCase()) !== -1; })
          .forEach(function (name) {
            var btn = h('button', {
              type: 'button', class: 'icon-btn' + (name === selected ? ' active' : ''), title: name,
              onclick: function () { onPick(name); }
            });
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('width', '20');
            svg.setAttribute('height', '20');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '1.8');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.innerHTML = RG.icons[name];
            btn.appendChild(svg);
            grid.appendChild(btn);
          });
      }
      renderGrid('');
      search.addEventListener('input', function () { renderGrid(search.value.trim()); });
      wrap.appendChild(search);
      wrap.appendChild(grid);
      return wrap;
    }

    function buildColorPicker(selected, onPick) {
      var wrap = h('div', { class: 'color-picker' });
      RG.colorNames.forEach(function (name) {
        var c = RG.getColor(state.model.theme, name);
        wrap.appendChild(h('button', {
          type: 'button', class: 'color-btn' + (name === selected ? ' active' : ''), title: name,
          style: 'background:' + c.stroke, onclick: function () { onPick(name); }
        }));
      });
      return wrap;
    }

    function buildNodeSelect(selectedId, onChange) {
      var sel = h('select', {});
      state.model.nodes.forEach(function (n) {
        var opt = h('option', { value: n.id, text: n.id + (n.label ? ' (' + n.label + ')' : '') });
        if (n.id === selectedId) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () { onChange(sel.value); });
      return sel;
    }

    function field(labelText, inputEl) {
      var wrap = h('div', { class: 'field' });
      wrap.appendChild(h('label', { text: labelText }));
      wrap.appendChild(inputEl);
      return wrap;
    }

    // ---------- inspector: edit forms for existing elements ----------
    function buildNodeEditor(node) {
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ノード — ' + node.id }));

      var idInput = h('input', { type: 'text', value: node.id });
      idInput.addEventListener('change', function () {
        var newId = idInput.value.trim();
        if (!newId || newId === node.id) { idInput.value = node.id; return; }
        if (M.findNode(state.model, newId)) { flash('同じIDのノードが既にあります'); idInput.value = node.id; return; }
        var newModel = M.cloneModel(state.model);
        var n = M.findNode(newModel, node.id);
        n.id = newId;
        newModel.edges.forEach(function (e) { if (e.from === node.id) e.from = newId; if (e.to === node.id) e.to = newId; });
        newModel.notes.forEach(function (nt) { if (nt.target === node.id) nt.target = newId; });
        commit(newModel, { selection: { type: 'node', id: newId } });
      });
      box.appendChild(field('ID', idInput));

      var labelInput = h('input', { type: 'text', value: node.label });
      labelInput.addEventListener('change', function () { mutateNode(node.id, function (n) { n.label = labelInput.value; }); });
      box.appendChild(field('ラベル', labelInput));

      box.appendChild(field('アイコン', buildIconPicker(node.icon, function (name) { mutateNode(node.id, function (n) { n.icon = name; }); })));
      box.appendChild(field('カラー', buildColorPicker(node.color, function (name) { mutateNode(node.id, function (n) { n.color = name; }); })));

      var sizeInput = h('input', { type: 'range', min: '0.6', max: '2', step: '0.1', value: String(node.size || 1) });
      sizeInput.addEventListener('input', function () { mutateNode(node.id, function (n) { n.size = parseFloat(sizeInput.value); }); });
      box.appendChild(field('サイズ (' + (node.size || 1) + ')', sizeInput));

      var colInput = h('input', { type: 'number', min: '1', max: String(state.model.grid.cols), value: String(node.col) });
      var rowInput = h('input', { type: 'number', min: '1', max: String(state.model.grid.rows), value: String(node.row) });
      function applyPos() {
        var c = parseInt(colInput.value, 10), r = parseInt(rowInput.value, 10);
        if (!c || !r) return;
        var occ = M.nodeAt(state.model, c, r);
        if (occ && occ.id !== node.id) { flash('そのマスは使用中です'); colInput.value = node.col; rowInput.value = node.row; return; }
        mutateNode(node.id, function (n) { n.col = c; n.row = r; });
      }
      colInput.addEventListener('change', applyPos);
      rowInput.addEventListener('change', applyPos);
      var posRow = h('div', { class: 'pos-row' }, [colInput, rowInput]);
      box.appendChild(field('位置 (列, 行)', posRow));

      box.appendChild(h('button', {
        type: 'button', class: 'danger-btn', text: 'このノードを削除', onclick: function () {
          var newModel = M.cloneModel(state.model);
          removeElement(newModel, 'node', node.id);
          commit(newModel, { selection: null });
        }
      }));
      return box;
    }

    function buildEdgeEditor(edge) {
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: '接続 — ' + edge.from + ' → ' + edge.to }));

      box.appendChild(field('起点', buildNodeSelect(edge.from, function (v) { mutateEdge(edge.id, function (e) { e.from = v; }); })));
      box.appendChild(field('終点', buildNodeSelect(edge.to, function (v) { mutateEdge(edge.id, function (e) { e.to = v; }); })));

      var opSel = h('select', {});
      RG.EDGE_OPS.forEach(function (op) {
        var labelMap = { '->': '→ 単方向', '<-': '← 単方向', '<->': '↔ 双方向', '--': '― 矢印なし' };
        var opt = h('option', { value: op, text: labelMap[op] });
        if (op === edge.op) opt.selected = true;
        opSel.appendChild(opt);
      });
      opSel.addEventListener('change', function () { mutateEdge(edge.id, function (e) { e.op = opSel.value; }); });
      box.appendChild(field('矢印の向き', opSel));

      var labelInput = h('input', { type: 'text', value: edge.label });
      labelInput.addEventListener('change', function () { mutateEdge(edge.id, function (e) { e.label = labelInput.value; }); });
      box.appendChild(field('ラベル', labelInput));

      var styleSel = h('select', {}, [
        h('option', { value: 'solid', text: '実線' }),
        h('option', { value: 'dashed', text: '破線' })
      ]);
      styleSel.value = edge.style;
      styleSel.addEventListener('change', function () { mutateEdge(edge.id, function (e) { e.style = styleSel.value; }); });
      box.appendChild(field('線種', styleSel));

      var widthInput = h('input', { type: 'range', min: '1', max: '4', step: '0.5', value: String(edge.width || 1) });
      widthInput.addEventListener('input', function () { mutateEdge(edge.id, function (e) { e.width = parseFloat(widthInput.value); }); });
      box.appendChild(field('太さ (' + (edge.width || 1) + ')', widthInput));

      box.appendChild(field('カラー', buildColorPicker(edge.color, function (name) { mutateEdge(edge.id, function (e) { e.color = name; }); })));

      box.appendChild(h('button', {
        type: 'button', class: 'danger-btn', text: 'この接続を削除', onclick: function () {
          var newModel = M.cloneModel(state.model);
          removeElement(newModel, 'edge', edge.id);
          commit(newModel, { selection: null });
        }
      }));
      return box;
    }

    function buildZoneEditor(zone) {
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ゾーン — ' + (zone.label || zone.id) }));

      var labelInput = h('input', { type: 'text', value: zone.label });
      labelInput.addEventListener('change', function () { mutateZone(zone.id, function (z) { z.label = labelInput.value; }); });
      box.appendChild(field('ラベル', labelInput));

      box.appendChild(field('カラー', buildColorPicker(zone.color, function (name) { mutateZone(zone.id, function (z) { z.color = name; }); })));
      box.appendChild(h('p', { class: 'hint', text: '範囲: ' + M.formatRange(zone.range) }));

      box.appendChild(h('button', {
        type: 'button', class: 'danger-btn', text: 'このゾーンを削除', onclick: function () {
          var newModel = M.cloneModel(state.model);
          removeElement(newModel, 'zone', zone.id);
          commit(newModel, { selection: null });
        }
      }));
      return box;
    }

    function noteTextToEditable(t) { return String(t || '').split('\\n').join('\n'); }
    function noteTextFromEditable(t) { return String(t || '').split('\n').join('\\n'); }

    function buildNoteEditor(note) {
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ノート — ' + note.target + ' 宛て' }));

      var textArea = h('textarea', { rows: 3 });
      textArea.value = noteTextToEditable(note.text);
      textArea.addEventListener('change', function () { mutateNote(note.id, function (n) { n.text = noteTextFromEditable(textArea.value); }); });
      box.appendChild(field('本文', textArea));

      var posSel = h('select', {}, [
        h('option', { value: 'top', text: '上' }),
        h('option', { value: 'bottom', text: '下' }),
        h('option', { value: 'left', text: '左' }),
        h('option', { value: 'right', text: '右' })
      ]);
      posSel.value = note.pos;
      posSel.addEventListener('change', function () { mutateNote(note.id, function (n) { n.pos = posSel.value; }); });
      box.appendChild(field('向き', posSel));

      box.appendChild(h('button', {
        type: 'button', class: 'danger-btn', text: 'このノートを削除', onclick: function () {
          var newModel = M.cloneModel(state.model);
          removeElement(newModel, 'note', note.id);
          commit(newModel, { selection: null });
        }
      }));
      return box;
    }

    // ---------- inspector: "next item" default forms per tool ----------
    function buildNodeDefaultsForm() {
      var d = state.nodeDefaults;
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ノードを追加' }));
      box.appendChild(h('p', { class: 'hint', text: '空いているマスをクリックすると、この設定でノードを配置します。' }));

      var labelInput = h('input', { type: 'text', value: d.label, placeholder: '(空欄なら自動ID)' });
      labelInput.addEventListener('input', function () { d.label = labelInput.value; });
      box.appendChild(field('ラベル', labelInput));

      box.appendChild(field('アイコン', buildIconPicker(d.icon, function (name) { d.icon = name; renderInspector(); })));
      box.appendChild(field('カラー', buildColorPicker(d.color, function (name) { d.color = name; renderInspector(); })));

      var sizeInput = h('input', { type: 'range', min: '0.6', max: '2', step: '0.1', value: String(d.size) });
      sizeInput.addEventListener('input', function () { d.size = parseFloat(sizeInput.value); });
      box.appendChild(field('サイズ', sizeInput));
      return box;
    }

    function buildEdgeDefaultsForm() {
      var d = state.edgeDefaults;
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: '接続を作成' }));
      box.appendChild(h('p', {
        class: 'hint',
        text: state.connectFrom ? ('起点: ' + state.connectFrom + ' — 終点のノードをクリックしてください（Escで取消）') : 'ノードをクリックして起点を選び、続けて終点のノードをクリックします。'
      }));

      var opSel = h('select', {}, RG.EDGE_OPS.map(function (op) {
        var labelMap = { '->': '→ 単方向', '<-': '← 単方向', '<->': '↔ 双方向', '--': '― 矢印なし' };
        var opt = h('option', { value: op, text: labelMap[op] });
        if (op === d.op) opt.selected = true;
        return opt;
      }));
      opSel.addEventListener('change', function () { d.op = opSel.value; });
      box.appendChild(field('矢印の向き', opSel));

      var labelInput = h('input', { type: 'text', value: d.label });
      labelInput.addEventListener('input', function () { d.label = labelInput.value; });
      box.appendChild(field('ラベル', labelInput));

      var styleSel = h('select', {}, [
        h('option', { value: 'solid', text: '実線' }),
        h('option', { value: 'dashed', text: '破線' })
      ]);
      styleSel.value = d.style;
      styleSel.addEventListener('change', function () { d.style = styleSel.value; });
      box.appendChild(field('線種', styleSel));

      box.appendChild(field('カラー', buildColorPicker(d.color, function (name) { d.color = name; renderInspector(); })));
      return box;
    }

    function buildZoneDefaultsForm() {
      var d = state.zoneDefaults;
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ゾーンを追加' }));
      box.appendChild(h('p', { class: 'hint', text: 'マスをドラッグして範囲を選択すると、この設定でゾーンを作成します。' }));

      var labelInput = h('input', { type: 'text', value: d.label });
      labelInput.addEventListener('input', function () { d.label = labelInput.value; });
      box.appendChild(field('ラベル', labelInput));
      box.appendChild(field('カラー', buildColorPicker(d.color, function (name) { d.color = name; renderInspector(); })));
      return box;
    }

    function buildNoteDefaultsForm() {
      var d = state.noteDefaults;
      var box = h('div', { class: 'inspector-form' });
      box.appendChild(h('h3', { text: 'ノートを追加' }));
      box.appendChild(h('p', { class: 'hint', text: 'ノードをクリックすると、この内容のノートを付けます。' }));

      var textArea = h('textarea', { rows: 3 });
      textArea.value = d.text;
      textArea.addEventListener('input', function () { d.text = textArea.value; });
      box.appendChild(field('本文', textArea));

      var posSel = h('select', {}, [
        h('option', { value: 'top', text: '上' }),
        h('option', { value: 'bottom', text: '下' }),
        h('option', { value: 'left', text: '左' }),
        h('option', { value: 'right', text: '右' })
      ]);
      posSel.value = d.pos;
      posSel.addEventListener('change', function () { d.pos = posSel.value; });
      box.appendChild(field('向き', posSel));
      return box;
    }

    function renderInspector() {
      inspector.innerHTML = '';
      var sel = state.selection;
      if (sel) {
        if (sel.type === 'node') { var n = M.findNode(state.model, sel.id); if (n) return inspector.appendChild(buildNodeEditor(n)); }
        else if (sel.type === 'edge') { var e = state.model.edges.filter(function (x) { return x.id === sel.id; })[0]; if (e) return inspector.appendChild(buildEdgeEditor(e)); }
        else if (sel.type === 'zone') { var z = state.model.zones.filter(function (x) { return x.id === sel.id; })[0]; if (z) return inspector.appendChild(buildZoneEditor(z)); }
        else if (sel.type === 'note') { var nt = state.model.notes.filter(function (x) { return x.id === sel.id; })[0]; if (nt) return inspector.appendChild(buildNoteEditor(nt)); }
      }
      if (state.tool === 'add-node') inspector.appendChild(buildNodeDefaultsForm());
      else if (state.tool === 'connect') inspector.appendChild(buildEdgeDefaultsForm());
      else if (state.tool === 'zone') inspector.appendChild(buildZoneDefaultsForm());
      else if (state.tool === 'note') inspector.appendChild(buildNoteDefaultsForm());
      else inspector.appendChild(h('p', { class: 'hint', text: 'ノード・接続・ゾーン・ノートをクリックすると、ここで編集できます。' }));
    }

    // ---------- canvas pointer interactions ----------
    function svgPoint(evt) {
      var svg = canvas.querySelector('svg');
      if (!svg) return { x: 0, y: 0 };
      var pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      var ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      var loc = pt.matrixTransform(ctm.inverse());
      return { x: loc.x, y: loc.y };
    }

    function showCellHighlight(col, row, ok) {
      var svg = canvas.querySelector('svg');
      var hl = svg && svg.getElementById('rg-cell-highlight');
      if (!hl) return;
      var layout = RG.computeLayout(state.model);
      var tl = layout.cellTopLeft(col, row);
      hl.setAttribute('x', tl.x + 4);
      hl.setAttribute('y', tl.y + 4);
      hl.setAttribute('stroke', ok ? '#16a34a' : '#dc2626');
      hl.style.display = '';
    }
    function hideCellHighlight() {
      var svg = canvas.querySelector('svg');
      var hl = svg && svg.getElementById('rg-cell-highlight');
      if (hl) hl.style.display = 'none';
    }
    function updateZonePreview(anchor, current) {
      var svg = canvas.querySelector('svg');
      var prev = svg && svg.getElementById('rg-zone-preview');
      if (!prev) return;
      var layout = RG.computeLayout(state.model);
      var c1 = Math.min(anchor.col, current.col), c2 = Math.max(anchor.col, current.col);
      var r1 = Math.min(anchor.row, current.row), r2 = Math.max(anchor.row, current.row);
      var tl = layout.cellTopLeft(c1, r1), br = layout.cellTopLeft(c2 + 1, r2 + 1);
      prev.setAttribute('x', tl.x + 10);
      prev.setAttribute('y', tl.y + 10);
      prev.setAttribute('width', Math.max(0, br.x - tl.x - 20));
      prev.setAttribute('height', Math.max(0, br.y - tl.y - 20));
      prev.style.display = '';
    }
    function hideZonePreview() {
      var svg = canvas.querySelector('svg');
      var prev = svg && svg.getElementById('rg-zone-preview');
      if (prev) prev.style.display = 'none';
    }

    function isCellFree(col, row, excludeId) {
      var occ = M.nodeAt(state.model, col, row);
      return !occ || occ.id === excludeId;
    }

    function tryAddNode(col, row) {
      if (!isCellFree(col, row, null)) { flash('そのマスには既にノードがあります'); return; }
      var d = state.nodeDefaults;
      var newModel = M.cloneModel(state.model);
      var id = M.nextId(newModel, 'n');
      newModel.nodes.push({ id: id, col: col, row: row, icon: d.icon, size: d.size, color: d.color, label: d.label || id });
      commit(newModel, { selection: { type: 'node', id: id } });
    }

    function handleConnectClick(nodeId) {
      if (!state.connectFrom) {
        state.connectFrom = nodeId;
        renderCanvas();
        renderInspector();
        return;
      }
      if (state.connectFrom === nodeId) {
        state.connectFrom = null;
        renderCanvas();
        renderInspector();
        return;
      }
      var d = state.edgeDefaults;
      var newModel = M.cloneModel(state.model);
      var id = 'edge' + (newModel.edges.length + 1) + '_' + Date.now().toString(36);
      newModel.edges.push({ id: id, from: state.connectFrom, to: nodeId, op: d.op, label: d.label, style: d.style, width: d.width, color: d.color });
      state.connectFrom = null;
      commit(newModel, { selection: { type: 'edge', id: id } });
    }

    function tryAddNote(nodeId) {
      var d = state.noteDefaults;
      var newModel = M.cloneModel(state.model);
      var id = 'note' + (newModel.notes.length + 1) + '_' + Date.now().toString(36);
      newModel.notes.push({ id: id, target: nodeId, text: d.text, pos: d.pos });
      commit(newModel, { selection: { type: 'note', id: id } });
    }

    var dragState = null;
    var zoneDragState = null;

    canvas.addEventListener('pointerdown', function (evt) {
      var targetEl = evt.target.closest && evt.target.closest('[data-kind]');
      var kind = targetEl && targetEl.getAttribute('data-kind');
      var id = targetEl && targetEl.getAttribute('data-id');

      if (state.tool === 'select') {
        if (kind === 'node') {
          dragState = { id: id, startX: evt.clientX, startY: evt.clientY, moved: false, targetCell: null };
          try { canvas.setPointerCapture(evt.pointerId); } catch (e) { /* no active pointer, ignore */ }
        } else if (kind === 'edge' || kind === 'zone' || kind === 'note') {
          state.selection = { type: kind, id: id };
          renderCanvas();
          renderInspector();
        } else {
          state.selection = null;
          renderCanvas();
          renderInspector();
        }
      } else if (state.tool === 'add-node') {
        if (kind === 'cell') tryAddNode(parseInt(targetEl.getAttribute('data-col'), 10), parseInt(targetEl.getAttribute('data-row'), 10));
        else if (kind === 'node') flash('そのマスには既にノードがあります');
      } else if (state.tool === 'connect') {
        if (kind === 'node') handleConnectClick(id);
      } else if (state.tool === 'zone') {
        var zoneCell = null;
        if (kind === 'cell') zoneCell = { col: parseInt(targetEl.getAttribute('data-col'), 10), row: parseInt(targetEl.getAttribute('data-row'), 10) };
        else if (kind === 'node') { var nd = M.findNode(state.model, id); if (nd) zoneCell = { col: nd.col, row: nd.row }; }
        if (zoneCell) {
          zoneDragState = { anchor: zoneCell, current: zoneCell };
          try { canvas.setPointerCapture(evt.pointerId); } catch (e) { /* no active pointer, ignore */ }
          updateZonePreview(zoneDragState.anchor, zoneDragState.current);
        }
      } else if (state.tool === 'note') {
        if (kind === 'node') tryAddNote(id);
      }
    });

    canvas.addEventListener('pointermove', function (evt) {
      if (dragState) {
        var dx = evt.clientX - dragState.startX, dy = evt.clientY - dragState.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.moved = true;
        if (dragState.moved) {
          var pt = svgPoint(evt);
          var layout = RG.computeLayout(state.model);
          var cell = layout.pointToCell(pt.x, pt.y);
          dragState.targetCell = cell;
          showCellHighlight(cell.col, cell.row, isCellFree(cell.col, cell.row, dragState.id));
        }
      } else if (zoneDragState) {
        var pt2 = svgPoint(evt);
        var layout2 = RG.computeLayout(state.model);
        var cell2 = layout2.pointToCell(pt2.x, pt2.y);
        zoneDragState.current = cell2;
        updateZonePreview(zoneDragState.anchor, cell2);
      }
    });

    canvas.addEventListener('pointerup', function () {
      if (dragState) {
        if (dragState.moved && dragState.targetCell) {
          if (isCellFree(dragState.targetCell.col, dragState.targetCell.row, dragState.id)) {
            var newModel = M.cloneModel(state.model);
            var n = M.findNode(newModel, dragState.id);
            n.col = dragState.targetCell.col;
            n.row = dragState.targetCell.row;
            commit(newModel, { selection: { type: 'node', id: dragState.id } });
          } else {
            flash('移動先のマスは空いていません');
          }
        } else if (!dragState.moved) {
          state.selection = { type: 'node', id: dragState.id };
          renderCanvas();
          renderInspector();
        }
        hideCellHighlight();
        dragState = null;
      } else if (zoneDragState) {
        var d = state.zoneDefaults;
        var c1 = Math.min(zoneDragState.anchor.col, zoneDragState.current.col);
        var c2 = Math.max(zoneDragState.anchor.col, zoneDragState.current.col);
        var r1 = Math.min(zoneDragState.anchor.row, zoneDragState.current.row);
        var r2 = Math.max(zoneDragState.anchor.row, zoneDragState.current.row);
        var newModel2 = M.cloneModel(state.model);
        var id = 'zone' + (newModel2.zones.length + 1) + '_' + Date.now().toString(36);
        newModel2.zones.push({ id: id, range: { c1: c1, r1: r1, c2: c2, r2: r2 }, label: d.label, color: d.color });
        commit(newModel2, { selection: { type: 'zone', id: id } });
        zoneDragState = null;
        hideZonePreview();
      }
    });

    // ---------- toolbar: tool switch ----------
    function setTool(tool) {
      state.tool = tool;
      state.connectFrom = null;
      state.selection = null;
      toolButtons.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tool') === tool); });
      canvas.className = 'canvas-viewport tool-' + tool;
      renderCanvas();
      renderInspector();
    }
    toolButtons.forEach(function (b) { b.addEventListener('click', function () { setTool(b.getAttribute('data-tool')); }); });

    // ---------- toolbar: grid size ----------
    applyGridBtn.addEventListener('click', function () {
      var cols = Math.max(1, Math.min(26, parseInt(gridCols.value, 10) || state.model.grid.cols));
      var rows = Math.max(1, Math.min(30, parseInt(gridRows.value, 10) || state.model.grid.rows));
      var newModel = M.cloneModel(state.model);
      var outNodes = newModel.nodes.filter(function (n) { return n.col > cols || n.row > rows; });
      var outZones = newModel.zones.filter(function (z) { return z.range.c2 > cols || z.range.r2 > rows; });
      if ((outNodes.length || outZones.length) &&
        !confirm('グリッドを縮小すると範囲外の要素（ノード' + outNodes.length + '件・ゾーン' + outZones.length + '件）が削除されます。続行しますか？')) {
        return;
      }
      newModel.nodes = newModel.nodes.filter(function (n) { return n.col <= cols && n.row <= rows; });
      newModel.zones = newModel.zones.filter(function (z) { return z.range.c2 <= cols && z.range.r2 <= rows; });
      var remaining = {}; newModel.nodes.forEach(function (n) { remaining[n.id] = true; });
      newModel.edges = newModel.edges.filter(function (e) { return remaining[e.from] && remaining[e.to]; });
      newModel.notes = newModel.notes.filter(function (n) { return remaining[n.target]; });
      newModel.grid = { cols: cols, rows: rows };
      commit(newModel, { selection: null });
    });

    // ---------- toolbar: theme / grid guide / zoom ----------
    themeToggleBtn.addEventListener('click', function () {
      var newModel = M.cloneModel(state.model);
      newModel.theme = newModel.theme === 'dark' ? 'light' : 'dark';
      commit(newModel, {});
    });
    showGridToggle.addEventListener('change', function () {
      state.showGrid = showGridToggle.checked;
      renderCanvas();
    });
    zoomInBtn.addEventListener('click', function () { state.zoom = Math.min(2.5, state.zoom + 0.15); applyZoom(); });
    zoomOutBtn.addEventListener('click', function () { state.zoom = Math.max(0.3, state.zoom - 0.15); applyZoom(); });
    zoomResetBtn.addEventListener('click', function () { state.zoom = 1; applyZoom(); });

    // ---------- toolbar: undo/redo ----------
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // ---------- toolbar: new / samples ----------
    newBtn.addEventListener('click', function () {
      if (!confirm('現在の図を破棄して新規作成しますか？')) return;
      commit(M.createDefaultModel(), { selection: null });
    });
    (function populateSamples() {
      var groups = {};
      var order = [];
      RG.samples.forEach(function (s, i) {
        var cat = s.category || 'その他';
        if (!groups[cat]) { groups[cat] = []; order.push(cat); }
        groups[cat].push(i);
      });
      order.forEach(function (cat) {
        var optgroup = h('optgroup', { label: cat });
        groups[cat].forEach(function (i) {
          optgroup.appendChild(h('option', { value: String(i), text: RG.samples[i].name }));
        });
        sampleSelect.appendChild(optgroup);
      });
    })();
    sampleSelect.value = '';
    sampleSelect.addEventListener('change', function () {
      if (sampleSelect.value === '') return;
      if (!confirm('現在の図を破棄してサンプルを読み込みますか？')) { sampleSelect.value = ''; return; }
      var sample = RG.samples[parseInt(sampleSelect.value, 10)];
      var result = RG.parseDSL(sample.text);
      dslText.value = sample.text;
      commit(result.model, { fromText: true, selection: null });
      sampleSelect.value = '';
    });

    // ---------- export ----------
    function downloadBlob(filename, blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function getCleanSvgString() {
      var svg = canvas.querySelector('svg');
      var clone = svg.cloneNode(true);
      clone.style.transform = '';
      var hl = clone.getElementById('rg-cell-highlight'); if (hl) hl.parentNode.removeChild(hl);
      var zp = clone.getElementById('rg-zone-preview'); if (zp) zp.parentNode.removeChild(zp);
      var cells = clone.querySelector('.rg-cells'); if (cells) cells.parentNode.removeChild(cells);
      var gridLayer = clone.querySelector('.rg-grid'); if (gridLayer) gridLayer.parentNode.removeChild(gridLayer);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      return new XMLSerializer().serializeToString(clone);
    }

    exportSvgBtn.addEventListener('click', function () {
      var svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + getCleanSvgString();
      downloadBlob('diagram.svg', new Blob([svgStr], { type: 'image/svg+xml' }));
    });

    // aspect (e.g. 16/9) pads the canvas with background so the diagram is
    // centered in a frame of that ratio; null keeps the diagram's own size.
    function exportPng(aspect, filename) {
      var svg = canvas.querySelector('svg');
      var width = parseFloat(svg.getAttribute('width'));
      var height = parseFloat(svg.getAttribute('height'));
      var frameW = width, frameH = height;
      if (aspect) {
        if (width / height < aspect) frameW = Math.round(height * aspect);
        else frameH = Math.round(width / aspect);
      }
      var scale = 2;
      var svgStr = getCleanSvgString();
      var img = new Image();
      var svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(svgBlob);
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = frameW * scale; c.height = frameH * scale;
        var ctx = c.getContext('2d');
        ctx.fillStyle = RG.getThemeBase(state.model.theme).bg;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, (frameW - width) / 2 * scale, (frameH - height) / 2 * scale, width * scale, height * scale);
        URL.revokeObjectURL(url);
        c.toBlob(function (blob) { downloadBlob(filename, blob); });
      };
      img.onerror = function () { URL.revokeObjectURL(url); flash('PNG書き出しに失敗しました'); };
      img.src = url;
    }
    exportPngBtn.addEventListener('click', function () { exportPng(null, 'diagram.png'); });
    exportPng169Btn.addEventListener('click', function () { exportPng(16 / 9, 'diagram-16x9.png'); });

    exportJsonBtn.addEventListener('click', function () {
      downloadBlob('diagram.json', new Blob([JSON.stringify(state.model, null, 2)], { type: 'application/json' }));
    });
    exportDslBtn.addEventListener('click', function () {
      downloadBlob('diagram.txt', new Blob([dslText.value], { type: 'text/plain' }));
    });

    // ---------- import ----------
    importBtn.addEventListener('click', function () { importFile.click(); });
    importFile.addEventListener('change', function () {
      var file = importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result);
        if (/\.json$/i.test(file.name)) {
          try {
            var obj = JSON.parse(text);
            if (!obj.grid || !obj.nodes) throw new Error('shape mismatch');
            var loaded = M.createDefaultModel();
            Object.assign(loaded, obj);
            dslText.value = RG.serializeModel(loaded);
            commit(loaded, { selection: null });
          } catch (e) { flash('JSONの読み込みに失敗しました'); }
        } else {
          var result = RG.parseDSL(text);
          if (result.errors.length) { flash('読み込んだファイルに構文エラーがあります (' + result.errors[0].line + '行目)'); return; }
          dslText.value = text;
          commit(result.model, { fromText: true, selection: null });
        }
        importFile.value = '';
      };
      reader.readAsText(file);
    });

    // ---------- help panel ----------
    helpBtn.addEventListener('click', function () {
      helpPanel.style.display = helpPanel.style.display === 'none' ? '' : 'none';
    });

    // ---------- keyboard shortcuts ----------
    document.addEventListener('keydown', function (evt) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (evt.key === 'Escape') {
        if (state.connectFrom) { state.connectFrom = null; renderCanvas(); renderInspector(); }
        else if (state.selection) { state.selection = null; renderCanvas(); renderInspector(); }
        return;
      }
      if (inField) return;
      if ((evt.key === 'Delete' || evt.key === 'Backspace') && state.selection) {
        evt.preventDefault();
        var newModel = M.cloneModel(state.model);
        removeElement(newModel, state.selection.type, state.selection.id);
        commit(newModel, { selection: null });
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'z') {
        evt.preventDefault();
        if (evt.shiftKey) redo(); else undo();
      } else if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'y') {
        evt.preventDefault();
        redo();
      }
    });

    // ---------- boot ----------
    var initialText = null;
    try { initialText = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (!initialText) initialText = RG.samples[0].text;
    var initialResult = RG.parseDSL(initialText);
    state.model = initialResult.errors.length ? M.createDefaultModel() : initialResult.model;
    dslText.value = initialText;

    applyTheme();
    setTool('select');
    renderCanvas();
    renderInspector();
    updateUndoRedoButtons();
  });
})(window);
