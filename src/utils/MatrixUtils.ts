import type { Vertex2D } from "../models/GLModel";

export const multiplyMatrix = (mat1: number[], mat2: number[]) => {
  // if (mat1[0].length !== mat2.length || mat2.length !== mat1[0].length)
  //   throw new Error("Incompatible matrix");
  const result = [];

  let length1 = Math.pow(mat1.length,0.5);
  let length2 = Math.pow(mat2.length,0.5);

  let row1=3;
  let row2=3;
  let col1=3;
  let col2=3;


  for (let i = 0; i < row1; i++) {
    for (let j = 0; j < col2; j++) {
        let sum = 0;
        for (let k = 0; k < col1; k++)
            sum = sum + mat1[i * col1 + k] * mat2[k * col2 + j];
        result[i * col2 + j] = sum;
    }
}
return result;
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