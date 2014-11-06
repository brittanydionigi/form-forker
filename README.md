#Form Forker
jQuery plugin for handling conditional form fields based on user input. [Demo](http://brittanystoroz.github.io/form-forker)


##Getting Started
Incude jquery.former-forker.js and a copy of jQuery on your page. Initialize the plugin on your form like so:

````
$('#branching-form').forkable();
````


##Branching Your Form
Any form fields that should act as 'forks' in the road on your form must have a `name` attribute. For example:

`<input type="text" name="person_age" placeholder="Age" />`

The dependent children of this input (form fields that should be shown/hidden based on the value of `person_age`) need two data attributes: `data-parent-branch` and `data-show-on-value`.

````
<div class="field hidden" data-parent-branch="person_age" data-show-on-value="5">
  <input type="text" name="favorite_cartoon" placeholder="What's your favorite cartoon?" />
</div>
````

The `data-parent-branch` attribute should match the `name` of the fork it corresponds to.  The `data-show-on-value` attribute will let you specify the conditions that must be met in order to display this form field.


##Declaring Conditions
To determine whether or not a child form field should be shown, you must specify the condition to be met by putting a `data-show-on-value` attribute on your form field.


###String Conditions
A simple string conditional would look like so:

````
<div class="field hidden" data-parent-branch="favorite_candy" data-show-on-value="chocolate">
  <input type="text" name="which_chocolate_bar" placeholder="Which chocolate bar?" />
</div>
````

In this example, the child field will only show if the value of its parent input, `favorite_candy` equals chocolate. If we wanted to show this field when the value was chocolate or skittles, we could change our `data-show-on-value` attribute to: `data-show-on-value="chocolate,skittles"`.  You can add as many string comparators as you want, separated by a comma.

###Arithmetic Conditions
Setting an arithmetic condition works the same as a string condition, but there is special syntax for declaring the type of operation you want to perform:

````
data-show-on-value="5"         // user input must equal 5
data-show-on-value="!5"        // user input must not equal 5
data-show-on-value="5,7,9"     // user input must equal 5 or 7 or 9
data-show-on-value="!5,!7,!9"  // user input must not equal 5 or 7 or 9
data-show-on-value="gt-5"      // user input must be greater than 5
data-show-on-value="lt-5"      // user input must be less than 5
data-show-on-value="gte-5"     // user input must be greater than or equal to 5
data-show-on-value="lte-5"     // user input must be less than or equal to 5
data-show-on-value="5..10"     // user input must be between 5 and 10, inclusive
````

You can also add an && or || operator to your conditions like so:

````
data-show-on-value="gte-3_and_lte-7" // essentially the same as 3..7
data-show-on-value="gt-7_or_lt-3"
````


##Branching Methods
The default branching methods are `integerEval` and `stringEval`. By default, if the user input is a string that can successfully be parsed into an integer (i.e. "5"), the branching will perform an `integerEval`. If the result of the user input can not be parsed into an integer, the form will branch on a `stringEval`. If, for some reason, you **don't** want this behavior, you can override which branching method is used by adding a `data-branching-fn: <branchingmethodname>` attribute to your form field element.

###Creating a Custom Branching Method
If you'd like to use custom branching methods, you can define them in a `branchingMethods` object when calling forkable().

````
$('#branching-form').forkable({
    branchingMethods: {
        customEval: function(childBranches, userEnteredValue) {
            // do custom evaluation here
        }
    }
});
````

Add a `data-branching-fn` attribute to your form field element (at the parent fork level) and set it equal to the name of your custom branching method. Your custom method will now take precendence over the default `stringEval` and `integerEval` methods.
