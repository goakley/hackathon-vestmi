function dataURItoBlob(dataURI) {
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = window.atob(dataURI.split(',')[1]);
    // write the bytes of the string to an ArrayBuffer
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ia], {type:mimeString});
}


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
            button = document.getElementById("button_camera");
            button.removeChild(button.firstChild);
            button.appendChild(document.createTextNode("Allow access to your camera/webcam"));
            buttons["camera"] = {button:button,enabled:true};
        }
    })();
    var update = function(id, enable) {
        if (!id)
            enabled = enable;
        else
            if (buttons[id])
                buttons[id].enabled = enable;
        for (var b in buttons) {
            buttons[b].button.disabled = !(enabled && buttons[b].enabled);
        }
    };
    result.enable = function(id) { update(id, true); };
    result.disable = function(id) { update(id, false); };
    result.is_enabled = function(id) {
        if (id)
            return buttons[id].enabled;
        return enabled;
    };
    return result;
})();
buttons.enable();

(function(){
    var minecraft = (function() {
        var result = {};
        var basis = new Image();
        basis.onload = function() { result.redraw(); };
        basis.src = "images/basis.png";
        var image = undefined;
        result.redraw = function() {
            document.getElementById("image_minecraft").getContext("2d").drawImage((image ? image : basis), 0, 0, 64, 32);
        };
        var reqevent = undefined;
        document.getElementById("minecraft_name").addEventListener("input", function(event) {
            if (reqevent)
                window.clearTimeout(reqevent);
            reqevent = window.setTimeout(function() {
                image = undefined;
                var img = new Image();
                img.onerror = function(){ image = undefined; result.redraw(); };
                img.onload = function(){
                    /*
                    document.getElementById("image_minecraft").getContext("2d").drawImage(img, 0, 0, 64, 32);
                    var image = new Image();
                    image.src = document.getElementById("image_minecraft").toDataURL("image/png");
                     */
                    result.redraw();
                };
                img.src = "http://minecraft.net/skin/"+event.target.value+".png";
            }, 1024);
        });
        return result;
    })();

    // draw a sweater based on the given source information
    function draw_sweater(width, height, source) {
        if (source) {
            var canvas = document.getElementById("image_source");
            canvas.width = width;
            canvas.height = height;
            canvas.getContext("2d").drawImage(source, 0, 0, width, height);
        }
        document.getElementById("button_makeprofile").disabled = true;
        document.getElementById("button_regen").disabled = true;
        buttons.disable();
        canvas = document.getElementById("image_source");
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
            minecraft.redraw();
            canvas = document.getElementById("image_minecraft");
            context = canvas.getContext("2d");
            worker.addEventListener("message", function(e) {
                context.putImageData(e.data, 0, 0);
                document.getElementById("button_regen").disabled = false;
                buttons.enable();
                buttons.enable();
                if (buttons.is_enabled("facebook"))
                    document.getElementById("button_publish").disabled = false;
            });
            worker.postMessage({basis:context.getImageData(0,0,64,32),sweater:e.data});
        });
        worker.postMessage(imgobj);
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
                draw_sweater(video.videoWidth, video.videoHeight, video);
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
            var img = new Image();
            img.addEventListener("load", function() {
                draw_sweater(img.width, img.height, img);
            });
            img.crossOrigin = '';
            img.src = response.data.url;
        });
    }
    document.getElementById("button_facebook").addEventListener("click", onclick_facebook);
    document.getElementById("button_publish").addEventListener("click", function() {
        document.getElementById("button_publish").disabled = true;
        FB.api('/me/albums', function(response){
	    for(var index = 0; index < response.data.length; index++){
		if(response.data[index].name == "Profile Pictures") {
                    var albumID = response.data[index].id;
                    var fd = new FormData();
                    fd.append("access_token", FB.getAccessToken());
                    fd.append("source", dataURItoBlob(document.getElementById("image_sweater").toDataURL("image/png")));
                    fd.append("message", "Sweater Vest #"+ parseInt(Math.random().toString().substr(2)));
                    var req = new XMLHttpRequest();
                    req.open("POST", "https://graph.facebook.com/me/photos?access_token="+FB.getAccessToken());
                    req.onreadystatechange = function() {
                        if (req.readyState == 4) {
                            if (req.status == 200) {
                                var pid = JSON.parse(req.responseText).id;
                                var _button = document.getElementById("button_makeprofile");
                                var button = _button.cloneNode(true);
                                _button.parentNode.replaceChild(button, _button);
                                button.disabled = false;
                                button.addEventListener("click", function(event){
                                    event.target.disabled = true;
                                    window.open("http://www.facebook.com/photo.php?fbid="+pid+"&makeprofile=1");
                                });

                            } else {
                                console.log("ERROR:");
                                console.log(req.status);
                                console.log(req.responseText);
                            }
                        }
                    };
                    req.send(fd);
                }
	    }
	});
    });

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
