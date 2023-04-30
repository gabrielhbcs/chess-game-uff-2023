const pieceEmoji = {
	"king": { "white": "♔", "black": "♚" },
	"queen": { "white": "♕", "black": "♛" },
	"rook": { "white": "♖", "black": "♜" },
	"bishop": { "white": "♗", "black": "♝" },
	"knight": { "white": "♘", "black": "♞" },
	"pawn": { "white": "♙", "black": "♟︎" }
};

class Piece {
	constructor(color, row, col) {
		this.color = color;
		this.row = row;
		this.col = col;
	}

	move(row, col) {
		this.row = row;
		this.col = col;


		// por enquanto só as peças pretas jogam
		// currentPlayer = currentPlayer === "white" ? "black" : "white";
	}

	draw(parent) {
		let piece = document.createElement("div");
		piece.className = "piece";
		piece.innerHTML = pieceEmoji[this.type][this.color];
		let fontSize = 7 * parent.clientHeight / 10;
		piece.style.fontSize = fontSize + "px";
		piece.style.userSelect = "none";
		parent.appendChild(piece);

	}
}

class King extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "king";
	}
}

class Queen extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "queen";
	}
}

class Bishop extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "bishop";
	}
}

class Knight extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "knight";
	}

	isValidMove(targetRow, targetCol) {
		if (targetCol === this.col + 2 || targetCol === this.col - 2) {
			if (targetRow === this.row + 1 || targetRow === this.row -1 ) {
				return true;
			}
			return false;
		}
		else if(targetRow === this.row + 2 || targetRow === this.row - 2) {
			if (targetCol === this.col + 1 || targetCol === this.col -1 ) {
				return true;
			}
			return false;
		}
		return false;
	}
}

class Rook extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "rook";
	}

	isValidMove(row, col) {
		if (this.row === row || this.col === col) {
			let cells = [];
			if (this.row === row) {
				let start = this.col < col ? this.col : col;
				let end = this.col < col ? col : this.col;
				for (let i = start + 1; i < end; i++) {
					cells.push(board.getPiece(row, i));
				}
			} else {
				let start = this.row < row ? this.row : row;
				let end = this.row < row ? row : this.row;
				for (let i = start + 1; i < end; i++) {
					cells.push(board.getPiece(i, col));
				}
			}
			if (cells.some(cell => cell)) {
				return false;
			}
			return true;
		}
		return false;
	}
}

class Pawn extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "pawn";
	}

	isValidMove(newRow, newCol) {
		// Verifique se a nova posição é uma casa vazia na mesma coluna
		if (this.col === newCol && board.isEmpty(newRow, newCol)) {
			// O peão pode se mover uma ou duas casas para frente na sua primeira jogada
			if (this.color === "white") {
				if (this.row === 1 && newRow === 3) {
					return true;
				}
				if (newRow === this.row + 1) {
					return true;
				}
			} else {
				if (this.row === 6 && newRow === 4) {
					return true;
				}
				if (newRow === this.row - 1) {
					return true;
				}
			}
		}
		// Verifique se a nova posição é uma captura diagonal
		else if (Math.abs(this.col - newCol) === 1 && board.isOpponent(newRow, newCol, this.color)) {
			// O peão só pode fazer uma captura diagonal
			if (this.color === "white" && newRow === this.row + 1) {
				return true;
			} else if (this.color === "black" && newRow === this.row - 1) {
				return true;
			}
		}

		// O movimento não é válido
		return false;
	}
}