(function() {
    document.getElementById("button_regen").addEventListener("click", function(e) {
        e.target.disabled = true;
        draw_sweater();
    });
    function draw_sweater() {
        var canvas_source = document.getElementById("image_source");
        var context = canvas_source.getContext("2d");
        var imgobj = context.getImageData(0, 0, canvas_source.width, canvas_source.height);
        imgobj = generate_sweater_from_image(imgobj);
        var canvas_sweater = document.getElementById("image_sweater");
        canvas_sweater.style.display = "inline";
        canvas_sweater.width = imgobj.width;
        canvas_sweater.height = imgobj.height;
        context = canvas_sweater.getContext("2d");
        context.putImageData(imgobj, 0, 0);
        document.getElementById("button_regen").disabled = false;
    }
    // use a drawable object to create the sweater
    function use_image_with_source(width, height, source) {
        var canvas_source = document.getElementById("image_source");
        canvas_source.style.display = "inline";
        canvas_source.width = width;
        canvas_source.height = height;
        var context = canvas_source.getContext("2d");
        context.drawImage(source, 0, 0, width, height);
        draw_sweater();
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
                event.target.disabled = false;
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
    // function to take the picture from the camera
    function onclick_camera(event) {
    }
    // initialization code
    (function() {
        var buttons = [];
        var list = document.createElement("ul");
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
        sources.appendChild(list);
        if (buttons.length) {
            for (var i = 0; i < buttons.length; i++) {
                var li = document.createElement("li");
                li.appendChild(buttons[i]);
                list.appendChild(li);
            }
        } else {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode("Sorry, we will be unable to generate a sweater for you!"));
            sources.appendChild(p);
        }
    })();
})();
