/**
 * Declare the module for options and other stuff
 */
  // Interface for the draggabilly options
  export interface IDraggabillyOptions {
    handle?: any;
    containment?: boolean | string;
    axis?: string;
    grid?: [number, number];
  }

  // Interface for the movevector
  export interface IMoveVector {
    x: number;
    y: number;
  }

/**
 * Interface for the main object
 */
export interface IDraggabilly {
  new (element: any, options: IDraggabillyOptions): IDraggabilly;

  // The on methods for usage in VanillaJS
  on(eventName: string, handler: (event: any, pointer: any) => void): void;
  on(eventName: string, handler: (event: any, pointer: any, moveVector: IMoveVector) => void): void;

  // The off methods for usage in VanillaJS
  off(eventName: string, handler: (event: any, pointer: any) => void): void;
  off(eventName: string, handler: (event: any, pointer: any, moveVector: IMoveVector) => void): void;

  // The once methods for usage in VanillaJS
  once(eventName: string, handler: (event: any, pointer: any) => void): void;
  once(eventName: string, handler: (event: any, pointer: any, moveVector: IMoveVector) => void): void;

  // Disable the dragging
  disable(): void;

  // Destroy the draggable object
  destroy(): void;

  // Enable the dragging
  enable(): void;
}

export let Draggabilly: {
  new (element: any, options: IDraggabillyOptions): IDraggabilly;
}
