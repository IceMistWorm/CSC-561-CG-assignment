/* classes */ 

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel
    
// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY; 
    
    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,
            Math.random()*255,255); // rand color

        drawPixel(imagedata,
            Math.floor(Math.random()*w),
            Math.floor(Math.random()*h),
                c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels

// get the input spheres from the standard class URL
function getInputSpheres() {
    const INPUT_SPHERES_URL = 
        "https://ncsucgclass.github.io/prog1/spheres.json";
        
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

// put random points in the spheres from the class github
function drawRandPixelsInInputSpheres(context) {
    var inputSpheres = getInputSpheres();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 400;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputSpheres != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var cx = 0; var cy = 0; // init center x and y coord
        var sphereRadius = 0; // init sphere radius
        var numSpherePixels = 0; // init num pixels in sphere
        var c = new Color(0,0,0,0); // init the sphere color
        var n = inputSpheres.length; // records how many spheres in the world view
        
     /**
      *  Draw the background to black
      **/
     c.change(0,0,0,255);    
     for(var i=0; i<w; i++){
    	 for(var j=0; j<h ; j++){
    		 drawPixel(imagedata,i,j,c)
    	 }
     }
             
        // Loop over the spheres, draw rand pixels in each
        for (var s=0; s<n; s++) {
            cx = w*inputSpheres[s].x; // sphere center x
            cy = h*inputSpheres[s].y; // sphere center y
            sphereRadius = Math.round(w*inputSpheres[s].r); // radius
            numSpherePixels = sphereRadius*4*Math.PI; // sphere area
            numSpherePixels *= PIXEL_DENSITY; // percentage of sphere on
            numSpherePixels = Math.round(numSpherePixels);
            //console.log("sphere radius: "+sphereRadius);
            //console.log("num sphere pixels: "+numSpherePixels);
            c.change(
                inputSpheres[s].diffuse[0]*255,
                inputSpheres[s].diffuse[1]*255,
                inputSpheres[s].diffuse[2]*255,
                255); // rand color
            for (var p=0; p<numSpherePixels; p++) {
                do {
                    x = Math.random()*2 - 1; // in unit square 
                    y = Math.random()*2 - 1; // in unit square
                } while (Math.sqrt(x*x + y*y) > 1)
                drawPixel(imagedata,
                    cx+Math.round(x*sphereRadius),
                    cy+Math.round(y*sphereRadius),c);
                //console.log("color: ("+c.r+","+c.g+","+c.b+")");
                //console.log("x: "+Math.round(w*inputSpheres[s].x));
                //console.log("y: "+Math.round(h*inputSpheres[s].y));
            } // end for pixels in sphere
        } // end for spheres
        context.putImageData(imagedata, 0, 0);
    } // end if spheres found
} // end draw rand pixels in input spheres

// draw 2d projections read from the JSON file at class github
function drawInputSpheresUsingArcs(context) {
    var inputSpheres = getInputSpheres();
    
    
    if (inputSpheres != String.null) { 
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputSpheres.length; 
        //console.log("number of spheres: " + n);

        // Loop over the spheres, draw each in 2d
        for (var s=0; s<n; s++) {
            context.fillStyle = 
                "rgb(" + Math.floor(inputSpheres[s].diffuse[0]*255)
                +","+ Math.floor(inputSpheres[s].diffuse[1]*255)
                +","+ Math.floor(inputSpheres[s].diffuse[2]*255) +")"; // rand color
            context.beginPath();
            context.arc(
                Math.round(w*inputSpheres[s].x),
                Math.round(h*inputSpheres[s].y),
                Math.round(w*inputSpheres[s].r),
                0,2*Math.PI);
            context.fill();
            //console.log(context.fillStyle);
            //console.log("x: "+Math.round(w*inputSpheres[s].x));
            //console.log("y: "+Math.round(h*inputSpheres[s].y));
            //console.log("r: "+Math.round(w*inputSpheres[s].r));
        } // end for spheres
    } // end if spheres found
} // end draw input spheres

function drawPixelsInputSpheresUsingRayCasting(context) {
    var inputSpheres = getInputSpheres();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    var eye_x = 0.5; var eye_y = 0.5; var eye_z = -0.5;
         
    for(var i=0;i<w;i++){             
    	for(var j=0;j<h;j++){		// for each pixel
    		var coord_x = i*(1/w);
    		var coord_y = j*(1/h);
    		var coord_z = 0;
    		// D = P-E ; given E = (0.5,0.5,-0.5) 
    		var ray_dx = (coord_x - 0.5);
    		var ray_dy = (-1)*(coord_y - 0.5);
    		var ray_dz = (coord_z + 0.5);
    		var intersect_dist = 100;     // use to find the closet distance
    		var dist_now = 0; var dist_now2 = 0;
    		/* initialization*/
    		var x = 0; var y = 0; // pixel coord init
            var cx = 0; var cy = 0; // init center x and y coord
            var sphereRadius = 0; // init sphere radius
            var numSpherePixels = 0; // init num pixels in sphere
            var c = new Color(0,0,0,255); // init the sphere color
            var n = inputSpheres.length;
            var intersect_with_which_sphere = -1;
    		var remeber_intersect_x; var remeber_intersect_y; var remeber_intersect_z;
            
            
    		for(var s=0;s<n;s++){  // look at each object for every pixel
    			sphereRadius = inputSpheres[s].r;
    			cx = inputSpheres[s].x;
    			cy = inputSpheres[s].y;
    			cz = inputSpheres[s].z;
    			var diffuse_r = inputSpheres[s].diffuse[0]*255;
                var diffuse_g = inputSpheres[s].diffuse[1]*255;
                var diffuse_b = inputSpheres[s].diffuse[2]*255;
    			// det for determinant
    			// det_a = D * D, det_b = 2D*(E-C), det_c = (E-C)*(E-C)-r^2 
    			det_a = ray_dx*ray_dx + ray_dy*ray_dy + ray_dz*ray_dz;
    			det_b = 2*(ray_dx*(eye_x-cx)+ray_dy*(eye_y-cy)+ray_dz*(eye_z-cz));
    			det_c = ((eye_x-cx)*(eye_x-cx)+(eye_y-cy)*(eye_y-cy)+(eye_z-cz)*(eye_z-cz))- sphereRadius*sphereRadius;
    			
    			det = det_b*det_b-4*det_a*det_c;
    			
    			if(det<0){
    				//drawPixel(imagedata,i,j,c);
    			}else if(det == 0){
    				var intersect_t = (-1)*(det_b)/(2*det_a);
    				var intersection_point_x = eye_x + intersect_t*ray_dx;
    				var intersection_point_y = eye_y + intersect_t*ray_dy;
    				var intersection_point_z = eye_z + intersect_t*ray_dz;
    				dist_now = Math.sqrt((eye_x-intersection_point_x)*(eye_x-intersection_point_x)+(eye_y-intersection_point_y)*(eye_y-intersection_point_y)+(eye_z-intersection_point_z)*(eye_z-intersection_point_z));
    				if(dist_now<intersect_dist){
    					intersect_dist = dist_now;
    					intersect_with_which_sphere = s;
    					remeber_intersect_x = intersection_point_x;
    					remeber_intersect_y = intersection_point_y;
    					remeber_intersect_z = intersection_point_z;
    				}
    				/*
    				c.change(
    		                inputSpheres[s].diffuse[0]*255,
    		                inputSpheres[s].diffuse[1]*255,
    		                inputSpheres[s].diffuse[2]*255,
    		                255);
    				drawPixel(imagedata,i,j,c);*/
    			}else{
    				var intersect_t = ((-1)*(det_b)+Math.sqrt(det))/(2*det_a);
    				var intersection_point_x = eye_x + intersect_t*ray_dx;
    				var intersection_point_y = eye_y + intersect_t*ray_dy;
    				var intersection_point_z = eye_z + intersect_t*ray_dz;
    				dist_now = Math.sqrt((eye_x-intersection_point_x)*(eye_x-intersection_point_x)+(eye_y-intersection_point_y)*(eye_y-intersection_point_y)+(eye_z-intersection_point_z)*(eye_z-intersection_point_z));
    				var intersect_t2 = ((-1)*(det_b)+Math.sqrt(det))/(2*det_a);
    				var intersection_point2_x = eye_x + intersect_t2*ray_dx;
    				var intersection_point2_y = eye_y + intersect_t2*ray_dy;
    				var intersection_point2_z = eye_z + intersect_t2*ray_dz;
    				dist_now = Math.sqrt((eye_x-intersection_point_x)*(eye_x-intersection_point_x)+(eye_y-intersection_point_y)*(eye_y-intersection_point_y)+(eye_z-intersection_point_z)*(eye_z-intersection_point_z));
    				dist_now2 = Math.sqrt((eye_x-intersection_point2_x)*(eye_x-intersection_point2_x)+(eye_y-intersection_point2_y)*(eye_y-intersection_point2_y)+(eye_z-intersection_point2_z)*(eye_z-intersection_point2_z));
    			    				
    				if(dist_now<intersect_dist||dist_now2<intersect_dist){
    					if(dist_now<=dist_now2){
    						intersect_dist = dist_now;
    						remeber_intersect_x = intersection_point_x;
    						remeber_intersect_y = intersection_point_y;
        					remeber_intersect_z = intersection_point_z;
    						intersect_with_which_sphere = s;
                		}else{
                			intersect_dist = dist_now2;
        					intersect_with_which_sphere = s;
        					remeber_intersect_x = intersection_point2_x;
        					remeber_intersect_y = intersection_point2_y;
        					remeber_intersect_z = intersection_point2_z;
                		}
    				}
    				
    				
    			}
    			
    		} // draw the pixel base on remembered s and other information
    		if(intersect_with_which_sphere == -1){drawPixel(imagedata,i,j,c);}
    		else{			
    			c.change(
    				inputSpheres[intersect_with_which_sphere].diffuse[0]*255,
	                inputSpheres[intersect_with_which_sphere].diffuse[1]*255,
	                inputSpheres[intersect_with_which_sphere].diffuse[2]*255,
	                255);
    			drawPixel(imagedata,i,j,c);
			}
       	}
    }
    context.putImageData(imagedata, 0, 0);
} // end draw pixels in input spheres using ray casting

function drawPixelsInputSpheresUsingRayCastingAndLight(context) {
    var inputSpheres = getInputSpheres();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    var eye_x = 0.5; var eye_y = 0.5; var eye_z = -0.5;
    
    var light_r_ambient = 1; light_r_diffuse = 1; light_r_specular = 1;
    var light_g_ambient = 1; light_g_diffuse = 1; light_g_specular = 1;
    var light_b_ambient = 1; light_b_diffuse = 1; light_b_specular = 1;
    var light_position_x = 2; var light_position_y = 4; var light_position_z = -0.5;
    //var light_position_x = 1.5; var light_position_y = 1.5; var light_position_z = -0.5;
    
    for(var i=0;i<w;i++){             
    	for(var j=0;j<h;j++){		// for each pixel
    		var coord_x = i*(1/w);
    		var coord_y = j*(1/h);
    		var coord_z = 0;
    		// D = P-E ; given E = (0.5,0.5,-0.5) 
    		var ray_dx = coord_x - eye_x;
    		var ray_dy = (-1)*(coord_y - eye_y);
    		var ray_dz = coord_z - eye_z;
    		var intersect_dist = 100;     // use to find the closet distance
    		var dist_now = 0; var dist_now2 = 0;
    		/* initialization*/
    		var x = 0; var y = 0; // pixel coord init
            var cx = 0; var cy = 0; // init center x and y coord
            var sphereRadius = 0; // init sphere radius
            var numSpherePixels = 0; // init num pixels in sphere
            var c = new Color(0,0,0,255); // init the sphere color
            var n = inputSpheres.length;
            var intersect_with_which_sphere = -1;
    		var remeber_intersect_x; var remeber_intersect_y; var remeber_intersect_z;
            
            
    		for(var s=0;s<n;s++){  // look at each object for every pixel
    			sphereRadius = inputSpheres[s].r;
    			cx = inputSpheres[s].x;
    			cy = inputSpheres[s].y;
    			cz = inputSpheres[s].z;
    			var diffuse_r = inputSpheres[s].diffuse[0]*255;
                var diffuse_g = inputSpheres[s].diffuse[1]*255;
                var diffuse_b = inputSpheres[s].diffuse[2]*255;
    			// det for determinant
    			// det_a = D * D, det_b = 2D*(E-C), det_c = (E-C)*(E-C)-r^2 
    			det_a = ray_dx*ray_dx + ray_dy*ray_dy + ray_dz*ray_dz;
    			det_b = 2*(ray_dx*(eye_x-cx)+ray_dy*(eye_y-cy)+ray_dz*(eye_z-cz));
    			det_c = ((eye_x-cx)*(eye_x-cx)+(eye_y-cy)*(eye_y-cy)+(eye_z-cz)*(eye_z-cz))- sphereRadius*sphereRadius;
    			
    			det = det_b*det_b-4*det_a*det_c;
    			
    			if(det<0){
    				;
    			}else if(det == 0){
    				var intersect_t = (-1)*(det_b)/(2*det_a);
    				var intersection_point_x = eye_x + intersect_t*ray_dx;
    				var intersection_point_y = eye_y + intersect_t*ray_dy;
    				var intersection_point_z = eye_z + intersect_t*ray_dz;
    				dist_now = Math.sqrt((eye_x-intersection_point_x)*(eye_x-intersection_point_x)+(eye_y-intersection_point_y)*(eye_y-intersection_point_y)+(eye_z-intersection_point_z)*(eye_z-intersection_point_z));
    				if(dist_now<intersect_dist){
    					intersect_dist = dist_now;
    					intersect_with_which_sphere = s;
    					remeber_intersect_x = intersection_point_x;
    					remeber_intersect_y = intersection_point_y;
    					remeber_intersect_z = intersection_point_z;
    				}
    				
    			}else{
    				var intersect_t = ((-1)*(det_b)+Math.sqrt(det))/(2*det_a);
    				var intersection_point_x = eye_x + intersect_t*ray_dx;
    				var intersection_point_y = eye_y + intersect_t*ray_dy;
    				var intersection_point_z = eye_z + intersect_t*ray_dz;
    				dist_now = Math.sqrt((eye_x-intersection_point_x)*(eye_x-intersection_point_x)+(eye_y-intersection_point_y)*(eye_y-intersection_point_y)+(eye_z-intersection_point_z)*(eye_z-intersection_point_z));
    				var intersect_t2 = ((-1)*(det_b)-Math.sqrt(det))/(2*det_a);
    				var intersection_point2_x = eye_x + intersect_t2*ray_dx;
    				var intersection_point2_y = eye_y + intersect_t2*ray_dy;
    				var intersection_point2_z = eye_z + intersect_t2*ray_dz;
    				dist_now2 = Math.sqrt((eye_x-intersection_point2_x)*(eye_x-intersection_point2_x)+(eye_y-intersection_point2_y)*(eye_y-intersection_point2_y)+(eye_z-intersection_point2_z)*(eye_z-intersection_point2_z));
    			    				
    				if(dist_now<intersect_dist||dist_now2<intersect_dist){
    					if(dist_now<=dist_now2){
    						intersect_dist = dist_now;
    						remeber_intersect_x = intersection_point_x;
    						remeber_intersect_y = intersection_point_y;
        					remeber_intersect_z = intersection_point_z;
    						intersect_with_which_sphere = s;
                		}else{
                			intersect_dist = dist_now2;
        					intersect_with_which_sphere = s;
        					remeber_intersect_x = intersection_point2_x;
        					remeber_intersect_y = intersection_point2_y;
        					remeber_intersect_z = intersection_point2_z;
                		}
    				}
    				
    				
    			}
    			
    		} // draw the pixel base on remembered s and other information
    		if(intersect_with_which_sphere == -1){drawPixel(imagedata,i,j,c);}
    		else{
    			/* ambient calculation */
    			var r_Ka = inputSpheres[intersect_with_which_sphere].ambient[0];
    			var g_Ka = inputSpheres[intersect_with_which_sphere].ambient[1];
    			var b_Ka = inputSpheres[intersect_with_which_sphere].ambient[2];
    			var r_ambient = light_r_ambient * r_Ka;
    			var g_ambient = light_g_ambient * g_Ka;
    			var b_ambient = light_b_ambient * b_Ka;
    			
    			/* diffuse calculation */
    			
    			var r_Kd = inputSpheres[intersect_with_which_sphere].diffuse[0];
    			var g_Kd = inputSpheres[intersect_with_which_sphere].diffuse[1];
    			var b_Kd = inputSpheres[intersect_with_which_sphere].diffuse[2];
    			
    			var normalizing;
    			var surface_normal_x = remeber_intersect_x - inputSpheres[intersect_with_which_sphere].x; 
    			var surface_normal_y = remeber_intersect_y - inputSpheres[intersect_with_which_sphere].y; 
    			var surface_normal_z = remeber_intersect_z - inputSpheres[intersect_with_which_sphere].z; 
    			normalizing = Math.sqrt((surface_normal_x)*(surface_normal_x)+(surface_normal_y)*(surface_normal_y)+(surface_normal_z)*(surface_normal_z))
    			surface_normal_x = surface_normal_x/normalizing;
    			surface_normal_y = surface_normal_y/normalizing;
    			surface_normal_z = surface_normal_z/normalizing;
    			var light_vector_x = light_position_x-remeber_intersect_x;
    			var light_vector_y = light_position_y-remeber_intersect_y;
    			var light_vector_z = light_position_z-remeber_intersect_z;
    			normalizing = Math.sqrt((light_vector_x)*(light_vector_x)+(light_vector_y)*(light_vector_y)+(light_vector_z)*(light_vector_z));
    			light_vector_x = light_vector_x/normalizing;
    			light_vector_y = light_vector_y/normalizing;
    			light_vector_z = light_vector_z/normalizing;
    			
    			var N_dot_L = surface_normal_x*light_vector_x + surface_normal_y*light_vector_y + surface_normal_z*light_vector_z;
    			if(N_dot_L<0){ 
    				N_dot_L = 0;
    			}
    			var r_diffuse = light_r_diffuse * r_Kd * N_dot_L;
    			var g_diffuse = light_g_diffuse * g_Kd * N_dot_L;
    			var b_diffuse = light_b_diffuse * b_Kd * N_dot_L;
    			    			
    			/* specular calculation */
    			
    			var r_Ls = inputSpheres[intersect_with_which_sphere].specular[0];
    			var g_Ls = inputSpheres[intersect_with_which_sphere].specular[1];
    			var b_Ls = inputSpheres[intersect_with_which_sphere].specular[2];
    			
    			var view_vector_x = eye_x - remeber_intersect_x;
    			var view_vector_y = eye_y - remeber_intersect_y;
    			var view_vector_z = eye_z - remeber_intersect_z;
    			normalizing = Math.sqrt((view_vector_x)*(view_vector_x) + (view_vector_y)*(view_vector_y) + (view_vector_z)*(view_vector_z));
    			view_vector_x = view_vector_x/normalizing;
    			view_vector_y = view_vector_y/normalizing;
    			view_vector_z = view_vector_z/normalizing;
    			
    			var H_vector_x = (light_vector_x + view_vector_x)/2;
    			var H_vector_y = (light_vector_y + view_vector_y)/2;
    			var H_vector_z = (light_vector_z + view_vector_z)/2;
    			
    			var N_dot_H = surface_normal_x * H_vector_x + surface_normal_y * H_vector_y + surface_normal_z * H_vector_z;
    			
    			//var N_dot_H_by_n = Math.pow(N_dot_H,inputSpheres[intersect_with_which_sphere].n);
    			var N_dot_H_by_n = Math.pow(N_dot_H,3);
    					
    			var r_specular = light_r_diffuse * r_Ls * N_dot_H_by_n;
    			var g_specular = light_g_diffuse * g_Ls * N_dot_H_by_n;
    			var b_specular = light_b_diffuse * b_Ls * N_dot_H_by_n;
    			
    			/* Final color addition*/
    			
    			var color_r = r_ambient + r_diffuse + r_specular;
    			var color_g = g_ambient + g_diffuse + g_specular;
    			var color_b = b_ambient + b_diffuse + b_specular;
    			
    			// color_r = r_diffuse ;
    			// color_g = g_diffuse ;
    			// color_b = b_diffuse ;
    			
    			c.change(
    					color_r*255,
    					color_g*255,
    					color_b*255,
    	                255);
    				/*c.change(
    				inputSpheres[intersect_with_which_sphere].diffuse[0]*255,
	                inputSpheres[intersect_with_which_sphere].diffuse[1]*255,
	                inputSpheres[intersect_with_which_sphere].diffuse[2]*255,
	                255);*/
    			drawPixel(imagedata,i,j,c);
			}
       	}
    }
    context.putImageData(imagedata, 0, 0);
} // end draw pixels in input spheres using ray casting




/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
        
    //drawPixelsInputSpheresUsingRayCasting(context);
    drawPixelsInputSpheresUsingRayCastingAndLight(context);
    
}
