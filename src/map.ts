import * as THREE from 'three';
import { engine, blocks, settings } from './main';

export default class Map {
    private gridSize: number;
    private minHeight: number;
    private chunkSize: THREE.Vector3;
    private megaChunkSize: THREE.Vector3;
    private megaChunks: any[][];
    private megaChunksGroup: THREE.Group;
    private betweenChunksBlocks: any;

    public megaChunk: THREE.Vector2;

    constructor() {
        console.time();

        this.gridSize = 5;
        this.minHeight = 0;
        this.megaChunks = new Array(this.gridSize).fill(null).map(() => new Array(this.gridSize).fill([]));
        this.megaChunk = new THREE.Vector2(0, 0);
        this.chunkSize = new THREE.Vector3(16, 256, 16);
        this.megaChunkSize = new THREE.Vector3(settings.map.drawRadius * this.chunkSize.x, 2, settings.map.drawRadius * this.chunkSize.z);
        this.megaChunksGroup = new THREE.Group();
        engine.scene.add(this.megaChunksGroup)
        
        this.onCameraPositionChange();
        this.generateWorld();

        engine.needsRenderUpdate = true;

        console.timeEnd();
        this.Update();
    }

    private generateWorld() {
        const chunkView = this.getGeneratedChunkView();
        const toDisplayBlocks = this.getDisplayableChunkView(chunkView);

        this.deleteChunksOutView()

        this.displayInViewChunks(toDisplayBlocks);
        this.displayBetweenChunksBlocks(chunkView);
    }

    private getGenerateBlock(x: number, y: number, z: number) {
        // const defaultBlock = (y == 1 && !(x == 0 || z == 0 || x == this.megaChunkSize.x-1 || z == this.megaChunkSize.z-1)) ? 'air' : 'stone';
        const defaultBlock = (y == 1 && !(x == 63 || z == 63)) ? 'air' : 'stone';
        // const defaultBlock = (y == 1 && !(x == 0 || z == 0)) ? 'air' : 'stone';
        return {name: defaultBlock};
    }

    private getGeneratedChunk() {
        const chunkArray = new Array(this.megaChunkSize.y)
            .fill(null).map(() => new Array(this.megaChunkSize.x)
                .fill([]).map(() => new Array(this.megaChunkSize.z).fill([])));

        chunkArray.forEach((_, y) => 
            chunkArray[y].forEach((_, x) => 
                chunkArray[y][x].forEach((_, z) => chunkArray[y][x][z] = this.getGenerateBlock(x, y, z) )));

        return chunkArray;
    }

    private getGeneratedChunkView() {
        const chunkView = new Array(this.gridSize)
            .fill(null).map(() => new Array(this.gridSize).fill([]));

        chunkView.forEach((_, x) => 
            chunkView[x].forEach((_, y) => 
                chunkView[x][y] = this.getGeneratedChunk() ));

        return chunkView;
    }

    private getDisplayableChunkView(chunkView: any[][]) {
        const toDisplayBlocks = new Array(this.gridSize)
            .fill(null).map(() => new Array(this.gridSize).fill([]));

        toDisplayBlocks.forEach((_, x) => 
            toDisplayBlocks[x].forEach((_, y) => 
                toDisplayBlocks[x][y] = this.getDisplayableBlocks(chunkView[x][y]) ));

        return toDisplayBlocks;
    }

    private deleteChunksOutView() {
        this.megaChunksGroup.children.filter((child: any) => 
            child.megaChunk.x < this.megaChunk.x - 1 || child.megaChunk.x > this.megaChunk.x + 1 ||
            child.megaChunk.y < this.megaChunk.y - 1 || child.megaChunk.y > this.megaChunk.y + 1
        ).forEach((object) => engine.removeObject(object as THREE.Mesh));
    }

    private displayMegaChunk(toDisplayBlocks: any, chunkX: number, chunkZ: number) {
        const thisChunk = new THREE.Vector2(this.megaChunk.x + chunkX-1, this.megaChunk.y + chunkZ-1);
        const isChunkDisplaying = this.megaChunksGroup.children.filter((child: any) => engine.sameVectors(child.megaChunk, thisChunk)).length > 0;

        if (!isChunkDisplaying) {
            const [ x, y, z ] = [ thisChunk.x * (this.megaChunkSize.x+1), this.minHeight, thisChunk.y * (this.megaChunkSize.z+1) ];
            const position = new THREE.Vector3(x, y, z);

            this.megaChunks[chunkX][chunkZ] = blocks.createInstances(toDisplayBlocks[chunkX][chunkZ], position, []);
            Object.values(this.megaChunks[chunkX][chunkZ]).forEach((cube: any) => {
                cube.megaChunk = new THREE.Vector2(thisChunk.x, thisChunk.y);
                this.megaChunksGroup.add(cube);
            })
        }
    }

    private getNeighbourSides(chunkArray: any, y: number, x: number, z: number) {
        const neighbourSides: string[] = [];

        if (chunkArray[y][x][z].name !== 'air') {      
            if (!chunkArray[y+1] || chunkArray[y+1][x][z].name == 'air') neighbourSides.push('top');
            if (!chunkArray[y-1] || chunkArray[y-1][x][z].name == 'air') neighbourSides.push('bottom');
            if (x !== this.megaChunkSize.x-1 && (!chunkArray[y][x+1] || chunkArray[y][x+1][z].name == 'air')) neighbourSides.push('right');
            if (x !== 0 && (!chunkArray[y][x-1] || chunkArray[y][x-1][z].name == 'air')) neighbourSides.push('left');
            if (z !== this.megaChunkSize.z-1 && (!chunkArray[y][x][z+1] || chunkArray[y][x][z+1].name == 'air')) neighbourSides.push('front');
            if (z !== 0 && (!chunkArray[y][x][z-1] || chunkArray[y][x][z-1].name == 'air')) neighbourSides.push('back');
        }

        return neighbourSides;
    }

    private getDisplayableBlocks(chunkArray: any[][][]) {
        const toDisplayBlocks: any = { };
        blocks.sides.forEach((side: any) => toDisplayBlocks[side] = [])

        chunkArray.forEach((_, y) => 
            chunkArray[y].forEach((_, x) => 
                chunkArray[y][x].forEach((_, z) => 
                    this.getNeighbourSides(chunkArray, y, x, z).forEach((side: string) => toDisplayBlocks[side].push([x, y, z])) )));

        return toDisplayBlocks;
    }

    private displayInViewChunks(toDisplayBlocks: any) {
        this.megaChunks.forEach((_, x) => 
            this.megaChunks.forEach((_, z) => 
                this.displayMegaChunk(toDisplayBlocks, x, z) ));
    }

    private getBetweenChunksBlocks(params: any) {
        const {chunkView, chunkX, chunkZ, y, x} = params;
        const [xPos, zPos] = [(this.megaChunk.x + chunkX-1) * (this.megaChunkSize.x+1), (this.megaChunk.y + chunkZ-1) * (this.megaChunkSize.z+1)];
        const position = new THREE.Vector3(xPos, y, zPos);
        const collidedSides: any = [];
        const z = x;
        
        if (chunkZ < 2) {
            const currentBlockName = chunkView[chunkX][chunkZ+1][y][x][0].name;
            const neighbourBlockName = chunkView[chunkX][chunkZ][y][x][this.megaChunkSize.z-1].name;

            if (currentBlockName !== "air" && neighbourBlockName == "air") {
                const positionArray = [position.x  + x, y, position.z + (this.megaChunkSize.z+1)];
                collidedSides.push({"name": currentBlockName, "position": positionArray, "side": "back"});
            } 
            else if (currentBlockName == "air" && neighbourBlockName !== "air") {
                const positionArray = [position.x + x, y, position.z + (this.megaChunkSize.z-1)];
                collidedSides.push({"name": neighbourBlockName, "position": positionArray, "side": "front" });
            }
        }
        
        if (chunkX < 2) {
            const currentBlockName = chunkView[chunkX+1][chunkZ][y][0][z].name;
            const neighbourBlockName = chunkView[chunkX][chunkZ][y][this.megaChunkSize.z-1][z].name;

            if (currentBlockName !== "air" && neighbourBlockName == "air") {
                const positionArray = [position.x + (this.megaChunkSize.x+1), y, position.z + z];
                collidedSides.push({"name": currentBlockName, "position": positionArray, "side": "left"});
            } 
            else if (currentBlockName == "air" && neighbourBlockName !== "air") {
                const positionArray = [position.x + (this.megaChunkSize.z-1), y, position.z + z];
                collidedSides.push({"name": neighbourBlockName, "position": positionArray, "side": "right"});
            }
        }

        return collidedSides;
    }

    private displayBetweenChunksBlocks(chunkView: any[][][][]) {
        blocks.sides.forEach((side: string) => engine.scene.remove(this.betweenChunksBlocks ? this.betweenChunksBlocks[side] : undefined))
        const position = new THREE.Vector3(0,0,0)
        const colidedSides: any = [];

        chunkView.forEach((_, chunkX) =>
            chunkView[chunkX].forEach((_, chunkZ) =>
                chunkView[chunkX][chunkZ].forEach((_, y) =>
                    chunkView[chunkX][chunkZ][y].forEach((_, x) =>
                        colidedSides.push(...this.getBetweenChunksBlocks({chunkView, chunkX, chunkZ, y, x}).slice(0, 2)) ))))

        console.log(colidedSides)

        let betweenChunksBlocks: any = {};
        blocks.sides.forEach((side: string) => betweenChunksBlocks[side] = []);
        colidedSides.forEach((_: any, x: number) => betweenChunksBlocks[colidedSides[x].side].push(colidedSides[x].position));

        if (!betweenChunksBlocks) 
            return;

        this.betweenChunksBlocks = blocks.createInstances(betweenChunksBlocks, position, []);
        blocks.sides.forEach((side: string) => engine.scene.add(this.betweenChunksBlocks[side]));
    }

    public onCameraPositionChange() {
        const { x, z } = engine.camera.position;
        const [ thisX, thisY ] = [ Math.floor(x / (this.megaChunkSize.x+1)), Math.floor(z / (this.megaChunkSize.z+1)) ];
        const thisMegaChunk = new THREE.Vector2(thisX, thisY);

        if (!engine.sameVectors(this.megaChunk, thisMegaChunk)) {
            this.megaChunk = thisMegaChunk;
            this.generateWorld();
        }
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
    }
}