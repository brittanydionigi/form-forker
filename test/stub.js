/* global define, beforeEach, describe, sinon, it, chai, afterEach */

define(function (require) {
  'use strict';

  beforeEach(function () {
    sinon.spy(window.console, 'log');
  });

  describe('console module', function () {
    it('should log to window.console', function () {
      var console = require('app/console');

      console.log('test');

      chai.expect(window.console.log.called).to.equal(true);

    });

    it('should log twice', function () {
      var console = require('app/console');

      console.log('test');

      chai.expect(window.console.log.firstCall.args[0] === 'going to console with').to.equal(true);
      chai.expect(window.console.log.secondCall.args[0] === 'test').to.equal(true);

    });
  });

  afterEach(function () {
    window.console.log.restore();
  });

});
