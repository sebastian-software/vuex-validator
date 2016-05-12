<img src="assets/vuejs.png" alt="VueJS Logo" width="200" height="200"/>

# Vuex Validator<br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status][ci-img]][ci] [![Dependencies][deps-img]][deps]

[Vuex] Plugin for validation of store values.

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[Vuex]: https://github.com/vuejs/vuex
[ci-img]:  https://travis-ci.org/sebastian-software/vuex-validator.svg
[ci]:      https://travis-ci.org/sebastian-software/vuex-validator
[deps]: https://david-dm.org/sebastian-software/vuex-validator
[deps-img]: https://david-dm.org/sebastian-software/vuex-validator.svg
[npm]: https://www.npmjs.com/package/vuex-validator
[npm-downloads-img]: https://img.shields.io/npm/dm/vuex-validator.svg
[npm-version-img]: https://img.shields.io/npm/v/vuex-validator.svg



## Links

- [GitHub](https://github.com/sebastian-software/vuex-validator)
- [NPM](https://www.npmjs.com/package/vuex-validator)


## Installation

Should be installed locally in your project source code:

Installation via JSPM:

```bash
jspm install npm:vuex-validator
```

Alternatively you can also use plain old NPM:

```bash
npm install vuex-validator --save
```

## Integration

In your main application javascript file:

````
// app.js

import VuexValidator from "vuex-validator";
import validators from "./vuex/validators";
import store from "./vuex/store"; // Inside there should be a Vue.use(Vuex) (see Vuex documentation)

Vue.use(VuexValidator, {
  validators
})
````

Your validator configurator:

````
// ./vuex/validators

import testValidator from "./validation/test";

const validators = [ testValidator ];

export default validators;
````

A sample validator:

````
// ./vuex/validation/test.js

import BaseValidator from "vuex-validator/lib/BaseValidator";

class TestValidator extends BaseValidator {
	constructor() {
		super("test"); // Name of validation are, should correlate with Vuex store module

		this.rule("test-name", ["test", "test2"], this.testName); // Name of rule, All properties that are tested, Test function itself
	}

	testName(state) { // State from Vuex
		if (typeof(state.test) !== "number") {
			return this.invalid(["test"], "TEST_NOT_A_NUMBER"); // Failed properties and technical error key as string
		}

		if (typeof(state.test2) !== "string") {
			return this.invalid(["test2"], "TEST2_NOT_A_STRING"); // Failed properties and technical error key as string
		}

		if (state.test > 20 && state.test2 === "low number") {
			return this.invalid(["test", test2"], "TEST_IS_NO_LOW_NUMBER"); // Failed properties and technical error key as string
		}

		return null; // Null or undefined means "no validation errors"
	}
}

export default new TestValidator();
````

A sample state for this could be:

````
{
	"test": 123,
	"test2": "a string"
}
````

## Usage

There are two ways to use this validation.

### Active validation

To actively validate values you can call

````
store.$validator.isValid("test-name")
````

This validates all values of Validator named *test-name*. It returnes `true` if all values are valid as defined by your rules in validator *test-name*. This could be used for backend
connection middleware before sending data.

### Validation getter in components

All validations are injected into Vue components itself. The properties are named with a special key:

````
$invalid$<property in camelCase>
````

So you can access validators for both properties used in the example above via:

- `$invalid$test`
- `$invalid$test2`

If you are using Vuex state modules it could be something like

- `$invalid$userLastname`

for property `state.user.lastname`

This validation getter can also be used inside of templates and other computed properties.

As return value either a falsy value (`undefined`, `null` or `false`) is returend in case of this property validated through all rules. Otherwise an array of failing rules return values are returned. the return structure can be something like:

````
[{
	error: "TEST_IS_NO_LOW_NUMBER",
	fields: ["test", "test2"],
	valid: false
}]
````

`fields` is an array of properties that are tested against in the failing rule. `error`
is the technical error key defined.

## Copyright

<img src="assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2015-2016<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)

