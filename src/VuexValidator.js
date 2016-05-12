import { reduce, camelCase, isArray, curry } from "lodash"

const validators = []
const validatorsMap = {}
const propertyToValidator = {}

class GlobalValidator {
  isValid(module = null)
  {
    if (module)
      return validatorsMap[module].isValid()

    return reduce(
      validators.map((validator) => validator.isValid()),
      (all, self) =>
      {
        if (all === true && self === true)
          return true

        if (all !== true && self === true)
          return all

        if (all === true && self !== true)
          return self

        return all.concat(self)
      }
    )
  }
}

const validator = new GlobalValidator()

const propertyValidator = {
  isInvalid: (property) =>
  {
    const vals = propertyToValidator[property]
    if (!vals)
      return null

    return reduce(vals.map((val) => val.isValid()), (all, self) =>
    {
      console.log("TEST >>>>>", all, self)
      if (all === true && self === true)
        return true

      if (all !== true && self === true)
        return all

      if (all === true && self !== true)
        return self

      return all.concat(self)
    })
  }
}

function computedValidation(context, id, rulesLength)
{
  return function()
  {
    let allResults = null
    for (let index = 0; index < rulesLength; index++)
    {
      const curResult = context[`${id}${index}`]

      if (curResult && curResult.valid === false)
        if (isArray(allResults))
          allResults = allResults.concat(curResult)
        else
          allResults = [ curResult ]
    }

    return allResults
  }
}

function callValidatorFunction(context, validatorFunction, state)
{
  return function()
  {
    return validatorFunction.call(context, state)
  }
}

function computedModuleValidation(context, module)
{
  return function()
  {
    let isValid = validator.isValid(module)

    if (isValid === true)
      return null

    return isValid
  }
}

function install(Vue, { validators: _validators } = { validators: [] })
{
  /* eslint no-invalid-this: 0, no-console:0 */
  if (_validators.length === 0)
    console.warn("[Vuex Validator] No validators found. Maybe you want to do Vue.use(validator, { validators: [myValidator] })")

  _validators.forEach((item) =>
  {
    validators.push(item)
    if (item.module)
      validatorsMap[item.module] = item
  })
  Vue.prototype.$validator = validator

  function validatorInit()
  {
    if (!this.$store)
      throw Error("[Vuex Validator] Vuex store not injected. Please execute Vue.use(store) before executing Vue.use(validator)")

    if (!this.$store.$validator)
    {
      this.$store.$validator = validator
      validators.forEach((item) => item.injectStore(this.$store))
    }

    const options = this.$options
    const getters = options.computed = options.computed || {}
    const state = this.$store.state
    const self = this

    validators.forEach((item) =>
    {
      item.getProperties().forEach((prop) =>
      {
        if (!propertyToValidator[prop])
          propertyToValidator[prop] = []

        const rules = item.getRulesByProperty(prop)
        if (rules)
          rules.forEach((rule) =>
          {
            if (propertyToValidator[prop].indexOf(rule) < 0)
              propertyToValidator[prop].push(rule)
          })
      })
    })

    if (options && options.vuex && options.vuex.validators)
    {
      const vals = options.vuex.validators
      Object.keys(vals).forEach((prop) =>
      {
        const curriedFnt = curry(vals[prop], 1)(propertyValidator)
        getters[prop] = curriedFnt
      })
    }

    /*
    validators.forEach((item) =>
    {
      item.getProperties().forEach((prop) =>
      {
        const id = `\$invalid\$${camelCase(prop)}`
        const rules = item.getRulesByProperty(prop)
        const rulesLength = rules.length
        const ruleContext = item.getRuleContext()

        if (rulesLength > 0)
        {
          // TODO: Cache generated getters like Vuex do
          rules.forEach((rule, index) =>
          {
            getters[`${id}${index}`] = callValidatorFunction(ruleContext, rule.validatorFunction, state)
          })
          getters[id] = computedValidation(self, id, rulesLength)
        }
      })

      if (item.module)
        getters[`\$invalid\$module\$${item.module}`] = computedModuleValidation(self, item.module)
    }) */
  }

  const _init = Vue.prototype._init
  Vue.prototype._init = function(options = {})
  {
    options.init = options.init ?
      [ validatorInit ].concat(options.init) :
      [ validatorInit ]
    _init.call(this, options)
  }

  // option merging (found in vuex)
  const merge = Vue.config.optionMergeStrategies.computed
  Vue.config.optionMergeStrategies.vuexValidator = (toVal, fromVal) =>
  {
    if (!toVal) return fromVal
    if (!fromVal) return toVal
    return {
      getters: merge(toVal.getters, fromVal.getters)
    }
  }
}

export default {
  install
}
