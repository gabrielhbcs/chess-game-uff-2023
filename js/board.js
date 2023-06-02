class Board {
	constructor(element) {
		this.element = element
		this.currentPlayer = 'white'
		this.squares = [];
		this.moves = [];
		this.movesWithoutCapture = 0;
		this.allPossibleMovements = [];
		this.allPossibleMovementsHistory = [];
		this.selectedPiece = null;
		this.computer = new ComputerAI()
		this.pieces = [
			new Rook("white", 0, 0),
			new Knight("white", 0, 1),
			new Bishop("white", 0, 2),
			new Queen("white", 0, 3),
			new King("white", 0, 4),
			new Bishop("white", 0, 5),
			new Knight("white", 0, 6),
			new Rook("white", 0, 7),
			new Pawn("white", 1, 0),
			new Pawn("white", 1, 1),
			new Pawn("white", 1, 2),
			new Pawn("white", 1, 3),
			new Pawn("white", 1, 4),
			new Pawn("white", 1, 5),
			new Pawn("white", 1, 6),
			new Pawn("white", 1, 7),

			new Pawn("black", 6, 0),
			new Pawn("black", 6, 1),
			new Pawn("black", 6, 2),
			new Pawn("black", 6, 3),
			new Pawn("black", 6, 4),
			new Pawn("black", 6, 5),
			new Pawn("black", 6, 6),
			new Pawn("black", 6, 7),
			new Rook("black", 7, 0),
			new Knight("black", 7, 1),
			new Bishop("black", 7, 2),
			new Queen("black", 7, 3),
			new King("black", 7, 4),
			new Bishop("black", 7, 5),
			new Knight("black", 7, 6),
			new Rook("black", 7, 7)
		];
		this.selectedCell = null;
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

	checkGameEnd(){
		if(this.isCheckmate() === true){
			console.log('Xequemate');
			console.log(this.currentPlayer)
			console.log(this.allPossibleMovements)
			this.openModal(`O jogo terminou em xequemate de ${this.currentPlayer}.`);
		}
		if(this.movesWithoutCapture >= 50){
			this.openModal('O jogo empatou por quantidade de jogadas sem nenhuma peça ser comida.');
		}
		if(this.checkRepeatedMoves() >= 3){
			this.openModal('O jogo empatou por quantidade de jogadas repetidas.');
		}
		if(this.isStalemate() === true){
			console.log('Stalemate');
			console.log(this.currentPlayer)
			console.log(this.allPossibleMovements)
			this.openModal('O jogo empatou por stalemate.')
		}
	}

	playAI() {
		this.computer.chooseMove(this.allPossibleMovements);
	}

	switchTurn(){
		this.currentPlayer = this.currentPlayer === "white" ? "black" : "white"

		this.setAllPossibleMovements();
		this.checkGameEnd();
		this.setAllPossibleMovementsHistory();
		this.playAI();
	}

	addMove(piece, from, to, target) {
		this.moves.push({ piece: piece, from: from, to: to, target: target });
	}

	isInCheck(color) {
		if(!color) return false;
		let king = this.pieces.find(x => x.type === "king" && x.color === color);
		let enemyPieces = this.pieces.filter(x => x.color != color);
		enemyPieces.forEach(piece => {
			if (piece.isValidMove(king?.row, king?.col, this)) {
				console.log("Move coloca rei em xeque")
				return true;
			}
		})
		return false;
	}

	getLastMove() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
	}

	isEmpty(row, col) {
		for (let piece of this.pieces) {
			if (piece.row === row && piece.col === col) {
				return false;
			};
		};
		return true;
	}

	hasValidMoves() {
		// Retorna true se tiver algum movimento possível para o jogador
		return this.allPossibleMovements.some(move => move.piece.color === this.currentPlayer);
	}

	isCheck() {
		// Retorna true se o rei do jogador está em xeque
		return this.allPossibleMovements.some(move => move.target?.type === 'king');
	}

	isCheckmate() {
		// O rei deve estar em xeque e o jogador não deve possuir movimentos válidos
		return this.isCheck() && !this.hasValidMoves();
	}

	isStalemate() {
		// O rei não deve estar em xeque e o jogador não deve possuir movimentos válidos
		return this.isCheck() && this.hasValidMoves();
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
		for (let piece of this.pieces) {
			if (piece.row === row && piece.col === col) {
				return piece;
			};
		};
		return null;
	}

	killPiece(row, col) {
		const killedPiece = this.getPiece(row, col);
		const filteredPieces = this.pieces.filter((piece) => piece !== killedPiece);

		this.pieces = [ ...filteredPieces ];
		const cell = this.squares[row][col];
		cell.innerHTML = "";
	}

	setAllPossibleMovements(){
		this.allPossibleMovements = this.getAllPossibleMovements().filter(move => {
			const { piece, from, to } = move;
			return piece.isSafeMove(to.row, to.col);
		  });
		//console.log(this.allPossibleMovements)
	}

	getAllPossibleMovements(pseudoPieces = this.pieces){
		return pseudoPieces.flatMap(piece => piece.getPossibleMovements(this, true));
	}

	copyBoard() {
		let newBoard = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		return newBoard;
	}

	setAllPossibleMovementsHistory(){
		this.allPossibleMovementsHistory.push(this.allPossibleMovements);
	}

	movePiece(newRow, newCol) {
		if(this.selectedPiece === null) {
			return;
		}
		const { row, col, color, type } = this.selectedPiece;
		const oldPieceCell = this.squares[row][col];

		//caso da jogada do roque
		if (type === 'king') {
			//movimentação da torre
			if (this.selectedPiece.isValidCastleMove(newRow, newCol)) {
				let castleRook;
				let castleRookCol;
				//caso à esquera
				if (newCol < col) {
					if (this.selectedPiece.color === 'black') castleRook = this.getPiece(7, 0)
					else castleRook = this.getPiece(0, 0)
					castleRookCol = newCol + 1
				}
				//caso à direita
				else {
					if (this.selectedPiece.color === 'black') castleRook = this.getPiece(7, 7)
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
		if (type === 'pawn' && this.selectedPiece.isGoingToPromote(newRow)) {
			this.killPiece(row, col);

			const cellForQueen = this.squares[newRow][newCol];
			cellForQueen.innerHTML = "";

			const newQueen = new Queen(color, newRow, newCol);
			this.pieces.push(newQueen);

			newQueen.draw(cellForQueen);
		} else {
			this.selectedPiece.move(newRow, newCol);
			this.selectedPiece.draw(this.squares[newRow][newCol]);
			this.selectedPiece = null;
		}

		oldPieceCell.classList.remove("selected");
		this.selectedCell.classList.remove("selected");

		this.selectedCell = null;
		oldPieceCell.innerHTML = "";
		this.switchTurn();
	}

	drawPossibleMovements(){
		document.querySelectorAll(".possible").forEach(cell => cell.classList.remove("possible"))
		if(this.selectedPiece){
			let possibleCells = this.selectedPiece.getPossibleMovements(this, true)
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
				cell.id = i.toString() + j.toString();
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

						if (this.selectedCell && this.selectedCell !== target) {
							const _isValidMove = this.selectedPiece.isValidAndSafeMove(row, col, this);
							const _isOpponent = this.isOpponent(row, col, this.selectedPiece.color);
							if (pieceInCell && _isOpponent && _isValidMove) {
								console.log("teste1")
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
						if (this.selectedCell == target) {
							this.selectedCell.classList.remove("selected");
							this.selectedCell = null;
							this.selectedPiece = null

						} else if (!this.isEmpty(row, col) && pieceInCell) {
							if (pieceInCell.color === "white" && this.currentPlayer === "white" ||
							pieceInCell.color === "black" && this.currentPlayer === "black") {
								target.classList.add("selected")

								if (this.selectedCell && this.selectedCell !== target) {
									this.selectedCell.classList.remove("selected");
									this.selectedPiece = null;
								}
								this.selectedPiece = pieceInCell;
								this.selectedCell = target;

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
