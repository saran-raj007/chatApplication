define('demoapp/tests/app.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'app.js should pass jshint.\napp.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 4, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\napp.js: line 7, col 1, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 14, col 3, \'object short notation\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\napp.js: line 19, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n7 errors');
  });
});
define('demoapp/tests/controllers/chat.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/chat.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/chat.js should pass jshint.\ncontrollers/chat.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 4, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 9, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 30, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 31, col 21, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 33, col 9, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 36, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 41, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 41, col 40, \'template literal syntax\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 42, col 30, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 43, col 38, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 44, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 45, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 64, col 31, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 65, col 36, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/chat.js: line 78, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 79, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 80, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 112, col 17, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 120, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 120, col 41, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 121, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 128, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 130, col 103, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (msg_pack, msg)\ncontrollers/chat.js: line 141, col 42, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (console)\ncontrollers/chat.js: line 152, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 152, col 41, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 153, col 33, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 155, col 115, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (msg_pack, msg)\ncontrollers/chat.js: line 168, col 42, Functions declared within loops referencing an outer scoped variable may lead to confusing semantics. (console)\ncontrollers/chat.js: line 208, col 17, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 215, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 216, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 217, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 221, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 222, col 21, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 252, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 270, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 277, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 286, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 287, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 288, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 290, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 320, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 321, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 325, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 326, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 327, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 328, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 337, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 355, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 384, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 385, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 407, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 422, col 25, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 422, col 33, \'for of\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 436, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 446, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/chat.js: line 447, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n61 errors');
  });
});
define('demoapp/tests/controllers/login.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/login.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/login.js should pass jshint.\ncontrollers/login.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/login.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/login.js: line 5, col 9, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 6, col 13, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 7, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/login.js: line 8, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n6 errors');
  });
});
define('demoapp/tests/controllers/signup.jshint', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint - controllers/signup.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/signup.js should pass jshint.\ncontrollers/signup.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 2, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 3, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 5, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\ncontrollers/signup.js: line 8, col 10, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 10, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 11, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 12, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\ncontrollers/signup.js: line 13, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\n\n9 errors');
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
    assert.ok(false, 'routes/chat.js should pass jshint.\nroutes/chat.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 3, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 4, col 5, \'concise methods\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nroutes/chat.js: line 9, col 23, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nroutes/chat.js: line 12, col 24, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\n\n5 errors');
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
    assert.ok(false, 'utils/crypto.js should pass jshint.\nutils/crypto.js: line 1, col 1, \'import\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 3, col 1, \'const\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 98, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 98, col 85, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 107, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 107, col 90, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 142, col 58, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 143, col 50, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 151, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 151, col 81, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 152, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 152, col 66, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 159, col 13, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 177, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 178, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 181, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 181, col 62, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 182, col 21, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 182, col 63, \'spread operator\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 194, col 9, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 194, col 67, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 195, col 9, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 195, col 68, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 244, col 12, Missing semicolon.\nutils/crypto.js: line 249, col 43, Missing semicolon.\nutils/crypto.js: line 252, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 252, col 98, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 253, col 17, \'let\' is available in ES6 (use \'esversion: 6\') or Mozilla JS extensions (use moz).\nutils/crypto.js: line 253, col 72, \'arrow function syntax (=>)\' is only available in ES6 (use \'esversion: 6\').\nutils/crypto.js: line 253, col 92, Missing semicolon.\nutils/crypto.js: line 254, col 41, Missing semicolon.\nutils/crypto.js: line 283, col 1, \'export\' is only available in ES6 (use \'esversion: 6\').\n\n32 errors');
  });
});
/* jshint ignore:start */

require('demoapp/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map