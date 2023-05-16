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
		console.log(this.moves)
	}

	getLastMove() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
	}

	isEmpty(row, col) {
		for (let piece of pieces) {
			if (piece.row === row && piece.col === col) {
				return false;
			}
		}

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
			}
		}

		return null;
	}

	killPiece(row, col) {
		let killedPiece = this.getPiece(row, col);
		let cell = board.squares[row][col];
		cell.innerHTML = "";
		let index = pieces.indexOf(killedPiece);
		if (index !== -1) {
			pieces.splice(index, 1);
		}
	}

	movePiece(row, col) {
		let old_row = selectedPiece.row;
		let old_col = selectedPiece.col;

		//caso da jogada do roque
		if (selectedPiece.type === 'king') {
			//movimentação da torre
			if (selectedPiece.isValidCastleMove(row, col)) {
				let castleRook;
				let castleRookCol;
				//caso à esquera
				if (col < old_col) {
					if (selectedPiece.color === 'black') castleRook = this.getPiece(7, 0)
					else castleRook = this.getPiece(0, 0)
					castleRookCol = col + 1
				}
				//caso à direita
				else {
					if (selectedPiece.color === 'black') castleRook = this.getPiece(7, 7)
					else castleRook = this.getPiece(0, 7)
					castleRookCol = col - 1
				}

				//desenha e atualiza a posição da torre
				let oldRookCell = board.squares[castleRook.row][castleRook.col];
				castleRook.move(row, castleRookCol)
				let newRookCell = board.squares[castleRook.row][castleRook.col];
				castleRook.draw(newRookCell)
				oldRookCell.innerHTML = "";
			}
		}

		selectedPiece.move(row, col);

		selectedCell.classList.remove("selected");
		let square = board.squares[selectedPiece.row][selectedPiece.col];
		square.classList.remove("selected");
		selectedPiece.draw(square);
		selectedPiece = null;
		selectedCell = null;

		let cell = board.squares[old_row][old_col];
		cell.innerHTML = "";
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
					let target = event.target;

					if (target.classList.contains("square")) {
						let row = parseInt(target.dataset.row);
						let col = parseInt(target.dataset.col);

						let pieceInCell = this.getPiece(row, col);
						if (selectedCell && selectedCell != target) {
							let _isValidMove = selectedPiece.isValidMove(row, col);
							let _isOpponent = this.isOpponent(row, col)
							if (_isValidMove && !pieceInCell) {
								this.movePiece(row, col);
							} else if (_isOpponent && _isValidMove) {
								this.killPiece(row, col);
								this.movePiece(row, col);
								pieceInCell = null
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
					}

				});

				row.appendChild(cell);
				this.squares[i][j] = cell;
			}
			table.appendChild(row);
		}

		parent.appendChild(table);
	}
}
