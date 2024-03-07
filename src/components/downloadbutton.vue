<script setup>

const handleClick = () => {
  const data = { key: 'value' };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');

  link.download = 'small_sites.json';
  link.href = window.URL.createObjectURL(blob);

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
</script>

<template>
  <button @click="handleClick">Download component</button>
</template>

