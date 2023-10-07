import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { game } from './main';

export class Controls {
    private controls = new OrbitControls( game.camera, game.renderer.domElement );

    constructor() {
        this.controls.update();

        this.Update();
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
        this.controls.update();
    }
}