// Canvas

const width = 850;
const height = 400;
const canvas = document.querySelector('canvas');
canvas.setAttribute('height', height);
canvas.setAttribute('width', width);
canvas.style.border = '2px solid black';
const ctx = canvas.getContext('2d');

// Game objects

const Cup = {
  x0: 7*width/8,
  x1: 7.5*width/8,
  y0: 5*height/8,
  y1: 7*height/8,
  b: 6.5*height/8,
  inPlay: true,
  won: false
}

const Ball = {
  x: height/2,
  y: height*2/3,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0,
  r: 10
}

// Some state and position variables

let [cursorX, cursorY] = [Ball.x, Ball.y];
let cursorDown = false;
let ballMoving = false;
let gameOver = false;
let missedCount = 0;
let ticker = 0;
let dir = 1;


// Functions to help with ball moving

function calculateMotion(e){
  cursorDown = false;
  [cursorX, cursorY] = [e.pageX-this.offsetLeft, e.pageY-this.offsetTop];
  Ball.vx = (Ball.x - cursorX)/3;
  Ball.vy = (cursorY - Ball.y)/3;
  ballMoving = true;
}

function updateCoords() {
  [Ball.x, Ball.y] = [Ball.x + Ball.vx, Ball.y - Ball.vy];
  Ball.ay = 9.81/10;
  Ball.ax = Ball.vx*0.01;  
  Ball.vy -= Ball.ay;
  Ball.vx -= Ball.ax;
}

function ballSwing() {
  magnitude = Math.min(missedCount/20, 10);
  [Ball.x, Ball.y] = [Ball.x + dir*magnitude*Math.pow(Math.cos(ticker*Math.PI/180),2), Ball.y - magnitude*Math.sin(ticker*Math.PI/180)];
  ticker ++;
  if (ticker > 360) {
    ticker = 0;
    dir = -dir
  }
}

function outOfBounds(){
  if (Ball.x > width || Ball.x < 0 || Ball.y < 0 || Ball.y > height) {
    document.getElementById("whistle").load();
    document.getElementById("whistle").play();
    resetBall(Ball);
    ballMoving = false;
    missedCount ++;
    ticker = 0;
  }  
}

function resetBall(Ball) {
  Ball.x = height/2;
  Ball.y = height*2/3;
  Ball.vx = 0;
  Ball.vy = 0;
  Ball.ax = 0;
  Ball.ay = 0;
}

function collisionDetection(Cup){
  if (!Cup.inPlay) return
  
  const yAfter = Ball.y - Ball.vy;
  const xAfter = Ball.x + Ball.vx;
  
  // collision with the cup
  if(Ball.y > Cup.y0 && Ball.y < Cup.y1) {
    // collision inside the cup
    if(Ball.x - Ball.r > Cup.x0 && Ball.x + Ball.r < Cup.x1) {
      if (xAfter + Ball.r > Cup.x1 || xAfter - Ball.r < Cup.x0) {
        Ball.vx = -0.8*Ball.vx;
        document.getElementById("knock").load();
        document.getElementById("knock").play();
      }
      
      // wins when ball is immersed in liquid inside cup
      if (Ball.y > Cup.b) {
        Cup.inPlay = false;
        resetBall(Ball);
        ballMoving = false;
        Ball.won = true;
        document.getElementById("applause").play();
      }
    }   
    // collision outside the cup
    else {
      if ( (Ball.x - Ball.r < Cup.x0 && xAfter > Cup.x0) || (Ball.x + Ball.r > Cup.x1 && xAfter < Cup.x1) ) {
        Ball.vx = -0.8*Ball.vx;
        document.getElementById("knock").load();
        document.getElementById("knock").play();
      }      
    } 
  }
}

function handleCursor(e) {
  if (cursorDown) {
    [cursorX, cursorY] = [e.pageX-this.offsetLeft, e.pageY-this.offsetTop];
  }
}

function drawCup(Cup) {
  if (!Cup.inPlay) return
  ctx.fillStyle = "gold";
  ctx.fillRect(Cup.x0, Cup.b, Cup.x1-Cup.x0, Cup.y1-Cup.b);
  ctx.beginPath();
  ctx.moveTo(Cup.x0, Cup.y0);
  ctx.lineTo(Cup.x0, Cup.y1);
  ctx.lineTo(Cup.x1, Cup.y1);
  ctx.lineTo(Cup.x1, Cup.y0);
  ctx.stroke();
}

function drawSwoosh() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "blue";
  ctx.textAlign = "center";
  ctx.fillText("Swoosh!", canvas.width/2, canvas.height/2);
}

function gameEnded() {
    gameOver = true;
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Restart Game", canvas.width/2, canvas.height*2/3);
}

function drawLine() {
  ctx.beginPath();
  ctx.moveTo(Ball.x, Ball.y);
  ctx.lineTo(cursorX, cursorY);
  ctx.stroke();
}

function draw(){
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(Ball.x, Ball.y, Ball.r, 0, Math.PI*2, true);
  ctx.fillStyle = "orange";
  ctx.fill();
  drawCup(Cup);
  ballSwing();
  if(cursorDown) drawLine();
  if(ballMoving) {
    collisionDetection(Cup);
    updateCoords();
    outOfBounds();
  }
  if(Ball.won) {
    drawSwoosh();
    gameEnded();
  }
  window.requestAnimationFrame(draw);
}

// Draw here

window.requestAnimationFrame(draw);

// Event listeners for user input

canvas.addEventListener('mousedown', (e)=> {cursorDown=true; handleCursor(e)});
canvas.addEventListener('mousemove', handleCursor);
canvas.addEventListener('mouseup', calculateMotion);