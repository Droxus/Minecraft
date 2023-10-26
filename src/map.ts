import { engine } from './main';
import Blocks from './blocks'

const blocks = new Blocks();

export default class Map {
    // private xGrid = 512/2;
    // private yGrid = 512/2;
    // private zGrid = 512/2;
    private sides: string[] = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ]

    constructor() {
        console.time(); 

        this.generateWorld();

        engine.needRenderUpdate = true;

        console.timeEnd();

        this.Update();
    }
    private generateWorld() {
        const chunkArray = this.getGeneratedChunk();
        console.log(chunkArray)
        // when block updating it should check all neighbour blocks
        const toDisplayBlocks = this.getToDisplayBlocks(chunkArray)
        console.log(toDisplayBlocks)

        blocks.create(toDisplayBlocks);
    }
    private getToDisplayBlocks(chunkArray: any) {
        const toDisplayBlocks: any = { };

        this.sides.forEach((side: any) => toDisplayBlocks[side] = [])

        let ySize = chunkArray.length;
        let xSize =  chunkArray[0].length;
        let zSize = chunkArray[0][0].length;

        console.log(chunkArray)
        for (let y = 0; y < ySize; ++y) {
            for (let x = 0; x < xSize; ++x) {
                for (let z = 0; z < zSize; ++z) {
                    if (chunkArray[y][x][z] && chunkArray[y][x][z].name !== 'air') {
                        if (y+1 > ySize-1) toDisplayBlocks.top.push([x, y, z])
                            else if (chunkArray[y+1][x][z].name == 'air') toDisplayBlocks.top.push([x, y, z]);
                        
                        if (y-1 < 0) toDisplayBlocks.bottom.push([x, y, z])
                            else if (chunkArray[y-1][x][z].name == 'air') toDisplayBlocks.bottom.push([x, y, z]);

                        if (x+1 > xSize-1) toDisplayBlocks.right.push([x, y, z])
                            else if (chunkArray[y][x+1][z].name == 'air') toDisplayBlocks.right.push([x, y, z]);

                        if (x-1 < 0) toDisplayBlocks.left.push([x, y, z])
                            else if (chunkArray[y][x-1][z].name == 'air') toDisplayBlocks.left.push([x, y, z]);

                        if (z+1 > zSize-1) toDisplayBlocks.front.push([x, y, z])
                            else if (chunkArray[y][x][z+1].name == 'air') toDisplayBlocks.front.push([x, y, z]);

                        if (z-1 < 0) toDisplayBlocks.back.push([x, y, z])
                            else if (chunkArray[y][x][z-1].name == 'air') toDisplayBlocks.back.push([x, y, z]);
                    }
                }
            }
        }

        return toDisplayBlocks; 
    }
    private getGeneratedChunk() {
        // const width = 1024*1;
        // const height = 64;
        // const depth = 1024*1;
        const width = 16;
        const height = 64;
        const depth = 16;

        let chunkArray = [];

        for (let y = 0; y < height; y++) {
            chunkArray.push([]);
            for (let x = 0; x < width; x++) {
                (chunkArray[y] as any).push([])
                for (let z = 0; z < depth; z++) {
                    ((chunkArray[y] as any)[x] as any).push({name: 'stone'})
                }
            }
        }

        return chunkArray;
    }

    private Update() {
        requestAnimationFrame( () => this.Update() );
    }
}