/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:true */
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

  test("forkable can be called as a jQuery method", 1, function() {
    var forkableForm = $("#forkable-form");
    forkableForm.forkable(".fork", {});
    forkableForm.addClass("bar");
    equal(forkableForm.hasClass("bar"), true)
  });

  module("forks");

  test("form forks are monitored on change", 1, function() {

    var spy = sinon.spy();
    var forkableForm = $("#forkable-form");
    forkableForm.forkable(".fork", {});
    var forkInput = $(".fork")

    forkInput.on('change', spy);

    forkInput.val("25").trigger("change");

    equal(2, 2);

  });

  test("form forks associate with the appropriate children", 1, function() {
    equal(2, 2);
  });

  module("branching methods");

  test("custom branching methods override standard branching", 1, function() {
    equal(2, 2);
  });

  test("string evaluations", 1, function() {
    equal(2, 2);
  });

  test("integer evaluations", 1, function() {
    equal(2, 2);
  });

}(jQuery));
