class VaporizadorElectronico {
  constructor(id, nombre, precio, descripcion, img, alt, cantidad = 1) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.descripcion = descripcion;
    this.cantidad = cantidad;
    this.img = img;
    this.alt = alt;
  }

  aumentarCantidad() {
    this.cantidad++;
  }

  disminuirCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  obtenerDescripcionCarrito() {
    return `
        <div class="card mb-3" style="max-width: 540px;">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${this.img}" class="img-fluid rounded-start" alt="${this.alt}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${this.nombre}</h5>
                        <p class="card-text">Cantidad:
                        <button class="btn btn-dark" id="disminuir-${this.id}"><i class="fa-solid fa-minus"></i></button>
                        ${this.cantidad}
                        <button class="btn btn-dark" id="aumentar-${this.id}"><i class="fa-solid fa-plus"></i></button>
                        </p>
                        <p class="card-text">Precio: $${this.precio}</p>
                        <button class="btn btn-danger" id="eliminar-${this.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
  }

  obtenerDescripcionProducto() {
    return `
        <div class="card border-warning" style="width: 18rem;">
            <img src="${this.img}" class="card-img-top" alt="${this.alt}">
            <div class="card-body">
                <h5 class="card-title">${this.nombre}</h5>
                <p class="card-text">${this.descripcion}</p>
                <p class="card-text">$${this.precio}</p>
                <button class="btn btn-danger" id="agregar-${this.id}">Agregar</button>
            </div>
        </div>`;
  }
}

class VaporizadorElectronicoController {
  constructor() {
    this.listaVaporizadoresElectronicos = [];
  }

  agregarVaporizador(vaporizador) {
    if (vaporizador instanceof VaporizadorElectronico) {
      this.listaVaporizadoresElectronicos.push(vaporizador);
    }
  }

  async prepararContenedorDeProductos() {
    let listaVaporizadoresJSON = await fetch("productos.json");
    let listaVaporizadoresJS = await listaVaporizadoresJSON.json();

    listaVaporizadoresJS.forEach((vaporizador) => {
      let nuevoVaporizador = new VaporizadorElectronico(
        vaporizador.id,
        vaporizador.nombre,
        vaporizador.precio,
        vaporizador.descripcion,
        vaporizador.img,
        vaporizador.alt,
        vaporizador.cantidad
      );
      this.agregarVaporizador(nuevoVaporizador);
    });

    this.mostrarEnDOM();
  }

  //Método para mostrar una notificación - Toastify

  mostrarToastify(vaporizador) {
    Toastify({
      text: `¡${vaporizador.nombre} Añadido!`,
      avatar: `${vaporizador.img}`,
      duration: 2000,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
    }).showToast();
  }

  mostrarEnDOM() {
    let contenedorProductos = document.getElementById("contenedor_productos");

    contenedorProductos.innerHTML = "";

    this.listaVaporizadoresElectronicos.forEach((vaporizador) => {
      contenedorProductos.innerHTML += vaporizador.obtenerDescripcionProducto();
    });

    this.listaVaporizadoresElectronicos.forEach((vaporizador) => {
      const btnAgregar = document.getElementById(`agregar-${vaporizador.id}`);

      btnAgregar.addEventListener("click", () => {
        carrito.agregarAlCarrito(vaporizador);
        carrito.guardarEnStorage();
        carrito.mostrarEnDOM();
        this.mostrarToastify(vaporizador);
      });
    });
  }
}

class CarritoDeVaporizadores {
  constructor() {
    this.listaCarrito = [];
    this.localStorageKey = "listaCarrito";
  }

  agregarAlCarrito(vaporizadorAgregar) {
    let existe = this.listaCarrito.some(
      (vaporizador) => vaporizador.id == vaporizadorAgregar.id
    );

    if (existe) {
      let vaporizador = this.listaCarrito.find(
        (vaporizador) => vaporizador.id == vaporizadorAgregar.id
      );
      vaporizador.aumentarCantidad();
    } else {
      if (vaporizadorAgregar instanceof VaporizadorElectronico) {
        this.listaCarrito.push(vaporizadorAgregar);
      }
    }
  }

  eliminarDelCarrito(vaporizadorAeliminar) {
    let indice = this.listaCarrito.findIndex(
      (vaporizador) => vaporizador.id == vaporizadorAeliminar.id
    );
    this.listaCarrito.splice(indice, 1);
  }

  //Método para guardar el carrito en el almacenamiento local

  guardarEnStorage() {
    let listaCarritoJSON = JSON.stringify(this.listaCarrito);
    localStorage.setItem(this.localStorageKey, listaCarritoJSON);
  }

  //Método para recuperar el carrito desde el almacenamiento local

  recuperarDesdeStorage() {
    let listaCarritoJSON = localStorage.getItem(this.localStorageKey);
    if (listaCarritoJSON !== null) {
      let listaCarritoJS = JSON.parse(listaCarritoJSON);
      let listaAux = [];
      listaCarritoJS.forEach((vaporizador) => {
        let nuevoVaporizador = new VaporizadorElectronico(
          vaporizador.id,
          vaporizador.nombre,
          vaporizador.precio,
          vaporizador.descripcion,
          vaporizador.img,
          vaporizador.alt,
          vaporizador.cantidad
        );
        listaAux.push(nuevoVaporizador);
      });
      this.listaCarrito = listaAux;
    }
  }

  mostrarEnDOM() {
    let contenedorCarrito = document.getElementById("contenedor_carrito");
    contenedorCarrito.innerHTML = "";
    this.listaCarrito.forEach((vaporizador) => {
      contenedorCarrito.innerHTML += vaporizador.obtenerDescripcionCarrito();
    });

    this.eventoEliminar();
    this.eventoAumentarCantidad();
    this.eventoDisminuirCantidad();
    this.mostrarTotal();
  }

  eventoEliminar() {
    this.listaCarrito.forEach((vaporizador) => {
      const btnEliminar = document.getElementById(`eliminar-${vaporizador.id}`);
      btnEliminar.addEventListener("click", () => {
        this.eliminarDelCarrito(vaporizador);
        this.guardarEnStorage();
        this.mostrarEnDOM();
      });
    });
  }

  eventoAumentarCantidad() {
    this.listaCarrito.forEach((vaporizador) => {
      const btnAumentar = document.getElementById(`aumentar-${vaporizador.id}`);
      btnAumentar.addEventListener("click", () => {
        vaporizador.aumentarCantidad();
        this.mostrarEnDOM();
      });
    });
  }

  eventoDisminuirCantidad() {
    this.listaCarrito.forEach((vaporizador) => {
      const btnDisminuir = document.getElementById(
        `disminuir-${vaporizador.id}`
      );
      btnDisminuir.addEventListener("click", () => {
        vaporizador.disminuirCantidad();
        this.mostrarEnDOM();
      });
    });
  }

  //Método para vaciar el carrito

  vaciarCarrito() {
    this.listaCarrito = [];
  }

  eventoFinalizarCompra() {
    const finalizarCompra = document.getElementById("finalizar_compra");

    finalizarCompra.addEventListener("click", () => {
      if (this.listaCarrito.length > 0) {
        localStorage.setItem(this.localStorageKey, "[]");
        this.vaciarCarrito();
        this.mostrarEnDOM();

        Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Tu compra se proceso correctamente!",
          timer: 2000,
        });
      } else {
        Swal.fire({
          position: "center",
          icon: "warning",
          title: "¡No has seleccionado ningún producto!",
          timer: 3000,
        });
      }
    });
  }

  //Método para calcular el precio total de la compra

  calcularTotal() {
    return this.listaCarrito.reduce(
      (acumulador, vaporizador) =>
        acumulador + vaporizador.precio * vaporizador.cantidad,
      0
    );
  }

  mostrarTotal() {
    const precioTotal = document.getElementById("precio_total");
    precioTotal.innerText = `Precio Total: $${this.calcularTotal()}`;
  }
}

const VEC = new VaporizadorElectronicoController();
const carrito = new CarritoDeVaporizadores();

carrito.recuperarDesdeStorage();
carrito.mostrarEnDOM();
carrito.eventoFinalizarCompra();

VEC.prepararContenedorDeProductos();
