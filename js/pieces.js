const pieceEmoji = {
	king: { white: "♔", black: "♚" },
	queen: { white: "♕", black: "♛" },
	rook: { white: "♖", black: "♜" },
	bishop: { white: "♗", black: "♝" },
	knight: { white: "♘", black: "♞" },
	pawn: { white: "♙", black: "♟︎" },
};

class Position {
	constructor(row, col) {
		this.row = row;
		this.col = col;
	}
}

class Move {
	constructor(piece, from, to, target) {
		this.piece = piece;
		this.from = from;
		this.to = to;
		this.target = target;
		this.moveValue = this.calculateMoveValue();
	}

	// Calcula o valor do movimento (pra IA)
	calculateMoveValue() {	
		let moveValue = 0;
	
		if (this.target) {
			moveValue += this.target.pieceValue;
		}

		let pieceType = this.piece.type;
		let pieceValue =  0
	
		switch (pieceType) {
			case 'pawn':
				pieceValue = PAWNPOSITIONVALUES[this.to.row][this.to.col];
				break;
			case 'knight':
				pieceValue = KNIGHTPOSITIONVALUES[this.to.row][this.to.col];
				break;
			case 'bishop':
				pieceValue = BISHOPPOSITIONVALUES[this.to.row][this.to.col];
				break;
			case 'rook':
				pieceValue = ROOKPOSITIONVALUES[this.to.row][this.to.col];
				break;
			case 'queen':
				pieceValue = QUEENPOSITIONVALUES[this.to.row][this.to.col];
				break;
			case 'king':
				pieceValue = KINGPOSITIONVALUES[this.to.row][this.to.col];
				break;
			default:
				console.error('Piece type not recognized: ', pieceType);
				break;
		}

		moveValue += pieceValue
	
		return moveValue;
	}
}

class Piece {
	constructor(color, row, col) {
		this.color = color;
		this.row = row;
		this.col = col;
	}

	// Cria uma cópia dessa peça
	copyPiece() {
		let newPiece = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		return newPiece;
	}

	// Retorna o emoji correspondente a essa peça
	getPieceEmoji(){
		return pieceEmoji[this.type][this.color];
	}

	// Retorna a cor do oponente desta peça
	getEnemyColor() {
		return this.color === "white" ? "black" : "white";
	}

	// Retorna a posição desta peça
	getPosition() {
		return [this.row, this.col];
	}

	// Move a peça e salva o movimento no histórico
	move(row, col, playerBoard = board) {
		playerBoard.addMove(new Move(this, new Position(this.row, this.col), new Position(row, col), board.getPiece(row, col)))
		this.row = row;
		this.col = col;
	}

	// Retorna todos os movimentos pseudo-validos ou válidos desta peça
	getPossibleMovements(board, validAndSafe = false) {
		let availableMoves = []
		board.squares.forEach((row, rowIndex) => {
			row.forEach((col, colIndex) => {
				if ((board.isEmpty(rowIndex, colIndex) || board.isOpponent(rowIndex, colIndex, this.color))) {
					if (validAndSafe && this.isValidAndSafeMove(rowIndex, colIndex, board) || (!validAndSafe && this.isValidMove(rowIndex, colIndex, board))) {
						availableMoves.push(new Move(this, new Position(this.row, this.col), new Position(rowIndex, colIndex), board.getPiece(rowIndex, colIndex), ))
					}
				}
			})
		})
		return availableMoves
	}

	// Um wrapper para os métodos isValidMove e isSafeMove
	isValidAndSafeMove(newRow, newCol, playerBoard = board) {
		return this.isValidMove(newRow, newCol, playerBoard) && this.isSafeMove(newRow, newCol)
	}

	// Simula um movimento para saber se ele não coloca seu rei em Xeque
	isSafeMove(row, col) {
		let pseudoBoard  = board.copyBoard();
		let pseudoPiece = this.copyPiece();
		let targetPiece = pseudoBoard.getPiece(row, col)
		pseudoBoard.pieces = pseudoBoard.pieces.filter(piece => !(piece.checkSamePos(pseudoPiece) || piece.checkSamePos(targetPiece)))

		pseudoPiece.row = row;
		pseudoPiece.col = col;
		pseudoBoard.pieces.push(pseudoPiece)
		return !pseudoBoard.isCheck();
	}

	// Verifica se a peça enviada como parâmetro está na mesma posição desta peça
	checkSamePos(piece) {
		return (piece?.row === this.row && piece?.col === this.col)
	}

	// Desenha a peça no campo
	draw(parent) {
		let piece = document.createElement("div");
		piece.className = "piece";
		piece.innerHTML = pieceEmoji[this.type][this.color];
		let fontSize = (7 * parent.clientHeight) / 10;
		piece.style.fontSize = fontSize + "px";
		piece.style.userSelect = "none";
		parent.appendChild(piece);
	}
}

class King extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "king";
		// atributo para validação do roque
		this.hasMoved = false;
		this.pieceValue = 100;
	}

	//mudança de comportamento para validação do roque
	move(row, col) {
		if (!this.hasMoved) this.hasMoved = true
		super.move(row, col)
	}

	isValidMove(newRow, newCol, playerBoard = board) {
		//verifica se a posição escolhida está à uma cas de distância da posição atual
		if (newRow === this.row || newRow === this.row - 1 || newRow === this.row + 1) {
			if (newCol === this.col || newCol === this.col - 1 || newCol === this.col + 1) {
				return true
			}
			//verifica se a posição escolhida é válida para o roque
			else return this.isValidCastleMove(newRow, newCol)
		}
		return false
	}

	//valida a jogada do roque
	isValidCastleMove(newRow, newCol, playerBoard = board) {
		if (newRow === this.row && !this.hasMoved) {
			//para a torre à direita
			if (newCol === this.col + 2) {
				let auxCol = this.col
				while (auxCol <= 7) {
					let pieceCheck = playerBoard.getPiece(this.row, ++auxCol)

					if (pieceCheck && pieceCheck.type !== 'rook') return false

					if (pieceCheck && pieceCheck.type === 'rook') {
						if (pieceCheck.hasMoved) return false
						return true
					}
				}
			}
			//para a torre à esquerda
			else if (newCol === this.col - 2) {
				let auxCol = this.col
				while (auxCol >= 0) {
					let pieceCheck = playerBoard.getPiece(this.row, --auxCol)

					if (pieceCheck && pieceCheck.type !== 'rook') return false

					if (pieceCheck && pieceCheck.type === 'rook') {
						if (pieceCheck.hasMoved) return false
						return true
					}
				}
			}
		}
		return false
	}
}

class Queen extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "queen";
		this.pieceValue = 9;
	}

	isValidMove(newRow, newCol, playerBoard = board) {
		// verificando se é a mesma posição
		if (newRow === this.row && newCol === this.col) return false;
		// verifique se o movimento é válido na vertical, horizontal ou diagonal
		if (newRow === this.row || newCol === this.col || Math.abs(newRow - this.row) === Math.abs(newCol - this.col)) {
			// determinando a direção (delta) do movimento (0 = parado)
			const deltaRow = newRow - this.row > 0 ? 1 : newRow - this.row < 0 ? -1 : 0; // 1 = direita, -1 = esquerda
			const deltaCol = newCol - this.col > 0 ? 1 : newCol - this.col < 0 ? -1 : 0; // 1 = cima, -1 = baixo
			// verificando se existem peças no caminho
			let checkRow = this.row + deltaRow;
			let checkCol = this.col + deltaCol;
			while (checkRow !== newRow || checkCol !== newCol) {
				if (playerBoard.isEmpty(checkRow, checkCol) === false) return false;
				checkRow += deltaRow;
				checkCol += deltaCol;
			}
			// não tem peças no caminho
			return true;
		}
		// caso contrário, movimento é inválido
		return false
	}
}

class Bishop extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "bishop";
		this.pieceValue = 3;	
	}

	isValidMove(newRow, newCol,  playerBoard = board) {
		// verificando se é a mesma posição
		if (newRow === this.row && newCol === this.col) return false;
		// verifique se o movimento é válido na diagonal
		if (Math.abs(newRow - this.row) === Math.abs(newCol - this.col)) {
			// determinando a direção (delta) do movimento (0 = parado)
			const deltaRow = newRow - this.row > 0 ? 1 : newRow - this.row < 0 ? -1 : 0; // 1 = direita, -1 = esquerda
			const deltaCol = newCol - this.col > 0 ? 1 : newCol - this.col < 0 ? -1 : 0; // 1 = cima, -1 = baixo
			// verificando se existem peças no caminho
			let checkRow = this.row + deltaRow;
			let checkCol = this.col + deltaCol;
			while (checkRow !== newRow || checkCol !== newCol) {
				if (playerBoard.isEmpty(checkRow, checkCol) === false) return false;
				checkRow += deltaRow;
				checkCol += deltaCol;
			}
			// não tem peças no caminho
			return true;
		}
		// caso contrário, movimento é inválido
		return false
	}
}

class Knight extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "knight";
		this.pieceValue = 3;
	}

	isValidMove(targetRow, targetCol, playerBoard = board) {
		if (targetCol === this.col + 2 || targetCol === this.col - 2) {
			if (targetRow === this.row + 1 || targetRow === this.row - 1) {
				return true;
			}
			return false;
		}
		else if (targetRow === this.row + 2 || targetRow === this.row - 2) {
			if (targetCol === this.col + 1 || targetCol === this.col - 1) {
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
		//atributo para a validação do roque
		this.hasMoved = false;
		this.pieceValue = 5;
	}

	//mudança de comportamento para validação do roque
	move(row, col) {
		if (!this.hasMoved) this.hasMoved = true
		super.move(row, col)
	}

	isValidMove(row, col, playerBoard = board) {
		if (this.row === row || this.col === col) {
			let cells = [];
			if (this.row === row) {
				let start = this.col < col ? this.col : col;
				let end = this.col < col ? col : this.col;
				for (let i = start + 1; i < end; i++) {
					cells.push(playerBoard.getPiece(row, i));
				}
			} else {
				let start = this.row < row ? this.row : row;
				let end = this.row < row ? row : this.row;
				for (let i = start + 1; i < end; i++) {
					cells.push(playerBoard.getPiece(i, col));
				}
			}
			if (cells.some((cell) => cell)) {
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
		this.pieceValue = 1;
	}

	isValidMove(newRow, newCol, playerBoard = board) {
		// Verifique se a nova posição é uma casa vazia na mesma coluna
		if (this.col === newCol && playerBoard.isEmpty(newRow, newCol)) {
			// O peão pode se mover uma ou duas casas para frente na sua primeira jogada
			if (this.color === "white") {
				if ((this.row === 1 && newRow === 3) && board.isEmpty(newRow - 1, newCol)) {
					return true;
				}
				if (newRow === this.row + 1) {
					return true;
				}
			} else {
				if ((this.row === 6 && newRow === 4) && board.isEmpty(newRow + 1, newCol)) {
					return true;
				}
				if (newRow === this.row - 1) {
					return true;
				}
			}
		}
		// Verifique se a nova posição é uma captura diagonal
		else if (
			Math.abs(this.col - newCol) === 1 &&
			playerBoard.isOpponent(newRow, newCol, this.color)
		) {
			// O peão só pode fazer uma captura diagonal
			if (this.color === "white" && newRow === this.row + 1) {
				return true;
			} else if (this.color === "black" && newRow === this.row - 1) {
				return true;
			}
		}

		// Verifica en passant
		const lastMove = playerBoard.getLastMove();
		if (lastMove && lastMove.piece instanceof Pawn && lastMove.to.row === this.row && Math.abs(lastMove.to.col - this.col) === 1 && Math.abs(lastMove.from.row - this.row) === 2) {
			const capturedPawn = playerBoard.getPiece(lastMove.to.row, lastMove.to.col);
			if (capturedPawn && capturedPawn.color !== this.color) {
				playerBoard.killPiece(capturedPawn.row, capturedPawn.col);
				return true;
			}
		};

		// O movimento não é válido
		return false;
	}

	isGoingToPromote(row) {
		return row === 0 || row === 7;
	}
}
