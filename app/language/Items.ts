const languageMap: { [key: string]: string } = {
  'items/anniversary/iconitems_flashlight_anniversary2020.png':
    '4th Anniversary Flashlight',
  'items/anniversary/iconitems_medkit_anniversary2020.png':
    '4th Anniversary MedKit',
  'items/anniversary/iconitems_partypopper.png': 'Party Popper',
  'items/halloween/iconitems_flashlighthalloween.png': 'Halloween Flashlight',
  'items/halloween/iconitems_medkithalloween.png': 'Halloween Medkit',
  'items/iconitems_brokenkey.png': 'Broken Key',
  'items/iconitems_chinesefirecracker.png': 'Chinese Firecracker',
  'items/iconitems_dullkey.png': 'Dull Key',
  'items/iconitems_firstaidkit.png': 'First Aid Kit',
  'items/iconitems_flashlight.png': 'Flashlight',
  'items/iconitems_flashlightsport.png': 'Sport Flashlight',
  'items/iconitems_flashlightutility.png': 'Utility Flashlight',
  'items/iconitems_key.png': 'Key',
  'items/iconitems_map.png': 'Map',
  'items/iconitems_medkit.png': 'MedKit',
  'items/iconitems_rainbowmap.png': 'Rainbow Map',
  'items/iconitems_rangersaidkit.png': "Ranger's Aid Kit",
  'items/iconitems_rundownaidkit.png': 'Camping Aid Kit',
  'items/iconitems_toolbox.png': 'Toolbox',
  'items/iconitems_toolboxalexs.png': "Alex's Toolbox",
  'items/iconitems_toolboxcommodious.png': 'Commodius Toolbox',
  'items/iconitems_toolboxengineers.png': "Engineer's Toolbox",
  'items/iconitems_toolboxmechanics.png': "Mechanic's Toolbox",
  'items/iconitems_toolboxwornout.png': 'Worn-Out Tools',
  'items/winterevent/iconitems_wintereventfirecracker.png': 'Winter Firecracker',
  'items/lunarevent/iconitems_toolboxlunar.png': 'Lunar Toolbox',
  "items/limited/iconitems_flashbanggrenade.png": 'Flashbang Grenade',
  "items/limited/iconitems_limiteditemvaccine.png": 'Vaccine',
  "items/anniversary/iconitems_toolbox_anniversary2021.png": "2021 Toolbox",
  "items/iconitems_carriedbody.png": "Carried Body",
  "items/limited/iconitems_limitedlamentconfiguration.png": "Limited Lament Configuration",
  "items/iconitems_toolboxcommodious_-_copy.png": "Toolbox (Copy)",
  "items/limited/iconitems_limitedfragilemirror.png": "Limited Fragile Mirror",
  "items/limited/iconitems_limitedrepairedmirror.png": "Limited Repaired Mirror",
  "items/limited/iconitems_limitedvhstape.png": 'Limited VHS Tape'
};

export default function getLanguage(tag) {
  return languageMap[tag] || null;
}
