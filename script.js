const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const Cv = {
  H: canvas.height,
  W: canvas.width,
  Rpress: false,
  Lpress: false,
  score: 0,
  lives: 3,
};

const B = {
  x: Cv.W / 2,
  y: Cv.H - 30,
  dx: 2,
  dy: -2,
  R: 10,
};

const Pdl = {
  H: 10,
  W: 75,
  X: 0,
  Y: 10,
  // R : 15,
};
Pdl.X = (Cv.W - Pdl.W) / 2;

const Bricks = {
  RowCount: 3,
  ColumnCount: 6,
  Width: 75,
  Height: 20,
  Padding: 10,
  OffsetTop: 30,
  OffsetLeft: 50,
};

let BricksArr = [];

for (let col = 0; col < Bricks.ColumnCount; col++) {
  BricksArr[col] = [];
  for (let row = 0; row < Bricks.RowCount; row++) {
    BricksArr[col][row] = { x: 0, y: 0, status: row === 0 ? 2 : 1 };
  }
}

const drawBall = () => {
  ctx.beginPath();

  ctx.arc(B.x, B.y, B.R, 0, Math.PI * 2, false);
  ctx.fillStyle = '#0008';
  ctx.fill();

  ctx.closePath();
};

const drawPaddle = () => {
  ctx.beginPath();

  // TRICK
  Pdl.X = B.x - Pdl.W / 2;

  ctx.rect(Pdl.X, Cv.H - Pdl.H - Pdl.Y, Pdl.W, Pdl.H);
  ctx.fillStyle = '#0008';
  ctx.fill();

  ctx.closePath();
};

const drawBricks = () => {
  const clrBr = (st) => {
    return st > 1 ? '#0008' : '#0004';
  };

  for (let col = 0; col < Bricks.ColumnCount; col++) {
    for (let row = 0; row < Bricks.RowCount; row++) {
      if (BricksArr[col][row].status > 0) {
        let brickX = col * (Bricks.Width + Bricks.Padding) + Bricks.OffsetLeft;
        let brickY = row * (Bricks.Height + Bricks.Padding) + Bricks.OffsetTop;

        BricksArr[col][row].x = brickX;
        BricksArr[col][row].y = brickY;

        ctx.beginPath();

        ctx.rect(brickX, brickY, Bricks.Width, Bricks.Height);
        ctx.fillStyle = clrBr(BricksArr[col][row].status);
        ctx.fill();

        ctx.closePath();
      }
    }
  }
};

const drawScore = () => {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0004';
  ctx.fillText(Cv.score + ' points', 8, 20);
};

const drawLives = () => {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0004';
  ctx.fillText(Cv.lives + ' ❤', canvas.width - 40, 20);
};

const draw = () => {
  // código para dibujar

  ctx.clearRect(0, 0, Cv.W, Cv.H);

  drawing();

  collisionDetection();
  minimalMovAndColl();
  gameover();

  Cv.Rpress && Pdl.W + Pdl.X < Cv.W && (Pdl.X += 7);
  Cv.Lpress && Pdl.X > 0 && (Pdl.X -= 7);

  requestAnimationFrame(draw);
};

const drawing = () => {
  drawPaddle();
  drawLives();
  drawScore();
  drawBricks();
  drawBall();
};

const minimalMovAndColl = () => {
  B.x += B.dx;
  B.y += B.dy;

  (B.x + B.R === Cv.W || B.x - B.R === 0) && (B.dx *= -1);
  B.y - B.R === 0 && (B.dy = -B.dy);

  if (B.y + B.R === Cv.H - Pdl.H - Pdl.Y) {
    if (B.x > Pdl.X && B.x < Pdl.X + Pdl.W) {
      B.dy *= -1;
    }
  }
};

const gameover = () => {
  if (B.y + B.R === Cv.H + B.R * 2) {
    Cv.lives--;
    if (!Cv.lives) {
      console.log('GAME OVER');
      document.location.reload();
    } else {
      B.x = canvas.width / 2;
      B.y = canvas.height - 30;
      B.dx = 2;
      B.dy = -2;
      Pdl.X = (canvas.width - Pdl.W) / 2;
    }
  }
};

const keyDownHandler = (e) => {
  if (e.keyCode == 39) {
    Cv.Rpress = true;
  } else if (e.keyCode == 37) {
    Cv.Lpress = true;
  }
};

const keyUpHandler = (e) => {
  if (e.keyCode == 39) {
    Cv.Rpress = false;
  } else if (e.keyCode == 37) {
    Cv.Lpress = false;
  }
};

const collisionDetection = () => {
  for (let col = 0; col < Bricks.ColumnCount; col++) {
    for (let row = 0; row < Bricks.RowCount; row++) {
      let brickNow = BricksArr[col][row];
      if (brickNow.status > 0) {
        // calculations

        if (
          B.x > brickNow.x &&
          B.x < brickNow.x + Bricks.Width &&
          B.y + B.R > brickNow.y &&
          B.y - B.R < brickNow.y + Bricks.Height
        ) {
          B.dy *= -1;
          BreackAndScore(brickNow);
        }

        if (
          B.y > brickNow.y &&
          B.y < brickNow.y + Bricks.Height &&
          B.x + B.R > brickNow.x &&
          B.x - B.R < brickNow.x + Bricks.Width
        ) {
          B.dx *= -1;
          BreackAndScore(brickNow);
        }
      }
    }
  }
};

const BreackAndScore = (brick) => {
  (brick.status === 1) && Cv.score++;
  brick.status--;

  if (Cv.score === Bricks.RowCount * Bricks.ColumnCount) {
    console.log('YOU WIN, CONGRATULATIONS!');
    document.location.reload();
  }
};

const mouseMoveHandler = (e) => {
  let relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > Pdl.W / 2 && relativeX < canvas.width - Pdl.W / 2) {
    Pdl.X = relativeX - Pdl.W / 2;
  }
};

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

// setInterval(draw, 10);
draw();
