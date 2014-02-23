self.addEventListener("message", function(e) {
    var imgobj = teddy(e.data.basis, e.data.sweater);
    self.postMessage(imgobj);
});

function teddy(basis, imgdata) {
    return basis;
}
