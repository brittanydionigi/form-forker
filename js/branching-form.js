  /**
   * Setup branching form
   * @param {object} form The jQuery DOM form element
   * @param {array} forks An array of the jQuery form elements that act as the 'forks' for branching when their values change
   */
  var BranchingForm = function(form, forks) {
    this.domForm = form;
    this.forks = forks;

    /* Gather any values from inputs that are currently displayed to submit */
    this.postData = function() {
      var unhiddenFields = this.domForm.find('div:not(".hidden")'),
          inputFieldsToSend = unhiddenFields.find('> input, > textarea, > select'),
          postData = {};

      _.each(inputFieldsToSend, function(input) {
        var postVal;
        ($(input).prop('type') === 'radio') ? postVal = $('input:checked').val() : postVal = $(input).val(); // if input is a radio button, only send the value of the checked radio

        if (postVal) { // if the input value isn't blank, add a key to the postData object
          postData[$(input).prop('name')] = postVal;
         }
      });

      return postData;
    },


    this.util = {

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
        return dirtyString.toLowerCase().replace(/^\s+|\s+$/g,'');
      },


      /*
       * Map string-based operators to their arithmetic equivalent and return the result of the evaluated expression
       * @param {string} comparisonOperator The string-based comparison to convert to an arithmetic operator // possible values: gte, gt, lte, lt, eq, noteq
       * @param {integer} userEnteredValue The current integer value a user has entered
       * @param {integer} integerToCompareAgainst The integer we will compare the userEnteredValue to as specified by the child branch's data-show-on-value attribute
       */
      convertToArithmeticComparison:  function (comparisonOperator, userEnteredValue, integerToCompareAgainst) {
        switch (comparisonOperator) {
          case 'gte':
            return (userEnteredValue >= integerToCompareAgainst)
            break;
          case 'gt':
            return (userEnteredValue > integerToCompareAgainst)
            break;
          case 'lte':
            return (userEnteredValue <= integerToCompareAgainst)
            break;
          case 'lt':
            return (userEnteredValue < integerToCompareAgainst)
            break;
          case 'eq':
            return (userEnteredValue == integerToCompareAgainst)
            break;
          case 'noteq':
            return (userEnteredValue != integerToCompareAgainst)
            break;
        }
      },


      /*
       * Parse the data-show-on-value attribute of child branches for integer evaluations.
       * @param {integer} userEnteredValue The current integer value a user has entered into an input with dependent child branches
       * @param {string} conditionsToBeMet The conditions to be met for showing a child branch, as specified by the child branch's
                       data-show-on-value attribute // possible values: gte-{int}, gt-{int}, lte-{int}, lt-{int}, eq-{int}, noteq-{int}
       * @param {string} logicalOperator The logical operator to use when evaluating multiple conditions // possible values: _and_, _or_
       */
      parseNumericConditions: function (userEnteredValue, conditionsToBeMet, logicalOperator) {
        var valuePassesConditions, loopingMethod;

        /* If there are multiple conditions but the logical operator is an ||, we can return true after the first condition that passes.
        /* If there is no logical operator (only 1 condition is specified), or it is an &&, we must loop through all conditions and only return true if all pass.
        /* We will set the loopingMethod variable to either 'some' or 'every' depending on these conditions. See: http://underscorejs.org/#every */
        (logicalOperator && logicalOperator === '_or_') ? loopingMethod = 'some' : loopingMethod = 'every';

        /* Loop through the conditions that must be met to show a particular child branch */
        valuePassesConditions = _[loopingMethod](conditionsToBeMet, function (condition) {
          var condition = condition.split('-'),
            comparisonOperator = condition[0], // gte, gt, lte, lt, eq, noteq
            integerToCompareAgainst = condition[1]; // integer we will compare the userEnteredValue to

          return this.convertToArithmeticComparison(comparisonOperator, userEnteredValue, integerToCompareAgainst);
        }, this);
        return valuePassesConditions;
      },
    },


    /*
     * Method for comparing integer values with arithmetic operators. This code is method is CRAZY.
     * @param {object} opts Options containing references to the child branches and the user-entered value to be evaluated
     */
      this.integerEval = function (opts) {
          var userEnteredValue = parseInt(opts.userEnteredValue), // convert input value from string to integer
            logicalOperator,
            numericOperations,
            conditionsForShowingChildBranch;

          /* for each of the possible child branches, find the condition that must be met in order for them to be shown */
          _.each(opts.childBranches, function (childBranch) {
            var $childBranch = $(childBranch),
            showOnValueAttribute = $(childBranch).data('show-on-value'),
            conditionType = typeof showOnValueAttribute;

            if (conditionType === 'string') {
              if (showOnValueAttribute.indexOf(',') !== -1) { conditionType = 'integerArray'; }
              if (showOnValueAttribute.match(/\_and\_|\_or\_/g) !== null) { conditionType = 'logicalExpression'; }
            }

            switch (conditionType) {
              case 'number': // data-show-on-value="1"
                numericOperations = ['eq-' + showOnValueAttribute];
                break;

              case 'string': // data-show-on-value="gte-8"
                numericOperations = [showOnValueAttribute];
                break;

              case 'integerArray': // data-show-on-value="1,2,3,4,5"
                conditionsForShowingChildBranch = showOnValueAttribute.split(',');
                logicalOperator = '_or_';
                numericOperations = [];
                _.each(conditionsForShowingChildBranch, function(condition) {
                  numericOperations.push('eq-' + condition);
                });

              case 'logicalExpression': // data-show-on-value="gte-3_and_lte-7"
                conditionsForShowingChildBranch = showOnValueAttribute.split(/(\_and\_|\_or\_)/g);
                logicalOperator = conditionsForShowingChildBranch[1]; // _and_, _or_
                numericOperations = [conditionsForShowingChildBranch[0], conditionsForShowingChildBranch[2]]; // gte-{int}, gt-{int}, lte-{int}, lt-{int}, eq-{int}, noteq-{int}
            }

            childBranchShouldBeShown = this.util.parseNumericConditions(userEnteredValue, numericOperations, logicalOperator);
            (childBranchShouldBeShown) ? $childBranch.removeClass('hidden').find('> div.field').removeClass('hidden') : $childBranch.addClass('hidden'); $childBranch.find('div.field').addClass('hidden');

          }, this);
        };


        /*
         * Compare string values. Will also work for boolean values by comparing their string equivalents, though this could get buggy.
         * @param {object} opts Options containing references to the child branches and the user-entered value to be evaluated
         */
        this.stringEval = function(opts) {
          var self = this,
          userEnteredValue = self.util.cleanString(opts.userEnteredValue);

          _.each(opts.childBranches, function(childBranch) {
            var $childBranch = $(childBranch),
              conditionsForShowingChildBranch = $childBranch.data('show-on-value').toString().split(',');  // grab the conditions that must be true in order to show this child branch
              conditionsForShowingChildBranch = _.map(conditionsForShowingChildBranch, function(condition) {
                return self.util.cleanString(condition);
              });
              childBranchShouldBeShown = (conditionsForShowingChildBranch.indexOf(userEnteredValue) !== -1);
              (childBranchShouldBeShown) ? $childBranch.removeClass('hidden').find('> div.field').removeClass('hidden') : $childBranch.addClass('hidden'); $childBranch.find('div.field').addClass('hidden');

          })
        }
  };
