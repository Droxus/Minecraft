import * as THREE from 'three';
import { engine, blocks, settings } from './main';

export default class Map {
    private drawDiameter: number;
    private gridSize: number;
    private minHeight: number;
    private chunkSize: THREE.Vector3;
    private megaChunkSize: THREE.Vector3;
    private megaChunks: any[][] = [];
    private megaChunksGroup: THREE.Group;

    public megaChunk: THREE.Vector2;

    constructor() {
        console.time(); 

        this.gridSize = 3;
        this.minHeight = 0;
        this.drawDiameter = settings.map.drawRadius * 2;
        this.megaChunks = new Array(3).fill(null).map(() => new Array(3).fill([]));
        this.megaChunk = new THREE.Vector2(0, 0);
        this.chunkSize = new THREE.Vector3(16, 256, 16);
        this.megaChunkSize = new THREE.Vector3(this.drawDiameter * this.chunkSize.x, 1, this.drawDiameter * this.chunkSize.z);
        this.megaChunksGroup = new THREE.Group();
        engine.scene.add(this.megaChunksGroup)
        
        this.onCameraPositionChange();
        this.generateWorld();

        engine.needsRenderUpdate = true;

        console.timeEnd();
        this.Update();
    }

    private generateWorld() {
        const generatedMegaChunk = this.getGeneratedMegaChunk();
        // const toDisplayBlocks = this.checkBetweenChunksBlocksColide(generatedMegaChunk);

        // this.displayGeneratedMegaChunk(toDisplayBlocks);

        this.displayGeneratedMegaChunk(generatedMegaChunk);
    }

    private getToDisplayBlocks(chunkArray: any) {
        const toDisplayBlocks: any = { };
        const ySize = chunkArray.length;
        const xSize =  chunkArray[0].length;
        const zSize = chunkArray[0][0].length;

        blocks.sides.forEach((side: any) => toDisplayBlocks[side] = [])

        for (let y = 0; y < ySize; ++y) {
            for (let x = 0; x < xSize; ++x) {
                for (let z = 0; z < zSize; ++z) {
                    if (chunkArray[y][x][z] && chunkArray[y][x][z].name !== 'air') {      
                        if (!chunkArray[y+1] || chunkArray[y+1][x][z].name == 'air') toDisplayBlocks.top.push([x, y, z]);
                        if (!chunkArray[y-1] || chunkArray[y-1][x][z].name == 'air') toDisplayBlocks.bottom.push([x, y, z]);
                        if (x !== 0 && x !== xSize-1) {
                            if (!chunkArray[y][x+1] || chunkArray[y][x+1][z].name == 'air') toDisplayBlocks.right.push([x, y, z]);
                            if (!chunkArray[y][x-1] || chunkArray[y][x-1][z].name == 'air') toDisplayBlocks.left.push([x, y, z]);
                        }
                        if (z !== 0 && z !== zSize-1) {
                            if (!chunkArray[y][x][z+1] || chunkArray[y][x][z+1].name == 'air') toDisplayBlocks.front.push([x, y, z]);
                            if (!chunkArray[y][x][z-1] || chunkArray[y][x][z-1].name == 'air') toDisplayBlocks.back.push([x, y, z]);
                        }
                    }
                }
            }
        }

        return toDisplayBlocks; 
    }

    private generateBlock(x: number, y: number, z: number) {
        const defaultBlock = 'stone';
        return {name: defaultBlock};
    }

    private getGeneratedChunk() {
        const chunkArray = new Array(this.megaChunkSize.y)
            .fill(null).map(() => new Array(this.megaChunkSize.x)
                .fill([]).map(() => new Array(this.megaChunkSize.z).fill([])));

        chunkArray.forEach((_, y) => 
            chunkArray[y].forEach((_, x) => 
                chunkArray[y][x].forEach((_, z) => chunkArray[y][x][z] = this.generateBlock(x, y, z) )));

        return chunkArray;
    }

    private getGeneratedMegaChunk() {
        let chunkView: any[][] = [];
        let toDisplayBlocks: any[][] = [];

        for (let chunkX = 0; chunkX < this.gridSize; chunkX++) {
            chunkView.push([]);
            toDisplayBlocks.push([]);
            for (let chunkZ = 0; chunkZ < this.gridSize; chunkZ++) {
                const chunkArray = this.getGeneratedChunk();
                chunkView[chunkX].push(chunkArray);

                const toDisplayBlocksChunk = this.getToDisplayBlocks(chunkView[chunkX][chunkZ]);
                toDisplayBlocks[chunkX].push(toDisplayBlocksChunk);
            }
        }

        return toDisplayBlocks;
    }

    private displayGeneratedMegaChunk(toDisplayBlocks: any) {
        const objectsToRemove: any[] = [];

        this.megaChunksGroup.children.forEach((child: any) => {
            if (
                child.megaChunk.x < this.megaChunk.x - 1 || child.megaChunk.x > this.megaChunk.x + 1 ||
                child.megaChunk.y < this.megaChunk.y - 1 || child.megaChunk.y > this.megaChunk.y + 1
            ) objectsToRemove.push(child);
        });

        objectsToRemove.forEach((object) => engine.removeObject(object as THREE.Mesh));

        for (let chunkX = 0; chunkX < this.gridSize; chunkX++) {
            for (let chunkZ = 0; chunkZ < this.gridSize; chunkZ++) {
                const thisChunk = new THREE.Vector2(this.megaChunk.x + chunkX-1, this.megaChunk.y + chunkZ-1);
                const groupChildren = this.megaChunksGroup.children;
                const chunkDisplaying = groupChildren.filter((child: any) => engine.sameVectors(child.megaChunk, thisChunk)).length > 0;

                if (!chunkDisplaying) {
                    const [ x, y, z ] = [ thisChunk.x * (this.megaChunkSize.x+1), this.minHeight, thisChunk.y * (this.megaChunkSize.z+1) ];
                    const position = new THREE.Vector3(x, y, z);
    
                    this.megaChunks[chunkX][chunkZ] = blocks.createInstances(toDisplayBlocks[chunkX][chunkZ], position, []);
                    Object.values(this.megaChunks[chunkX][chunkZ]).forEach((cube: any) => {
                        cube.megaChunk = new THREE.Vector2(thisChunk.x, thisChunk.y);
                        this.megaChunksGroup.add(cube);
                    })
                }
            }
        }
    }

    // private checkBetweenChunksBlocksColide(chunks: any) {
    //     chunks.forEach((chunkRow: any[], x: number) =>
    //         chunkRow.forEach((_, y: number) => {
    //             const isRightSide = (x == 0 || x == 1);
    //             const isFrontSide = (y == 0 || y == 1);

    //             if (isRightSide) this.removeUndisplayableBlocks(chunks, x, y, true);
    //             if (isFrontSide) this.removeUndisplayableBlocks(chunks, x, y, false);
    //         })
    //     )

    //     return chunks;
    // }

    // private removeUndisplayableBlocks(chunks: any, x: number, y: number, condition: boolean) {
    //     const sides = condition ? [ 'right', 'left' ] : [ 'front', 'back' ];
    //     const neighbourPos = condition ? 2 : 0;
    //     const zShift = condition ? 0 : 1;
    //     const xShift = condition ? 1 : 0;

    //     chunks[x][y][sides[0]] = chunks[x][y][sides[0]].filter((block1: any) => {
    //         const [ x1, y1 ] = [ block1[1], block1[neighbourPos] ];

    //         return !chunks[x + xShift][y + zShift][sides[1]].some((block2: any, neighbourIndex: number) => {
    //             const [ x2, y2 ] = [ block2[1], block2[neighbourPos] ];

    //             if (x1 === x2 && y1 === y2) return delete chunks[x + xShift][y + zShift][sides[1]][neighbourIndex];
    //         })
    //     })
    // }

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