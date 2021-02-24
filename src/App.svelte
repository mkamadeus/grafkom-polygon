<script lang="typescript">
  import { onMount } from 'svelte';
  import VertexShader from './shader/SampleVertexShader.glsl';
  import FragmentShader from './shader/SampleFragmentShader.glsl';
  import GLHelper from './utils/GLHelper';
  import ToolButton from './components/ToolButton.svelte';
  import { GeometryType } from './models/GLModel';
  import {
    BaseGeometry,
    LineGeometry,
    SquareGeometry,
    PolygonGeometry,
  } from './utils/GLObjects';
  import { downloadFile, readSingleFile } from './utils/DownloadFile';
  import { now } from 'svelte/internal';

  import Slider from '@fouita/slider';
  let value_x = 400;
  let value_y = 400;
  let value_r = 0;
  let value_sx = 400;
  let value_sy = 400;

  // Define tool buttons
  const tools = [
    'Move',
    'Transform',
    'Polygon',
    'Line',
    'Square',
    'Color',
    'Help',
  ];
  let toolIndex = 0;

  let drawnObject: BaseGeometry | null = null;
  let currentX = 0;
  let currentY = 0;
  let oldPosition = { x: currentX, y: currentY };
  let clickedObject: number | null = null;
  let clickedIndex: number | null = null;
  let firstTry = true;
  let isDrawing = false;
  let isPolygon = false;
  let finished = true;
  let color = '#FFFFFF';
  let textareaValue = '';
  let glHelperObject!: GLHelper;

  onMount(() => {
    // Get canvas
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;

    // Instantiate GL helper object
    const glHelper = new GLHelper(canvas, VertexShader, FragmentShader);
    glHelperObject = glHelper;

    // On mouse down, change is drawing status
    canvas.addEventListener('mousedown', (event: MouseEvent) => {
      const bounding = canvas.getBoundingClientRect();
      const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
      const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

      console.log('✏ Is drawing');
      isDrawing = true;

      if (tools[toolIndex] === 'Move') {
        console.log('Move vertex');
        if (firstTry) {
          let vertexObject = glHelper.vertexPicking({
            x: currentX,
            y: currentY,
          });
          clickedIndex ??= vertexObject[0];
          clickedObject ??= vertexObject[1];
        }
        if (clickedObject != null && firstTry) {
          firstTry = false;
        }
        console.log(clickedObject);
      } else if (tools[toolIndex] === 'Color') {
        let objects = glHelper.getObjects();
        console.log(objects);

        let object;

        for (let i = 0; i < objects.length; i++) {
          object = objects[i];
          console.log('iterasi' + i);

          //If the object is square
          if (object.getType() == GeometryType.SQUARE) {
            object = object as SquareGeometry;
            let x1 = object.getCenter().x - 0.5 * object.getSize();
            let y1 = object.getCenter().y - 0.5 * object.getSize();
            let x2 = object.getCenter().x + 0.5 * object.getSize();
            let y2 = object.getCenter().y + 0.5 * object.getSize();

            //If point(x,y) inside square
            if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
              console.log('poin didalem kotak');
              glHelper.setColorObject(object, color);
              break;
            } else {
              console.log('poin diluar kotak');
            }
          } else if (object.getType() == GeometryType.LINE) {
            object = object as LineGeometry;
            console.log(object.getType());
            console.log('masuk sini');
            let a = Math.pow(
              Math.pow(object.getPoint1().x - x, 2) +
                Math.pow(object.getPoint1().y - y, 2),
              0.5
            );
            let b = Math.pow(
              Math.pow(object.getPoint2().x - x, 2) +
                Math.pow(object.getPoint2().y - y, 2),
              0.5
            );
            let c = Math.pow(
              Math.pow(object.getPoint1().x - object.getPoint2().x, 2) +
                Math.pow(object.getPoint1().y - object.getPoint2().y, 2),
              0.5
            );

            let distance = 0;

            if (Math.pow(b, 2) > Math.pow(a, 2) + Math.pow(c, 2)) {
              distance = a;
            } else if (Math.pow(a, 2) > Math.pow(b, 2) + Math.pow(c, 2)) {
              distance = b;
            } else {
              let s = (a + b + c) / 2;
              distance =
                (2 / c) * Math.pow(s * (s - a) * (s - b) * (s - c), 0.5);
            }

            if (distance < 0.01) {
              console.log('ganti warna garis');
              glHelper.setColorObject(object, color);
            }
            console.log('distance');
            console.log(distance);
          }
        }
      }

      if (tools[toolIndex] === 'Transform') {
        let objects = glHelper.getObjects();
        console.log(objects);

        let object;

        for (let i = 0; i <= objects.length; i++) {
          if (i == objects.length) {
            object = null;
            break;
          }
          object = objects[i];
          //If the object is square
          if (object.getType() == GeometryType.SQUARE) {
            const square = object as SquareGeometry;
            let x1 = square.getCenter().x - 0.5 * square.getSize();
            let y1 = square.getCenter().y - 0.5 * square.getSize();
            let x2 = square.getCenter().x + 0.5 * square.getSize();
            let y2 = square.getCenter().y + 0.5 * square.getSize();

            //If point(x,y) inside square
            if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
              console.log('poin didalem kotak');
              glHelper.setColorObject(square, color);
              break;
            } else {
              console.log('poin diluar kotak');
            }
            console.log(square.getCenter());
          } else if (object.getType() == GeometryType.LINE) {
            const line = object as LineGeometry;
            let a = Math.pow(
              Math.pow(line.getPoint1().x - x, 2) +
                Math.pow(line.getPoint1().y - y, 2),
              0.5
            );
            let b = Math.pow(
              Math.pow(line.getPoint2().x - x, 2) +
                Math.pow(line.getPoint2().y - y, 2),
              0.5
            );
            let c = Math.pow(
              Math.pow(line.getPoint1().x - line.getPoint2().x, 2) +
                Math.pow(line.getPoint1().y - line.getPoint2().y, 2),
              0.5
            );

            let distance = 0;

            if (Math.pow(b, 2) > Math.pow(a, 2) + Math.pow(c, 2)) {
              distance = a;
            } else if (Math.pow(a, 2) > Math.pow(b, 2) + Math.pow(c, 2)) {
              distance = b;
            } else {
              let s = (a + b + c) / 2;
              distance =
                (2 / c) * Math.pow(s * (s - a) * (s - b) * (s - c), 0.5);
            }

            if (distance < 0.01) {
              break;
            }
            console.log('distance');
            console.log(distance);
          }
        }

        if (object != null) {
          console.log('minggir');

          let translate_x = ((value_x - 0) * (1 - -1)) / (800 - 0) + -1;
          let translate_y = ((value_y - 0) * (1 - -1)) / (800 - 0) + -1;
          let scale_sx = ((value_sx - 0) * (2 - 0)) / (800 - 0) + 0;
          let scale_sy = ((value_sy - 0) * (2 - 0)) / (800 - 0) + 0;
          console.log(translate_x);
          console.log(translate_y);
          console.log(value_r);
          console.log(scale_sx);
          console.log(scale_sy);

          glHelper.setTransformObject(
            object,
            translate_x,
            translate_y,
            value_r,
            scale_sx,
            scale_sy
          );
        }
      }
    });

    // On mouse move, recalculate current mouse coordinate
    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      const bounding = canvas.getBoundingClientRect();
      const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
      const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

      currentX = x;
      currentY = y;

      // If currently is drawing...
      if (isDrawing) {
        // If square tool selected
        if (tools[toolIndex] === 'Square') {
          finished = true;
          console.log('draw sq');
          drawnObject ??= new SquareGeometry(currentX, currentY, color);
          const square = drawnObject as SquareGeometry;
          square.setSize(
            Math.max(
              Math.abs(currentY - square.getCenter().y) * 2,
              Math.abs(currentX - square.getCenter().x) * 2
            )
          );
        } else if (tools[toolIndex] === 'Line') {
          finished = true;
          console.log('draw line');
          drawnObject ??= new LineGeometry(
            currentX,
            currentY,
            currentX,
            currentY,
            color
          );
          const line = drawnObject as LineGeometry;
          line.setPoint2({ x: currentX, y: currentY });
        } else if (tools[toolIndex] == 'Polygon') {
          if (finished == false) {
            console.log('continue draw last polygon');
            drawnObject ??= glHelper.getLastObject();
            const polygon = drawnObject as PolygonGeometry;
            polygon.setLastPoint({ x: currentX, y: currentY });
          } else {
            finished = false;
            console.log('draw polygon');
            drawnObject ??= new PolygonGeometry(currentX, currentY, color);
            const polygon = drawnObject as PolygonGeometry;
            polygon.setLastPoint({ x: currentX, y: currentY });
            isPolygon = true;
          }
        } else if (tools[toolIndex] == 'Move') {
          finished = true;
          if (clickedObject != null && clickedIndex != null) {
            // glHelper.moveObject(clickedObject, oldPosition, {
            //   x: currentX,
            //   y: currentY,
            // });
            glHelper.moveVertex(clickedObject, clickedIndex, {
              x: currentX,
              y: currentY,
            });
          }
        }
      }
    });

    // On mouse up, save drawn object to array
    canvas.addEventListener('mouseup', () => {
      if (isDrawing) {
        console.log('✏ Stopped drawing');
        isDrawing = false;
        if (tools[toolIndex] === 'Square') {
          glHelper.addObject(drawnObject as BaseGeometry);
        } else if (tools[toolIndex] === 'Line') {
          glHelper.addObject(drawnObject as BaseGeometry);
        } else if (tools[toolIndex] == 'Polygon') {
          glHelper.addObject(drawnObject as BaseGeometry);
          const polygon = drawnObject as PolygonGeometry;
          polygon.addPoint();
        } else if (tools[toolIndex] == 'Move') {
          firstTry = true;
          clickedObject = null;
          clickedIndex = null;
        }
      }
      drawnObject = null;
    });

    // Key combination events
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'z') {
        console.log('🔙 Undo');
        glHelper.removeNewestObject();
      }
    });

    // Finished the make of polygon
    document.addEventListener('keyup', function (e) {
      if (e.keyCode === 13 && isPolygon) {
        finished = true;
        const polygon = glHelper.getLastObject() as PolygonGeometry;
        glHelper.deleteTemporaryObject(polygon.getLength() - 3);
        isPolygon = false;
        alert('Berhasil membuat polygon!');
      }
    });

    // Request frame
    const requestAnimationFunction = (time: number) => {
      time *= 0.0001;
      drawnObject && glHelper.setDrawnObject(drawnObject);
      glHelper.drawScene();
      window.requestAnimationFrame(requestAnimationFunction);
    };
    window.requestAnimationFrame(requestAnimationFunction);

    document.getElementById('file-input')!.addEventListener('change', (e) =>
      readSingleFile(e, (text: string) => {
        console.log('asd');
        textareaValue = text;
        // glHelperObject.importObjects(text);
      })()
    );
  });
</script>

<div class="flex flex-col w-full min-h-screen items-center justify-center">
  <div class="flex justify-center items-center w-full">
    <div class="text-sm px-4">
      <div class="flex -mx-2">
        <div class="font-bold px-2">x</div>
        <div class="w-12 border border-gray-400 rounded p-1">
          {currentX.toFixed(2)}
        </div>
      </div>
      <div class="flex -mx-2">
        <div class="font-bold px-2">y</div>
        <div class="w-12 border border-gray-400 rounded p-1">
          {currentY.toFixed(2)}
        </div>
      </div>
    </div>
    {#each tools as tool, i}
      <div class="px-2">
        <ToolButton
          text={tool}
          onClick={() => {
            toolIndex = i;
          }}
          isSelected={toolIndex === i}
        />
      </div>
    {/each}
    <div class="px-2">
      <div
        class="w-8 h-8 rounded border border-gray-400"
        style={`background-color:${color};`}
      />
    </div>
    <input class="p-1 rounded border border-gray-400" bind:value={color} />
  </div>

  <div class="p-2 w-full items-center justify-center flex flex-row ...">
    <canvas id="webgl-canvas" width="800" height="800" />
    <div class=" flex-auto m-2 h-full visible">
      <div class="p-2 w-full h-full">
        <p>Translate (X,Y)</p>

        <Slider
          class="mt-5 mx-6 m-5"
          tooltip="hover"
          min={0}
          max={800}
          bind:value={value_x}
        />

        <Slider
          class="mt-5 mx-6 m-5"
          tooltip="hover"
          min={0}
          max={800}
          bind:value={value_y}
        />
        <p>Rotate</p>
        <Slider
          class="mt-5 mx-6 m-5"
          tooltip="hover"
          min={0}
          max={360}
          bind:value={value_r}
        />

        <p>Scale (X,Y)</p>
        <Slider
          class="mt-5 mx-6 m-5"
          tooltip="hover"
          min={0}
          max={800}
          bind:value={value_sx}
        />
        <Slider
          class="mt-5 mx-6 m-5"
          tooltip="hover"
          min={0}
          max={800}
          bind:value={value_sy}
        />
      </div>
      <h1>HELP MENU</h1>
      <p class="font-bold">How to draw square :</p>
      <p>1. Input the color that you want beside #000000 (e.g. : #FFFFFF)</p>
      <p>2. Click "Square" button</p>
      <p>3. Drag on canvas depend on the size</p>
      <p class="font-bold">How to draw line :</p>
      <p>1. Input the color that you want beside #000000 (e.g. : #FFFFFF)</p>
      <p>2. Click "Line" button</p>
      <p>3. Drag on canvas depend on the length</p>

      <p class="font-bold">How to draw polygon :</p>
      <p>1. Input the color that you want beside #000000 (e.g. : #FFFFFF)</p>
      <p>2. Click "Polygon" button</p>
      <p>3. Drag on canvas</p>
      <p>4. Drag again if you want to add sides</p>
      <p>5. Click enter if you finish drawing your polygon</p>

      <p class="font-bold">How to change color of shape :</p>
      <p>1. Input the color that you want beside #000000 (e.g. : #FFFFFF)</p>
      <p>2. Click "Color" button</p>
      <p>3. Click the shape you want to change color</p>

      <p class="font-bold">How to transform shape :</p>
      <p>1. Input the transform value (X and Y) with slider</p>
      <p>2. Input the rotation degree with slider</p>
      <p>3. Input the scale value (X and Y) with slider</p>
      <p>3. Click "Transform"</p>
      <p>3. Choose object you want to transform</p>

      <div class="flex p-2">
        <div class="px-2">
          <button
            class="flex justify-center items-center rounded p-1 border border-gray-400 hover:bg-gray-200 cursor-pointer"
            on:click={() => {
              textareaValue = glHelperObject.exportObjects();
            }}
          >
            Export
          </button>
        </div>
        <div class="px-2">
          <button
            class="flex justify-center items-center rounded p-1 border border-gray-400 hover:bg-gray-200 cursor-pointer"
            on:click={() => {
              textareaValue = glHelperObject.exportObjects();
              downloadFile(`${Date.now()}.json`, textareaValue);
            }}
          >
            Export & Save
          </button>
        </div>
        <div class="flex px-2">
          <input type="file" id="file-input" />
          <button
            class="flex justify-center items-center rounded p-1 border border-gray-400 hover:bg-gray-200 cursor-pointer"
            on:click={() => {
              glHelperObject.importObjects(textareaValue);
            }}
          >
            Import
          </button>
        </div>
      </div>
      <textarea
        class="border border-gray-500 w-full p-2 overflow-y-scroll"
        bind:value={textareaValue}
      />
    </div>
  </div>
</div>
