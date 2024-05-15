const title = document.querySelector('#title');

const text = 'Maryelin Hailin Gavidia Vasquez';

let index = 0;

console.log(title);

async function typeWriter(){

    if(index < text.length){
        title.style='width:700px;text-aling:center;margin:1rem auto;display:flex;justify-content:center;aling-items:center;font-style: italic !important;font-weight:bold'
        title.innerHTML += text.charAt(index);
        index++;
        await setTimeout(typeWriter,150);   
    }

}
typeWriter();

const formularioo = document.querySelector('.formularioo');

formularioo.addEventListener('submit',()=>{
  Swal.fire('¡Mensaje Enviado exitosamente!');  
});


