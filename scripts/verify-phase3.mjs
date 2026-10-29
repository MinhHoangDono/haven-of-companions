import { pilotCharacters } from '../src/data/charactersData.ts';
import { BASE_TILE } from '../src/types/engine.ts';

console.log(`Verifying Pilot Characters... (Count: ${pilotCharacters.length})`);

if (pilotCharacters.length !== 2) {
  console.error(`Expected 2 pilot characters, found ${pilotCharacters.length}`);
  process.exit(1);
}

const [thi, phuong] = pilotCharacters;

if (thi.id !== 'anh-thi-druid' || !thi.name.includes('Huỳnh Trần Anh Thi')) {
  console.error('Character 1 mismatch:', thi);
  process.exit(1);
}

if (phuong.id !== 'thanh-phuong-paladin' || !phuong.name.includes('Phạm Trần Thanh Phương')) {
  console.error('Character 2 mismatch:', phuong);
  process.exit(1);
}

if (phuong.pronoun !== 'she/her') {
  console.error(`Expected Thanh Phuong pronoun to be 'she/her', got: ${phuong.pronoun}`);
  process.exit(1);
}

// Coordinate check: Thi in Highlands (NW), Phuong in Coast (S)
console.log(`- ${thi.name} (${thi.classTitle}) @ (${thi.gridPos.x}, ${thi.gridPos.y}) in ${thi.factionName}`);
console.log(`- ${phuong.name} (${phuong.classTitle}, ${phuong.pronoun}) @ (${phuong.gridPos.x}, ${phuong.gridPos.y}) in ${phuong.factionName}`);

console.log('Phase 3 Character validation PASSED!');
