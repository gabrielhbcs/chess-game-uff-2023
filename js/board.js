async function getPromotionPiece() {
	const pieceForm = document.getElementById("piece-select");
	let newPieceType = "";
	function waitForEvent(element, eventType) {
		return new Promise(function (resolve) {
			function eventHandler(event) {
				element.removeEventListener(eventType, eventHandler);
				resolve(event);
			}
			element.addEventListener(eventType, eventHandler);
		});
	}
	try {
		const event = await waitForEvent(pieceForm, 'click');
		event.preventDefault();
		const name = event.target.localName;
		if (name === "label") {
			newPieceType = event.target.attributes.for.value;
		} else if (name === "input") {
			newPieceType = event.target.value;
		}
		return newPieceType;
	} catch (error) {
		console.error('Error:', error);
	}
}
class Board {
	constructor(element) {
		this.element = element
		this.currentPlayer = 'white'
		this.squares = [];
		this.state = '';
		this.moves = [];   // Pode ser removido
		this.movesWithoutCapture = 0;
		this.allPossibleMovements = [];
		this.allPossibleMovementsHistory = [];
		this.selectedPiece = null;
		this.computer = new ComputerAI()
		this.pieces = this.createPieces()
		this.selectedCell = null;
		this.createSquares();
		this.isCheckBool = false;
		this.isCheckMateBool = false;
		this.isDrawBool = false;
		this.isStaleMateBool = false;
	}

	// Desenha os squares na tela
	createSquares() {
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

	// Coloca todas as peças no campo para começar um novo jogo
	createPieces() {
		const pieces = [
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
		return pieces;
	}

	// Abre o modal de mensagens do jogo
	openModal(content){
		const modal = document.getElementById("modal");
		const modalText = document.getElementById("modal-text");
		
		modalText.innerHTML = "";
		modalText.innerHTML = content;

		modal.style.display = "block";
	}

	giveUp() {
		console.log('aqui');
		this.openModal('O jogo terminou por que você desistiu.')
	}

	// Fecha o modal de fim de jogo
	closeModal(){
		document.getElementById("modal").style.display = "none";
	}

	// Função de apoio para comparar movimentos no histórico
	checkEqualMoves(moveOne, moveTwo) {
		for (let j = 0; j < moveTwo.length; j++) {
			if (JSON.stringify(moveOne[j]) !== JSON.stringify(moveTwo[j])) {
				return false;
			}
		}
		return true
	}

	// Checa por movimentos repetidos no histórico de jogadas
	checkRepeatedMoves() {
		let repeatedMoves = 0;
		for (let i = 0; i < this.allPossibleMovementsHistory.length; i++) {
			let isRepeated = this.checkEqualMoves(this.allPossibleMovements, this.allPossibleMovementsHistory[i]);

			if (isRepeated) {
				repeatedMoves += 1;
			}
		}
		return repeatedMoves;
	}

	// Checa as condições para encerrar o jogo
	checkGameEnd() {
		switch (this.getState()) {
			case GAMESTATES.WHITECHECK:
				console.log('Peças brancas em Cheque');
				break;
			case GAMESTATES.BLACKCHECK:
				console.log('Peças pretas em Cheque');
				break;
			case GAMESTATES.WHITEMATE || GAMESTATES.BLACKMATE:
				this.openModal(`O jogo terminou. ${this.currentPlayer != COMPUTER_COLOR ? "As máquinas vão dominar o mundo." : "Os seres humanos viverão mais um dia..."}.`);
			case GAMESTATES.WHITEMATE:
				console.log('Peças brancas em Chequemate');
				break;
			case GAMESTATES.BLACKMATE:
				console.log('Peças pretas em Chequemate');
				break;
			case GAMESTATES.STALEMATE:
				console.log('Stalemate');
				break;
			case GAMESTATES.DRAW:
				console.log('Draw');
				break;
			case GAMESTATES.PLAYING:
				break;
			default:
				console.log('Estado desconhecido');
				break;
		}
		if (this.isDrawBool) {
			console.log("Empatou");
		}
		if (this.insufficientMaterial() === true) {
			this.openModal('O jogo empatou por insuficiencia de material.');
		}
		if (this.movesWithoutCapture >= 50) {
			this.openModal('O jogo empatou pela regra dos 50 lances.');
		}
		if (this.isCheckBool) {
			console.log(`Check em ${this.currentPlayer}!`);
		}
	}

	// Faz a jogada da AI
	playAI() {
		if (this.currentPlayer === 'white') {
			this.computer.chooseMove(this.allPossibleMovements, this);
		}
	}

	isDraw() {
		return (this.movesWithoutCapture >= 50 || this.checkRepeatedMoves() >= 3)
	}

	// Muda o estado do jogo
	setState() {
		if (this.isCheckmate())
			this.state = this.currentPlayer == COMPUTER_COLOR ? GAMESTATES.WHITEMATE : GAMESTATES.BLACKMATE;
		else if (this.isCheck())
			this.state = this.currentPlayer == COMPUTER_COLOR ? GAMESTATES.WHITECHECK : GAMESTATES.BLACKCHECK;
		else if (this.isStalemate())
			this.state = GAMESTATES.STALEMATE;
		else if (this.isDraw() === true)
			this.state = GAMESTATES.DRAW;
		else
			this.state = GAMESTATES.PLAYING;
	}

	// Retorna estado atual do jogo
	getState() {
		return this.state
	}

	// Troca de turno e executa os procedimentos de turno
	switchTurn() {
		this.currentPlayer = this.getNextPlayer();
		this.setState();
		this.checkGameEnd();
		this.setAllPossibleMovements();
		this.setAllPossibleMovementsHistory();
		let thisBoard = this;
		if (this.getState() != GAMESTATES.WHITEMATE) {
			setTimeout(function () {
				thisBoard.playAI();
			}, 500);
		}
	}

	// Adiciona um movimento para o histórico de jogadas
	addMove(piece, from, to, target) {
		this.moves.push({ piece: piece, from: from, to: to, target: target });
	}

	// Retorna a jogada mais recente do histórico

	getLastMove() {
		return this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
	}

	// Retorna true se tiver algum movimento possível para o jogador
	hasValidMoves() {
		const playerMoves = this.getAllPlayerMoves(this.currentPlayer, this.pieces, true);
		return playerMoves.some(move => move.piece?.color === this.currentPlayer);
	}

	// Checa se jogador atual está em Xeque
	isCheck() {
		const opponentMoves = this.getAllPlayerMoves(this.getNextPlayer());
		return opponentMoves.some(move => move.target?.type === 'king');
	}

	// O rei deve estar em xeque e o jogador não deve possuir movimentos válidos
	isCheckmate() {
		return this.isCheck() && !this.hasValidMoves();
	}

	// O rei não deve estar em xeque e o jogador não deve possuir movimentos válidos
	isStalemate() {
		return !this.isCheck() && !this.hasValidMoves();
	}

	// Não tem peças o suficiente para realizar um checkmate
	insufficientMaterial() {
		const pieceTypes = this.pieces.map(piece => piece.type);
		if (pieceTypes.length > 4) return false;
		if (pieceTypes.some(piece => piece === 'pawn' || piece === 'queen' || piece === 'rook')) false;
		return true;
	}

	// Checa se na posição tem uma peça do oponente
	isOpponent(row, col, color) {
		let piece = this.getPiece(row, col);
		if (color && piece)
			return !(piece.color == color);
		return false;
	}

	// Checa se na posição tem uma peça do jogador
	isPlayer(row, col, color) {
		let piece = this.getPiece(row, col);
		if (color && piece)
			return (piece.color == color);
		return false;
	}

	// Checa se não tem nenhuma peça na posição
	isEmpty(row, col) {
		for (let piece of this.pieces) {
			if (piece.row === row && piece.col === col) {
				return false;
			};
		};
		return true;
	}

	// Retorna uma string com o nome do próximo jogador
	getNextPlayer() {
		return this.currentPlayer === "white" ? "black" : "white";
	}

	// Retorna um square do campo
	getCell(row, col) {
		return this.squares[row][col];
	}

	// Retorna um objeto do tipo Piece que está nesta posição
	getPiece(row, col) {
		for (let piece of this.pieces) {
			if (piece.row === row && piece.col === col) {
				return piece;
			};
		};
		return null;
	}

	// Remove uma peça do campo
	killPiece(row, col) {
		const killedPiece = this.getPiece(row, col);
		const filteredPieces = this.pieces.filter((piece) => piece !== killedPiece);

		this.pieces = [...filteredPieces];
		const cell = this.squares[row][col];
		cell.innerHTML = "";
	}

	// Retorna todos os movimentos do jogador selecionado
	getAllPlayerMoves(player, allPieces = this.pieces, valid = false) {
		return allPieces
			.filter(piece => piece.color === player)
			.flatMap(piece => piece.getPossibleMovements(this, valid));
	}

	// Retorna todos os movimentos possíveis de ambos jogadores
	getAllPossibleMovements(pseudoPieces = this.pieces) {
		return pseudoPieces.flatMap(piece => piece.getPossibleMovements(this, true));
	}

	// Coloca todas os movimentos válidos na variável de movimentos possíveis
	setAllPossibleMovements() {
		this.allPossibleMovements = this.getAllPossibleMovements();
	}

	// Desenha o campo no console apenas para propósito de testes
	drawBoard() {
		let chessboard = "";
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				const piece = this.getPiece(x, y);
				chessboard += piece ? piece.getPieceEmoji() : "_ ";
			}
			chessboard += "\n";
		}
		console.log(chessboard);
	}

	// Cria uma cópia do campo atual
	copyBoard() {
		let newBoard = Object.assign(new Board(), this);
		return newBoard;
	}

	// Guarda todos os movimentos possíveis desse turno no histórico
	setAllPossibleMovementsHistory() {
		this.allPossibleMovementsHistory.push(this.allPossibleMovements);
	}

	// Responsável por mover a peça e fazer movimentos especiais
	movePiece(newRow, newCol) {
		if (this.selectedPiece === null) {
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
			this.selectedPiece = null;

			const cellForNewPiece = this.squares[newRow][newCol];
			cellForNewPiece.innerHTML = "";

			const modal = document.getElementById("promote-pawn");
			modal.style.display = "block";

			getPromotionPiece().then((promoted) => {
				switch (promoted) {
					case "Queen":
						const newQueen = new Queen(color, newRow, newCol);
						this.pieces.push(newQueen);
						newQueen.draw(cellForNewPiece);
						modal.style.display = "none";
						break;
					case "Bishop":
						const newBishop = new Bishop(color, newRow, newCol);
						this.pieces.push(newBishop);
						newBishop.draw(cellForNewPiece);
						modal.style.display = "none";
						break;
					case "Knight":
						const newKnight = new Knight(color, newRow, newCol);
						this.pieces.push(newKnight);
						newKnight.draw(cellForNewPiece);
						modal.style.display = "none";
						break;
					case "Rook":
						const newRook = new Rook(color, newRow, newCol);
						this.pieces.push(newRook);
						newRook.draw(cellForNewPiece);
						modal.style.display = "none";
						break;
					default:
						break;
				}
				this.clearSelectedPiece(oldPieceCell);
			})
		} else {
			this.selectedPiece.move(newRow, newCol);
			this.selectedPiece.draw(this.squares[newRow][newCol]);
			this.selectedPiece = null;

			this.clearSelectedPiece(oldPieceCell);
		}
	}

	// motivos de IA
	moveOnly(move) {
		if (move.target != null) {
			const killedPiece = this.getPiece(move.to.row, move.to.col);
			this.pieces = this.pieces.filter((piece) => piece !== killedPiece);
		}
		let piece = this.pieces.find(x => x.row === move.from.row && x.col === move.from.col);
		piece.row = move.to.row;
		piece.col = move.to.col;
		
		this.setState();
		this.currentPlayer = this.currentPlayer === COMPUTER_COLOR ? PLAYER_COLOR : COMPUTER_COLOR;
		this.setAllPossibleMovements();
		// this.drawBoard();
	}

	// motivos de IA
	undoMove(move, oldPossibleMovements, oldState) {
		let piece = this.pieces.find(x => x.row === move.to.row && x.col === move.to.col);
		piece.row = move.from.row;
		piece.col = move.from.col;
		
		if (move.target) {
			this.pieces.push(move.target);
		}
		
		this.currentPlayer = this.currentPlayer === COMPUTER_COLOR ? PLAYER_COLOR : COMPUTER_COLOR;
		this.state = oldState;
		this.allPossibleMovements = oldPossibleMovements;
	}

	clearSelectedPiece(oldPieceCell) {
		oldPieceCell.classList.remove("selected");
		this.selectedCell.classList.remove("selected");

		this.selectedCell = null;
		oldPieceCell.innerHTML = "";
		this.switchTurn();
	}

	// Mostra todas as posições que a peça clicada pode tentar mover
	drawPossibleMovements() {
		document.querySelectorAll(".possible").forEach(cell => cell.classList.remove("possible"))
		if (this.selectedPiece) {
			let possibleCells = this.selectedPiece.getPossibleMovements(this, true)
			possibleCells.forEach(move => {
				this.squares[move.to.row][move.to.col].classList.add("possible")
			})
		}
	}

	// Método principal para desenhar elementos na tela
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
								console.log(`${this.selectedPiece.getPieceEmoji()} captura ${pieceInCell.getPieceEmoji()}`)
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

	evalPieceValues(color) {
		let value = 0;
		for (let piece of this.pieces) {
			value += piece.color === color ? piece.pieceValue : -1 * piece.pieceValue;
		}

		return value;
	}

	evalMobilityValues(color) {
		return this.pieces.filter(x => x.color === color).length - this.pieces.filter(x => x.color != color).length;
	}

	evalPawnValues(color) {
		let value = 0;
		let allPawnPieces = this.pieces.filter(x => x.type === "pawn");
		for (let piece of allPawnPieces) {
			if (piece.color === color) {
				value += color === "white" ? 6 - piece.row : piece.row - 1;
			} else {
				value -= color === "white" ? piece.row - 1 : 6 - piece.row;
			}
		}

		return value;
	}
}
