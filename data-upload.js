
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

import firebase from '@firebase/app';
import storage from '@firebase/app';
import '@firebase/firestore';
import '@firebase/storage';
//import '@firebase/datastore';

class dataUpload extends PolymerElement {
  static get template() {
    return html`
    <custom-style>
    <style>
      :host {
        display: block;
        height: 0;
        line-height: 0;
      }

      .hidden {
        display:none;
      }
    </style>
  </custom-style>

    <slot></slot>


    <img id="hidden-img" alt="" class="hidden" crossorigin="">


    <input id="fileInput" type="file" on-change="_handleFile" accept="[[accept]]" name="[[name]]" hidden\$="[[hideButton]]">
`;
  }

  static get is() {
    return 'data-upload';
  }

  static get properties() {
    return {

        //Firebase App
        ref: {
            type: Text
        },
        // Filetypes (e.g file_extension|audio/*|video/*|image/*|media_type
        accept: {
          type: Text,
          value: ''
        },
        //maxFileSize in KB
        maxFileSize: {
          type: Number,
          value: Infinity
        },
        //path on storage bucket
        path: {
          type: String,
          value: ''
        },
        /**
         * Name for input element.
         */
        name: {
          type: String,
          value: 'file-upload'
        },
        /**
         * Reference to storage bucket
         */
        storageReference: {
          type: Object,
          value: {}
        },
        /**
         * Upload task from firebases put()
         */
        uploadTask: {
            type: Object
        },
        /**
         * Current progress in %
         * 0 - 100
         */
        progress: {
            type: Number,
            value: 0,
            reflectToAttribute: true,
            notify: true
        },
        downloadLink: {
            type: String,
            notify: true
        },
        /**
         * Hide input button
         */
        hideButton: {
            type: Boolean,
            value: false
        },
        uploadActive: {
            type: Boolean,
            value: false,
            notify: true
        },
        result: {
            notify: true,
            observer: 'handleClick'
        },
        srcData: {
            notify:true
        },
        resized: {
          type: Boolean,
          notify: false
        }

    }
  }

  static get observers() {
    return ['_routePageChanged(routeData.*)', '_routeChanged(route.*)']
  }

  ready() {
    super.ready();
    //listener
    //this.addEventListener('kick', this.handleClick);

    //init firebase storage
    this.set('storageReference', firebase.storage().ref(this.ref));

  }





  openFileDialog() {
    console.log("Clicked");
    this.$.fileInput.click();
  }

  handleClick(e, hallo) {
    alert("File");
    console.log(hallo);
  }

  _handleFile(e) {
      console.log(e.currentTarget.files[0]);
      console.log(this);
      this.file = e.currentTarget.files[0];
      var elem = this;
      var fr = new FileReader();
      fr.readAsDataURL(this.file);

      var self = this;
      var file = this.shadowRoot.querySelector('input[type=file]').files[0];
      var maxFileSizeInKiloBytes = this.maxFileSize * 1024;
      this.$.fileInput.value = ""; //reset file input in case same file needs to be uploaded
      if(!file) return;
      if(file.size > maxFileSizeInKiloBytes) return alert("File too large, maximum size is " + this.maxFileSize + " kB."); //#TO-DO error message as toast
      if(!this.ref) return alert("Upload path not set");

      //console.log("File: " + file);

      // #TO-DO fr.onError -> Errorhandling

      fr.onload = function (e) {
          //console.log("Grüß gott");
          self.resized = false;
          var filePayload = e.target.result;
          self.shadowRoot.querySelector('#hidden-img').src = e.target.result; //#TO-DO: Rename #hidden-img

      self.shadowRoot.querySelector('#hidden-img').onload = function() {
                if(self.file && self.resized == false) {
                  //Handle resize
                  //load to hidden canvas
                  console.log(filePayload);
                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  console.log("Run");
                  console.log(self.shadowRoot.querySelector('#hidden-img').src);

                  //self.srcData = filePayload;

                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  //resize
                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  var filePayload = self.resizeWithCanvas(self.shadowRoot.querySelector('#hidden-img'));
                  self.resized = true;

                  console.log(filePayload);
                  self.shadowRoot.querySelector('#hidden-img').src = filePayload;


                  //load back to hidden
                  //this.shadowRoot.querySelector('#hidden-img').src = filePayload;
                  //console.log("New Hidden Img.src: " + this.shadowRoot.querySelector('#hidden-img').src);
                  //filePayload = this.shadowRoot.querySelector('#hidden-img').src;
                  console.log("Blob");
                  console.log(filePayload);

                  console.log(self.dataURItoBlob(filePayload));

                  //upload
                  self._uploadFile(self.ref, self.file, self.dataURItoBlob(filePayload));
              }
            }
        };
  }


  handleURL(url) {

    var self = this;
    self.resized = false;

      /* ES5 code to load img not needed as we have an <img> element
      fetch(url)
        .then(function(response) {
          return response.blob();
        })
        .then(function(myJson) {
          console.log(myJson);
        })
        .catch(error => console.error("Error fetching from pixabay: " + error));
      */

      //load image
      self.shadowRoot.querySelector('#hidden-img').src = url; //#TO-DO: Rename #hidden-img

      //if loaded
      self.shadowRoot.querySelector('#hidden-img').onload = function() {
              if(url && self.resized == false) {

                  //Handle resize
                  //load to hidden canvas
                  console.log(filePayload);
                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  console.log("Run");
                  console.log(self.shadowRoot.querySelector('#hidden-img').src);

                  //self.srcData = filePayload;

                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  //resize
                  console.log(self.shadowRoot.querySelector('#hidden-img'));
                  var filePayload = self.resizeWithCanvas(self.shadowRoot.querySelector('#hidden-img'));
                  self.resized = true;

                  console.log(filePayload);
                  self.shadowRoot.querySelector('#hidden-img').src = filePayload;


                  //load back to hidden
                  //this.shadowRoot.querySelector('#hidden-img').src = filePayload;
                  //console.log("New Hidden Img.src: " + this.shadowRoot.querySelector('#hidden-img').src);
                  //filePayload = this.shadowRoot.querySelector('#hidden-img').src;
                  console.log("Blob");
                  console.log(filePayload);

                  console.log(self.dataURItoBlob(filePayload));

                  //upload
                  var file = {};
                  file.name = url.substring(url.lastIndexOf('/')+1);
                  self._uploadFile(self.ref, file, self.dataURItoBlob(filePayload));
              }
            }
    }



  _uploadFile(path, file, resizedFile) {
      var self = this;

      self.set('progress', 0);
      this.set('uploadActive', true);

      this.uploadRef = this.storageReference.child(this.guid() + file.name);
      this.set('uploadTask', this.uploadRef.put(resizedFile));
      this.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function(snapshot) {
              self.set('progress', (snapshot.bytesTransferred / snapshot.totalBytes) * 100);

              console.log('Upload is ' + self.progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  self.dispatchEvent(new CustomEvent('paused', { bubbles: true, composed: true, detail: snapshot }));
                  //self.fire('paused', snapshot);
                  self.set('uploadActive', false);
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  //self.fire('running', snapshot);
                  self.dispatchEvent(new CustomEvent('running', { bubbles: true, composed: true, detail: snapshot }));
                  self.set('uploadActive', true);
                  break;
              }

          }, function(error) {
              //self.fire('error', error);
              self.dispatchEvent(new CustomEvent('error', { bubbles: true, composed: true, detail: error }));
              self.set('uploadActive', false);

          }, function() {
              self.set('uploadActive', false);
              self.uploadRef.getDownloadURL().then(function(url) {
                      self.set('downloadLink', url);
                      return url;
                    }.bind(self)).catch(function(error) {
                      // Handle any errors here
                      alert("Error uploading the file.");
                      console.log(error);
                    });

             //console.log(getImgUrl);
              //self.fire('success', self.uploadTask.snapshot);
              self.dispatchEvent(new CustomEvent('success', { bubbles: true, composed: true, detail: self.uploadTask.snapshot}));
          }.bind(self)
      );
  }


  resizeWithCanvas (img) {
      var MAX_WIDTH = 640;
      var MAX_HEIGHT = 640;
      var OUTPUT_QUALITY = .8;

      var newElement = document.createElement("canvas");
      newElement.className = 'hidden';
      var canvas = dom(this.root).appendChild(newElement);
      var ctx = canvas.getContext("2d");
      var width = img.width;
      var height = img.height;
      console.log(width, height);

      ctx.drawImage(img, 0, 0);

      if (width > height) {
          if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
          }
      } else {
          if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
          }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);


      if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
          var output = canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
          canvas.remove();
          return output;
      } else {
          var output = canvas.toDataURL("image/jpeg");
          canvas.remove();
          return output;
      }

  }

  dataURItoBlob (dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

  guid () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}
window.customElements.define(dataUpload.is, dataUpload);
