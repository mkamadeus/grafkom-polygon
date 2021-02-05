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

<div class="app">
  <div class="container">
    <canvas id="webgl-canvas" width="800" height="800" />
  </div>
</div>

<style>
  .container {
    display: flex;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }
</style>
