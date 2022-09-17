import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


Dropzone.options.image = {
  dictDefaultMessage: 'Sube tus imagenes aquí',
  acceptedFiles: '.jpg, .jpeg, .png',
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: 'Eliminar imagen',
  dictMaxFilesExceeded: 'Solo puedes subir una imagen',
  headers:{
    'CSRF-TOKEN': token
  },
  paramName: 'image',
  init: function() {
    const dropZone = this;
    const btnPublish = document.querySelector('#publish');

    btnPublish.addEventListener('click', function() {
      dropZone.processQueue();
    });

    dropZone.on('queuecomplete', function() {
      if(dropZone.getQueuedFiles().length === 0 && dropZone.getUploadingFiles().length === 0) {
        window.location.href = '/properties';
      }
    })
  }
}