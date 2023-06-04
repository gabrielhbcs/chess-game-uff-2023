class ComputerAI {
    constructor() {
        this.color = "white";
        this.rowListName = ["A", "B", "C", "D", "E", "F", "G", "H"];
    }

    chooseMove(allPossibleMovements) {
        let allComputerMovements = allPossibleMovements.filter(x => x.piece.color === this.color);

        let movement = allComputerMovements[Math.floor(Math.random() * allComputerMovements.length)];
        if (!movement) return;
        //console.log(movement)

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
        //console.log(Date.now())
        cell.dispatchEvent(clickEvent);
    }

    getRowColId(row, col) {
        return row.toString() + col.toString();
    }

    suggestMove(movement) {
        console.log("Mova " + movement.piece.type + " em " + this.rowListName[movement.from.col] + ((parseInt(movement.from.row) + 1)) + " to " + this.rowListName[movement.to.col] + ((parseInt(movement.to.row) + 1)));
    }
}
