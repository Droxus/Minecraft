import Stats from 'three/examples/jsm/libs/stats.module.js';
import { engine, controls, map } from './main'

export default class DevTools {
    public stats: any;
    private keys: any;

    constructor() {
        this.initStats();
        this.initKeys();

        this.openInfoBlock();

        window.addEventListener("keydown", (event) => this.keys?.[event.key]?.()); // move this to controls

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
            
        const infoLines = [
            {
                id: "cameraPosInfoLabel",
                header: "Camera Position",
                callback: this.updateCameraDevInfo
            },
            {
                id: "megaChunkLabel",
                header: "Mega Chunk",
                callback: this.updateCameraDevInfo
            }
        ]

        infoLines.forEach((infoLine) => this.addInfoBlockLine(infoLine))
    }

    private addInfoBlockLine(infoLine: any) {
        const devInfoBlock =  document.getElementById("devInfoBlock") as HTMLDivElement;

        const infoLineLabel = document.createElement("label");
        infoLineLabel.innerText = infoLine.header;
        devInfoBlock.appendChild(infoLineLabel);

        const infoLabel = document.createElement("label");
        infoLabel.id = infoLine.id;
        devInfoBlock.appendChild(infoLabel);

        infoLine.callback();
    }

    private updateCameraDevInfo(): void {
        const { x, y, z } = engine.camera.position;
        let decimalPlaces;

        decimalPlaces = 3
        const cameraPosInfoLabel = document.getElementById("cameraPosInfoLabel") as HTMLLabelElement;
        if (cameraPosInfoLabel) cameraPosInfoLabel.innerText = `x: ${x.toFixed(decimalPlaces)}, y: ${y.toFixed(decimalPlaces)}, z: ${z.toFixed(decimalPlaces)}`;

        decimalPlaces = 0;
        const megaChunkLabel = document.getElementById("megaChunkLabel") as HTMLLabelElement;
        if (megaChunkLabel) megaChunkLabel.innerText = `x: ${map.megaChunk.x.toFixed(decimalPlaces)}, z: ${map.megaChunk.y.toFixed(decimalPlaces)}`;
    }



    private Update() {
        this.stats.begin();
        requestAnimationFrame( () => this.Update() );
        this.stats.end();
    }
}