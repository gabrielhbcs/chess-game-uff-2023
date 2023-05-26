class States {
    constructor(){
        this.currentPlayer = 'white';
    }

    switchTurn(){
        if (this.currentPlayer === 'white') {
            this.currentPlayer = 'black';
        } else {
            this.currentPlayer = 'white';
        }
    }

    getCurrentPlayer(){
        return this.currentPlayer;
    }

    getValidMoves(){
        //retorna as possiveis jogadas tanto para preto quanto branco
    }
    
    isCheck(){
        //retorna se preto ou branco estão em check
    }

    isCheckMate(){
        //retorna se preto ou branco estão em checkmate
    }

    isGameDrawn(){
        //faz um calculo de acordo com o historico de jogadas e diz se ocorreu um empate
    }
}