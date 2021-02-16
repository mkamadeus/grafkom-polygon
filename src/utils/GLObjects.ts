import { GeometryType, Vertex2D } from "../models/GLModel";
import { createIdentityMatrix } from "../utils/MatrixUtils";

export class BaseGeometry {
  protected type: GeometryType = 0;
  protected projectionMatrix: number[];
  protected color: string;

  constructor() {
    this.projectionMatrix = createIdentityMatrix();
    this.color = "#000000";
  }

  public getProjectionMatrix() {
    return this.projectionMatrix;
  }

  public getType() {
    return this.type;
  }

  public getColor() {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hex = this.color.replace(shorthandRegex, function (_, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
          1.0,
        ]
      : [1.0, 1.0, 1.0, 1.0];
  }
}

export class SquareGeometry extends BaseGeometry {
  private center: Vertex2D;
  private size: number;

  constructor(
    x: number,
    y: number,
    color: string = "#000000",
    size: number = 0
  ) {
    super();
    this.type = GeometryType.SQUARE;
    this.center = { x, y };
    this.size = size;
    this.color = color;
  }

  public getCenter() {
    return this.center;
  }

  public setCenter(center: Vertex2D) {
    this.center = { ...center };
  }

  public getSize() {
    return this.size;
  }

  public setSize(size: number) {
    this.size = size;
  }
}

export class LineGeometry extends BaseGeometry {
  private point1: Vertex2D;
  private point2: Vertex2D;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    super();
    this.type = GeometryType.SQUARE;
    this.point1 = { x: x1, y: y1 };
    this.point2 = { x: x2, y: y2 };
  }
}
