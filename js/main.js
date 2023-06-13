window.onload = function() {
	board.draw(document.getElementById("board"));

	// Criar as peças e adicioná-las ao tabuleiro
	for (let piece of board.pieces) {
		let square = board.squares[piece.row][piece.col];
		piece.draw(square);
	}

	board.playAI();
}
