import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { engine } from './main';
import Blocks from './blocks';

const blocks = new Blocks()

export default class Controls {
    public controls = new OrbitControls( engine.camera, engine.renderer.domElement );

    constructor() {
        this.controls.update();

        this.controls.addEventListener('change', () => engine.needsRenderUpdate = true);

        this.init();

        engine.needsRenderUpdate = true;
        this.Update();
    }

    private init() {
        window.onclick = () => {
            blocks.create();
        }
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
        this.controls.update();
    }
}