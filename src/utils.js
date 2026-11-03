export function displayDialogue(text, onDisplayEnd) {
    const dialogueBox = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueBox.style.display = "block"

    // Extract plain text for animation (without HTML tags)
    const plainText = text.replace(/<[^>]*>/g, '');
    
    let index = 0;
    let currentText = "";
    let timeoutRef = null;
    let isClosed = false;

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

        timeoutRef = setTimeout(() => {
            if (!isClosed) {
                closeDialogue();
            }
        }, 10000);
    }, 5); // every 5ms adds a character

    const closeBtn = document.getElementById("close");

    function closeDialogue() {
        if (isClosed) return;
        isClosed = true;
        onDisplayEnd();
        dialogueBox.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        if (timeoutRef) clearTimeout(timeoutRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
        document.removeEventListener("keydown", onEnterKey);
    }

    function onCloseBtnClick() {
        closeDialogue();
    }

    function onEnterKey(e) {
        if (e.key === "Enter") {
            closeDialogue();
        }
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
    document.addEventListener("keydown", onEnterKey);
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