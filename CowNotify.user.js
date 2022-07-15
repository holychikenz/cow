// ==UserScript==
// @name         CowNotify
// @version      0.0.3
// @description  Milkyway example script
// @author       Holychikenz
// @updateURL    https://github.com/holychikenz/cow/raw/main/CowNotify.user.js
// @downloadURL  https://github.com/holychikenz/cow/raw/main/CowNotify.user.js
// @match        *://*www.milkywayidle.com/*
// @match        *://*test.milkywayidle.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const nativeWebSocket = window.WebSocket;
window.WebSocket = function(...args){
  const socket = new nativeWebSocket(...args);
  window.cowsocket = socket;
  window.cowsocket.addEventListener('message', function handler(e){
    let msg = JSON.parse(e.data);
    if( msg.type == 'init_character_info' ){
      window.init_character_info = msg;
    }
    if( msg.type == 'init_client_info' ){
      window.init_client_info = msg;
    }
    if( typeof window.init_character_info !== 'undefined' && typeof window.init_client_info !== 'undefined' ){
      window.cowsocketready = true;
      this.removeEventListener('message', handler);
    }
  });
  return socket;
};

class notify {
  constructor() {
    this.begin();
  }
  begin(promise){
    let self = this;
    promise = promise || new Promise( ()=>{} );
    if( window.cowsocketready ){
      promise.then();
    } else {
      setTimeout(function(){self.begin(promise)}, 1000);
      return false;
    }
    console.log("Notifications connected");
    window.cowsocket.addEventListener('message', (e)=>self.run(self, e));
    Notification.requestPermission();
  }
  run(obj, msg){
    msg = JSON.parse(msg.data);
    if( msg.type == "action_started" ){
      if( msg.characterAction.actionHrid == "/actions/idle/idle" ){
        this.displayMessage("MoooOoOo")
      }
    }
  }
  displayMessage(message) {
    let note = new Notification( message, {icon: "/assets/images/logos/logo_transparent_570.svg"} );
    note.onclick = function(){window.focus(); this.close()};
    setTimeout(()=>{note.close()}, 10*1000);
  }
}

class ETA {
  // Calculate the time remaining for current action.
  // Also: Total XP, Final XP, Final Level? Maybe on hover ...
  constructor() {
    this.begin();
  }
  begin(promise){
    let self = this;
    promise = promise || new promise( ()=>{} );
    if( window.cowsocketready ){
      promise.then();
    } else {
      setTimeout(function(){self.begin(promise)}, 1000);
      return false;
    }
    window.cowsocket.addEventListener('message',(e)=>self.run(self,e));
  }
  run(obj, msg){
    msg = JSON.parse(msg.data);
    // Update Character on level up needed. No.
    if( msg.type == "action_completed" ){
    }
    if( msg.type == "action_started" ){
    }
    // Update speed based on tool bonus
    if( msg.type == "items_updated" ){
      let items = msg.endCharacterItems;
      for( let itm of items ){
      }
    }
  }
}

class combatlog {
  constructor() {
    this.resetFlag = true;
    this.reset(this);
    this.begin();
  }
  reset(self){
    self.timer = Date.now();
    self.counter = -1;
    self.damage = 0;
    self.skillAttack = -1;
    self.skillDefense = -1;
    self.skillPower = -1;
    self.skillIntelligence = -1;
    self.skillStamina = -1;
    self.beginAttack = 0;
    self.beginDefense= 0;
    self.beginPower= 0;
    self.beginIntelligence = 0;
    self.beginStamina= 0;
    // update all items
    if( typeof self.combatDrops !== 'undefined' ){
      for( const [key, value] of Object.entries(self.combatDrops) ) {
        for( let base of self.characterItems ){
          if( base.itemHrid == key ){
            base.count += value.count;
          }
        }
      }
    }
    self.combatDrops = {};
  }
  partialreset(self){
    self.timer = Date.now();
    self.counter = -1;
    self.damage = 0;
    self.beginAttack = 0;
    self.beginDefense= 0;
    self.beginPower= 0;
    self.beginIntelligence = 0;
    self.beginStamina= 0;
  }
  begin(promise){
    let self = this;
    promise = promise || new Promise( ()=>{} );
    if( window.cowsocketready ){
      promise.then();
    } else {
      setTimeout(function(){self.begin(promise)}, 1000);
      return false;
    }
    self.characterItems = window.init_character_info.characterItems;
    self.rarity = self.buildRarityDictionary();
    console.log(self.rarity);
    window.cowsocket.addEventListener('message', (e)=>self.run(self, e));
    self.statswindow = document.createElement("div");
    self.statswindow.className = "chikenz_combatlog_stats";
    self.statswindow.style.width = '300px';

    self.dropswindow = document.createElement("div");
    self.dropswindow.className = "chikenz_combatlog_stats";
    self.dropswindow.style.width = '300px';
    let css = `
        table.chikenz_combatlog_stats {
          border: 1px solid #FFFFFF;
          text-align: center;
          border-collapse: collapse;
          margin-left: 10px;
        }
        table.chikenz_combatlog_stats td, table.chikenz_combatlog_stats th {
          border: 1px solid #FFFFFF20;
          padding: 4px 4px;
        }
        table.chikenz_combatlog_stats tr:nth-child(even) {
          background: #44526e;
        }
        table.chikenz_combatlog_stats tr:nth-child(odd) {
          background: #152242;
        }

        .chikenz_drop_box {
          display:grid;
          grid-template-rows:repeat(4, 50px);
          grid-auto-columns:50px;
          grid-auto-flow:column dense;
          column-gap:4px;
          row-gap:4px;
        }
        .chikenz_drop_item {
          border-radius: 4px;
          border: 1px solid var(--color-space-300);
        }
        .chikenz_rare {
          border: 2px solid #fcc203;
        }
        .chikenz_drop_box > div:nth-child(4n + 2) { grid-row:2; }
        .chikenz_drop_box > div:nth-child(4n + 3) { grid-row:3; }
        .chikenz_drop_box > div:nth-child(4n + 4) { grid-row:4; }
        .chikenz_drop_img {
          position: absolute;
          top: 15%;
          left: 15%;
          width: 70%;
          height: 70%;
        }
        .chikenz_drop_text {
          z-index: 1;
          position: absolute;
          bottom: -3px;
          font-weight: 800;
          right: 2px;
          text-align: left;
          font-size: 12px;
          text-shadow: -1px 0 var(--color-background-dark-mode),0 1px var(--color-background-dark-mode),1px 0 var(--color-background-dark-mode),0 -1px var(--color-background-dark-mode);
        }
    `
    appendCSS(css);
  }
  run(obj, msg){
    msg = JSON.parse(msg.data);
    if( msg.type == "action_started" ){
      this.resetFlag = true;
    }
    if( msg.type == "new_battle" ){
      this.counter += 1;
      if( this.resetFlag ){
        this.resetFlag = false;
        this.reset(this);
      }
      // Add up monster HP -- though they can heal =(
      let timediff = (Date.now() - this.timer)/3.6e6;
      let titlebar = document.querySelectorAll("[class^='BattlePanel_title']")[0];
      titlebar.innerHTML += `<br>${timeFormat(timediff*3600)}`;
      let kph = this.counter / timediff;
      // update the stats box
      let panel = document.querySelectorAll("[class^='BattlePanel_playersArea']")
      if( panel.length > 0 ){
        panel = panel[0];
        this.statswindow.innerHTML = `
        <table class="chikenz_combatlog_stats">
        <tr><td>Battles</td><td>${kph.toFixed(1)} / hour</td></tr>
        <tr><td>Power XP</td><td>${((this.skillPower-this.beginPower)/timediff).toFixed(0)} / hour</td></tr>
        <tr><td>Attack XP</td><td>${((this.skillAttack-this.beginAttack)/timediff).toFixed(0)} / hour</td></tr>
        <tr><td>Stamina XP</td><td>${((this.skillStamina-this.beginStamina)/timediff).toFixed(0)} / hour</td></tr>
        <tr><td>Defense XP</td><td>${((this.skillDefense-this.beginDefense)/timediff).toFixed(0)} / hour</td></tr>
        <tr><td>Intelligence XP</td><td>${((this.skillIntelligence-this.beginIntelligence)/timediff).toFixed(0)} / hour</td></tr>
        </table>
        `
        // Drops
        panel.append(this.statswindow)
      }
      // Same type of panel but for items?
      let panel2 = document.querySelectorAll("[class^='BattlePanel_monstersArea']")
      if( panel2.length > 0 ){
        panel2 = panel2[0];
        this.dropswindow.innerHTML = this.buildItemTable(this, this.combatDrops);
        panel2.append(this.dropswindow);
      }
    }
    if( msg.type == 'action_completed' ){
      // update xp stats
      for( let skl of msg.endCharacterSkills ){
        if( this.skillAttack < 0 ){
          this.partialreset(this);
        }
        if( skl.skillHrid == '/skills/attack' ){
          if( this.skillAttack < 0 ){
            this.beginAttack = skl.experience
          }
          this.skillAttack = skl.experience
        }
        if( skl.skillHrid == '/skills/defense' ){
          if( this.skillDefense < 0 ){
            this.beginDefense = skl.experience
          }
          this.skillDefense = skl.experience
        }
        if( skl.skillHrid == '/skills/power' ){
          if( this.skillPower < 0 ){
            this.beginPower = skl.experience
          }
          this.skillPower = skl.experience
        }
        if( skl.skillHrid == '/skills/stamina' ){
          if( this.skillStamina < 0 ){
            this.beginStamina = skl.experience
          }
          this.skillStamina = skl.experience
        }
        if( skl.skillHrid == '/skills/intelligence' ){
          if( this.skillIntelligence < 0 ){
            this.beginIntelligence = skl.experience
          }
          this.skillIntelligence = skl.experience
        }
      }
    }
    if( msg.type == 'action_completed' ){
      let endItems = msg.endCharacterItems;
      this.updateItems(this, endItems);
    }
    if( msg.type == 'items_updated' ){
      for( let item of msg.endCharacterItems ){
        for( let base of this.characterItems ){
          if( base.itemHrid == item.itemHrid ){
            if( item.itemHrid in this.combatDrops ){
              base.count = item.count - this.combatDrops[item.itemHrid].count;
            } else {
              base.count = item.count;
            }
          }
        }
      }
    }
  }
  updateItems(self, endItems){
    for( let item of self.characterItems ){
      for( let deltaItem of endItems ){
        if( item.itemHrid == deltaItem.itemHrid && deltaItem.itemLocationHrid == "/item_locations/inventory"){
          if( item.itemHrid in self.combatDrops ){
            self.combatDrops[item.itemHrid].count = deltaItem.count - item.count;
          } else {
            self.combatDrops[item.itemHrid] = {"count": deltaItem.count - item.count};
          }
        }
      }
    }
  }
  buildItemTable(self, items){
    let innerHTML = `<table class="chikenz_combatlog_stats">`
    for( const [key, value] of Object.entries(items) ){
      innerHTML += `<tr><td><img src=assets/images${key}.svg height="20px"/></td><td>${value.count}</td></tr>`
    }
    innerHTML += `</table>`

    innerHTML = `<div class="chikenz_drop_box">`
    let keyArray = Object.keys(items).sort((a,b)=>self.rarity[b]-self.rarity[a]);
    for( let key of keyArray ){
      let value = items[key];
      let itemclass = "chikenz_drop_item";
      if( self.rarity[key] <= 0.045 ){ itemclass += " chikenz_rare"; }
      innerHTML += `<div class="${itemclass}" style="position:relative;" height="50px"><img src=assets/images${key}.svg class="chikenz_drop_img"><div class="chikenz_drop_text">${this.numberDisplay(value.count)}</div></div>`
    }
    innerHTML += `</div>`
    return innerHTML
  }

  numberDisplay(num) {
    let snum = ""
    if( num > 1e6 ){
      snum = `${(num/1e6).toFixed(2)}M`
    }
    else if( num > 1e5 ){
      snum = `${(num/1e3).toFixed(0)}K`
    }
    else {
      snum = `${numberWithCommas(num)}`
    }
    return snum
  }

  buildRarityDictionary(){
    let monsters = window.init_client_info.combatMonsterDetailMap;
    let rarity = {};
    for(const [monName, mon] of Object.entries(monsters)){
      let dropTable = mon.dropTable;
      for( let drop of dropTable ){
        let name = drop.itemHrid;
        let rate = drop.dropRate;
        if( name in rarity ){
          if( rate > rarity[name] ){ rarity[name] = rate; }
        } else {
          rarity[name] = rate;
        }
      }
    }
    return rarity;
  }
}

function numberWithCommas(x) {
  x = parseInt(x);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timeFormat(time){
  time = Math.floor(time);
  let hours = Math.floor(time/3600);
  let minutes = Math.floor((time-(hours*3600))/60);
  let seconds = time - (hours*3600) - (minutes*60);
  if( hours < 10 ){hours = `0${hours}`;}
  if( minutes < 10 ){minutes = `0${minutes}`;}
  if( seconds < 10 ){seconds = `0${seconds}`;}
  if( time/3600 >= 1 ){
    return `${hours}:${minutes}:${seconds}`;
  } else {
    return `${minutes}:${seconds}`;
  }
}

function timeFormatFull(time){
  time = Math.floor(time);
  let days = Math.floor(time/86400);
  let rTime = time - days*86400;
  let hours = Math.floor(rTime/3600);
  rTime -= hours*3600;
  let minutes = Math.floor(rTime/60);
  rTime -= minutes*60;
  let seconds = Math.floor(rTime)
  let rString = ""
  if( days > 0 ){rString += `${days}d `;}
  if( hours > 0 || days > 0 ){rString += `${hours}h `;}
  if( minutes > 0 || hours > 0 || days > 0 ){rString += `${minutes}m `;}
  rString += `${seconds}s`;
  return rString;
}

function dnum(num, p) {
    let snum = ""
    if( num > 1000000 ){
        snum = `${(num/1e6).toFixed(p)} M`
    }
    else if( num > 1000 ){
        snum = `${(num/1e3).toFixed(p)} k`
    }
    else{
        snum = `${(num).toFixed(p)}`
    }
    return snum
}

function appendCSS(css){
  let style = document.createElement('style');
  if(style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  document.head.append(style);
}
// Retrieve json objects: https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-an-url/2499647#2499647
const getJSON = async url => {
  try {
    const response = await fetch(url);
    if(!response.ok)
      throw new Error(response.statusText);
    const data = await response.json();
    return data;
  } catch(error) {
    return error;
  }
}


(function(){
  let note = new notify();
  let fite = new combatlog();
}())
