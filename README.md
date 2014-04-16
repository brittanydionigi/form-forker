#Form forking
Handle forks in the road (form) based on user input.


##Branching Methods
The default branching methods are `integerEval` and `stringEval`. By default, if the user input is a string that can successfully be parsed into an integer (i.e. "5"), the branching will perform an `integerEval`. If the result of the user input can not be parsed into a number, the form will branch on a `stringEval`. If, for some reason, you **don't** want this behavior, you can override which branching method is used by adding `data-branching-fn: <branchingmethodname>` to your form field.

###Creating a Custom Branching Method
If you'd like to override the default branching methods with your own, you can pass in a `branchingMethods` object when calling forkable().

````
$('#branching-form').forkable('.fork', {
    branchingMethods: {
        "customEval": function(childBranches, userEnteredValue) {
            // do custom evaluation here
        }
    }
});
````

Add a `data-branching-fn` attribute to your form field, and set it equal to the name of your custom branching method.
