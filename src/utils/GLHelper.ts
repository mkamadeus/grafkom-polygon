export default class GLHelper {
  private gl!: WebGLRenderingContext;
  private shaderProgram!: WebGLProgram;
  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;

  constructor(
    canvasElement: HTMLCanvasElement,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    this.gl = canvasElement.getContext("webgl") as WebGLRenderingContext;

    // Verify WebGL Availability
    if (!this.gl) alert("WebGL not supported in your machine/browser.");

    this.setupShaders(vertexShaderSource, fragmentShaderSource);
    this.setupProgram();
    this.createSquare();
    console.log("csacasasc");
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

  public createSquare() {
    const positionAttributeLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "a_position"
    );

    // Create buffer for storing vertices
    const positionBuffer = this.gl.createBuffer();

    // Create binding point
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // Define three 2D points, bind via the binding point
    const positions = [0, 0, 0, 0.5, 0.7, 0];
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW
    );

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    // Set background color to black
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.shaderProgram);
    this.gl.enableVertexAttribArray(positionAttributeLocation);

    const iterationSize = 2;
    const dataType = this.gl.FLOAT;
    const normalize = false;

    this.gl.vertexAttribPointer(
      positionAttributeLocation,
      iterationSize,
      dataType,
      normalize,
      0,
      0
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }
}
