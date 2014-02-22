(function() {
    function use_image_with_source(source_url) {
        var image_source = document.getElementById("image_source");
        image_source.addEventListener("load", function() {
            alert("GENERATE SWEATER NOW");
        });
        image_source.setAttribute("src", source_url);
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
            video.src = window.URL.createObjectURL(stream);
            video.addEventListener("canplay", function(e) {
                console.log(video.videoWidth);
                console.log(video.videoHeight);
            });
            event.target.parentElement.insertBefore(video, event.target);
            video.play();
            var canvas = document.createElement("canvas");
            canvas.style.display = "none";
            event.target.parentElement.insertBefore(canvas, event.target);
            event.target.removeChild(event.target.firstChild);
            event.target.appendChild(document.createTextNode("Take a picture with your camera/webcam"));
            event.target.addEventListener("click", function(e) {
                event.target.disabled = true;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                use_image_with_source(canvas.toDataURL("image/png"));
            });
            event.target.disabled = false;
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
