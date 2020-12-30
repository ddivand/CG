// ================================== SNOW {

    var snowFlakes = [];
    var snowProgram;

    function createSnow()
    {
        snowFlakes = createSnowFlakes();
        // console.log(snowFlakes)
        const snowVertexShader = getShader(gl.VERTEX_SHADER, SnowVertexShader);
        const snowFragmentShader = getShader(gl.FRAGMENT_SHADER, SnowFragmentShader);
        snowProgram = createProgram(snowVertexShader, snowFragmentShader);
        requestAnimationFrame(updateSnow);
    }
    
    function getProjectionMatrix() {
        let matrix = [];
        mat3.identity(matrix);
        mat3.projection(
          matrix,
          this.gl.canvas.clientWidth,
          this.gl.canvas.clientHeight
        );
        return matrix;
      }
    
    function createSnowFlakes() {
        const count = window.innerWidth / 4;
        const snowFlakes = [];
        for (let i = 0; i < count; i++) {
            snowFlakes.push(new SnowFlake());
        }
        return snowFlakes;
    }
    
    function snowFlakesProps() {
        let snowFlakesProps = [];
        for (let snowFlake of snowFlakes) {
          snowFlakesProps = [...snowFlakesProps, ...snowFlake.props];
        }
        return snowFlakesProps;
      }
    
    
    function updateSnow() {
        snowFlakes.forEach(snowFlake => snowFlake.update()); 
    
        const snowFlakePropsAttribLocation = gl.getAttribLocation(snowProgram, "a_snowFlakeProps");
        const projectionMatrixUniformLocation = gl.getUniformLocation(snowProgram,"u_projectionMatrix");
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        const snowFlakePropsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, snowFlakePropsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(snowFlakesProps()), gl.STATIC_DRAW);        
        
    
        const [size, type, normalize, stride, offset] = [4, gl.FLOAT, gl.FALSE, 0, 0];
        gl.vertexAttribPointer(
          snowFlakePropsAttribLocation,
          size,
          type,
          normalize,
          stride,
          offset
        );
    
        
        gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
        
    
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    
        const [mode, offset2, count] = [gl.POINTS, 0, this.snowFlakes.length];
        gl.useProgram(snowProgram);
        gl.enableVertexAttribArray(snowFlakePropsBuffer);
    
        gl.uniformMatrix3fv(
          projectionMatrixUniformLocation,
          gl.FALSE,
          getProjectionMatrix()
        );
        
        gl.drawArrays(mode, offset2, count);
    
        requestAnimationFrame(updateSnow);
      }
    
// } SNOW ==================================  


// ============================== SNOW  FLAKE{
class SnowFlake {
    constructor() {
      this.reset();
    }
  
    reset() {
      this.x = this.randBetween(0, window.innerWidth);
      this.y = this.randBetween(0, -window.innerHeight);
      this.vx = this.randBetween(-3, 3);
      this.vy = this.randBetween(2, 5);
      this.radius = this.randBetween(1, 4);
      this.alpha = this.randBetween(0.1, 0.9);
    }
  
    randBetween(min, max) {
      return min + (max - min) * Math.random();
    }
  
    get props() {
      return [this.x, this.y, this.radius, this.alpha];
    }
  
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (
        this.x + this.radius > window.innerWidth ||
        this.y + this.radius > window.innerHeight
      ) {
        // console.log("reset");
        this.reset();
      }
    }
  }
  
  // } SNOW FLAKE ==================================  