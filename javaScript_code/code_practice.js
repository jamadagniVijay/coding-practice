/*
State Management 
	Monolith -> Redux is used
	If we have a micro front end application, then using redux becomes difficult to manage with Redux
	We always create a Memo component

PureFucntion
	A funtion that takes a input of a datatype and returns the same datatype

Javascript synchronous vs Asynchronous
	Synchronous -> Each task is executed sequentially. Execution of the next depends on the completion of the next.
	Async -> Each task is executed parallelly and a promise is returned right away after an async task is execute and places it on the browser event loop.
Tree shaking in javascript
	Process unwanted code and file. It is used by webpack and browserify to remove all unwated code and files during a build, to reduce bundle size
⭐short circuit evaluation - you know it
	Short-circuit evaluation in JavaScript is a behavior where logical operators (&&, ||, and ??) evaluate expressions from left to right and stop execution as soon as the final outcome is determined.
ES6 -> Iterators and generators
	In ES6 JavaScript, function* is the syntax used to declare a generator function, which returns a Generator object and can be paused and resumed during execution.
	Generator function returns multiple values.
	'yield' keyword is used to return all values.
	function* idCreator() {
	  let id = 1;
	  while (true) {
		yield `id_${id++}`;
	  }
	}

	const idGen = idCreator();
	console.log(idGen.next().value); // "id_1"
	console.log(idGen.next().value); // "id_2"
	FHIR example
		Example : function* generator function javascript + FHIR hl7 example in a react tsx component
		In this scenario, a generator function acts as an excellent streaming state machine to step through the chronological lifecycle of processing healthcare data—specifically parsing an HL7 v2 message, sending the structured mapping to a FHIR Server, and modifying UI loading segments dynamically. 
	
Optional chaining(?) and nullish coalescing(??)
	Optional chaining (?.) and nullish coalescing (??) are JavaScript operators used to safely read nested properties and handle missing values without throwing errors or running into false fallback bugs

Webworker
	Used to perform any task in background
	Does not disturb 
Deep copy vs Shallow copy
	Shallow copy -> Refers to same memory area
	Deep copy -> Refers to a different memory area
	Change to deep copy from shallow copy -> 
		obj2 = Object.assign({},obj1), json.parse + json.stringify
*/
//==========================
//get the first non repeating character
const str = "swiss"
let repeatingChar = new Map()
for (let letter of str) {
  repeatingChar.set(letter, (repeatingChar.get(letter) || 0) + 1);
  if(repeatingChar.get(letter)>1){
    break;
  }
}
const [, secondkey] = repeatingChar.keys(); 
console.log(secondkey)

//==========================
// remove duplicates from the array
const arr = [1,2,2,3,4,4,5]
let dupRemoved = []
// remove duplicates
for (let i = 0;i<arr.length;i++){
  if (!dupRemoved.includes(arr[i])){
    dupRemoved.push(arr[i])
  }
} 
console.log(dupRemoved)
//==========================
// divide the array into chunks 
arr = [1,2,3,4,5]
size = 2

let size = 2;

function chunkArray(arr, siz){
    let temp=[];
    for(let i=0;i<arr.length;i+=siz){
        temp.push(arr.slice(i,i+siz))
    }
    return temp;
}
console.log(chunkArray(array,size))
//==========================
//Flatten the array
function flattenArray(arr) {
  let result = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      // Recursively flatten the sub-array and merge it into the result
      result = result.concat(flattenArray(arr[i]));
    } else {
      // Push the primitive value directly
      result.push(arr[i]);
    }
  }

  return result;
}

// Example usage:
const nested = [1, [2, [3, 4], 5], 6];
console.log(flattenArray(nested)); 