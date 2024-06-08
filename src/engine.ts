import * as THREE from 'three';
import { settings } from './main';

export default class Engine {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public light: THREE.AmbientLight;
    public clock: THREE.Clock;
    public delta: number;
    public needsRenderUpdate: boolean;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( settings.camera.fov, window.innerWidth / window.innerHeight, settings.camera.near, settings.camera.far );
        this.renderer = new THREE.WebGLRenderer();
        this.light = new THREE.AmbientLight( 'white' );
        this.clock = new THREE.Clock();
        this.delta = 0;

        this.camera.position.set(32, 1, 32);
        this.light.position.set(5, 5, 5);
        this.scene.add(this.light)

        this.init();

        this.needsRenderUpdate = true;
        this.Update();
    }

    private init(): void {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.scene.addEventListener('objectAdded', () => this.needsRenderUpdate = true);

        (document.getElementById("app") as HTMLDivElement).appendChild( this.renderer.domElement );
        window.onresize = () => this.onResize();
        document.body.oncontextmenu = () => false;
        window.onkeydown = (e) => e.preventDefault();
    }

    public removeAllObjects(objects: THREE.Mesh[]): void {
        while (objects.length) 
            this.removeObject(objects[0]);
    }

    public removeObject(object: THREE.Mesh): void {
        const geometry = object.geometry;
        const material: THREE.Material | THREE.Material[] = object.material;

        geometry.dispose();
        Array.isArray(material) ? material.forEach((material: THREE.Material) => material.dispose()) : material.dispose();
    
        object.parent?.remove(object);
    }

    public sameVectors(vec1: THREE.Vector2 | THREE.Vector3 | THREE.Vector4, vec2: THREE.Vector2 | THREE.Vector3 | THREE.Vector4) {
        vec1 = vec1 as THREE.Vector4;
        vec2 = vec2 as THREE.Vector4;
        return vec1.x === vec2.x && vec1.y === vec2.y &&  vec1.z === vec2.z && vec1.w === vec2.w;
    }

    private onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.needsRenderUpdate = true;
    }

    private Update(): void {
        requestAnimationFrame( () => this.Update() );
        this.delta = this.clock.getDelta()

        if (!this.needsRenderUpdate) return;
        this.renderer.render( this.scene, this.camera );
        this.needsRenderUpdate = false;
    }
}