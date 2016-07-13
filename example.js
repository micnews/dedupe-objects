import dedupe from 'dedupe-objects';

const from = { beep: { boop: true }, foo: { bar: false } };
const to = { beep: { hello: 'world' }, foo: { bar: false } };
const result = dedupe(from, to);

// will be true since from.foo is deep equal to to.foo
console.log(from.foo === result.foo);
// will be an object { hello: 'world' }
console.log(result.beep);
