class Board {
	constructor(element) {
		this.element = element
		this.currentPlayer = 'white'
		this.squares = [];
		this.moves = [];
		this.movesWithoutCapture = 0;
		this.allPossibleMovements = [];
		this.allPossibleMovementsHistory = [];
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

	openModal(content){
		var modal = document.getElementById("modal");
		var modalText = document.getElementById("modal-text");
		modalText.innerHTML = "";
		modalText.innerHTML = content;
		
		modal.style.display = "block";
	}

	closeModal(){
		document.getElementById("modal").style.display = "none";
	}

	checkEqualMoves(moveOne, moveTwo){
		for(let j = 0; j < moveTwo.length; j++){
			if(JSON.stringify(moveOne[j]) !== JSON.stringify(moveTwo[j])){
				return false;
			}
		}
		return true
	}

	checkRepeatedMoves(){
		let repeatedMoves = 0;
		for(let i = 0; i < this.allPossibleMovementsHistory.length; i++){
			let isRepeated = this.checkEqualMoves(this.allPossibleMovements, this.allPossibleMovementsHistory[i]);
			
			if(isRepeated){
				repeatedMoves += 1;
			}
		}
		return repeatedMoves;
	}

	checkTie(){
		if(this.movesWithoutCapture >= 50){
			this.openModal('O jogo empatou por quantidade de jogadas sem nenhuma peça ser comida.');
		}
		if(this.checkRepeatedMoves() >= 3){
			this.openModal('O jogo empatou por quantidade de jogadas repetidas.');
		}
	}

	switchTurn(){
		if (this.currentPlayer === 'white') {
			this.currentPlayer = 'black';
        } else {
			this.currentPlayer = 'white';
        }

		this.setAllPossibleMovements();
		this.checkTie();
		this.setAllPossibleMovementsHistory();
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

	hasValidMoves(possibleMoves) {
		for (move of possibleMoves) {
			if (move.piece.color === this.currentPlayer) return true;
		}
		return false;
	}

	isCheck(possibleMoves) {
		for (move of possibleMoves) {
			if (move.attacking === "king") return true;
		}
		return false;
	}

	isCheckmate(possibleMoves) {
		// O Rei deve estar em xeque
		const isKingInCheck = this.isCheck(possibleMoves);
		if (!isKingInCheck) return false;

		// Não deve existir movimentos válidos
		const hasValidMove = this.hasValidMoves(possibleMoves);
		if (hasValidMove) return false;

		// Nesse caso, é Xeque Mate
		return true;
	}

	isStalemate(possibleMoves) {
		// O Rei não pode estar em xeque
		const isKingInCheck = this.isCheck(possibleMoves);
		if (isKingInCheck) return false;

		// Não deve existir movimentos válidos
		const hasValidMove = this.hasValidMoves(possibleMoves);
		if (hasValidMove) return false;

		// Nesse caso, é Stalemate
		return true;
	}

	isOpponent(row, col, color) {
		// verifica se a peça em row, col é inimiga de "color"
		let piece = this.getPiece(row, col);
		if (color && piece)
			return !(piece.color == color);
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

	setAllPossibleMovements(){
		this.allPossibleMovements = []
		pieces.forEach(piece => {
			this.allPossibleMovements = this.allPossibleMovements.concat(piece.getPossibleMovements(this));
		})
		console.log(this.allPossibleMovements);
	}
	
	setAllPossibleMovementsHistory(){
		this.allPossibleMovementsHistory.push(this.allPossibleMovements);
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
		this.switchTurn();

		oldPieceCell.classList.remove("selected");
		selectedCell.classList.remove("selected");

		selectedCell = null;
		oldPieceCell.innerHTML = "";
	}

	drawPossibleMovements(){
		document.querySelectorAll(".possible").forEach(cell => cell.classList.remove("possible"))
		if(selectedPiece){
			let possibleCells = selectedPiece.getPossibleMovements(this)
			possibleCells.forEach(move => {
				this.squares[move.to.row][move.to.col].classList.add("possible")
			})
		}

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
							const _isOpponent = this.isOpponent(row, col, selectedPiece.color);
							if (pieceInCell && _isOpponent && _isValidMove) {
								console.log("teste")
								this.killPiece(row, col);
								this.movesWithoutCapture = 0;
								this.movePiece(row, col);
								pieceInCell = null
							}
							else if (_isValidMove && !pieceInCell) {
								this.movesWithoutCapture += 1;
								this.movePiece(row, col);
							}
						}
						if (selectedCell == target) {
							selectedCell.classList.remove("selected");
							selectedCell = null;
							selectedPiece = null

						} else if (!this.isEmpty(row, col) && pieceInCell) {
							if (pieceInCell.color === "white" && this.currentPlayer === "white" ||
							pieceInCell.color === "black" && this.currentPlayer === "black") {
								target.classList.add("selected")
								
								if (selectedCell && selectedCell !== target) {
									selectedCell.classList.remove("selected");
									selectedPiece = null;
								}
								selectedPiece = pieceInCell;
								selectedCell = target;

							}
						}
						this.drawPossibleMovements()

					};
					
				});
				
				row.appendChild(cell);
				this.squares[i][j] = cell;
			}
			table.appendChild(row);
		}
		this.setAllPossibleMovements();
		this.setAllPossibleMovementsHistory();
		parent.appendChild(table);
	}
}
