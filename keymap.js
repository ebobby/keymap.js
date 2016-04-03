"use strict";

function Keymap(debug) {
  this._trie = new BindingTrie(debug);
  this._debug = debug;
}

Keymap.prototype.addBinding = function(binding, fn) {
  return this._trie.insert(binding, fn);
};

Keymap.prototype.Load = function(onKey, onError) {
  var currentKeymap = this._trie,
      currentKeyBinding = [],
      traverser = currentKeymap.traverser();

  function _resetState() {
    traverser = currentKeymap.traverser();
    currentKeyBinding = [];
  }

  function _currentKeyBinding() {
    return currentKeyBinding.join(' ');
  }

  function _tryCall(fn, params) {
    if (typeof(fn) == 'function') {
      fn.apply(null, params);
    }
  }

  document.onkeypress = function(event) {
    var pressed = [];

    if (event.ctrlKey) {
      pressed.push('C');
    }

    if (event.altKey) {
      pressed.push('M');
    }

    if (event.code.startsWith('Key')) {
      var character = event.code.charAt(event.code.length - 1).toLowerCase();

      if (event.shiftKey) {
        character = character.toUpperCase();
      }

      pressed.push(character);
    }
    else if (event.code.startsWith('Digit')) {
      if (event.shiftKey) {
        pressed.push(String.fromCharCode(event.charCode));
      }
      else {
        pressed.push(event.code.charAt(event.code.length - 1));
      }
    }
    else{
      var specialChar = String.fromCharCode(event.charCode);

      if (specialChar == "") {
        return;
      }

      pressed.push(specialChar);
    }

    var key = pressed.join('-');

    if (traverser.isPrefix(key)) {
      currentKeyBinding.push(key);

      if (typeof(onKey) == 'function') {
        _tryCall(onKey, [ _currentKeyBinding() ]);
      }

      if (typeof(traverser.value(key)) == 'function') {
        traverser.value(key)(_currentKeyBinding());
        _resetState();
      }
      else {
        traverser.move(key);
      }
    }
    else {
      _tryCall(onError);

      _resetState();
    }
  };
};
