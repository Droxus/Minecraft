import './style.css'
import Settings from './settings';
import Engine from './engine';
import Map from './map';
import Controls from './controls';
import DevTools from './devTools';
import Blocks from './blocks'

export const settings = new Settings();
export const engine = new Engine();
export const blocks = new Blocks();
export const map = new Map();
export const controls = new Controls();
export const devTools = new DevTools();