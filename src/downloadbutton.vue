<script>
export default {
    methods:{
     handleClick()  {
       const data = {key:'value'};  

       // Convert JSON object to a string
       const jsonString = JSON.stringify(data, null, 2);

       // Create a Blob with the JSON content
       const blob = new Blob([jsonString], { type: 'application/json' });

       // Create a link element
       const link = document.createElement('a');

       // Set the download attribute and create an object URL
       link.download = 'small_sites.json';
       link.href = window.URL.createObjectURL(blob);

       // Append the link to the body and click it programmatically
       document.body.appendChild(link);
       link.click();

       // Remove the link from the body
       document.body.removeChild(link);
     },
   },
};
</script>

<template>
    
  <div id="myDiv" style="width: 600px; height: 400px;"></div>
  <button @click="handleClick">Download check</button>
    
</template>
