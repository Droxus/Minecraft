import * as THREE from 'three';
import { engine } from './main';
import Blocks from './blocks'

const blocks = new Blocks();

export default class Map {
    private sides: string[];
    // private chunkSize: THREE.Vector3;
    private megaChunkSize: THREE.Vector3;
    public megaChunk: THREE.Vector2;
    private megaChunks: any[][] = [];
    private megaChunksGroup: THREE.Group;

    constructor() {
        console.time(); 

        this.sides = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ]
        // this.chunkSize = new THREE.Vector3(16, 256, 16);
        // this.megaChunkSize = new THREE.Vector3(512, 128, 512);
        this.megaChunkSize = new THREE.Vector3(64, 1, 64);
        // this.megaChunkSize = new THREE.Vector3(16, 1, 16);
        this.megaChunk = new THREE.Vector2(0, 0);
        this.megaChunks = [[[], [], []], [[], [], []], [[], [], []]]
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

        const toDisplayBlocks = this.checkBetweenChunksBlocksColide(generatedMegaChunk);

        this.displayGeneratedMegaChunk(toDisplayBlocks);
    }

    private getToDisplayBlocks(chunkArray: any) {
        const toDisplayBlocks: any = { };

        this.sides.forEach((side: any) => toDisplayBlocks[side] = [])

        const ySize = chunkArray.length;
        const xSize =  chunkArray[0].length;
        const zSize = chunkArray[0][0].length;

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

        return toDisplayBlocks;
    }

    private displayGeneratedMegaChunk(toDisplayBlocks: any) {
        const minHeight = 0;

        engine.removeAllObjects(this.megaChunksGroup.children as THREE.Mesh[]);

        for (let chunkX = 0; chunkX < 3; chunkX++) {
            for (let chunkZ = 0; chunkZ < 3; chunkZ++) {
                const x = (this.megaChunk.x + chunkX-1) * (this.megaChunkSize.x+1);
                const y = minHeight;
                const z = (this.megaChunk.y + chunkZ-1) * (this.megaChunkSize.z+1);
                const position = new THREE.Vector3(x, y, z)

                this.megaChunks[chunkX][chunkZ] = blocks.createInstances(toDisplayBlocks[chunkX][chunkZ], position);
                Object.values(this.megaChunks[chunkX][chunkZ]).forEach((cube: any) => { this.megaChunksGroup.add(cube) })
            }
        }
    }

    private checkBetweenChunksBlocksColide(chunks: any) {
        chunks.forEach((chunkRow: any[], x: number) =>
            chunkRow.forEach((_, y: number) => {
                const isRightSide = (x == 0 || x == 1);
                const isFrontSide = (y == 0 || y == 1);

                if (isRightSide) this.removeUndisplayableBlocks(chunks, x, y, true);
                if (isFrontSide) this.removeUndisplayableBlocks(chunks, x, y, false);
            })
        )

        return chunks;
    }

    private removeUndisplayableBlocks(chunks: any, x: number, y: number, condition: boolean) {
        const sides = condition ? [ 'right', 'left' ] : [ 'front', 'back' ];
        const neighbourPos = condition ? 2 : 0;
        const zShift = condition ? 0 : 1;
        const xShift = condition ? 1 : 0;

        chunks[x][y][sides[0]] = chunks[x][y][sides[0]].filter((block1: any) => {
            const [ x1, y1 ] = [ block1[1], block1[neighbourPos] ];

            return !chunks[x + xShift][y + zShift][sides[1]].some((block2: any, neighbourIndex: number) => {
                const [ x2, y2 ] = [ block2[1], block2[neighbourPos] ];

                if (x1 === x2 && y1 === y2) return delete chunks[x + xShift][y + zShift][sides[1]][neighbourIndex];
            })
        })
    }

    public onCameraPositionChange() {
        const { x, z } = engine.camera.position
        const xMegaChunk = Math.floor(x / (this.megaChunkSize.x+1));
        const yMegaChunk = Math.floor(z / (this.megaChunkSize.z+1))

        if (this.megaChunk.x !== xMegaChunk  || this.megaChunk.y !== yMegaChunk) {
            this.megaChunk.x = xMegaChunk;
            this.megaChunk.y = yMegaChunk;
            this.generateWorld();
        }
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
    }
}