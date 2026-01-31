export function displayDialogue(text, onDisplayEnd) {
    const dialogueBox = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueBox.style.display = "block"

    // Extract plain text for animation (without HTML tags)
    const plainText = text.replace(/<[^>]*>/g, '');
    
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
        if(index < plainText.length) {
            currentText += plainText[index];
            dialogue.textContent = currentText
            index++;
            return;
        }

        // Once animation is done, render the full HTML with links
        dialogue.innerHTML = text;
        clearInterval(intervalRef)
    }, 5); // every 5ms adds a character

    const closeBtn = document.getElementById("close");

    function onCloseBtnClick() {
        onDisplayEnd();
        dialogueBox.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height(); // width and height of the canvas in kaboom
    if(resizeFactor < 1) {
        k.camScale(k.vec2(1))
    } else {
        k.camScale(k.vec2(1.5));
    }
}

export function onRelease(player) {
    if (player.direction === "down") {
        player.play("idle-down");
        return;
    }

    if (player.direction === "up") {
        player.play("idle-up");
        return;
    }
    
    player.play("idle-side");
}