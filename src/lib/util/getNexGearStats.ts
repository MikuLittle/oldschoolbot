import { calcWhatPercent, randInt } from 'e';
import { KlasaUser } from 'klasa';
import { itemID } from 'oldschooljs/dist/util';

import { maxOffenceStats } from '../gear/data/maxGearStats';
import { GearSetupTypes } from '../gear/types';
import { NexMonster } from '../nex';
import { UserSettings } from '../settings/types/UserSettings';

export function getNexGearStats(
	user: KlasaUser,
	team: string[]
): [
	{
		chanceOfDeath: number;
		damageDone: number;
		percentRangeStrength: number;
		totalGearPercent: number;
		percentWeaponAttackRanged: number;
		attackRangedStat: number;
		kc: number;
	},
	string
] {
	const kc = user.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 1;
	const weapon = user.equippedWeapon(GearSetupTypes.Range);
	const gearStats = user.setupStats(GearSetupTypes.Range);
	const percentRangeStrength = calcWhatPercent(
		gearStats.attack_ranged,
		maxOffenceStats.attack_ranged
	);
	const attackRangedStat = weapon?.equipment?.attack_ranged ?? 0;
	const percentWeaponAttackRanged = Math.min(calcWhatPercent(attackRangedStat, 95), 100);
	const totalGearPercent = Math.min((percentRangeStrength + percentWeaponAttackRanged) / 2, 100);

	let percentChanceOfDeath = Math.floor(100 - (Math.log(kc) / Math.log(Math.sqrt(15))) * 50);

	// If they have 50% best gear, -25% chance of death.
	percentChanceOfDeath = Math.floor(percentChanceOfDeath - totalGearPercent / 2);

	// Chance of death cannot be over 90% or <2%.
	percentChanceOfDeath = Math.max(Math.min(percentChanceOfDeath, 100), 5);

	// Damage done starts off as being HP divided by user size.
	let damageDone = 6000 / team.length;

	// Half it, to use a low damage amount as the base.
	damageDone /= 1.5;

	// If they have the BIS weapon, their damage is doubled.
	// e.g. 75% of of the best = 1.5x damage done.
	damageDone *= percentWeaponAttackRanged / 80;

	if (weapon?.id === itemID('Twisted bow')) {
		damageDone *= 1.1;
	}

	// Heavily punish them for having a weaker crush weapon than a zammy hasta.
	if (attackRangedStat < 69) {
		damageDone /= 1.5;
	}

	if (kc < 3) {
		percentChanceOfDeath = randInt(80, 90);
	} else if (kc < 10) {
		percentChanceOfDeath = randInt(40, 75);
	} else if (kc < 20) {
		percentChanceOfDeath = randInt(20, 40);
	} else if (kc < 30) {
		percentChanceOfDeath = randInt(5, 30);
	}

	const debugString = `\n**${user.username}:** DamageDone[${Math.floor(
		damageDone
	)}HP] DeathChance[${Math.floor(percentChanceOfDeath)}%] WeaponStrength[${Math.floor(
		percentWeaponAttackRanged
	)}%] GearStrength[${Math.floor(percentRangeStrength)}%] TotalGear[${totalGearPercent}%]\n`;

	return [
		{
			chanceOfDeath: percentChanceOfDeath,
			damageDone,
			percentRangeStrength,
			totalGearPercent,
			percentWeaponAttackRanged,
			attackRangedStat,
			kc
		},
		debugString
	];
}
