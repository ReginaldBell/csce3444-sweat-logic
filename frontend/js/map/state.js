import { ZONES } from './data.js';

// ─── Canonical state ──────────────────────────────────────────────────────────
export const state = {
  activeZone:  null,   // zone key | null
  hoveredZone: null,   // zone key | null
  activeFloor: 1,      // 1 | 2
  panelOpen:   false,  // bool
};

// Registered by the bootstrap after render.js is loaded — avoids circular import
let _renderFn = () => {};
export function registerRender(fn) { _renderFn = fn; }

export function setState(patch) {
  Object.assign(state, patch);
  _renderFn();
}

// ─── Derived (pure, no side-effects) ─────────────────────────────────────────
export const getActiveZone  = () => state.activeZone  ? ZONES[state.activeZone]  : null;
export const getHoveredZone = () => state.hoveredZone ? ZONES[state.hoveredZone] : null;
export const getFloorZones  = () =>
  Object.entries(ZONES).filter(([, z]) => z.floor === state.activeFloor);
