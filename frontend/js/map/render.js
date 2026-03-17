import { state, getActiveZone, getHoveredZone, getFloorZones } from './state.js';
import { FLOORS, GROUP_COLORS } from './data.js';
import { setZoneReport, getSavedReport } from './simulate.js';

// ─── Mouse position (tracked globally for tooltip placement) ──────────────────
export let mouseX = 0;
export let mouseY = 0;
export function setMouse(x, y) { mouseX = x; mouseY = y; }

// ─── DOM refs (resolved once on first call) ───────────────────────────────────
let _grid, _panel, _panelContent, _tooltip;
function els() {
  _grid         = _grid         || document.getElementById('map-grid');
  _panel        = _panel        || document.getElementById('side-panel');
  _panelContent = _panelContent || document.getElementById('panel-content');
  _tooltip      = _tooltip      || document.getElementById('map-tooltip');
}

// ─── Entry point ─────────────────────────────────────────────────────────────
export function render() {
  els();
  renderMap();
  renderPanel();
  renderTooltip();
}

// ─── renderMap ────────────────────────────────────────────────────────────────
function renderMap() {
  const floor = FLOORS[state.activeFloor];

  // Apply grid layout for this floor
  _grid.style.gridTemplateAreas   = floor.gridTemplateAreas;
  _grid.style.gridTemplateColumns = floor.gridTemplateColumns;
  _grid.style.gridTemplateRows    = floor.gridTemplateRows;

  // Rebuild zone cards
  _grid.innerHTML = '';
  getFloorZones().forEach(([key, zone]) => {
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.dataset.key = key;

    // CSS grid placement — must be set via JS (var() doesn't work for grid-area)
    card.style.gridArea = zone.ui.gridArea;

    // Group accent as CSS custom properties
    const colors = GROUP_COLORS[zone.group];
    card.style.setProperty('--accent', colors.accent);
    card.style.setProperty('--accent-light', colors.light);

    // Active / YAH / status state classes
    if (key === state.activeZone) card.classList.add('active');
    if (zone.ui.youAreHere)       card.classList.add('you-are-here');
    if (zone.status)              card.classList.add('status-' + zone.status);

    // User-reported badge marker
    if (getSavedReport(key))      card.classList.add('user-reported');

    // Inner markup
    card.innerHTML = `
      <i class="fa-solid ${zone.ui.icon}"></i>
      <span class="zone-label">${zone.label}</span>
      ${zone.status ? `<span class="zone-status ${zone.status}">${statusLabel(zone.status)}</span>` : ''}
    `;

    _grid.appendChild(card);
  });

  // Dimming: if a zone is active, dim everything else
  _grid.classList.toggle('has-active', state.activeZone !== null);
}

// ─── renderPanel ──────────────────────────────────────────────────────────────
function renderPanel() {
  if (!state.panelOpen || !state.activeZone) {
    _panel.classList.remove('open');
    return;
  }

  const zone      = getActiveZone();
  if (!zone) { _panel.classList.remove('open'); return; }

  const key       = state.activeZone;
  const colors    = GROUP_COLORS[zone.group];
  const status    = zone.status || 'unknown';
  const saved     = getSavedReport(key);
  const reportedAt= saved ? timeAgo(saved.timestamp) : null;

  _panelContent.innerHTML = `
    <p class="panel-group-label">${zone.group}</p>
    <h3 class="panel-zone-name">${zone.label}</h3>

    ${zone.status ? `
      <span class="panel-status-badge ${status}">${statusLabel(status)}</span>
      <p class="panel-simulated-note">${saved ? `You reported this · ${reportedAt}` : 'Status: estimated — not live data'}</p>

      <div class="panel-capacity-bar">
        <div class="panel-capacity-label">
          <span>Estimated Occupancy</span>
          <span>${capacityPercent(status)}%</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill ${status}" style="width:${capacityPercent(status)}%"></div>
        </div>
      </div>
    ` : ''}

    ${zone.meta.equipment.length ? `
      <p class="panel-section-title">Equipment</p>
      <ul class="panel-equipment-list">
        ${zone.meta.equipment.map(e => `<li>${e}</li>`).join('')}
      </ul>
    ` : ''}

    <p class="panel-section-title">Hours</p>
    <p class="panel-hours">${zone.meta.hours}</p>

    ${zone.ui.youAreHere ? '<p class="panel-yah-tag">📍 You are here</p>' : ''}

    <p class="panel-section-title">Report Occupancy</p>
    <div class="report-buttons">
      <button class="report-btn empty    ${saved && saved.status === 'empty'    ? 'is-reported' : ''}" data-report="empty">Open</button>
      <button class="report-btn moderate ${saved && saved.status === 'moderate' ? 'is-reported' : ''}" data-report="moderate">Moderate</button>
      <button class="report-btn busy     ${saved && saved.status === 'busy'     ? 'is-reported' : ''}" data-report="busy">Busy</button>
    </div>
  `;

  // Wire report button clicks (delegated within panel content)
  _panelContent.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setZoneReport(key, btn.dataset.report);
      render(); // re-render with updated status
    });
  });

  // Accent stripe
  _panelContent.style.setProperty('--panel-accent', colors.accent);

  _panel.classList.add('open');
}

// ─── renderTooltip ────────────────────────────────────────────────────────────
function renderTooltip() {
  const zone = getHoveredZone();

  if (!zone || state.panelOpen) {
    _tooltip.classList.remove('visible');
    return;
  }

  const status = zone.status;
  _tooltip.innerHTML = `
    <div class="tooltip-name">${zone.label}</div>
    ${status ? `<div class="tooltip-status">${statusLabel(status)} · Cap. ${zone.meta.capacity}</div>` : ''}
  `;

  // Position near cursor (offset so it doesn't sit under the pointer)
  const offset = 14;
  _tooltip.style.left = (mouseX + offset) + 'px';
  _tooltip.style.top  = (mouseY + offset) + 'px';

  _tooltip.classList.add('visible');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusLabel(s) {
  return { empty: 'Open', moderate: 'Moderate', busy: 'Busy' }[s] || s;
}

function capacityPercent(s) {
  return { empty: 12, moderate: 52, busy: 88 }[s] || 0;
}

function timeAgo(timestamp) {
  const mins = Math.round((Date.now() - timestamp) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
