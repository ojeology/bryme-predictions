import test from 'node:test';
import assert from 'node:assert/strict';
import { sameFixture } from '../src/lib/arbitrage.js';

const at = '2026-10-26T01:15:00.000Z';
const fixture = (event, startsAt = at) => ({ event, startsAt });

test('accents do not stop a match', () => {
  assert.equal(sameFixture(
    fixture('Jaguares de Cordoba v Llaneros FC'),
    fixture('Jaguares de Córdoba v Llaneros F.C.'),
  ), true);
});

test('a club-type word on one side only is still the same club', () => {
  assert.equal(sameFixture(
    fixture('CD Tolima v AD Pasto'),
    fixture('Deportes Tolima v Deportivo Pasto'),
  ), true);
});

test('an abbreviation on one side only is still the same club', () => {
  assert.equal(sameFixture(
    fixture('Cucuta Deportivo FC v Aguilas Doradas Rionegro'),
    fixture('Cúcuta Deportivo v Aguilas Doradas Rionegro'),
  ), true);
});

test('a shared generic word alone never makes a match', () => {
  assert.equal(sameFixture(
    fixture('Independiente Santa Fe v Atletico Bucaramanga'),
    fixture('Independiente del Valle v LDU Quito'),
  ), false);
});

test('two different clubs never match', () => {
  assert.equal(sameFixture(
    fixture('Real Madrid v Barcelona'),
    fixture('River Plate v Racing Club'),
  ), false);
});

test('the same club with a fuller name still matches', () => {
  assert.equal(sameFixture(
    fixture('Alianza FC Valledupar v Internacional de Bogota.'),
    fixture('Alianza FC v Internacional de Bogotá'),
  ), true);
});
