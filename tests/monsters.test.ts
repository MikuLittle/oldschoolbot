import { Monsters } from 'oldschooljs';

import killableMonsters from '../src/lib/minions/data/killableMonsters';

describe('Monsters', () => {
	test('Goats are killable Monsters', () => {
		expect(killableMonsters).toContainEqual(expect.objectContaining({ id: Monsters.Goat.id }));
	});
});
