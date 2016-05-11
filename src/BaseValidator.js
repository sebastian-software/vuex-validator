import { reduce, isFinite, isString } from "lodash"

class ValidatorAssertions {
  invalid(fields, error)
  {
    return {
      valid: false,
      fields,
      error
    }
  }

  isNumber(value)
  {
    return isFinite(value)
  }

  isString(value)
  {
    return isString(value) && value !== ""
  }

  hasValue(value)
  {
    if (value === undefined)
      return false

    if (value === null)
      return false

    if (typeof (value) === "number" && isNaN(value))
      return false

    return true
  }
}

const validatorAssertions = new ValidatorAssertions()

export default class BaseValidator {

  constructor(module = null)
  {
    this._ruleMap = []
    this.module = module
  }

  injectStore(store)
  {
    this._store = store
  }

  /*
   * Add rule to validator. name {string} is the rule's name to find it in debugging mode.
   * validatorFunction {function(state)} is the validator function given global state as
   * first parameter.
   *
   * The return value should be either null if the rule don't apply or everything is valid.
   * Otherwise it should call this.valid(fields, error) as return value where fields is
   * an array of strings with the fields validated and error is a string describing technical
   * what was validated and failed.
   *
   * The idea behind this technical error string is that it should be a key in i18n to translate
   * to a good user readable error message.
   *
   * The validatorFunction is called in context of ValidatorAssertions, so every function in there
   * is callable via this.functionName().
   */
  rule(name, validatorFunction)
  {
    this._ruleMap.push({
      name,
      validatorFunction
    })
  }

  isValid()
  {
    const state = this._store.state

    return reduce(
      this._ruleMap.map(
        (rule) =>
        {
          const valid = rule.validatorFunction.call(validatorAssertions, state)

          if (valid && valid.valid === false)
            return {
              name: rule.name,
              fields: valid.fields,
              error: valid.error
            }

          return true
        }
      ),
      (all, thisRule) =>
      {
        if (thisRule === true)
          return all

        if (all === true)
          return [ thisRule ]

        return all.concat(thisRule)
      },
      []
    )
  }

}
