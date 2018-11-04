

var canva = document.createElement('canvas');
var ctx = canva.getContext('2d');
canva.width = 130;
canva.height = 60;
modalControlWrapper.appendChild(canva);

var MEDIA_ELEMENT_NODES = new WeakMap();

var an = {};
var AudioContext = window.AudioContext;
an.context = new AudioContext();
an.node = an.context.createScriptProcessor(2048, 1, 1);
an.analyser = an.context.createAnalyser();
an.analyser.smoothingTimeConstant = 0.3;
an.analyser.fftSize = 512;
an.bands = new Uint8Array(an.analyser.frequencyBinCount);

var bandsTmp = [];
ctx.strokeStyle = "black";
var draw = function () {
    if (an.bands!=undefined) {
        ctx.beginPath();
        ctx.clearRect(0, 0, canva.width, canva.height);
        for (var i = 0; i < 41; i++) {
            ctx.rect(i*3,60,3, - an.bands[i]/5); 
        }
        ctx.stroke();
    }
}
var bandPainterTimer;

function blurAway() {
    setTimeout(function() {
        hamburger_cb.checked = false;
        }, 50);
    
}
hamburger_cb.addEventListener("blur", blurAway);

//modal stuff
btnModalClose.addEventListener("click", modalClose);


Array.from(document.getElementsByClassName("video")).forEach(
    function(element, index, array) {
        element.addEventListener("click", showModal)
    }
);

function modalClose(e) {
    globalScroll.enable();
    modal.style.display = "none";
    modal_content.style.display = "none";
    //alert(modalVidWrapper.getElementsByClassName("video")[0]);
    var tmpVid = modalVidWrapper.getElementsByClassName("video")[0];
    tmpVid.style.width = "300px";
    tmpVid.style.height = "200px";
    tmpVid.style.border = "2px solid #F7F7F7";
    tmpVid.style.margin = "10px";
    views.appendChild(tmpVid);
    
    audioSwitch.checked = false;
    tmpVid.muted = true;
    clearInterval(bandPainterTimer);
    tmpVid.addEventListener("click", showModal);
    //tmpVid.removeEventListener('canplay', soundProc);
    
    tmpVid.play();
    ctx.beginPath();
    ctx.clearRect(0, 0, canva.width, canva.height);

    
}


function showModal(currentX) {
    globalScroll.disable(window.scrollX,window.scrollY);
    bright.value = 100;
    contrast.value = 100;
    modalVidWrapper.style.filter = "";
    var rect = arguments[0].target.getBoundingClientRect();
    var modalRect = modal_content.getBoundingClientRect();
    xScale = (rect.right - rect.left) / (window.innerWidth * 0.9); //small to modal ratio
    yScale = (rect.bottom - rect.top) / (window.innerHeight * 0.9); //small to modal ratio
    document.documentElement.style.setProperty("--xScale", xScale);
    document.documentElement.style.setProperty("--yScale", yScale);
    xOffs = Math.floor((rect.left) - (window.innerWidth*0.05 + (((window.innerWidth*0.9) - ((window.innerWidth*0.9)*xScale))/2)));
    yOffs = Math.floor((rect.top) - (window.innerHeight*0.05 + (((window.innerHeight*0.9) - ((window.innerHeight*0.9)*yScale))/2)));
    document.documentElement.style.setProperty("--xToCenter", xOffs + "px");
    document.documentElement.style.setProperty("--yToCenter", yOffs + "px");
    arguments[0].target.textContent = xOffs + "/" + window.innerWidth + ";" + yOffs + "/" + window.innerHeight + " xscale:" + xScale + " yScale: " + yScale;
    modal.style.display = "flex";
    modal_content.style.display = "flex";

    modalVidWrapper.appendChild(arguments[0].target);
    arguments[0].target.style.width = "100%";
    arguments[0].target.style.height = "100%";
    arguments[0].target.style.border = 0;
    arguments[0].target.style.margin = 0;
    arguments[0].target.removeEventListener("click", showModal);
    arguments[0].target.play();

    soundProc();
    
}
////
function soundProc() {
    an.context = an.context || new AudioContext();
    var tmpVid = modalVidWrapper.getElementsByClassName("video")[0];
    //an.source = an.context.createMediaElementSource(tmpVid);

    if (MEDIA_ELEMENT_NODES.has(tmpVid)) {
        an.source = MEDIA_ELEMENT_NODES.get(tmpVid);
    } else {
    an.source = an.context.createMediaElementSource(tmpVid);
    MEDIA_ELEMENT_NODES.set(tmpVid,an.source);
    
    an.source.connect(an.analyser);
    an.analyser.connect(an.node);
    an.node.connect(an.context.destination);
    an.source.connect(an.context.destination);
    }
    an.node.onaudioprocess = function () {
        an.analyser.getByteFrequencyData(an.bands);
        if (!tmpVid.paused) {
            bandsTmp = an.bands;
        }
    };
};
////


bright.addEventListener("change", brightChange);
contrast.addEventListener("change", contrastChange);

function brightChange(e) {
    var brVal = bright.value/100;
    var cntrVal = contrast.value/100;
    modalVidWrapper.style.filter = "brightness(" + brVal + ") contrast(" + cntrVal + ")";
    brightLabel.textContent = "Яркость " + brVal;
    contrastLabel.textContent = "Контраст " + cntrVal;
}
function contrastChange(e) {
    //alert(e.target.value);
    var brVal = bright.value/100;
    var cntrVal = contrast.value/100;
    modalVidWrapper.style.filter = "brightness(" + brVal + ") contrast(" + cntrVal + ")";
    brightLabel.textContent = "Яркость " + brVal;
    contrastLabel.textContent = "Контраст " + cntrVal;
}


audioSwitch.addEventListener("change", audioC);

function audioC(e) {
    modalVidWrapper.getElementsByClassName("video")[0].muted = !audioSwitch.checked;
    if (audioSwitch.checked == true) {
    bandPainterTimer = setInterval(draw,35);
    } else {
        clearInterval(bandPainterTimer);
    }
}





globalScroll = (
    function(){
        var x,y;
        function hndlr(){
            window.scrollTo(x,y);
            //return;
        }  
        return {
            disable : function(x1,y1){
                x = x1;
                y = y1;
                if(window.addEventListener){
                    window.addEventListener("scroll",hndlr);
                } 
                    else{
                        window.attachEvent("onscroll", hndlr);
                    }     
                hndlr()
            },
            enable: function(){
                if(window.removeEventListener){
                    window.removeEventListener("scroll",hndlr);
                }
                else{
                    window.detachEvent("onscroll", hndlr);
                }
            } 

        }
    }
)();