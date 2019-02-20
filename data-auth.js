

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {} from '@polymer/polymer/lib/legacy/polymer.dom.js';

import '@polymer/paper-dialog/paper-dialog.js';


import firebase from '@firebase/app';
import '@firebase/auth';

import {DataCommonused} from './data-commonused.js';

// paper
import '@polymer/paper-dialog/paper-dialog.js'
import '@polymer/paper-button/paper-button.js'

// firebase
//import '@polymer/polymerfire/firebase-app.js'
//import '@polymer/polymerfire/firebase-auth.js'


/*import firestore from '@firebase/firestore';
import { collectionData } from '../../node_modules/rxfire/firestore';
import { tap } from '../../node_modules/rxjs/operators';

import './data-firebase.js';*/

//import '../components/firebase-functions-script.js';

class DataAuth extends DataCommonused(PolymerElement) {
  static get template() {
    return html`
    <custom-style>
    <style>
      paper-dialog {
        padding: 32px;
        width: 90%;
        height: 90%;
        background-color:rgba(255, 255, 255, 0.8);
        text-align:center
      }
      .google-sign-in {
        display: inline-block;
        background: #4285f4;
        color: white;
        width: 190px;
        border-radius: 5px;
        white-space: nowrap;
      }
      .google-sign-in:hover {
        cursor: pointer;
      }
      .google-sign-in-icon {
        background: url('/images/google-sign-in/g-normal.png') transparent 5px 50% no-repeat;
        display: inline-block;
        vertical-align: middle;
        width: 42px;
        height: 42px;
        border-right: #2265d4 1px solid;
      }
      .google-sign-in-label {
        display: inline-block;
        vertical-align: middle;
        padding-left: 42px;
        padding-right: 42px;
        font-size: 14px;
        font-weight: bold;
        /* Use the Roboto font that is loaded in the <head> */
        font-family: 'Roboto', sans-serif;
      }

    </style>
  </custom-style>






    <paper-dialog id="dialogId" modal="" entry-animation="fade-in-animation" exit-animation="fade-out-animation" on-iron-overlay-opened="alert('gag')">

      <h2>Hi there!</h2>
      <div>
        <paper-button class="google-sign-in" tabindex="0" on-click="signIn">
          <span class="google-sign-in-label">Sign in with Google</span>
          [[user]]

        </paper-button>
      </div>
    </paper-dialog>
`;
  }

  static get is() {
    return 'data-auth';
  }

  static get properties() {
    return {
      user: {
        type: Object,
        notify: true
      },
      statusKnown: {
        type: Boolean,
        notify: true
      },
      loggedOutBefore: Boolean,
      openState: {
        type: Boolean,
        notify: true
      }
    }
  }


  static get observers() {
    return [
      '_checkStatus(user, statusKnown)'
    ]
  }



  ready() {
    super.ready();

    this._checkStatus();
    console.log(this.statusKnown);
    var config = {
      apiKey: "",
      authDomain: "",
      databaseURL: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: ""
    };
    this.fbApp = firebase.initializeApp(config);
    console.log(this.fb);
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        this.user = user;
      } else {
        // No user is signed in.
      }
      this.statusKnown = true
    }.bind(this));
  }

  signIn() {
    console.log(firebase);
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  signOut() {
    this.$.auth.signOut();
    this.set('user', false);
    this.set('loggedOutBefore', true);
  }




  //Check login status
  _checkStatus() {
    console.log(this.statusKnown);
    //if status is known and no user, open modal login
    if (!this.user && this.statusKnown) {
      console.log("popup");
      //this.set('openState', true); #TO-DO should be like this, but due to bug: https://github.com/PolymerElements/paper-dialog/issues/79
      var body = document.querySelector('body');
      document.body.appendChild(this.$.dialogId);
      this.$.dialogId.open();
      //else no login window
    } else {
      this.$.dialogId.close();
    }
  }
}

window.customElements.define('data-auth', DataAuth);
