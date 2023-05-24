const pieceEmoji = {
	king: { white: "♔", black: "♚" },
	queen: { white: "♕", black: "♛" },
	rook: { white: "♖", black: "♜" },
	bishop: { white: "♗", black: "♝" },
	knight: { white: "♘", black: "♞" },
	pawn: { white: "♙", black: "♟︎" },
};

class Piece {
	constructor(color, row, col) {
		this.color = color;
		this.row = row;
		this.col = col;
	}

	move(row, col) {
		board.addMove(this, {row: this.row, col: this.col}, {row: row, col: col} )
		this.row = row;
		this.col = col;

		// por enquanto só as peças pretas jogam
		currentPlayer = currentPlayer === "white" ? "black" : "white";
	}

	draw(parent) {
		let piece = document.createElement("div");
		piece.className = "piece";
		piece.innerHTML = pieceEmoji[this.type][this.color];
		let fontSize = (7 * parent.clientHeight) / 10;
		piece.style.fontSize = fontSize + "px";
		piece.style.userSelect = "none";
		parent.appendChild(piece);
	}

	kill(parent) {
		console.log(parent);
	}
}

class King extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "king";
		// atributo para validação do roque
		this.hasMoved = false;
	}

	//mudança de comportamento para validação do roque
	move(row, col) {
		if (!this.hasMoved) this.hasMoved = true
		super.move(row, col)
	}

	isValidMove(newRow, newCol) {
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
	isValidCastleMove(newRow, newCol) {
		if (newRow === this.row && !this.hasMoved) {
			//para a torre à direita
			if (newCol === this.col + 2) {
				let auxCol = this.col
				while (auxCol <= 7) {
					let pieceCheck = board.getPiece(this.row, ++auxCol)

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
					let pieceCheck = board.getPiece(this.row, --auxCol)

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
	}

	isValidMove(newRow, newCol) {
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
				if (board.isEmpty(checkRow, checkCol) === false) return false;
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
	}

	possibleMoves = [];
	calculatePossibleMoves() {
		let possibleRow = this.row;
		let possibleCol = this.col;
		this.possibleMoves = [];
		while (possibleRow !== 0 && possibleCol !== 0) {
			possibleRow -= 1;
			possibleCol -= 1;
			if (board.isEmpty(possibleRow, possibleCol)) {
				this.possibleMoves.push([possibleRow, possibleCol]);
			} else {
				break;
			}
		}

		possibleRow = this.row;
		possibleCol = this.col;
		while (possibleRow !== 0 && possibleCol !== 7) {
			possibleRow -= 1;
			possibleCol += 1;
			if (board.isEmpty(possibleRow, possibleCol)) {
				this.possibleMoves.push([possibleRow, possibleCol]);
			} else {
				break;
			}
		}

		possibleRow = this.row;
		possibleCol = this.col;
		while (possibleRow !== 7 && possibleCol !== 0) {
			possibleRow += 1;
			possibleCol -= 1;
			if (board.isEmpty(possibleRow, possibleCol)) {
				this.possibleMoves.push([possibleRow, possibleCol]);
			} else {
				break;
			}
		}

		possibleRow = this.row;
		possibleCol = this.col;
		while (possibleRow !== 7 && possibleCol !== 7) {
			possibleRow += 1;
			possibleCol += 1;
			if (board.isEmpty(possibleRow, possibleCol)) {
				this.possibleMoves.push([possibleRow, possibleCol]);
			} else {
				break;
			}
		}
	}

	isValidMove(row, col) {
		this.calculatePossibleMoves();
		function compareArray(matrix) {
			if (
				matrix.find(
					(element) => JSON.stringify(element) === JSON.stringify([row, col])
				) &&
				board.isEmpty()
			)
				return true;
			return false;
		}

		if (compareArray(this.possibleMoves)) {
			this.calculatePossibleMoves();
			return true;
		}
		return false;
	}
}

class Knight extends Piece {
	constructor(color, row, col) {
		super(color, row, col);
		this.type = "knight";
	}

	isValidMove(targetRow, targetCol) {
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
	}

	//mudança de comportamento para validação do roque
	move(row, col) {
		if (!this.hasMoved) this.hasMoved = true
		super.move(row, col)
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
	}

	isValidMove(newRow, newCol) {
		console.log('sou pao');
		// // // // // // // // // Verifique se a nova posição é uma casa vazia na mesma coluna
		// // // // // // // // if (this.col === newCol && board.isEmpty(newRow, newCol)) {
		// // // // // // // // 	// O peão pode se mover uma ou duas casas para frente na sua primeira jogada
		// // // // // // // // 	if (this.color === "white") {
		// // // // // // // // 		if (this.row === 1 && newRow === 3) {
		// // // // // // // // 			return true;
		// // // // // // // // 		}
		// // // // // // // // 		if (newRow === this.row + 1) {
		// // // // // // // // 			return true;
		// // // // // // // // 		}
		// // // // // // // // 	} else {
		// // // // // // // // 		if (this.row === 6 && newRow === 4) {
		// // // // // // // // 			return true;
		// // // // // // // // 		}
		// // // // // // // // 		if (newRow === this.row - 1) {
		// // // // // // // // 			return true;
		// // // // // // // // 		}
		// // // // // // // // 	}
		// // // // // // // // }
		// // // // // // // // // Verifique se a nova posição é uma captura diagonal
		// // // // // // // // else if (
		// // // // // // // // 	Math.abs(this.col - newCol) === 1 &&
		// // // // // // // // 	board.isOpponent(newRow, newCol, this.color)
		// // // // // // // // ) {
		// // // // // // // // 	// O peão só pode fazer uma captura diagonal
		// // // // // // // // 	if (this.color === "white" && newRow === this.row + 1) {
		// // // // // // // // 		return true;
		// // // // // // // // 	} else if (this.color === "black" && newRow === this.row - 1) {
		// // // // // // // // 		return true;
		// // // // // // // // 	}
		// // // // // // // // }

		// // // // // // // // // O movimento não é válido
		// // // // // // // // return false;
		return true;
	}

		// Verifica en passant
		let lastMove = board.getLastMove();
		if (lastMove && lastMove.piece instanceof Pawn && lastMove.to.row === this.row && Math.abs(lastMove.to.col - this.col) === 1 && Math.abs(lastMove.from.row - this.row) === 2) {
			let capturedPawn = board.getPiece(lastMove.to.row, lastMove.to.col);
			if (capturedPawn && capturedPawn.color !== this.color) {
				board.killPiece(capturedPawn.row, capturedPawn.col);
				return  true;
			}
		}

		// O movimento não é válido
		return false;
	}
}
