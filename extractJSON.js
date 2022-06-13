function writedata(data){
  let a = document.createElement("a")
  let fname = "cowdata.json"
  let file = new Blob([JSON.stringify(data)], {type:'text/plain'})
  a.href = URL.createObjectURL(file)
  a.download = fname
  a.click()
}

function collect(client){
  let data = {}
  data["abilitySlotsLevelRequirementList"] = client.abilitySlotsLevelRequirementList;
  data["enhancementLevelSuccessRateTable"] = client.enhancementLevelSuccessRateTable;
  data["enhancementLevelTotalBonusMultiplierTable"] = client.enhancementLevelTotalBonusMultiplierTable;
  data["levelExperienceTable"] = client.levelExperienceTable;
  // Monsters
  data["monsters"] = {};
  for( const [key, value] of Object.entries(client.combatMonsterDetailMap) ){
    let newMonster = {};
    newMonster["name"] = value.name;
    // Combat details
    combatDetails = value.combatDetails;
    // Combat stats
    combatStats = combatDetails.combatStats;
    newMonster["attackInterval"] = combatStats.attackInterval;
    newMonster["slashAccuracy"] = combatStats.slashAccuracy;
    newMonster["slashDamage"] = combatStats.slashDamage;
    newMonster["slashEvasion"] = combatStats.slashEvasion;
    newMonster["smashAccuracy"] = combatStats.smashAccuracy;
    newMonster["smashDamage"] = combatStats.smashDamage;
    newMonster["smashEvasion"] = combatStats.smashEvasion;
    newMonster["stabAccuracy"] = combatStats.stabAccuracy;
    newMonster["stabDamage"] = combatStats.stabDamage;
    newMonster["stabEvasion"] = combatStats.stabEvasion;
    newMonster["armor"] = combatStats.armor;
    newMonster["lifeSteal"] = combatStats.lifeSteal;
    //
    newMonster["combatStyleHrid"] = combatDetails.combatStyleHrid;
    newMonster["currentHitpoints"] = combatDetails.currentHitpoints;
    newMonster["currentManapoints"] = combatDetails.currentManapoints;
    newMonster["defenseLevel"] = combatDetails.defenseLevel;
    newMonster["powerLevel"] = combatDetails.powerLevel;
    newMonster["staminaLevel"] = combatDetails.staminaLevel;
    newMonster["attackLevel"] = combatDetails.attackLevel;
    // Monster drop table
    let drops = {}
    for( let item of value.dropTable ){
      let newdrop = {};
      newdrop["rate"] = item.dropRate;
      newdrop["name"] = item.itemHrid;
      newdrop["maxCount"] = item.maxCount;
      newdrop["minCount"] = item.minCount;
      drops[item.itemHrid] = newdrop;
    }
    newMonster["drops"] = drops;
    // Add the monster
    data["monsters"][value.name] = newMonster;
  }
  // Items
  data["items"] = {};
  for( const [key, value] of Object.entries(client.itemDetailMap) ){
    newitem = {};
    newitem["name"] = value.name;
    newitem["hrid"] = value.hrid;
    newitem["itemLevel"] = value.itemLevel;
    newitem["sellPrice"] = value.sellPrice;
    // ConsumableDetails
    consumableDetail = value.consumableDetail;
    // enhancementCosts
    enhancementCosts = value.enhancementCosts;
    // equipmentDetail
    equipmentDetail = value.equipmentDetail;
    data["items"][value.name] = newitem;
  }

  writedata(data);
}
