import test from 'ava';
import { normalizeGlob } from '..';

test('expands curly braces', (t) => {
    t.deepEqual(Array.from(normalizeGlob('/{foo,bar}/{baz/,bas}', '/')), ['/foo/baz/', '/foo/bas', '/bar/baz/', '/bar/bas']);
});

test('resolves individual globs', (t) => {
    t.deepEqual(Array.from(normalizeGlob('{/foo,bar}', '/baz')), ['/foo', '/baz/bar']);
});
