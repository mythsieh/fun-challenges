
// Objective:
// To create an algorithm written in JavaScript that replaces the top 25 most common words based on their
// frequency with the their count inline. Your code should be pasteable and runnable in the browser console.

// Requirements:

// ● Page to process and run your code on: https://en.wikipedia.org/wiki/Programming_language
// ● A word may not​include HTML tags, JavaScript code, numbers, spaces or punctuation.
// ● A word may not​be from the top 100 common words in english and you may not hardcode​ these into
// the source code https://en.wikipedia.org/wiki/Most_common_words_in_English
// ● Also please remove common words “are”, “is”, “where”, “was” and any single characters
// ● You may use JQuery and standard JavaScript but no other third party library
// ● Your code should be runnable on recent Chrome or Firefox browser.

(function() {

  // container for heap to find the top 25 words
  var wordsCounter = {};

  // container to decide when the end of a word is
  var ends = {
    " ": " ",
    "\n": "\n",
    ",": ",",
    ".": ".",
    ")": ")",
    "'": "'",
    ";": ";"
  }

  // container for banned words
  var bannedWords = {
    "are": "are",
    "is": "is",
    "where": "where",
    "was": "was"
  };

  // container for top 25 words
  var finalList = {};

  // helper function for adding current word to a container
  var addCurrentWord = function(currentWord, container){
    if (currentWord in container){
      container[currentWord]++;
    } else {
      container[currentWord] = 1;
    }
  };

  // helper function for checking if a char is an alphabetical character
  var validUTFChar = function(char){
    var utf = char.charCodeAt(0);
    if ((utf >= 65 && utf <=90) || (utf >= 97 && utf <= 122)){
      return true;
    }  else {
      return false;
    }
  };

  // helper function for grabbing words from a string
  var stringCheck = function(str){
    // current words container
    var container = {}
    // current word container
    var currentWord = "";
    // loop through string
    for (var i = 0; i < str.length; i++){
      // if current char is a bracket
      if (str[i] === "{"){
        // throw away current string
        return false;
      }
      // if current char is an end/punctuation
      if (str[i] in ends){
        // if currentWord is not empty
        if (currentWord.length > 0){
          // add current word to words container
          addCurrentWord(currentWord.toLowerCase(), container); 
          // reset currentWord
          currentWord = "";
        } 
      // if current char is not an end/punctuation
      } else {
        // add string char to current word
        if (validUTFChar(str[i])){
          currentWord += str[i];
        }
        // if string is at the end and there's still a current word
        if (i === str.length - 1 && currentWord.length > 0){
          addCurrentWord(currentWord.toLowerCase(), container);
        }
      }
    }
    return container;
  }

  // Min Heap constructor for getting top 25
  var BinaryMinHeap = function(){
    this._heap = [];
    this._compare = function(i, j){return i < j};
  };

  BinaryMinHeap.prototype.getRoot = function () {
    return this._heap[0];
  }

  BinaryMinHeap.prototype.insert = function(wordCount){
    // add node to end of heap
    this._heap.push(wordCount);
    // locate node's parent
    var index = this._heap.length - 1;
    var parentIndex = Math.floor((index - 1)/2);
    // while node has parent and is less than parent
    while (index > 0 && (this._compare(this._heap[index][1], this._heap[parentIndex][1]))){
      // swap node and parent
      swapNodesAt(index, parentIndex, this);
      index = parentIndex;
      parentIndex = Math.floor((index -1) / 2);
    }
  };

  BinaryMinHeap.prototype.removeRoot = function(){
    // swap root with last node
    swapNodesAt(this._heap.length - 1, 0, this);
    // remove last node and store it to be returned later
    var originalRoot = this._heap.pop();
    var temporaryRootIndex = 0;
    // compare children nodes to get the index of the lesser of them
    var lesserChildIndex = getLesserChildIndex(temporaryRootIndex, this);
    // while there are children nodes and the lesser of them is less than the new root
    while (lesserChildIndex && this._compare(this._heap[lesserChildIndex][1], this._heap[temporaryRootIndex][1])){
      // swap the root node with the lesser of the children
      swapNodesAt(lesserChildIndex, temporaryRootIndex, this);
      temporaryRootIndex = lesserChildIndex;
      lesserChildIndex = getLesserChildIndex(temporaryRootIndex, this);
    }
    // return original root
    return originalRoot;
  };

  // helper function for swapping nodes
  var swapNodesAt = function(index, parentIndex, binaryHeap){
    var heap = binaryHeap._heap;
    var temp = heap[index];
    heap[index] = heap[parentIndex];
    heap[parentIndex] = temp;
  };

  // helper function for getting the lesser node's value among children 
  var getLesserChildIndex = function(parentIndex, binaryHeap){
    var childIndices = [parentIndex * 2 + 1, parentIndex * 2 + 2].filter(function(index){
      return index < binaryHeap._heap.length;
    });
    // if 0 children
    if (childIndices.length === 0){
      return false;
    // if 1 child
    } else if (childIndices.length === 1){
      return childIndices[0];
    // if 2 children compare children nodes to get the index of the lesser of them
    } else if (binaryHeap._compare(binaryHeap._heap[childIndices[0]][1], binaryHeap._heap[childIndices[1]][1])){
      return childIndices[0];
    } else {
      return childIndices[1];
    }
  };

  // native dom walker for getting text nodes
  var walker = document.createTreeWalker(
    document.body, 
    NodeFilter.SHOW_TEXT, 
    { acceptNode: function(node) {
        return NodeFilter.FILTER_ACCEPT; 
      }
    },
    false
  );
  
  // grab all words and count
  var node = walker.nextNode();

  while(node) {
    var str = node.textContent;
    var currentWords = stringCheck(str);
    if (currentWords){
      // loop through currentWords
      for (var key in currentWords){
        // if key exists in wordsCounter
        if (key in wordsCounter){
          // add them together
          wordsCounter[key] = wordsCounter[key] + currentWords[key];
        } else {
          wordsCounter[key] = currentWords[key];
        }
      }
    };
    node = walker.nextNode();
  }

  // grab most common words
  $.get( "https://en.wikipedia.org/wiki/Most_common_words_in_English", function( data ) {
    $(data).find('td').each(function(){
      if (this.textContent.length < 50){
        if (validUTFChar(this.textContent[0])){
          bannedWords[this.textContent] = this.textContent;
        }
      }
    });

  // determine top 25 words
  }).done(function(){
    var top25 = new BinaryMinHeap();
    // loop through words counter container
    for (var key in wordsCounter){
      // if word in bannedWords or if word is one character
      if (key in bannedWords || key.length === 1){
        continue;
      } 
      // if 25 nodes have been reached
      if (top25._heap.length >= 25){
        // compare with root node only
        var root = top25.getRoot();
        if (wordsCounter[key] > top25.getRoot()[1]){
          // remove root
          top25.removeRoot();
          // insert new value
          top25.insert([key, wordsCounter[key]]);
        }
      // if 25 nodes have not been reached yet
      } else {
        top25.insert([key, wordsCounter[key]]);
      }
    }
    // change top25 array to hash
    for (var i = 0; i < top25._heap.length; i++){
      var word = top25._heap[i][0];
      var count = top25._heap[i][1];
      finalList[word] = count;
    }
    // loop through final list and replace words with their counts
    for (var key in finalList){
      var re = new RegExp(" " + key, 'g');
      document.body.innerHTML = document.body.innerHTML.replace(re, " " + finalList[key]);
      var re2 = new RegExp(key + ' ', 'g');
      document.body.innerHTML = document.body.innerHTML.replace(re2, finalList[key] + ' ');
      var capitalized = key[0].toUpperCase() + key.slice(1)
      var re3 = new RegExp(capitalized, 'g');
      document.body.innerHTML = document.body.innerHTML.replace(re3, finalList[key]);
    }
  });

})();




