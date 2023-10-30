import * as THREE from 'three';
import { engine } from './main';
import Blocks from './blocks'

const blocks = new Blocks();

export default class Map {
    private sides: string[];
    // private chunkSize: THREE.Vector3;
    private megaChunkSize: THREE.Vector3;

    constructor() {
        console.time(); 

        this.sides = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ]
        // this.chunkSize = new THREE.Vector3(16, 256, 16);
        // this.megaChunkSize = new THREE.Vector3(512, 128, 512);
        this.megaChunkSize = new THREE.Vector3(64, 1, 64);
        // this.megaChunkSize = new THREE.Vector3(16, 1, 16);

        this.generateWorld();

        engine.needsRenderUpdate = true;

        console.timeEnd();

        this.Update();
    }

    private generateWorld() {
        // const chunkArray = this.getGeneratedChunk();
        // console.log(chunkArray)

        const megaChunkArray = this.getGeneratedMegaChunk();
        console.log(megaChunkArray)

        // const toDisplayBlocks = this.getToDisplayBlocks(megaChunkArray)
        // console.log(toDisplayBlocks)

        // blocks.create(toDisplayBlocks);
    }

    private getToDisplayBlocks(chunkArray: any) {
        const toDisplayBlocks: any = { };

        this.sides.forEach((side: any) => toDisplayBlocks[side] = [])

        const ySize = chunkArray.length;
        const xSize =  chunkArray[0].length;
        const zSize = chunkArray[0][0].length;

        console.log(chunkArray)
        for (let y = 0; y < ySize; ++y) {
            for (let x = 0; x < xSize; ++x) {
                for (let z = 0; z < zSize; ++z) {
                    if (chunkArray[y][x][z] && chunkArray[y][x][z].name !== 'air') {
                        
                        if (!chunkArray[y+1] || chunkArray[y+1][x][z].name == 'air') toDisplayBlocks.top.push([x, y, z]);
                        
                        if (!chunkArray[y-1] || chunkArray[y-1][x][z].name == 'air') toDisplayBlocks.bottom.push([x, y, z]);

                        if (!chunkArray[y][x+1] || chunkArray[y][x+1][z].name == 'air') toDisplayBlocks.right.push([x, y, z]);

                        if (!chunkArray[y][x-1] || chunkArray[y][x-1][z].name == 'air') toDisplayBlocks.left.push([x, y, z]);

                        if (!chunkArray[y][x][z+1] || chunkArray[y][x][z+1].name == 'air') toDisplayBlocks.front.push([x, y, z]);

                        if (!chunkArray[y][x][z-1] || chunkArray[y][x][z-1].name == 'air') toDisplayBlocks.back.push([x, y, z]);
                    }
                }
            }
        }

        return toDisplayBlocks; 
    }

    private getGeneratedChunk() {
        const chunkArray: any = [];

        for (let y = 0; y < this.megaChunkSize.y; y++) {
            chunkArray.push([]);
            for (let x = 0; x < this.megaChunkSize.x; x++) {
                chunkArray[y].push([])
                for (let z = 0; z < this.megaChunkSize.z; z++) {
                    chunkArray[y][x].push({name: 'stone'})
                }
            }
        }

        return chunkArray;
    }

    private getGeneratedMegaChunk() {
        const minHeight = 0;
        const position = {x: -1, y: 0, z: 0}; // camera position
        const {x, z} = position;

        const centerChunkX = Math.ceil(x / (this.megaChunkSize.x));
        const centerChunkZ = Math.ceil(z / (this.megaChunkSize.z));
        let chunkView: any[][] = [];
        let toDisplayBlocks: any[][] = [];

        for (let chunkX = 0; chunkX < 3; chunkX++) {
            chunkView.push([]);
            toDisplayBlocks.push([]);
            for (let chunkZ = 0; chunkZ < 3; chunkZ++) {
                const chunkArray = this.getGeneratedChunk();
                chunkView[chunkX].push(chunkArray);

                const toDisplayBlocksChunk = this.getToDisplayBlocks(chunkView[chunkX][chunkZ]);
                toDisplayBlocks[chunkX].push(toDisplayBlocksChunk);
            }
        }

        toDisplayBlocks = this.checkBetweenChunksBlocksColide(toDisplayBlocks);

        for (let chunkX = 0; chunkX < 3; chunkX++) {
            for (let chunkZ = 0; chunkZ < 3; chunkZ++) {
                const x = (centerChunkX + chunkX-1) * (this.megaChunkSize.x+1);
                const y = minHeight;
                const z = (centerChunkZ + chunkZ-1) * (this.megaChunkSize.z+1);
                const position = new THREE.Vector3(x, y, z)

                blocks.createInstances(toDisplayBlocks[chunkX][chunkZ], position);
            }
        }
    }

    private checkBetweenChunksBlocksColide(chunks: any) {
        chunks.forEach((chunkRow: any[], x: number) =>
            chunkRow.forEach((_, y: number) => {
                const isRightSide = (x == 0 || x == 1);
                const isFrontSide = (y == 0 || y == 1);

                if (isRightSide) this.removeUndisplaybleBlocks(chunks, x, y, 2, ['right', 'left'], 0, 1);
                if (isFrontSide) this.removeUndisplaybleBlocks(chunks, x, y, 0, ['front', 'back'], 1, 0);
            })
        )

        return chunks;
    }

    private removeUndisplaybleBlocks(chunks: any, x: number, y: number, neighbourPos: number, sides: string[], isRightSide: number, isFrontSide: number) {
        chunks[x][y][sides[0]].forEach((block1: any[], currentIndex: number) => {
            const x1 = block1[1];
            const y1 = block1[neighbourPos];
            chunks[x + isFrontSide][y + isRightSide][sides[1]].forEach((block2: any, neighbourIndex: number) => {
                const x2 = block2[1];
                const y2 = block2[neighbourPos];
                if (x1 == x2 && y1 == y2) {
                    delete chunks[x][y][sides[0]][currentIndex];
                    delete chunks[x + isFrontSide][y + isRightSide][sides[1]][neighbourIndex];
                }
            })
        })
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
    }
}