import * as THREE from 'three';
import { engine } from './main';

export class Map {
      private cubeMaterial2 = new THREE.MeshBasicMaterial({
        // color: 'blue',
       vertexColors: true});
      private cubeMaterial3 = new THREE.MeshBasicMaterial({color: 'yellow'});
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
        const texture = new THREE.TextureLoader().load('./src/assets/textures/redstone_ore.png');

        texture.format = THREE.RGBAFormat
        
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
  
        const geometryWidth = 16; 
        const geometryHeight = 16; 
        const textureWidth = 16;
        const textureHeight = 16;
        const textureAspect = textureWidth / textureHeight;
        const geometryAspect = geometryWidth / geometryHeight; 
        if (textureAspect > geometryAspect) {
          texture.repeat.set(geometryWidth / textureWidth, 1);
        } else {
          texture.repeat.set(1, geometryHeight / textureHeight);
        }

        const material = new THREE.MeshBasicMaterial({ map: texture });

        const cubeSize = 0.5;

        const positionAttribute = new Float32Array([
            cubeSize, cubeSize, cubeSize,      //0
            cubeSize, cubeSize, -cubeSize,     //1
            cubeSize, -cubeSize, cubeSize,     //2
            cubeSize, -cubeSize, -cubeSize,    //3

            -cubeSize, cubeSize, -cubeSize,    //4
            -cubeSize, cubeSize, cubeSize,     //5
            -cubeSize, -cubeSize,-cubeSize,    //6
            -cubeSize, -cubeSize, cubeSize,    //7
            
            -cubeSize, cubeSize, -cubeSize,    //8
            cubeSize, cubeSize, -cubeSize,     //9
            -cubeSize, cubeSize, cubeSize,     //10
            cubeSize, cubeSize, cubeSize,      //11

            -cubeSize, -cubeSize, cubeSize,    //12
            cubeSize, -cubeSize, cubeSize,     //13
            -cubeSize, -cubeSize, -cubeSize,   //14
            cubeSize, -cubeSize, -cubeSize,    //15

            -cubeSize, cubeSize, cubeSize,     //16
            cubeSize, cubeSize, cubeSize,      //17
            -cubeSize, -cubeSize, cubeSize,    //18
            cubeSize, -cubeSize, cubeSize,     //19

            cubeSize, cubeSize, -cubeSize,     //20
            -cubeSize, cubeSize, -cubeSize,    //21
            cubeSize, -cubeSize, -cubeSize,    //22
            -cubeSize, -cubeSize, -cubeSize    //23
        ]);

        const uvAttribute = new Float32Array([
            0, 1, 1, 1, 0, 0, 1, 0,

            0, 1, 1, 1, 0, 0, 1, 0,

            0, 1, 1, 1, 0, 0, 1, 0,

            0, 1, 1, 1, 0, 0, 1, 0,

            0, 1, 1, 1,  0, 0, 1, 0,

            0, 1, 1, 1, 0, 0, 1, 0
        ])

        const geomtryIndex = {
            right : new Uint16Array([ 0, 2, 1, 2, 3, 1 ]),
            left : new Uint16Array([ 4, 6, 5, 6, 7, 5 ]),
            top : new Uint16Array([ 8, 10, 9, 10, 11, 9 ]),
            bottom : new Uint16Array([ 12, 14, 13, 14, 15, 13 ]),
            front : new Uint16Array([ 16, 18, 17, 18, 19, 17 ]),
            back : new Uint16Array([ 20, 22, 21, 22, 23, 21 ])
        }

        let geometry;
        geometry = new THREE.InstancedBufferGeometry();
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.top, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeTop = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.top.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.bottom, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeBottom = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.bottom.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.left, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeLeft = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.left.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.right, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeRight = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.right.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.front, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeFront = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.front.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.back, 1 ) );
        geometry.setAttribute('position',  new THREE.BufferAttribute( positionAttribute, 3 ));
        geometry.setAttribute('uv', new THREE.BufferAttribute( uvAttribute, 2 ));
        this.cubeBack = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.back.length);


        let colorAttribute
        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.top.length), 3);

        for (let i = 0; i < toDisplayBlocks.top.length; i++) {
            let thisPos = toDisplayBlocks.top[i]
            this.matrixTop.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeTop.setMatrixAt(i, this.matrixTop);
            // this.cubeTop.instanceMaterialIndex.setX(i, 0);
            // colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        // this.cubeTop.geometry.setAttribute('color', colorAttribute);

        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.bottom.length), 3);
        for (let i = 0; i < toDisplayBlocks.bottom.length; i++) {
            let thisPos = toDisplayBlocks.bottom[i]
            this.matrixBottom.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeBottom.setMatrixAt(i, this.matrixBottom);
            colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        this.cubeBottom.geometry.setAttribute('color', colorAttribute);
        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.left.length), 3);
        for (let i = 0; i < toDisplayBlocks.left.length; i++) {
            let thisPos = toDisplayBlocks.left[i]
            this.matrixLeft.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeLeft.setMatrixAt(i, this.matrixLeft);
            colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        this.cubeLeft.geometry.setAttribute('color', colorAttribute);
        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.right.length), 3);
        for (let i = 0; i < toDisplayBlocks.right.length; i++) {
            let thisPos = toDisplayBlocks.right[i]
            this.matrixRight.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeRight.setMatrixAt(i, this.matrixRight);
            colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        this.cubeRight.geometry.setAttribute('color', colorAttribute);
        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.front.length), 3);
        for (let i = 0; i < toDisplayBlocks.front.length; i++) {
            let thisPos = toDisplayBlocks.front[i]
            this.matrixFront.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeFront.setMatrixAt(i, this.matrixFront);
            colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        this.cubeFront.geometry.setAttribute('color', colorAttribute);
        colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(3 * toDisplayBlocks.back.length), 3);
        for (let i = 0; i < toDisplayBlocks.back.length; i++) {
            let thisPos = toDisplayBlocks.back[i]
            this.matrixBack.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cubeBack.setMatrixAt(i, this.matrixBack);
            colorAttribute.setXYZ(i, Math.random(), Math.random(), Math.random());
        }
        this.cubeBack.geometry.setAttribute('color', colorAttribute);

        console.log(this.cubeTop)

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