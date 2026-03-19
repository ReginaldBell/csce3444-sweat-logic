import { state, getActiveZone, getHoveredZone, getFloorZones } from './state.js';
import { FLOORS, GROUP_COLORS } from './data.js';
import { setZoneReport, getSavedReport } from './simulate.js';

export let mouseX = 0;
export let mouseY = 0;

export function setMouse(x, y) {
  mouseX = x;
  mouseY = y;
}

let _grid;
let _panel;
let _panelInner;
let _panelContent;
let _tooltip;
let _mapSignature = '';
let _panelSignature = '';

function els() {
  _grid = _grid || document.getElementById('map-grid');
  _panel = _panel || document.getElementById('side-panel');
  _panelInner = _panelInner || _panel?.querySelector('.panel-inner');
  _panelContent = _panelContent || document.getElementById('panel-content');
  _tooltip = _tooltip || document.getElementById('map-tooltip');
}

export function render() {
  els();
  renderMap();
  renderPanel();
  renderTooltip();
}

function renderMap() {
  const floor = FLOORS[state.activeFloor];
  const signature = [
    state.activeFloor,
    state.activeZone || '',
    ...getFloorZones().map(([key, zone]) => {
      const saved = getSavedReport(key);
      return `${key}:${zone.status || ''}:${saved ? saved.status : ''}`;
    }),
  ].join('|');

  if (signature === _mapSignature) {
    return;
  }

  _mapSignature = signature;
  _grid.style.gridTemplateAreas = floor.gridTemplateAreas;
  _grid.style.gridTemplateColumns = floor.gridTemplateColumns;
  _grid.style.gridTemplateRows = floor.gridTemplateRows;
  _grid.innerHTML = '';

  getFloorZones().forEach(([key, zone]) => {
    const card = document.createElement('div');
    const colors = GROUP_COLORS[zone.group];

    card.className = 'zone-card';
    card.dataset.key = key;
    card.style.gridArea = zone.ui.gridArea;
    card.style.setProperty('--accent', colors.accent);
    card.style.setProperty('--accent-light', colors.light);

    if (key === state.activeZone) {
      card.classList.add('active');
    }
    if (zone.ui.youAreHere) {
      card.classList.add('you-are-here');
    }
    if (zone.status) {
      card.classList.add(`status-${zone.status}`);
    }
    if (getSavedReport(key)) {
      card.classList.add('user-reported');
    }

    card.innerHTML = `
      <i class="fa-solid ${zone.ui.icon}"></i>
      <span class="zone-label">${zone.label}</span>
      ${zone.status ? `<span class="zone-status ${zone.status}">${statusLabel(zone.status)}</span>` : ''}
    `;

    _grid.appendChild(card);
  });

  _grid.classList.toggle('has-active', state.activeZone !== null);
}

function renderPanel() {
  if (!state.panelOpen || !state.activeZone) {
    _panel.classList.remove('open');
    _panelSignature = '';
    return;
  }

  const zone = getActiveZone();
  if (!zone) {
    _panel.classList.remove('open');
    _panelSignature = '';
    return;
  }

  const key = state.activeZone;
  const colors = GROUP_COLORS[zone.group];
  const status = zone.status || 'unknown';
  const saved = getSavedReport(key);
  const reportedAt = saved ? timeAgo(saved.timestamp) : null;
  const signature = `${key}|${status}|${saved ? saved.status : ''}`;

  _panel.style.setProperty('--panel-accent', colors.accent);
  _panel.style.setProperty('--panel-accent-soft', colors.light);
  if (_panelInner) {
    _panelInner.style.setProperty('--panel-accent', colors.accent);
    _panelInner.style.setProperty('--panel-accent-soft', colors.light);
  }

  if (signature !== _panelSignature) {
    _panelContent.innerHTML = `
      <p class="panel-group-label">${zone.group}</p>
      <h3 class="panel-zone-name">${zone.label}</h3>

      ${zone.status ? `
        <span class="panel-status-badge ${status}">${statusLabel(status)}</span>
        <p class="panel-simulated-note">${saved ? `You reported this · ${reportedAt}` : 'Status: estimated - not live data'}</p>

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
          ${zone.meta.equipment.map((equipment) => `<li>${equipment}</li>`).join('')}
        </ul>
      ` : ''}

      <p class="panel-section-title">Hours</p>
      <p class="panel-hours">${zone.meta.hours}</p>

      ${zone.ui.youAreHere ? '<p class="panel-yah-tag">You are here</p>' : ''}

      <p class="panel-section-title">Report Occupancy</p>
      <div class="report-buttons">
        <button class="report-btn empty ${saved && saved.status === 'empty' ? 'is-reported' : ''}" data-report="empty">Open</button>
        <button class="report-btn moderate ${saved && saved.status === 'moderate' ? 'is-reported' : ''}" data-report="moderate">Moderate</button>
        <button class="report-btn busy ${saved && saved.status === 'busy' ? 'is-reported' : ''}" data-report="busy">Busy</button>
      </div>
    `;

    _panelContent.querySelectorAll('.report-btn').forEach((button) => {
      button.addEventListener('click', () => {
        setZoneReport(key, button.dataset.report);
        render();
      });
    });

    triggerPanelAnimation();
    _panelSignature = signature;
  }

  _panel.classList.add('open');
}

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

  const offset = 14;
  _tooltip.style.left = `${mouseX + offset}px`;
  _tooltip.style.top = `${mouseY + offset}px`;
  _tooltip.classList.add('visible');
}

function triggerPanelAnimation() {
  _panelContent.classList.remove('is-animating');
  void _panelContent.offsetWidth;
  _panelContent.classList.add('is-animating');
}

function statusLabel(status) {
  return {
    empty: 'Open',
    moderate: 'Moderate',
    busy: 'Busy',
  }[status] || status;
}

function capacityPercent(status) {
  return {
    empty: 12,
    moderate: 52,
    busy: 88,
  }[status] || 0;
}

function timeAgo(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
