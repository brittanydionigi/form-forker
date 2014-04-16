#Form forking
Handle forks in the road (form) based on user input.


##Branching Methods
The default branching methods are `integerEval` and `stringEval`. By default, if the user input is a string that can successfully be parsed into an integer (i.e. "5"), the branching will perform an `integerEval`. If the result of the user input can not be parsed into a number, the form will branch on a `stringEval`.

###Creating a Custom Branching Method
If you'd like to override the default branching methods with your own ...

**integerEval** `formObject.integerEval(childBranches, userEnteredValue)`

**stringEval** `formObject.stringEval(childBranches, userEnteredValue)`
