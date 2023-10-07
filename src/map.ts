import * as THREE from 'three';
import { game } from './main';

export class Map {
    private cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    private cubeMaterial = new THREE.MeshNormalMaterial();
    private cube = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );
    private blocks: any = [];
    
    constructor() {
        this.createBlock(0, -1, 2);
        this.createBlock(0, 1, 2);

        this.Update()
    }
    private createBlock(x: number, y: number, z: number) {
        const newCube = this.cube.clone();

        game.scene.add(newCube);
        newCube.position.set(x, y, z);
        this.blocks.push(newCube);
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );

        this.blocks[0].rotation.x += 1 * game.delta;
        this.blocks[1].rotation.y += 1 * game.delta;
    }
}