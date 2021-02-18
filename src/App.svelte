<script lang="typescript">
  import { onMount } from "svelte";
  import VertexShader from "./shader/SampleVertexShader.glsl";
  import FragmentShader from "./shader/SampleFragmentShader.glsl";
  import GLHelper from "./utils/GLHelper";
  import ToolButton from "./components/ToolButton.svelte";
  import type { Vertex2D } from "./models/GLModel";
  import {
    BaseGeometry,
    LineGeometry,
    SquareGeometry,
  } from "./utils/GLObjects";

  // Define tool buttons
  const tools = ["Move", "Polygon", "Line", "Scale", "Square"];
  let toolIndex = 0;

  let drawnObject: BaseGeometry | null = null;
  let currentX = 0;
  let currentY = 0;
  let isDrawing = false;
  let color = "#FFFFFF";

  onMount(() => {
    // Get canvas
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

    // Instantiate GL helper object
    const glHelper = new GLHelper(canvas, VertexShader, FragmentShader);

    // On mouse down, change is drawing status
    canvas.addEventListener("mousedown", () => {
      console.log("✏ Is drawing");
      isDrawing = true;
    });

    // On mouse move, recalculate current mouse coordinate
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      const bounding = canvas.getBoundingClientRect();
      const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
      const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

      currentX = x;
      currentY = y;

      // If currently is drawing...
      if (isDrawing) {
        // If square tool selected
        if (tools[toolIndex] === "Square") {
          console.log("draw sq");
          drawnObject ??= new SquareGeometry(currentX, currentY, color);
          const square = drawnObject as SquareGeometry;
          square.setSize(
            Math.max(
              Math.abs(currentY - square.getCenter().y) * 2,
              Math.abs(currentX - square.getCenter().x) * 2
            )
          );
        } else if (tools[toolIndex] === "Line") {
          console.log("draw line");
          drawnObject ??= new LineGeometry(
            currentX,
            currentY,
            currentX,
            currentY
          );
          const line = drawnObject as LineGeometry;
          line.setPoint2({ x: currentX, y: currentY });
        }
      }
    });

    // On mouse up, save drawn object to array
    canvas.addEventListener("mouseup", () => {
      if (isDrawing) {
        console.log("✏ Stopped drawing");
        isDrawing = false;
        if (tools[toolIndex] === "Square") {
          glHelper.addObject(drawnObject as BaseGeometry);
          drawnObject = null;
        } else if (tools[toolIndex] === "Line") {
          glHelper.addObject(drawnObject as BaseGeometry);
          drawnObject = null;
        }
      }
    });

    // Key combination events
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key === "z") {
        console.log("🔙 Undo");
        glHelper.removeNewestObject();
      }
    });

    // Request frame
    const requestAnimationFunction = (time: number) => {
      time *= 0.0001;
      drawnObject && glHelper.setDrawnObject(drawnObject);
      window.requestAnimationFrame(requestAnimationFunction);
    };
    window.requestAnimationFrame(requestAnimationFunction);
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
  <div class="p-2">
    <canvas id="webgl-canvas" width="800" height="800" />
  </div>
</div>
