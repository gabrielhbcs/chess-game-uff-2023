class ComputerAI {
    constructor() {
        this.color = "white";
        this.rowListName = ["A", "B", "C", "D", "E", "F", "G", "H"];
    }

    chooseMove(allPossibleMovements, board) {
        let pseudoBoard = board.copyBoard();
        let allComputerMovements = allPossibleMovements.filter(x => x.piece.color === this.color);

        // let movement = allComputerMovements[Math.floor(Math.random() * allComputerMovements.length)];
        // if (!movement) return;

        let init = new Date()
        let movement = this.handleNegamax(pseudoBoard, -Infinity, Infinity, COMPUTER_COLOR);
        let end = new Date();
        let duration = end - init;
        console.log("Levou " + duration / 1000 + " segundos;")
        //this.suggestMove(movement);
        let fromId = this.getRowColId(movement.from.row, movement.from.col);
        let toId = this.getRowColId(movement.to.row, movement.to.col);
        let cellElement = document.getElementById(fromId);
        setTimeout(this.clickBoard, 300, cellElement);
        let targetCellElement = document.getElementById(toId);
        setTimeout(this.clickBoard, 700, targetCellElement);
    }

    clickBoard(cell) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        cell.dispatchEvent(clickEvent);
    }

    getRowColId(row, col) {
        return row.toString() + col.toString();
    }

    suggestMove(movement) {
        console.log("Mova " + movement.piece.type + " em " + this.rowListName[movement.from.col] + ((parseInt(movement.from.row) + 1)) + " to " + this.rowListName[movement.to.col] + ((parseInt(movement.to.row) + 1)));
    }

    compareMoves(moveA, moveB) {
        if ((moveA.target && moveB.target) || (!moveA.target && !moveB.target)) {
            return 0;
        }
        if (moveA.target && !moveB.target) {
            return -1;
        }
        if (!moveA.target && moveB.target) {
            return 1;
        }
    }

    handleNegamax(board, alpha, beta, color) {
        let computerMoves = board.allPossibleMovements.filter(x => x.piece.color === COMPUTER_COLOR);
        computerMoves = computerMoves.sort(this.compareMoves);
        let bestMoves = [computerMoves[0]];
        let bestMoveValue = -Infinity;
        for (let move of computerMoves) {
            let pseudoBoard = board.copyBoard();
            pseudoBoard.moveOnly(move);
            console.log("calculando negamax")
            let v = -this.negamax(pseudoBoard, DEPTH, -beta, -alpha, color === COMPUTER_COLOR ? PLAYER_COLOR : COMPUTER_COLOR);
            if (v >= bestMoveValue) {
                bestMoves.push(move);
                bestMoveValue = v;
            }

            if (bestMoveValue > alpha) {
                alpha = bestMoveValue
            }

            if (alpha > beta) {
                break;
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    negamax(board, depth, alpha, beta, color) {
        let offSet = color === COMPUTER_COLOR ? 1 : -1;

        if (depth == 0) {
            return offSet * this.evalBoard(board);
        }

        if (board.isCheckmate()) {
            console.log("Possível checkmate detectado")
            return -CHECKMATE;
        }
        if (board.isStalemate()) {
            return STALEMATE;
        }
        // ¿donde estás isDraw?
        if (board.isCheck()) {
            return CHECK * offSet * this.evalBoard(board);
        }

        let value = -Infinity;
        let moveList = board.allPossibleMovements.filter(x => x.piece.color != color);
        for (let move of moveList) {
            let pseudoBoard = board.copyBoard();
            pseudoBoard.moveOnly(move);

            let v = -this.negamax(pseudoBoard, depth - 1, -beta, -alpha, color === COMPUTER_COLOR ? PLAYER_COLOR : COMPUTER_COLOR);
            value = Math.max(value, v);
            alpha = Math.max(alpha, value);
            if (alpha > beta) {
                break;
            }
        }

        return value;
    }

    evalBoard(board) {
        let pieceValue = board.evalPieceValues(COMPUTER_COLOR);
        let mobilityValue = board.evalMobilityValues(COMPUTER_COLOR);
        let pawnValue = board.evalPawnValues(COMPUTER_COLOR);

        let boardEvaluation = pieceValue * C1 + mobilityValue * C2 + pawnValue * C3;

        return boardEvaluation;
    }
}
