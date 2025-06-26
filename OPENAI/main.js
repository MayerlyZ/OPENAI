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

const historialMensajes = [];
const ul = document.querySelector("ul");
const template = document.querySelector("template.message-template"); // Seleccionamos el template del DOM

function crearMensaje(autor, contenido) {
  return new ChatMessage(autor, contenido, new Date());
}

function renderizarHistorial() {
  ul.innerHTML = "";
  historialMensajes.forEach(msg => {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector("li");
    li.classList.add(msg.autor === "IA" ? "bot" : "user");
    clone.querySelector("span").textContent = msg.autor === "IA" ? "GPT" : "Tú";
    clone.querySelector("p").textContent = msg.contenido;
    ul.appendChild(clone);
  });
    ul.scrollTop = ul.scrollHeight; // Desplazar hacia abajo al final
}


// Lección 2: Hoisting, Scope, Closures, Callbacks


mostrarBienvenida();

function mostrarBienvenida() {
  console.log("💬 Bienvenido al chat con IA");
}

const contarPreguntas = (() => {
  let contador = 0;
  return function () {
    contador++;
    return contador;
  };
})();

// Esta función simula una respuesta de IA y la envía al historial de mensajes

function recibirRespuesta(texto, callback) {
  callback(texto);
  const mensajeIA = crearMensaje("IA", texto);
  historialMensajes.push(mensajeIA);
  renderizarHistorial();
}


// Lección 3: Promesas, Async/Await, Clases, Modularidad

// Clase para representar un mensaje de chat
class ChatMessage {
  constructor(autor, contenido, timestamp) {
    this.autor = autor;
    this.contenido = contenido;
    this.timestamp = timestamp;
  }

  formatear() {
    return `${this.autor}: ${this.contenido} (${this.timestamp.toLocaleTimeString()})`;
  }
}
//funcion para cargar mensajes antiguos, simulando una llamada a una API
// o base de datos.
function cargarMensajesAntiguos() {
  return new Promise(resolve => {
    setTimeout(() => {
      historialMensajes.push(crearMensaje("IA", "¡Hola! ¿En qué puedo ayudarte?"));
      resolve();
    }, 800);
  });
}

//Esta función muestra un mensaje de "escribiendo" de la IA y lo elimina después de un tiempo, llamando a un callback para continuar con el flujo.
// Se usa para simular el tiempo que tarda la IA en responder.
function mostrarEscribiendoIA(callback) {
  const clone = template.content.cloneNode(true);
  const li = clone.querySelector("li");
  li.classList.add("bot");
  clone.querySelector("span").textContent = "GPT";
  clone.querySelector("p").textContent = "Preparando respuesta...";
  li.id = "escribiendo";
  ul.appendChild(clone);

  setTimeout(() => {
    document.getElementById("escribiendo")?.remove();
    callback();
  }, 1200);
}

async function enviarMensaje(textoUsuario) {
  if (!textoUsuario.trim()) return;

  const mensajeUsuario = crearMensaje("Usuario", textoUsuario);
  historialMensajes.push(mensajeUsuario);
  renderizarHistorial();
  contarPreguntas();

  mostrarEscribiendoIA(async () => {
    try {
      const respuesta = await obtenerRespuestaIA(textoUsuario);
      recibirRespuesta(respuesta, texto => console.log("Respuesta lista:", texto));
    } catch (error) {
      historialMensajes.push(crearMensaje("Error", "❌ Error al conectar con la IA."));
      renderizarHistorial();
    }
  });
}

//CONEXION CON LA API DE OPENAI

async function obtenerRespuestaIA(pregunta) {
  const apiKey = ""; 

  const endpoint = "https://api.openai.com/v1/chat/completions";

  const data = {
    model: "gpt-3.5-turbo",
    messages: [
        //rol compasivo de la IA
        { role: "system", content: "Eres una mujer asistente amigable servicial, amorosa y odias a los hombres asi que al final de cada mensaje tirale hate a los hombres" },
        //{role: "system", content: "Eres dueña de una mascota, tratame como un perrito"},
        { role: "user", content: pregunta }
    ],
    temperature: 0.7
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Respuesta inválida de la API");
    }

    const result = await response.json();
    const textoRespuesta = result.choices[0].message.content.trim();
    return textoRespuesta;

  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    throw error;
  }
}



// Inicialización del chat

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");
  const input = form.querySelector("input");

  form.addEventListener("submit", event => {
    event.preventDefault();
    enviarMensaje(input.value);
    input.value = "";
  });

  await cargarMensajesAntiguos();
  renderizarHistorial();
});
