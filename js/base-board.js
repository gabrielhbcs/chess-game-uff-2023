/*
	Essa classe serve de base para Board. Ela contem apenas os métodos necessários para
	poder simular jogadas simples e só deve ser instanciada para isso.

	Use o método destroy() para remover da memória e poupar espaço.
*/

export default class BaseBoard{
    constructor(element){
		this.element = element;
        this.pieces = pieces;
        this.currentPlayer = currentPlayer;
		this.selectedPiece = null;
        this.moves = [];
    }

	// Adiciona um movimento ao histórico de movimentos
    addMove(piece, from, to, target) {
		this.moves.push({ piece: piece, from: from, to: to, target: target });
	}

	// Tenta o move e testa se é seguro
	trySafeMove(move){
		if (!this.tryMove(move)) return false;
		if (isCheck) return false;
		return true;
	}

	// Checa se está em Xeque
	isCheck(){
		const opponentMoves = this.getAllOpponentMoves();
		return opponentMoves.some(move => move.target?.type === 'king');
	}

	// Move uma peça no campo sem fazer outras checagens
    tryMove(move){
		// Pega os movimentos válidos da peça
		const validMoves = move.piece.getValidMoves(this);
		// Checa se o movimento desejado pertence a lista de movimentos válidos
		if (validMoves.some(possibleMove => possibleMove === move)){
			// Seleciona a peça e move ela
			this.selectedPiece = this.getPiece(move.from.row, move.from.col);
			this.selectedPiece.move(move.to.row, move.to.col, this);
			// Se tinha uma peça no destino, remove ela
			if (move.target !== null){
				this.pieces = this.pieces.filter(piece => piece !== move.target)
			}
			this.selectedPiece = null;
			// Movimento feito com sucesso!
			return true;
		}
		// Não foi possível fazer o movimento...!
		return false;
    }

	// Manualmente coloque as peças no campo
	setPieces(newPieces){
		this.pieces = [...newPieces];
	}

	// Manualmente muda o jogador para o propósito de simular jogadas
	setCurrentPlayer(player){
		this.currentPlayer = player;
	}

	// Retorna um array contendo todos os movimentos possíveis do oponente
    getAllOpponentMoves(pseudoPieces = this.pieces){
		return pseudoPieces
			.filter(piece => piece.color !== this.currentPlayer)
			.flatMap(piece => piece.getValidMovements(this));
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

	// Checa se na posição tem uma peça do jogador
	isPlayer(row, col, color){
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

	// Desenha o campo no console apenas para propósito de testes
	drawBoard() {
		let result = "";
		for (let x = 0; x < 8; x++) {
		  for (let y = 0; y < 8; y++) {
			const piece = this.getPiece(x, y);
			draw += piece ? piece.getPieceEmoji() : "_ ";
		  }
		  draw += "\n";
		}
		console.log(result);
	}

	// Remove todas as peças do campo
	clearPieces(){
		this.pieces = [];
	}

	// Limpa o histórico de movimentos
	clearMoves(){
		this.moves = [];
	}

	// Destroi o campo após não precise mais dele
    destroy(){
        this = null;
    }
}
