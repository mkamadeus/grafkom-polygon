import { GeometryType, Vertex2D, Vertex2DArray } from "../models/GLModel";
import {
  BaseGeometry,
  LineGeometry,
  SquareGeometry,
  PolygonGeometry,
  StringifiedObject,
} from "../utils/GLObjects";
import { multiplyMatrix } from "./MatrixUtils";

export default class GLHelper {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private shaderProgram!: WebGLProgram;
  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;
  private attribLocations!: { [key: string]: number };
  private uniformLocations!: { [key: string]: WebGLUniformLocation };

  private objects: Array<BaseGeometry> = [];
  private drawnObject: BaseGeometry | null = null;

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
  }

  public exportObjects() {
    return JSON.stringify(this.objects);
  }

  public importObjects(objectString: string) {
    this.objects = [];
    const parsed = JSON.parse(objectString);
    for (const obj of parsed) {
      if (obj.type === GeometryType.SQUARE) {
        const square = new SquareGeometry(
          obj.center.x,
          obj.center.y,
          obj.color,
          obj.size
        );
        square.setProjectionMatrix(obj.projectionMatrix);
        this.objects.push(square);
      } else if (obj.type === GeometryType.LINE) {
        const line = new LineGeometry(
          obj.point1.x,
          obj.point1.y,
          obj.point2.x,
          obj.point2.y,
          obj.color
        );
        line.setProjectionMatrix(obj.projectionMatrix);
        this.objects.push(line);
      } else if (obj.type == GeometryType.POLYGON) {
        const poly = new PolygonGeometry(
          obj.points[0].x,
          obj.points[0].y,
          obj.color
        );
        for (let i = 1; i < obj.points.length; i++) {
          poly.setLastPoint(obj.points[i]);
          poly.addPoint();
        }
        poly.setProjectionMatrix(obj.projectionMatrix);
        this.objects.push(poly);
      }
    }
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

    // this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height)
    // const u_resolution = this.gl.getUniformLocation(this.shaderProgram, 'u_resolution')
    // this.gl.uniform2f(u_resolution, this.gl.canvas.width, this.gl.canvas.height)

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
    };
  }

  /**
   * Draw scene function for the current frame.
   */
  public drawScene() {
    // Set viewport and background color
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Render objects
    for (const obj of this.objects) {
      this.drawObject(obj);
    }

    // Render currently drawn object
    // console.log(this.objects.length);
    this.drawnObject && this.drawObject(this.drawnObject);
  }

  /**
   * Add object to render array
   */
  public addObject(obj: BaseGeometry) {
    this.objects.push(obj);
  }

  public getObjects() {
    return this.objects;
  }

  /**
   * Remove latest object from the render array
   */
  public removeNewestObject() {
    this.objects.pop();
  }

  /**
   * Set drawn object
   * @param obj The object currently is drawn
   */
  public setDrawnObject(obj: BaseGeometry) {
    this.drawnObject = obj;
  }

  public getLastObject() {
    return this.objects[this.objects.length - 1];
  }

  public deleteTemporaryObject(times: number) {
    for (let i = 1; i <= times; i++) {
      this.objects.splice(this.objects.length - 1, 1);
    }
  }

  public setColorObject(obj: BaseGeometry, color: string) {
    const objectType = obj.getType();
    if (objectType === GeometryType.SQUARE) {
      // console.log(color);
      obj.setColor(color);
      this.drawScene();
    } else if (objectType === GeometryType.LINE) {
      // console.log("helloooo");
      obj.setColor(color);
      this.drawScene();
    }
  }
  public setTransformObject(obj: BaseGeometry,x: number,y:number, r:number, sx:number, sy:number){

    const [u,v] = [0,0];
    const translateMat = [
    1, 0, 0,
    0, 1, 0,
    x, y, 1
    ]
    let degrees = r;
    const rad = degrees * Math.PI / 180;
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    const rotationMat = [
    cos, -sin, 0,
    sin, cos, 0,
    0, 0, 1
    ]
    const [k1, k2] = [sx,sy]
    const scaleMat = [
    k1, 0, 0,
    0, k2, 0,
    0, 0, 1
    ]
    

    const transform = multiplyMatrix(multiplyMatrix(rotationMat,scaleMat),translateMat);
    console.log(transform);
    console.log(multiplyMatrix(obj.getProjectionMatrix(),scaleMat));
    obj.setProjectionMatrix(multiplyMatrix(obj.getProjectionMatrix(),transform))
    this.drawScene();
    console.log(obj.getProjectionMatrix());
  }

  /**
   * Render object on canvas; any geometric object in general
   * @param obj The object that is going to be rendered
   */
  public drawObject(obj: BaseGeometry) {
    const objectType = obj.getType();
    if (objectType === GeometryType.SQUARE) {
      this.drawSquare(obj as SquareGeometry);
    } else if (objectType === GeometryType.LINE) {
      this.drawLine(obj as LineGeometry);
    } else if (objectType == GeometryType.POLYGON) {
      this.drawPolygon(obj as PolygonGeometry);
    }
  }

  public drawTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    polygon: PolygonGeometry
  ) {
    this.gl.useProgram(this.shaderProgram);
    // Create position buffer for triangle
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y2, x3, y3]),
      this.gl.STATIC_DRAW
    );

    const positionLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "aVertexPosition"
    );
    this.gl.enableVertexAttribArray(positionLocation);

    this.gl.vertexAttribPointer(
      this.attribLocations["vertexPosition"],
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Set square color
    const colorLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uColor"
    );
    this.gl.uniform4fv(colorLocation, polygon.getColor());

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  public drawPolygon(polygon: PolygonGeometry) {
    if (polygon.getLength() == 2) {
      this.drawLine(
        new LineGeometry(
          polygon.firstPoint.x,
          polygon.firstPoint.y,
          polygon.lastPoint.x,
          polygon.lastPoint.y,
          polygon.getColorString()
        )
      );
    } else if (polygon.getLength() >= 3) {
      this.drawLine(
        new LineGeometry(
          polygon.firstPoint.x,
          polygon.firstPoint.y,
          polygon.lastPoint.x,
          polygon.lastPoint.y,
          polygon.getColorString()
        )
      );
      for (let i = 0; i < polygon.getLength() - 1; i++) {
        this.drawTriangle(
          polygon.getPoint(0).x,
          polygon.getPoint(0).y,
          polygon.getPoint(i).x,
          polygon.getPoint(i).y,
          polygon.getPoint(i + 1).x,
          polygon.getPoint(i + 1).y,
          polygon
        );
      }
    }
  }

  public drawLine(line: LineGeometry) {
    // Setup shader program
    this.gl.useProgram(this.shaderProgram);

    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        line.getPoint1().x,
        line.getPoint1().y,
        line.getPoint2().x,
        line.getPoint2().y,
      ]),
      this.gl.STATIC_DRAW
    );

    const positionLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "aVertexPosition"
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Get projection matrix of the line
    const projectionLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uProjectionMatrix"
    );
    this.gl.uniformMatrix3fv(
      projectionLocation,
      false,
      line.getProjectionMatrix()
    );

    // Set square color
    const colorLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uColor"
    );
    this.gl.uniform4fv(colorLocation, line.getColor());

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.LINES, 0, 2);
  }

  public drawSquare(square: SquareGeometry) {
    // Setup shader program
    this.gl.useProgram(this.shaderProgram);

    const positionBuffer = this.gl.createBuffer();
    const x1 = square.getCenter().x - 0.5 * square.getSize();
    const y1 = square.getCenter().y - 0.5 * square.getSize();
    const x2 = square.getCenter().x + 0.5 * square.getSize();
    const y2 = square.getCenter().y + 0.5 * square.getSize();

    // Enable vertex attribute position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      this.gl.STATIC_DRAW
    );
    const positionLocation = this.gl.getAttribLocation(
      this.shaderProgram,
      "aVertexPosition"
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Get projection matrix of the square
    const projectionLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uProjectionMatrix"
    );
    this.gl.uniformMatrix3fv(
      projectionLocation,
      false,
      square.getProjectionMatrix()
    );

    // Set square color
    const colorLocation = this.gl.getUniformLocation(
      this.shaderProgram,
      "uColor"
    );
    this.gl.uniform4fv(colorLocation, square.getColor());

    // Bind position buffer and draw square
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
}
