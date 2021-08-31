import { clamp, quat, vec3, Vec3 } from 'munum';
import { GAMEPAD_MOVE_THRESHOLD, TOCUH_MOVE_THRESHOLD } from '../const';

const TWO_PI = 2 * Math.PI;

const tmpQuat = quat.create();

export enum Action {
  None = 0,
  L = 1 << 0,
  R = 1 << 1,
  U = 1 << 2,
  D = 1 << 3,
  A = 1 << 4,
  B = 1 << 5,
}

/**
 * FPS contoller using pointer lock for desktop, touch for mobile.
 */
export class FpsControl {
  public touch: boolean = false;
  public paused: boolean = true;
  public dir: Vec3 = vec3.create();
  public rotX!: number;
  public rotY!: number;
  public atk!: boolean;
  private action!: Action;
  private touches: Record<number, [x: number, y: number]> = {};
  private touchTypes: Record<number, number> = {};

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly atkBtn: HTMLElement,
    /** Angular speed */
    public w: number = TWO_PI / 4
  ) {
    this.reset();
    document.addEventListener('pointerlockchange', this.lock);
  }

  /**
   * Start taking over the controls.
   */
  public start(): void {
    if (!this.paused) { return; }
    if (this.touch) {
      this.touchCtrl(true);
      document.body.requestFullscreen?.();
      this.paused = false;
    } else {
      this.canvas.requestPointerLock();
    }
  }

  /**
   * Pause controls.
   */
  public pause(): void {
    if (this.touch) {
      this.touchCtrl(false);
    } else {
      document.exitPointerLock();
    }
  }

  /**
   * Reset control states.
   */
  public reset(): void {
    this.pause();
    this.paused = true;
    this.rotX = -(this.rotY = TWO_PI / 2) / 12;
    this.atk = false;
    this.action = Action.None;
  }

  /**
   * Process control inputs.
   */
  public update(): void {
    const action = this.paused ? Action.None : (this.action | processGamepad(this));
    this.atk = !!(action & Action.A);
    this.dir[0] = (action & Action.L ? 1 : 0) + (action & Action.R ? -1 : 0);
    this.dir[2] = (action & Action.D ? -1 : 0) + (action & Action.U ? 1 : 0);
    this.dir[1] = 0;
    quat.rotateVec3(this.dir, quat.rotateY(this.rotY, tmpQuat), this.dir);
  }

  /**
   * Set X/Y rotations.
   */
  public rot(x: number, y: number): void {
    this.rotY = clamp((this.rotY - x * this.w + TWO_PI) % TWO_PI, TWO_PI / 8 * 3, TWO_PI / 8 * 5);
    this.rotX = clamp(this.rotX + y * this.w, -TWO_PI / 8, TWO_PI / 48);
  };

  private touchCtrl(enable: boolean): void {
    this.atkBtn.hidden = enable;
    const addOrRemoveAttack = (enable ? this.atkBtn.addEventListener : this.atkBtn.removeEventListener).bind(this.atkBtn);
    const addOrRemoveCanvasTouch = (enable ? addEventListener : removeEventListener);
    addOrRemoveAttack('touchstart', this.attackdown);
    addOrRemoveAttack('touchend', this.attackup);
    addOrRemoveCanvasTouch('touchstart', this.touchstart);
    addOrRemoveCanvasTouch('touchend', this.touchend);
    addOrRemoveCanvasTouch('touchmove', this.touchmove);
  }

  private lock = (): void => {
    const fn = (this.paused = document.pointerLockElement !== this.canvas) ? removeEventListener : addEventListener;
    fn('mousemove', this.mousemove);
    fn('mousedown', this.mousedown);
    fn('mouseup', this.mouseup);
    fn('keydown', this.keydown);
    fn('keyup', this.keyup);
  };

  private mousemove = (e: MouseEvent): void => {
    this.rot(e.movementX / innerWidth, e.movementY / innerHeight);
  };

  private mousedown = (e: MouseEvent): void => {
    e.preventDefault();
    if (e.button === 0) {
      this.action = this.action | Action.A;
    }
  };

  private mouseup = (e: MouseEvent): void => {
    e.preventDefault();
    if (e.button === 0) {
      this.action = this.action & ~Action.A;
    }
  };

  private touchmove = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const touch = e.changedTouches.item(i)!;
      const touchType = this.touchTypes[touch.identifier];
      if (!touchType) { continue; }

      const touchPoint = this.touches[touchType];
      const horizontal = (touch.clientX - touchPoint[0]) / innerWidth;
      const vertical = (touch.clientY - touchPoint[1]) / innerHeight;
      if (touchType === 1) {
        this.action = this.action & ~(Action.L | Action.R | Action.U | Action.D);
        if (horizontal < -TOCUH_MOVE_THRESHOLD) {
          this.action = this.action | Action.L;
        } else if (horizontal > TOCUH_MOVE_THRESHOLD) {
          this.action = this.action | Action.R;
        }
        if (vertical < -TOCUH_MOVE_THRESHOLD) {
          this.action = this.action | Action.U;
        } else if (vertical > TOCUH_MOVE_THRESHOLD) {
          this.action = this.action | Action.D;
        }
      } else {
        this.rot(horizontal, vertical);
        touchPoint[0] = touch.clientX;
        touchPoint[1] = touch.clientY;
      }
    }
  };

  private touchstart = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const touch = e.changedTouches.item(i)!;
      const touchType = touch.clientX / innerWidth < 0.5 ? 1 : 2;
      if (!this.touches[touchType]) {
        this.touches[touchType] = [touch.clientX, touch.clientY];
        this.touchTypes[touch.identifier] = touchType;
      }
    }
  };

  private touchend = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; ++i) {
      const id = e.changedTouches.item(i)!.identifier;
      const touchType = this.touchTypes[id];
      if (touchType) {
        if (touchType === 1) {
          this.action = this.action & ~(Action.L | Action.R | Action.U | Action.D);
        }
        delete this.touches[touchType];
        delete this.touchTypes[id];
      }
    }
  };

  private attackdown = (e: Event): void => {
    e.preventDefault();
    this.action = this.action | Action.A;
  };

  private attackup = (e: Event): void => {
    e.preventDefault();
    this.action = this.action & ~Action.A;
  };

  private keydown = (e: KeyboardEvent): void => {
    e.preventDefault();
    this.action = this.action | mapKeyToAction(e.key);
  }

  private keyup = (e: KeyboardEvent): void => {
    e.preventDefault();
    this.action = this.action & ~mapKeyToAction(e.key);
  }
}

function mapKeyToAction(key: string): Action {
  switch (key) {
    case 'ArrowUp': case 'w': return Action.U;
    case 'ArrowDown': case 's': return Action.D;
    case 'ArrowLeft': case 'a': return Action.L;
    case 'ArrowRight': case 'd': return Action.R;
    case 'Enter': case 'e': return Action.A;
  }
  return Action.None;
}

function processGamepad(control: FpsControl): Action {
  const gamepad = navigator.getGamepads?.()[0];
  let gamepadAction = Action.None;

  if (gamepad) {
    if (gamepad.buttons[0]?.pressed || gamepad.buttons[7]?.pressed) {
      gamepadAction = gamepadAction | Action.A;
    }

    let horizontal = gamepad.axes[0] || 0;
    let vertical = gamepad.axes[1] || 0;
    if (horizontal < -GAMEPAD_MOVE_THRESHOLD) {
      gamepadAction = gamepadAction | Action.L;
    } else if (horizontal > GAMEPAD_MOVE_THRESHOLD) {
      gamepadAction = gamepadAction | Action.R;
    }
    if (vertical < -GAMEPAD_MOVE_THRESHOLD) {
      gamepadAction = gamepadAction | Action.U;
    } else if (vertical > GAMEPAD_MOVE_THRESHOLD) {
      gamepadAction = gamepadAction | Action.D;
    }

    horizontal = gamepad.axes[2] || 0;
    vertical = gamepad.axes[3] || 0;
    control.rot(
      Math.abs(horizontal) > GAMEPAD_MOVE_THRESHOLD ? -horizontal / 200 : 0,
      Math.abs(vertical) > GAMEPAD_MOVE_THRESHOLD ? vertical / 200 : 0
    );
  }

  return gamepadAction;
}
