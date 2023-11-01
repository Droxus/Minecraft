import Stats from 'three/examples/jsm/libs/stats.module.js';
import { engine, controls } from './main'

export default class DevTools {
    public stats: any;
    private keys: any;

    constructor() {
        this.initStats();
        this.initKeys();

        this.openInfoBlock();

        window.addEventListener("keydown", (event) => this.keys?.[event.key]?.())

        this.Update();
    }

    private initStats() {
        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );
    }

    private initKeys() {
        this.keys = {
            "F3": () => this.openInfoBlock()
        }
    }

    private openInfoBlock() {
        const devInfoDiv = document.getElementById("devInfoBlock") as HTMLDivElement;
        controls.controls.removeEventListener('change', this.updateCameraDevInfo);
        if (devInfoDiv) return devInfoDiv?.remove();

        const appDiv = document.getElementById("app") as HTMLDivElement;
        const devInfoBlock = document.createElement("div");
        devInfoBlock.id = "devInfoBlock";

        controls.controls.addEventListener('change', this.updateCameraDevInfo);
        appDiv.appendChild(devInfoBlock);
            
        const infoLine = {id: "cameraPosInfoLabel", header: "Camera Position"}
        this.addInfoBlockLine(infoLine, this.updateCameraDevInfo);
    }

    private addInfoBlockLine(infoLine: any, toUpdateData: any) {
        const devInfoBlock =  document.getElementById("devInfoBlock") as HTMLDivElement;

        const infoLineLabel = document.createElement("label");
        infoLineLabel.innerText = infoLine.header;
        devInfoBlock.appendChild(infoLineLabel);

        const infoLabel = document.createElement("label");
        infoLabel.id = infoLine.id;
        devInfoBlock.appendChild(infoLabel);

        toUpdateData();
    }

    private updateCameraDevInfo(): void {
        const cameraPosInfoLabel = document.getElementById("cameraPosInfoLabel") as HTMLLabelElement;
        const decimalPlaces = 3;
        const {x, y, z} = engine.camera.position;
        if (cameraPosInfoLabel) cameraPosInfoLabel.innerText = `x: ${x.toFixed(decimalPlaces)}, y: ${y.toFixed(decimalPlaces)}, z: ${z.toFixed(decimalPlaces)}`;
    }



    private Update() {
        this.stats.begin();
        requestAnimationFrame( () => this.Update() );
        this.stats.end();
    }
}