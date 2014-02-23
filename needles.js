self.addEventListener("message", function(e) {
    var imgobj = generate_sweater_from_image(e.data);
    self.postMessage(imgobj);
});


function generate_sweater_from_image(imgobj) {

	//var original = imgobj.data;
	var original = []
	for(var q = 0; q < (imgobj.data).length; q++) {
		original[q] = imgobj.data[q]
	}
	
	var locr = 0;
	var locg = 0;
	var locb = 0;
	var localpha = 0;
	
	var maxdist = 20;
	
	var rarr = [];
	var garr = [];
	var barr = [];
	var rbgvotes = [];
	var rbglen = 0;
	
	var w = imgobj.width; //I'm lazy :(

	//voting
	for(var y = 0; y < imgobj.height; y++) {
		for(var x = 0; x < imgobj.width; x++) {
			locr = 4*y*w + 4*x;
			locg = 4*y*w + 4*x + 1;
			locb = 4*y*w + 4*x + 2;
			localpha = 4*y*w + 4*x + 3;
			
			var picked = false;
			for(var q = 0; q < rbglen; q++) {
				if (getcdist(imgobj.data[locr], rarr[q], imgobj.data[locb], barr[q], imgobj.data[locg], garr[q]) <= maxdist) {
					rbgvotes[q]++;
					picked = true;
					break;
				}
			}
			if (picked == false) {
				rarr[rbglen] = imgobj.data[locr];
				garr[rbglen] = imgobj.data[locg];
				barr[rbglen] = imgobj.data[locb];
				
				rbgvotes[rbglen] = 1;
				rbglen++;
			}
		}			
	}
	
	var best = 0;
	for(var q = 0; q < rbglen; q++) {
		if (rbgvotes[q] > rbgvotes[best]) {
			best = q;
		}
	}
	
	//best - index of most popular color
	for(var y = 0; y < imgobj.height; y++) {
		for(var x = 0; x < imgobj.width; x++) {
			imgobj.data[4*y*w + 4*x] = rarr[best];
			imgobj.data[4*y*w + 4*x + 1] = garr[best];
			imgobj.data[4*y*w + 4*x + 2] = barr[best];
			imgobj.data[4*y*w + 4*x + 3] = 255;
		}
	}
	
	//--------------------------------------------------
	//Diagonals from vertical and horizontals
	//--------------------------------------------------
	
	//data is now only that color	
	varunitsize = Math.floor((Math.random()*60)+40);
	var maxwidth = 10;
	
	//how many counts to move in each direction
	var vcounter = Math.floor((Math.random()*5)+1);
	var hcounter = Math.floor((Math.random()*5)+1);
	
	//4 sides on a rectangle
	
	//new color
	var ncr = 255 - rarr[best];
	var ncg = 255 - garr[best];
	var ncb = 255 - barr[best];
	
	//verticals
	for (var y = 0; y < imgobj.height; y += varunitsize) {
		//draw one line from the left going up in y, one from the right going down in y
		//45 degree angles for now
		var nx1 = 0;
		var nx2 = imgobj.width;
		var ny = y;
		
		var vc = vcounter; //temps for iterating
		var hc = hcounter;
		var linewidth = Math.floor((Math.random()*maxwidth)+1);
		var linewidth2 = Math.floor((Math.random()*maxwidth)+1);
		var maxwidth = Math.max(linewidth, linewidth2);

		var temparr = shortvote(original, imgobj.width, imgobj.height);
		while (getcdist(rarr[best], temparr[0], garr[best], temparr[1], barr[best], temparr[2]) <= maxdist * 2) {
			temparr = shortvote(original, imgobj.width, imgobj.height);
		}
		ncr = temparr[0];
		ncg = temparr[1];		
		ncb = temparr[2];
		
		
		while (nx1 <= imgobj.width+maxwidth && nx2 >= -maxwidth) {
			
			//draw if in range
			for (var lw = 0; lw < linewidth; lw++) {
				if (ny >= 0 && ny <= imgobj.height) {
					imgobj = drawline(imgobj, ny+lw, w, nx1, nx2, ncr, ncg, ncb)
				}
			}
			
			var fny = imgobj.height - ny;
			for (var lw = 0; lw < linewidth2; lw++) {
				if (fny >= 0 && fny <= imgobj.height)	{
					//draw the other two lines
					imgobj = drawline(imgobj, fny+lw, w, nx1, nx2, ncr, ncg, ncb)
				}
			}
			
			//update the next coordinate
			vc--;
			hc--;
			if (vc == 0) {
				vc = vcounter;
				ny++;
			}
			if (hc == 0) {
				hc = hcounter;
				nx1++;
				nx2--;
			}
			
		}
	}
	
	//horizontals
	for (var x = 0; x < imgobj.width; x += varunitsize) {
		//draw one line from the left going up in y, one from the right going down in y
		//45 degree angles for now
		var nx = x;
		var ny1 = 0;
		var ny2 = imgobj.height;
		
		var vc = vcounter; //temps for iterating
		var hc = hcounter;
		var linewidth = Math.floor((Math.random()*maxwidth)+1);
		var linewidth2 = Math.floor((Math.random()*maxwidth)+1);
		var maxwidth = Math.max(linewidth, linewidth2);	
		
		var temparr = shortvote(original, imgobj.width, imgobj.height);
		while (getcdist(rarr[best], temparr[0], garr[best], temparr[1], barr[best], temparr[2]) <= maxdist * 2) {
			temparr = shortvote(original, imgobj.width, imgobj.height);
		}
		ncr = temparr[0];
		ncg = temparr[1];		
		ncb = temparr[2];
		
		while (ny1 <= imgobj.height+maxwidth && ny2 >= -maxwidth) {
			//draw if in range		
			
			for (var lw = 0; lw < linewidth; lw++) {
				if (nx >= 0 && nx <= imgobj.width) {
					imgobj = drawhline(imgobj, ny1+lw, w, ny2, nx, ncr, ncg, ncb)
				}
			}
			
			var fnx = imgobj.width - nx;
			for (var lw = 0; lw < linewidth2; lw++) {
				if (fnx >= 0 && fnx <= imgobj.width)	{
					//draw the other two lines
					imgobj = drawhline(imgobj, ny1+lw, w, ny2, fnx, ncr, ncg, ncb)
				}
			}
			
			//update the next coordinate
			vc--;
			hc--;
			if (vc == 0) {
				vc = vcounter;
				ny1++;
				ny2--;
			}
			if (hc == 0) {
				hc = hcounter;
				nx++;
			}
			
		}
	}	
	
	return imgobj;
	
}

function drawline(imgobj, ny, w, nx1, nx2, ncr, ncg, ncb) {
	imgobj.data[4*ny*w + 4*nx1] = ncr;
	imgobj.data[4*ny*w + 4*nx1 + 1] = ncg;
	imgobj.data[4*ny*w + 4*nx1 + 2] = ncb;
	imgobj.data[4*ny*w + 4*nx1 + 3] = 255;

	imgobj.data[4*ny*w + 4*nx2] = ncr;
	imgobj.data[4*ny*w + 4*nx2 + 1] = ncg;
	imgobj.data[4*ny*w + 4*nx2 + 2] = ncb;
	imgobj.data[4*ny*w + 4*nx2 + 3] = 255;
	
	return imgobj
}

function drawhline(imgobj, ny1, w, ny2, nx, ncr, ncg, ncb) {
	imgobj.data[4*ny1*w + 4*nx] = ncr;
	imgobj.data[4*ny1*w + 4*nx + 1] = ncg;
	imgobj.data[4*ny1*w + 4*nx + 2] = ncb;
	imgobj.data[4*ny1*w + 4*nx + 3] = 255;
	
	imgobj.data[4*ny2*w + 4*nx] = ncr;
	imgobj.data[4*ny2*w + 4*nx + 1] = ncg;
	imgobj.data[4*ny2*w + 4*nx + 2] = ncb;
	imgobj.data[4*ny2*w + 4*nx + 3] = 255;
	
	return imgobj
}

function getcdist(r1, r2, b1, b2, g1, g2) {
	return (r1-r2)*(r1-r2) + (b1-b2)*(b1-b2) + (g1-g2)*(g1-g2);
}

function shortvote(imgobj, width, height) {
	strw = Math.floor((Math.random()*width));
	endw = Math.floor((Math.random()*height));
	strh = Math.floor((Math.random()*Math.floor((width-strw)/3))+strw);
	endh = Math.floor((Math.random()*Math.floor((height-strh)/3))+strh);
	
	var locr = 0;
	var locg = 0;
	var locb = 0;
	var localpha = 0;
	
	var maxdist = 33;
	
	var rarr = [];
	var garr = [];
	var barr = [];
	var rbgvotes = [];
	var rbglen = 0;
	
	var w = width; //I'm lazy :(

	//voting
	for(var y = strh; y < endh; y++) {
		for(var x = strw; x < endw; x++) {
			locr = 4*y*w + 4*x;
			locg = 4*y*w + 4*x + 1;
			locb = 4*y*w + 4*x + 2;
			localpha = 4*y*w + 4*x + 3;
			
			var picked = false;
			for(var q = 0; q < rbglen; q++) {
				if (getcdist(imgobj[locr], rarr[q], imgobj[locb], barr[q], imgobj[locg], garr[q]) <= maxdist) {
					rbgvotes[q]++;
					picked = true;
					break;
				}
			}
			if (picked == false) {
				rarr[rbglen] = imgobj[locr];
				garr[rbglen] = imgobj[locg];
				barr[rbglen] = imgobj[locb];
				
				rbgvotes[rbglen] = 1;
				rbglen++;
			}
		}			
	}
	
	var best = 0;
	for(var q = 0; q < rbglen; q++) {
		if (rbgvotes[q] > rbgvotes[best]) {
			best = q;
		}
	}

	//make array
	var bestarr = [];
	bestarr[0] = rarr[best];
	bestarr[1] = garr[best];
	bestarr[2] = barr[best];
	bestarr[3] = 255;
	
	return bestarr;
}
