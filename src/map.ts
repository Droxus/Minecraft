import * as THREE from 'three';
import { engine } from './main';

const isLoocalHost: boolean = (window.location.href.startsWith('http://localhost') || window.location.href.startsWith('http://127.0.0.1'));
const contentPath: string = isLoocalHost ? '' : 'https://raw.githubusercontent.com/Droxus/Minecraft/main/';
const texturePath: string = `${contentPath}/src/assets/textures/`;

export class Map {
    // private xGrid = 512/2;
    // private yGrid = 512/2;
    // private zGrid = 512/2;

    private cube: any = {
        top: undefined,
        bottom: undefined,
        left: undefined,
        right: undefined,
        front: undefined,
        back: undefined,
     }

    private matrix = {
        top: new THREE.Matrix4(),
        bottom: new THREE.Matrix4(),
        left: new THREE.Matrix4(),
        right: new THREE.Matrix4(),
        front: new THREE.Matrix4(),
        back: new THREE.Matrix4(),
    }

    constructor() {
        console.time()
        this.generateWorld()

        engine.needRenderUpdate = true;

        console.timeEnd()

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
        const textures = [
            new THREE.TextureLoader().load(texturePath + 'redstone_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'gold_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'lapis_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'diamond_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'emerald_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'iron_ore.png'),
        ];

        textures.forEach((texture: any) => texture.magFilter = THREE.NearestFilter)

        const vertexShader = `

            varying vec2 vUv;
            varying float vTextureIndex;

            attribute float textureIndex;
            
            
            void main() 
            {
                vUv = uv;

                vTextureIndex=textureIndex;

                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }

        `;
        const fragmentShader = `

            varying vec2 vUv;
            uniform sampler2D map[${textures.length}];

            varying float vTextureIndex;

            uniform vec4 customTextureRepeat;
            
            void main() 
            {
                float x = vTextureIndex;
                vec4 col;

                col = texture2D(map[0], vUv ) * step(-0.1, x) * step(x, 0.1);
                col += texture2D(map[1], vUv ) * step(0.9, x) * step(x, 1.1);
                col += texture2D(map[2], vUv ) * step(1.9, x) * step(x, 2.1);

                gl_FragColor = col;
            }

        `;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: {
                    value: textures,
                },
                customTextureRepeat: { value: new THREE.Vector2(1, 1) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        })

        const boxGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);

        const positionAttribute = boxGeometry.attributes.position;
        const uvAttribute = boxGeometry.attributes.uv;
        const geomtryIndex = {
            right :  (boxGeometry.index as any).array.slice(0, 6),
            left : (boxGeometry.index as any).array.slice(6, 12),
            top : (boxGeometry.index as any).array.slice(12, 18),
            bottom : (boxGeometry.index as any).array.slice(18, 24),
            front : (boxGeometry.index as any).array.slice(24, 30),
            back : (boxGeometry.index as any).array.slice(30, 36)
        }

        let geometry;
        geometry = new THREE.InstancedBufferGeometry();
        geometry.setAttribute('position', positionAttribute );
        geometry.setAttribute('uv', uvAttribute);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.top, 1 ) );
        geometry.setAttribute('position', positionAttribute );
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.top = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.top.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.bottom, 1 ) );
        geometry.setAttribute('position', positionAttribute );
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.bottom = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.bottom.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.left, 1 ) );
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.left = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.left.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.right, 1 ) );
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.right = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.right.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.front, 1 ) );
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.front = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.front.length);

        geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geomtryIndex.back, 1 ) );
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('uv', uvAttribute);
        geometry.setAttribute('textureIndex', new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1));
        this.cube.back = new THREE.InstancedMesh(geometry, material, toDisplayBlocks.back.length);

        for (let i = 0; i < toDisplayBlocks.top.length; i++) {
            let thisPos = toDisplayBlocks.top[i]
            this.matrix.top.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.top.setMatrixAt(i, this.matrix.top);
        }
        for (let i = 0; i < toDisplayBlocks.bottom.length; i++) {
            let thisPos = toDisplayBlocks.bottom[i]
            this.matrix.bottom.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.bottom.setMatrixAt(i, this.matrix.bottom);
        }
        for (let i = 0; i < toDisplayBlocks.left.length; i++) {
            let thisPos = toDisplayBlocks.left[i]
            this.matrix.left.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.left.setMatrixAt(i, this.matrix.left);
        }
        for (let i = 0; i < toDisplayBlocks.right.length; i++) {
            let thisPos = toDisplayBlocks.right[i]
            this.matrix.right.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.right.setMatrixAt(i, this.matrix.right);
        }
        for (let i = 0; i < toDisplayBlocks.front.length; i++) {
            let thisPos = toDisplayBlocks.front[i]
            this.matrix.front.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.front.setMatrixAt(i, this.matrix.front);
        }
        for (let i = 0; i < toDisplayBlocks.back.length; i++) {
            let thisPos = toDisplayBlocks.back[i]
            this.matrix.back.setPosition(thisPos[0] + 2, thisPos[1] + 2, thisPos[2] + 2);
            this.cube.back.setMatrixAt(i, this.matrix.back);
        }

        Object.values(this.cube).forEach((cube: any) => engine.scene.add(cube))
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