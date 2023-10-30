import * as THREE from 'three';
import { engine } from './main';
import {vertexBoxInstancedShader, fragmentBoxInstancedShader} from './shaders'


const isLoocalHost: boolean = (window.location.href.startsWith('http://localhost') || window.location.href.startsWith('http://127.0.0.1'));
const contentPath: string = isLoocalHost ? '' : 'https://raw.githubusercontent.com/Droxus/Minecraft/main/';
const texturePath: string = `${contentPath}/src/assets/textures/`;

export default class Blocks {
    private blockSize: number;
    private boxGeometry: THREE.BoxGeometry;
    private cube: any
    private matrix: THREE.Matrix4;
    private sides: string[];
    private material: THREE.Material;

    private maxCustomCubes: number;
    private customCube: any;
    private createdBlocks: any[];
    
    public textures: THREE.Texture[];

    constructor() {
        this.blockSize = 1;
        this.boxGeometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        this.cube = {};
        this.matrix = new THREE.Matrix4();
        this.sides = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ];

        this.sides.forEach((side: any) => this.cube[side] = undefined);

        this.textures = this.getTextures();
        this.material = this.getBoxMaterial(this.textures);

        this.maxCustomCubes = 64*64;
        this.customCube = {};
        this.createdBlocks = [];
    }

    private getTextures(): THREE.Texture[] {
        const textures = [
            new THREE.TextureLoader().load(texturePath + 'redstone_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'gold_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'lapis_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'diamond_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'emerald_ore.png'),
            new THREE.TextureLoader().load(texturePath + 'iron_ore.png'),
        ];

        textures.forEach((texture: any) => texture.magFilter = THREE.NearestFilter);

        return textures;
    }

    private getBoxMaterial(textures: THREE.Texture[]): THREE.ShaderMaterial {
        return new THREE.ShaderMaterial({
            uniforms: {
                map: {
                    value: textures,
                }
            },
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

    public createInstances(toDisplayBlocks: any, position: any) {
        const texturesArray = new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1);

        this.sides.forEach((side: string, index) => this.cube[side] = this.getInstancedMesh(index, texturesArray, toDisplayBlocks[side].length))

        Object.entries(toDisplayBlocks).forEach(([side, blocks]: any) => {
            blocks.forEach((block: any, index: number) => {
                const x = block[0];
                const y = block[1];
                const z = block[2];

                this.matrix.setPosition(x, y, z);
                this.cube[side].setMatrixAt(index, this.matrix);
            });
            const {x, y, z} = position;
            this.cube[side].position.set(x, y, z);
        })

        Object.values(this.cube).forEach((cube: any) => engine.scene.add(cube))
    }

    private createCustomInstances() {
        const texturesArray = new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2, 1, 2, 1, 2]), 1);

        this.sides.forEach((side: string, index) => {
            this.customCube[side] = this.getInstancedMesh(index, texturesArray, this.maxCustomCubes);
            this.customCube[side].position.set(0, 0, 0)
        })

        Object.values(this.customCube).forEach((blocks: any) => engine.scene.add(blocks))
    }

    public create() {
        const position = {x: 2, y: 1, z: 2};
        const {x, y, z} = position;
        const blockIndex = this.createdBlocks.length;

        this.createdBlocks.push([x, y, z]);

        if (blockIndex > this.maxCustomCubes || !this.customCube.top) this.createCustomInstances();

        this.matrix.setPosition(x, y, z);
        this.sides.forEach(side => {
            this.customCube[side].setMatrixAt(blockIndex, this.matrix)
            this.customCube[side].instanceMatrix.needsUpdate = true;
        })

        engine.needsRenderUpdate = true
        console.log('Block is created');
    }
}