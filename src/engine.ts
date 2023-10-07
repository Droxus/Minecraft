import * as THREE from 'three';

export class Engine {
    public scene = new THREE.Scene();
    public camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    public renderer = new THREE.WebGLRenderer();
    public clock = new THREE.Clock();
    public delta = 0;

    constructor() {
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        (document.getElementById("app") as HTMLDivElement).appendChild( this.renderer.domElement );

        this.camera.position.z = 5;

        window.addEventListener('resize', () => this.onResize());
        document.body.oncontextmenu = () => false;

        this.Update();
    }

    private onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
        this.delta = this.clock.getDelta()


        this.renderer.render( this.scene, this.camera );
    }
}