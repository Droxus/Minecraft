import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { engine } from './main';

export class Controls {
    private controls = new OrbitControls( engine.camera, engine.renderer.domElement );

    constructor() {
        this.controls.update();

        this.controls.addEventListener('change', () => engine.needRenderUpdate = true);

        engine.needRenderUpdate = true;
        this.Update();
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
        this.controls.update();
    }
}