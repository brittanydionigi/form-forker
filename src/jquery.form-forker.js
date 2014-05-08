/*
 * Form Forker - jQuery / Zepto forkable form plugin
 *
 * Copyright (c) 2014 Brittany Storoz
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.brittanystoroz.github.io/form-forking
 *
 * Version: 0.0.0
 *
 */

;
(function($, window, document, undefined) {

  "use strict";

  // TO DO: Handle ! in conditional syntax, let users map custom conditional syntax
  $.fn.forkable = function(forks, opts) {

    var form = $(this);
    var formForks = form.find(forks);

    var BranchingForm = function(form, forks, options) {
      var self = this,
        opts = options || {};

      self.$domForm = form;
      self.forks = forks;
      self.opts = opts;

      self.init();
    };

    BranchingForm.prototype = {

      init: function() {
        var self = this;

        /* If custom evaluation methods have been defined, make them available in the branching form */
        if (self.opts.branchingMethods) {
          $.each(self.opts.branchingMethods, function(key, val) {
            if (typeof self[key] !== "undefined") {
              console.log("Warning: You are overriding the built-in " + key + " method. If this is not the behavior you want, rename your custom branching method.");
            }
            self[key] = val;
          });
        }

        /* Set up event handlers to monitor the values of our forks */
        $.each(self.forks, function(index, fork) {
          var branchMethod = $(fork).data('branching-fn'); // determine the type of evaluation we need to do on the input value
          if ($(fork).prop('type') === 'text') {
            $(fork).keyup(function() {
              $(fork).trigger('change');
            });
          }
          $(fork).change(function(e) {
            var childBranches = self.$domForm.find('div[data-parent-branch=' + $(fork).prop('name') + ']'),
              userEnteredValue = $(fork).val();

            if (!branchMethod && isNaN(parseInt(userEnteredValue))) {
              self.stringEval(childBranches, userEnteredValue);
            } else if (!branchMethod) {
              self.integerEval(childBranches, parseInt(userEnteredValue));
            } else {
              self[branchMethod](childBranches, userEnteredValue);
            }
          });
        });
      },

      /* Gather any values from inputs that are currently displayed to submit */
      postData: function() {
        var unhiddenFields = this.domForm.find('div:not(".hidden")'),
          inputFieldsToSend = unhiddenFields.find('> input, > textarea, > select'),
          postData = {};

        $.each(inputFieldsToSend, function(index, input) {
          var postVal;
          ($(input).prop('type') === 'radio') ? postVal = $('input:checked').val() : postVal = $(input).val(); // if input is a radio button, only send the value of the checked radio

          if (postVal) { // if the input value isn't blank, add a key to the postData object
            postData[$(input).prop('name')] = postVal;
          }
        });

        return postData;
      },


      util: {

        /* Fake radio buttons so we can give them custom styling; will probaby need to support custom select menus, checkboxes, etc. in the future */
        handleCustomRadios: function(e) {
          var $elem = $(e.currentTarget), // radios span that was clicked on
            $associatedInput = $elem.parent().find('> input'), // the input whose value needs to be toggled based on our span selection
            selectedRadioVal = $.trim($elem.html()); // the innerHTML of our selected span

          $associatedInput.val(selectedRadioVal); // set the hidden input value equal to the selected span
          $associatedInput.trigger('change'); // manually trigger the change even on our input so we can evaluate it's value
          $elem.addClass('radio-selected').siblings().removeClass('radio-selected');
        },


        /* Remove leading/trailing whitespace & convert to lowercase to ensure no false negatives when comparing strings */
        cleanString: function(dirtyString) {
          return dirtyString.toLowerCase().replace(/^\s+|\s+$/g, '');
        },


        /*
         * Map string-based operators to their arithmetic equivalent and return the result of the evaluated expression
         * @param {string} comparisonOperator The string-based comparison to convert to an arithmetic operator // possible values: gte, gt, lte, lt, eq, noteq
         * @param {integer} userEnteredValue The current integer value a user has entered
         * @param {integer} integerToCompareAgainst The integer we will compare the userEnteredValue to as specified by the child branch's data-show-on-value attribute
         */
        convertToArithmeticComparison: function(comparisonOperator, userEnteredValue, integerToCompareAgainst) {
          switch (comparisonOperator) {
            case 'gte':
              return (userEnteredValue >= integerToCompareAgainst);
            case 'gt':
              return (userEnteredValue > integerToCompareAgainst);
            case 'lte':
              return (userEnteredValue <= integerToCompareAgainst);
            case 'lt':
              return (userEnteredValue < integerToCompareAgainst);
            case 'eq':
              return (userEnteredValue === integerToCompareAgainst);
            case 'noteq':
              return (userEnteredValue !== integerToCompareAgainst);
          }
        },


        /*
         * Parse the data-show-on-value attribute of child branches for integer evaluations.
         * @param {integer} userEnteredValue The current integer value a user has entered into an input with dependent child branches
         * @param {string} conditionsToBeMet The conditions to be met for showing a child branch, as specified by the child branch's
                         data-show-on-value attribute // possible values: gte-{int}, gt-{int}, lte-{int}, lt-{int}, eq-{int}, noteq-{int}
         * @param {string} logicalOperator The logical operator to use when evaluating multiple conditions // possible values: _and_, _or_
         */
        parseNumericConditions: function(userEnteredValue, conditionsToBeMet, logicalOperator) {
          var self = this,
            userInput = parseInt(userEnteredValue),
            valuePassesConditions;

          /* Loop through the conditions that must be met to show a particular child branch */
          $.each(conditionsToBeMet, function(index, condition) {
            var conditionToEvaluate = condition.split('-'),
              comparisonOperator = conditionToEvaluate[0], // gte, gt, lte, lt, eq, noteq
              integerToCompareAgainst = parseInt(conditionToEvaluate[1]), // integer we will compare the userEnteredValue to
              conditionResult = self.convertToArithmeticComparison(comparisonOperator, userInput, integerToCompareAgainst);

            /* If there are multiple conditions but the logical operator is an ||, we can return true after the first condition that passes. */
            /* If there is no logical operator (only 1 condition is specified), or it is an &&, we must loop through all conditions and only return true if all pass. */
            if (logicalOperator && logicalOperator === '_or_' && conditionResult === true) {
              valuePassesConditions = true;
              return false;
            } else if (logicalOperator && logicalOperator === '_and_' && conditionResult === false) {
              valuePassesConditions = false;
              return false;
            } else {
              valuePassesConditions = conditionResult;
            }

          });

          return valuePassesConditions;
        },
      },


      /*
       * Method for comparing integer values with arithmetic operators. This code is method is CRAZY.
       * @param {object} opts Options containing references to the child branches and the user-entered value to be evaluated
       */
      integerEval: function(childBranches, userEnteredValue) {
        var self = this,
          userInput = parseInt(userEnteredValue), // convert input value from string to integer
          logicalOperator,
          numericOperations,
          conditionsForShowingChildBranch;

        /* for each of the possible child branches, find the condition that must be met in order for them to be shown */
        $.each(childBranches, function(index, childBranch) {
          var $childBranch = $(childBranch),
            showOnValueAttribute = $(childBranch).data('show-on-value'),
            conditionType = typeof showOnValueAttribute,
            childBranchShouldBeShown;

          if (conditionType === 'string') {
            if (showOnValueAttribute.indexOf(',') !== -1) {
              conditionType = 'integerArray';
            } else if (showOnValueAttribute.indexOf('..') !== -1) {
              conditionType = 'inclusiveRange';
            } else if (showOnValueAttribute.match(/\_and\_|\_or\_/g) !== null) {
              conditionType = 'logicalExpression';
            }
          }

          switch (conditionType) {
            case 'number': // data-show-on-value="1"
              numericOperations = ['eq-' + showOnValueAttribute];
              break;

            case 'string': // data-show-on-value="gte-8"
              numericOperations = [showOnValueAttribute];
              break;

            case 'inclusiveRange': // data-show-on-value="3..7"
              conditionsForShowingChildBranch = showOnValueAttribute.split('..');
              logicalOperator = "_and_"; // _and_, _or_
              numericOperations = ["gte-" + conditionsForShowingChildBranch[0], "lte-" + conditionsForShowingChildBranch[1]]; // gte-{int}, lte-{int}
              break;

            case 'integerArray': // data-show-on-value="1,2,3,4,5"
              conditionsForShowingChildBranch = showOnValueAttribute.split(',');
              logicalOperator = '_or_';
              numericOperations = [];
              $.each(conditionsForShowingChildBranch, function(index, condition) {
                numericOperations.push('eq-' + condition);
              });
              break;

            case 'logicalExpression': // data-show-on-value="gte-3_and_lte-7"
              conditionsForShowingChildBranch = showOnValueAttribute.split(/(\_and\_|\_or\_)/g);
              logicalOperator = conditionsForShowingChildBranch[1]; // _and_, _or_
              numericOperations = [conditionsForShowingChildBranch[0], conditionsForShowingChildBranch[2]]; // gte-{int}, gt-{int}, lte-{int}, lt-{int}, eq-{int}, noteq-{int}
          }

          childBranchShouldBeShown = self.util.parseNumericConditions(userInput, numericOperations, logicalOperator);
          (childBranchShouldBeShown) ? $childBranch.removeClass('hidden').find('> div.field').removeClass('hidden') : $childBranch.addClass('hidden');
          $childBranch.find('div.field').addClass('hidden');

        });
      },


      /*
       * Compare string values. Will also work for boolean values by comparing their string equivalents, though this could get buggy.
       * @param {object} opts Options containing references to the child branches and the user-entered value to be evaluated
       */
      stringEval: function(childBranches, userEnteredValue) {
        var self = this,
          userInput = self.util.cleanString(userEnteredValue),
          childBranchShouldBeShown;

        $.each(childBranches, function(index, childBranch) {
          var $childBranch = $(childBranch),
            conditionsForShowingChildBranch = $childBranch.data('show-on-value').toString().split(','); // grab the conditions that must be true in order to show this child branch
          conditionsForShowingChildBranch = $.map(conditionsForShowingChildBranch, function(condition) {
            return self.util.cleanString(condition);
          });
          childBranchShouldBeShown = (conditionsForShowingChildBranch.indexOf(userInput) !== -1);
          (childBranchShouldBeShown) ? $childBranch.removeClass('hidden').find('> div.field').removeClass('hidden') : $childBranch.addClass('hidden');
          $childBranch.find('div.field').addClass('hidden');
        });
      }
    }; // end BranchingForm.prototype

    /* Initialize the new forkable form */
    var userBranchingForm = new BranchingForm(form, formForks, opts);

  }; // end $.fn.forkable

})(window.jQuery || window.Zepto, window, document);
