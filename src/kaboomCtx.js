import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    touchToMouse: true, // treat touch events as mouse events on touch screens like mobiles
    canvas: document.getElementById("gameCanvas"), // specify the canvas element to use
})