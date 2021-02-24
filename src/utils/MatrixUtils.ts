import type { Vertex2D } from "../models/GLModel";

export const multiplyMatrix = (mat1: number[][], mat2: number[][]) => {
  if (mat1[0].length !== mat2.length || mat2.length !== mat1[0].length)
    throw new Error("Incompatible matrix");
  const result = [];

  for (let i = 0; i < mat1.length; i++) {
    let row = [];
    for (let j = 0; j < mat2[0].length; j++) {
      let val = 0;
      for (let k = 0; k < mat1[0].length; k++) {
        val += mat1[i][k] * mat2[k][j];
      }
      row.push(val);
    }
    result.push(row);
  }

  return result;
};

export const translateVertex = (
  vertex: Vertex2D,
  dx: number,
  dy: number
): Vertex2D => {
  const translationMatrix = [
    [1, 0, dx],
    [0, 1, dy],
    [0, 0, 1],
  ];
  const vertexMatrix = [[vertex.x], [vertex.y], [1]];
  const resultMatrix = multiplyMatrix(translationMatrix, vertexMatrix);
  return { x: resultMatrix[0][0], y: resultMatrix[1][0] };
};

export const createIdentityMatrix = () => {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
};

export const euclideanDistance = (
  P1: Vertex2D,
  P2: Vertex2D
) => {
  return Math.sqrt(Math.pow(P2.x - P1.x, 2) + Math.pow(P2.y - P1.y, 2));
}