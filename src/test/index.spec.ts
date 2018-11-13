import test from 'ava';
import { normalizeGlob } from '..';

test('expands curly braces', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/{foo,bar}/{baz/,bas}', '/')), ['/foo/baz/', '/foo/bas', '/bar/baz/', '/bar/bas']);
});

test('resolves individual globs', (t) => {
    t.deepEqual(Array.from(normalizeGlob('{/foo,bar}', '/baz')), ['/foo', '/baz/bar']);
    t.deepEqual(Array.from(normalizeGlob('{/foo,bar}', '/')), ['/foo', '/bar']);
});

test('resolves . and ..', (t) => {
    t.deepEqual(Array.from(normalizeGlob('..', '/baz/bar')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('../..', '/baz/bar')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('../../..', '/baz/bar')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/..', '/')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/../..', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('/baz/bar/../../..', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('.', '/')), ['/']);
    t.deepEqual(Array.from(normalizeGlob('.', '/baz')), ['/baz']);
    t.deepEqual(Array.from(normalizeGlob('./', '/baz')), ['/baz/']);
    t.deepEqual(Array.from(normalizeGlob('', '/baz')), ['/baz']);
});
