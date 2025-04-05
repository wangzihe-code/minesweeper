const boardSize = 36;
const mineCount = 150;
let board = [];
let gameOver = false;

function startGame() {
  const nickname = document.getElementById("nickname").value || "无名英雄";
  document.getElementById("status").textContent = `${nickname}，祝你好运！`;
  board = [];
  gameOver = false;
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 20px)`;

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => revealCell(i));
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      toggleFlag(i);
    });
    gameBoard.appendChild(cell);
    board.push({ mine: false, revealed: false, flagged: false, element: cell });
  }

  let placed = 0;
  while (placed < mineCount) {
    const index = Math.floor(Math.random() * board.length);
    if (!board[index].mine) {
      board[index].mine = true;
      placed++;
    }
  }
}

function revealCell(index) {
  if (gameOver || board[index].flagged || board[index].revealed) return;
  const cell = board[index];
  cell.revealed = true;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.textContent = "💣";
    document.getElementById("status").textContent = "BOOM！你踩雷了！";
    navigator.vibrate?.(500);
    gameOver = true;
    revealAll();
    return;
  }

  const minesAround = countMinesAround(index);
  if (minesAround > 0) {
    cell.element.textContent = minesAround;
  } else {
    getNeighbors(index).forEach(i => revealCell(i));
  }

  checkWin();
}

function toggleFlag(index) {
  if (gameOver || board[index].revealed) return;
  const cell = board[index];
  cell.flagged = !cell.flagged;
  cell.element.textContent = cell.flagged ? "🚩" : "";
  cell.element.classList.toggle("flag");
}

function getNeighbors(index) {
  const neighbors = [];
  const x = index % boardSize;
  const y = Math.floor(index / boardSize);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        neighbors.push(ny * boardSize + nx);
      }
    }
  }
  return neighbors;
}

function countMinesAround(index) {
  return getNeighbors(index).filter(i => board[i].mine).length;
}

function revealAll() {
  board.forEach((cell, i) => {
    if (!cell.revealed) {
      if (cell.mine) {
        cell.element.textContent = "💣";
      } else {
        const mines = countMinesAround(i);
        if (mines > 0) cell.element.textContent = mines;
      }
      cell.element.classList.add("revealed");
    }
  });
}

function checkWin() {
  if (board.every(cell => cell.revealed || (cell.mine && !cell.revealed))) {
    document.getElementById("status").textContent = "🎉 恭喜你赢了！";
    gameOver = true;
  }
}
