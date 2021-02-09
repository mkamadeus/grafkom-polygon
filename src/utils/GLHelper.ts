export default class GLHelper {
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
    this.gl = canvasElement.getContext("webgl") as WebGLRenderingContext;

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
    console.log("done");
    this.drawRectangle(0.5, 0.5, 0.1, 0.1);
    console.log("drawn");
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

  public setupDraw() {
    // Setup attribute and uniform locations
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

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 0, 0.5, 0.7, 0]),
      this.gl.STATIC_DRAW
    );

    // this.resizeCanvas();

    // this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.shaderProgram);

    this.gl.enableVertexAttribArray(this.attribLocations["vertexPosition"]);
    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // this.gl.uniform2f(
    //   this.uniformLocations["modelViewMatrix"],
    //   this.gl.canvas.width,
    //   this.gl.canvas.height
    // );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  public resizeCanvas(multiplier: number = 1) {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    const width = window.innerWidth * multiplier;
    const height = window.innerHeight * multiplier;

    if (canvas.height !== height || canvas.width !== width) {
      canvas.height = height;
      canvas.width = width;
      return true;
    }

    return false;
  }

  public drawRectangle(x: number, y: number, w: number, h: number) {
    const x1 = x,
      y1 = y;
    const x2 = x + w,
      y2 = y + h;
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      this.gl.STATIC_DRAW
    );
    const colorUniformLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "u_color"
    );
    this.gl.uniform4f(
      colorUniformLocation,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}
