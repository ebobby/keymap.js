"use strict";

function BindingTrie(debug) {
  this._trie = {};
  this._debug = debug;
}

BindingTrie.prototype._log = function(msg) {
  if (this._debug) {
    console.debug(msg);
  }
};

BindingTrie.prototype._bindingToPieces = function(binding) {
  return new String(binding).toString().replace(/\s{2,}/g, ' ').split(' ');
};

BindingTrie.prototype.insert = function(binding, fn) {
  var pieces = this._bindingToPieces(binding),
      currentLevel = this._trie,
      currentBinding = [];

  for (var i = 0; i < pieces.length - 1; i++) {
    var key = pieces[i];

    currentBinding.push(key);

    if (typeof(currentLevel[key]) == 'function') {
      this._log(binding + "is prefixed by " + currentBinding.join(' ') + " and it's already set.");
      return false;
    }

    if (currentLevel[key] == null) {
      currentLevel[key] = {};
    }

    currentLevel = currentLevel[key];
  }

  currentBinding.push(pieces[i]);

  if (typeof(currentLevel[pieces[i]]) == "object") {
    this._log(currentBinding.join(' ') + "is prefix for other bindings.");
    return false;
  }

  currentLevel[pieces[i]] = fn;

  return true;
};

BindingTrie.prototype.traverser = function() {
  var currentLevel = this._trie;

  return {
    isPrefix: function(prefix) {
      return currentLevel[prefix] != null;
    },

    value: function(prefix) {
      return currentLevel[prefix];
    },

    move: function(prefix) {
      currentLevel = currentLevel[prefix];
    }
  };
};
