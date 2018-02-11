import Component from '@ember/component';
import EmberObject, { computed, get } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isNone, isPresent, typeOf } from '@ember/utils';
import schema from 'yat/utils/schema';

export default Component.extend({
  tagName: '',

  store: service(),

  _data: computed(function() {
    return EmberObject.create(this.get('game.gateData') || this.get('game.gameData', {}));
  }),

  data: computed(function() {
    return this.attachModels(this.get('schema'), '');
  }),

  attachModels(value, path, options = {}) {
    if (typeOf(value) === 'object') {
      let gameData;
      if (isPresent(path)) {
        gameData = this.get(`game.gameData.${path}`) || this.set(`game.gameData.${path}`, {
          amount: value.amount || 0,
          unlocked: value.unlocked || false
        });
      } else {
        gameData = this.get('_data');
      }

      return Object.keys(value).reduce((accumulator, key) => {
        if (key !== 'amount' && key !== 'unlocked') accumulator.set(key, this.attachModels(get(value, key), isPresent(path) ? `${path}.${key}` : key));

        return accumulator;
      }, isPresent(path) ? EmberObject.extend(options.isArrayItem ? value : {
        gameData,
        amount: alias('gameData.amount'),
        unlocked: alias('gameData.unlocked')
      }).create() : gameData);
    } else if (typeOf(value) === 'array') {
      return value.map((item) => this.attachModels(item, path, { isArrayItem: true }));
    } else {
      return value;
    }
  },

  schema: computed(function() {
    return schema(this.get('_data'));
  }),

  createResource(resource, amount) {
    if (resource.max && amount + resource.get('amount') >= resource.get('max.amount')) amount = resource.get('max.amount') - resource.get('amount');

    resource.incrementProperty('amount', this.payResourceCost(resource, amount, resource.get('costs')));
  },

  destroyResource(resource, amount) {
    if (resource.min && resource.get('amount') - amount <= resource.get('min.amount')) amount = resource.get('amount') - resource.get('min.amount');

    resource.decrementProperty('amount', this.payResourceCost(resource, amount, resource.get('destroyCosts')));
  },

  payResourceCost(resource, amount, costs) {
    costs.forEach((cost) => {
      if (cost.get('amount') * amount > cost.get('source.amount')) {
        amount = Math.floor(cost.get('source.amount') / cost.get('amount'))
      }
    });

    costs.forEach((cost) => {
      cost.decrementProperty('source.amount', amount * cost.get('amount'));
      if (amount < 0 && cost.get('source.max.amount') < cost.get('source.amount')) cost.set('source.amount', cost.get('source.max.amount'));
    });

    if (resource.get('multiplier')) amount *= resource.get('multiplier.amount');

    return amount;
  },

  actions: {
    createResource() {
      this.createResource(...arguments);
    },

    destroyResource() {
      this.destroyResource(...arguments);
    }
  }
});