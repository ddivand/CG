var mat4 = glMatrix.mat4
var mat3 = glMatrix.mat3
var vec3 = glMatrix.vec3
var gl;

var canvas= document.getElementById('surface');;

var mainProgram;

var cameraPos = [0,0,2];
var cameraCenter = [0,0,0];
var isMoved = 0;

var attributes = [];
var buffers = [];
var renderTexObjects = [];
var renderColorObjects = [];
var susimg;
var susmodel;

var worldMatrix;
var viewMatrix;
var projMatrix;

var getResources = function () {
	loadJSONResource('resources/Susan.json', function (modelErr, modelObj) {
		if (modelErr) {
			alert('Fatal error getting Susan model (see console)');
			console.error(fsErr);
		} else {
			loadImage('resources/SusanTexture.png', function (imgErr, img) {
				if (imgErr) {
					alert('Fatal error getting Susan texture (see console)');
					console.error(imgErr);
				} else {                     
                    susmodel = modelObj;    //monkey object
                    susimg = img;           //monkey texture
					Init();
				}
			});
		}
	});
}

var Init = function (){    
    console.log(susmodel)

    canvas = document.getElementById('surface');
    gl = canvas.getContext('webgl');

    if(!gl){
        gl = canvas.getContext('experimental-webgl');
    }

    if(!gl){
        alert('WebGl is not supported')
    }

    gl.clearColor(0.75, 0.85, 0.8, 0.9);    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    
    var vertexShaderT = getShader(gl.VERTEX_SHADER,vertexShaderText);
    var fragmentShaderT = getShader(gl.FRAGMENT_SHADER,fragmentShaderText);
    
    mainProgram = createProgram(vertexShaderT, fragmentShaderT);    
    
    createObjects();
    
    initBuffers();
    
    initAttributes();
        
    createSnow();    
    
    drawCur();
}


function drawCur(){    
    /* ======= CREATING TEXTURE ======== */
    var boxTexture = getMyTexture(document.getElementById('crate-image'))
    var susanTexture = getMyTexture(susimg)
    // ===== get crate texture =====
    // var boxTexture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    

    // gl.texImage2D(
    //     gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
    //     gl.UNSIGNED_BYTE, 
    //     document.getElementById('crate-image')
    // );
    // gl.bindTexture(gl.TEXTURE_2D, null);

    // // ===== get monkey texture =====
	// var susanTexture = gl.createTexture();
    // gl.bindTexture(gl.TEXTURE_2D, susanTexture);
    // // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	// // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// gl.texImage2D(
	// 	gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
	// 	gl.UNSIGNED_BYTE,
	// 	susimg
	// );
	// gl.bindTexture(gl.TEXTURE_2D, null);


    gl.useProgram(mainProgram);
    
    var matWorldUniformLocation = gl.getUniformLocation(mainProgram,'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(mainProgram,'mView');
    var matProjUniformLocation = gl.getUniformLocation(mainProgram,'mProj');
    var isTextLocation = gl.getUniformLocation(mainProgram,'isTexture');
    var fragisTextLocation = gl.getUniformLocation(mainProgram,'fragisTexture');

    
    worldMatrix = new Float32Array(16);
    viewMatrix = new Float32Array(16);
    projMatrix = new Float32Array(16);
        
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, cameraPos, cameraCenter, [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45)/*wtf??*/, canvas.width/canvas.height, 0.1, 1000.0);    

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation,  gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation,  gl.FALSE, projMatrix);
    
    
    /* Main render loop*/
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;

    var loop = function() {            
        gl.useProgram(mainProgram);
                
        angle = performance.now() / 3000 / 6 * 2 * Math.PI;                 
        mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);           
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE,worldMatrix); 
                
        if(isMoved)
        {
            isMoved = 0;
            mat4.lookAt(viewMatrix, cameraPos, cameraCenter, [0,1,0]);          
            gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix); 
        }

        //refresh backgorund
        gl.clearColor(0.75, 0.85, 0.8, 1.0);        
        // gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT); // ????? 

        //========= render textured objects 
        //{
            //refresh cur texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    
            //draw textured
            switchMode()        
            gl.uniform1i(isTextLocation, 1);        
            gl.uniform1i(fragisTextLocation, 1);
            gl.drawElements(gl.TRIANGLES, buffers[1].data.length, gl.UNSIGNED_SHORT, 0);
        //}
        
        //========= render monkey seperatly 
        //{
            //making monkey rotate in another direction
            var wotldtmp = [];
            mat4.copy(wotldtmp, worldMatrix)
            mat4.rotate(wotldtmp, identityMatrix, angle, [1,0,0]);
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE,wotldtmp);
            
            //refresh cur texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, susanTexture);
                
            switchMode()
        
            gl.drawElements(gl.TRIANGLES, buffers[5].data.length, gl.UNSIGNED_SHORT, 0);
                    
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE,worldMatrix);
        //}        

        //========= render RGB objects 
        //{            
            switchMode()
            gl.uniform1i(isTextLocation, 0);        
            gl.uniform1i(fragisTextLocation, 0);
            gl.drawElements(gl.TRIANGLES, buffers[3].data.length, gl.UNSIGNED_SHORT, 0);       
        //}
    
        requestAnimationFrame(loop);        
    };
    requestAnimationFrame(loop);
}


// some sort of state machine
var mode = 0;
function switchMode(){    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[2].buffer);  //!!!! 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1].buffer);

    //same for attributes
    setAttr(attributes[1]);
    setAttr(attributes[2]);

    switch(mode){
        case 0:
            mode = 1;
            gl.disableVertexAttribArray(attributes[2].pointer);   
            gl.enableVertexAttribArray(attributes[1].pointer);      

            attributes[0].size = 8;      
            attributes[3].size = 8;        
            setAttr(attributes[0]);        
            setAttr(attributes[3]);        
        
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers[0].data), gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(buffers[1].data), gl.STATIC_DRAW);
            break;
        case 1:
            mode = 2;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers[4].data), gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(buffers[5].data), gl.STATIC_DRAW);    
            break;            
        case 2:
            mode = 0;
            gl.disableVertexAttribArray(attributes[1].pointer);   
            gl.enableVertexAttribArray(attributes[2].pointer);

            attributes[0].size = 9;
            attributes[3].size = 9;
            setAttr(attributes[0]);
            setAttr(attributes[3]);
    
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffers[2].data), gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(buffers[3].data), gl.STATIC_DRAW); 
            break;
        default:
            //??
    }
}

function createObjects()
{       
    // TEXTURED     
    formObject(renderTexObjects, "TEX_SPHERE", [2,-2,4,3])  ;  
    // formObject(renderTexObjects, "TEX_SPHERE", [12,-2,4,3])  ;  
    // formObject(renderTexObjects, "TEX_SPHERE", [-12,-2,4,3])  ;  
    // formObject(renderTexObjects, "TEX_SPHERE", [2,10,4,3])  ;  
    formObject(renderTexObjects, "TEX_RECT", [0,-2,-10,6,2,2]);
    formObject(renderTexObjects, "TEX_RECT", [0,-6,-10,6,2,2]);    
    formObject(renderTexObjects, "TEX_CUBE", [2.0,2.0,-10.0,2.0]);    
    // formObject(renderTexObjects, "TOR", [3,2,1,3]);
    formObject(renderTexObjects, "TEX_CUBE", [-2.0,2.0,-10.0,2]);    
    // formObject(renderTexObjects, "TEX_SPHERE", [-3,3,-1,3]);
    formObject(renderTexObjects, "TOR", [0,0,0,3]);
    console.log(renderTexObjects);
    
    // COLORED    
    formObject(renderColorObjects, "RECT", [0,-8,0,50,2,50, {r:0.1,g:0,b:0}]);
    formObject(renderColorObjects, "GRAD_RECT", [0,-4,-10,6,2,2]);
    formObject(renderColorObjects, "GRAD_RECT", [0,0,-10,6,2,2]);   
    console.log(renderColorObjects);
    
}

function initBuffers(){
     

    var texVert = [];        
    var texIndices = [];
    var colorVert = [];
    var colorIndices = [];
    var susanVert = [];
    var susanIndices = [].concat.apply([], susmodel.meshes[0].faces);;
    
    //textured
    for(var i = 0; i < renderTexObjects.length; i++)
    {        
        for (var j = 0; j < renderTexObjects[i].verticies.length/3; j++)
        {            
            texVert.push(renderTexObjects[i].normals[0+j*3], renderTexObjects[i].normals[1+j*3],renderTexObjects[i].normals[2+j*3]);            
            texVert.push(renderTexObjects[i].verticies[0+j*3], renderTexObjects[i].verticies[1+j*3],renderTexObjects[i].verticies[2+j*3]);                        
            texVert.push(renderTexObjects[i].wrapper[0+j*2], renderTexObjects[i].wrapper[1+j*2]);            
                
        }

        for(var j = 0; j< renderTexObjects[i].indicies.length; j++)
        texIndices.push(renderTexObjects[i].indicies[j])
    }
    
    //colored 
    for(var i = 0; i < renderColorObjects.length; i++)
    {    
        for (var j = 0; j < renderColorObjects[i].verticies.length/3; j++)
        {            
            colorVert.push(renderColorObjects[i].normals[0+j*3], renderColorObjects[i].normals[1+j*3],renderColorObjects[i].normals[2+j*3]);            
            colorVert.push(renderColorObjects[i].verticies[0+j*3], renderColorObjects[i].verticies[1+j*3],renderColorObjects[i].verticies[2+j*3]);                        
            colorVert.push(renderColorObjects[i].wrapper[0+j*3], renderColorObjects[i].wrapper[1+j*3],renderColorObjects[i].wrapper[2+j*3]);
        }

        for(var j = 0; j< renderColorObjects[i].indicies.length; j++)
        colorIndices.push(renderColorObjects[i].indicies[j])
    }

    //susan    
    for( var i = 0; i < susmodel.meshes[0].vertices.length/3; i++)
    {
        // console.log(i)
        susanVert.push(susmodel.meshes[0].normals[0+i*3], susmodel.meshes[0].normals[1+i*3], susmodel.meshes[0].normals[2+i*3]);
        susanVert.push(susmodel.meshes[0].vertices[0+i*3], susmodel.meshes[0].vertices[1+i*3], susmodel.meshes[0].vertices[2+i*3]);
        susanVert.push(susmodel.meshes[0].texturecoords[0][0+i*2], susmodel.meshes[0].texturecoords[0][1+i*2]);            
    }


    // ======= CREATING BUFFERS ======    
    // textured vertecies
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texVert), gl.STATIC_DRAW);
    
    buffers[0] = {buffer: boxVertexBufferObject, data: texVert};

    //colored verticies
    boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorVert), gl.STATIC_DRAW);

    buffers[2] = {buffer: boxVertexBufferObject, data: colorVert};

    //susan verticies
    boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVert), gl.STATIC_DRAW);

    buffers[4] = {buffer: boxVertexBufferObject, data: susanVert};

    //indicies
    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(texIndices), gl.STATIC_DRAW);    

    buffers[1] = {buffer: boxIndexBufferObject, data: texIndices};
    buffers[3] = {buffer: boxIndexBufferObject, data: colorIndices};
    buffers[5] = {buffer: boxIndexBufferObject, data: susanIndices};    

}

function initAttributes(){
    // =======  SETTING ATTRIBUTES =======        
        var positionAttribLocation = gl.getAttribLocation(mainProgram, 'vertPosition');
        var texCoordAttribLocation = gl.getAttribLocation(mainProgram, 'vertTexCoord');
        var colorCoordAttribLocation =  gl.getAttribLocation(mainProgram, 'vertColor');            
        var normalAttributeLocation = gl.getAttribLocation(mainProgram, 'vertNormal');

        attributes[0] = {pointer:positionAttribLocation, normal:gl.FALSE, numElem:3, size:8, offset:3};        
        attributes[1] = {pointer:texCoordAttribLocation, normal:gl.FALSE, numElem:2, size:8, offset:6};    
        attributes[2] = {pointer:colorCoordAttribLocation, normal:gl.FALSE, numElem:3, size:9, offset:6};
        attributes[3] = {pointer:normalAttributeLocation, normal:gl.FALSE, numElem:3, size:8, offset:0 };        
        
        setAttr(attributes[0]);
        setAttr(attributes[1]);
        setAttr(attributes[2]);
        setAttr(attributes[3]);

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(texCoordAttribLocation); 
        gl.enableVertexAttribArray(normalAttributeLocation);
}

function setAttr(attribute){
    gl.vertexAttribPointer(
        attribute.pointer, // Attribute location
        attribute.numElem, // number of elements per attribute
        gl.FLOAT, // type of elementes 
        attribute.normal,
        attribute.size * Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex 
        attribute.offset * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );
}

function getMyTexture(img){
    var Texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, Texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
        gl.UNSIGNED_BYTE, 
        img//document.getElementById('crate-image')
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    return Texture
}

function getShader(type, source){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('VERTEX SHADER', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(vertexShader, fragmentShader){
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('ERROR LINKING', gl.getProgramInfoLog(program))
        
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return;
    }

    return program;
}




/*================= Mouse events { */

var raduis = 2;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var latitude=90, longtitude=270; //180<y<0, 0<x<360; x = 270 - x-0, z- -1; y = 90 - y-0

var mouseDown = function(e) {
   drag = true;
   old_x = e.pageX, old_y = e.pageY;
   e.preventDefault();   
   return false;
};

var mouseUp = function(e){
   drag = false;
};

var mouseMove = function(e) {
    if (!drag) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
    dY = (e.pageY-old_y)*2*Math.PI/canvas.height;        
        
    var vec = vec3.fromValues(cameraCenter[0]-cameraPos[0],cameraCenter[1]-cameraPos[1],cameraCenter[2]-cameraPos[2]);    
        
    if(e.shiftKey)
    {
        var long;
        var lat = dY<0?70:110;
        
        if(dX < 0){
            long = longtitude - 90 < 0? 360+(longtitude - 90) : longtitude - 90;
        }
        else{
            long = longtitude + 90 > 360? longtitude - 270 : longtitude + 90;
        }
        
        var radLong = glMatrix.glMatrix.toRadian(long);
        var radLat = glMatrix.glMatrix.toRadian(lat);

        var vectmp = [];    
        vec3.set(vectmp,            
            Math.cos(radLong)*Math.sin(radLat)+cameraPos[0],
            (Math.cos(radLat)+cameraPos[1]),
            Math.sin(radLong)*Math.sin(radLat)+cameraPos[2]
        )          
        
        var vectmp2 = vec3.fromValues(cameraPos[0]-vectmp[0],cameraPos[1]-vectmp[1],cameraPos[2]-vectmp[2]);    
        vec3.negate(vectmp2,vectmp2)
        vec3.scale(vectmp2, vectmp2, 0.2);

        vec3.add(cameraPos,cameraPos,vectmp2)     
        vec3.add(cameraCenter,cameraCenter,vectmp2)             
    
    }
    else{
        //head rotation
        
        if(longtitude+dX*10 > 360 || longtitude+dX*10 < 0){
            longtitude = longtitude+dX*10 < 0 ? 360 : 0
        }else{
            longtitude += dX*10;
        }
    
        if(!(latitude+dY*10 > 180) && !(latitude+dY*10<0))
            latitude += dY*10;    

        var radLong = glMatrix.glMatrix.toRadian(longtitude);
        var radLat = glMatrix.glMatrix.toRadian(latitude);
    
        vec3.set(cameraCenter,            
            Math.cos(radLong)*Math.sin(radLat)+cameraPos[0],
            Math.cos(radLat)+cameraPos[1],
            Math.sin(radLong)*Math.sin(radLat)+cameraPos[2]
        )           
    }

    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();

    isMoved = 1;   
    writeHTML() 
};

var wheelMove = function(e) {
    e.preventDefault();
    
    var vec = vec3.fromValues(cameraCenter[0]-cameraPos[0],cameraCenter[1]-cameraPos[1],cameraCenter[2]-cameraPos[2]);
    var delta = cameraPos[2] > 0? 1 : -1;
    
    if(e.wheelDelta > 0) 
    {    
        vec3.add(cameraPos, cameraPos,vec);
        vec3.add(cameraCenter, cameraCenter,vec);    
    }    
    
    if(e.wheelDelta < 0) 
    {    
        vec3.subtract(cameraPos, cameraPos,vec);
        vec3.subtract(cameraCenter, cameraCenter,vec);        
    }
    
    isMoved = 1;            
    writeHTML()
};

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);
canvas.addEventListener("wheel", wheelMove, {capture:true, passive:false});

/* } Mouse events ======================*/

function writeHTML(){
    document.getElementById("campos").innerHTML = 'X: '+ cameraPos[0]+' Y: '+cameraPos[1]+' Z: '+ cameraPos[2];
    document.getElementById("cenpos").innerHTML = 'X: '+ cameraCenter[0]+' Y: '+cameraCenter[1]+' Z: '+ cameraCenter[2]; 
    document.getElementById("long").innerHTML = Math.floor(longtitude);
    document.getElementById("lat").innerHTML = Math.floor(latitude);
}
