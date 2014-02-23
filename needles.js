function generate_sweater_from_image(imgobj) {
	
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
	//data is now only that color	
	varunitsize = Math.floor((Math.random()*60)+40);
	
	//--------------------------------------------------
	//Diagonals from vertical and horizontals
	//--------------------------------------------------
	
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
		while (nx1 <= imgobj.width && nx2 >= 0) {
			//draw if in range
			if (ny >= 0 && ny <= 640) {
				imgobj.data[4*ny*w + 4*nx1] = ncr;
				imgobj.data[4*ny*w + 4*nx1 + 1] = ncg;
				imgobj.data[4*ny*w + 4*nx1 + 2] = ncb;
				imgobj.data[4*ny*w + 4*nx1 + 3] = 255;
				
				imgobj.data[4*ny*w + 4*nx2] = ncr;
				imgobj.data[4*ny*w + 4*nx2 + 1] = ncg;
				imgobj.data[4*ny*w + 4*nx2 + 2] = ncb;
				imgobj.data[4*ny*w + 4*nx2 + 3] = 255;
			}
			
			var fny = imgobj.height - ny;
			if (fny >= 0 && fny <= 640)	{
				//draw the other two lines
				imgobj.data[4*fny*w + 4*nx1] = ncr;
				imgobj.data[4*fny*w + 4*nx1 + 1] = ncg;
				imgobj.data[4*fny*w + 4*nx1 + 2] = ncb;
				imgobj.data[4*fny*w + 4*nx1 + 3] = 255;
				
				imgobj.data[4*fny*w + 4*nx2] = ncr;
				imgobj.data[4*fny*w + 4*nx2 + 1] = ncg;
				imgobj.data[4*fny*w + 4*nx2 + 2] = ncb;
				imgobj.data[4*fny*w + 4*nx2 + 3] = 255;
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
		while (ny1 <= imgobj.height && ny2 >= 0) {
			//draw if in range
			if (nx >= 0 && nx <= 640) {
				imgobj.data[4*ny1*w + 4*nx] = ncr;
				imgobj.data[4*ny1*w + 4*nx + 1] = ncg;
				imgobj.data[4*ny1*w + 4*nx + 2] = ncb;
				imgobj.data[4*ny1*w + 4*nx + 3] = 255;
				
				imgobj.data[4*ny2*w + 4*nx] = ncr;
				imgobj.data[4*ny2*w + 4*nx + 1] = ncg;
				imgobj.data[4*ny2*w + 4*nx + 2] = ncb;
				imgobj.data[4*ny2*w + 4*nx + 3] = 255;
			}
			
			var fnx = imgobj.width - nx;
			if (fnx >= 0 && fnx <= 640)	{
				//draw the other two lines
				imgobj.data[4*ny1*w + 4*nx] = ncr;
				imgobj.data[4*ny1*w + 4*nx + 1] = ncg;
				imgobj.data[4*ny1*w + 4*nx + 2] = ncb;
				imgobj.data[4*ny1*w + 4*nx + 3] = 255;
				
				imgobj.data[4*ny2*w + 4*nx] = ncr;
				imgobj.data[4*ny2*w + 4*nx + 1] = ncg;
				imgobj.data[4*ny2*w + 4*nx + 2] = ncb;
				imgobj.data[4*ny2*w + 4*nx + 3] = 255;
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

function getcdist(r1, r2, b1, b2, g1, g2) {
	return (r1-r2)*(r1-r2) + (b1-b2)*(b1-b2) + (g1-g2)*(g1-g2);
}