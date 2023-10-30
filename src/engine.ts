import * as THREE from 'three';

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
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.light = new THREE.AmbientLight( 0xffffff );
        this.clock = new THREE.Clock();
        this.delta = 0;

        this.camera.position.z = 5;
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
        window.addEventListener('resize', () => this.onResize());
        document.body.oncontextmenu = () => false;
    }

    private onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    private Update(): void {
        requestAnimationFrame( () => this.Update() );
        this.delta = this.clock.getDelta()

        if (!this.needsRenderUpdate) return;
        this.renderer.render( this.scene, this.camera );
        this.needsRenderUpdate = false;
    }
}