define('demoapp/tests/app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'app.js should pass jshint.\napp.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 4, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 5, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 9, col 1, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 16, col 3, \'object short notation\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 21, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n8 errors');
  });
});
define('demoapp/tests/controllers/chat.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/chat.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/chat.js should pass jshint.\ncontrollers/chat.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 5, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 8, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 59, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 60, col 21, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 62, col 9, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 64, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 69, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 69, col 40, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 70, col 30, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 71, col 38, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 72, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 72, col 61, Missing semicolon.\ncontrollers/chat.js: line 73, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 75, col 78, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 78, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 86, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 87, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 93, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 115, col 29, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 117, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 118, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 119, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 120, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 128, col 45, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 139, col 41, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 151, col 61, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 188, col 41, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 230, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 230, col 36, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 247, col 31, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 248, col 36, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 262, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 263, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 266, col 14, Missing semicolon.\ncontrollers/chat.js: line 275, col 41, Missing semicolon.\ncontrollers/chat.js: line 284, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 285, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 287, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 303, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 304, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 339, col 17, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 350, col 34, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 350, col 42, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 352, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 354, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 357, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 358, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 359, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 362, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 362, col 122, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 363, col 53, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 370, col 61, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 380, col 57, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 392, col 77, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 420, col 57, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 354, col 74, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (CryptoUtils, msg, key, privateKey, Ember, ENV, console)\ncontrollers/chat.js: line 449, col 50, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (console, reject)\ncontrollers/chat.js: line 456, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 456, col 52, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 458, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 475, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 476, col 52, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 477, col 49, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 478, col 48, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 491, col 33, \'promises\' is already defined.\ncontrollers/chat.js: line 498, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 498, col 48, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 499, col 92, Missing semicolon.\ncontrollers/chat.js: line 500, col 103, Missing semicolon.\ncontrollers/chat.js: line 501, col 101, Missing semicolon.\ncontrollers/chat.js: line 504, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 504, col 41, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 505, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 507, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 510, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 511, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 512, col 49, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 515, col 53, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 515, col 126, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 516, col 57, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 523, col 65, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 533, col 61, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 545, col 81, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 573, col 61, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 507, col 74, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (CryptoUtils, msg, privateKey, Ember, ENV, console)\ncontrollers/chat.js: line 604, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 604, col 52, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 606, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 623, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 624, col 52, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 625, col 49, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 626, col 48, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 662, col 17, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 668, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 669, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 670, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 674, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 675, col 21, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 730, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 748, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 762, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 770, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 771, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 772, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 774, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 801, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 802, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 803, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 804, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 805, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 806, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 807, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 808, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 809, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 811, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 811, col 24, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 813, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 815, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 815, col 102, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 816, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 816, col 47, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 818, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 818, col 39, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 819, col 28, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 828, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 829, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 830, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 840, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 858, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 864, col 29, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 910, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 911, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 932, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 933, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 938, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 948, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 948, col 33, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 963, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 964, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 989, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 999, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 999, col 33, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1013, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1014, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1037, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1048, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1054, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1057, col 15, Missing semicolon.\ncontrollers/chat.js: line 1060, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1061, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1086, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1095, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1097, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1098, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1099, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1101, col 14, Missing semicolon.\ncontrollers/chat.js: line 1109, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1109, col 34, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1130, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1132, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1133, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1134, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1135, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1136, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1137, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1138, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1139, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1140, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1142, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1146, col 57, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1147, col 38, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1148, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1150, col 59, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1164, col 44, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1165, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1169, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1181, col 30, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1196, col 30, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1200, col 44, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1201, col 38, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1202, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1207, col 36, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1208, col 95, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1213, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1216, col 26, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1216, col 34, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1217, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1218, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1220, col 30, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1220, col 41, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1222, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1224, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1225, col 51, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1225, col 51, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (window)\ncontrollers/chat.js: line 1228, col 55, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1228, col 55, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (CryptoUtils, member)\ncontrollers/chat.js: line 1231, col 51, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1231, col 51, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (forkKeys, member, console)\ncontrollers/chat.js: line 1245, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1255, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1255, col 81, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1255, col 80, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (newForkMemberMessage)\ncontrollers/chat.js: line 1263, col 26, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1276, col 26, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1279, col 32, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1293, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1295, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1312, col 78, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1325, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1331, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1344, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1346, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1361, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1362, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1363, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1364, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1365, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1365, col 66, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1366, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1367, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1369, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1370, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1373, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1376, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1377, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1390, col 29, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1391, col 33, Misleading line break before \'?\'; readers may interpret this as an expression boundary.\ncontrollers/chat.js: line 1393, col 37, Misleading line break before \'?\'; readers may interpret this as an expression boundary.\ncontrollers/chat.js: line 1397, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1398, col 51, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1399, col 55, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1400, col 51, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1401, col 41, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1408, col 50, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1413, col 101, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1437, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1437, col 103, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1438, col 37, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1438, col 81, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1440, col 59, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1441, col 63, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1442, col 59, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1442, col 65, \'computed property names\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1445, col 82, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1459, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1496, col 32, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 1504, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1505, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1505, col 47, Missing semicolon.\ncontrollers/chat.js: line 1517, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1518, col 26, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1518, col 34, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1538, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1549, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1561, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1562, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1563, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1564, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1565, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1569, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1575, col 14, Missing semicolon.\ncontrollers/chat.js: line 1595, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1596, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1606, col 24, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1606, col 33, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1620, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1621, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1624, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1627, col 14, Missing semicolon.\ncontrollers/chat.js: line 1635, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1635, col 33, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1652, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1653, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1654, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1655, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1657, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1661, col 14, Missing semicolon.\ncontrollers/chat.js: line 1680, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1681, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1682, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1686, col 14, Missing semicolon.\ncontrollers/chat.js: line 1706, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1707, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1708, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1711, col 14, Missing semicolon.\ncontrollers/chat.js: line 1730, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1731, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1732, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1740, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1745, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1751, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1752, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1760, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1760, col 34, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1772, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1773, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 1778, col 14, Missing semicolon.\n\n300 errors');
  });
});
define('demoapp/tests/controllers/login.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/login.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/login.js should pass jshint.\ncontrollers/login.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/login.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/login.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/login.js: line 6, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 7, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 8, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 9, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n7 errors');
  });
});
define('demoapp/tests/controllers/signup.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/signup.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/signup.js should pass jshint.\ncontrollers/signup.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 4, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 7, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 10, col 10, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 12, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 13, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 14, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 15, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n10 errors');
  });
});
define('demoapp/tests/helpers/checkPermission.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/checkPermission.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'helpers/checkPermission.js should pass jshint.\nhelpers/checkPermission.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\n\n1 error');
  });
});
define('demoapp/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('demoapp/tests/helpers/destroy-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('demoapp/tests/helpers/eq.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/eq.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'helpers/eq.js should pass jshint.\nhelpers/eq.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nhelpers/eq.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nhelpers/eq.js: line 7, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('demoapp/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'demoapp/tests/helpers/start-app', 'demoapp/tests/helpers/destroy-app'], function (exports, _qunit, _demoappTestsHelpersStartApp, _demoappTestsHelpersDestroyApp) {
  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _demoappTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        (0, _demoappTestsHelpersDestroyApp['default'])(this.application);

        if (options.afterEach) {
          options.afterEach.apply(this, arguments);
        }
      }
    });
  };
});
define('demoapp/tests/helpers/module-for-acceptance.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('demoapp/tests/helpers/neq.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/neq.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'helpers/neq.js should pass jshint.\nhelpers/neq.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nhelpers/neq.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nhelpers/neq.js: line 7, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('demoapp/tests/helpers/resolver', ['exports', 'ember/resolver', 'demoapp/config/environment'], function (exports, _emberResolver, _demoappConfigEnvironment) {

  var resolver = _emberResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _demoappConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _demoappConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('demoapp/tests/helpers/resolver.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('demoapp/tests/helpers/start-app', ['exports', 'ember', 'demoapp/app', 'demoapp/config/environment'], function (exports, _ember, _demoappApp, _demoappConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _demoappConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _demoappApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('demoapp/tests/helpers/start-app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define('demoapp/tests/integration/components/permission-checker-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('permission-checker', 'Integration | Component | permission checker', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'revision': 'Ember@1.13.12',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 22
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'permission-checker', ['loc', [null, [1, 0], [1, 22]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:" + EOL +
    this.render(Ember.HTMLBars.template((function () {
      var child0 = (function () {
        return {
          meta: {
            'revision': 'Ember@1.13.12',
            'loc': {
              'source': null,
              'start': {
                'line': 2,
                'column': 4
              },
              'end': {
                'line': 4,
                'column': 4
              }
            }
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode('      template block text\n');
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();

      return {
        meta: {
          'revision': 'Ember@1.13.12',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['block', 'permission-checker', [], [], 0, null, ['loc', [null, [2, 4], [4, 27]]]]],
        locals: [],
        templates: [child0]
      };
    })()));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('demoapp/tests/integration/components/permission-checker-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - integration/components/permission-checker-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/permission-checker-test.js should pass jshint.');
  });
});
define('demoapp/tests/router.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'router.js should pass jshint.\nrouter.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nrouter.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nrouter.js: line 4, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nrouter.js: line 14, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n4 errors');
  });
});
define('demoapp/tests/routes/chat.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/chat.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/chat.js should pass jshint.\nroutes/chat.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 4, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 5, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/chat.js: line 10, col 23, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 14, col 24, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\n\n6 errors');
  });
});
define('demoapp/tests/routes/login.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/login.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/login.js should pass jshint.\nroutes/login.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/login.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n2 errors');
  });
});
define('demoapp/tests/routes/signup.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - routes/signup.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'routes/signup.js should pass jshint.\nroutes/signup.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/signup.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n2 errors');
  });
});
define('demoapp/tests/services/storage-service.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - services/storage-service.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/storage-service.js should pass jshint.\nservices/storage-service.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nservices/storage-service.js: line 3, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nservices/storage-service.js: line 68, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n3 errors');
  });
});
define('demoapp/tests/services/user-service.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - services/user-service.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'services/user-service.js should pass jshint.');
  });
});
define('demoapp/tests/test-helper', ['exports', 'demoapp/tests/helpers/resolver', 'ember-qunit'], function (exports, _demoappTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_demoappTestsHelpersResolver['default']);
});
define('demoapp/tests/test-helper.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
define('demoapp/tests/unit/controllers/chat-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('controller:chat', 'Unit | Controller | chat', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
});
define('demoapp/tests/unit/controllers/chat-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/controllers/chat-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/chat-test.js should pass jshint.');
  });
});
define('demoapp/tests/unit/routes/chat-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:chat', 'Unit | Route | chat', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('demoapp/tests/unit/routes/chat-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/routes/chat-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/chat-test.js should pass jshint.');
  });
});
define('demoapp/tests/unit/routes/login-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:login', 'Unit | Route | login', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('demoapp/tests/unit/routes/login-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/routes/login-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/login-test.js should pass jshint.');
  });
});
define('demoapp/tests/unit/routes/signup-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:signup', 'Unit | Route | signup', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('demoapp/tests/unit/routes/signup-test.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - unit/routes/signup-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/signup-test.js should pass jshint.');
  });
});
define('demoapp/tests/utils/crypto.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - utils/crypto.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'utils/crypto.js should pass jshint.\nutils/crypto.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 3, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 98, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 98, col 85, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 107, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 107, col 90, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 142, col 58, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 143, col 50, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 152, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 152, col 81, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 153, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 153, col 66, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 160, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 178, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 179, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 182, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 182, col 62, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 183, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 183, col 63, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 195, col 9, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 195, col 67, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 196, col 9, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 196, col 68, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 245, col 12, Missing semicolon.\nutils/crypto.js: line 250, col 43, Missing semicolon.\nutils/crypto.js: line 253, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 253, col 98, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 254, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 254, col 72, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 254, col 92, Missing semicolon.\nutils/crypto.js: line 255, col 41, Missing semicolon.\nutils/crypto.js: line 284, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n32 errors');
  });
});
/* jshint ignore:start */

require('demoapp/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map