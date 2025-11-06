// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera')
const cameraContainer = document.getElementById('cameraContainer')
const photoContainer = document.getElementById('photoContainer')
const capturedPhoto = document.getElementById('capturedPhoto')
const video = document.getElementById('video')
const takePhotoBtn = document.getElementById('takePhoto')
const takeAnotherBtn = document.getElementById('takeAnother')
const photoGallery = document.getElementById('photoGallery')
const clearGalleryBtn = document.getElementById('clearGallery')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d') // Contexto 2D para dibujar en el Canvas

let stream = null // Variable para almacenar el MediaStream de la cámara
let photos = [] // Array para almacenar las fotos capturadas
async function openCamera() {
  try {
    // 1. Definición de Restricciones (Constraints)
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' }, // Solicita la cámara trasera
        width: { ideal: 1280 },
        height: { ideal: 960 },
        aspectRatio: { ideal: 4 / 3 },
      },
    }

    // 2. Obtener el Stream de Medios
    stream = await navigator.mediaDevices.getUserMedia(constraints)

    // 3. Asignar el Stream al Elemento <video>
    video.srcObject = stream

    // 4. Esperar a que el video esté listo y configurar el canvas
    video.onloadedmetadata = function () {
      // Configurar el canvas con las mismas dimensiones del video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      console.log(`Canvas configurado: ${canvas.width}x${canvas.height}`)
    }

    // 5. Actualización de la UI
    cameraContainer.style.display = 'block'
    openCameraBtn.textContent = 'Cámara Abierta'
    openCameraBtn.disabled = true

    console.log('Cámara abierta exitosamente')
  } catch (error) {
    console.error('Error al acceder a la cámara:', error)
    alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.')
  }
}
function takePhoto() {
  if (!stream) {
    alert('Primero debes abrir la cámara')
    return
  }

  // 1. Asegurar que el canvas tiene las dimensiones correctas
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 2. Dibujar el Frame de Video en el Canvas
  // El método drawImage() es clave: toma el <video> como fuente.
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // 3. Conversión a Data URL en alta calidad
  const imageDataURL = canvas.toDataURL('image/png', 1.0)

  // 4. Guardar la foto en el array
  photos.push({
    dataURL: imageDataURL,
    timestamp: new Date().getTime(),
  })

  // 5. Mostrar la foto capturada
  capturedPhoto.src = imageDataURL
  photoContainer.style.display = 'block'
  cameraContainer.style.display = 'none'

  // 6. Actualizar la galería
  updateGallery()

  // 7. (Opcional) Visualización y Depuración
  console.log('Foto capturada en base64:', imageDataURL.length, 'caracteres')
  console.log('Dimensiones de la foto:', canvas.width, 'x', canvas.height)
  console.log('Total de fotos:', photos.length)
}

function updateGallery() {
  // Limpiar la galería
  photoGallery.innerHTML = ''

  // Mostrar botón si hay fotos
  if (photos.length > 0) {
    clearGalleryBtn.style.display = 'block'
  } else {
    clearGalleryBtn.style.display = 'none'
  }

  // Crear miniaturas para cada foto
  photos.forEach((photo, index) => {
    const photoItem = document.createElement('div')
    photoItem.className = 'photo-item'

    const img = document.createElement('img')
    img.src = photo.dataURL
    img.alt = `Foto ${index + 1}`

    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'delete-photo-btn'
    deleteBtn.innerHTML = '✕'
    deleteBtn.addEventListener('click', function (e) {
      e.preventDefault()
      photos.splice(index, 1)
      updateGallery()
    })

    photoItem.appendChild(img)
    photoItem.appendChild(deleteBtn)
    photoGallery.appendChild(photoItem)
  })
}
function closeCamera() {
  if (stream) {
    // Detener todos los tracks del stream (video, audio, etc.)
    stream.getTracks().forEach((track) => track.stop())
    stream = null // Limpiar la referencia

    // Limpiar y ocultar UI
    video.srcObject = null
    cameraContainer.style.display = 'none'

    // Restaurar el botón 'Abrir Cámara'
    openCameraBtn.textContent = 'Abrir Cámara'
    openCameraBtn.disabled = false

    console.log('Cámara cerrada')
  }
}
// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera)
takePhotoBtn.addEventListener('click', takePhoto)

// Botón para descargar la foto

// Botón para tomar otra foto
takeAnotherBtn.addEventListener('click', function () {
  photoContainer.style.display = 'none'
  cameraContainer.style.display = 'block'
  openCamera()
})

// Botón para limpiar la galería
clearGalleryBtn.addEventListener('click', function () {
  if (confirm('¿Estás seguro de que deseas limpiar toda la galería?')) {
    photos = []
    updateGallery()
  }
})

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
  closeCamera()
})
