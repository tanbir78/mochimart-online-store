import test from 'node:test';
import assert from 'node:assert/strict';

export function toMinorUnits(amount) {
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0)
        throw new Error('Invalid amount');

    return Math.round(Number(amount) * 100);
}

test('converts decimal money to minor units', () => {
    assert.equal(toMinorUnits('12.34'), 1234);
    assert.equal(toMinorUnits(0), 0);
});

test('rejects negative money', () => {
    assert.throws(() => toMinorUnits(-1));
});