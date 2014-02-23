self.addEventListener("message", function(e) {
    var imgobj = teddy(e.data.basis, e.data.sweater);
    self.postMessage(imgobj);
});

function teddy(basis, sweater) {
    var sheight = sweater.height;
    var swidth = sweater.width;
    // brightness from
    // http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
    function brightness(r,g,b) { return Math.sqrt(r*r*0.241 + g*g*0.691 + b*b*.068) };
    function to_int(r,g,b,a) {
        return ((r << 24) | (g << 16) | (b << 8) | a);
    };
    function Color(r,g,b,a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.brightness = brightness(r,g,b);
        this.toString = function() {
            return "("+this.r+","+this.b+","+this.g+","+this.a+") -> "+this.brightness;
        };
    };
    var foundColors = {};

    for (var i = 0; i < swidth; i+=4) {
        var r = sweater.data[i];
        var g = sweater.data[i+1];
        var b = sweater.data[i+2];
        var a = sweater.data[3+i];
        var color = to_int(r,g,b,a);
        if (foundColors[color] == undefined) {
            foundColors[color] = new Color(r,g,b,a);
        }
    }

    var colors = new Array();
    for (var fc in foundColors) {
        colors.push(foundColors[fc]);
    }

    colors.sort(function(a,b) {
        return a.brightness - b.brightness
    });

    // Find the darkest color, the lightest color, and a mid color
    var colors_to_use = new Array();
    colors_to_use.push(colors.shift());
    if (colors.length >= 2) {
        colors_to_use[0] = colors.shift();
        colors_to_use[2] = colors.pop();
    } else {
        colors_to_use = colors
    }
    if (colors.length > 0) {
        var idx = Math.floor(colors.length/2);
        colors_to_use[1] = colors[idx];
    }
    console.log("Colors to use: " + colors_to_use);
    return draw_vest(basis, colors_to_use);
}

function draw_vest(basis, colors) {
    var starty = 22;
    var endy   = 29;
    var startx = 16;
    var len    = 24; //the vest area is 24 px wide
    function pixel_idx(x,y) { return 4*y*swidth + 4*x };
    // grab all the colors from the array
    var dark, middle, bright;
    dark = colors[0];
    // if we only have 1 color, then the entire vest will be the dark color
    if colors.length > 1 {
        middle = colors[1];
    } else {
        middle = dark;
    }
    if colors.length > 2 {
        bright = colors[2];
    } else {
        bright = dark;
    }

    for (var y = starty; y <= endy; y++) {
        var idx = pixel_idx(y, startx);
        var end = idx + len;
        for (idx; idx <= end; idx+=4) {
            var r = basis.data[idx];
            var g = basis.data[idx+1];
            var b = basis.data[idx+2];
            if (r == 255) {
                basis.data[idx] = dark.r;
                basis.data[idx+1] = dark.g;
                basis.data[idx+2] = dark.b;
                basis.data[idx+3] = dark.a;
            }
            if (g == 255) {

                basis.data[idx] = middle.r;
                basis.data[idx+1] = middle.g;
                basis.data[idx+2] = middle.b;
                basis.data[idx+3] = middle.a;
            }
            if (b == 255) {
                basis.data[idx] = bright.r;
                basis.data[idx+1] = bright.g;
                basis.data[idx+2] = bright.b;
                basis.data[idx+3] = bright.a;
            }
        }
    }

    return basis;
}
