const textureLength: number = 6;

export const vertexBoxInstancedShader: string = `

    varying vec2 vUv;
    varying float vTextureIndex;

    attribute float textureIndex;


    void main() 
    {
        vUv = uv;

        vTextureIndex=textureIndex;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }

`
export const fragmentBoxInstancedShader: string = `

    varying vec2 vUv;
    uniform sampler2D map[${textureLength}];

    varying float vTextureIndex;

    void main() 
    {
        float x = vTextureIndex;
        vec4 col;

        col = texture2D(map[0], vUv ) * step(-0.1, x) * step(x, 0.1);
        col += texture2D(map[1], vUv ) * step(0.9, x) * step(x, 1.1);
        col += texture2D(map[2], vUv ) * step(1.9, x) * step(x, 2.1);

        gl_FragColor = col;
    }

`