import './style.css'
import Engine from './engine';
import Map from './map';
import Controls from './controls';
import DevTools from './devTools';

export const engine = new Engine();
export const map = new Map();
export const devTools = new DevTools();
export const controls = new Controls();