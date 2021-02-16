export type Vertex2D = { x: number; y: number };

export type Vertex2DArray = Array<Vertex2D>;

export enum GeometryType {
  LINE,
  SQUARE,
  POLYGON,
}

// export interface BaseGeometry {
//   type: GeometryType;
//   projectionMatrix: number[][];
// }

// export interface LineGeometry extends BaseGeometry {
//   point1: Vertex2D;
//   point2: Vertex2D;
// }

// export interface SquareGeometry extends BaseGeometry {
//   center: Vertex2D;
//   size: number;
// }
// export interface PolygonGeometry extends BaseGeometry {
//   vertexList: Vertex2DArray;
// }
