class Board {
	constructor(element) {
		this.element = element
		this.squares = [];
		this.moves = [];
		for (let i = 0; i < 8; i++) {
			this.squares[i] = [];
			for (let j = 0; j < 8; j++) {
				let square = document.createElement("div");
				square.className = "square";
				if ((i + j) % 2 == 0) {
					square.classList.add("white");
				} else {
					square.classList.add("black");
				}
				this.squares[i][j] = square;
			}
		}
	}

	addMove(piece, from, to) {
		this.moves.push({ piece: piece, from: from, to: to });
	}

	getLastMove() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
	}

	isEmpty(row, col) {
		for (let piece of pieces) {
			if (piece.row === row && piece.col === col) {
				return false;
			};
		};
		return true;
	}

	isCheck(possibleMoves) {
		for (move of possibleMoves) {
			if (move.attacking === "king") return true;
		}
		return false;
	}

	isCheckmate(possibleMoves) {
		const isKingInCheck = this.isCheck(possibleMoves);

		if (!isKingInCheck) return false;

		return true;
	}

	isOpponent(row, col) {
		let piece = this.getPiece(row, col);
		if (selectedPiece && piece)
			return !(piece.color == selectedPiece.color);
		return false;
	}

	getCell(row, col) {
		return this.squares[row][col];
	}

	getPiece(row, col) {
		for (let piece of pieces) {
			if (piece.row === row && piece.col === col) {
				return piece;
			};
		};
		return null;
	}

	killPiece(row, col) {
		const killedPiece = this.getPiece(row, col);
		const filteredPieces = pieces.filter((piece) => piece !== killedPiece);

		pieces = [ ...filteredPieces ];
		const cell = this.squares[row][col];
		cell.innerHTML = "";
	}

	movePiece(newRow, newCol) {
		const { row, col, color, type } = selectedPiece;
		const oldPieceCell = this.squares[row][col];

		//caso da jogada do roque
		if (type === 'king') {
			//movimentação da torre
			if (selectedPiece.isValidCastleMove(newRow, newCol)) {
				let castleRook;
				let castleRookCol;
				//caso à esquera
				if (newCol < col) {
					if (selectedPiece.color === 'black') castleRook = this.getPiece(7, 0)
					else castleRook = this.getPiece(0, 0)
					castleRookCol = newCol + 1
				}
				//caso à direita
				else {
					if (selectedPiece.color === 'black') castleRook = this.getPiece(7, 7)
					else castleRook = this.getPiece(0, 7)
					castleRookCol = newCol - 1
				}

				//desenha e atualiza a posição da torre
				const oldRookCell = this.squares[castleRook.row][castleRook.col];
				castleRook.move(row, castleRookCol)
				const newRookCell = this.squares[castleRook.row][castleRook.col];
				castleRook.draw(newRookCell)
				oldRookCell.innerHTML = "";
			}
		}

		// caso o pawn seja promovido
		if (type === 'pawn' && selectedPiece.isGoingToPromote(newRow)) {
			this.killPiece(row, col);

			const cellForQueen = this.squares[newRow][newCol];
			cellForQueen.innerHTML = "";

			const newQueen = new Queen(color, newRow, newCol);
			pieces.push(newQueen);

			newQueen.draw(cellForQueen);
		} else {
			selectedPiece.move(newRow, newCol);
			selectedPiece.draw(this.squares[newRow][newCol]);
			selectedPiece = null;
		}

		oldPieceCell.classList.remove("selected");
		selectedCell.classList.remove("selected");

		selectedCell = null;
		oldPieceCell.innerHTML = "";
	}

	draw(parent) {
		let table = document.createElement("table");
		table.className = "chessboard";
		for (let i = 0; i < 8; i++) {
			let row = document.createElement("tr");
			this.squares[i] = [];
			for (let j = 0; j < 8; j++) {
				let cell = document.createElement("td");
				cell.className = "square";
				if ((i + j) % 2 == 0) {
					cell.classList.add("white");
				} else {
					cell.classList.add("black");
				}
				cell.dataset.row = i;
				cell.dataset.col = j;

				cell.addEventListener("click", (event) => {
					const { target } = event;
					if (target.classList.contains("square")) {

						const row = parseInt(target.dataset.row);
						const col = parseInt(target.dataset.col);
						let pieceInCell = this.getPiece(row, col);

						if (selectedCell && selectedCell !== target) {
							const _isValidMove = selectedPiece.isValidMove(row, col);
							const _isOpponent = this.isOpponent(row, col);
							if (pieceInCell && _isOpponent && _isValidMove) {
								this.killPiece(row, col);
								this.movePiece(row, col);
								pieceInCell = null
							}
							else if (_isValidMove && !pieceInCell) {
								this.movePiece(row, col);
							}
						}
						if (selectedCell == target) {
							selectedCell.classList.remove("selected");
							selectedCell = null;
							selectedPiece = null

						} else if (!this.isEmpty(row, col) && pieceInCell) {
							if (pieceInCell.color === "white" && currentPlayer === "white" ||
								pieceInCell.color === "black" && currentPlayer === "black") {
								target.classList.add("selected")

								if (selectedCell && selectedCell !== target) {
									selectedCell.classList.remove("selected");
									selectedPiece = null;
								}

								selectedPiece = pieceInCell;
								selectedCell = target;
							}
						}
					};
				});

				row.appendChild(cell);
				this.squares[i][j] = cell;
			}
			table.appendChild(row);
		}
		parent.appendChild(table);
	}
}
