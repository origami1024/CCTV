
var modalVidCanvas = document.createElement('canvas');
var scaledCanvas = document.createElement('canvas');
var mVCtx = modalVidCanvas.getContext('2d');
var scaledCtx = scaledCanvas.getContext('2d');

modalVidCanvas.width = 300;//"100%";
modalVidCanvas.height = 200;//"100%";
modalVidWrapper.appendChild(modalVidCanvas);



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
mVCtx.strokeStyle = "black";
var drawAnalyzer = function () {
    if (an.bands!=undefined) {
        mVCtx.beginPath();
        //ctx.clearRect(0, 0, canva.width, canva.height);
        for (var i = 0; i < 41; i++) {
            mVCtx.strokeRect((modalVidCanvas.width / 2) - 80 + i*4,modalVidCanvas.height,4, - an.bands[i]/4); 
        }
        mVCtx.stroke();
    }
}

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
    audioSwitch.checked = false;
    globalModalVid.muted = true;
    //clearInterval(bandPainterTimer);
    ctx.clearRect(0, 0, canva.width, canva.height);
    move.checked = false;
    light.checked = false;
    clearInterval(modalDrawTimer);
    lightLab.textContent = "Освещенность";
}

var globalModalVid;
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
    
    modal.style.display = "flex";
    modal_content.style.display = "flex";
    globalModalVid = arguments[0].target;

    modalDrawTimer = setInterval(modalDraw, 35);
    
    soundProc();
    
}
////
function soundProc() {
    an.context = an.context || new AudioContext();
    if (MEDIA_ELEMENT_NODES.has(globalModalVid)) {
        an.source = MEDIA_ELEMENT_NODES.get(globalModalVid);
    } else {
    an.source = an.context.createMediaElementSource(globalModalVid);
    MEDIA_ELEMENT_NODES.set(globalModalVid,an.source);
    }
    an.source.connect(an.analyser);
    //an.analyser.connect(an.node);
    an.node.connect(an.context.destination);
    an.source.connect(an.context.destination);

    an.node.onaudioprocess = function () {
        an.analyser.getByteFrequencyData(an.bands);
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
    globalModalVid.muted = !audioSwitch.checked;
    /*if (audioSwitch.checked == true) {
    bandPainterTimer = setInterval(draw,35);
    } else {
        clearInterval(bandPainterTimer);
    }*/
}//moved that into general modal drawer





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



var PrevFrame = {}
PrevFrame.data = [];
var CurFrame = {};
CurFrame.data = [];
var differences = [];
var modalDrawTimer;

var lightCanv = document.createElement('canvas');
var lightCtx = lightCanv.getContext('2d');
modalControlWrapper.appendChild(lightCanv);


function modalDraw() {    
    //modalVidCanvas
    //mVCtx
    PrevFrame = CurFrame;
    //curCanv.ctx.drawImage(tmpVid, 0, 0, tmpVid.videoWidth, tmpVid.videoHeight);
    modalVidCanvas.width = modalVidWrapper.offsetWidth;//vidRect.right - vidRect.left;//"100%";
    modalVidCanvas.height = modalVidWrapper.offsetHeight - 4;
    tmpWidth = modalVidCanvas.width;//globalModalVid.videoWidth/4;
    tmpHeight = modalVidCanvas.height;//globalModalVid.videoHeight/4;
    mVCtx.drawImage(globalModalVid, 0, 0, tmpWidth, tmpHeight);
    
    if (light.checked) {
        lightCtx.drawImage(globalModalVid, 0, 0, 1, 1);
        var imgd = lightCtx.getImageData(0,0,1,1);
        var pix = imgd.data;
        lightLab.textContent = "Освещенность " + ((pix[0] + pix[1] + pix[2]) / 7.65).toFixed(0) + "%";

    }

    if (audioSwitch.checked) {drawAnalyzer();}
    if (move.checked) {
        mVCtx.strokeStyle = "green";
        mVCtx.lineWidth = 5;
        CurFrame.width = tmpWidth / 4;
        CurFrame.height = tmpHeight / 4;
        PrevFrame.width = tmpWidth / 4;
        PrevFrame.height = tmpHeight / 4;
        scaledCtx.drawImage(globalModalVid, 0, 0, tmpWidth / 4, tmpHeight / 4);
        CurFrame = scaledCtx.getImageData(0, 0, CurFrame.width, CurFrame.height);
        //сверить по пикселям и записать различные в массив
        if (PrevFrame.data.length == CurFrame.data.length) {
            differences = [];
            for (var i = 0; i < (CurFrame.data.length / 4); i++) {
                let rc = CurFrame.data[i * 4 + 0];
                let gc = CurFrame.data[i * 4 + 1];
                let bc = CurFrame.data[i * 4 + 2];
                let rp = PrevFrame.data[i * 4 + 0];
                let gp = PrevFrame.data[i * 4 + 1];
                let bp = PrevFrame.data[i * 4 + 2];
                if (((rc - rp)>-13) && ((rc - rp)<13) && ((gc - gp)>-13) && ((gc - gp)<13) && ((bc - bp)>-13) && ((bc - bp)<13) ) {
                    //no movement
                } else {
                    differences.push(i);
                    if (differences.length>1600) {break;}
                    /*PrevFrame.data[i * 4 + 0] = 255;
                    PrevFrame.data[i * 4 + 1] = 0;
                    PrevFrame.data[i * 4 + 2] = 0;
                    mVCtx.putImageData(PrevFrame, 0, 0); */          
                }
            }
            let boxes = [];
            if (differences.length<1600) {
                for (var i = 0; i < differences.length; i++) {
                    var newGroup = true;
                    var tmpX = (differences[i] % CurFrame.width) * 4;
                    var tmpY = (Math.floor(differences[i]/CurFrame.width) ) * 4;
                    
                    for (var j = 0; j < boxes.length; j++) {
                        //compare to lefttop and botright
                        if ((tmpX>(boxes[j][0][0]-16)) && (tmpX<(boxes[j][1][0]+16)) && (tmpY>(boxes[j][0][1]-16)) && (tmpY<(boxes[j][1][1]+16)) ) {
                            //console.log("close");
                            boxes[j][2]++;
                            newGroup = false;
                            if (tmpX<boxes[j][0][0]) {boxes[j][0][0] = tmpX};
                            if (tmpX>boxes[j][1][0]) {boxes[j][1][0] = tmpX};
                            if (tmpY<boxes[j][0][1]) {boxes[j][0][1] = tmpY};
                            if (tmpY>boxes[j][1][1]) {boxes[j][1][1] = tmpY};
                            break;
                        }

                    }
                    
                    if  (newGroup == true) {
                        boxes.push([[tmpX,tmpY], [tmpX,tmpY], 0]);
                    }
                    
                }
                boxes = boxes.filter(x => x[2]>4);
                for (var f = 0; f < boxes.length; f++) {
                    mVCtx.beginPath();
                    mVCtx.strokeRect(boxes[f][0][0],boxes[f][0][1],boxes[f][1][0] - boxes[f][0][0],boxes[f][1][1] - boxes[f][0][1]);
                    mVCtx.stroke();
                }
                
            }
        }
    }
}

