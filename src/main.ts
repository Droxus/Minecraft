import './style.css'
import { Engine } from './engine';
import { Map } from './map';
import { Controls } from './controls';

export const game = new Engine();
export const map = new Map();
export const controls = new Controls();