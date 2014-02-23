(function() {
    var buttons = [];
    var basis = new Image();
    basis.src = "images/basis.png";

    // draw a sweater based on the data contained in the image_source canvas
    function draw_sweater(callback) {
        var canvas = document.getElementById("image_source");
        var context = canvas.getContext("2d");
        var imgobj = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas = document.getElementById("image_sweater");
        canvas.width = imgobj.width;
        canvas.height = imgobj.height;
        context = canvas.getContext("2d");
        // create a worker to generate the sweater
        var worker = new Worker("needles.js");
        worker.addEventListener("message", function(e) {
            context.putImageData(e.data, 0, 0);
            worker = new Worker("teddy.js");
            canvas = document.getElementById("image_minecraft");
            context = canvas.getContext("2d");
            context.drawImage(basis, 0, 0, 64, 32);
            worker.addEventListener("message", function(e) {
                context.putImageData(e.data, 0, 0);
                document.getElementById("button_regen").disabled = false;
                if (callback)
                    callback();
            });
            worker.postMessage({basis:context.getImageData(0,0,64,32),sweater:e.data});
        });
        worker.postMessage(imgobj);
    }

    function place_image(width, height, source) {
        var canvas = document.getElementById("image_source");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(source, 0, 0, width, height);
    }

    // use a drawable object to create the sweater
    function use_image_with_source(width, height, source, callback) {
        var canvas_source = document.getElementById("image_source");
        canvas_source.style.display = "inline";
        canvas_source.width = width;
        canvas_source.height = height;
        var context = canvas_source.getContext("2d");
        context.drawImage(source, 0, 0, width, height);
        draw_sweater(callback);
    }

    // function to get camera approval
    function onclick_camera_approval(event) {
        // disable the button while waiting for the approval
        event.target.disabled = true;
        event.target.removeEventListener("click", onclick_camera_approval);
        event.target.removeChild(event.target.firstChild);
        event.target.appendChild(document.createTextNode("Please approve usage of your camera/webcam"));
        navigator.getUserMedia({video:true}, function(stream) {
            // change the button to take a picture from the webcam
            var video = document.createElement("video");
            event.target.removeChild(event.target.firstChild);
            event.target.appendChild(document.createTextNode("Take a picture with your camera/webcam"));
            event.target.addEventListener("click", function(e) {
                event.target.disabled = true;
                use_image_with_source(video.videoWidth, video.videoHeight, video);
                draw_sweater(function() {
                    event.target.disabled = false;
                });
            });
            video.addEventListener("canplay", function(e) {
                event.target.disabled = false;
            });
            video.src = window.URL.createObjectURL(stream);
            event.target.parentElement.insertBefore(video, event.target);
            video.play();
        }, function(error) {
            event.target.removeChild(event.target.firstChild);
            event.target.appendChild(document.createTextNode("Access to the camera/webcam API has been denied"));
        });
    }

    // button initialization code
    (function() {
        // attempt to add the camera button
        if (navigator.getUserMedia) {
            var button = document.createElement("button");
            button.id = "camera";
            button.appendChild(document.createTextNode("Allow access to your camera/webcam"));
            button.addEventListener("click", onclick_camera_approval);
            buttons.push(button);
        }
        // add the buttons to the site
        var sources = document.getElementById("sources");
        while (sources.firstChild)
            sources.removeChild(sources.firstChild);
        if (buttons.length) {
            // append the list of source buttons
            var list = document.createElement("ul");
            for (var i = 0; i < buttons.length; i++) {
                var li = document.createElement("li");
                li.appendChild(buttons[i]);
                list.appendChild(li);
            }
            sources.appendChild(list);
        } else {
            // tell the user there are no sweater options
            var p = document.createElement("p");
            p.appendChild(document.createTextNode("Sorry, we will be unable to generate a sweater for you!"));
            sources.appendChild(p);
        }
    })();
    // disable the regen button until it's activated for the first time
    document.getElementById("button_regen").addEventListener("click", function(e) {
        e.target.disabled = true;
        draw_sweater();
    });
    // make the canvases click-to-generate-image-able
    document.getElementById("image_sweater").addEventListener("click", function(e) {
        window.open(e.target.toDataURL("image/png"));
    });
    document.getElementById("image_minecraft").addEventListener("click", function(e) {
        window.open(e.target.toDataURL("image/png"));
    });
})();
