import { state, setState } from './state.js';
import { setMouse, render } from './render.js';

// ─── Named event handlers ─────────────────────────────────────────────────────
export function onZoneClick(key) {
  setState({ activeZone: key, panelOpen: true });
}

export function onZoneHover(key) {
  setState({ hoveredZone: key });
}

export function onZoneLeave() {
  setState({ hoveredZone: null });
}

export function onPanelClose() {
  setState({ activeZone: null, panelOpen: false, hoveredZone: null });
}

export function onFloorChange(n) {
  setState({ activeFloor: n, activeZone: null, panelOpen: false, hoveredZone: null });
}

// ─── Wire all DOM listeners (called once on init) ─────────────────────────────
export function attachEvents() {
  const grid    = document.getElementById('map-grid');
  const panel   = document.getElementById('side-panel');
  const closeBtn= document.getElementById('panel-close');

  // Zone click and hover — delegated to the grid
  grid.addEventListener('click', e => {
    const card = e.target.closest('.zone-card');
    if (card) onZoneClick(card.dataset.key);
  });

  grid.addEventListener('mouseover', e => {
    const card = e.target.closest('.zone-card');
    if (card) onZoneHover(card.dataset.key);
  });

  grid.addEventListener('mouseout', e => {
    const leaving = e.target.closest('.zone-card');
    const entering = e.relatedTarget && e.relatedTarget.closest('.zone-card');
    // Only fire leave when truly exiting the card (not moving between children)
    if (leaving && leaving !== entering) onZoneLeave();
  });

  // Mouse tracking for tooltip positioning
  document.addEventListener('mousemove', e => {
    setMouse(e.clientX, e.clientY);
    // Re-render tooltip position live without full render cycle
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip && tooltip.classList.contains('visible')) {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY + 14) + 'px';
    }
  });

  // Panel close button
  closeBtn.addEventListener('click', onPanelClose);

  // Click outside panel to close (on the map surface)
  document.getElementById('map-surface').addEventListener('click', e => {
    if (state.panelOpen && !e.target.closest('.zone-card') && !e.target.closest('#side-panel')) {
      onPanelClose();
    }
  });

  // Floor switcher buttons
  document.querySelectorAll('.floor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.floor, 10);
      if (n === state.activeFloor) return;

      document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      onFloorChange(n);
    });
  });
}
