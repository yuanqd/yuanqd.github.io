const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const statusDisplay = document.querySelector('.status');

// 游戏设置
const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const PIECE_RADIUS = CELL_SIZE / 2 - 2;

// 游戏状态
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
let currentPlayer = 1; // 1: 黑棋, 2: 白棋
let gameOver = false;

// 初始化棋盘
function initBoard() {
    canvas.width = BOARD_SIZE * CELL_SIZE;
    canvas.height = BOARD_SIZE * CELL_SIZE;
    
    // 绘制棋盘
    ctx.fillStyle = '#e8c887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // 绘制网格线
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.lineTo(canvas.width - CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2);
        ctx.lineTo(i * CELL_SIZE + CELL_SIZE / 2, canvas.height - CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // 绘制五个星位
    const starPoints = [3, 7, 11];
    ctx.fillStyle = '#000';
    starPoints.forEach(x => {
        starPoints.forEach(y => {
            if (!(x === 7 && y === 7)) { // 中心点只画一个
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    });
    
    // 中心点
    ctx.beginPath();
    ctx.arc(7 * CELL_SIZE + CELL_SIZE / 2, 7 * CELL_SIZE + CELL_SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制棋子
function drawPiece(x, y, player) {
    ctx.beginPath();
    ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        PIECE_RADIUS, 0, Math.PI * 2
    );
    
    const gradient = ctx.createRadialGradient(
        x * CELL_SIZE + CELL_SIZE / 2 - PIECE_RADIUS / 3,
        y * CELL_SIZE + CELL_SIZE / 2 - PIECE_RADIUS / 3,
        PIECE_RADIUS / 3,
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        PIECE_RADIUS
    );
    
    if (player === 1) {
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
}

// 检查是否获胜
function checkWin(x, y, player) {
    const directions = [
        [1, 0],   // 水平
        [0, 1],   // 垂直
        [1, 1],   // 对角线
        [1, -1]   // 反对角线
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// 处理点击事件
function handleClick(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // 检查是否有效落子
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === 0) {
        board[x][y] = currentPlayer;
        drawPiece(x, y, currentPlayer);
        
        // 检查胜利
        if (checkWin(x, y, currentPlayer)) {
            gameOver = true;
            statusDisplay.textContent = `${currentPlayer === 1 ? '黑方' : '白方'}获胜！`;
            return;
        }
        
        // 切换玩家
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        statusDisplay.textContent = `${currentPlayer === 1 ? '黑方' : '白方'}回合`;
    }
}

// 重置游戏
function resetGame() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1;
    gameOver = false;
    statusDisplay.textContent = '黑方回合';
    initBoard();
}

// 添加触摸事件处理
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    
    // 计算触摸位置相对于canvas的坐标
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // 转换为棋盘坐标
    const boardX = Math.floor(x / CELL_SIZE);
    const boardY = Math.floor(y / CELL_SIZE);
    
    // 确保坐标在棋盘范围内
    if (boardX >= 0 && boardX < BOARD_SIZE && boardY >= 0 && boardY < BOARD_SIZE) {
        handleClick(boardX, boardY);
    }
}

// 初始化游戏
function initBoard() {
    // 清除之前的事件监听器
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('touchstart', handleTouch);
    
    // 添加新的事件监听器
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
    
    // 绘制棋盘
    canvas.width = BOARD_SIZE * CELL_SIZE;
    canvas.height = BOARD_SIZE * CELL_SIZE;
    
    ctx.fillStyle = '#e8c887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // 绘制网格线
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.lineTo(canvas.width - CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2);
        ctx.lineTo(i * CELL_SIZE + CELL_SIZE / 2, canvas.height - CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // 绘制五个星位
    const starPoints = [3, 7, 11];
    ctx.fillStyle = '#000';
    starPoints.forEach(x => {
        starPoints.forEach(y => {
            if (!(x === 7 && y === 7)) {
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    });
    
    // 中心点
    ctx.beginPath();
    ctx.arc(7 * CELL_SIZE + CELL_SIZE / 2, 7 * CELL_SIZE + CELL_SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fill();
}

// 初始化游戏
initBoard();

// 添加重置按钮
const resetBtn = document.createElement('button');
resetBtn.textContent = '重新开始';
resetBtn.addEventListener('click', resetGame);
document.querySelector('.game-container').appendChild(resetBtn);
