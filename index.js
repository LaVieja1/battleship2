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

const cpuAttackHitLocation = { x: null, y: null, tried: 0 };

function checkCoordinateValidity(gameboard, item, x, y, isRotated) {
    const shipLength = item.getShipLength();
    if (gameboard.getBoardArray()[x][y] !== "ocean") {
        return false;
    }

    if (isRotated) {
        if (x + shipLength - 1 > 9) {
            return false;
        } else {
            for (let i = -1; i <= shipLength; i++) {
                if (
                    gameboard.getBoardArray()[x + i < 0 || x + i > 9 ? x : x + i][
                        y + 1 > 9 ? y : y + 1
                    ] !== "ocean" ||
                    gameboard.getBoardArray()[x + i < 0 || x + i > 0 ? x : x + i][y] !==
                        "ocean" ||
                    gameboard.getBoardArray()[x + i < 0 || x + i > 9 ? x : x + i][
                        y - 1 < 0 ? y : y - 1
                    ] !== "ocean"
                ) {
                    return false;
                }
            }
        }
    } else {
        if  (y + shipLength - 1 > 9) {
            return false;
        } else {
            for (let i = -1; i <= shipLength; i++) {
                if (
                  gameboard.getBoardArray()[x + 1 > 9 ? x : x + 1][
                    y + i < 0 || y + i > 9 ? y : y + i
                  ] !== "ocean" ||
                  gameboard.getBoardArray()[x][y + i < 0 || y + i > 9 ? y : y + i] !==
                    "ocean" ||
                  gameboard.getBoardArray()[x - 1 < 0 ? x : x - 1][
                    y + i < 0 || y + i > 9 ? y : y + i
                  ] !== "ocean"
                ) {
                  return false;
            }
          }
        }
    }

    return true;
}

function positioningOfShips(gb, ships) {
    function randomizeStuff() {
        let xRandom = Math.floor(Math.random() * 10);
        let yRandom = Math.floor(Math.random() * 10);
        let rotationRandom = !!Math.floor(Math.random() * 2);
        return { xRandom, yRandom, rotationRandom };
    }

    ships.forEach((item) => {
        let isValid = false;
        let {
            xRandom: x,
            yRandom: y,
            rotationRandom: isRotated,
        } = randomizeStuff();
        while (!isValid) {
            if (checkCoordinateValidity(gb, item, x, y, isRotated)) {
                isValid = true;
            } else {
                ({
                    xRandom: x,
                    yRandom: y,
                    rotationRandom: isRotated,
                } = randomizeStuff()); 
            }

            item.getShipLength();
        }
        gb.setShipCoordinates(item, x, y, isRotated);
    });
}

function gameLoop() {
    const main = document.querySelector("main");
    main.classList.remove("main-element");
    main.classList.add("game-main");
    const playerTablePlaceholder = document.createElement("div");
    const cpuTablePlaceholder = document.createElement("div");

    playerTablePlaceholder.dataset.name = "La computadora esta atacando...";
    cpuTablePlaceholder.dataset.name = "El jugador esta atacando...";

    if (!document.querySelector(".game-status")) {
        const gameStatus = document.createElement("div");
        gameStatus.className = "game-status";
        gameStatus.textContent = "Tu turno";
        main.append(gameStatus);
    } else {
        const gameStatus = document.querySelector(".game-status");
        gameStatus.textContent = `${isPlayerTurn ? "Tu" : "CPU"} turno.`;
    }

    playerTablePlaceholder.classList.add(
        "table-placeholder",
        "placeholder-player"
    );
    cpuTablePlaceholder.classList.add("table-placeholder", "placeholder-cpu");

    if (isPlayerTurn) {
        cpuTablePlaceholder.classList.add("turn");
    } else playerTablePlaceholder.classList.add("turn");

    main.append(playerTablePlaceholder, cpuTablePlaceholder);

    const playerTable = document.createElement("table");
    const cpuTable = document.createElement("table");

    playerTable.classList.add("table-player");
    cpuTable.classList.add("table-cpu");

    function generateTable(placeholder, gb, table) {
        let i = 0;
        gb.getBoardArray().forEach((row) => {
            let j = 0;
            const tableRow = document.createElement("tr");
            table.append(tableRow);
            row.forEach((ele) => {
                const data = document.createElement("td");

                if (table.classList.contains("table-player")) {
                    if (
                        gb.getBoardArray()[i][j] &&
                        typeof gb.getBoardArray()[i][j] === "object"
                    ) {
                        data.classList.add("occupied");
                    }
                }

                if (gb.getBoardArray()[i][j] === "miss") {
                    data.classList.add("miss");
                } else if (gb.getBoardArray()[i][j].isSunk) {
                    data.classList.add("sunk");
                } else if (gb.getBoardArray()[i][j].isHit) {
                    data.classList.add("hit");
                }

                if (isPlayerTurn && table.classList.contains("table-cpu")) {
                    data.addEventListener("click", (e) => {
                        tileClickEvent(e, gb);
                    });
                }
                data.dataset.x = i;
                data.dataset.y = j;
                tableRow.append(data);
                j++;
            });
            i++;
        });
        placeholder.append(table);
    }

    generateTable(playerTablePlaceholder, playerGB, playerTable);
    generateTable(cpuTablePlaceholder, cpuGB, cpuTable);

    if (!isPlayerTurn) {
        cpuAttack(playerGB);
    }
}

function cpuAttack(gb) {
    const gameStatus = document.querySelector(".game-status");

    function randomCoordinate() {
        return Math.floor(Math.random() * 10);
    }

    let xCpuAttack;
    let yCpuAttack;
    let isValidCoordinate = false;

    if (
        typeof cpuAttackHitLocation.x === "number" &&
        typeof cpuAttackHitLocation.y === "number"
    ) {
        const chance = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        while (!isValidCoordinate) {
            const chanced = chance[cpuAttackHitLocation.tried];
            cpuAttackHitLocation.tried = cpuAttackHitLocation.tried + 1;
            xCpuAttack = cpuAttackHitLocation.x + chance[0];
            yCpuAttack = cpuAttackHitLocation.y + chance[1];

            if (cpuAttackHitLocation.tried >= 4) {
                cpuAttackHitLocation.tried = 0;
                xCpuAttack = randomCoordinate();
                yCpuAttack = randomCoordinate();
            }
            isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
        }
    } else {
        xCpuAttack = randomCoordinate();
        yCpuAttack = randomCoordinate();
        isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
        while (!isValidCoordinate) {
            xCpuAttack = randomCoordinate();
            yCpuAttack = randomCoordinate();
            isValidCoordinate = checkAttackValidity(gb, xCpuAttack, yCpuAttack);
        }
    }

    const attackInfo = gb.receiveAttack(xCpuAttack, yCpuAttack);

    if (attackInfo === "miss") {
        hitMissEvent(xCpuAttack, yCpuAttack, attackInfo);
        gameStatus.textContent = `${
            isPlayerTurn ? "Jugador" : "CPU"
        } atacó ${`${+xCpuAttack + 1}${String.fromCharCode(
            +yCpuAttack + 65
        )}`}. Fue un fallo.`;
        isPlayerTurn = !isPlayerTurn;
    } else if (attackInfo === "hit") {
        cpuAttackHitLocation.x = xCpuAttack;
        cpuAttackHitLocation.y = yCpuAttack;
        cpuAttackHitLocation.tried = 0;
        hitMissEvent(xCpuAttack, yCpuAttack, attackInfo);
        gameStatus.textContent = `${
            isPlayerTurn ? "Jugador" : "CPU"
        } atacó ${`${+xCpuAttack + 1}${String.fromCharCode(
            +yCpuAttack + 65
        )}`}. Fue un acierto.`;
        isPlayerTurn = !!isPlayerTurn;
    } else {
        cpuAttackHitLocation.x = null;
        cpuAttackHitLocation.y = null;
        cpuAttackHitLocation.tried = 0;
        isGameOver = sinkingEvent(xCpuAttack, yCpuAttack, gb);
        isPlayerTurn = !!isPlayerTurn;
    }

    const tablePlaceholders = document.querySelectorAll(".table-placeholder");

    if (isGameOver) {
        tablePlaceholders.forEach((item) => {
            item.classList.remove("turn");
        });
        gameOverEvent("player");
    } else {
        if (isPlayerTurn) {
            setTimeout(() => {
                tablePlaceholders[1].classList.add("turn");
                document
                    .querySelectorAll(".table-placeholder")
                    .forEach((item) => item.remove());
                gameLoop();
            }, 1500);
        } else {
            setTimeout(() => {
                tablePlaceholders.forEach((item) => {
                    item.classList.remove("turn");
                });
                tablePlaceholders[0].classList.add("turn");
                document
                    .querySelectorAll(".table-placeholder")
                    .forEach((item) => item.remove());
                gameLoop();
            }, 2000);
        }
    }
}
