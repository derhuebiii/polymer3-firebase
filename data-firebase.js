

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {MutableData} from "@polymer/polymer/lib/mixins/mutable-data.js";

import firebase from '@firebase/app';
import database from '@firebase/app';
import '@firebase/firestore';
import '@firebase/database';
//import '@firebase/datastore';

import { collectionData } from '../../node_modules/rxfire/firestore';
import { DataCommonused } from './data-commonused.js';




const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="data-firebase">


  <template>

    <firebase-document id="fbdoc" path="{{dataLocation}}" data="{{data}}">  </firebase-document>

          <!--<a on-click="testData">TEST-DATA</a>-->

</template>





</dom-module>`;

document.head.appendChild($_documentContainer.content);
class DataFirebase extends PolymerElement {
  static get is() {
    return 'data-firebase';
  }

  static get properties() {
    return {
      data: {
        notify: true,
        type: Object,
        reflectToAttribute: true,
        value: function() {
          return [];
        },
      },
      updatePossible: {
        notify: true,
        type: Boolean,
        value: function() {
          return false;
        },
      },
      dataLocation:{
        type: String,
        notify: true
      },
      requestedLocation: {
        type: String,
        notify: true,
        observer: 'fbRoute'
      },
      propertiesOnly: Boolean,
      user: {
        type: Object,
        notify: true,
        observer: '_userChanged'
      },
      noUser: {
        type: Boolean,
        notify: true,
        observer: 'fbRoute'
      },
      statusKnown: {
        type: Boolean,
        notify: true
      },
      rootPath: Text,
      live: {
        type: Boolean,
        notify: true,
        value: function() {
          return false;
        }
      }
    }
  }

  static get observers() {
    return [
      'updateFromServer(dataLocation.*)', 'fbRoute(requestedLocation.*)', 'updateOnServer(data.*)'
    ]
  }

  ready() {
    super.ready();
  }


  fbRoute() {
    //#TO-DO LOGIN & CO
    if (this.user && !this.noUser) {
      this.set('dataLocation', [this.rootPath, this.user.uid, this.requestedLocation].join('/'));
    } else {
      if (this.dataLocation == this.requestedLocation) return;
      this.set('dataLocation', this.requestedLocation);
    }
    //alert(this.dataLocation);
  }

  static set data(data) {
    alert("set");
  }

  asyncUpdate(requestedLocation) {
    this.requestedLocation = requestedLocation;
    //async info if updated
    return Object.observe(this.data, function(changes) {
            return changes;
          });
  }

  updateFromServer(x, y, dataLoc) {
      //if called directly use this path - live must be false
      if (!dataLoc) {
        dataLoc = this.dataLocation;
      } else {
        if (this.live == true) { console.error("cannot push when live!"); return;}
      }
      if (dataLoc == "" ||dataLoc == undefined || !dataLoc) {
        alert("reutn"); return; }
      this.data = [];
      console.log("--FIREBASE --");
      console.log ("Data-Firebase Data-User Required " + this.noUser);
      console.log ("Data-Firebase Data-Location " + dataLoc);
      console.log("___________");
      console.log(this.live);
      console.log(this.data);
      this.db = firebase.database();


      //this._createMethodObserver('_observeSeveralProperties(prop1,prop2,prop3)', true);

      var dataRef = this.dataRef;
      var loadData = new Promise (
        function(resolve, reject) {
            this.dataRef = this.db.ref(dataLoc);
            this.dataRef.on('value', function (snapshot) {
              this.updatePossible = false;
              this.data =  snapshot.val();
              this.updatePossible = true;
              resolve(this.data);
              if (this.live != true) {
                 this.dataRef.off();
               }
          }.bind(this));
        }.bind(this));
        //.then(() => alert("resolved"));

        return loadData;

  }

  updateOnServer() {
    if (!this.updatePossible) return;
    this.dataRef.update(this.data);
  }



  /*
  *  DATA - pushing object given in element to database #TO-DO: include in function
  * @return: pushID
  */
  pushobject(path, pushObject) {
    //if (this.get('deleteLocation') == null) {
    this.db = firebase.database();
    this.dataRefPush = this.db.ref(path);


    var newPostKey = this.dataRefPush.push().key;
    console.log(this.dataRefPush.push().key);
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates[newPostKey] = pushObject;
    this.dataRefPush.update(updates);

    return newPostKey;
    //}
  }

  delete(delLoc) {
    console.log("Delete " + delLoc);
    this.db = firebase.database();
    this.dataRefRemove = this.db.ref(delLoc);
    this.dataRefRemove.remove();
  }


  isEmpty(o) {
    for (var p in o) {
      if (o.hasOwnProperty(p)) {
        return false;
      }
    }
    return true;
  }

  //Only activate firebase doc if a user is provided or if no user required
  _userChanged() {
    if (this.user == null && this.noUser == false) {
      this.$.fbdoc.disabled = true;
    } else {
      this.$.fbdoc.disabled = false;
    }
    this.fbRoute();
  }
}

window.customElements.define(DataFirebase.is, DataFirebase);
