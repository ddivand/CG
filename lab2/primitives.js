
const primitivesEnum = {
	"TEX_CUBE": {funcVert:cubeVerticies, funcInd: rectIndices, funcWrapper: createWrapper,funcNorm:countNormals, isTex:1, args:4, },
	"GRAD_CUBE":{funcVert:cubeVerticiesColored, funcInd: rectIndices, funcWrapper: createWrapper,funcNorm:countNormals,isTex:0, },
	"CUBE": 	{funcVert:cubeVerticiesColored, funcInd: rectIndices,funcWrapper: createWrapper,funcNorm:countNormals, isTex:0, rgb:1,},
	"TEX_RECT": {funcVert:rectVerticies, funcInd: rectIndices, 	funcWrapper: createWrapper,funcNorm:countNormals,	  isTex:1, args:6, },
	"GRAD_RECT":{funcVert:rectVerticiesColored, funcInd: rectIndices,funcWrapper: createWrapper, funcNorm:countNormals,isTex:0, args:6,},
	"RECT": 	{funcVert:rectVerticiesColored, funcInd: rectIndices,funcWrapper: createWrapper,funcNorm:countNormals, isTex:0, rgb:1, args:7,},
	"SPHERE": {funcVert:sphereColored, funcInd: sphereInd, funcWrapper: sphereWrapper,funcNorm:countNormals,isTex:0, rgb:1, args:4, },	//doesnt work
	"TEX_SPHERE": {funcVert:sphereTex, funcInd: sphereInd, funcWrapper: sphereWrapper,funcNorm:spehereNorm,isTex:1, args:4, },	//radius doesnt work
	"TOR": {funcVert:makeTor, funcInd: sphereInd, funcWrapper: sphereWrapper,funcNorm:spehereNorm,isTex:1, args:4, },	// only x y z args
}

function formObject(objectsArray, type, args){
	
	if(args.length != primitivesEnum[type].args)
		return null;

	var verticies = [];
	var indicies = [];
	var normals = [];
	var wrapper = []; // array of colors or U,V's

	if(type != "TOR")
	{
		primitivesEnum[type].funcVert(verticies, args);  
		primitivesEnum[type].funcInd(indicies, objectsArray)   //redo
		primitivesEnum[type].funcNorm(normals, verticies, indicies,objectsArray.length ); //redo
		primitivesEnum[type].funcWrapper(wrapper, args,primitivesEnum[type].isTex, primitivesEnum[type].rgb);
	} else makeTor(verticies,indicies,normals, wrapper, objectsArray,args)

	var object = 
	{
		verticies: verticies,
		indicies: indicies,
		normals: normals,
		wrapper: wrapper,
		renderMode: {isTex:primitivesEnum[type].isTex,} //tex: NULL}	
	}		
	objectsArray.push(object);
	
}

function spehereNorm(normals, vertecies)
{
	var latitudeBands = 30;
    var longitudeBands = 30;	
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        normals.push(x);
        normals.push(y);
        normals.push(z);
      }
    }
}
function countNormals(normals, vertecies){ 
	// console.log(vertecies);
	var ind =[];
	rectIndices(ind, 0);
	
	var verts =[];
	var polygons = [];

	for(var i =0; i < 6; i++)
	{
		verts.push( vec3.fromValues(vertecies[0+12*i], vertecies[1+12*i], vertecies[2+12*i]))
		verts.push(vec3.fromValues(vertecies[3+12*i], vertecies[4+12*i], vertecies[5+12*i]))
		verts.push(vec3.fromValues(vertecies[6+12*i], vertecies[7+12*i], vertecies[8+12*i]))
		verts.push(vec3.fromValues(vertecies[9+12*i], vertecies[10+12*i], vertecies[11+12*i]))				
	
		polygons.push([verts[ind[0+i*6]], verts[ind[1+i*6]], verts[ind[2+i*6]]])
		polygons.push([verts[ind[3+i*6]], verts[ind[4+i*6]], verts[ind[5+i*6]]])
	}
	var normal = [];
	for(var i = 0; i<12; i++)
	{		
		for(var j =0; j<3; j=j+1)
		{		
			var a =[], b = [], c = [];
			if(j == 0){
				a = polygons[i][0];
				b = polygons[i][1];
				c = polygons[i][2];
			} 
			if ( j == 1){
				a = polygons[i][1];
				b = polygons[i][2];
				c = polygons[i][0];
			}

			if ( j == 2){
				a = polygons[i][2];
				b = polygons[i][0];
				c = polygons[i][1];
			}
			var ab = [], ac = [], cross = [];			
			vec3.subtract(ab, b,a);			
			vec3.subtract(ac, c,a);			
			vec3.cross(cross,ab,ac);			
						
			var ifExsist = 0;
			var local = [];
			vec3.add(local, a, cross);			
			// console.log(" vec "+ local)
			for(var k = 0; k<normal.length; k++)
			{				
				if(vec3.equals(local, normal[k]))								
					ifExsist = 1;
				
			}

			if(!ifExsist){				
				normal.push(local);			
				normals.push(local[0],local[1],local[2]);						
			}			

		}
	}
	
	// console.log(normals);
}

function sphereWrapper(wrapper, args, isTex, isRGB){
	var latitudeBands = 30;
    var longitudeBands = 30;	
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

		if(isTex)
		{
        	wrapper.push(u);
			wrapper.push(v);
		}        
      }
    }
}

function createWrapper(wrapper, args, isTex, isRGB){	
	if(isTex){
		var uv = [
			0, 0,
			0, 1,
			1, 1,
			1, 0,
		 	0, 0,
			1, 0,
			1, 1,
		 	0, 1,
		  	1, 1,
		 	0, 1,
	   		0, 0,
			1, 0,
		 	1, 1,
			1, 0,
			0, 0,
			 0, 1,
		 	0, 0,
			0, 1,
			1, 1,
		 	1, 0,
		 	1, 1,
		 	1, 0,
		 	0, 0,
		 	0, 1,
		]
		for( var i = 0; i<48; i++)
			wrapper.push(uv[i]);
	}else {
		if(!isRGB)
		{
			var gradient = [
				0.7,0.0,1.0,
				0.1, 1.0, 0.6,
				0.5, 0.5, 0.5,
				0.8, 1.0, 0.9,
				0.1, 1.0, 0.6,
				0.75, 0.25, 0.5,
				0.75, 0.25, 0.5,
				0.7,0.0,1.0,
	   			0.25, 0.25, 0.75,
	   			1.0, 1.0,0.0,
	   			0.25, 0.25, 0.75,
	   			0.8, 1.0, 0.9,
	   			1.0, 0.0, 0.15,
				1.0, 1.0,0.0,
				1.0, 0.0, 0.15,
				0.1, 1.0, 0.6,
				0.8, 1.0, 0.9,
			 	0.0, 1.0, 0.15,
			  	0.0, 1.0, 0.15,
			 	0.7,0.0,1.0,
			 	0.5, 0.5, 1.0,
			 	0.5, 0.5, 1.0,
			 	1.0, 1.0,0.0,
				 0.5, 0.5, 1.0,			 
			]
			for( var i = 0; i<72; i++)
				wrapper.push(gradient[i]);
		}else{

			var rgb = args[args.length-1]			
			var colors = [
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
				rgb.r,rgb.g,rgb.b,
			];
			for( var i = 0; i<72; i++)
				wrapper.push(colors[i]);
		}
	}
}

function makeTor(vertices,indices,normals, texCoords, objs, args){
	var slices = 8;
	var loops = 20;
	var inner_rad = 0.5;
	var outerRad = 2;
	var iind = 0;
	for(var j = 0; j < objs.length; j++)
	{	
		iind = iind + (objs[j].verticies.length/3);
	}

    for (let slice = 0; slice <= slices; ++slice) {
      const v = slice / slices;
      const slice_angle = v * 2 * Math.PI;
      const cos_slices = Math.cos(slice_angle);
      const sin_slices = Math.sin(slice_angle);
      const slice_rad = outerRad + inner_rad * cos_slices;

      for (let loop = 0; loop <= loops; ++loop) {        
        const u = loop / loops;
        const loop_angle = u * 2 * Math.PI;
        const cos_loops = Math.cos(loop_angle);
        const sin_loops = Math.sin(loop_angle);

        const x = slice_rad * cos_loops;
        const y = slice_rad * sin_loops;
        const z = inner_rad * sin_slices;

        vertices.push(x+args[0], y+args[0], z+args[0]);
        normals.push(
           cos_loops * sin_slices, 
           sin_loops * sin_slices, 
           cos_slices);

        texCoords.push(u);
        texCoords.push(v);
      }
    }

    const vertsPerSlice = loops + 1;
    for (let i = 0; i < slices; ++i) {
      let v1 = i * vertsPerSlice;
      let v2 = v1 + vertsPerSlice;

      for (let j = 0; j < loops; ++j) {

        indices.push(iind+v1);
        indices.push(iind+v1 + 1);
        indices.push(iind+v2);

        indices.push(iind+v2);
        indices.push(iind+v1 + 1);
        indices.push(iind+v2 + 1);

        v1 += 1;
        v2 += 1;
      }
    }
}

function sphereTex(sphere, [x1,y1,z1,size]){
	var latitudeBands = 30;
    var longitudeBands = 30;
	var radius = 2;
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        sphere.push((radius * x)+x1);
        sphere.push((radius * y)+y1);
        sphere.push((radius * z)+z1);
      }
    }
}

function sphereColored(sphere, [x1,y1,z1,size]){
	var latitudeBands = 30;
    var longitudeBands = 30;
	var radius = 2;
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
		var v = 1 - (latNumber / latitudeBands);
		
        sphere.push(radius * x);
        sphere.push(radius * y);
        sphere.push(radius * z);
      }
    }

	console.log(sphere)
}

function cubeVerticies(cube, [x, y, z, size]){	
	// console.log(x,y,z,size,size,size)
    rectVerticies(cube,[x,y,z,size,size,size]);
}

function cubeVerticiesColored(cube, [x, y, z, size, rgb]){
    rectVerticiesColored(cube,x,y,z,size,size,size, rgb);
}

//buffer; center point of rect; full length, height, width 
function rectVerticies(rect, [x, y, z, len, h, w]){
    var boxVertices = 
    [ // X,      Y,     Z          U, V
        
        x-len/2, y+h/2, z-w/2,
		x-len/2, y+h/2, z+w/2,
		x+len/2, y+h/2, z+w/2,
		x+len/2, y+h/2, z-w/2,

		
		x-len/2, y+h/2, z+w/2,
		x-len/2, y-h/2, z+w/2,
		x-len/2, y-h/2, z-w/2,
		x-len/2, y+h/2, z-w/2,

		
		x+len/2, y-h/2, z-w/2,
		x+len/2, y+h/2, z-w/2,
		x+len/2, y+h/2, z+w/2,
		x+len/2, y-h/2, z+w/2,

		
		x+len/2, y+h/2, z+w/2,
		x+len/2, y-h/2, z+w/2,
		x-len/2, y-h/2, z+w/2,
		x-len/2, y+h/2, z+w/2,

		
		x+len/2, y+h/2, z-w/2,
		x+len/2, y-h/2, z-w/2,
		x-len/2, y-h/2, z-w/2,
		x-len/2, y+h/2, z-w/2,

		
		x-len/2, y-h/2, z-w/2,
		x-len/2, y-h/2, z+w/2,
		x+len/2, y-h/2, z+w/2,
		x+len/2, y-h/2, z-w/2,
    ]
    
    for( var i = 0; i<72; i++)
    rect.push(boxVertices[i]);

}

//buffer; center point of rect; full length, height, width 
function rectVerticiesColored(rect, [x, y, z, len, h, w, rgb]){
	// if(!rgb)	
    var boxVertices = 
    [ // X,      Y,     Z          R G B
        // Top
        x-len/2, y+h/2, z-w/2,  
		x-len/2, y+h/2, z+w/2,  
		x+len/2, y+h/2, z+w/2,  
		x+len/2, y+h/2, z-w/2,  

		// Left
		x-len/2, y+h/2, z+w/2,  
		x-len/2, y-h/2, z+w/2,  
		x-len/2, y-h/2, z-w/2,  
		x-len/2, y+h/2, z-w/2,  

		// Right
		x+len/2, y-h/2, z-w/2,  
		x+len/2, y+h/2, z-w/2,  
		x+len/2, y+h/2, z+w/2,  
		x+len/2, y-h/2, z+w/2,  

		// Front
		x+len/2, y+h/2, z+w/2,  
		x+len/2, y-h/2, z+w/2,  
		x-len/2, y-h/2, z+w/2,  
		x-len/2, y+h/2, z+w/2,  

		// Back
		x+len/2, y+h/2, z-w/2,  
		x+len/2, y-h/2, z-w/2,  
		x-len/2, y-h/2, z-w/2,  
		x-len/2, y+h/2, z-w/2,  

		// Bottom
		x-len/2, y-h/2, z-w/2,  
		x-len/2, y-h/2, z+w/2,  
		x+len/2, y-h/2, z+w/2,  
		x+len/2, y-h/2, z-w/2,  
	]

    for( var i = 0; i<72; i++)
    rect.push(boxVertices[i]);

}

function appendPyramidVerticies(pyramid, [x,y,z, h,w]){ //coordinate of the pyramid's base center, height from it to the top, width of the base
    var pyramidVerts = [
        // base
        -2, 0, -2,  	0.4, 0.2,0.2,
        -2, 0,  2,  	0.1,  0.6, 1,
         2, 0,  2,  	0.4,  0.1, 0.6,
         2, 0, -2,  	0.1,  0.1, 0.4,

		// left 
		0, 4, 0, 		0.4, 0.2,0.2,
		-2, 0, -2, 		0.4, 0.2,0.2,
		-2, 0, 2,		0.4, 0.2,0.2,
		
		//right
		0,4,0, 			0.4, 0.1,  0.1, 
		2,0,2, 			0.4, 0.1,  0.1, 
		2,0,-2,			0.4, 0.1,  0.1, 

		// front 
		0,4,0,  		0.4,  0.1, 0.6,
		-2,0,2, 		0.4,  0.1, 0.6,
		2,0,2,		  	0.4,  0.1, 0.6,

		//back
		0,4,0, 			0.1,  0.6, 1,
		2,0,-2,			0.1,  0.6, 1,
		-2,0,-2,		0.1,  0.6, 1,
    ];

    for( var i = 0; i<96; i++)
    pyramid.push(pyramidVerts[i]);
}

//============== INDECIES ==========={
function sphereInd(sphereInd, objs)
{
	var iind = 0;
	for(var j = 0; j < objs.length; j++)
	{	
		iind = iind + (objs[j].verticies.length/3);
	}

	var latitudeBands = 30;
    var longitudeBands = 30;
	var radius = 2;
	var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        normalData.push(x);
        normalData.push(y);
        normalData.push(z);
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);
      }
    }

	var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        sphereInd.push(iind+first);
        sphereInd.push(iind+second);
        sphereInd.push(iind+first + 1);

        sphereInd.push(iind+second);
        sphereInd.push(iind+second + 1);
        sphereInd.push(iind+first + 1);
      }
    }
}


function rectIndices(boxInd, objs)
{
	var i = 0;
	for(var j = 0; j < objs.length; j++)
	{	
		i = i + (objs[j].verticies.length/3);
	}
    var cubeIndices =
    [
		// Top
		i+0, i+1, i+2,
		i+0, i+2, i+3,
		
		i+5, i+4, i+6,
		i+6, i+4, i+7,

		i+8, i+9, i+10,
		i+8, i+10,i+ 11,
		
		i+13,i+ 12,i+ 14,
		i+15,i+ 14,i+ 12,
		
		i+16,i+ 17,i+18,
		i+16,i+ 18,i+19,
		
		i+21,i+ 20, i+22,
		i+22,i+ 20, i+23,           		
    ];

    for( var i = 0; i<36; i++)
        boxInd.push(cubeIndices[i]);
}

function appendPyramidIndecies(boxInd, i)
{
	var pyramidIndices =
    [
		0,1,2,
		0,2,3,
		4,5,6,
		7,8,9,
		10,11,12,
		13,14,15,
	]

	for( var i = 0; i<18; i++)
	boxInd.push(pyramidIndices[i]);
}

// }======== INDECIES ===========


