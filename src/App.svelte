<script lang="typescript">
  import { onMount } from "svelte";
  import VertexShader from "./shader/SampleVertexShader.glsl";
  import FragmentShader from "./shader/SampleFragmentShader.glsl";
  import GLHelper from "./utils/GLHelper";

  onMount(() => {
    const glHelper = new GLHelper(
      document.getElementById("webgl-canvas") as HTMLCanvasElement,
      VertexShader,
      FragmentShader
    );
  });
</script>

<div id="app">
  <canvas id="webgl-canvas" width="500" height="500" />
</div>

<style>
  #app {
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
  }
  #webgl-canvas {
    width: 800;
    height: 800;
  }
</style>
