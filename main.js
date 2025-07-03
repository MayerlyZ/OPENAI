//creamos el Jquery object
const $= el => document.querySelector(el);
const $ul = document.querySelector("ul");

//Recuepramos el formulario,
// se pone $ para indicar que es un elementos del DOM
const  $form=$('form');
const $input=$('input');
const $template=$('.message-template');
const $messages=$('ul');
const $container=$('main');
const $button=$('button');

// Lección 1: Objetos, Historial y Renderizado

const historialMensajes = []; // Array para almacenar los mensajes del chat
const ul = document.querySelector("ul");
const template = document.querySelector("template.message-template"); // Seleccionamos el template del DOM

// Función para crear un nuevo mensaje de chat
// Esta función recibe el autor y el contenido del mensaje, y devuelve un objeto ChatMessage
function crearMensaje(autor, contenido) {
  return new ChatMessage(autor, contenido, new Date());
}

//------------------------------------------------------------------------------------------------------------------------------------------

// Función para renderizar el historial de mensajes en el DOM
// Esta función recorre el array historialMensajes y crea un elemento <li> para cada mensaje.
function renderizarHistorial() {
  ul.innerHTML = "";
  historialMensajes.forEach(msg => {
    const clone = template.content.cloneNode(true); // Clonamos el template
    const li = clone.querySelector("li");// Seleccionamos el <li> del template clonado
    li.classList.add(msg.autor === "IA" ? "bot" : "user");// Añadimos la clase correspondiente según el autor
    clone.querySelector("span").textContent = msg.autor === "IA" ? "GPT" : "Tú";// Establecemos el nombre del autor
    clone.querySelector("p").textContent = msg.contenido; // Establecemos el contenido del mensaje
    ul.appendChild(clone); // Añadimos el mensaje al <ul>
  });
   $container.scrollTop = $container.scrollHeight; // Desplazamos el contenedor hacia abajo para mostrar el último mensaje
  $input.focus(); // Volvemos a enfocar el input para que el usuario pueda seguir

}


// Lección 2: Hoisting, Scope, Closures, Callbacks

//------------------------------------------------------------------------------------------------------------------------------

mostrarBienvenida();
// Esta función muestra un mensaje de bienvenida en la consola
function mostrarBienvenida() {
  console.log("💬 Bienvenido al chat con IA");
}

//Le asignamos a la variable contarPreguntas una función que cuenta el número de preguntas realizadas
const contarPreguntas = (() => {
  let contador = 0;
  return function () {
    contador++;
    return contador;
  };
})();

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Esta función simula una respuesta de IA y la envía al historial de mensajes
function recibirRespuesta(texto, callback) {
  callback(texto);// Llamamos al callback con el texto de la respuesta
  const mensajeIA = crearMensaje("IA", texto);// Creamos un nuevo mensaje de IA
  historialMensajes.push(mensajeIA);// Añadimos el mensaje al historial
  renderizarHistorial();// Renderizamos el historial actualizado
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

// Lección 3: Promesas, Async/Await, Clases, Modularidad

// Clase para representar un mensaje de chat
class ChatMessage {
  constructor(autor, contenido, timestamp) { // Constructor que recibe el autor, contenido y timestamp del mensaje
    // Le asignamos los valores a las propiedades del objeto
    this.autor = autor; 
    this.contenido = contenido;
    this.timestamp = timestamp;
  }

// Método para formatear el mensaje como una cadena de texto 
  formatear() {
    return `${this.autor}: ${this.contenido} (${this.timestamp.toLocaleTimeString()})`;
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------------

//funcion para cargar mensajes antiguos, simulando una llamada a una API
function cargarMensajesAntiguos() {
  return new Promise(resolve => { // Simulamos una llamada a la API con un timeout
    setTimeout(() => {
      historialMensajes.push(crearMensaje("IA", "¡Hola! ¿En qué puedo ayudarte?"));
      resolve();
    }, 800);
  });
}

//-------------------------------------------------------------------------------------------------------------------------------------------

//Esta función muestra un mensaje de "escribiendo" de la IA y lo elimina después de un tiempo, llamando a un callback para continuar con el flujo.
// Se usa para simular el tiempo que tarda la IA en responder.
function mostrarEscribiendoIA(callback) {
  const clone = template.content.cloneNode(true); // Clonamos el template del mensaje
  const li = clone.querySelector("li"); // Seleccionamos el <li> del template clonado
  li.classList.add("bot"); // Añadimos la clase "bot" para estilizarlo como un mensaje de IA
  clone.querySelector("span").textContent = "GPT";
  clone.querySelector("p").textContent = "Preparando respuesta...";
  li.id = "escribiendo";
  ul.appendChild(clone); // Añadimos el mensaje al <ul>

  // Desplazamos el contenedor hacia abajo para mostrar el mensaje de "escribiendo"
  setTimeout(() => {
    document.getElementById("escribiendo")?.remove();
    callback();
  }, 1200);
}

//--------------------------------------------------------------------------------------------------------------------------------------------
// Esta función envía un mensaje del usuario, lo añade al historial y solicita una respuesta de la IA
async function enviarMensaje(textoUsuario) {
  if (!textoUsuario.trim()) return; // Si el mensaje está vacío, no hacemos nada

  const mensajeUsuario = crearMensaje("Usuario", textoUsuario); // Creamos un nuevo mensaje del usuario
  historialMensajes.push(mensajeUsuario); // Añadimos el mensaje al historial
  renderizarHistorial();// Renderizamos el historial actualizado
  contarPreguntas();// Llamamos a la función para contar las preguntas


  // Limpiamos el input y lo enfocamos de nuevo
  mostrarEscribiendoIA(async () => {
    try {
      const respuesta = await obtenerRespuestaIA(textoUsuario);// Llamamos a la función para obtener la respuesta de la IA
      recibirRespuesta(respuesta, texto => console.log("Respuesta lista:", texto));// Llamamos a la función para recibir la respuesta y mostrarla en el historial
    } catch (error) {
      historialMensajes.push(crearMensaje("Error", "❌ Error al conectar con la IA."));
      renderizarHistorial();
    }
  });
}
//-------------------------------------------------------------------------------------------------------------------------------------------

//CONEXION CON LA API DE OPENAI

async function obtenerRespuestaIA(pregunta) {
   

  const endpoint = " http://localhost:3001/chat";
  const headers = {"Content-Type": "application/json"};

  const data = {
    model: "gpt-3.5-turbo",
    messages: [
        //rol compasivo de la IA
        { role: "system", content: "Eres una IA, pero tratas al usuario con mucha amabilidad y muy fraternal y con mucha paciencia, con el primer mensaje del usuario tu respuesta será un mensaje motivacional " },
       // {role: "system", content: "Eres dueña de una mascota, tratame como un perrito"},
        { role: "user", content: pregunta }
    ],
    temperature: 0.7
  };

  try {
    const response = await fetch(endpoint, { // Hacemos la petición a la API de OpenAI
      method: "POST",
      headers, // Establecemos las cabeceras necesarias
       body: JSON.stringify(data),// Convertimos los datos a JSON 
      });
      
    

    if (!response.ok) {
      throw new Error("Respuesta inválida de la API");
    }

    // Procesamos la respuesta de la API
    const result = await response.json();
    const textoRespuesta = result.choices[0].message.content.trim(); // Obtenemos el contenido de la respuesta
    return textoRespuesta;

  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    throw error;
  }
  
}




// Inicialización del chat

document.addEventListener("DOMContentLoaded", async () => { // Esperamos a que el DOM esté completamente cargado
  const form = document.querySelector("form");
  const input = form.querySelector("input");

  form.addEventListener("submit", event => { // Añadimos un evento al formulario para manejar el envío
    event.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
    enviarMensaje(input.value);// Llamamos a la función para enviar el mensaje
    input.value = "";
  });

  await cargarMensajesAntiguos(); // Cargamos los mensajes antiguos al iniciar el chat
  renderizarHistorial(); // Renderizamos el historial de mensajes
});
