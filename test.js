/**
 * @license
 * VueXValidator <https://www.sebastian-software.de/oss>
 * Copyright 2015-2016 Sebastian Software GmbH
 * Released under Apache 2.0 <http://www.apache.org/licenses/LICENSE-2.0>
 * Authors: Sebastian Fastner <s.fastner@sebastian-software.de>
 */

import test from "ava"
import "babel-register"

import VueXValidator from "./src/VuexValidator"

test("VueXValidator Plugin is valid", (api) =>
{
  api.is(typeof VueXValidator, "object")
  api.is(typeof VueXValidator.install, "function")
})
