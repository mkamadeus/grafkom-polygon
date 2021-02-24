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

// export const translateVertex = (
//   vertex: Vertex2D,
//   dx: number,
//   dy: number
// ): Vertex2D => {
//   const translationMatrix = [
//     [1, 0, dx],
//     [0, 1, dy],
//     [0, 0, 1],
//   ];
//   const vertexMatrix = [[vertex.x], [vertex.y], [1]];
//   const resultMatrix = multiplyMatrix(translationMatrix, vertexMatrix);
//   return { x: resultMatrix[0][0], y: resultMatrix[1][0] };
// };

export const createIdentityMatrix = () => {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
};
