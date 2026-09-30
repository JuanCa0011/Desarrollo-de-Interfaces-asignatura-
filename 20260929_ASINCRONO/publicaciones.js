console.log("Publicando");

const api="https://jsonplaceholder.typicode.com/posts";

fetch(api) 
  .then(response => response.json())
.then(j => listado.innerHTML =j.map(titulo=>`<li>${titulo.title}</li>`))

  //muestra el title en un ul en la pagina htmlSSS
