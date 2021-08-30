# _INVADERS

> Submission for [JS13kGames 2021](http://js13kgames.com/).

`_INVADERS` is Space Invaders-inspired game in 3D, in which you must stop endless waves of outer space monsters from invading Earth.

## Gameplay
- Defeat endless waves of monsters in a confined space.
- Start with 3 lifes (dots on the top-left of the screen), but similar to Space Invaders, the game ends immediately if the monsters reach the space behind you.
- 3 types of monsters:
  - Flier class: Same as aliens in Space Invaders - move left and right as a group, shifting forward when reaching the edge. Red-eyed ones shoot projectiles.
  - Walker class: Only move forward. Red-eyed ones shoot projectiles.
  - Laser class: Do not move, but shoot fast-moving blue projectiles.
- Mini-boss encounter (with 4 variations) on every 5th wave. You refill 2 lifes when completing the wave.

## Controls
Mouse and Keyboard:
- Move: Arrow Keys / WASD
- Rotate View: Mouse Move
- Attack: LMB / ENTER / E

Touch Screen:
- Move: Drag left side of screen
- Rotate View: Drag right side of screen
- Attack: Press A (onscreen button)

Gamepad (only tested with Xbox, but other controllers should work):
- Move: Left stick
- Rotate View: Right stick
- Attack: RT / A

> Tips:
> - You can press and hold the Attack button/key to keep shooting.
> - On touch screen, you can press A and drag around to adjust the view while shooting.

## Web Monetization Exclusives
Subscribers should see the [Coil](https://coil.com/) icon (𝒞) at the bottom-right corner of the screen. They will get:
- an extra life
- the exclusive `Tesla Coil` weapon, which shoots slightly larger projectiles!

## Optional Decentralized Features
- The game itself is hosted on IPFS: (TODO)
- Click the camera icon (📷) at the bottom-left corner of the screen to take an in-game screenshot that is hosted on IPFS!

## Browser Support
- Latest Desktop Chrome, Firefox, Edge, or Safari with WebGL 1.0 enabled
- Latest Android Browser, Android Chrome or iOS Safari
- [ANGLE_instanced_arrays](https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays) and [OES_standard_derivatives](https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives) WebGL extensions are required for the game to work.

## Running
To build the 13KB zip bundle:

```
npm install && npm build
```

To run the dev server locally:

```
npm start
```

You can reach the dev server at http://localhost:8080
