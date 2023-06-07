window.onload = function() {
	board.draw(document.getElementById("board"));

	// Criar as peças e adicioná-las ao tabuleiro
	for (let piece of board.pieces) {
		let square = board.squares[piece.row][piece.col];
		piece.draw(square);
	}

	// declarar funçao de desistir
	const giveUpBtn = document.querySelector('nav').lastElementChild;
	giveUpBtn.addEventListener('click', (e) => {
		e.preventDefault();
		alert('perdeu baibe');
	})
	board.playAI();
}
