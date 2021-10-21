const languageMap: { [key: string]: string } = {
  'dailyrituals/dailyritualicon_altruism.png': 'Altriusm',
  'dailyrituals/dailyritualicon_boldness.png': 'Boldness',
  'dailyrituals/dailyritualicon_brutality.png': 'Brutality',
  'dailyrituals/dailyritualicon_deviousness.png': 'Deviousness',
  'dailyrituals/dailyritualicon_hunter.png': 'Hunter',
  'dailyrituals/dailyritualicon_objectives.png': 'Objectives',
  'dailyrituals/dailyritualicon_sacrifice.png': 'Sacrifice',
  'dailyrituals/dailyritualicon_survival.png': 'Survival',
  'dailyrituals/dailyritualicon_halloween.png': 'Halloween',
};

export default function getLanguage(tag) {
  return languageMap[tag] || null;
}
