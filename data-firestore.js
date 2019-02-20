import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import firebase from '@firebase/app';
import firestore from '@firebase/app';
import '@firebase/firestore';

import { collectionData } from '../../node_modules/rxfire/firestore';
import { DataCommonused } from './data-commonused.js';

import '@polymer/app-storage/app-indexeddb-mirror/app-indexeddb-mirror.js';


class dataFirestore extends DataCommonused(PolymerElement) {
  static get template() {
    return html`
    <!--<a on-click="test">TEST-DATA</a>-->
      <app-indexeddb-mirror
      key="[[key]]"
      data="{{liveData}}"
      persisted-data="{{data}}">
      </app-indexeddb-mirror>
    `;
  }

  static get is() {
    return 'data-firestore';
  }
  static get properties() {
    return {
      dataLocation: String,
      requestedLocation: {
        type: String,
        notify: true,
        observer: 'fbRoute'
      },
      propertiesOnly: Boolean,
      user: {
        type: Object,
        notify: true,
        observer: '_userChanged',
        reflectToAttribute: true
      },
      /*firestore*/
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
      documentPathDyn:  {
        type: Text,
        observer: '_onDocumentPathDyn'
      },
      collectionPathDyn: {
        type: Text,
        observer: '_onCollectionPathDyn'
      },
      documentPath: {
        type: Text,
        observer: '_onDocumentPath'
      },
      collectionPath: {
        type: Text,
        observer: '_onCollectionPath'
      },
      //for collections: where to filter
      queryFilterCategory: {
        type: Text
      },
      //for collections: what to filter
      queryFilterValue: {
        type: Text
      },
      //collection
      collect: {
        type: Object,
        notify: true
      },
      data: {
        type: Object,
        notify: true
      },
      live: {
        type: Boolean,
        notify: true
      }
    }
  }
  static get observers() {
    return ['dataChanged(data.*)', '_onCollectionPathDyn(queryFilterValue.*)', '_onCollectionPathDyn(queryFilterCategory.*)']
  }
  ready() {
    super.ready();
  }

  //only reference to collection or data if set in object
  _onCollectionPath() {
    var path = this.collectionPath;
    if (path != "" && path != null && path && path.indexOf("//") == -1 && path.charAt(0) != '/' && path.charAt(path.length - 1) != '/') {
      //slash can not be in the beginning or end and no // slash - see if above
      //then we can count the appearance of /
      function isOdd(n) {
        return Math.abs(n % 2) == 1;
      }
      var depth =  (path.length - path.replace(/\//ig, '').length) + 1;

      if(isOdd(depth)) {
        this.collectionPathDyn = this.collectionPath;
        this.key = path;
      }
    }

  }


  /*
  * DATA - Load collection
  */
  _onCollectionPathDyn() {

        console.log("--FIRESTORE-- COLLECTION");
        console.log(this.collectionPathDyn);

        this.db = firebase.firestore();
        this.collectRef = this.db.collection(this.collectionPathDyn);

        var query;
        console.log(this.queryFilterValue, this.queryFilterCategory);

        if(this.queryFilterValue == "All") {
          query = this.collectRef.orderBy('title');
        } else if (this.queryFilterValue  && this.queryFilterCategory) {
          query = this.collectRef.where(this.queryFilterCategory.toLowerCase(), '==', this.queryFilterValue.toLowerCase()).orderBy('title')
        }
        else {
          query = this.collectRef.orderBy(this.queryFilterCategory);
        }

        console.log("--Query--");

        if (this.listenerColl) {this.listenerColl();}
        this.listenerColl = query
            .onSnapshot(function(querySnapshot) {
                var data = [];
                var push;
                querySnapshot.forEach(function(doc) {
                    push = doc.data();
                    push.__id__ = doc.id; //add key to object
                    data.push(push);
                });
                this.set('collect', data);
                console.log("Current coll: ", data);
                if (this.live != true) {
                   this.listenerColl();
                 }

            }.bind(this));
        return;
  }

    /*
    * DATA - Manual reload
    */
    refreshData() {
      this._onDocumentPathDyn();
    }

    /*
    * DATA - Load document from path
    */
    _onDocumentPathDyn() {
        console.log("--FIRESTORE-- DOCUMENT");
        console.log(this.documentPathDyn);

        this.db = firebase.firestore();
        this.dataRef = this.db.doc(this.documentPathDyn);

        console.log(this.dataRef);

        if (this.listenerDoc) {this.listenerDoc();}
        this.listenerDoc = this.dataRef
            .onSnapshot(function(doc) {
                console.log("Current data: ", doc.data());
                this.liveData = doc.data();
                console.log(this);
                if (this.live != true) {
                   this.listenerDoc();
                 }
            }.bind(this));

    }


  //only reference to collection or data if set in object
  _onDocumentPath() {
    var path = this.documentPath;
    if (path != "" && path != null && path && path.indexOf("//") == -1 && path.charAt(0) != '/' && path.charAt(path.length - 1) != '/') {

      //slash can not be in the beginning or end and no // slash - see if above
      //then we can count the appearance of /

      var depth = (path.length - path.replace(/\//ig, '').length) + 1;

      function isOdd(n) {
        return Math.abs(n % 2) == 1;
      }
      function isEven(n) {
         return n % 2 == 0;
      }

      if(isEven(depth) && depth != 0) {
        this.documentPathDyn = path;
        this.key = path;
      }
    }
  }


  test() {
    //console.log(this.data);
    console.log(this.collect);
    this.tmpCat = "Mathematics";
    //this.pushToArray("cardsets", "123");
    //this.update();
    //this.addSomeStuffToTheCollection();
  }
  async addSomeStuffToTheCollection() {
    //push something new (with  new key)
    return this.collectRef.add({
      someStuff: true
    });
  }


  //#TO-DO: Check if works
  async pushToDocument(pushData) {
    console.log("push array", this.collectionPath, this.documentPath);
    console.log(pushData);
    console.log(this.dataRef);
    console.log(pushData);
    if (!this.dataRef) return;
    return this.dataRef.set(pushData, {
        merge: true
      })
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }
  /*
   * DATA - Push data to an array in a document
   * @args: objectName, pushData
   * @return: (error)
   */
  async deleteFromObject(objectName, deleteObj) {
    var tmpData = this.data;
    delete tmpData[deleteObj];
    var tmpObj = {}; //to get the variable in key
    tmpObj[objectName] = tmpData[objectName];
    return this.dataRef.update(tmpObj)
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }

  /*
   * DATA - Push data to an array in a document
   * @args: objectName, pushData
   * @return: (error)
   */
  async deleteFromDocument(deleteObj) {
    var tmpData = this.data;
    //delete tmpData[deleteObj];
    var tmpObj = {};
    tmpObj[deleteObj] = firebase.firestore.FieldValue.delete();
    return this.dataRef.update(tmpObj)
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }

  /*
   * DATA - Push data to an array in a document
   * @args: objectName, pushData
   * @return: (error)
   */
  async deleteDocument() {
    return this.dataRef.delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  }

  /*
   * DATA - Push data to an array in a document
   * @args: arrayName, pushData
   * @return: (error)
   */
  async deleteFromArray(arrayName, deleteObj) {
    console.log(this.data[arrayName]);
    console.log(deleteObj);
    var tmpData = this.data;
    //find index in array
    var index = tmpData[arrayName].findIndex(function(item) {
      return item.creatorCardsetID == deleteObj
    });
    tmpData[arrayName].splice(index, 1);
    var tmpObj = {};
    tmpObj[arrayName] = tmpData[arrayName];
    return this.dataRef.update(tmpObj)
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }


  /*
   * DATA - Push data to an array in a document
   * @args: arrayName, pushData
   * @return: (error)
   */
  async pushToArray(arrayName, pushData) {
    var tmpData;
    //cause we need to pass as an object, not array to firestore
    tmpData = {};
    //if arrayName array does not exist yet ("first cardset")
    if (!this.data) {
      tmpData[arrayName] = [];
    } else {
      tmpData[arrayName] = this.data[arrayName];
    }
    tmpData[arrayName].push(pushData);
    console.log(tmpData);
    return this.dataRef.set(tmpData, {
        merge: true
      })
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }
  /*
   * DATA - Push data to an array in a document
   * @args: objectName, pushData
   * @return: (error)
   */
  async addDocument(pushData, docName) {
    var tmpData;
    //cause we need to pass as an object, not array to firestore
    tmpData = {};
    console.log(this.documentPath);
    console.log(tmpData);
    console.log(tmpData);
    console.log(this.collectionPath);

    console.log(this.collectRef);

    //if docName is not given, push with random ID
    if(!docName) {
      return this.collectRef.add(pushData)
        //return this.dataRef.update(tmpObj)
        /*.then(function() {
            console.log("Document successfully updated!");
        })*/
        .catch(function(error) {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    //else set with specific name
    } else {
      alert(docName);
      console.log(this.collectRef);
      return this.collectRef.doc(docName).set(pushData)
        //return this.dataRef.update(tmpObj)
        /*.then(function() {
            console.log("Document successfully updated!");
        })*/
        .catch(function(error) {
          // The document probably doesn't exist.
          console.error("Error updating document: ", error);
        });
    }
  }
  /*
   * DATA - Push data to an array in a document
   * @args: objectName, pushData
   * @return: (error)
   */
  async pushToObject(objectName, pushData, key) {
    var tmpData;
    //cause we need to pass as an object, not array to firestore
    tmpData = {};
    console.log(this.documentPath);
    console.log(tmpData);
    tmpData[key] = pushData;
    console.log(tmpData);
    console.log(objectName);

    //#TO-DO Handle if object is given, string works
    if(typeof objectName == "string") {
      var tmpObj = {};
      tmpObj[objectName] = tmpData; //name was given
    } else {
      var tmpObj = objectName;    //object was given
    }
    return this.dataRef.set(tmpObj, {
        merge: true
      })
      //return this.dataRef.update(tmpObj)
      /*.then(function() {
          console.log("Document successfully updated!");
      })*/
      .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
      });
  }
  /*
   * DATA - Update data to an array in a document
   * @args: updateData, refreshData
   * @return: (error)
   * @info: use dot notation so it only updates nested https://firebase.google.com/docs/firestore/manage-data/add-data#update_fields_in_nested_objects
   */
  async update(updateData, refreshData) {
    var dbRef = this.collectRef;
    //this.data.push("Test");
    // Set the "capital" field of the city 'DC'
    return this.dataRef.update(updateData).then(function() {
      console.log("Document successfully updated!");
      if (refreshData == true) { setTimeout(this._onDocumentPathDyn(), 0) }
    }.bind(this)).catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
  }
  fbRoute() {
    /*if (this.user && !this.noUser) {
      this.set('dataLocation', [this.rootPath, this.user.uid, this.requestedLocation].join('/'));
    } else if (this.noUser) {
      this.set('dataLocation', this.requestedLocation);
    }*/
  }
  _firebaseLoaded(error) {
    /*
    if(this.noUser) {
      console.log ("data-firestore Data-User Required " + this.noUser);
      console.log ("data-firestore Data-Location " + this.dataLocation);
      console.log("___________" + error);
      console.log(error);
      if (error) {
        alert("Is empty");
      }
    }*/
  }
  dataChanged() {
    console.log("data-firestore Data-User Required " + this.user);
    console.log("data-firestore Data-Location " + this.dataLocation);
    console.log("___________");
    console.log(this.data);

/*          // 1st argument to beforeNextRender is used as the "this"
      // value when the callback is invoked.
      Polymer.RenderStatus.beforeNextRender(this, function() {
        this.dispatchEvent(new CustomEvent('notifyResize', {
          bubbles: true,
          composed: true
        }));
      });
*/
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
      //this.$.fbdoc.disabled = true;
    } else {
      //this.$.fbdoc.disabled = false;
    }
    this.fbRoute();
  }
}
window.customElements.define(dataFirestore.is, dataFirestore);
