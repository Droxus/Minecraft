import Stats from 'three/examples/jsm/libs/stats.module.js';

export default class DevTools {
    public stats: any;

    constructor() {
        this.statsInit();

        this.Update();
    }

    private statsInit() {
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
    }

    private Update() {
        this.stats.begin();
        requestAnimationFrame( () => this.Update() );
        this.stats.end();
    }
}