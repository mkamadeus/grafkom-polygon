import { Vertex2D, Vertex2DArray } from "../models/GLModel";

export default class GLHelper {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private shaderProgram!: WebGLProgram;
  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;
  private attribLocations!: { [key: string]: number };
  private uniformLocations!: { [key: string]: WebGLUniformLocation };

  constructor(
    canvasElement: HTMLCanvasElement,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    this.canvas = canvasElement;
    this.gl = this.canvas.getContext("webgl", {
      preserveDrawingBuffer: true,
    }) as WebGLRenderingContext;

    // Verify WebGL Availability
    if (!this.gl) alert("WebGL not supported in your machine/browser.");

    this.setup(vertexShaderSource, fragmentShaderSource);
    // this.createSquare();
  }

  /**
   *
   * @param vertexShaderSource Vertex shader string
   * @param fragmentShaderSource Fragment shader string
   */
  public setup(vertexShaderSource: string, fragmentShaderSource: string) {
    this.setupShaders(vertexShaderSource, fragmentShaderSource);
    this.setupProgram();
    this.setupDraw();
    console.log("🌵 Setup done");

    console.log("🌵 Drawing done");
  }

  /**
   * Loads the shader into the GL context.
   * @param type Shader type, supplied with gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param source Shader configuration in string.
   */
  public loadShader(type: number, source: string): WebGLShader | null {
    // Define shader
    const shader: WebGLShader = this.gl.createShader(type)!;

    // Define the shader source and compile it
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    // Verify whether the loaded shader is a valid shader or not
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      alert("Shader compile error!");
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Setup shader and attach the program to the GL context.
   * @param vertexShaderSource Vertex shader string.
   * @param fragmentShaderSource Fragment shader string.
   */
  public setupShaders(
    vertexShaderSource: string,
    fragmentShaderSource: string
  ): void {
    // Create shaders
    this.vertexShader = this.loadShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    )!;
    this.fragmentShader = this.loadShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )!;
  }

  /**
   * Setup WebGL program, links it with the context
   */
  public setupProgram() {
    // Create shader program
    this.shaderProgram = this.gl.createProgram() as WebGLProgram;

    //Attach the shaders created
    this.gl.attachShader(this.shaderProgram, this.vertexShader!);
    this.gl.attachShader(this.shaderProgram, this.fragmentShader!);

    // Link the shader program with the canvas
    this.gl.linkProgram(this.shaderProgram);

    // Verify whether program linking successful
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      alert("Program failed to link.");
      this.gl.deleteProgram(this.shaderProgram);
    }
  }

  /**
   * Setup references and canvas before drawing.
   */
  public setupDraw() {
    // Setup attribute and uniform locations for future reference
    this.attribLocations = {
      vertexPosition: this.gl.getAttribLocation(
        this.shaderProgram,
        "aVertexPosition"
      ),
    };
    this.uniformLocations = {
      projectionMatrix: this.gl.getUniformLocation(
        this.shaderProgram,
        "uProjectionMatrix"
      )!,
      modelViewMatrix: this.gl.getUniformLocation(
        this.shaderProgram,
        "uModelViewMatrix"
      )!,
    };

    // Set viewport and background color
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Use the shader program
    this.gl.useProgram(this.shaderProgram);

    // Enable attribute location to be referenced as a vertex array.
    this.gl.enableVertexAttribArray(this.attribLocations["vertexPosition"]);
  }

  public drawRectangle(x1: number, y1: number, x2: number, y2: number) {
    console.log("sadsd");
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      this.gl.STATIC_DRAW
    );

    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  public drawTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ) {
    // Create position buffer for triangle
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y2, x3, y3]),
      this.gl.STATIC_DRAW
    );

    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  public drawPolygon(vertices: Vertex2DArray) {
    if (vertices.length <= 2) throw new Error("woi ngaco");

    const bufferArray = [];
    for (let i = 1; i < vertices.length - 1; i++) {
      bufferArray.push(vertices[0].x);
      bufferArray.push(vertices[0].y);
      bufferArray.push(vertices[i].x);
      bufferArray.push(vertices[i].y);
      bufferArray.push(vertices[i + 1].x);
      bufferArray.push(vertices[i + 1].y);
    }

    console.log(bufferArray);

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(bufferArray),
      this.gl.STATIC_DRAW
    );

    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, bufferArray.length / 2);
  }

  public drawLine(p1: Vertex2D, p2: Vertex2D) {
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([p1.x, p1.y, p2.x, p2.y]),
      this.gl.STATIC_DRAW
    );

    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.LINES, 0, 2);
  }

  public clearCanvas() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
