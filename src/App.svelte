<script lang="typescript">
  import { onMount } from "svelte";
  import VertexShader from "./shader/SampleVertexShader.glsl";
  import FragmentShader from "./shader/SampleFragmentShader.glsl";
  import GLHelper from "./utils/GLHelper";

  let isSelecting1 = false;
  let prevX = 0;
  let prevY = 0;

  let currentX = 0;
  let currentY = 0;

  onMount(() => {
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

    const draw = function (event: MouseEvent) {
      const bounding = canvas.getBoundingClientRect();
      const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
      const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

      if (isSelecting1) {
        glHelper.drawRectangle(prevX, prevY, x, y);
      } else {
        prevX = x;
        prevY = y;
      }
      isSelecting1 = !isSelecting1;
    };
    canvas.addEventListener("click", draw, true);
    canvas.addEventListener(
      "mousemove",
      (event: MouseEvent) => {
        const bounding = canvas.getBoundingClientRect();
        const x = 2 * ((event.x - bounding.left) / bounding.width) - 1;
        const y = -2 * ((event.y - bounding.top) / bounding.height) + 1;

        currentX = x;
        currentY = y;

        // glHelper.drawLine({ x: 0, y: 0 }, { x, y });
      },
      true
    );

    const glHelper = new GLHelper(canvas, VertexShader, FragmentShader);
    // glHelper.drawPolygon([
    //   [0, 0.5],
    //   [0.1, 0.1],
    //   [0.5, 0],
    //   [0.1, -0.1],
    //   [0, -0.5],
    //   [-0.1, -0.1],
    //   [-0.5, 0],
    //   [-0.1, 0.1],
    // ]);
    // glHelper.drawLine({ x: 0.5, y: 0.5 }, { x: -0.3, y: -0.5 });
    // glHelper.clearCanvas();
  });
</script>

<div id="app">
  <div class="toolbar">
    <div>x: {currentX.toFixed(2)}</div>
    <div>y: {currentY.toFixed(2)}</div>
  </div>
  <canvas id="webgl-canvas" width="800" height="800" />
</div>

<style>
  #app {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }
  #webgl-canvas {
    width: 800;
    height: 800;
  }
  .toolbar {
    display: flex;
    justify-content: center;
  }
</style>
