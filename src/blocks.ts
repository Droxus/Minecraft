import * as THREE from 'three';
import { engine } from './main';
import { vertexBoxInstancedShader, fragmentBoxInstancedShader } from './shaders'

const isLoocalHost: boolean = window.location.href.startsWith('http://localhost') ||
                                window.location.href.startsWith('http://127.0.0.1');
const contentPath: string = isLoocalHost ? '' : 'https://raw.githubusercontent.com/Droxus/Minecraft/main/';
const atlasPath: string = contentPath + '/src/assets/atlas.png';

export default class Blocks {
    private blockSize: number;
    private boxGeometry: THREE.BoxGeometry;
    private matrix: THREE.Matrix4;
    private material: THREE.Material;
    
    private maxCustomCubes: number;
    private customCube: any;
    private createdBlocks: any[];
    
    public sides: string[];
    public texture: THREE.Texture | undefined;

    constructor() {
        this.customCube = {};
        this.createdBlocks = [];
        this.blockSize = 1;
        this.maxCustomCubes = 64*64;
        this.sides = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ];
        this.matrix = new THREE.Matrix4();
        this.boxGeometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);

        this.texture = this.loadTexture();
        this.material = this.getBoxMaterial(this.texture);
    }

    private loadTexture() {
        const texture = new THREE.TextureLoader().load(atlasPath);
        
        texture.format = THREE.RGBAFormat
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        return texture;
    }

    private getBoxMaterial(textures: THREE.Texture): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                map: {
                    value: textures,
                },
                atlasSize: {
                    value: new THREE.Vector3(31, 31)
                }
            },
            opacity: 0.5,
            transparent: true,
            alphaTest: 0.5,
            blending: THREE.NormalBlending,
            vertexShader: vertexBoxInstancedShader,
            fragmentShader: fragmentBoxInstancedShader,
        });
    }

    private getBoxGeometry(texturesArray: THREE.InstancedBufferAttribute, geometryIndex: Uint16Array): THREE.InstancedBufferGeometry {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex( new THREE.BufferAttribute( geometryIndex, 1 ) );
        geometry.setAttribute('position', this.boxGeometry.attributes.position );
        geometry.setAttribute('uv', this.boxGeometry.attributes.uv);
        geometry.setAttribute('textureIndex', texturesArray);

        return geometry
    }

    private getInstancedMesh(index: number, texturesArray: THREE.InstancedBufferAttribute, length: number): THREE.InstancedMesh {
        const indexSideLength = 6;
        const geometryIndex = (this.boxGeometry.index as any).array.slice(index * indexSideLength, (index + 1) * indexSideLength)
        const geometry = this.getBoxGeometry(texturesArray, geometryIndex);

        return new THREE.InstancedMesh(geometry, this.material, length)
    }

    public createInstances(toDisplayBlocks: any, position: any, texturesArray: number[]) {
        texturesArray.length = this.maxCustomCubes;
        
        const texturesBufferArray = new THREE.InstancedBufferAttribute(new Uint16Array(texturesArray), 1);
        const cube: any = {};

        this.sides.forEach((side: string, index) => cube[side] = this.getInstancedMesh(index, texturesBufferArray, toDisplayBlocks[side].length))

        Object.entries(toDisplayBlocks).forEach(([side, blocks]: any) => {
            blocks.forEach((block: any, index: number) => {
                const [ x, y, z ] = [ block[0], block[1], block[2] ];

                this.matrix.setPosition(x, y, z);
                cube[side].setMatrixAt(index, this.matrix);
            });
            const {x, y, z} = position;
            cube[side].position.set(x, y, z);
        })

        return cube;
    }

    private createCustomInstances() {
        const texturesArray = [10, 24, 25];
        texturesArray.length = this.maxCustomCubes;
        const texturesBufferArray = new THREE.InstancedBufferAttribute(new Uint16Array(texturesArray), 1);

        this.sides.forEach((side: string, index) => {
            this.customCube[side] = this.getInstancedMesh(index, texturesBufferArray, this.maxCustomCubes);
            this.customCube[side].position.set(0, 0, 0)
        })

        Object.values(this.customCube).forEach((blocks: any) => engine.scene.add(blocks))
    }

    public create() {
        const position = {x: 2, y: 1, z: 2};
        const {x, y, z} = position;
        const blockIndex = this.createdBlocks.length;

        this.createdBlocks.push([x, y, z]);

        if (blockIndex > this.maxCustomCubes || !this.customCube.top) {
            this.createCustomInstances();
        }

        this.matrix.setPosition(x, y, z);
        this.sides.forEach(side => {
            this.customCube[side].setMatrixAt(blockIndex, this.matrix)
            this.customCube[side].instanceMatrix.needsUpdate = true;
        })

        engine.needsRenderUpdate = true
        console.log('Block is created');
    }
}