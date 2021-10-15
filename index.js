import { gameBoard } from "./gameBoard";
import { ship } from "./ship";

const playerGB = gameBoard();
const cpuGB = gameBoard();

let playerShips = [
    ship("Carrier", 5),
    ship("Battleship", 4),
    ship("Destroyer", 3),
    ship("Submarine", 3),
    ship("Patrol Boat", 2),
];
let cpuShips = [
    ship("Carrier", 5),
    ship("Battleship", 4),
    ship("Destroyer", 3),
    ship("Submarine", 3),
    ship("Patrol Boat", 2),
];

let isGameOver = false;
let isPlayerTurn = true;