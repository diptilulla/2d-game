import { dialogueData, scalefactor, scaleFactorCat } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, onRelease, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 960,
    "walk-down": {
      from: 960,
      to: 963,
      loop: true,
      speed: 8
    },
    "idle-side": 999,
    "walk-side": {
      from: 999,
      to: 1002,
      loop: true,
      speed: 8
    },
    "idle-up": 1038,
    "walk-up": {
      from: 1038,
      to: 1041,
      loop: true,
      speed: 8 
    }
  }
});

k.loadSprite("cat", "./cat.png", {
  sliceX: 10,
  sliceY: 1,
  anims: {
    "idle": {
      from: 0,
      to: 9,
      loop: true,
      speed: 8
    }
  }
});

k.loadSprite("map", "./mymap.png");

k.setBackground(k.Color.fromHex("#7d5204"));

k.scene("main", async () => { // to get map.json data
  // logic for scene
  const mapdata = await (await fetch("./mymap.json")).json();
  const layers = mapdata.layers;

  const map = k.add([ // to create a game object
    k.sprite("map"), // key from loadSprite
    k.pos(0), // position at (0, 0)
    k.scale(scalefactor), // scale up by scalefactor
  ]);

  const player = k.make([ // to create a game object
    k.sprite("spritesheet", { anim: "idle-down" }), // key from loadSprite, default animation
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10) // small rectangle (x, y, width, height), smaller than sprite size for the character which is 16x16
    }), // for collision detection
    k.body(), // for gravity and jumping, makes character a tangible object
    k.anchor("center"), // anchor at center, by default it's at top-left when drawing the sprite
    k.pos(), // initial position
    k.scale(scalefactor), // scale up by scalefactor
    {
      speed: 250, // custom property for player speed in pixels per second
      direction: "down",
      isInDialogue: false, // custom property to track if player is in dialogue, we dont want the character to move during dialogue
    },
    "player", // tag to identify the player object
  ]);

  const cat = k.make([ // to create a game object
    k.sprite("cat", { anim: "idle" }), // key from loadSprite, default animation
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10) // small rectangle (x, y, width, height), smaller than sprite size for the character which is 16x16
    }), // for collision detection
    k.body(), // for gravity and jumping, makes character a tangible object
    k.anchor("center"), // anchor at center, by default it's at top-left when drawing the sprite
    k.pos(), // initial position
    k.scale(scaleFactorCat), // scale up by scalefactor
    {
      speed: 250, // custom property for player speed in pixels per second
    },
    "cat", // tag to identify the player object
  ]);

  player.onCollide("cat", () => {
  player.stop();
  player.isInDialogue = true;
  displayDialogue(dialogueData["cat"], () => {
    player.isInDialogue = false;
    k.canvas.focus();
    })
  });

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([ // add child object to map
          k.area({
            shape: new k.Rect(k.vec2(0, 0), boundary.width, boundary.height) // coordinates of hit object relative to child object which is what we are creating here
          }),
          k.body({ isStatic: true }), // static body, so that it doesn't move when collided with, character won't be able to pass through
          k.pos(boundary.x, boundary.y),
          boundary.name, // tag to identify boundary objects
        ]);

        if(boundary.name) {
          player.onCollide(boundary.name, () => { // want to detect collision with boundary objects
            player.stop();
            player.isInDialogue = true;
            console.log(boundary.name)
            displayDialogue(dialogueData[boundary.name], () => {
              player.isInDialogue = false;
              // onRelease(player);
              k.canvas.focus();
            })
          });
        }
      }
      continue;
    }

    if(layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scalefactor,
            (map.pos.y + entity.y) * scalefactor
          );
          k.add(player);
          continue;
        }
        if (entity.name === "cat") {
          cat.pos = k.vec2(
            (map.pos.x + entity.x) * scalefactor,
            (map.pos.y + entity.y) * scalefactor
          );
          k.add(cat);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  player.isInDialogue = true;
  displayDialogue(
    "Hi! Welcome to my corner of the internet! I’m Dipti, a developer, aspiring product leader and creative exploring the intersection of technology, business and design. Come take a look around!",
    () => {
      player.isInDialogue = false;
      k.canvas.focus();
    }
  );

  k.onResize(() => {
    setCamScale(k)
  })

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100); // set camera position at these coordinates
  })

  k.onMouseDown((mouseBtn) => {
    if(mouseBtn !== "left" || player.isInDialogue)
      return;
    
    const worldMousePos = k.toWorld(k.mousePos()); // bcz we are using a camera, mouse pos will be acc to canvas and not acc to world bcz world is much more than what is visible than what is being seen by camera
    player.moveTo(worldMousePos, player.speed);
  
    const mouseAngle = player.pos.angle(worldMousePos) // to get angle between player and mouse position

    const lowerBound = 50;
    const upperBound = 125;

    if(
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if(
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false; // if we had changed the flip due to some other animation, we revert it back
      if(player.curAnim() !== "walk-side")
        player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true; // if we had changed the flip due to some other animation, we revert it back
      if(player.curAnim() !== "walk-side")
        player.play("walk-side");
      player.direction = "left";
      return;
    }
  })

  k.onKeyDown("a", () => {
    console.log({'a':'a', isInDialogue: player.isInDialogue})
    if(player.isInDialogue)
      return;
    player.move(-player.speed, 0);
    player.flipX = true; // if we had changed the flip due to some other animation, we revert it back
    if(player.curAnim() !== "walk-side")
      player.play("walk-side");
    player.direction = "left";
  });

  k.onKeyDown("d", () => {
    if(player.isInDialogue)
      return;
    player.move(player.speed, 0);
    player.flipX = false; // if we had changed the flip due to some other animation, we revert it back
    if(player.curAnim() !== "walk-side")
      player.play("walk-side");
    player.direction = "right";
  });

  k.onKeyDown("w", () => {
    if(player.isInDialogue)
      return;
    player.move(0, -player.speed);
    if (player.curAnim() !== "walk-up") {
      player.play("walk-up");
      player.direction = "up";
    }
  });

  k.onKeyDown("s", () => {
    if(player.isInDialogue)
      return;
    player.move(0, player.speed);
    if (player.curAnim() !== "walk-down") {
      player.play("walk-down");
      player.direction = "down";
    }
  });

  const moveWithArrowKey = (key) => {
    if(player.isInDialogue)
      return;

    if (key === "ArrowLeft" || key === "left") {
      player.move(-player.speed, 0);
      player.flipX = true;
      if(player.curAnim() !== "walk-side")
        player.play("walk-side");
      player.direction = "left";
      return;
    }

    if (key === "ArrowRight" || key === "right") {
      player.move(player.speed, 0);
      player.flipX = false;
      if(player.curAnim() !== "walk-side")
        player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (key === "ArrowUp" || key === "up") {
      player.move(0, -player.speed);
      if (player.curAnim() !== "walk-up") {
        player.play("walk-up");
        player.direction = "up";
      }
      return;
    }

    if (key === "ArrowDown" || key === "down") {
      player.move(0, player.speed);
      if (player.curAnim() !== "walk-down") {
        player.play("walk-down");
        player.direction = "down";
      }
    }
  };

  k.onKeyDown("left", () => moveWithArrowKey("left"));
  k.onKeyDown("right", () => moveWithArrowKey("right"));
  k.onKeyDown("up", () => moveWithArrowKey("up"));
  k.onKeyDown("down", () => moveWithArrowKey("down"));

  k.onMouseRelease(() => onRelease(player));
  k.onKeyRelease("a", () => onRelease(player));
  k.onKeyRelease("d", () => onRelease(player));
  k.onKeyRelease("w", () => {
    console.log("rls")
    onRelease(player)});
  k.onKeyRelease("s", () => onRelease(player));
  k.onKeyRelease("left", () => onRelease(player));
  k.onKeyRelease("right", () => onRelease(player));
  k.onKeyRelease("up", () => onRelease(player));
  k.onKeyRelease("down", () => onRelease(player));
})

k.go("main"); // start game at main scene