self.addEventListener("message", function(e) {
    var imgobj = teddy(e.data.basis, e.data.sweater);
    self.postMessage(imgobj);
});

function teddy(basis, sweater) {
    var sheight = sweater.height;
    var swidth = sweater.width;
    function pixel_idx(x,y) { return 4*y*swidth + 4*x };
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
    return basis;
}
