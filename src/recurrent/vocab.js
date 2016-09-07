/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
export default class Vocab {
  constructor(values, maxThreshold) {
    maxThreshold = maxThreshold || 0;
    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters
    this.indexTable = {};
    this.characterTable = {};
    this.characters = [];
    var tempCharactersTable = {};
    for (var vocabIndex = 0, vocabLength = values.length; vocabIndex < vocabLength; vocabIndex++) {
      var characters = values[vocabIndex].toString();
      for (var characterIndex = 0, charactersLength = characters.length; characterIndex < charactersLength; characterIndex++) {
        var character = characters[characterIndex];
        if (character in tempCharactersTable) continue;
        tempCharactersTable[character] = true;
        this.characters.push(character);
      }
    }

    // filter by count threshold and create pointers

    // NOTE: start at one because we will have START and END tokens!
    // that is, START token will be index 0 in model letter vectors
    // and END token will be index 0 in the next character softmax
    charactersLength = this.characters.length;
    for(characterIndex = 0; characterIndex < charactersLength; characterIndex++) {
      character = this.characters[characterIndex];
      if(characterIndex >= maxThreshold) {
        // add character to vocab
        this.indexTable[character] = characterIndex + 1;
        this.characterTable[characterIndex + 1] = character;
      }
    }
  }
  toIndexes(phrase, maxThreshold) {
    maxThreshold = maxThreshold || 0;
    var result = [];
    var indexTable = this.indexTable;

    for (var i = 0, max = phrase.length; i < max; i++) {
      var character = phrase[i];
      var index = indexTable[character];
      if (index < maxThreshold) continue;
      result.push(index);
    }

    return result;
  }

  toCharacters(indexes, maxThreshold) {
    maxThreshold = maxThreshold || 0;
    var result = [];
    var characterTable = this.characterTable;

    for (var i = 0, max = indexes.length; i < max; i++) {
      var index = indexes[i];
      if (index < maxThreshold) continue;
      var character = characterTable[index];
      result.push(character);
    }

    return result;
  }
}
