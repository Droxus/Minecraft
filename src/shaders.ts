export const vertexBoxInstancedShader: string = `

    varying vec2 vUv;
    varying float vTextureIndex;

    attribute float textureIndex;

    void main() 
    {
        vUv = uv;

        vTextureIndex = textureIndex;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }

`
export const fragmentBoxInstancedShader: string = `

    varying vec2 vUv;
    varying float vTextureIndex;

    uniform sampler2D map;
    uniform vec2 atlasSize;

    void main() 
    {
        float columns = atlasSize.x;
        float rows = atlasSize.y;

        float maxProperty = max(columns, rows);
        vec2 scale = vec2(maxProperty / columns, maxProperty / rows);

        float index = vTextureIndex;

        float xShift = floor(index / columns);
        float yShift = mod(index, columns) - (columns - 1.0);

        float x = (vUv.x + xShift) * scale.x;
        float y = (vUv.y - yShift) * scale.y;

        vec2 uv = vec2(x, y) / maxProperty;

        gl_FragColor = texture2D( map, uv );
    }

`