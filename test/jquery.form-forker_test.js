'use strict';

/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global sinon:true */
(function($) {

  var forkableForm = $('#forkable-form').forkable(),
      forkInputs = forkableForm.forks;
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

  test('forkable can be called as a jQuery method', 1, function() {
    equal($('#forkable-form').hasClass('forkable'), true, 'Form made forkable and has class \'forkable\'');
  });

  QUnit.module('forks', {
    setup: function() {
      forkableForm = $('#forkable-form').forkable();
      forkInputs = forkableForm.forks;

      sinon.spy(forkableForm, 'handleInputChange');
    },
    teardown: function() {
      forkableForm.handleInputChange.restore();
    }
  });

  test('form forks are all found', 1, function() {
    var forkInputs = forkableForm.forks;
    deepEqual(forkInputs.length, 5, 'There are 6 forks in the form');

  });

  test('forks are monitored on change', 1, function() {
    $.each(forkInputs, function(index, forkInput) {
      if (forkInput.prop('type') === 'text' || forkInput.prop('type') === 'hidden') {
        forkInput.val('25').trigger('change');
      }
      else if (forkInput.prop('type') === 'radio') {
        $('input[value="2"]').prop('checked', true).trigger('change');
      }
      else {
        forkInput.val('morethan100').trigger('change');
      }
    });

    deepEqual(forkableForm.handleInputChange.callCount, 5, 'handleInputChange was called 5 times for 5 inputs');
  });

  test('form forks associate with the appropriate children', 2, function() {
    $('input[name="person_age"]').val('5').trigger('change');
    var betweenThreeAndSevenHidden = $('input[name="favorite_candy"]').parent().hasClass('hidden');
    var notFive = $('input[name="started_kindergarden_this_year"]').parent().hasClass('hidden');
    equal(betweenThreeAndSevenHidden, false, 'Favorite candy question is shown when person_age equals 5');
    equal(notFive, true, 'Kindergarten question is hidden when person_age equals 5');
  });

  QUnit.module('utils');

  test('clean string', 1, function() {
    var userInputString = ' TestIng StrIngS Here, WhaDdUp Yo ';
    var cleanedString = forkableForm.util.cleanString(userInputString);
    equal(cleanedString, 'testing strings here, whaddup yo', 'String is stripped of leading/trailing space and all lowercase');
  });

  test('converting string to arithmetic comparison', 12, function() {
    var possibleComparisons = ['gte', 'lte', 'gt', 'lt', 'eq', 'noteq'];
    $.each(possibleComparisons, function(index, comparator) {
      var differentNumbers = forkableForm.util.convertToArithmeticComparison(comparator, 0, 3);
      var equalNumbers = forkableForm.util.convertToArithmeticComparison(comparator, 3, 3);

      switch (comparator) {
        case 'gte':
          equal(differentNumbers, false, 'gte: 0 is not greater than or equal 3');
          equal(equalNumbers, true, 'gte: 3 is greater than or equal to 3');
          break;
        case 'gt':
          equal(differentNumbers, false, 'gt: 0 is not greater than 3');
          equal(equalNumbers, false, 'gt: 3 is not greater than 3');
          break;
        case 'lte':
          equal(differentNumbers, true, 'lte: 0 is less than or equal 3');
          equal(equalNumbers, true, 'lte: 3 is less than or equal to 3');
          break;
        case 'lt':
          equal(differentNumbers, true, 'lt: 0 is less than 3');
          equal(equalNumbers, false, 'lt: 3 is not less than 3');
          break;
        case 'eq':
          equal(differentNumbers, false, 'eq: 0 is not equal to 3');
          equal(equalNumbers, true, 'eq: 3 is equal to 3');
          break;
        case 'noteq':
          equal(differentNumbers, true, 'noteq: 0 is not equal to 3');
          equal(equalNumbers, false, 'noteq: 3 is equal to 3');
          break;
      }
    });
  });

  test('parsing numeric `data-show-on-value` attributes', 2, function() {
    var andConditions = ['gte-5', 'lte-27'];
    var orConditions = ['gt-7', 'lt-3'];
    var testingAndOperator = forkableForm.util.parseNumericConditions(25, andConditions, '_and_');
    equal(testingAndOperator, true, '25 is greater than or equal to five AND less than or equal to 27');

    var testingOrOperator = forkableForm.util.parseNumericConditions(2, orConditions, '_or_');
    equal(testingOrOperator, true, '2 is less than 3 OR greater than 7');
  });

  QUnit.module('branchingMethods', {
    setup: function() {
      forkableForm = $('#custom-forkable-form').forkable({
        branchingMethods: {
          customConsoleLog: function(childBranches, userEnteredValue) {
            var childBranchShouldBeShown;

            $.each(childBranches, function(index, childBranch) {
              var $childBranch = $(childBranch),
                conditionsForShowingChildBranch = parseInt($childBranch.data('show-on-value'));
                childBranchShouldBeShown = ((userEnteredValue / 2) === 50);

              if (childBranchShouldBeShown) {
                $childBranch.removeClass('hidden').find('> div.field').removeClass('hidden');
              } else {
                $childBranch.addClass('hidden');
              }
              $childBranch.find('div.field').addClass('hidden');
            });
          }
        }
      });
      forkInputs = forkableForm.forks;
    },
    teardown: function() {}
  });

  test('custom branching methods override standard branching', 1, function() {
    $.each(forkInputs, function(index, forkInput) {
      if (forkInput.prop('type') === 'text' || forkInput.prop('type') === 'hidden') {
        forkInput.val('100').trigger('change');
      }
    });

    var fiftyIsHidden = $('input[name="happy_messages"]').parent().hasClass('hidden');
    equal(fiftyIsHidden, false, '50 console message question is shown when a user enters 100');
  });

  test('integer evaluations', 1, function() {
    equal(2, 2);
  });

  test('string evaluations', 1, function() {
    equal(2, 2);
  });

}(jQuery));
