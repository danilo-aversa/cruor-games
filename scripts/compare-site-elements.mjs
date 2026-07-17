#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_CONFIG_PATH = '.vscode/element-compare.presets.json';
const DEFAULT_OUTPUT_DIR = 'reports/element-comparison';

const STYLE_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'outline-width',
  'outline-style',
  'outline-color',
  'background-color',
  'background-image',
  'color',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'line-height',
  'text-align',
  'text-transform',
  'white-space',
  'overflow',
  'overflow-x',
  'overflow-y',
  'visibility',
  'pointer-events',
  'cursor',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'align-content',
  'justify-content',
  'justify-items',
  'gap',
  'row-gap',
  'column-gap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',
  'grid-template-columns',
  'grid-template-rows',
  'grid-auto-flow',
  'grid-auto-columns',
  'grid-auto-rows',
  'place-items',
  'transform',
  'transform-origin',
  'filter',
  'backdrop-filter',
  'box-shadow',
  'transition-property',
  'transition-duration'
];

const PSEUDO_PROPERTIES = [
  'content',
  'display',
  'position',
  'width',
  'height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'background-color',
  'color',
  'border-radius',
  'opacity',
  'transform'
];

const CRITICAL_STYLE_PROPERTIES = new Set([
  'display',
  'position',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'row-gap',
  'column-gap',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
  'grid-template-columns',
  'grid-template-rows',
  'overflow',
  'overflow-x',
  'overflow-y'
]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const eqIndex = token.indexOf('=');
    if (eqIndex !== -1) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      args[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }
  return args;
}

function formatUsage(presets = []) {
  const presetList = presets.length
    ? presets.map((preset) => `  - ${preset.id}: ${preset.name || preset.label || preset.id}`).join('\n')
    : '  No presets found.';

  return `Element Comparator — Actual vs Target\n\nUse this to answer: "I have this current Places element, and I want it to match this Monsters reference element. What differs?"\n\nUsage:\n  node scripts/compare-site-elements.mjs --preset <preset-id>\n\n  node scripts/compare-site-elements.mjs \\\n    --actual-html .vscode/element-snapshots/current-places.html \\\n    --actual-selector ".location-stage-progress-dock.location-stage-progress-dock--map" \\\n    --target-html .vscode/element-snapshots/reference-monsters.html \\\n    --target-selector ".monster-stage-progress-dock.monster-stage-progress-dock--frame" \\\n    --name "Stage Progress Dock"\n\nLegacy aliases also work: --html-a/--selector-a are Actual, --html-b/--selector-b are Target.\n\nOptions:\n  --config <path>        Presets JSON path. Default: ${DEFAULT_CONFIG_PATH}\n  --preset <id>         Use a preset from the config file.\n  --base-url <url>      Base URL for relative preset URLs/snapshots.\n  --out <path>          Output Markdown path. Default: ${DEFAULT_OUTPUT_DIR}/<timestamp>.md\n  --json-out <path>     Output JSON path. Default: same as Markdown with .json\n  --no-open-report      Do not print the full Markdown report to stdout.\n  --timeout <ms>        Selector timeout. Default: 10000\n  --wait <ms>           Extra wait after page load. Default: 250\n  --subtree-depth <n>   Descendant comparison depth. Default: 4\n  --width <px>          Viewport width override.\n  --height <px>         Viewport height override.\n\nAvailable presets:\n${presetList}\n`;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Could not read JSON file ${filePath}: ${error.message}`, { cause: error });
  }
}

function normalizePresetConfig(rawConfig) {
  if (!rawConfig) {
    return { baseUrl: 'http://localhost:5173', presets: [] };
  }

  if (Array.isArray(rawConfig)) {
    return { baseUrl: 'http://localhost:5173', presets: rawConfig };
  }

  return {
    baseUrl: rawConfig.baseUrl || 'http://localhost:5173',
    presets: Array.isArray(rawConfig.presets) ? rawConfig.presets : []
  };
}

function resolveUrl(value, baseUrl) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const normalizedBase = baseUrl || 'http://localhost:5173';
  return new URL(value, normalizedBase).toString();
}

function resolveComparison(args, config) {
  let comparison = {};
  if (args.preset) {
    const preset = config.presets.find((item) => item.id === args.preset || item.label === args.preset || item.name === args.preset);
    if (!preset) {
      throw new Error(`Preset not found: ${args.preset}`);
    }
    comparison = { ...preset };
  }

  const baseUrl = args['base-url'] || comparison.baseUrl || config.baseUrl || 'http://localhost:5173';
  comparison.name = args.name || comparison.name || comparison.label || comparison.id || 'Element Comparison';
  comparison.actualLabel = args['actual-label'] || comparison.actualLabel || comparison.actual_label || comparison.labelA || comparison.label_a || 'Actual / current Places element';
  comparison.targetLabel = args['target-label'] || comparison.targetLabel || comparison.target_label || comparison.labelB || comparison.label_b || 'Target / reference Monsters element';

  comparison.htmlA = args['actual-html'] || args['html-a'] || comparison.actualHtml || comparison.actual_html || comparison.htmlA || comparison.html_a || comparison.snapshotA || comparison.snapshot_a;
  comparison.htmlB = args['target-html'] || args['html-b'] || comparison.targetHtml || comparison.target_html || comparison.htmlB || comparison.html_b || comparison.snapshotB || comparison.snapshot_b;
  comparison.urlA = comparison.htmlA ? null : resolveUrl(args['actual-url'] || args['url-a'] || comparison.actualUrl || comparison.actual_url || comparison.urlA || comparison.url_a, baseUrl);
  comparison.selectorA = args['actual-selector'] || args['selector-a'] || comparison.actualSelector || comparison.actual_selector || comparison.selectorA || comparison.selector_a;
  comparison.urlB = comparison.htmlB ? null : resolveUrl(args['target-url'] || args['url-b'] || comparison.targetUrl || comparison.target_url || comparison.urlB || comparison.url_b, baseUrl);
  comparison.selectorB = args['target-selector'] || args['selector-b'] || comparison.targetSelector || comparison.target_selector || comparison.selectorB || comparison.selector_b;
  comparison.viewport = {
    width: Number(args.width || comparison.viewport?.width || 1440),
    height: Number(args.height || comparison.viewport?.height || 900)
  };
  comparison.timeout = Number(args.timeout || comparison.timeout || 10000);
  comparison.wait = Number(args.wait || comparison.wait || 250);
  comparison.subtreeDepth = Number(args['subtree-depth'] || comparison.subtreeDepth || comparison.subtree_depth || 4);
  comparison.baseUrl = baseUrl;

  if ((!comparison.urlA && !comparison.htmlA) || !comparison.selectorA || (!comparison.urlB && !comparison.htmlB) || !comparison.selectorB) {
    return null;
  }

  return comparison;
}

function slugify(value) {
  return String(value || 'element-comparison')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'element-comparison';
}

function timestampForFile() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function table(rows, headers) {
  if (!rows.length) return 'None.\n';
  const headerLine = `| ${headers.join(' | ')} |`;
  const divider = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map((cell) => escapeTableCell(cell)).join(' | ')} |`).join('\n');
  return `${headerLine}\n${divider}\n${body}\n`;
}

function escapeTableCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>');
}

function codeBlock(value, language = '') {
  return `\`\`\`${language}\n${String(value || '').trim()}\n\`\`\``;
}

function formatNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value ?? '');
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
}

function roundRect(rect) {
  const result = {};
  for (const [key, value] of Object.entries(rect || {})) {
    result[key] = typeof value === 'number' ? Number(value.toFixed(2)) : value;
  }
  return result;
}

function makeSignature(node, { includeClasses = true } = {}) {
  if (!node) return '';
  const id = node.id ? `#${node.id}` : '';
  const classes = includeClasses && node.classes?.length ? `.${node.classes.join('.')}` : '';
  return `${String(node.tag || '').toLowerCase()}${id}${classes}`;
}

function flattenShape(node, depth = 0, maxDepth = 4, options = {}) {
  if (!node || depth > maxDepth) return [];
  const own = `${'  '.repeat(depth)}${makeSignature(node, { includeClasses: options.includeClasses !== false })}`;
  const children = Array.isArray(node.children) ? node.children.flatMap((child) => flattenShape(child, depth + 1, maxDepth, options)) : [];
  return [own, ...children];
}

function flattenTagShape(node, depth = 0, maxDepth = 4) {
  if (!node || depth > maxDepth) return [];
  const tag = String(node.tag || '').toLowerCase();
  const own = `${'  '.repeat(depth)}${tag || '(unknown)'}`;
  const children = Array.isArray(node.children) ? node.children.flatMap((child) => flattenTagShape(child, depth + 1, maxDepth)) : [];
  return [own, ...children];
}

function flattenTreeNodes(node, pathParts = [], depth = 0, maxDepth = 4) {
  if (!node || depth > maxDepth) return [];
  const pathLabel = pathParts.length ? pathParts.join('.') : 'root';
  const own = {
    path: pathLabel,
    depth,
    tag: String(node.tag || '').toLowerCase(),
    id: node.id || '',
    classes: Array.isArray(node.classes) ? node.classes : [],
    signature: makeSignature(node),
    structuralSignature: makeSignature(node, { includeClasses: false }),
    childElementCount: node.childElementCount || 0
  };
  const children = Array.isArray(node.children)
    ? node.children.flatMap((child, index) => flattenTreeNodes(child, [...pathParts, index], depth + 1, maxDepth))
    : [];
  return [own, ...children];
}

function indexByPath(nodes) {
  const map = new Map();
  for (const node of nodes || []) map.set(node.path, node);
  return map;
}

function classListLabel(classes) {
  return Array.isArray(classes) && classes.length ? classes.map((item) => `.${item}`).join(' ') : '(none)';
}

function compareClassLists(classesA, classesB) {
  const a = Array.isArray(classesA) ? classesA : [];
  const b = Array.isArray(classesB) ? classesB : [];
  return {
    actualOnly: differenceOnlyA(a, b),
    targetOnly: differenceOnlyA(b, a),
    shared: a.filter((value) => b.includes(value)),
    equivalent: a.join(' ') === b.join(' ')
  };
}

function differenceOnlyA(valuesA, valuesB) {
  const setB = new Set(valuesB);
  return valuesA.filter((value) => !setB.has(value));
}

function isEquivalentValue(a, b, prop) {
  if (a === b) return true;
  const pxA = parsePx(a);
  const pxB = parsePx(b);
  if (pxA !== null && pxB !== null) {
    return Math.abs(pxA - pxB) <= 0.5;
  }
  if ((a === 'normal' && b === '400') || (a === '400' && b === 'normal')) return true;
  if ((a === 'none' || a === 'normal') && (b === 'none' || b === 'normal') && prop.includes('transition')) return true;
  return false;
}

function parsePx(value) {
  const match = String(value || '').trim().match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : null;
}

function compareSnapshots(snapshotA, snapshotB) {
  const styleDiffs = [];
  for (const prop of STYLE_PROPERTIES) {
    const a = snapshotA.styles[prop];
    const b = snapshotB.styles[prop];
    if (!isEquivalentValue(a, b, prop)) {
      styleDiffs.push({
        property: prop,
        a,
        b,
        severity: CRITICAL_STYLE_PROPERTIES.has(prop) ? 'major' : 'minor'
      });
    }
  }

  const layoutDiffs = [];
  const layoutKeys = ['x', 'y', 'top', 'left', 'right', 'bottom', 'width', 'height'];
  for (const key of layoutKeys) {
    const a = snapshotA.rect[key];
    const b = snapshotB.rect[key];
    if (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) > 1) {
      layoutDiffs.push({ metric: key, a, b, delta: Number((a - b).toFixed(2)) });
    }
  }

  const parentOffsetDiffs = [];
  for (const key of ['offsetLeftFromParent', 'offsetTopFromParent', 'widthRatioToParent', 'heightRatioToParent']) {
    const a = snapshotA.parentMetrics?.[key];
    const b = snapshotB.parentMetrics?.[key];
    if (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) > (key.includes('Ratio') ? 0.01 : 1)) {
      parentOffsetDiffs.push({ metric: key, a, b, delta: Number((a - b).toFixed(3)) });
    }
  }

  const classDiffs = {
    aOnly: differenceOnlyA(snapshotA.classes, snapshotB.classes),
    bOnly: differenceOnlyA(snapshotB.classes, snapshotA.classes),
    shared: snapshotA.classes.filter((value) => snapshotB.classes.includes(value))
  };

  const ancestorA = snapshotA.ancestorChain.map((item) => makeSignature(item));
  const ancestorB = snapshotB.ancestorChain.map((item) => makeSignature(item));
  const ancestorTagA = snapshotA.ancestorChain.map((item) => String(item.tag || '').toLowerCase());
  const ancestorTagB = snapshotB.ancestorChain.map((item) => String(item.tag || '').toLowerCase());

  const domDiffs = [];
  if (ancestorTagA.length !== ancestorTagB.length) {
    domDiffs.push({ kind: 'ancestor-depth', a: ancestorTagA.length, b: ancestorTagB.length, severity: 'structural' });
  }
  if (ancestorTagA.join(' > ') !== ancestorTagB.join(' > ')) {
    domDiffs.push({ kind: 'ancestor-tag-chain', a: ancestorTagA.join(' > '), b: ancestorTagB.join(' > '), severity: 'structural' });
  }

  const directChildA = snapshotA.directChildren.map((item) => makeSignature(item, { includeClasses: false }));
  const directChildB = snapshotB.directChildren.map((item) => makeSignature(item, { includeClasses: false }));
  if (directChildA.join(' > ') !== directChildB.join(' > ')) {
    domDiffs.push({ kind: 'direct-child-tag-sequence', a: directChildA.join(' > ') || '(none)', b: directChildB.join(' > ') || '(none)', severity: 'structural' });
  }

  const shapeA = flattenShape(snapshotA.subtreeShape, 0, 4, { includeClasses: true });
  const shapeB = flattenShape(snapshotB.subtreeShape, 0, 4, { includeClasses: true });
  const tagShapeA = flattenTagShape(snapshotA.subtreeShape, 0, 4);
  const tagShapeB = flattenTagShape(snapshotB.subtreeShape, 0, 4);
  if (tagShapeA.join('\n') !== tagShapeB.join('\n')) {
    domDiffs.push({ kind: 'subtree-tag-shape', a: tagShapeA.join('\n'), b: tagShapeB.join('\n'), severity: 'structural' });
  }

  const treeA = flattenTreeNodes(snapshotA.subtreeShape, [], 0, 4);
  const treeB = flattenTreeNodes(snapshotB.subtreeShape, [], 0, 4);
  const treeMapA = indexByPath(treeA);
  const treeMapB = indexByPath(treeB);
  const classRoleMappings = [];
  const tagTreeDiffs = [];
  const allTreePaths = [...new Set([...treeMapA.keys(), ...treeMapB.keys()])].sort((a, b) => {
    if (a === 'root') return -1;
    if (b === 'root') return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  for (const pathLabel of allTreePaths) {
    const actual = treeMapA.get(pathLabel);
    const target = treeMapB.get(pathLabel);
    if (!actual || !target) {
      tagTreeDiffs.push({
        path: pathLabel,
        actual: actual ? actual.structuralSignature : '(missing)',
        target: target ? target.structuralSignature : '(missing)',
        reason: actual ? 'Target has no corresponding node at this path.' : 'Actual is missing the corresponding Target node at this path.'
      });
      continue;
    }
    if (actual.tag !== target.tag) {
      tagTreeDiffs.push({
        path: pathLabel,
        actual: actual.structuralSignature,
        target: target.structuralSignature,
        reason: 'Tag differs at the same tree path.'
      });
      continue;
    }
    const classComparison = compareClassLists(actual.classes, target.classes);
    if (!classComparison.equivalent) {
      classRoleMappings.push({
        path: pathLabel,
        tag: actual.tag,
        actualClasses: actual.classes,
        targetClasses: target.classes,
        actualOnly: classComparison.actualOnly,
        targetOnly: classComparison.targetOnly,
        shared: classComparison.shared
      });
    }
  }

  const subtreeStyleDiffs = [];
  const subtreeA = indexByPath(snapshotA.subtreeComputed || []);
  const subtreeB = indexByPath(snapshotB.subtreeComputed || []);
  const subtreePaths = [...new Set([...subtreeA.keys(), ...subtreeB.keys()])].sort((a, b) => {
    if (a === 'root') return -1;
    if (b === 'root') return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  for (const pathLabel of subtreePaths) {
    if (pathLabel === 'root') continue;
    const actual = subtreeA.get(pathLabel);
    const target = subtreeB.get(pathLabel);
    if (!actual || !target) continue;
    if (String(actual.tag || '').toLowerCase() !== String(target.tag || '').toLowerCase()) continue;
    for (const prop of CRITICAL_STYLE_PROPERTIES) {
      const a = actual.styles?.[prop];
      const b = target.styles?.[prop];
      if (!isEquivalentValue(a, b, prop)) {
        subtreeStyleDiffs.push({
          path: pathLabel,
          tag: String(actual.tag || '').toLowerCase(),
          property: prop,
          a,
          b,
          actualClasses: actual.classes || [],
          targetClasses: target.classes || []
        });
      }
    }
  }

  const pseudoDiffs = [];
  for (const pseudo of ['before', 'after']) {
    for (const prop of PSEUDO_PROPERTIES) {
      const a = snapshotA.pseudo[pseudo][prop];
      const b = snapshotB.pseudo[pseudo][prop];
      if (!isEquivalentValue(a, b, prop)) {
        pseudoDiffs.push({ pseudo: `::${pseudo}`, property: prop, a, b });
      }
    }
  }

  const majorCount = styleDiffs.filter((item) => item.severity === 'major').length;
  const structuralDomCount = domDiffs.length + tagTreeDiffs.length;
  const mismatchCount = majorCount + layoutDiffs.length + parentOffsetDiffs.length + structuralDomCount + subtreeStyleDiffs.length;

  return {
    result: mismatchCount === 0 && styleDiffs.length === 0 && pseudoDiffs.length === 0 ? 'MATCH' : 'MISMATCH',
    counts: {
      dom: domDiffs.length,
      tagTree: tagTreeDiffs.length,
      style: styleDiffs.length,
      majorStyle: majorCount,
      subtreeStyle: subtreeStyleDiffs.length,
      layout: layoutDiffs.length,
      parentLayout: parentOffsetDiffs.length,
      pseudo: pseudoDiffs.length,
      classAOnly: classDiffs.aOnly.length,
      classBOnly: classDiffs.bOnly.length,
      classRoleMappings: classRoleMappings.length
    },
    styleDiffs,
    subtreeStyleDiffs,
    layoutDiffs,
    parentOffsetDiffs,
    classDiffs,
    classRoleMappings,
    tagTreeDiffs,
    domDiffs,
    pseudoDiffs,
    ancestorA,
    ancestorB,
    directChildA,
    directChildB,
    shapeA,
    shapeB,
    tagShapeA,
    tagShapeB
  };
}

function suggestedStyleAction(item) {
  if (item.severity === 'major') {
    return `Make Actual compute to Target value: ${item.property}: ${item.b}`;
  }
  return `Optional alignment: ${item.property}: ${item.b}`;
}

function suggestedDomAction(item) {
  if (item.kind === 'ancestor-depth') return 'Wrapper depth differs. Add/remove wrapper(s) around Actual or move the target node to match Target nesting.';
  if (item.kind === 'ancestor-tag-chain') return 'Ancestor tag sequence differs. Match the structural wrappers used by Target.';
  if (item.kind === 'direct-child-tag-sequence') return 'Direct child element sequence differs. Reorder/add/remove direct children in Actual to match Target.';
  if (item.kind === 'subtree-tag-shape') return 'Tag-only subtree structure differs. Match Target child hierarchy; class and id names may remain Places-specific.';
  if (item.kind === 'subtree-shape') return 'Class-aware subtree differs. Treat this as informational unless tag-only structure also differs.';
  return 'Inspect Actual and align it to Target.';
}

function buildReport(comparison, snapshotA, snapshotB, diff, outputPaths) {
  const actualName = comparison.actualLabel || 'Actual / current Places element';
  const targetName = comparison.targetLabel || 'Target / reference Monsters element';
  const majorFindings = [];
  if (diff.counts.dom) majorFindings.push(`Actual wrapper/ancestor structure differs from Target in ${diff.counts.dom} area(s).`);
  if (diff.counts.tagTree) majorFindings.push(`Actual tag-only subtree differs from Target in ${diff.counts.tagTree} area(s).`);
  if (diff.counts.majorStyle) majorFindings.push(`${diff.counts.majorStyle} critical root computed style value(s) in Actual do not match Target.`);
  if (diff.counts.subtreeStyle) majorFindings.push(`${diff.counts.subtreeStyle} critical computed style value(s) differ inside matched child elements.`);
  if (diff.counts.layout) majorFindings.push(`${diff.counts.layout} root bounding-box metric(s) differ.`);
  if (diff.counts.parentLayout) majorFindings.push(`${diff.counts.parentLayout} parent-relative root layout metric(s) differ.`);
  if (diff.counts.pseudo) majorFindings.push(`${diff.counts.pseudo} root pseudo-element value(s) differ.`);
  if (!majorFindings.length && diff.counts.style) majorFindings.push(`${diff.counts.style} non-critical root computed style value(s) differ.`);
  if (!majorFindings.length) majorFindings.push('No relevant differences detected by this test.');

  const styleRows = diff.styleDiffs.map((item) => [item.severity, item.property, item.a, item.b, suggestedStyleAction(item)]);
  const subtreeRows = diff.subtreeStyleDiffs.slice(0, 100).map((item) => [
    item.path,
    item.tag,
    classListLabel(item.actualClasses),
    classListLabel(item.targetClasses),
    item.property,
    item.a,
    item.b,
    `Make the Actual node at ${item.path} compute ${item.property}: ${item.b}`
  ]);
  const layoutRows = diff.layoutDiffs.map((item) => [item.metric, formatNumber(item.a), formatNumber(item.b), formatNumber(item.delta), `Adjust Actual ${item.metric} to match Target.`]);
  const parentRows = diff.parentOffsetDiffs.map((item) => [item.metric, formatNumber(item.a), formatNumber(item.b), formatNumber(item.delta), `Adjust Actual parent-relative ${item.metric} to match Target.`]);
  const pseudoRows = diff.pseudoDiffs.map((item) => [item.pseudo, item.property, item.a, item.b, `Make Actual ${item.pseudo} ${item.property} compute to Target value.`]);
  const domRows = diff.domDiffs.map((item) => [item.kind, item.a, item.b, suggestedDomAction(item)]);
  const tagTreeRows = diff.tagTreeDiffs.map((item) => [item.path, item.actual, item.target, item.reason]);
  const classRoleRows = diff.classRoleMappings.slice(0, 80).map((item) => [
    item.path,
    item.tag,
    classListLabel(item.actualClasses),
    classListLabel(item.targetClasses),
    item.targetOnly.length ? `Actual should have Places-specific CSS equivalent to Target role(s): ${item.targetOnly.map((klass) => `.${klass}`).join(', ')}` : 'Class names differ, but no target-only class role was detected.'
  ]);

  const checklistRows = [];
  if (diff.styleDiffs.some((item) => item.property === 'position')) checklistRows.push(['Root positioning', 'Update Actual dock positioning rules to compute like Target. Usually this means matching position, bottom/left/right, transform, width, min/max width, and ensuring the parent stage is the positioning context.']);
  if (diff.styleDiffs.some((item) => ['width', 'max-width', 'min-width', 'height', 'min-height', 'max-height'].includes(item.property))) checklistRows.push(['Root size', 'Make Actual root width/height/min/max constraints compute to Target values.']);
  if (diff.layoutDiffs.length || diff.parentOffsetDiffs.length) checklistRows.push(['Rendered placement', 'After CSS changes, rerun the test and check bounding-box/parent-relative metrics. These are viewport-state dependent but useful for final alignment.']);
  if (diff.tagTreeDiffs.length || diff.domDiffs.length) checklistRows.push(['DOM structure', 'Change Actual wrappers/child order only where tag-only structure differs. Do not change class names just to satisfy the report.']);
  if (diff.classRoleMappings.length) checklistRows.push(['Class role map', 'Use the Class Role Map as a translation guide: create/adjust Places-specific selectors so they compute like the corresponding Monsters selectors.']);
  if (diff.subtreeStyleDiffs.length) checklistRows.push(['Child elements', 'Align the highest-impact child-node computed style differences first: panel, next row, timeline, nav buttons, progress nav, status row, toggle row, and stage buttons.']);
  if (!checklistRows.length) checklistRows.push(['No action', 'The test did not detect actionable differences under the current settings.']);

  const promptSummary = [
    `Goal: make the Actual Places element match the Target Monsters element visually and structurally, while keeping Places-specific class names and CSS selectors.`,
    `Actual selector: ${comparison.selectorA}.`,
    `Target selector: ${comparison.selectorB}.`,
    `The browser-rendered comparison reports ${diff.result}.`,
    diff.counts.dom ? `Ancestor/wrapper DOM differences: ${diff.counts.dom}.` : null,
    diff.counts.tagTree ? `Tag-only subtree differences: ${diff.counts.tagTree}.` : null,
    diff.counts.majorStyle ? `Critical root computed style differences: ${diff.counts.majorStyle}.` : null,
    diff.counts.subtreeStyle ? `Critical child computed style differences: ${diff.counts.subtreeStyle}.` : null,
    diff.counts.layout ? `Root bounding-box layout differences: ${diff.counts.layout}.` : null,
    diff.counts.parentLayout ? `Parent-relative root layout differences: ${diff.counts.parentLayout}.` : null,
    diff.counts.pseudo ? `Root pseudo-element differences: ${diff.counts.pseudo}.` : null,
    `Ignore class-name differences as structural mismatches. Classes must remain Places-specific unless explicitly requested. Focus on matching tag hierarchy, child order, computed CSS, positioning, size, spacing, and rendered layout.`
  ].filter(Boolean).join(' ');

  const subtreeLimitNote = diff.subtreeStyleDiffs.length > 100 ? `\nShowing first 100 of ${diff.subtreeStyleDiffs.length} child computed style differences. Full data is in the JSON report.\n` : '';
  const classLimitNote = diff.classRoleMappings.length > 80 ? `\nShowing first 80 of ${diff.classRoleMappings.length} class role rows. Full data is in the JSON report.\n` : '';

  return `# Actual vs Target Element Report - ${comparison.name}\n\nGenerated: ${new Date().toISOString()}\n\n## Goal\n\nMake **Actual** match **Target**. Class names are allowed to differ. The important checks are tag structure, nesting, computed CSS, pseudo-elements, and rendered layout.\n\n## Compared Elements\n\n- Actual: ${comparison.urlA || comparison.htmlA}\n  - Label: ${actualName}\n  - Selector: \`${comparison.selectorA}\`\n- Target: ${comparison.urlB || comparison.htmlB}\n  - Label: ${targetName}\n  - Selector: \`${comparison.selectorB}\`\n- Viewport: ${comparison.viewport.width}x${comparison.viewport.height}\n\n## Summary\n\nResult: **${diff.result}**\n\nMajor findings:\n${majorFindings.map((item) => `- ${item}`).join('\n')}\n\nCounts:\n\n${table([
    ['Ancestor / wrapper differences', diff.counts.dom],
    ['Tag-only subtree differences', diff.counts.tagTree],
    ['Root computed style differences', diff.counts.style],
    ['Critical root computed style differences', diff.counts.majorStyle],
    ['Critical child computed style differences', diff.counts.subtreeStyle],
    ['Root bounding-box differences', diff.counts.layout],
    ['Root parent-relative layout differences', diff.counts.parentLayout],
    ['Root pseudo-element differences', diff.counts.pseudo],
    ['Class role mapping rows', diff.counts.classRoleMappings],
    ['Actual-only root classes', diff.counts.classAOnly],
    ['Target-only root classes', diff.counts.classBOnly]
  ], ['Metric', 'Count'])}\n## Implementation Checklist\n\n${table(checklistRows, ['Area', 'Action'])}\n## What To Change In Actual\n\n### DOM / Nesting — Tag-only\n\nThis section ignores class names and IDs. It only checks whether Actual has the same structural element tree as Target.\n\nAncestor / wrapper differences:\n\n${table(domRows, ['Kind', 'Actual', 'Target', 'Suggested action'])}\nTag-only subtree differences:\n\n${table(tagTreeRows, ['Path', 'Actual', 'Target', 'Reason'])}\n### Class Role Map — Informational\n\nUse this as a translation table. Actual class names do **not** need to match Target class names; Actual Places selectors should compute like the corresponding Target Monsters roles.\n${classLimitNote}\n${table(classRoleRows, ['Path', 'Tag', 'Actual classes', 'Target classes', 'Suggested Places CSS role'])}\n### Root Computed CSS\n\n${table(styleRows, ['Severity', 'Property', 'Actual', 'Target', 'Suggested action'])}\n### Matched Child Computed CSS\n\nThis compares child elements with the same tree path and tag. It ignores class-name differences but checks critical computed layout/style properties.\n${subtreeLimitNote}\n${table(subtreeRows, ['Path', 'Tag', 'Actual classes', 'Target classes', 'Property', 'Actual', 'Target', 'Suggested action'])}\n### Root Layout\n\nBounding box:\n\n${table(layoutRows, ['Metric', 'Actual', 'Target', 'Delta Actual-Target', 'Suggested action'])}\nParent-relative metrics:\n\n${table(parentRows, ['Metric', 'Actual', 'Target', 'Delta Actual-Target', 'Suggested action'])}\n### Root Pseudo-elements\n\n${table(pseudoRows, ['Pseudo', 'Property', 'Actual', 'Target', 'Suggested action'])}\n## DOM Nesting\n\nActual ancestor chain:\n\n${codeBlock(diff.ancestorA.join('\n') || '(none)', 'text')}\n\nTarget ancestor chain:\n\n${codeBlock(diff.ancestorB.join('\n') || '(none)', 'text')}\n\n## Direct Children — Tag-only\n\nActual:\n\n${codeBlock(diff.directChildA.join('\n') || '(none)', 'text')}\n\nTarget:\n\n${codeBlock(diff.directChildB.join('\n') || '(none)', 'text')}\n\n## Tag-only Subtree Shape\n\nActual:\n\n${codeBlock(diff.tagShapeA.join('\n') || '(none)', 'text')}\n\nTarget:\n\n${codeBlock(diff.tagShapeB.join('\n') || '(none)', 'text')}\n\n## Class-aware Subtree Shape — Informational\n\nThis includes class names only to help identify elements. It is not a failure by itself if the tag-only structure matches.\n\nActual:\n\n${codeBlock(diff.shapeA.join('\n') || '(none)', 'text')}\n\nTarget:\n\n${codeBlock(diff.shapeB.join('\n') || '(none)', 'text')}\n\n## Root Class Differences — Informational\n\nClass names do **not** need to match if the computed output and DOM role are equivalent.\n\nActual only:\n\n${codeBlock(diff.classDiffs.aOnly.join('\n') || 'None.', 'text')}\n\nTarget only:\n\n${codeBlock(diff.classDiffs.bOnly.join('\n') || 'None.', 'text')}\n\nShared:\n\n${codeBlock(diff.classDiffs.shared.join('\n') || 'None.', 'text')}\n\n## Element Snapshots\n\nActual rect:\n\n${codeBlock(JSON.stringify(snapshotA.rect, null, 2), 'json')}\n\nTarget rect:\n\n${codeBlock(JSON.stringify(snapshotB.rect, null, 2), 'json')}\n\n## ChatGPT Prompt Summary\n\n${promptSummary}\n\n## Output Files\n\n- Markdown: ${outputPaths.markdown}\n- JSON: ${outputPaths.json}\n`;
}

async function snapshotElement(page, selector, label, timeout, subtreeDepth = 4) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'attached', timeout });
  const count = await page.locator(selector).count();
  if (count > 1) {
    console.warn(`[Element Comparator] ${label}: selector matched ${count} elements. Using the first one.`);
  }

  return locator.evaluate((element, payload) => {
    const styleProperties = payload.styleProperties;
    const pseudoProperties = payload.pseudoProperties;

    function toArray(list) {
      return Array.from(list || []);
    }

    function rectToObject(rect) {
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      };
    }

    function nodeSummary(node) {
      return {
        tag: node.tagName,
        id: node.id || '',
        classes: toArray(node.classList),
        role: node.getAttribute('role') || '',
        ariaLabel: node.getAttribute('aria-label') || '',
        dataCompare: node.getAttribute('data-compare') || '',
        childElementCount: node.childElementCount
      };
    }

    function getStyles(target, pseudo = null, properties = styleProperties) {
      const computed = window.getComputedStyle(target, pseudo);
      const result = {};
      for (const prop of properties) {
        result[prop] = computed.getPropertyValue(prop);
      }
      return result;
    }

    function buildAncestorChain(target) {
      const chain = [];
      let current = target;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        chain.unshift(nodeSummary(current));
        if (current.tagName.toLowerCase() === 'body') break;
        current = current.parentElement;
      }
      return chain;
    }

    function buildShape(target, depth = 0, maxDepth = 4, maxChildren = 12) {
      const summary = nodeSummary(target);
      if (depth >= maxDepth) {
        summary.children = [];
        return summary;
      }
      summary.children = toArray(target.children).slice(0, maxChildren).map((child) => buildShape(child, depth + 1, maxDepth, maxChildren));
      if (target.children.length > maxChildren) {
        summary.children.push({ tag: `... ${target.children.length - maxChildren} more`, id: '', classes: [], role: '', ariaLabel: '', dataCompare: '', childElementCount: 0, children: [] });
      }
      return summary;
    }

    function collectSubtreeComputed(target, path = 'root', depth = 0, maxDepth = 4, maxChildren = 12) {
      const summary = nodeSummary(target);
      summary.path = path;
      summary.depth = depth;
      summary.rect = rectToObject(target.getBoundingClientRect());
      summary.styles = getStyles(target);
      summary.textExcerpt = (target.innerText || target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180);
      const own = [summary];
      if (depth >= maxDepth) return own;
      const children = toArray(target.children).slice(0, maxChildren).flatMap((child, index) => collectSubtreeComputed(child, path === 'root' ? String(index) : `${path}.${index}`, depth + 1, maxDepth, maxChildren));
      return own.concat(children);
    }

    const rect = rectToObject(element.getBoundingClientRect());
    const parentRect = element.parentElement ? rectToObject(element.parentElement.getBoundingClientRect()) : null;
    const parentMetrics = parentRect ? {
      offsetLeftFromParent: rect.left - parentRect.left,
      offsetTopFromParent: rect.top - parentRect.top,
      widthRatioToParent: parentRect.width ? rect.width / parentRect.width : 0,
      heightRatioToParent: parentRect.height ? rect.height / parentRect.height : 0
    } : null;

    return {
      label: payload.label,
      selector: payload.selector,
      url: window.location.href,
      tag: element.tagName,
      id: element.id || '',
      classes: toArray(element.classList),
      role: element.getAttribute('role') || '',
      ariaLabel: element.getAttribute('aria-label') || '',
      textExcerpt: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300),
      rect,
      parentRect,
      parentMetrics,
      styles: getStyles(element),
      pseudo: {
        before: getStyles(element, '::before', pseudoProperties),
        after: getStyles(element, '::after', pseudoProperties)
      },
      ancestorChain: buildAncestorChain(element),
      directChildren: toArray(element.children).map(nodeSummary),
      subtreeShape: buildShape(element, 0, payload.subtreeDepth || 4),
      subtreeComputed: collectSubtreeComputed(element, 'root', 0, payload.subtreeDepth || 4)
    };
  }, {
    label,
    selector,
    styleProperties: STYLE_PROPERTIES,
    pseudoProperties: PSEUDO_PROPERTIES,
    subtreeDepth
  });
}

async function loadComparisonPage(browser, source, viewport, wait, baseUrl) {
  const page = await browser.newPage({ viewport });
  if (source.htmlPath) {
    const absolutePath = path.resolve(source.htmlPath);
    let html = await fs.readFile(absolutePath, 'utf8');
    if (baseUrl && !/<base\s/i.test(html)) {
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseUrl}">`);
      } else {
        html = `<base href="${baseUrl}">${html}`;
      }
    }
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto(source.url, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForLoadState('networkidle', { timeout: 3000 });
    } catch {
      // Some dev pages keep network activity open. DOMContentLoaded + short wait is enough for this diagnostic.
    }
  }
  if (wait > 0) {
    await page.waitForTimeout(wait);
  }
  return page;
}

async function ensureOutputPaths(args, comparison) {
  const baseName = `${timestampForFile()}-${slugify(comparison.name)}`;
  const markdown = args.out || path.join(DEFAULT_OUTPUT_DIR, `${baseName}.md`);
  const json = args['json-out'] || markdown.replace(/\.md$/i, '.json');
  await fs.mkdir(path.dirname(markdown), { recursive: true });
  await fs.mkdir(path.dirname(json), { recursive: true });
  return { markdown, json };
}

async function importPlaywright() {
  try {
    return await import('playwright');
  } catch (error) {
    throw new Error(`Playwright is required for element comparison. Install it once with:\n\n  npm i -D playwright\n  npx playwright install chromium\n\nOriginal import error: ${error.message}`, { cause: error });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = args.config || DEFAULT_CONFIG_PATH;
  const config = normalizePresetConfig(await readJsonIfExists(configPath));

  if (args.help || args.h) {
    console.log(formatUsage(config.presets));
    return;
  }

  const comparison = resolveComparison(args, config);
  if (!comparison) {
    console.log(formatUsage(config.presets));
    return;
  }

  const { chromium } = await importPlaywright();
  const browser = await chromium.launch({ headless: true });

  let pageA;
  let pageB;
  try {
    pageA = await loadComparisonPage(browser, { url: comparison.urlA, htmlPath: comparison.htmlA }, comparison.viewport, comparison.wait, comparison.baseUrl);
    pageB = await loadComparisonPage(browser, { url: comparison.urlB, htmlPath: comparison.htmlB }, comparison.viewport, comparison.wait, comparison.baseUrl);

    const snapshotA = await snapshotElement(pageA, comparison.selectorA, comparison.actualLabel || 'Actual', comparison.timeout, comparison.subtreeDepth);
    const snapshotB = await snapshotElement(pageB, comparison.selectorB, comparison.targetLabel || 'Target', comparison.timeout, comparison.subtreeDepth);
    snapshotA.rect = roundRect(snapshotA.rect);
    snapshotB.rect = roundRect(snapshotB.rect);
    snapshotA.parentRect = roundRect(snapshotA.parentRect || {});
    snapshotB.parentRect = roundRect(snapshotB.parentRect || {});
    snapshotA.parentMetrics = roundRect(snapshotA.parentMetrics || {});
    snapshotB.parentMetrics = roundRect(snapshotB.parentMetrics || {});

    const diff = compareSnapshots(snapshotA, snapshotB);
    const outputPaths = await ensureOutputPaths(args, comparison);
    const report = buildReport(comparison, snapshotA, snapshotB, diff, outputPaths);
    const jsonPayload = { comparison, result: diff.result, counts: diff.counts, diff, snapshots: { a: snapshotA, b: snapshotB }, outputPaths };

    await fs.writeFile(outputPaths.markdown, report, 'utf8');
    await fs.writeFile(outputPaths.json, JSON.stringify(jsonPayload, null, 2), 'utf8');

    if (!args['no-open-report']) {
      console.log(report);
    } else {
      console.log(`Element comparison complete: ${diff.result}`);
      console.log(`Markdown: ${outputPaths.markdown}`);
      console.log(`JSON: ${outputPaths.json}`);
    }

    process.exitCode = diff.result === 'MATCH' ? 0 : 2;
  } finally {
    await pageA?.close().catch(() => undefined);
    await pageB?.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(`Element comparison failed: ${error.message}`);
  process.exitCode = 1;
});
