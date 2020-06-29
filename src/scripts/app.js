//canvas and context initialisaion
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");
//canvas height and width
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//stroke color and stroke line width
let color = "#000";
let lineWidth = 1;

//colorPicker api
const colorPicker = new iro.ColorPicker('#picker', {
  width: 200
});
//colorPicker api on color change event
colorPicker.on("color:change",listenToColorChange);
function listenToColorChange() {
  color = colorPicker.color.hexString;
  document.querySelector('#selectedColor').style.background = color;
}

//html select option and appending with options
const brushSize = document.querySelector('#brushSize');
let brushSizeValues = [5,10,15,20,25,30,35,40,45,50];
brushSizeValues.forEach((brushSizeValue) => {
  const option = document.createElement("option");
  option.value = brushSizeValue;
  option.innerHTML = brushSizeValue;
  brushSize.appendChild(option);
});

brushSize.addEventListener('change', function(e) {
  lineWidth = brushSize.value;
});

//html buttons of tool div
const btnNewCanvas = document.querySelector('#btnNewCanvas');
const btnLine = document.querySelector('#btnLine');
const btnCircle = document.querySelector('#btnCircle');
const btnRectangle = document.querySelector('#btnRectangle');
const btnPen = document.querySelector('#btnPen');
const btnEraser = document.querySelector('#btnEraser');

//initial boolean variables
let isDrawLine = false;
let isDrawCircle = false;
let isDrawRectangle = false;
let isDrawWithPen = false;
let isDrawing = false;
let isEraserSelected = false;
let isErasing = false;

//function used when tool is changed
function makeEverythingElseFalse(x) {
  isDrawLine = x;
  isDrawCircle = x;
  isDrawRectangle = x;
  isDrawWithPen = x;
  isEraserSelected = x;
}

//event listeners on buttons of tool div
btnLine.addEventListener('click', function(e) {
  makeEverythingElseFalse(false);
  isDrawLine = !isDrawLine;
});

btnCircle.addEventListener('click', function(e) {
  makeEverythingElseFalse(false);
  isDrawCircle = !isDrawCircle;
});

btnRectangle.addEventListener('click', function(e) {
  makeEverythingElseFalse(false);
  isDrawRectangle = !isDrawRectangle;
});

btnPen.addEventListener('click', function(e) {
  makeEverythingElseFalse(false);
  isDrawWithPen = !isDrawWithPen;
});

btnEraser.addEventListener('click', function(e) {
  makeEverythingElseFalse(false);
  isEraserSelected = !isEraserSelected;
});

//mouse positions
let startingPosition = {
  x: undefined,
  y: undefined
}

let lastPosition = {
  x:undefined,
  y:undefined
}

//to store objects that have been already drawn
let objects = [];

//mouse position for pen
let penStartPosition = {
  x: undefined,
  y:undefined
}
let penFollowingPositions = [];

//mouse position for eraser
const lastPositionOfEraser = {
  x:undefined,
  y:undefined
}
let eraserPositions = [];

//mouse down event listener on canvas
canvas.addEventListener('mousedown', function(e) {
  if (isDrawLine) {
    startingPosition.x = e.offsetX;
    startingPosition.y = e.offsetY;
  }else if (isDrawCircle) {
    startingPosition.x = e.offsetX;
    startingPosition.y = e.offsetY;
  }else if (isDrawRectangle) {
    startingPosition.x = e.offsetX;
    startingPosition.y = e.offsetY;
  }else if (isDrawWithPen) {
    isDrawing = !isDrawing;
    if (isDrawing) {
      startingPosition.x = e.offsetX;
      startingPosition.y = e.offsetY;
      ctx.beginPath();
      ctx.moveTo(e.offsetX,e.offsetY);
      penStartPosition.x = e.offsetX;
      penStartPosition.y = e.offsetY;
    }
  }else if (isEraserSelected) {
    isErasing = !isErasing;
  }
});


//mouseup event listener on canvas
canvas.addEventListener('mouseup', function(e) {
  if (isDrawLine) {
    objects.push({
      name:"line",
      lineWidth: lineWidth,
      color:color,
      startingPosition:JSON.parse(JSON.stringify(startingPosition)),
      lastPosition:JSON.parse(JSON.stringify(lastPosition))
    })
  }else if (isDrawCircle) {
    objects.push({
      name:"circle",
      lineWidth: lineWidth,
      color:color,
      startingPosition:JSON.parse(JSON.stringify(startingPosition)),
      lastPosition:JSON.parse(JSON.stringify(lastPosition))
    })
  }else if (isDrawRectangle) {
    objects.push({
      name:"rectangle",
      lineWidth: lineWidth,
      color:color,
      startingPosition:JSON.parse(JSON.stringify(startingPosition)),
      lastPosition:JSON.parse(JSON.stringify(lastPosition))
    })
  }else if (isDrawing) {
    isDrawing = !isDrawing;
    objects.push({name:"pen",lineWidth: lineWidth,color:color,penStartPosition:JSON.parse(JSON.stringify(penStartPosition)),penFollowingPositions:Array.from(penFollowingPositions)})
  }else if (isErasing) {
    isErasing = !isErasing;
    let width = 50;
    let height = 50;
    ctx.fillStyle = "#fff";
    ctx.fillRect(lastPositionOfEraser.x-1,lastPositionOfEraser.y-1,width+2,height+2);
    objects.push({name:"eraser",eraserPositions:Array.from(eraserPositions)});
  }
  startingPosition.x = undefined;
  startingPosition.y = undefined;
  lastPosition.x = undefined;
  lastPosition.y = undefined;
  penStartPosition.x = undefined;
  penStartPosition.y = undefined;
  penFollowingPositions = [];
  lastPositionOfEraser.x = undefined;
  lastPositionOfEraser.y = undefined;
});

//mousemove event listener on canvas
canvas.addEventListener('mousemove', function(e) {
  if (isDrawLine) {
    drawLine(e);
  }else if (isDrawCircle) {
    drawCircle(e);
  }else if (isDrawRectangle) {
    drawRectangle(e);
  }else if (isDrawing) {
    drawWithPen(e);
  }else if (isErasing) {
    erase(e);
  }
});


//erasing function
function erase(e) {
  let width = 50;
  let height = 50;
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.fillRect(lastPositionOfEraser.x-1,lastPositionOfEraser.y-1,width+2,height+2);
  ctx.strokeRect(e.offsetX-width/2,e.offsetY-height/2,width,height);
  lastPositionOfEraser.x = e.offsetX-width/2;
  lastPositionOfEraser.y = e.offsetY-height/2;
  eraserPositions.push({x:lastPositionOfEraser.x,y:lastPositionOfEraser.y});
}



//drawing new objects
function drawWithPen(e) {
  ctx.lineTo(e.offsetX,e.offsetY);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
  penFollowingPositions.push({x:e.offsetX,y:e.offsetY});
}

function drawRectangle(e) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  objects.forEach((object) => {
    render(object);
  })
  ctx.strokeStyle = color;
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.strokeRect(startingPosition.x,startingPosition.y,Math.abs(startingPosition.x-lastPosition.x),Math.abs(startingPosition.y-lastPosition.y));
  ctx.restore();
  lastPosition.x = e.offsetX;
  lastPosition.y = e.offsetY;
}

//function to get the radius of the circle
function getRadius(x1,y1,x2,y2) {
  return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}

function drawCircle(e) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  objects.forEach((object) => {
    render(object);
  })
  ctx.beginPath();
  ctx.moveTo(startingPosition.x,startingPosition.y);
  let radius = getRadius(startingPosition.x,startingPosition.y,e.offsetX,e.offsetY);
  ctx.arc(startingPosition.x,startingPosition.y,radius,0,Math.PI*2,false);
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
  lastPosition.x = e.offsetX;
  lastPosition.y = e.offsetY;
}


function drawLine(e) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  objects.forEach((object) => {
    render(object);
  })
  ctx.beginPath();
  ctx.moveTo(startingPosition.x,startingPosition.y);
  ctx.lineTo(e.offsetX,e.offsetY);
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
  lastPosition.x = e.offsetX;
  lastPosition.y = e.offsetY;
}


//rendering already drawn objects
function render(object) {
  switch (object.name) {
    case "line":
      renderLine(object);
      break;
    case "circle":
      renderCircle(object);
      break;
    case "rectangle":
      renderRectangle(object);
      break;
    case "pen":
      renderPen(object);
      break;
    case "eraser":
      rederEraser(object);
      break;
  }
}

function renderLine(object) {
  let startingPoint = object.startingPosition;
  let endPoint = object.lastPosition;
  ctx.beginPath();
  ctx.moveTo(startingPoint.x,startingPoint.y);
  ctx.lineTo(endPoint.x,endPoint.y);
  ctx.save();
  ctx.lineWidth = object.lineWidth;
  ctx.strokeStyle = object.color;
  ctx.stroke();
  ctx.restore();
}

function renderCircle(object) {
  let startingPoint = object.startingPosition;
  let endPoint = object.lastPosition;
  ctx.beginPath();
  let radius = getRadius(startingPoint.x,startingPoint.y,endPoint.x,endPoint.y);
  ctx.arc(startingPoint.x,startingPoint.y,radius,0,Math.PI*2,false);
  ctx.save();
  ctx.lineWidth = object.lineWidth;
  ctx.strokeStyle = object.color;
  ctx.stroke();
  ctx.restore()
}

function renderRectangle(object) {
  let startingPoint = object.startingPosition;
  let endPoint = object.lastPosition;
  ctx.beginPath();
  let width = Math.abs(startingPoint.x - endPoint.x);
  let height = Math.abs(startingPoint.y - endPoint.y);
  ctx.save();
  ctx.lineWidth = object.lineWidth;
  ctx.strokeStyle = object.color;
  ctx.strokeRect(startingPoint.x,startingPoint.y,width,height);
  ctx.restore();
}

function renderPen(object) {
  let startingPoint = object.penStartPosition;
  let followingPositions = object.penFollowingPositions;
  ctx.beginPath();
  ctx.moveTo(startingPoint.x,startingPoint.y);
  followingPositions.forEach((position) => {
    ctx.lineTo(position.x,position.y);
  });
  ctx.save();
  ctx.lineWidth = object.lineWidth;
  ctx.strokeStyle = object.color;
  ctx.stroke();
  ctx.restore();
}

function rederEraser(object) {
  let width = 50;
  let height = 50;
  object.eraserPositions.forEach((position) => {
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.fillRect(position.x-1,position.y-1,width+2,height+2);
  });
}

//new canvas set everything to default
btnNewCanvas.addEventListener('click', function(e) {

  ctx.clearRect(0,0,canvas.width,canvas.height);

  startingPosition.x = undefined;
  startingPosition.y = undefined;
  lastPosition.x = undefined;
  lastPosition.y = undefined;
  penStartPosition.x = undefined;
  penStartPosition.y = undefined;
  penFollowingPositions = [];
  lastPositionOfEraser.x = undefined;
  lastPositionOfEraser.y = undefined;

  objects = [];
  eraserPositions = []
  isDrawLine = false;
  isDrawCircle = false;
  isDrawWithPen = false;
  isDrawing = false;
  isEraserSelected = false;
  isErasing = false;
});
