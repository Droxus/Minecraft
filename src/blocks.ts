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
    private matrix: any;
    private sides: string[];
    private material: THREE.Material;
    
    public textures: THREE.Texture[];

    constructor() {
        this.blockSize = 1;
        this.boxGeometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        this.cube = {};
        this.matrix = {};
        this.sides = [ 'right', 'left', 'top', 'bottom', 'front', 'back' ];

        this.sides.forEach((side: any) => this.matrix[side] = new THREE.Matrix4());
        this.sides.forEach((side: any) => this.cube[side] = undefined);

        this.textures = this.getTextures();
        this.material = this.getBoxMaterial(this.textures);
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

    public create(toDisplayBlocks: any) {
        const texturesArray = new THREE.InstancedBufferAttribute(new Uint8Array([2, 1, 2]), 1);

        this.sides.forEach((side: string, index) => {
            this.cube[side] = this.getInstancedMesh(index, texturesArray, toDisplayBlocks[side].length);
        })

        Object.entries(toDisplayBlocks).forEach(([side, blocks]: any) => {
            blocks.forEach((block: any, index: number) => {
                this.matrix[side].setPosition(block[0], block[1], block[2]);
                this.cube[side].setMatrixAt(index, this.matrix[side]);
            });
        })

        Object.values(this.cube).forEach((cube: any) => engine.scene.add(cube))
    }
}