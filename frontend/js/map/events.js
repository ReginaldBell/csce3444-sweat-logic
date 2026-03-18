import { state, setState } from './state.js';
import { setMouse } from './render.js';

const FLOOR_SWAP_DELAY_MS = 150;
const FLOOR_ENTER_MS = 360;
let floorTransitionTimer = null;
let floorEnterTimer = null;

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

export function onFloorChange(floor) {
  setState({ activeFloor: floor, activeZone: null, panelOpen: false, hoveredZone: null });
}

export function attachEvents() {
  const grid = document.getElementById('map-grid');
  const closeButton = document.getElementById('panel-close');
  const mapSurface = document.getElementById('map-surface');

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.zone-card');
    if (card) {
      onZoneClick(card.dataset.key);
    }
  });

  grid.addEventListener('mouseover', (event) => {
    const card = event.target.closest('.zone-card');
    if (card) {
      onZoneHover(card.dataset.key);
    }
  });

  grid.addEventListener('mouseout', (event) => {
    const leaving = event.target.closest('.zone-card');
    const entering = event.relatedTarget && event.relatedTarget.closest('.zone-card');
    if (leaving && leaving !== entering) {
      onZoneLeave();
    }
  });

  document.addEventListener('mousemove', (event) => {
    setMouse(event.clientX, event.clientY);
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip && tooltip.classList.contains('visible')) {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY + 14}px`;
    }
  });

  closeButton.addEventListener('click', onPanelClose);

  mapSurface.addEventListener('click', (event) => {
    if (state.panelOpen && !event.target.closest('.zone-card') && !event.target.closest('#side-panel')) {
      onPanelClose();
    }
  });

  document.querySelectorAll('.floor-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const nextFloor = parseInt(button.dataset.floor, 10);
      if (nextFloor === state.activeFloor) {
        return;
      }

      document.querySelectorAll('.floor-btn').forEach((floorButton) => {
        floorButton.classList.toggle('active', floorButton === button);
      });

      animateFloorChange(nextFloor, grid);
    });
  });
}

function animateFloorChange(nextFloor, grid) {
  if (!grid || prefersReducedMotion()) {
    onFloorChange(nextFloor);
    return;
  }

  window.clearTimeout(floorTransitionTimer);
  window.clearTimeout(floorEnterTimer);
  grid.classList.remove('is-entering');
  grid.classList.add('transitioning');

  floorTransitionTimer = window.setTimeout(() => {
    onFloorChange(nextFloor);

    requestAnimationFrame(() => {
      grid.classList.remove('transitioning');
      grid.classList.add('is-entering');

      floorEnterTimer = window.setTimeout(() => {
        grid.classList.remove('is-entering');
      }, FLOOR_ENTER_MS);
    });
  }, FLOOR_SWAP_DELAY_MS);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
