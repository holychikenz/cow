import json
import numpy as np

with open("cowdata_test.json") as j:
  data = json.load(j)

fitezones = {h:v for (h,v) in data['actionDetailMap'].items() if v['type'] == '/action_types/combat'}

def getRandomEncounter(z):
  zone = fitezones[z]
  spawnInfo = zone['monsterSpawnInfo']
  totalWeight = sum([ v['rate'] for v in spawnInfo['spawns'] ])
  
  encounterHrids = []
  totalStrength = 0
  for i in range(spawnInfo['maxSpawnCount']):
    randomWeight = totalWeight * np.random.rand()
    cumWeight = 0
    for spawn in spawnInfo['spawns']:
      cumWeight += spawn['rate']
      if randomWeight <= cumWeight:
        totalStrength += spawn['strength']
        if totalStrength <= spawnInfo["maxTotalStrength"]:
          encounterHrids.append(spawn['combatMonsterHrid'])
        else:
          return encounterHrids
        break
  return encounterHrids

def simDist(z, counts=1000000):
  print(z)
  if len((fitezones[z]['monsterSpawnInfo']['spawns'])) == 1:
    return {fitezones[z]['monsterSpawnInfo']['spawns'][0]['combatMonsterHrid']:1.0}
  ds = np.concatenate([getRandomEncounter(z) for i in range(counts)])
  return {v:np.sum(ds==v)/counts for v in np.unique(ds)}

data_to_write = {fz:simDist(fz) for fz in fitezones.keys()}

with open("cow_encounters.json", "w") as j:
  json.dump(data_to_write, j, indent=2)
