(function() {
    // function to get camera approval
    function onclick_camera_approval(event) {
        // disable the button while waiting for the approval
        event.target.disabled = true;
        event.target.removeEventListener("click", onclick_camera_approval);
        event.target.removeChild(event.target.firstChild);
        event.target.appendChild(document.createTextNode("Please approve usage of your camera/webcam"));
        navigator.getUserMedia({video:true}, function(stream) {
            // change the button to take a picture from the webcam
            event.target.removeChild(event.target.firstChild);
            event.target.appendChild(document.createTextNode("Take a picture with your camera/webcam"));
            event.target.disabled = false;
        }, function(error) {
            event.target.removeChild(event.target.firstChild);
            event.target.appendChild(document.createTextNode("Access to the camera/webcam API has been denied"));
        });
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
