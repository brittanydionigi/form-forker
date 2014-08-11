/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:true */
(function($) {

  var forkableForm,
      forkInputs;
  /*
    ======== QUnit Reference ========
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
    $("#forkable-form").forkable();
    equal($("#forkable-form").hasClass("forkable"), true, "Form made forkable and has class 'forkable'")
  });



  QUnit.module("forks", {
    setup: function() {
      // prepare something for all following tests
      forkableForm = $("#forkable-form").forkable();
      forkInputs = forkableForm.forks;

      sinon.spy(forkableForm, "testChangeEvent");
    },
    teardown: function() {
      // clean up after each test
      forkableForm.testChangeEvent.restore();
    }
  });

  test("form forks are all found", 1, function() {
    var forkInputs = forkableForm.forks;
    deepEqual(forkInputs.length, 5, "There are 5 forks in the form");

  });

  test("forks are monitored on change", 1, function() {
    $.each(forkInputs, function(index, forkInput) {
      if (forkInput.prop("type") === "text" || forkInput.prop("type") === "hidden") {
        forkInput.val("25").trigger("change");
      }
      else if (forkInput.prop("type") === "radio") {
        $("input[value='2']").prop('checked', true).trigger("change");
      }
      else {
        forkInput.val("morethan100").trigger("change");
      }
    });

    deepEqual(forkableForm.testChangeEvent.callCount, 5, "testChangeEvent was called 5 times for 5 inputs");
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
