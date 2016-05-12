import { reduce, camelCase } from "lodash"

const validators = []
const validatorsMap = {}

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

function computedValidation(id, rulesLength)
{
  return function()
  {
    let allResults = true
    for (let index = 0; index < rulesLength; index++)
    {
      const curResult = this[`${id}${index}`]

      if (curResult !== true)
        if (allResults === true)
          allResults = curResult
        else
          allResults = allResults.concat(curResult)
    }
  }
}

function callValidatorFunction(context, validatorFunction, state)
{
  return function()
  {
    return validatorFunction.call(context, state)
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

    validators.forEach((item) =>
    {
      item.getProperties().forEach((prop) =>
      {
        const id = `\$valid\$${camelCase(prop)}`
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
          getters[id] = computedValidation(id, rulesLength)
        }
      })
    })
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
