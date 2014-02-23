var buttons = (function(){
    var result = {};
    var enabled = true;
    var buttons = {};
    // button initialization code
    (function() {
        var button = document.getElementById("button_facebook");
        buttons["facebook"] = {button:button,enabled:false};
        // attempt to add the camera button
        if (navigator.getUserMedia) {
            button = document.createElement("button");
            button.id = "button_camera";
            button.appendChild(document.createTextNode("Allow access to your camera/webcam"));
            buttons["camera"] = {button:button,enabled:true};
            var li = document.createElement("li");
            li.appendChild(button);
            document.getElementById("sources_list").appendChild(li);
        }
    })();
    var update = function(id, enable) {
        if (!id)
            enabled = enable;
        else
            if (buttons[id])
                buttons[id].enabled = enable;
        console.log(buttons[id]);
        for (var b in buttons) {
            buttons[b].button.disabled = !(enabled && buttons[b].enabled);
        }
    };
    result.enable = function(id) { update(id, true); };
    result.disable = function(id) { update(id, false); };
    return result;
})();

(function(){
    var basis = new Image();
    basis.src = "images/basis.png";

    // draw a sweater based on the data contained in the image_source canvas
    function draw_sweater(callback) {
        document.getElementById("button_regen").disabled = true;
        buttons.disable();
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
                buttons.enable();
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
                place_image(video.videoWidth, video.videoHeight, video);
                draw_sweater();
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
    if (document.getElementById("button_camera"))
        document.getElementById("button_camera").addEventListener("click", onclick_camera_approval);

    // function to get facebook image
    function onclick_facebook(event) {
        event.target.disabled = true;
        FB.api("/me/picture?type=large", function(response) {
            console.log(response.data.url);
            var img = new Image();
            img.addEventListener("load", function() {
                place_image(img.width, img.height, img);
                draw_sweater();
            });
            img.crossOrigin = '';
            img.src = response.data.url;
        });
    }
    document.getElementById("button_facebook").addEventListener("click", onclick_facebook);

    // have the regen button redraw a sweater
    document.getElementById("button_regen").addEventListener("click", function(e) {
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
