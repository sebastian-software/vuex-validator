/**
 * @license
 * VuexValidator <https://www.sebastian-software.de/oss>
 * Copyright 2015-2016 Sebastian Software GmbH
 * Released under Apache 2.0 <http://www.apache.org/licenses/LICENSE-2.0>
 * Authors: Sebastian Fastner <s.fastner@sebastian-software.de>
 */

import test from "ava"

import { VuexValidator, BaseValidator } from "./lib/VuexValidator"

test("VuexValidator Plugin is valid", (api) =>
{
  api.is(typeof VuexValidator, "object")
  api.is(typeof VuexValidator.install, "function")
})

test("BaseValidator is valid", (api) =>
{
  api.is(typeof BaseValidator, "function")
})
