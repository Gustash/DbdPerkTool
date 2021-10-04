const languageMap: { [key: string]: string } = {
  'powers/cannibal/iconpowers_bubbaschainsaw.png':
    "Cannibal / Bubba's Chainsaw",
  'powers/cannibal/iconpowers_tantrum.png': 'Cannibal / Tantrum',
  'powers/dlc2/iconpowers_stalker1.png': 'Shape / Stalker 1',
  'powers/dlc2/iconpowers_stalker2.png': 'Shape / Stalker 2',
  'powers/dlc2/iconpowers_stalker3.png': 'Shape / Stalker 3',
  'powers/dlc3/iconpowers_blackenedcatalyst.png': 'Hag / Blackened Catalyst',
  'powers/dlc4/iconpowers_cartersspark.png': "Doctor / Carter's Spark",
  'powers/dlc5/iconpowers_huntinghatchets.png': 'Huntress / Hunting Hatchets',
  'powers/england/iconpowers_dreammaster.png': 'Nightmare / Dream Demon',
  'powers/finland/iconpowers_reversebeartrap.png': "Pig / Jigsaw's Baptism",
  'powers/guam/iconpowers_gasbomb.png': 'Clown / The Afterpiece Tonic',
  'powers/guam/iconpowers_gasbomb2.png': 'Clown / The Afterpiece Antidote',
  'powers/haiti/iconpowers_yamaokashaunting.png': "Spirit / Yamaoka's Haunting",
  'powers/iconpowers_bell.png': 'Wraith / Wailing Bell',
  'powers/iconpowers_breath.png': "Nurse / Spencer's Last Breath",
  'powers/iconpowers_chainsaw.png': 'Hillbilly / Chainsaw',
  'powers/iconpowers_trap.png': 'Trapper / Bear Trap',
  'powers/kenya/iconpowers_feralfrenzy.png': 'Legion / Feral Frenzy',
  'powers/mali/iconpowers_vilepurge.png': 'Plague / Vile Purge',
  'powers/oman/iconpowers_ghostpower_activated.png':
    'GhostFace / Night Shroud (Activated)',
  'powers/oman/iconpowers_ghostpower_available.png':
    'GhostFace / Night Shroud (Available)',
  'powers/qatar/iconpowers_oftheabyss.png': 'Demogorgon / Of The Abyss',
  'powers/sweden/iconpowers_yamaokaswrath_demon.png':
    "Oni / Yamaoka's Wrath (Demon)",
  'powers/sweden/iconpowers_yamaokaswrath.png': "Oni / Yamaoka's Wrath",
  'powers/ukraine/iconpowers_uk_chainbreak.png':
    'Deathslinger / The Redeemer (Chain Break)',
  'powers/ukraine/iconpowers_uk.png': 'Deathslinger / The Redeemer',
  'powers/wales/iconpowers_wales_ritesofjudgement.png':
    'Executioner / Rites of Judgement',
  'powers/yemen/iconpowers_k21.png': 'Blight / Blighted Corruption',
  'powers/aurora/iconpowers_bloodbond_01.png': 'The Twins / Blood Bond 01',
  'powers/aurora/iconpowers_bloodbond_02.png': 'The Twins / Blood Bond 02 (Bebeh)',
  'powers/comet/iconpowers_showstopper_01.png': 'The Trickster / Showstopper 01',
  'powers/comet/iconpowers_showstopper_02.png': 'The Trickster / Showstopper 02',
  "powers/eclipse/iconpowers_t-virus1.png": 'Nemesis / T-Virus 01',
  "powers/eclipse/iconpowers_t-virus2.png": 'Nemesis / T-Virus 02',
  "powers/eclipse/iconpowers_t-virus3.png": 'Nemesis / T-Virus 03',
  "powers/eclipse/iconpowers_tyrantmutations.png": 'Nemesis / Tryant Mutations',
  "powers/gemini/iconpowers_summonsofpain.png": "Pin Daddy / Summons of Pain"
};

export default function getLanguage(tag) {
  return languageMap[tag] || null;
}
