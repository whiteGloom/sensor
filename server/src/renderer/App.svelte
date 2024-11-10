<script lang="ts">
  let count = 0;

  function handleClick(event: MouseEvent) {
    count += 1;
  }
</script>

<button on:click={handleClick}>
  Click me! I'm button from App.svelte. Count: {count}
</button>