declare module 'jsqr' {
  interface QRCode {
    data: string;
    binaryData: number[];
    location: {
      topRightCorner: { x: number; y: number };
      topLeftCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
    };
  }

  interface Options {
    inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
  }

  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: Options
  ): QRCode | null;

  export default jsQR;
}

declare module 'qrcode' {
  interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: string;
  }

  function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  function toString(text: string, options?: QRCodeOptions): Promise<string>;
  function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>;

  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
    toCanvas: typeof toCanvas;
  };

  export default QRCode;
}
