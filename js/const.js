const COMPUTER_COLOR = "white"
const PLAYER_COLOR = "black"

const DEPTH = 1;

// Pesos
const C1 = 12;
const C2 = 1;
const C3 = 3;

const STALEMATE = 0;
const DRAW = 0;
const CHECK = 2
const CHECKMATE = (CHECK * ((C1*103) + (C2*215) + (C3*48))) + 1;