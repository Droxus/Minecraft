import * as THREE from 'three';
import { engine } from './main';

export class Map {
      private cubeMaterial2 = new THREE.MeshBasicMaterial({color: 'blue'});
    // private xGrid = 16;
    // private yGrid = 128;
    // private zGrid = 16;
    // private xGrid = 512/2;
    // private yGrid = 512/2;
    // private zGrid = 512/2;

    private cubeTop: any;
    private cubeBottom: any;
    private cubeLeft: any;
    private cubeRight: any;
    private cubeFront: any;
    private cubeBack: any;

    private matrixTop = new THREE.Matrix4();
    private matrixBottom = new THREE.Matrix4();
    private matrixLeft = new THREE.Matrix4();
    private matrixRight = new THREE.Matrix4();
    private matrixFront = new THREE.Matrix4();
    private matrixBack = new THREE.Matrix4();

    cubeGeometry1: any;
    cubeGeometry2: any;
    // private lod = new THREE.LOD();
    
    constructor() {
        this.generateWorld()

        engine.needRenderUpdate = true;
        this.Update();
    }
    private generateWorld() {
        const chunkArray = this.getGeneratedChunk();
        console.log(chunkArray)
        // when block updating it should check all neighbour blocks
        const toDisplayBlocks = this.getToDisplayBlocks(chunkArray)
        console.log(toDisplayBlocks)

        this.displayBlocks(toDisplayBlocks);
    }
    private displayBlocks(toDisplayBlocks: any) {
        const positionAttribute = new Float32Array([
            // Front face
            -1.0, -1.0, 1.0,    // 0
            1.0, -1.0, 1.0,     // 1
            1.0, 1.0, 1.0,      // 2
            -1.0, 1.0, 1.0,     // 3

            // Back face
            -1.0, -1.0, -1.0,   // 4
            1.0, -1.0, -1.0,    // 5
            1.0, 1.0, -1.0,     // 6
            -1.0, 1.0, -1.0     // 7
        ]);


        const indicesTop = [6, 3, 2, 7, 3, 6]
        const indicesBottom = [4, 5, 0, 0, 5, 1]
        const indicesLeft = [0, 3, 4, 4, 3, 7]
        const indicesRight = [5, 2, 1, 6, 2, 5]
        const indicesFront = [0, 1, 2, 0, 2, 3]
        const indicesBack = [5, 7, 6, 4, 7, 5]

        let geometry2

        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesTop );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeTop = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.top.length);
        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesBottom );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeBottom = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.bottom.length);
        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesLeft );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeLeft = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.left.length);
        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesRight );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeRight = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.right.length);
        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesFront );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeFront = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.front.length);
        geometry2 = new THREE.InstancedBufferGeometry();
        geometry2.setIndex( indicesBack );
        geometry2.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        this.cubeBack = new THREE.InstancedMesh(geometry2, this.cubeMaterial2, toDisplayBlocks.back.length);
        geometry2 = new THREE.InstancedBufferGeometry();

        for (let i = 0; i < toDisplayBlocks.top.length; i++) {
            let thisPos = toDisplayBlocks.top[i]
            this.matrixTop.setPosition(thisPos[0] * 2 + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeTop.setMatrixAt(i, this.matrixTop);
        }
        for (let i = 0; i < toDisplayBlocks.bottom.length; i++) {
            let thisPos = toDisplayBlocks.bottom[i]
            this.matrixBottom.setPosition(thisPos[0] * 2  + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeBottom.setMatrixAt(i, this.matrixBottom);
        }
        for (let i = 0; i < toDisplayBlocks.left.length; i++) {
            let thisPos = toDisplayBlocks.left[i]
            this.matrixLeft.setPosition(thisPos[0] * 2  + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeLeft.setMatrixAt(i, this.matrixLeft);
        }
        for (let i = 0; i < toDisplayBlocks.right.length; i++) {
            let thisPos = toDisplayBlocks.right[i]
            this.matrixRight.setPosition(thisPos[0] * 2  + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeRight.setMatrixAt(i, this.matrixRight);
        }
        for (let i = 0; i < toDisplayBlocks.front.length; i++) {
            let thisPos = toDisplayBlocks.front[i]
            this.matrixFront.setPosition(thisPos[0] * 2  + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeFront.setMatrixAt(i, this.matrixFront);
        }
        for (let i = 0; i < toDisplayBlocks.back.length; i++) {
            let thisPos = toDisplayBlocks.back[i]
            this.matrixBack.setPosition(thisPos[0] * 2  + 2, thisPos[1] * 2  + 2, thisPos[2] * 2  + 2);
            this.cubeBack.setMatrixAt(i, this.matrixBack);
        }

        engine.scene.add(this.cubeTop)
        engine.scene.add(this.cubeBottom)
        engine.scene.add(this.cubeLeft)
        engine.scene.add(this.cubeRight)
        engine.scene.add(this.cubeFront)
        engine.scene.add(this.cubeBack)
    }
    private getToDisplayBlocks(chunkArray: any) {
        let toDisplayBlocks: any = {
            top: [],
            bottom: [],
            left: [],
            right: [],
            front: [],
            back: []
        };

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