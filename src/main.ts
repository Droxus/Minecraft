import './style.css'
import Engine from './engine';
import Map from './map';
import Controls from './controls';
import DevTools from './devTools';
import Blocks from './blocks'


// async function fetchData() {
//     const response = await import('../src/assets/storage/blocks.json');
//     const data = response.default;
//     const texturesPath = data.map(e => e.texture)
//     console.log(texturesPath);
// }

// const response = await import('../src/assets/storage/blocks.json');
// const data = response.default;
// const texturesPath = data.map(e => e.texture).flat(1);

export const engine = new Engine();
export const blocks = new Blocks();
export const map = new Map();
export const controls = new Controls();
export const devTools = new DevTools();

// blocks.loadTextures(texturesPath);


// async function fetchData() {
//     const response = await import('../src/assets/storage/textures.json');
//     const data = response.default;
//     console.log(data);

//     let result = data.map(e => e.slice(11))
//     console.log(result)
// }

// fetchData()