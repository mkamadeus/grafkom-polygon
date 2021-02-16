<script lang="typescript">
  import { onMount } from "svelte";
  import VertexShader from "./shader/SampleVertexShader.glsl";
  import FragmentShader from "./shader/SampleFragmentShader.glsl";
  import GLHelper from "./utils/GLHelper";
  import ToolButton from "./components/ToolButton.svelte";
  import type { Vertex2D } from "./models/GLModel";
  import { BaseGeometry, SquareGeometry } from "./utils/GLObjects";

  // Define tool buttons
  const tools = ["Move", "Polygon", "Line", "Scale", "Square"];
  let toolIndex = 0;

  let mouseHitPosition: Vertex2D | null = null;
  let drawnObject: BaseGeometry | null;
  let currentX = 0;
  let currentY = 0;
  let isDrawing = false;
  let color = "#000000";

  onMount(() => {
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    console.info(VertexShader);
    console.info(FragmentShader);
    const glHelper = new GLHelper(canvas, VertexShader, FragmentShader);
    // canvas.addEventListener(
    //   "click",
    //   (event: MouseEvent) => {
    //     const bounding = canvas.getBoundingClientRect();
    //     const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
    //     const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

    //     if (isSelecting1) {
    //       glHelper.drawRectangle({ x: prevX, y: prevY }, { x, y });
    //     } else {
    //       prevX = x;
    //       prevY = y;
    //     }
    //     isSelecting1 = !isSelecting1;
    //   },
    //   true
    // );
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      const bounding = canvas.getBoundingClientRect();
      const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
      const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

      currentX = x;
      currentY = y;

      // glHelper.drawLine({ x: 0, y: 0 }, { x, y });
    });

    // canvas.addEventListener("click", () => {
    //   console.log("1");
    //   if (tools[toolIndex] === "Square") {
    //   }
    // });
    canvas.addEventListener("mousedown", () => {
      console.log("is drawing");
      isDrawing = true;
    });
    canvas.addEventListener("mousemove", () => {
      if (tools[toolIndex] === "Square" && isDrawing) {
        // console.log(drawnObject);
        if (!drawnObject) {
          console.log("Square created");
          console.log(color);
          drawnObject = new SquareGeometry(currentX, currentY, color);
        }
        const square = drawnObject as SquareGeometry;
        square.setSize(
          Math.min(
            Math.abs(currentY - square.getCenter().y) * 2,
            Math.abs(currentX - square.getCenter().x) * 2
          )
        );
      }
    });
    canvas.addEventListener("mouseup", () => {
      if (tools[toolIndex] === "Square" && isDrawing) {
        console.log("not drawing");
        isDrawing = false;
        glHelper.addObject(drawnObject as BaseGeometry);
        drawnObject = null;
      }
      // if (tools[toolIndex] === "Square") {
      //   const square = tmpObject as SquareGeometry;
      //   square.setSize(
      //     Math.min(
      //       Math.abs(currentY - square.getCenter().y),
      //       Math.abs(currentX - square.getCenter().x)
      //     )
      //   );
      // }
    });

    // glHelper.drawScene(0);

    // Request frame
    const requestAnimationFunction = (time: number) => {
      // console.log("a");
      time *= 0.0001;
      glHelper.drawScene(time, currentX, currentY, drawnObject);
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
      <div class="w-8 h-8 rounded" style={`background-color:${color};`} />
    </div>
    <input class="p-1 rounded border border-gray-400" bind:value={color} />
  </div>
  <div class="p-2">
    <canvas id="webgl-canvas" width="800" height="800" />
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    justify-content: center;
  }
</style>
