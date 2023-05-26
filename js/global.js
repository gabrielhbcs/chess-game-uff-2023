let board = new Board(this);
// let currentPlayer = "black";
let selectedPiece = null;
let selectedCell = null;
let pieces = [
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