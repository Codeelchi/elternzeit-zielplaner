import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {roundEuro,meanEuro,MAX_EURO}=createRequire(import.meta.url)('../src/money.cjs');

test('cent rounding follows the first discarded decimal including binary-sensitive halves',()=>{
 for(const [input,expected] of [[274.625,274.63],[1.005,1.01],[2.675,2.68],[10.004,10],[10.005,10.01],[10.006,10.01],[123.454999,123.45],[123.455,123.46]]) assert.equal(roundEuro(input),expected,String(input));
});
test('negative values use a defined symmetric away-from-zero half rule',()=>{
 for(const value of [274.625,1.005,2.675,10.004,10.005,10.006]) assert.equal(roundEuro(-value),-roundEuro(value));
 assert.equal(roundEuro(-0.005),-0.01);
 assert.equal(roundEuro(-0.004),0);
 assert.equal(Object.is(roundEuro(-0),-0),false);
});
test('already rounded amounts, zero, exponents and the supported maximum remain valid',()=>{
 for(const value of [0,0.01,1,1800,123456789.12,MAX_EURO,-MAX_EURO]) assert.equal(roundEuro(value),value);
 assert.equal(roundEuro(1e-7),0);
 assert.equal(roundEuro(Number.MIN_VALUE),0);
 assert.equal(roundEuro(0.1+0.2),0.3);
});
test('malformed and out-of-range euro values fail closed without coercion',()=>{
 for(const input of [undefined,null,'1.005','',true,{},[],NaN,Infinity,-Infinity,1e9+0.01,-1e9-0.01]) assert.throws(()=>roundEuro(input),RangeError);
});
test('averages use exact decimal source values and round once at the end',()=>{
 assert.equal(meanEuro([274.62,274.63]),274.63);
 assert.equal(meanEuro([1,1.01]),1.01);
 assert.equal(meanEuro([1,2,2]),1.67);
 assert.equal(meanEuro([0.1,0.2]),0.15);
 assert.equal(meanEuro([1.004,1.004,1.007]),1.01);
 assert.equal(meanEuro([MAX_EURO,MAX_EURO]),MAX_EURO);
});
test('signed averages handle cancellation and tiny exponential inputs exactly',()=>{
 assert.equal(meanEuro([-274.62,-274.63]),-274.63);
 assert.equal(meanEuro([-MAX_EURO,MAX_EURO]),0);
 assert.equal(meanEuro([0.005,-0.005]),0);
 assert.equal(Object.is(meanEuro([-0,-0]),-0),false);
 assert.equal(meanEuro([Number.MIN_VALUE,0]),0);
});
test('averages reject missing and malformed observations rather than silently skipping them',()=>{
 for(const input of [[],null,1,'1',[1,NaN],[1,'2'],Array(2)]) assert.throws(()=>meanEuro(input),RangeError);
});
