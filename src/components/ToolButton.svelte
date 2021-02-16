<script lang="ts">
  export let text: string;
  export let isSelected: boolean;
  export let onClick: () => void;
</script>

<div
  class="flex justify-center items-center rounded p-1 border border-gray-400 hover:bg-gray-200 cursor-pointer"
  class:{hover:bg-gray-200}={!isSelected}
  class:bg-gray-300={isSelected}
  on:click={onClick}
>
  {text}
</div>
