/**
 * http://usejsdoc.org/
 */
/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog3/spheres.json"; // spheres file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

var lookatvec = mat4.create();

console.log(lookatvec);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
/** contains indices into vertexBuffer in triples */
var triangleVertexAmbientColorBuffer;
var triangleVertexDiffuseColorBuffer;
var triangleVertexSpecularColorBuffer;
var triangleVertexSpecularNColorBuffer;
var triangleVertexNormalBuffer;
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
/** where to put normal for vertex shader*/
var vertexNormalAttrib;
/** where to put position for fragment shader*/
var colorAmbientAttrib;
var colorDiffuseAttrib;
var colorSpecularAttrib;
var colorSpecularNAttrib;

/** make shaderProgram global so that can be used in other functions */
var shaderProgram;

/** Transformation and projection matrix*/
var mvMatrix = mat4.create();
var pMatrix  = mat4.create();

/**
 *  sphere global buffers
 */
var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexIndexBuffer;
var sphereVertexAmbientColorBuffer;
var sphereVertexDiffuseColorBuffer;
var sphereVertexSpecularColorBuffer;
var sphereVertexSpecularNColorBuffer;

/** handling keyboard*/
var currentlyPressedKeys = {};

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    // setup viewport width and height
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try    
    catch(e) {
      console.log(e);
    } // end catch
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var coordArray = []; // 1D array of vertex coords for WebGL
        var indexArray = []; // 1D array of vertex indices for WebGL
        var vtxBufferSize = 0; // the number of vertices in the vertex buffer
        var vtxToAdd = []; // vtx coords to add to the coord array
        var indexOffset = vec3.create(); // the index offset for the current set
        var triToAdd = vec3.create(); // tri indices to add to the index array
               
        
        /**
         *  Part 1 implementation : color information from inputTriangles
         * */
        var diffuseToAdd = vec3.create();
        var diffuseArray = [];
        var ambientToAdd = vec3.create();
        var ambientArray = [];
        var specularToAdd = vec3.create();
        var specularArray = [];
        var specularNToAdd;
        var specularNArray = [];
        
        /**
         *  Part 3 implementation : normal information from inputTriangles
         * */
        var normalToAdd = vec3.create();
        var normalArray = [];
        
        
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset
            
            // set up the vertex coord array
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
            } // end for vertices in set
            
            // set up the triangle index array, adjusting indices across sets
            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
                vec3.add(triToAdd,indexOffset,inputTriangles[whichSet].triangles[whichSetTri]);
                indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
            } // end for triangles in set
            
            /**
             *  Part 1 implementation : color buffer, need diffuse information from inputTriangles
             *  Part 3 implementation : add ambient and specular reflectivity
             * */
            
            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].vertices.length; whichSetTri++) {
            	diffuseToAdd = inputTriangles[whichSet].material.diffuse;
                diffuseArray.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
                ambientToAdd = inputTriangles[whichSet].material.ambient;
                ambientArray.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
                specularToAdd = inputTriangles[whichSet].material.specular;
                specularArray.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
                specularNToAdd = inputTriangles[whichSet].material.n;
                specularNArray.push(specularNToAdd);
            }
                        
            /**
             * Part 3 implementation : normal buffer, need normal information from inputTriangles
             * */
            
            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].normals.length; whichSetTri++) {
            	normalToAdd = inputTriangles[whichSet].normals[whichSetTri];
            	normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
            }
            
            vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
            triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
        } // end for each triangle set 
        triBufferSize *= 3; // now total number of indices

        // console.log("coordinates: "+coordArray.toString());
        // console.log("numverts: "+vtxBufferSize);
        // console.log("indices: "+indexArray.toString());
        // console.log("numindices: "+triBufferSize);
        // console.log("diffuse: "+ diffuseArray.toString());
        // console.log("normal: "+ normalArray.toString());
        
        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        
        // send the triangle indices to webGL
        triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer
        
        /**
         *  Part 3 implementation : normal buffer
         * */
        
        // send the normal infomation to webGL
        triangleVertexNormalBuffer = gl.createBuffer(); // init empty normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer); // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW);
        
        /**
         *  Part 1 implementation : color buffer
         * */
        // send the triangle colors to webGL
        triangleVertexDiffuseColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArray),gl.STATIC_DRAW);
        
        /**
         *  Part 3 implementation : color buffer (ambient & specular)
         * */
        // send the triangle colors to webGL (ambient & specular)
        triangleVertexAmbientColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularNColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNArray),gl.STATIC_DRAW);
        
    } // end if triangles found
} // end load triangles


/**
 * Part 2 implementation : reading data spheres and load them into webGL buffer 
 * using the sphere model from :http://learningwebgl.com/blog/?p=1253
 * The sphere model is able to generate triangle data for rendering
 */

/** getInputSpheres function from hw1*/
function getInputSpheres() {
    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get input spheres

function loadSpheres(){
	var inputSpheres = getInputSpheres();
	var n = inputSpheres.length;
	/**sphere model from :http://learningwebgl.com/blog/?p=1253*/
	var latitudeBands = 30;
    var longitudeBands = 30;
    var indexIncreasement = latitudeBands*(longitudeBands+1) + longitudeBands;
    
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    var indexData = [];
    
    /** sphere color model*/
    var diffuseToAdd = vec4.create();
    var diffuseForSphere = [];
    
    var ambientToAdd = vec4.create();
    var ambientForSphere = [];
    var specularToAdd = vec4.create();
    var specularForSphere = [];
    var specularNToAdd;
    var specularNForSphere = [];
    
    for (var s=0; s<n; s++) {
    	
    var radius = inputSpheres[s].r;
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
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
            vertexPositionData.push(radius * x + inputSpheres[s].x);
            vertexPositionData.push(radius * y + inputSpheres[s].y);
            vertexPositionData.push(radius * z + inputSpheres[s].z);
            diffuseToAdd = inputSpheres[s].diffuse;
            diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
            ambientToAdd = inputSpheres[s].ambient;
            ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
            specularToAdd = inputSpheres[s].specular;
            specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
            specularNToAdd = inputSpheres[s].n;
            specularNForSphere.push(specularNToAdd);
        	}
    	}
    
    
    	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            	var first = (latNumber * (longitudeBands + 1)) + longNumber;
            	var second = first + longitudeBands + 1;
            	indexData.push(first + indexIncreasement*s);
            	indexData.push(second + indexIncreasement*s);
            	indexData.push(first + 1 + indexIncreasement*s);
            	indexData.push(second + indexIncreasement*s);
            	indexData.push(second + 1 + indexIncreasement*s);
            	indexData.push(first + 1 + indexIncreasement*s);
        	}
    	}
    }
    // setup the vertex normal buffer
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = normalData.length / 3;
    
    // send the vertex coords for spheres to webGL
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;
    
    // send the triangle indices for spheres to webGL 
    sphereVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    sphereVertexIndexBuffer.itemSize = 1;
    sphereVertexIndexBuffer.numItems = indexData.length;
	
    /**
     *  Part 2 implementation : color buffer for sphere
     * */
    // send the triangle colors to webGL
    sphereVertexDiffuseColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer);  // activate the buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphere),gl.STATIC_DRAW);
    
    /**
     *  Part 3 implementation : color buffer for sphere (ambient & specular)
     * */
    // send the triangle colors to webGL (ambient & specular)
    sphereVertexAmbientColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer);  // activate the buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphere),gl.STATIC_DRAW);
    
    sphereVertexSpecularColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer);  // activate the buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphere),gl.STATIC_DRAW)
    
    sphereVertexSpecularNColorBuffer = gl.createBuffer();  // initialize an empty triangle color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer);  // activate the buffer
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNForSphere),gl.STATIC_DRAW)
    
    //console.log("vertexPosition length: "+vertexPositionData.length);
    //console.log("indexdata length: "+indexData.length);
    //console.log(indexData.toString());
}


// setup the webGL shaders
function setupShaders() {
    	
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
    	precision mediump float;
    	
    	varying lowp vec4 vDiffuseColor;
    	varying lowp vec4 vAmbientColor;
    	varying lowp vec4 vSpecularColor;
    	varying vec3 normalInterp;
    	varying vec4 vPosition;
    	varying float vSpecularNColor;
    	
    	const vec3 lightPos = vec3(2,4,-0.5);
    	const vec3 lightData = vec3(1,1,1);
    	const vec3 eyeData = vec3(0.5,0.5,-0.5);
    	const float MAX_ITERATIONS = 100.0;

        void main(void) {
        	vec3 vectortolight = normalize(lightPos-vPosition.xyz);
        	vec3 ambientColor = vAmbientColor.rgb*lightData;
        	float N_dot_L = max(dot(normalize(normalInterp),vectortolight),0.0);
        	vec3 diffuseColor =  vDiffuseColor.rgb*lightData*N_dot_L;
        	vec3 vectortoviewer = normalize(eyeData-vPosition.xyz);
        	vec3 vectorH = 0.5*(vectortolight+vectortoviewer);
        	float N_dot_H = max(dot(normalize(normalInterp),vectorH),0.0);
        	float N_dot_H_power_n = N_dot_H;        	
        	for(float i = 0.0; i < MAX_ITERATIONS;i+=1.0){
        		if (i >= vSpecularNColor){break;}
        		N_dot_H_power_n = N_dot_H_power_n* N_dot_H;
        	}
        	
        	vec3 specularColor = vSpecularColor.rgb*lightData*N_dot_H_power_n;
            vec3 BlinnPhongcolor = ambientColor+diffuseColor+specularColor;
            gl_FragColor = vec4(BlinnPhongcolor, 1.0);
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec4 vertexDiffuseColor;
        attribute vec4 vertexAmbientColor;
        attribute vec4 vertexSpecularColor;
        attribute float vertexSpecularNColor;
        attribute vec3 vertexNormal;
    	
    	varying lowp vec4 vDiffuseColor;
    	varying lowp vec4 vAmbientColor;
    	varying lowp vec4 vSpecularColor;
    	varying vec3 normalInterp;
    	varying vec4 vPosition;
    	varying float vSpecularNColor;
    	
    	uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;
   	
        void main(void) {
        	vPosition = uMVMatrix * vec4(vertexPosition,1.0);
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition,1.0);
            normalInterp = uNMatrix * vertexNormal;
            vDiffuseColor = vertexDiffuseColor;
            vAmbientColor = vertexAmbientColor;
            vSpecularColor = vertexSpecularColor;
            vSpecularNColor = vertexSpecularNColor;
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode);              // attach code to shader
        gl.compileShader(fShader);                         // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER);   // create vertex shader
        gl.shaderSource(vShader,vShaderCode);              // attach code to shader
        gl.compileShader(vShader);                         // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram();  // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram);           // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                 throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram);        // activate shader program (frag and vert)
                vertexPositionAttrib =               // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition"); 
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                
                /**
                 * get pointer to fragment shader input (ambient)
                 */
                colorAmbientAttrib = gl.getAttribLocation(shaderProgram, "vertexAmbientColor");
                gl.enableVertexAttribArray(colorAmbientAttrib);
                
                /**
                 * get pointer to fragment shader input (diffuse)
                 */
                colorDiffuseAttrib = gl.getAttribLocation(shaderProgram, "vertexDiffuseColor");
                gl.enableVertexAttribArray(colorDiffuseAttrib);
                
                /**
                 * get pointer to fragment shader input (specular)
                 */
                colorSpecularAttrib = gl.getAttribLocation(shaderProgram, "vertexSpecularColor");
                gl.enableVertexAttribArray(colorSpecularAttrib);
                
                colorSpecularNAttrib = gl.getAttribLocation(shaderProgram, "vertexSpecularNColor");
                gl.enableVertexAttribArray(colorSpecularNAttrib);
                
                
               
                /**
                 * get pointer to vertex shader input normal
                 */
                vertexNormalAttrib = gl.getAttribLocation(shaderProgram,"vertexNormal");
                gl.enableVertexAttribArray(vertexNormalAttrib);
                 
                /**
                 * pMatrix and mvMatrix setup, uniform
                 */
                 shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                 shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                 shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
	mat4.perspective(pMatrix,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	//mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    
//    console.log("projection = " + pMatrix);
//    console.log("modelview = " + mvMatrix);
    
    
    /** 
     * Start to draw triangles (part1)
     **/
    
    /**performing transformation : transform triangles into the center*/
    //mat4.fromTranslation(mvMatrix, [-0.5, -0.5, 0.0]); 
    //mat4.fromTranslation(mvMatrix, [-0.5+move_x, -0.5+move_y, 0.0+move_z]);
    //mat4.fromTranslation(mvMatrix, [move_x, move_y, move_z]);
    //mat4.translate(mvMatrix,mvMatrix, [move_x, move_y, move_z]);
    
	// vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer : active and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render
    
    /** 
     * Start to draw spheres (part2)
     **/
    //mat4.identity(mvMatrix);
    //mat4.fromTranslation(mvMatrix, [-0.5+move_x, -0.5+move_y, 0.0+move_z]);
    // vertex buffer: activate and feed into vertex shader (sphere)
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer); // activate
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0); // render
    
}   // end of rendering triangles


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix,mvMatrix);
    mat3.invert(normalMatrix,normalMatrix);
    mat3.transpose(normalMatrix,normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

/**
 *	Part4 Implementation : handling keyboard 
 */

/**
 * Provides requestAnimationFrame in a cross browser way.
 * from https://github.com/gpjt/webgl-lessons/blob/master/lesson06/webgl-utils.js
 */
window.requestAnimFrame = (function() {
	  return window.requestAnimationFrame ||
	         window.webkitRequestAnimationFrame ||
	         window.mozRequestAnimationFrame ||
	         window.oRequestAnimationFrame ||
	         window.msRequestAnimationFrame ||
	         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	           window.setTimeout(callback, 1000/60);
	         };
	})();


function handleKeyDown(event) {
	
	var whichkeyhandle = event.key;
	
	switch(whichkeyhandle){
		case "A":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "a":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "D":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "d":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "W":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "w":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "S":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "s":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "Q":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "q":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "E":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;
		case "e":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "Escape":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		
		
	}

}

function tick() {
    requestAnimFrame(tick);
    handleKeys();
    renderTriangles();
}

function handleKeyUp(event) {
var whichkeyhandle = event.key;
	
	switch(whichkeyhandle){
		case "A":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "a":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "D":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "d":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "W":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "w":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "S":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "s":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "Q":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "q":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "E":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;
		case "e":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "Escape":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		
	}
}


function handleKeys() {
    
    if (currentlyPressedKeys[65]) {
        // a
    	mat4.translate(mvMatrix,mvMatrix,[-0.01,0,0]);
    	
    }
    if (currentlyPressedKeys[68]) {
        // d
    	mat4.translate(mvMatrix,mvMatrix,[0.01,0,0]);
    	
    }
    if (currentlyPressedKeys[87]) {
        // w
    	mat4.translate(mvMatrix,mvMatrix,[0,-0.01,0]);
    	
    }
    if (currentlyPressedKeys[83]) {
        // s
    	mat4.translate(mvMatrix,mvMatrix,[0,0.01,0]);
    	
    }
    if (currentlyPressedKeys[81]) {
        // q
    	mat4.translate(mvMatrix,mvMatrix,[0,0,-0.01]);
    	
    }
    if (currentlyPressedKeys[69]) {
        // e
    	mat4.translate(mvMatrix,mvMatrix,[0,0,0.01]);
    	
    }
    if (currentlyPressedKeys[65*2]){
    	// A rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,1,0]);
    	
    }
    if (currentlyPressedKeys[68*2]){
    	// D rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,1,0]);
    	
    }
    if (currentlyPressedKeys[87*2]){
    	// W rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[1,0,0]);
    	
    }if (currentlyPressedKeys[83*2]){
    	// S rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[1,0,0]);
    	
    }if (currentlyPressedKeys[81*2]){
    	// Q rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,0,1]);
    	
    }if (currentlyPressedKeys[69*2]){
    	// E rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,0,1]);
    	
    }
    
    if (currentlyPressedKeys[27]){
    	mvMatrix = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    }
       
}




/**
 * MAIN -- HERE is where execution begins after window load
 **/

function main() {
	mat4.lookAt(lookatvec,Eye,[0.5, 0.5, 0.5],[0, 1, 0]);
	mvMatrix = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	
	setupWebGL();      // set up the webGL environment
	loadTriangles();   // load in the triangles from tri file
	/** load in the triangles into webGL from sphere data*/
	loadSpheres();
	setupShaders();    // setup the webGL shaders
	requestAnimFrame(tick);
	handleKeys();
	renderTriangles(); // draw the triangles using webGL
  
} // end main