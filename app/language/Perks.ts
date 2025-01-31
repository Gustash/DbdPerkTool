const languageMap: { [key: string]: string } = {
  'perks/ash/iconperks_buckleup.png': 'Survivor / Buckle Up',
  'perks/ash/iconperks_flipflop.png': 'Survivor / Flip-Flop',
  'perks/ash/iconperks_mettleofman.png': 'Survivor / Mettle of Man',
  'perks/cannibal/iconperks_bbqandchili.png': 'Killer / Barbecue & Chili',
  'perks/cannibal/iconperks_franklinsloss.png': "Killer / Franklin's Demise",
  'perks/cannibal/iconperks_knockout.png': 'Killer / Knock Out',
  'perks/dlc2/iconperks_decisivestrike.png': 'Survivor / Decisive Strike',
  'perks/dlc2/iconperks_dyinglight.png': 'Killer / Dying Light',
  'perks/dlc2/iconperks_objectofobsession.png':
    'Survivor / Object of Obsession',
  'perks/dlc2/iconperks_playwithyourfood.png': 'Killer / Play with your food',
  'perks/dlc2/iconperks_savethebestforlast.png':
    'Killer / Save the best for last',
  'perks/dlc2/iconperks_solesurvivor.png': 'Survivor / Sole Survivor',
  'perks/dlc3/iconperks_aceinthehole.png': 'Survivor / Ace in the Hole',
  'perks/dlc3/iconperks_devourhope.png': 'Killer / Hex: Devour Hope',
  'perks/dlc3/iconperks_openhanded.png': 'Survivor / Open-Handed',
  'perks/dlc3/iconperks_ruin.png': 'Killer / Hex: Ruin',
  'perks/dlc3/iconperks_thethirdseal.png': 'Killer / Hex: The Third Seal',
  'perks/dlc3/iconperks_thrillofthehunt.png':
    'Killer / Hex: Thrill of the Hunt',
  'perks/dlc3/iconperks_uptheante.png': 'Survivor / Up the Ante',
  'perks/dlc4/iconperks_alert.png': 'Survivor / Alert',
  'perks/dlc4/iconperks_generatorovercharge.png': 'Killer / Overcharge',
  'perks/dlc4/iconperks_lithe.png': 'Survivor / Lithe',
  'perks/dlc4/iconperks_monitorandabuse.png': 'Killer / Monitor & Abuse',
  'perks/dlc4/iconperks_overwhelmingpresence.png':
    'Killer / Overwhelming Presence',
  'perks/dlc4/iconperks_technician.png': 'Survivor / Technician',
  'perks/dlc5/iconperks_beastofprey.png': 'Killer / Beast of Prey',
  'perks/dlc5/iconperks_deadhard.png': 'Survivor / Dead Hard',
  'perks/dlc5/iconperks_huntresslullaby.png': 'Killer / Hex: Huntress Lullaby',
  'perks/dlc5/iconperks_nomither.png': 'Survivor / No Mither',
  'perks/dlc5/iconperks_territorialimperative.png':
    'Killer / Territorial Imperative',
  'perks/dlc5/iconperks_weregonnaliveforever.png':
    "Survivor / We're Gonna Live Forever",
  'perks/england/iconperks_bloodwarden.png': 'Killer / Blood Warden',
  'perks/england/iconperks_fireup.png': 'Killer / Fire Up',
  'perks/england/iconperks_pharmacy.png': 'Survivor / Pharmacy',
  'perks/england/iconperks_rememberme.png': 'Killer / Remember Me',
  'perks/england/iconperks_vigil.png': 'Survivor / Vigil',
  'perks/england/iconperks_wakeup.png': 'Survivor / Wake Up!',
  'perks/finland/iconperks_detectiveshunch.png': "Survivor / Detective's Hunch",
  'perks/finland/iconperks_hangmanstrick.png': "Killer / Hangman's Trick",
  'perks/finland/iconperks_makeyourchoice.png': 'Killer / Make your Choice',
  'perks/finland/iconperks_stakeout.png': 'Survivor / Stake Out',
  'perks/finland/iconperks_surveillance.png': 'Killer / Surveillance',
  'perks/finland/iconperks_tenacity.png': 'Survivor / Tenacity',
  'perks/guam/iconperks_bamboozle.png': 'Killer / Bamboozle',
  'perks/guam/iconperks_coulrophobia.png': 'Killer / Coulrophobia',
  'perks/guam/iconperks_popgoestheweasel.png': 'Killer / Pop Goes the Weasel',
  'perks/haiti/iconperks_autodidact.png': 'Survivor / Autodidact',
  'perks/haiti/iconperks_deliverance.png': 'Survivor / Deliverance',
  'perks/haiti/iconperks_diversion.png': 'Survivor / Diversion',
  'perks/haiti/iconperks_hatred.png': 'Killer / Rancor',
  'perks/haiti/iconperks_hauntedground.png': 'Killer / Hex: Haunted Ground',
  'perks/haiti/iconperks_spiritfury.png': 'Killer / Spirit Fury',
  'perks/iconperks_adrenaline.png': 'Survivor / Adrenaline',
  'perks/iconperks_agitation.png': 'Killer / Agitation',
  'perks/iconperks_anursescalling.png': "Killer / A Nurse's Calling",
  'perks/iconperks_balancedlanding.png': 'Survivor / Balanced Landing',
  'perks/iconperks_bittermurmur.png': 'Killer / Bitter Murmur',
  'perks/iconperks_bloodhound.png': 'Killer / Bloodhound',
  'perks/iconperks_bond.png': 'Survivor / Bond',
  'perks/iconperks_botanyknowledge.png': 'Survivor / Botany Knowledge',
  'perks/iconperks_brutalstrength.png': 'Killer / Brutal Strength',
  'perks/iconperks_calmspirit.png': 'Survivor / Calm Spirit',
  'perks/iconperks_darksense.png': 'Survivor / Dark Sense',
  'perks/iconperks_deerstalker.png': 'Killer / Deerstalker',
  'perks/iconperks_dejavu.png': 'Survivor / Deja Vu',
  'perks/iconperks_distressing.png': 'Killer / Distressing',
  'perks/iconperks_empathy.png': 'Survivor / Empathy',
  'perks/iconperks_enduring.png': 'Killer / Enduring',
  'perks/iconperks_hope.png': 'Survivor / Hope',
  'perks/iconperks_insidious.png': 'Killer / Insidious',
  'perks/iconperks_irongrasp.png': 'Killer / Iron Grasp',
  'perks/iconperks_ironwill.png': 'Survivor / Iron Will',
  'perks/iconperks_kindred.png': 'Survivor / Kindred',
  'perks/iconperks_laststanding.png': 'Survivor / Last Standing',
  'perks/iconperks_leader.png': 'Survivor / Leader',
  'perks/iconperks_lightborn.png': 'Killer / Lightborn',
  'perks/iconperks_lightweight.png': 'Survivor / Lightweight',
  'perks/iconperks_monstrousshrine.png': 'Killer / Monstrous Shrine',
  'perks/iconperks_nooneescapesdeath.png': 'Killer / Hex: No One Escapes Death',
  'perks/iconperks_nooneleftbehind.png': 'Survivor / No One Left Behind',
  'perks/iconperks_plunderersinstinct.png': "Survivor / Plunderer's Instinct",
  'perks/iconperks_predator.png': 'Killer / Predator',
  'perks/iconperks_premonition.png': 'Survivor / Premonition',
  'perks/iconperks_provethyself.png': 'Survivor / Prove Thyself',
  'perks/iconperks_quickandquiet.png': 'Survivor / Quick & Quiet',
  'perks/iconperks_resilience.png': 'Survivor / Resilience',
  'perks/iconperks_saboteur.png': 'Survivor / Saboteur',
  'perks/iconperks_selfcare.png': 'Survivor / Self-Care',
  'perks/iconperks_shadowborn.png': 'Killer / Shadowborn',
  'perks/iconperks_slipperymeat.png': 'Survivor / Slippery Meat',
  'perks/iconperks_sloppybutcher.png': 'Killer / Sloppy Butcher',
  'perks/iconperks_smallgame.png': 'Survivor / Small Game',
  'perks/iconperks_spiesfromtheshadows.png': 'Killer / Spies from the Shadows',
  'perks/iconperks_spinechill.png': 'Survivor / Spine Chill',
  'perks/iconperks_sprintburst.png': 'Survivor / Sprint Burst',
  'perks/iconperks_streetwise.png': 'Survivor / Streetwise',
  'perks/iconperks_stridor.png': 'Killer / Stridor',
  'perks/iconperks_thatanophobia.png': 'Killer / Thatanophobia',
  'perks/iconperks_thisisnothappening.png': 'Survivor / This Is Not Happening',
  'perks/iconperks_tinkerer.png': 'Killer / Tinkerer',
  'perks/iconperks_unnervingpresence.png': 'Killer / Unnerving Presence',
  'perks/iconperks_unrelenting.png': 'Killer / Unrelenting',
  'perks/iconperks_urbanevasion.png': 'Survivor / Urban Evasion',
  'perks/iconperks_wellmakeit.png': "Survivor / We'll make it",
  'perks/iconperks_whispers.png': 'Killer / Whispers',
  'perks/kate/iconperks_boilover.png': 'Survivor / Boil Over',
  'perks/kate/iconperks_dancewithme.png': 'Survivor / Dance With Me',
  'perks/kate/iconperks_windowsofopportunity.png':
    'Survivor / Windows of Opportunity',
  'perks/kenya/iconperks_aftercare.png': 'Survivor / Aftercare',
  'perks/kenya/iconperks_breakdown.png': 'Survivor / Breakdown',
  'perks/kenya/iconperks_discordance.png': 'Killer / Discordance',
  'perks/kenya/iconperks_distortion.png': 'Survivor / Distortion',
  'perks/kenya/iconperks_ironmaiden.png': 'Killer / Iron Maiden',
  'perks/kenya/iconperks_madgrit.png': 'Killer / Mad Grit',
  'perks/l4d/iconperks_borrowedtime.png': 'Survivor / Borrowed Time',
  'perks/l4d/iconperks_leftbehind.png': 'Survivor / Left Behind',
  'perks/l4d/iconperks_unbreakable.png': 'Survivor / Unbreakable',
  'perks/mali/iconperks_corruptintervention.png':
    'Killer / Corrupt Intervention',
  'perks/mali/iconperks_darkdevotion.png': 'Killer / Dark Devotion',
  'perks/mali/iconperks_headon.png': 'Survivor / Head On',
  'perks/mali/iconperks_infectiousfright.png': 'Killer / Infectious Fright',
  'perks/mali/iconperks_poised.png': 'Survivor / Poised',
  'perks/mali/iconperks_solidarity.png': 'Survivor / Solidarity',
  'perks/oman/iconperks_furtivechase.png': 'Killer / Furtive Chase',
  'perks/oman/iconperks_imallears.png': "Killer / I'm All Ears",
  'perks/oman/iconperks_thrillingtremors.png': 'Killer / Thrilling Tremors',
  'perks/qatar/iconperks_babysitter.png': 'Survivor / Guardian',
  'perks/qatar/iconperks_bettertogether.png': 'Survivor / Situational Awareness',
  'perks/qatar/iconperks_camaraderie.png': 'Survivor / Kinship',
  'perks/qatar/iconperks_cruelconfinement.png': 'Killer / Claustrophobia',
  'perks/qatar/iconperks_fixated.png': 'Survivor / Self-Aware',
  'perks/qatar/iconperks_innerstrength.png': 'Survivor / Inner Healing',
  'perks/qatar/iconperks_mindbreaker.png': 'Killer / Fearmonger',
  'perks/qatar/iconperks_secondwind.png': 'Survivor / Renewal',
  'perks/qatar/iconperks_surge.png': 'Killer / Jolt',
  'perks/sweden/iconperks_anymeansnecessary.png':
    'Survivor / Any Means Necessary',
  'perks/sweden/iconperks_bloodecho.png': 'Killer / Blood Echo',
  'perks/sweden/iconperks_breakout.png': 'Survivor / Breakout',
  'perks/sweden/iconperks_luckybreak.png': 'Survivor / Lucky Break',
  'perks/sweden/iconperks_nemesis.png': 'Killer / Nemesis',
  'perks/sweden/iconperks_zanshintactics.png': 'Killer / Zanshin Tactics',
  'perks/ukraine/iconperks_deadmanswitch.png': 'Killer / Dead Man’s Switch\t',
  'perks/ukraine/iconperks_forthepeople.png': 'Survivor / For the People',
  'perks/ukraine/iconperks_gearhead.png': 'Killer / Gearhead',
  'perks/ukraine/iconperks_hexretribution.png': 'Killer / Hex: Retribution',
  'perks/ukraine/iconperks_offtherecord.png': 'Survivor / Off the Record',
  'perks/ukraine/iconperks_redherring.png': 'Survivor / Red Herring',
  'perks/wales/iconperks_bloodpact.png': 'Survivor / Blood Pact',
  'perks/wales/iconperks_deathbound.png': 'Killer / Deathbound',
  'perks/wales/iconperks_forcedpenance.png': 'Killer / Forced Penance',
  'perks/wales/iconperks_repressedalliance.png':
    'Survivor / Repressed Alliance',
  'perks/wales/iconperks_soulguard.png': 'Survivor / Soul Guard',
  'perks/wales/iconperks_trailoftorment.png': 'Killer / Trail of Torment',
  'perks/yemen/iconperks_builttolast.png': 'Survivor / Built To Last',
  'perks/yemen/iconperks_desperatemeasures.png':
    'Survivor / Desperate Measures',
  'perks/yemen/iconperks_dragonsgrip.png': "Killer / Dragon's Grip",
  'perks/yemen/iconperks_hexbloodfavor.png': 'Killer / Hex: Blood Favor',
  'perks/yemen/iconperks_hexundying.png': 'Killer / Hex: Undying',
  'perks/yemen/iconperks_visionary.png': 'Survivor / Visionary',
  "perks/aurora/iconperks_appraisal.png": 'Survivor / Appraisal',
  "perks/aurora/iconperks_coupdegrace.png": 'Killer / Coup De Grace',
  "perks/aurora/iconperks_deception.png": 'Survivor / Deception',
  "perks/aurora/iconperks_hoarder.png": 'Killer / Hoarder',
  "perks/aurora/iconperks_oppression.png": 'Killer / Oppression',
  "perks/aurora/iconperks_powerstruggle.png": 'Survivor / Power Struggle',
  "perks/comet/iconperks_fasttrack.png": 'Survivor / Fast Track',
  "perks/comet/iconperks_hexcrowdcontrol.png": "Killer / Hex: Crowd Control",
  "perks/comet/iconperks_nowayout.png": "Killer / No Way Out",
  "perks/comet/iconperks_self-preservation.png": "Survivor / Self Preservation",
  "perks/comet/iconperks_smashhit.png": "Survivor / Smash Hit",
  "perks/comet/iconperks_starstruck.png": "Killer / Star Struck",
  "perks/eclipse/iconperks_bitethebullet.png": 'Survivor / Bite the Bullet',
  "perks/eclipse/iconperks_blastmine.png": 'Survivor / Blast Mine',
  "perks/eclipse/iconperks_counterforce.png": 'Survivor / Counter Force',
  "perks/eclipse/iconperks_eruption.png": 'Killer / Eruption',
  "perks/eclipse/iconperks_flashbang.png": 'Survivor / Flashbang',
  "perks/eclipse/iconperks_hysteria.png": 'Killer / Hysteria',
  "perks/eclipse/iconperks_lethalpursuer.png": 'Killer / Lethal Pursuer',
  "perks/eclipse/iconperks_resurgence.png": 'Survivor / Resurgence',
  "perks/eclipse/iconperks_rookiespirit.png": 'Survivor / Rookie Spirit',
  'perks/gemini/iconperks_deadlock.png': 'Killer / Deadlock',
  'perks/gemini/iconperks_hexplaything.png': 'Killer / Hex: Plaything',
  'perks/gemini/iconperks_scourgehookgiftofpain.png': 'Killer / Scourge Hook: Gift of Pain',
  'perks/nolicense/iconperks_bloodwarden.png': '[NO LICENSE] Blood Warden',
  'perks/nolicense/iconperks_decisivestrike.png': '[NO LICENSE] Decisive Strike',
  'perks/nolicense/iconperks_dyinglight.png': '[NO LICENSE] Dying Light',
  'perks/nolicense/iconperks_fireup.png': '[NO LICENSE] Fire Up',
  'perks/nolicense/iconperks_objectofobsession.png': '[NO LICENSE] Object of Obsession',
  'perks/nolicense/iconperks_pharmacy.png': '[NO LICENSE] Pharmacy',
  'perks/nolicense/iconperks_playwithyourfood.png': '[NO LICENSE] Play With Your Food',
  'perks/nolicense/iconperks_rememberme.png': '[NO LICENSE] Remember Me',
  'perks/nolicense/iconperks_savethebestforlast.png': '[NO LICENSE] Save The Best For Last',
  'perks/nolicense/iconperks_solesurvivor.png': '[NO LICENSE] Sole Survivor',
  'perks/nolicense/iconperks_vigil.png': '[NO LICENSE] Vigil',
  'perks/nolicense/iconperks_wakeup.png': '[NO LICENSE] Wake Up',
  "perks/hubble/iconperks_booncircleofhealing.png": "Survivor / Boon: Circle of Healing",
  "perks/hubble/iconperks_boonshadowstep.png": "Survivor / Boon: Shadow Step",
  "perks/hubble/iconperks_clairvoyance.png": "Survivor / Clairvoyance",
  "perks/qatar/iconperks_guardian.png": "Survivor / Guardian",
  "perks/qatar/iconperks_pushthroughit.png": "Survivor / Push Through It",
  "perks/qatar/iconperks_situationalawareness.png": "Survivor / Situtational Awareness",
  "perks/qatar/iconperks_survivalinstincts.png": "Survivor / Survival Instincts",
  "perks/ion/t_iconperks_boonexponential.png": "Survivor / Boon: Exponential",
  "perks/ion/t_iconperks_correctiveaction.png": "Survivor / Corrective Action",
  "perks/ion/t_iconperks_grimembrace.png": "Killer / Grim Embrace",
  "perks/ion/t_iconperks_hexpentimento.png": "Killer / Hex: Pentimento",
  "perks/ion/t_iconperks_overcome.png": "Survivor / Overcome",
  "perks/ion/t_iconperks_painresonance.png": "Killer / Pain Resonance",
  "perks/kepler/iconperks_callofbrine.png": "Killer / Call of Brine",
  "perks/kepler/iconperks_darktheory.png": "Survivor / Boon : Dark Theory",
  "perks/kepler/iconperks_empathicconnection.png": "Survivor / Empathic Connection",
  "perks/kepler/iconperks_floodofrage.png": "Killer / Flood of Rage",
  "perks/kepler/iconperks_mercilessstorm.png": "Killer / Merciless Storm",
  "perks/kepler/iconperks_parentalguidance.png": "Survivor / Parental Guidance"
};

export default function getLanguage(tag: string) {
  return languageMap[tag] || null;
}
