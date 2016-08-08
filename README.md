# hook-playground
pre and post hooks to your method, async powered by promise

## Motivation
There is a working hook on github [here](https://github.com/bnoguchi/hooks-js), but it has no further commit since late 2013, sadly. It adopts the practice of [middleware](https://github.com/bnoguchi/hooks-js#pres-and-posts-as-middleware) to control the work flow. I suppose promise can be another approach, especially when we take async functions into consideration. 

## Example
Basically, we use promise. 
```javascript
var myHook = require("./hook.js");
var hook = Object.create(myHook);

function doSomething(option){};

//Add a hook, called "save"
hook.register("save", doSomething)
	.preAsync("save", function(){
      return new Promise(function(resolve, reject){
        setTimeout(function(){
	      console.log("hello from pre async, wait 1 second... ", option);
	      resolve();
	    }, 1000);
      })
    })
	.pre("save", function(option){
	  //'this' is null, you should (always) use bind explicitly
      this.valuePre = option;
    }.bind(hook))
	.postAsync("save", function(option){
	  //it's ok if you add a sync function to postAsync list
      this.valuePostAsync = option;
    }.bind(hook))
	.post("save", function(option){
      this.valuePost = option;
    }.bind(hook));

//Call the "save" hook, it returns a promise
hook.run("save", 1)
  .then(function(){
	//do something next
  });
```


### Some notes:
- Following the promise standard when you explicit call the preAsync or postAsync method is highly recommended, either calling an existing promise style api call, or wrap one into promise style.
- Support multiple pre/post/preAsync/postAsync callbacks. 
- The callback functions'  `this`  is null, you should (always) use bind explicitly.
- Prototype based inheritance (behavior delegation) is adopted.
	- Pros: hooks exist in prototype, and can be used everywhere in your app
	- Cons: Be careful of hook name collision

## API
- Hook.register(name, callback)
	- Register a hook, with name and callback
- Hook.pre(name, callback)
	- Register pre function list, and add callback to the end, with name
	- Identical callbacks will be added only once
- Hook.preAsync(name, callback)
 	- Register preAsync function list, and add callback to the end, with name
	- Identical callbacks will be added only once
- Hook.post(name, callback)
	- Register post function list, and add callback to the end, with name
	- Identical callbacks will be added only once
- Hook.postAsync(name, callback)
	- Register post function list, and add callback to the end, with name
	- Identical callbacks will be added only once
- Hook.preRemove(name[, callback])
	- Remove a particular callback from pre function list with specified name
	- if `callback` is ommited, `preRemove` removes all the callbacks in the pre function list with specified name
- Hook.preAsyncRemove(name[, callback])
	- Remove a particular callback from preAsync function list with specified name
	- if `callback` is ommited, `preAsyncRemove` removes all the callbacks in the preAsync function list with specified name
- Hook.postRemove(name[, callback])
	- Remove a particular callback from post function list with specified name
	- if `callback` is ommited, `postRemove` removes all the callbacks in the post function list with specified name
- Hook.postAsyncRemove(name[, callback])
	- Remove a particular callback from postAsync function list with specified name
	- if `callback` is ommited, `postAsyncRemove` removes all the callbacks in the postAsync function list with specified name
- Hook.destroy(name)
	- clear the named hook and all the attached callbacks
- Hook.run(name)
	- run the named hook, return a promise
	- Callbacks are called in the order of `preAsync --> all resolved/rejected --> pre --> the hook --> postAsync --> all resolved/rejected --> post`. Any exception / reject, will abort the whole chain.	

## Error handling

- With respect to async callbacks, either **throw** new Error or **reject** will be fine.
- for sync callbacks, simply **throw** new Error 

In the end, catch them at the end of the promise (Need to be refactored).

## Tests
To run the tests:
> npm test
