//================================================= MAIN PROG SHADERS {
const vertexShaderText = 
    `precision mediump float;
    
    attribute vec3 vertPosition;
    attribute vec2 vertTexCoord;    
    attribute vec3 vertColor;
    attribute vec3 vertNormal;
    
    varying vec2 fragTexCoord;    
    varying vec3 fragColor;
    varying vec3 fragNormal;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;
    uniform bool isTexture;
    
    void main()
    {
        if(isTexture)                                     
            fragTexCoord = vertTexCoord;
        else fragColor = vertColor;    

        fragNormal = (mWorld * vec4(vertNormal,0.0)).xyz;
                
        gl_Position = mProj * mView * mWorld* vec4(vertPosition, 1.0); 
    }
`;

const fragmentShaderText = 
`
precision mediump float;

varying vec3 fragColor;
varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform bool fragisTexture;
uniform sampler2D sampler;

void main()
{
    vec3 ambientLightIntensity = vec3(0.4, 0.4, 0.4);     
    // vec3 sunLightIntensity = vec3(0.9, 0.9, 0.9);          
    vec3 sunLightIntensity = vec3(0.1, 0.1, 0.1);             
    vec3 sunLightDirection = normalize(vec3(3.0, 4.0, 2.0));  
    vec3 surfaceNormal = normalize(fragNormal);    
    

    vec4 texel = texture2D(sampler, fragTexCoord);

    vec3 lightIntensity = ambientLightIntensity +                       
    sunLightIntensity * max(dot(fragNormal, sunLightDirection), 0.0);   

    if(fragisTexture)
        gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);       
    else gl_FragColor = vec4(fragColor * lightIntensity,1.0);           
    
}
`;
// } MAIN PROG SHADERS =================================================  



//================================================= SNOW SHADERS {

const SnowVertexShader = 
`
  attribute vec4 a_snowFlakeProps;
  uniform mat3 u_projectionMatrix;
  varying vec4 v_color;

  void main() {
    gl_Position = vec4((u_projectionMatrix * vec3(a_snowFlakeProps.xy, 1)).xy, 0, 1);

    gl_PointSize = 2.0 * a_snowFlakeProps.z;
    v_color = vec4(1, 1, 1, a_snowFlakeProps.w);
  }
`;

const SnowFragmentShader = 
`
  precision mediump float;
  varying vec4 v_color;

  void main() {
    vec2 distToCenter = gl_PointCoord - vec2(0.5, 0.5);
    float distToCenterSquared = dot(distToCenter, distToCenter);
    float alpha;

    if (distToCenterSquared < 0.25) {
      alpha = v_color.w;
    } else {
      alpha = 0.0;
    }

    gl_FragColor = vec4(v_color.xyz, alpha);
  }
`;

// } SNOW SHADERS ================================================= 