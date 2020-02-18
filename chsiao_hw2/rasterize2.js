/**
 * http://usejsdoc.org/
 */
/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

var lookatvec = mat4.create();

console.log(lookatvec);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer,vertexBuffer2,vertexBuffer3,vertexBuffer4; // this contains vertex coordinates in triples
var triangleBuffer,triangleBuffer2,triangleBuffer3,triangleBuffer4; // this contains indices into vertexBuffer in triples
/** contains indices into vertexBuffer in triples */
var triangleVertexAmbientColorBuffer,triangleVertexAmbientColorBuffer2,triangleVertexAmbientColorBuffer3,triangleVertexAmbientColorBuffer4;
var triangleVertexDiffuseColorBuffer,triangleVertexDiffuseColorBuffer2,triangleVertexDiffuseColorBuffer3,triangleVertexDiffuseColorBuffer4;
var triangleVertexSpecularColorBuffer,triangleVertexSpecularColorBuffer2,triangleVertexSpecularColorBuffer3,triangleVertexSpecularColorBuffer4;
var triangleVertexSpecularNColorBuffer,triangleVertexSpecularNColorBuffer2,triangleVertexSpecularNColorBuffer3,triangleVertexSpecularNColorBuffer4;
var triangleVertexNormalBuffer,triangleVertexNormalBuffer2,triangleVertexNormalBuffer3,triangleVertexNormalBuffer4;
var triBufferSize = 0; // the number of indices in the triangle buffer
var triBufferSize2 = 0;
var triBufferSize3 = 0;
var triBufferSize4 = 0;
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
// under different transformation
var mvMatrix2 = mat4.create();
var pMatrix2  = mat4.create();
var mvMatrix3 = mat4.create();
var pMatrix3  = mat4.create();
var mvMatrix4 = mat4.create();
var pMatrix4  = mat4.create();
var mvMatrix5 = mat4.create();
var pMatrix5  = mat4.create();
var mvMatrix6 = mat4.create();
var pMatrix6  = mat4.create();
var mvMatrix7 = mat4.create();
var pMatrix7  = mat4.create();
var mvMatrix8 = mat4.create();
var pMatrix8  = mat4.create();
var mvMatrix9 = mat4.create();
var pMatrix9  = mat4.create();


/**
 *  sphere global buffers
 */
var sphereVertexPositionBuffer,sphereVertexPositionBuffer2,sphereVertexPositionBuffer3,sphereVertexPositionBuffer4,sphereVertexPositionBuffer5;
var sphereVertexNormalBuffer,sphereVertexNormalBuffer2,sphereVertexNormalBuffer3,sphereVertexNormalBuffer4,sphereVertexNormalBuffer5;
var sphereVertexIndexBuffer,sphereVertexIndexBuffer2,sphereVertexIndexBuffer3,sphereVertexIndexBuffer4,sphereVertexIndexBuffer5;
var sphereVertexAmbientColorBuffer,sphereVertexAmbientColorBuffer2,sphereVertexAmbientColorBuffer3,sphereVertexAmbientColorBuffer4,sphereVertexAmbientColorBuffer5;
var sphereVertexDiffuseColorBuffer,sphereVertexDiffuseColorBuffer2,sphereVertexDiffuseColorBuffer3,sphereVertexDiffuseColorBuffer4,sphereVertexDiffuseColorBuffer5;
var sphereVertexSpecularColorBuffer,sphereVertexSpecularColorBuffer2,sphereVertexSpecularColorBuffer3,sphereVertexSpecularColorBuffer4,sphereVertexSpecularColorBuffer5;
var sphereVertexSpecularNColorBuffer,sphereVertexSpecularNColorBuffer2,sphereVertexSpecularNColorBuffer3,sphereVertexSpecularNColorBuffer4,sphereVertexSpecularNColorBuffer5;

/** handling keyboard*/
var currentlyPressedKeys = {};

var mode = 0; // only 4 elements in triangle.json + 5 elements in sphere.json

/** highlight implementation*/

var triangleVertexAmbientColorBufferHighlight,triangleVertexAmbientColorBufferHighlight2,triangleVertexAmbientColorBufferHighlight3,triangleVertexAmbientColorBufferHighlight4;
var triangleVertexDiffuseColorBufferHighlight,triangleVertexDiffuseColorBufferHighlight2,triangleVertexDiffuseColorBufferHighlight3,triangleVertexDiffuseColorBufferHighlight4;
var triangleVertexSpecularColorBufferHighlight,triangleVertexSpecularColorBufferHighlight2,triangleVertexSpecularColorBufferHighlight3,triangleVertexSpecularColorBufferHighlight4;


var sphereVertexAmbientColorBufferHighlight;
var sphereVertexDiffuseColorBufferHighlight;
var sphereVertexSpecularColorBufferHighlight;

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
    var accept_num = inputTriangles.length;
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
        var diffuseArrayHighlight = [];
        var ambientToAdd = vec3.create();
        var ambientArray = [];
        var ambientArrayHighlight = [];
        var specularToAdd = vec3.create();
        var specularArray = [];
        var specularArrayHighlight = [];
        var specularNToAdd;
        var specularNArray = [];
        
        /**
         *  Part 3 implementation : normal information from inputTriangles
         * */
        var normalToAdd = vec3.create();
        var normalArray = [];
        
        /**
         * Input triangle one by one
         * This is the first triangle input
         * */
        // set up the vertex coord array
        for (whichSetVert=0; whichSetVert<inputTriangles[0].vertices.length; whichSetVert++) {
        	vtxToAdd = inputTriangles[0].vertices[whichSetVert];
        	coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
        	diffuseToAdd = inputTriangles[0].material.diffuse;
        	diffuseArray.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
        	ambientToAdd = inputTriangles[0].material.ambient;
        	ambientArray.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
        	specularToAdd = inputTriangles[0].material.specular;
        	specularArray.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
        	specularNToAdd = inputTriangles[0].material.n;
        	specularNArray.push(specularNToAdd);
        	ambientArrayHighlight.push(0.5,0.5,0.0,1.0);
        	diffuseArrayHighlight.push(0.5,0.5,0.0,1.0);
        	specularArrayHighlight.push(0.0,0.0,0.0,1.0);
        } // end for vertices in set
       // set up the triangle index array, adjusting indices across sets
       for (whichSetTri=0; whichSetTri<inputTriangles[0].triangles.length; whichSetTri++) {
           vec3.add(triToAdd,indexOffset,inputTriangles[0].triangles[whichSetTri]);
           indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
        } // end for triangles in set
       for (whichSetTri=0; whichSetTri<inputTriangles[0].normals.length; whichSetTri++) {
    	   normalToAdd = inputTriangles[0].normals[whichSetTri];
    	   normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
       }   
       vtxBufferSize = inputTriangles[0].vertices.length; // total number of vertices
       triBufferSize = inputTriangles[0].triangles.length; // total number of tris 
       triBufferSize *= 3; // now total number of indices
              
       
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
        
        triangleVertexAmbientColorBufferHighlight = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBufferHighlight);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexDiffuseColorBufferHighlight = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBufferHighlight = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBufferHighlight);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArrayHighlight),gl.STATIC_DRAW);

        coordArray = [];
        indexArray = [];
        normalArray = [];
        diffuseArray = [];
        ambientArray = [];
        specularArray = [];
        diffuseArrayHighlight = [];
        ambientArrayHighlight = [];
        specularArrayHighlight = [];
        specularNArray = [];
        vtxBufferSize = 0;
        
        if(accept_num >=2){
        /**
         *  Second triangle read in
         * 
         * */
        for (whichSetVert=0; whichSetVert<inputTriangles[1].vertices.length; whichSetVert++) {
        	vtxToAdd = inputTriangles[1].vertices[whichSetVert];
        	coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
        	diffuseToAdd = inputTriangles[1].material.diffuse;
        	diffuseArray.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
        	ambientToAdd = inputTriangles[1].material.ambient;
        	ambientArray.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
        	specularToAdd = inputTriangles[1].material.specular;
        	specularArray.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
        	specularNToAdd = inputTriangles[1].material.n;
        	specularNArray.push(specularNToAdd);
        	ambientArrayHighlight.push(0.5,0.5,0.0,1.0);
        	diffuseArrayHighlight.push(0.5,0.5,0.0,1.0);
        	specularArrayHighlight.push(0.0,0.0,0.0,1.0);
        } // end for vertices in set
       // set up the triangle index array, adjusting indices across sets
       for (whichSetTri=0; whichSetTri<inputTriangles[1].triangles.length; whichSetTri++) {
           vec3.add(triToAdd,indexOffset,inputTriangles[1].triangles[whichSetTri]);
           indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
        } // end for triangles in set
       for (whichSetTri=0; whichSetTri<inputTriangles[1].normals.length; whichSetTri++) {
    	   normalToAdd = inputTriangles[1].normals[whichSetTri];
    	   normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
       }   
       vtxBufferSize = inputTriangles[1].vertices.length; // total number of vertices
       triBufferSize2 = inputTriangles[1].triangles.length; // total number of tris 
       triBufferSize2 *= 3; // now total number of indices
              
       
        // send the vertex coords to webGL
        vertexBuffer2 = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer2); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        
        // send the triangle indices to webGL
        triangleBuffer2 = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer2); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer
        
        /**
         *  Part 3 implementation : normal buffer
         * */
        
        // send the normal infomation to webGL
        triangleVertexNormalBuffer2 = gl.createBuffer(); // init empty normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer2); // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW);
        
        /**
         *  Part 1 implementation : color buffer
         * */
        // send the triangle colors to webGL
        triangleVertexDiffuseColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArray),gl.STATIC_DRAW);
        
        /**
         *  Part 3 implementation : color buffer (ambient & specular)
         * */
        // send the triangle colors to webGL (ambient & specular)
        triangleVertexAmbientColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularNColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNArray),gl.STATIC_DRAW);
        
        triangleVertexAmbientColorBufferHighlight2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBufferHighlight2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexDiffuseColorBufferHighlight2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBufferHighlight2 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBufferHighlight2);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArrayHighlight),gl.STATIC_DRAW);

        coordArray = [];
        indexArray = [];
        normalArray = [];
        diffuseArray = [];
        ambientArray = [];
        specularArray = [];
        diffuseArrayHighlight = [];
        ambientArrayHighlight = [];
        specularArrayHighlight = [];
        specularNArray = [];
        vtxBufferSize = 0;
        }
        if(accept_num>=3){
        /**
         *  Third triangle read in
         * 
         * */
        for (whichSetVert=0; whichSetVert<inputTriangles[2].vertices.length; whichSetVert++) {
        	vtxToAdd = inputTriangles[2].vertices[whichSetVert];
        	coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
        	diffuseToAdd = inputTriangles[2].material.diffuse;
        	diffuseArray.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
        	ambientToAdd = inputTriangles[2].material.ambient;
        	ambientArray.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
        	specularToAdd = inputTriangles[2].material.specular;
        	specularArray.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
        	specularNToAdd = inputTriangles[2].material.n;
        	specularNArray.push(specularNToAdd);
        	ambientArrayHighlight.push(0.5,0.5,0.0,1.0);
        	diffuseArrayHighlight.push(0.5,0.5,0.0,1.0);
        	specularArrayHighlight.push(0.0,0.0,0.0,1.0);
        } // end for vertices in set
       // set up the triangle index array, adjusting indices across sets
       for (whichSetTri=0; whichSetTri<inputTriangles[2].triangles.length; whichSetTri++) {
           vec3.add(triToAdd,indexOffset,inputTriangles[2].triangles[whichSetTri]);
           indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
        } // end for triangles in set
       for (whichSetTri=0; whichSetTri<inputTriangles[2].normals.length; whichSetTri++) {
    	   normalToAdd = inputTriangles[2].normals[whichSetTri];
    	   normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
       }   
       vtxBufferSize = inputTriangles[2].vertices.length; // total number of vertices
       triBufferSize3 = inputTriangles[2].triangles.length; // total number of tris 
       triBufferSize3 *= 3; // now total number of indices
              
       
        // send the vertex coords to webGL
        vertexBuffer3 = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer3); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        
        // send the triangle indices to webGL
        triangleBuffer3 = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer3); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer
        
        /**
         *  Part 3 implementation : normal buffer
         * */
        
        // send the normal infomation to webGL
        triangleVertexNormalBuffer3 = gl.createBuffer(); // init empty normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer3); // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW);
        
        /**
         *  Part 1 implementation : color buffer
         * */
        // send the triangle colors to webGL
        triangleVertexDiffuseColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArray),gl.STATIC_DRAW);
        
        /**
         *  Part 3 implementation : color buffer (ambient & specular)
         * */
        // send the triangle colors to webGL (ambient & specular)
        triangleVertexAmbientColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularNColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNArray),gl.STATIC_DRAW);
        
        triangleVertexAmbientColorBufferHighlight3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBufferHighlight3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexDiffuseColorBufferHighlight3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBufferHighlight3 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBufferHighlight3);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArrayHighlight),gl.STATIC_DRAW);

        coordArray = [];
        indexArray = [];
        normalArray = [];
        diffuseArray = [];
        ambientArray = [];
        specularArray = [];
        diffuseArrayHighlight = [];
        ambientArrayHighlight = [];
        specularArrayHighlight = [];
        specularNArray = [];
        vtxBufferSize = 0;
        }
        if(accept_num>=4){
        /**
         *  Forth triangle read in
         * 
         * */
        for (whichSetVert=0; whichSetVert<inputTriangles[3].vertices.length; whichSetVert++) {
        	vtxToAdd = inputTriangles[3].vertices[whichSetVert];
        	coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
        	diffuseToAdd = inputTriangles[3].material.diffuse;
        	diffuseArray.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
        	ambientToAdd = inputTriangles[3].material.ambient;
        	ambientArray.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
        	specularToAdd = inputTriangles[3].material.specular;
        	specularArray.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
        	specularNToAdd = inputTriangles[3].material.n;
        	specularNArray.push(specularNToAdd);
        	ambientArrayHighlight.push(0.5,0.5,0.0,1.0);
        	diffuseArrayHighlight.push(0.5,0.5,0.0,1.0);
        	specularArrayHighlight.push(0.0,0.0,0.0,1.0);
        } // end for vertices in set
       // set up the triangle index array, adjusting indices across sets
       for (whichSetTri=0; whichSetTri<inputTriangles[3].triangles.length; whichSetTri++) {
           vec3.add(triToAdd,indexOffset,inputTriangles[3].triangles[whichSetTri]);
           indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
        } // end for triangles in set
       for (whichSetTri=0; whichSetTri<inputTriangles[3].normals.length; whichSetTri++) {
    	   normalToAdd = inputTriangles[3].normals[whichSetTri];
    	   normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
       }   
       vtxBufferSize = inputTriangles[3].vertices.length; // total number of vertices
       triBufferSize4 = inputTriangles[3].triangles.length; // total number of tris 
       triBufferSize4 *= 3; // now total number of indices
              
       
        // send the vertex coords to webGL
        vertexBuffer4 = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer4); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        
        // send the triangle indices to webGL
        triangleBuffer4 = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer4); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer
        
        /**
         *  Part 3 implementation : normal buffer
         * */
        
        // send the normal infomation to webGL
        triangleVertexNormalBuffer4 = gl.createBuffer(); // init empty normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer4); // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW);
        
        /**
         *  Part 1 implementation : color buffer
         * */
        // send the triangle colors to webGL
        triangleVertexDiffuseColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArray),gl.STATIC_DRAW);
        
        /**
         *  Part 3 implementation : color buffer (ambient & specular)
         * */
        // send the triangle colors to webGL (ambient & specular)
        triangleVertexAmbientColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArray),gl.STATIC_DRAW);
        
        triangleVertexSpecularNColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNArray),gl.STATIC_DRAW);
        
        triangleVertexAmbientColorBufferHighlight4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBufferHighlight4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexDiffuseColorBufferHighlight4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseArrayHighlight),gl.STATIC_DRAW);
        
        triangleVertexSpecularColorBufferHighlight4 = gl.createBuffer();  // initialize an empty triangle color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBufferHighlight4);  // activate the buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularArrayHighlight),gl.STATIC_DRAW);
        }
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
	var radius;
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
    
 
    /**
     * Input the first sphere
     * */
    
  radius = inputSpheres[0].r;
  
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
          vertexPositionData.push(radius * x + inputSpheres[0].x);
          vertexPositionData.push(radius * y + inputSpheres[0].y);
          vertexPositionData.push(radius * z + inputSpheres[0].z);
          diffuseToAdd = inputSpheres[0].diffuse;
          diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
          ambientToAdd = inputSpheres[0].ambient;
          ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
          specularToAdd = inputSpheres[0].specular;
          specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
          specularNToAdd = inputSpheres[0].n;
          specularNForSphere.push(specularNToAdd);
      	}
  	}
  
  
  	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
      	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
          	var first = (latNumber * (longitudeBands + 1)) + longNumber;
          	var second = first + longitudeBands + 1;
          	indexData.push(first);
          	indexData.push(second);
          	indexData.push(first + 1);
          	indexData.push(second);
          	indexData.push(second + 1);
          	indexData.push(first + 1);
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

    vertexPositionData = [];
    normalData = [];
    indexData  = [];
    diffuseForSphere = [];
    ambientForSphere = [];
    specularForSphere = [];
    specularNForSphere = [];
    
    if(n>=2){
    
    /**
     * Input the second sphere
     * */
    radius = inputSpheres[1].r;
    
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
            vertexPositionData.push(radius * x + inputSpheres[1].x);
            vertexPositionData.push(radius * y + inputSpheres[1].y);
            vertexPositionData.push(radius * z + inputSpheres[1].z);
            diffuseToAdd = inputSpheres[1].diffuse;
            diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
            ambientToAdd = inputSpheres[1].ambient;
            ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
            specularToAdd = inputSpheres[1].specular;
            specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
            specularNToAdd = inputSpheres[1].n;
            specularNForSphere.push(specularNToAdd);
        	}
    	}
    
    
    	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            	var first = (latNumber * (longitudeBands + 1)) + longNumber;
            	var second = first + longitudeBands + 1;
            	indexData.push(first);
            	indexData.push(second);
            	indexData.push(first + 1);
            	indexData.push(second);
            	indexData.push(second + 1);
            	indexData.push(first + 1);
        	}
    	}
          
      // setup the vertex normal buffer
      sphereVertexNormalBuffer2 = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer2);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
      sphereVertexNormalBuffer2.itemSize = 3;
      sphereVertexNormalBuffer2.numItems = normalData.length / 3;
      
      // send the vertex coords for spheres to webGL
      sphereVertexPositionBuffer2 = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer2);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
      sphereVertexPositionBuffer2.itemSize = 3;
      sphereVertexPositionBuffer2.numItems = vertexPositionData.length / 3;
      
      // send the triangle indices for spheres to webGL 
      sphereVertexIndexBuffer2 = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer2);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
      sphereVertexIndexBuffer2.itemSize = 1;
      sphereVertexIndexBuffer2.numItems = indexData.length;
  	
      /**
       *  Part 2 implementation : color buffer for sphere
       * */
      // send the triangle colors to webGL
      sphereVertexDiffuseColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer2);  // activate the buffer
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphere),gl.STATIC_DRAW);
      
      /**
       *  Part 3 implementation : color buffer for sphere (ambient & specular)
       * */
      // send the triangle colors to webGL (ambient & specular)
      sphereVertexAmbientColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer2);  // activate the buffer
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphere),gl.STATIC_DRAW);
      
      sphereVertexSpecularColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer2);  // activate the buffer
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphere),gl.STATIC_DRAW)
      
      sphereVertexSpecularNColorBuffer2 = gl.createBuffer();  // initialize an empty triangle color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer2);  // activate the buffer
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNForSphere),gl.STATIC_DRAW)

      vertexPositionData = [];
      normalData = [];
      indexData  = [];
      diffuseForSphere = [];
      ambientForSphere = [];
      specularForSphere = [];
      specularNForSphere = [];
    }
         if(n>=3){           
        /**
         * Input the third sphere
         * */
        radius = inputSpheres[2].r;
        
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
                vertexPositionData.push(radius * x + inputSpheres[2].x);
                vertexPositionData.push(radius * y + inputSpheres[2].y);
                vertexPositionData.push(radius * z + inputSpheres[2].z);
                diffuseToAdd = inputSpheres[2].diffuse;
                diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
                ambientToAdd = inputSpheres[2].ambient;
                ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
                specularToAdd = inputSpheres[2].specular;
                specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
                specularNToAdd = inputSpheres[2].n;
                specularNForSphere.push(specularNToAdd);
            	}
        	}
        
        
        	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                	var first = (latNumber * (longitudeBands + 1)) + longNumber;
                	var second = first + longitudeBands + 1;
                	indexData.push(first);
                	indexData.push(second);
                	indexData.push(first + 1);
                	indexData.push(second);
                	indexData.push(second + 1);
                	indexData.push(first + 1);
            	}
        	}
              
          // setup the vertex normal buffer
          sphereVertexNormalBuffer3 = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer3);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
          sphereVertexNormalBuffer3.itemSize = 3;
          sphereVertexNormalBuffer3.numItems = normalData.length / 3;
          
          // send the vertex coords for spheres to webGL
          sphereVertexPositionBuffer3 = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer3);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
          sphereVertexPositionBuffer3.itemSize = 3;
          sphereVertexPositionBuffer3.numItems = vertexPositionData.length / 3;
          
          // send the triangle indices for spheres to webGL 
          sphereVertexIndexBuffer3 = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer3);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
          sphereVertexIndexBuffer3.itemSize = 1;
          sphereVertexIndexBuffer3.numItems = indexData.length;
      	
          /**
           *  Part 2 implementation : color buffer for sphere
           * */
          // send the triangle colors to webGL
          sphereVertexDiffuseColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
          gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer3);  // activate the buffer
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphere),gl.STATIC_DRAW);
          
          /**
           *  Part 3 implementation : color buffer for sphere (ambient & specular)
           * */
          // send the triangle colors to webGL (ambient & specular)
          sphereVertexAmbientColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
          gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer3);  // activate the buffer
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphere),gl.STATIC_DRAW);
          
          sphereVertexSpecularColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
          gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer3);  // activate the buffer
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphere),gl.STATIC_DRAW)
          
          sphereVertexSpecularNColorBuffer3 = gl.createBuffer();  // initialize an empty triangle color buffer
          gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer3);  // activate the buffer
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNForSphere),gl.STATIC_DRAW)

          vertexPositionData = [];
          normalData = [];
          indexData  = [];
          diffuseForSphere = [];
          ambientForSphere = [];
          specularForSphere = [];
          specularNForSphere = [];
         }
          if(n>=4){
          /**
           * Input the forth sphere
           * */
          radius = inputSpheres[3].r;
          
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
                  vertexPositionData.push(radius * x + inputSpheres[3].x);
                  vertexPositionData.push(radius * y + inputSpheres[3].y);
                  vertexPositionData.push(radius * z + inputSpheres[3].z);
                  diffuseToAdd = inputSpheres[3].diffuse;
                  diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
                  ambientToAdd = inputSpheres[3].ambient;
                  ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
                  specularToAdd = inputSpheres[3].specular;
                  specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
                  specularNToAdd = inputSpheres[3].n;
                  specularNForSphere.push(specularNToAdd);
              	}
          	}
          
          
          	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
              	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                  	var first = (latNumber * (longitudeBands + 1)) + longNumber;
                  	var second = first + longitudeBands + 1;
                  	indexData.push(first);
                  	indexData.push(second);
                  	indexData.push(first + 1);
                  	indexData.push(second);
                  	indexData.push(second + 1);
                  	indexData.push(first + 1);
              	}
          	}
                
            // setup the vertex normal buffer
            sphereVertexNormalBuffer4 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer4);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
            sphereVertexNormalBuffer4.itemSize = 3;
            sphereVertexNormalBuffer4.numItems = normalData.length / 3;
            
            // send the vertex coords for spheres to webGL
            sphereVertexPositionBuffer4 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer4);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
            sphereVertexPositionBuffer4.itemSize = 3;
            sphereVertexPositionBuffer4.numItems = vertexPositionData.length / 3;
            
            // send the triangle indices for spheres to webGL 
            sphereVertexIndexBuffer4 = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer4);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
            sphereVertexIndexBuffer4.itemSize = 1;
            sphereVertexIndexBuffer4.numItems = indexData.length;
        	
            /**
             *  Part 2 implementation : color buffer for sphere
             * */
            // send the triangle colors to webGL
            sphereVertexDiffuseColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer4);  // activate the buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphere),gl.STATIC_DRAW);
            
            /**
             *  Part 3 implementation : color buffer for sphere (ambient & specular)
             * */
            // send the triangle colors to webGL (ambient & specular)
            sphereVertexAmbientColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer4);  // activate the buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphere),gl.STATIC_DRAW);
            
            sphereVertexSpecularColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer4);  // activate the buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphere),gl.STATIC_DRAW)
            
            sphereVertexSpecularNColorBuffer4 = gl.createBuffer();  // initialize an empty triangle color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer4);  // activate the buffer
            gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNForSphere),gl.STATIC_DRAW)

            vertexPositionData = [];
            normalData = [];
            indexData  = [];
            diffuseForSphere = [];
            ambientForSphere = [];
            specularForSphere = [];
            specularNForSphere = [];
         }
         if(n>=5){
            /**
             * Input the fifth sphere
             * */
            radius = inputSpheres[4].r;
            
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
                    vertexPositionData.push(radius * x + inputSpheres[4].x);
                    vertexPositionData.push(radius * y + inputSpheres[4].y);
                    vertexPositionData.push(radius * z + inputSpheres[4].z);
                    diffuseToAdd = inputSpheres[4].diffuse;
                    diffuseForSphere.push(diffuseToAdd[0],diffuseToAdd[1],diffuseToAdd[2],1.0);
                    ambientToAdd = inputSpheres[4].ambient;
                    ambientForSphere.push(ambientToAdd[0],ambientToAdd[1],ambientToAdd[2],1.0);
                    specularToAdd = inputSpheres[4].specular;
                    specularForSphere.push(specularToAdd[0],specularToAdd[1],specularToAdd[2],1.0);
                    specularNToAdd = inputSpheres[4].n;
                    specularNForSphere.push(specularNToAdd);
                	}
            	}
            
            
            	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
                	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                    	var first = (latNumber * (longitudeBands + 1)) + longNumber;
                    	var second = first + longitudeBands + 1;
                    	indexData.push(first);
                    	indexData.push(second);
                    	indexData.push(first + 1);
                    	indexData.push(second);
                    	indexData.push(second + 1);
                    	indexData.push(first + 1);
                	}
            	}
             /**create data for the highlight sphere*/ 
                var diffuseForSphereHighlight = [];
                var ambientForSphereHighlight = [];
                var specularForSphereHighlight = [];
            	
                for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
                    for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                        diffuseForSphereHighlight.push(0.5,0.5,0.0,1.0);
                        ambientForSphereHighlight.push(0.5,0.5,0.0,1.0);
                        specularForSphereHighlight.push(0.0,0.0,0.0,1.0);
                    	}
                	}
            	
              // setup the vertex normal buffer
              sphereVertexNormalBuffer5 = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer5);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
              sphereVertexNormalBuffer5.itemSize = 3;
              sphereVertexNormalBuffer5.numItems = normalData.length / 3;
              
              // send the vertex coords for spheres to webGL
              sphereVertexPositionBuffer5 = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer5);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
              sphereVertexPositionBuffer5.itemSize = 3;
              sphereVertexPositionBuffer5.numItems = vertexPositionData.length / 3;
              
              // send the triangle indices for spheres to webGL 
              sphereVertexIndexBuffer5 = gl.createBuffer();
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer5);
              gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
              sphereVertexIndexBuffer5.itemSize = 1;
              sphereVertexIndexBuffer5.numItems = indexData.length;
          	
              /**
               *  Part 2 implementation : color buffer for sphere
               * */
              // send the triangle colors to webGL
              sphereVertexDiffuseColorBuffer5 = gl.createBuffer();  // initialize an empty triangle color buffer
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer5);  // activate the buffer
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphere),gl.STATIC_DRAW);
              
              /**
               *  Part 3 implementation : color buffer for sphere (ambient & specular)
               * */
              // send the triangle colors to webGL (ambient & specular)
              sphereVertexAmbientColorBuffer5 = gl.createBuffer();  // initialize an empty triangle color buffer
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer5);  // activate the buffer
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphere),gl.STATIC_DRAW);
              
              sphereVertexSpecularColorBuffer5 = gl.createBuffer();  // initialize an empty triangle color buffer
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer5);  // activate the buffer
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphere),gl.STATIC_DRAW);
              
              sphereVertexSpecularNColorBuffer5 = gl.createBuffer();  // initialize an empty triangle color buffer
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer5);  // activate the buffer
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularNForSphere),gl.STATIC_DRAW);
              
         }
              /** 
               *  Part 5 implementation : create buffer for highlight object (triangle & sphere)
               */
              sphereVertexAmbientColorBufferHighlight = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ambientForSphereHighlight),gl.STATIC_DRAW);
              
              sphereVertexDiffuseColorBufferHighlight = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffuseForSphereHighlight),gl.STATIC_DRAW);
              
              sphereVertexSpecularColorBufferHighlight = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);
              gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(specularForSphereHighlight),gl.STATIC_DRAW);
              
              
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
	mat4.perspective(pMatrix2,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix3,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix4,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix5,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix6,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix7,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix8,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	mat4.perspective(pMatrix9,1.585398,gl.viewportWidth/gl.viewportHeight,0.1,100);
	
    /** 
     * Start to draw triangles (part1)
     **/
	// vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    
  if(mode==1){
	gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientColorBufferHighlight);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexSpecularColorBufferHighlight);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed

  }else{
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
        }
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer : active and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    
    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix,mvMatrix);
    mat3.invert(normalMatrix,normalMatrix);
    mat3.transpose(normalMatrix,normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render
    
    
    /**Draw the second element in triangle*/
    
 // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer2); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    if(mode==2){
  		gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight4);  // activate
  	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
  	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientColorBufferHighlight4);  // activate
  	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
  	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexSpecularColorBufferHighlight4);  // activate
  	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed

  	  }else{
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer2);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer2);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer2);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
  	 }
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer2);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer2); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer : active and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer2); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix2);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix2);
    
    var normalMatrix2 = mat3.create();
    mat3.fromMat4(normalMatrix2,mvMatrix2);
    mat3.invert(normalMatrix2,normalMatrix2);
    mat3.transpose(normalMatrix2,normalMatrix2);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix2);
    gl.drawElements(gl.TRIANGLES,triBufferSize2,gl.UNSIGNED_SHORT,0); // render
    
    /**Draw the third element in triangle*/
    
    // vertex buffer: activate and feed into vertex shader
       gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer3); // activate
       gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
       
       if(mode==3){
    		gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight3);  // activate
    	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientColorBufferHighlight3);  // activate
    	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexSpecularColorBufferHighlight3);  // activate
    	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed

    	  }else{
       /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
       gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer3);  // activate
       gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
       
       /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
       gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer3);  // activate
       gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
       
       /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
       gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer3);  // activate
       gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
    }
       gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer3);  // activate
       gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
       
       /** using the normal buffer, need it to calculate the light model*/
       gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer3); // activate
       gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
       
       // triangle buffer : active and render
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer3); // activate
       gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix3);
       gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix3);
       
       var normalMatrix3 = mat3.create();
       mat3.fromMat4(normalMatrix3,mvMatrix3);
       mat3.invert(normalMatrix3,normalMatrix3);
       mat3.transpose(normalMatrix3,normalMatrix3);
       gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix3);
       gl.drawElements(gl.TRIANGLES,triBufferSize3,gl.UNSIGNED_SHORT,0); // render
    
       
       /**Draw the Forth element in triangle*/
       
       // vertex buffer: activate and feed into vertex shader
          gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer4); // activate
          gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
          
          /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
          if(mode==4){
      		gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBufferHighlight4);  // activate
      	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
      	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexAmbientColorBufferHighlight4);  // activate
      	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
      	    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexSpecularColorBufferHighlight4);  // activate
      	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed

      	  }else{
          gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexDiffuseColorBuffer4);  // activate
          gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
          
          /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
          gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexAmbientColorBuffer4);  // activate
          gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
          
          /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
          gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularColorBuffer4);  // activate
          gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
      	  }
          gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexSpecularNColorBuffer4);  // activate
          gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
          
          /** using the normal buffer, need it to calculate the light model*/
          gl.bindBuffer(gl.ARRAY_BUFFER,triangleVertexNormalBuffer4); // activate
          gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
          
          // triangle buffer : active and render
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer4); // activate
          gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix4);
          gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix4);
          
          var normalMatrix4 = mat3.create();
          mat3.fromMat4(normalMatrix4,mvMatrix4);
          mat3.invert(normalMatrix4,normalMatrix4);
          mat3.transpose(normalMatrix4,normalMatrix4);
          gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix4);
          gl.drawElements(gl.TRIANGLES,triBufferSize4,gl.UNSIGNED_SHORT,0); // render
   
    /** 
     * Start to draw spheres (part2)
     **/

    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
   if(mode==5){
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }else{
	     		
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }
    
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix5);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix5);
    
    var normalMatrix5 = mat3.create();
    mat3.fromMat4(normalMatrix5,mvMatrix5);
    mat3.invert(normalMatrix5,normalMatrix5);
    mat3.transpose(normalMatrix5,normalMatrix5);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix5);
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer.numItems,gl.UNSIGNED_SHORT,0); // render
    		
    /** 
     * draw second spheres (part2)
     **/
    //mat4.identity(mvMatrix);
    //mat4.fromTranslation(mvMatrix, [-0.5+move_x, -0.5+move_y, 0.0+move_z]);
    // vertex buffer: activate and feed into vertex shader (sphere)
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer2); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    if(mode==6){
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }else{
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer2);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer2);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer2);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer2);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer2); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer2); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix6);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix6);
    
    var normalMatrix6 = mat3.create();
    mat3.fromMat4(normalMatrix6,mvMatrix6);
    mat3.invert(normalMatrix6,normalMatrix6);
    mat3.transpose(normalMatrix6,normalMatrix6);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix6);
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer2.numItems,gl.UNSIGNED_SHORT,0); // render
    
    /** 
     * draw third spheres (part2)
     **/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer3); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    if(mode==7){
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }else{
    
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer3);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer3);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer3);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer3);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer3); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer3); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix7);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix7);
    
    var normalMatrix7 = mat3.create();
    mat3.fromMat4(normalMatrix7,mvMatrix7);
    mat3.invert(normalMatrix7,normalMatrix7);
    mat3.transpose(normalMatrix7,normalMatrix7);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix7);
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer3.numItems,gl.UNSIGNED_SHORT,0); // render
    
    /** 
     * draw forth spheres (part2)
     **/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer4); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    if(mode==8){
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }else{
    
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer4);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer4);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer4);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer4);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer4); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer4); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix8);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix8);
    
    var normalMatrix8 = mat3.create();
    mat3.fromMat4(normalMatrix8,mvMatrix8);
    mat3.invert(normalMatrix8,normalMatrix8);
    mat3.transpose(normalMatrix8,normalMatrix8);
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer4.numItems,gl.UNSIGNED_SHORT,0); // render
    
    /** 
     * draw fifth spheres (part2)
     **/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexPositionBuffer5); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    
    if(mode==9){
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBufferHighlight);  // activate
	    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }else{
    
    /** using the color buffer,color buffer(diffuse) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexDiffuseColorBuffer5);  // activate
    gl.vertexAttribPointer(colorDiffuseAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(ambient) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexAmbientColorBuffer5);  // activate
    gl.vertexAttribPointer(colorAmbientAttrib,4,gl.FLOAT,false,0,0); // feed
    
    /** using the color buffer,color buffer(specular) : activate and feed into fragment shader*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularColorBuffer5);  // activate
    gl.vertexAttribPointer(colorSpecularAttrib,4,gl.FLOAT,false,0,0); // feed
   }
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexSpecularNColorBuffer5);  // activate
    gl.vertexAttribPointer(colorSpecularNAttrib,1,gl.FLOAT,false,0,0); // feed
    
    /** using the normal buffer, need it to calculate the light model*/
    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexNormalBuffer5); // activate
    gl.vertexAttribPointer(vertexNormalAttrib,3,gl.FLOAT,false,0,0);
    
    // triangle buffer (sphere render)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereVertexIndexBuffer5); // activate
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix9);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix9);
    
    var normalMatrix9 = mat3.create();
    mat3.fromMat4(normalMatrix9,mvMatrix9);
    mat3.invert(normalMatrix9,normalMatrix9);
    mat3.transpose(normalMatrix9,normalMatrix9);
    gl.drawElements(gl.TRIANGLES,sphereVertexIndexBuffer5.numItems,gl.UNSIGNED_SHORT,0); // render
   
}   // end of rendering triangles


//function setMatrixUniforms() {
//    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
//    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
//    
//    var normalMatrix = mat3.create();
//    mat3.fromMat4(normalMatrix,mvMatrix);
//    mat3.invert(normalMatrix,normalMatrix);
//    mat3.transpose(normalMatrix,normalMatrix);
//    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
//}

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
		case "K":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case "k":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case ":":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case ";":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "L":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case "l":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "O":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case "o":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "I":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case "i":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "P":
			currentlyPressedKeys[event.keyCode*2] = true;
			break;	
		case "p":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case " ":
			currentlyPressedKeys[event.keyCode] = true;
			break;
		case "Backspace":
			currentlyPressedKeys[event.keyCode] = true;
			break;
	}
	
	if (event.keyCode == 37) { // LEFT arrow
	      mode += 1;
	      if (mode == 5) {
	    	  mode = 1;
	      }
	      if (mode>5){
	    	  mode = 1;
	      }
	}
	if (event.keyCode == 39) { // RIGHT arrow
	      mode -= 1;
	      if (mode <= 0) {
	    	  mode = 4;
	      }
	      if(mode>5){
	    	  mode = 4;
	      }
	}
	if (event.keyCode == 38) { // UP arrow
	      mode += 1;
	      if (mode <= 4) {
	    	  mode = 5;
	      }
	      if(mode>9){
	    	  mode = 5;
	      }
	}
	if (event.keyCode == 40) { // DOWN arrow
	      mode -= 1;
	      if (mode <= 4) {
	    	  mode = 9;
	      }
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
		case "K":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case "k":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case ":":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case ";":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "L":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case "l":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "O":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case "o":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "I":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case "i":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "P":
			currentlyPressedKeys[event.keyCode*2] = false;
			break;	
		case "p":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case " ":
			currentlyPressedKeys[event.keyCode] = false;
			break;
		case "Backspace":
			currentlyPressedKeys[event.keyCode] = false;
			break;
	}
}


function handleKeys() {
    
    if (currentlyPressedKeys[65]) {
        // a
    	mat4.translate(mvMatrix,mvMatrix,[-0.01,0,0]);
    	mat4.translate(mvMatrix2,mvMatrix2,[-0.01,0,0]);
    	mat4.translate(mvMatrix3,mvMatrix3,[-0.01,0,0]);
    	mat4.translate(mvMatrix4,mvMatrix4,[-0.01,0,0]);
    	mat4.translate(mvMatrix5,mvMatrix5,[-0.01,0,0]);
    	mat4.translate(mvMatrix6,mvMatrix6,[-0.01,0,0]);
    	mat4.translate(mvMatrix7,mvMatrix7,[-0.01,0,0]);
    	mat4.translate(mvMatrix8,mvMatrix8,[-0.01,0,0]);
    	mat4.translate(mvMatrix9,mvMatrix9,[-0.01,0,0]);
    }
    if (currentlyPressedKeys[68]) {
        // d
    	mat4.translate(mvMatrix,mvMatrix,[0.01,0,0]);
    	mat4.translate(mvMatrix2,mvMatrix2,[0.01,0,0]);
    	mat4.translate(mvMatrix3,mvMatrix3,[0.01,0,0]);
    	mat4.translate(mvMatrix4,mvMatrix4,[0.01,0,0]);
    	mat4.translate(mvMatrix5,mvMatrix5,[0.01,0,0]);
    	mat4.translate(mvMatrix6,mvMatrix6,[0.01,0,0]);
    	mat4.translate(mvMatrix7,mvMatrix7,[0.01,0,0]);
    	mat4.translate(mvMatrix8,mvMatrix8,[0.01,0,0]);
    	mat4.translate(mvMatrix9,mvMatrix9,[0.01,0,0]);
    }
    if (currentlyPressedKeys[87]) {
        // w
    	mat4.translate(mvMatrix,mvMatrix,[0,-0.01,0]);
    	mat4.translate(mvMatrix2,mvMatrix2,[0,-0.01,0]);
    	mat4.translate(mvMatrix3,mvMatrix3,[0,-0.01,0]);
    	mat4.translate(mvMatrix4,mvMatrix4,[0,-0.01,0]);
    	mat4.translate(mvMatrix5,mvMatrix5,[0,-0.01,0]);
    	mat4.translate(mvMatrix6,mvMatrix6,[0,-0.01,0]);
    	mat4.translate(mvMatrix7,mvMatrix7,[0,-0.01,0]);
    	mat4.translate(mvMatrix8,mvMatrix8,[0,-0.01,0]);
    	mat4.translate(mvMatrix9,mvMatrix9,[0,-0.01,0]);
    }
    if (currentlyPressedKeys[83]) {
        // s
    	mat4.translate(mvMatrix,mvMatrix,[0,0.01,0]);
    	mat4.translate(mvMatrix2,mvMatrix2,[0,0.01,0]);
    	mat4.translate(mvMatrix3,mvMatrix3,[0,0.01,0]);
    	mat4.translate(mvMatrix4,mvMatrix4,[0,0.01,0]);
    	mat4.translate(mvMatrix5,mvMatrix5,[0,0.01,0]);
    	mat4.translate(mvMatrix6,mvMatrix6,[0,0.01,0]);
    	mat4.translate(mvMatrix7,mvMatrix7,[0,0.01,0]);
    	mat4.translate(mvMatrix8,mvMatrix8,[0,0.01,0]);
    	mat4.translate(mvMatrix9,mvMatrix9,[0,0.01,0]);
    }
    if (currentlyPressedKeys[81]) {
        // q
    	mat4.translate(mvMatrix,mvMatrix,[0,0,-0.01]);
    	mat4.translate(mvMatrix2,mvMatrix2,[0,0,-0.01]);
    	mat4.translate(mvMatrix3,mvMatrix3,[0,0,-0.01]);
    	mat4.translate(mvMatrix4,mvMatrix4,[0,0,-0.01]);
    	mat4.translate(mvMatrix5,mvMatrix5,[0,0,-0.01]);
    	mat4.translate(mvMatrix6,mvMatrix6,[0,0,-0.01]);
    	mat4.translate(mvMatrix7,mvMatrix7,[0,0,-0.01]);
    	mat4.translate(mvMatrix8,mvMatrix8,[0,0,-0.01]);
    	mat4.translate(mvMatrix9,mvMatrix9,[0,0,-0.01]);
    }
    if (currentlyPressedKeys[69]) {
        // e
    	mat4.translate(mvMatrix,mvMatrix,[0,0,0.01]);
    	mat4.translate(mvMatrix2,mvMatrix2,[0,0,0.01]);
    	mat4.translate(mvMatrix3,mvMatrix3,[0,0,0.01]);
    	mat4.translate(mvMatrix4,mvMatrix4,[0,0,0.01]);
    	mat4.translate(mvMatrix5,mvMatrix5,[0,0,0.01]);
    	mat4.translate(mvMatrix6,mvMatrix6,[0,0,0.01]);
    	mat4.translate(mvMatrix7,mvMatrix7,[0,0,0.01]);
    	mat4.translate(mvMatrix8,mvMatrix8,[0,0,0.01]);
    	mat4.translate(mvMatrix9,mvMatrix9,[0,0,0.01]);
    	
    }
    if (currentlyPressedKeys[65*2]){
    	// A rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[0,1,0]);
    }
    if (currentlyPressedKeys[68*2]){
    	// D rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[0,1,0]);
    	mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[0,1,0]);
    }
    if (currentlyPressedKeys[87*2]){
    	// W rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[1,0,0]);
    }if (currentlyPressedKeys[83*2]){
    	// S rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[1,0,0]);
    	mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[1,0,0]);
    }if (currentlyPressedKeys[81*2]){
    	// Q rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[0,0,1]);
    }if (currentlyPressedKeys[69*2]){
    	// E rotate by 5 degrees
    	mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[0,0,1]);
    	mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[0,0,1]);
    }
    
    if (currentlyPressedKeys[27]){
    	mvMatrix = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix2 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix3 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix4 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix5 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix6 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix7 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix8 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix9 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    }
    if (currentlyPressedKeys[75]){
    	// k 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[0.01,0,0]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[0.01,0,0]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[0.01,0,0]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[0.01,0,0]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[0.01,0,0]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[0.01,0,0]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[0.01,0,0]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[0.01,0,0]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[0.01,0,0]);	
    	}
    }
    if (currentlyPressedKeys[186]){
    	// ; 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[-0.01,0,0]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[-0.01,0,0]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[-0.01,0,0]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[-0.01,0,0]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[-0.01,0,0]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[-0.01,0,0]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[-0.01,0,0]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[-0.01,0,0]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[-0.01,0,0]);	
    	}
    }
    if (currentlyPressedKeys[76]){
    	// l 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[0,0,0.01]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[0,0,0.01]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[0,0,0.01]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[0,0,0.01]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[0,0,0.01]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[0,0,0.01]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[0,0,0.01]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[0,0,0.01]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[0,0,0.01]);	
    	}
    }
    if (currentlyPressedKeys[79]){
    	// o 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[0,0,-0.01]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[0,0,-0.01]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[0,0,-0.01]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[0,0,-0.01]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[0,0,-0.01]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[0,0,-0.01]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[0,0,-0.01]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[0,0,-0.01]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[0,0,-0.01]);	
    	}
    }
    if (currentlyPressedKeys[73]){
    	// i 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[0,0.01,0]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[0,0.01,0]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[0,0.01,0]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[0,0.01,0]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[0,0.01,0]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[0,0.01,0]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[0,0.01,0]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[0,0.01,0]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[0,0.01,0]);	
    	}
    }
    if (currentlyPressedKeys[80]){
    	// p 
    	if(mode==1){
    		mat4.translate(mvMatrix,mvMatrix,[0,-0.01,0]);
    	}else if(mode==2){
    		mat4.translate(mvMatrix2,mvMatrix2,[0,-0.01,0]);	
    	}else if(mode==3){
    		mat4.translate(mvMatrix3,mvMatrix3,[0,-0.01,0]);	
    	}else if(mode==4){
    		mat4.translate(mvMatrix4,mvMatrix4,[0,-0.01,0]);	
    	}else if(mode==5){
    		mat4.translate(mvMatrix5,mvMatrix5,[0,-0.01,0]);	
    	}else if(mode==6){
    		mat4.translate(mvMatrix6,mvMatrix6,[0,-0.01,0]);	
    	}else if(mode==7){
    		mat4.translate(mvMatrix7,mvMatrix7,[0,-0.01,0]);	
    	}else if(mode==8){
    		mat4.translate(mvMatrix8,mvMatrix8,[0,-0.01,0]);	
    	}else if(mode==9){
    		mat4.translate(mvMatrix9,mvMatrix9,[0,-0.01,0]);	
    	}
    }
    if (currentlyPressedKeys[75*2]){
    	// K 
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,1,0]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[0,1,0]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[0,1,0]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[0,1,0]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[0,1,0]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[0,1,0]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[0,1,0]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[0,1,0]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[0,1,0]);
    	}
    }
    if (currentlyPressedKeys[186*2]){
    	// :
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,1,0]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[0,1,0]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[0,1,0]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[0,1,0]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[0,1,0]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[0,1,0]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[0,1,0]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[0,1,0]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[0,1,0]);
    	}
    }
    if (currentlyPressedKeys[76*2]){
    	// L 
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[1,0,0]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[1,0,0]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[1,0,0]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[1,0,0]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[1,0,0]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[1,0,0]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[1,0,0]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[1,0,0]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[1,0,0]);
    	}
    }
    if (currentlyPressedKeys[79*2]){
    	// O 
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,0.0872665,[1,0,0]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[1,0,0]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[1,0,0]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[1,0,0]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[1,0,0]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[1,0,0]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[1,0,0]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[1,0,0]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[1,0,0]);
    	}
    }
    if (currentlyPressedKeys[73*2]){
    	// I 
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,-0.0872665,[0,0,1]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,-0.0872665,[0,0,1]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,-0.0872665,[0,0,1]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,-0.0872665,[0,0,1]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,-0.0872665,[0,0,1]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,-0.0872665,[0,0,1]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,-0.0872665,[0,0,1]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,-0.0872665,[0,0,1]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,-0.0872665,[0,0,1]);
    	}
    }
    if (currentlyPressedKeys[80*2]){
    	// I 
    	if(mode==1){
    		mat4.rotate(mvMatrix,mvMatrix,0.0872665,[0,0,1]);        	
    	}else if(mode==2){
    		mat4.rotate(mvMatrix2,mvMatrix2,0.0872665,[0,0,1]);
    	}else if(mode==3){
    		mat4.rotate(mvMatrix3,mvMatrix3,0.0872665,[0,0,1]);
    	}else if(mode==4){
    		mat4.rotate(mvMatrix4,mvMatrix4,0.0872665,[0,0,1]);
    	}else if(mode==5){
    		mat4.rotate(mvMatrix5,mvMatrix5,0.0872665,[0,0,1]);
    	}else if(mode==6){
    		mat4.rotate(mvMatrix6,mvMatrix6,0.0872665,[0,0,1]);
    	}else if(mode==7){
    		mat4.rotate(mvMatrix7,mvMatrix7,0.0872665,[0,0,1]);
    	}else if(mode==8){
    		mat4.rotate(mvMatrix8,mvMatrix8,0.0872665,[0,0,1]);
    	}else if(mode==9){
    		mat4.rotate(mvMatrix9,mvMatrix9,0.0872665,[0,0,1]);
    	}
    }
    if (currentlyPressedKeys[8]){
    	// backspace
    	mvMatrix = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix2 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix3 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix4 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix5 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix6 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix7 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix8 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    	mvMatrix9 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
    			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
    			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
    			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
    }
    if (currentlyPressedKeys[32]){
    	mode = 0;
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
	mvMatrix2 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix3 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix4 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix5 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix6 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix7 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix8 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
			lookatvec[4],lookatvec[5],lookatvec[6],lookatvec[7],
			lookatvec[8],lookatvec[9],lookatvec[10],lookatvec[11],
			lookatvec[12],lookatvec[13],lookatvec[14],lookatvec[15]);
	mvMatrix9 = mat4.fromValues(lookatvec[0],lookatvec[1],lookatvec[2],lookatvec[3],
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