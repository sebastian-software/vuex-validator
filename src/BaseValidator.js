import reduce from "lodash-es/reduce"
import isFinite from "lodash-es/isFinite"
import isString from "lodash-es/isString"

class ValidatorAssertions {
  constructor()
  {
    this._errors = []
  }

  clearErrors()
  {
    this._errors = []
  }

  errors()
  {
    const errors = this._errors
    this.clearErrors()
    return errors
  }

  invalid(fields, error)
  {
    const err = {
      valid: false,
      fields,
      error
    }

    this._errors.push(err)

    return err
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
    this._propertiesMap = {}
    this.module = module
  }

  injectStore(store)
  {
    this._store = store
  }

  getProperties()
  {
    return Object.keys(this._propertiesMap)
  }

  getRulesByProperty(property)
  {
    return this._propertiesMap[property]
  }

  getRuleContext()
  {
    return validatorAssertions
  }

  /*
   * Add rule to validator. name {string} is the rule's name to find it in debugging mode.
   * properties {array(string)} is a list of properties that are validated with this rule.
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
  rule(name, properties, validatorFunction)
  {
    function boundValidatorFunction(...rest)
    {
      validatorAssertions.clearErrors()
      return validatorFunction.apply(validatorAssertions, rest)
    }

    this._ruleMap.push({
      name,
      properties,
      validatorFunction: boundValidatorFunction
    })

    const propertiesMap = this._propertiesMap
    properties.forEach((prop) =>
    {
      if (!propertiesMap[prop])
        propertiesMap[prop] = []

      propertiesMap[prop].push({
        name,
        validatorFunction: boundValidatorFunction
      })
    })
  }

  isValid()
  {
    const state = this._store.state

    return reduce(
      this._ruleMap.map(
        (rule) =>
        {
          const valid = rule.validatorFunction(state)

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
      true
    )
  }

}
