
var gameMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,1,1,0,0,0,1],
  [1,0,0,0,1,0,0,1,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1]
];
var posX = 6;
var posY = 9; // position de la camera dans la map (posX et posY)
var direction = 90; // orientation de la camera dans la map (angle)
var FOV = 60; // champ visuel de la camera (aka field of view [FOV])
var projW = window.innerWidth;
var projH = window.innerHeight; // taille de l’écran de projection (« plane » ou écran)
var distCameraProj = Math.trunc((projW/2) / Math.tan(degToRad(FOV/2)));
var celluleSize = 2048;
var rawPosX = (posX+1) * celluleSize - (celluleSize / 2);
var rawPosY = (posY+1) * celluleSize - (celluleSize / 2);
// var playerH = celluleSize; // hauteur de la caméra
var playerSpeed = 700;
var cameraSpeed = 2;
var CONTAINER = document.getElementById('container');

// ---------------------------------------------------
// --- MAIN ------------------------------------------
balayage(direction)
document.addEventListener('keydown', function(e) {
    e = e || window.event;
    if (e.keyCode == '90') { // Z
      var dir = rayDirection(direction);
      rawPosX += dir[0]*Math.abs(Math.cos(direction))*playerSpeed;
      rawPosY += dir[1]*Math.abs(Math.sin(direction))*playerSpeed;
      return balayage(direction);
    } else if (e.keyCode == '83') { // S
      var dir = rayDirection(direction);
      rawPosX -= dir[0]*Math.abs(Math.cos(direction))*playerSpeed;
      rawPosY -= dir[1]*Math.abs(Math.sin(direction))*playerSpeed;
      return balayage(direction);
    } else if (e.keyCode == '81') { // Q
      var tmpDirection = direction+90;
      var dir = rayDirection(tmpDirection);
      rawPosX += dir[0]*Math.abs(Math.cos(tmpDirection))*(playerSpeed/3);
      rawPosY += dir[1]*Math.abs(Math.sin(tmpDirection))*(playerSpeed/3);
      return balayage(direction);
    } else if (e.keyCode == '68') { // D
      var tmpDirection = direction-90;
      var dir = rayDirection(tmpDirection);
      rawPosX += dir[0]*Math.abs(Math.cos(tmpDirection))*(playerSpeed/3);
      rawPosY += dir[1]*Math.abs(Math.sin(tmpDirection))*(playerSpeed/3);
      return balayage(direction);
    } else {}
    return;
}, false);

// https://developer.mozilla.org/fr/docs/WebAPI/Pointer_Lock
document.pointerLockElement = document.pointerLockElement    ||
                              document.mozPointerLockElement ||
                              document.webkitPointerLockElement;
CONTAINER.requestPointerLock = CONTAINER.requestPointerLock ||
                              CONTAINER.mozRequestPointerLock ||
                              CONTAINER.webkitRequestPointerLock;
document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;
CONTAINER.onclick = function() { CONTAINER.requestPointerLock(); }
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
function lockChangeAlert() {
  if (document.pointerLockElement === CONTAINER) {
    document.addEventListener("mousemove", updateCameraPosition, false);
  } else {
    document.removeEventListener("mousemove", updateCameraPosition, false);
  }
}
function updateCameraPosition(e) {
  var coef = -1*Math.sqrt(Math.abs(e.movementX));
  direction = direction + cameraSpeed*Math.sign(e.movementX)*coef;
  return balayage(direction);
}
// ---------------------------------------------------
// ---------------------------------------------------

function displayInfos() {
  var x = Math.round(rawPosX / celluleSize);
  var y = Math.round(rawPosY / celluleSize);
  var d = Math.round(direction);
  document.getElementById("debugdata").innerHTML = '<p>X, Y : '+x+', '+y+'</p><p>direction : '+d+'</p>';
}

function renderCol(h) {
  var semiMargin = (projH - h) / 2;
  return '<div class="column-wall" style="height:'+h+'px;margin:'+semiMargin+'px 0px;"></div>';
}

function balayage(direction) {
  displayInfos();
  var cols = "";
  var dir = direction + (FOV/2) + 0.1;
  for(var i=0;i<projW;i++) {
    var wallHeight = raycast(dir);
    cols += renderCol(wallHeight);
    dir -= FOV / projW;
  }
  CONTAINER.innerHTML = cols;
  return;
}

function raycast(angle) {
  var testX = Math.abs(horizontalDetection(rawPosX,rawPosY,angle));
  var testY = Math.abs(verticalDetection(rawPosX,rawPosY,angle));
  var dist = Math.min(testX, testY);
  var correctedDist = dist * Math.cos(degToRad(FOV/2));
  var projWallHeight = Math.round(celluleSize / correctedDist * distCameraProj);
  return projWallHeight;
}

function degToRad(deg) {
  return deg * (Math.PI/180);
}

function findGameMapValue(x,y) {
  var mapEnd = gameMap.length - 1;
  var xx = x;
  var yy = y;
  if(y >= mapEnd) { yy = mapEnd; }
  if(x >= mapEnd) { xx = mapEnd; }
  return gameMap[yy][xx];
}

function rayDirection(a) {
  var angle = a % 360;
  if(angle < 0) { angle += 360; }
  var x;
  var y;

  if (angle == 0) {
    x = 1;
    y = 0;
  } else if(angle > 0 && angle < 90) {
    x = 1;
    y = -1;
  } else if(angle == 90) {
    x = 0;
    y = -1;
  } else if(angle > 90 && angle < 180) {
    x = -1;
    y = -1;
  } else if(angle == 180) {
    x = -1;
    y = 0;
  } else if(angle > 180 && angle < 270) {
    x = -1;
    y = 1;
  } else if(angle == 270) {
    x = 0;
    y = 1;
  } else if(angle > 270 && angle < 360) {
    x = 1;
    y = 1;
  } else {
    x = null;
    y = null;
  }
  return [x,y];
}

function unitToCartesian(xx,yy) {
  var x = Math.floor(Math.abs(xx) / celluleSize);
  var y = Math.floor(Math.abs(yy) / celluleSize);
  return [x,y];
}

function horizontalDetection(rawX,rawY,angle) {
  var rayDir = rayDirection(angle);
  var intersY;
  if(rayDir[1] < 0) { // si rayon vers le haut
    intersY = Math.floor(rawY/celluleSize)*celluleSize - 1;
  } else {
    intersY = Math.floor(rawY/celluleSize)*celluleSize + celluleSize;
  }
  var intersX = rawX + (rawY-intersY) / Math.tan(degToRad(angle));
  var ya = rayDir[1]*celluleSize;
  var xa = (-1*rayDir[1]) * celluleSize / Math.tan(degToRad(angle));
  return nextDetection(rawX,intersX,intersY,xa,ya,angle);
}

function verticalDetection(rawX,rawY,angle) {
  var rayDir = rayDirection(angle);
  var intersX;
  if(rayDir[0] < 0) { // si rayon vers la gauche
    intersX = Math.floor(rawX/celluleSize)*celluleSize - 1;
  } else {
    intersX = Math.floor(rawX/celluleSize)*celluleSize + celluleSize;
  }
  var intersY = rawY + (rawX-intersX) * Math.tan(degToRad(angle));
  var xa = rayDir[0]*celluleSize;
  var ya = (-1*rayDir[0]) * celluleSize * Math.tan(degToRad(angle));
  return nextDetection(rawX,intersX,intersY,xa,ya,angle);
}

function nextDetection(iniX,xx,yy,xa,ya,angle) {
  var coord = unitToCartesian(xx,yy);
  var wall = findGameMapValue(coord[0], coord[1]);
  if(wall) {
    var dist = Math.abs(iniX - xx) / Math.cos(degToRad(angle));
    return dist;
  } else {
    var newX = xx + xa;
    var newY = yy + ya;
    return nextDetection(iniX,newX,newY,xa,ya,angle);
  }
}
