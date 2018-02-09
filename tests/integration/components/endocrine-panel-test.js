import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('endocrine-panel', 'Integration | Component | endocrine panel', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{endocrine-panel}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#endocrine-panel}}
      template block text
    {{/endocrine-panel}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
