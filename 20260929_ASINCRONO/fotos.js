console.log("Fotos");

const api="https://jsonplaceholder.typicode.com/photos";

fetch(api)
  .then(response => response.json())
  .then(j => galeria.innerHTML = j.map(foto=>`<img src="${foto.url}" width="50">`))