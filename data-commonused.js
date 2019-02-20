import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js'


let internalMixinB = (base) =>
  class extends base {

/*  return class extends superClass {
    constructor() {
      super();
    }*/
    static get properties() {
      return {
        //add disabled state to custom elements
        fbApp: {
          type: Object,
          notify: true,
          reflectToAttribute: true
        }

      }
    }


  }

  export const DataCommonused = dedupingMixin(internalMixinB);
