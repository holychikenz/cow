// ==UserScript==
// @name         CowNotify
// @version      0.0.1
// @description  Milkyway example script
// @author       Holychikenz
// @match        *://*www.milkywayidle.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

window.cowsocket = undefined;
const nativeWebSocket = window.WebSocket;
window.WebSocket = function(...args){
  const socket = new nativeWebSocket(...args);
  window.cowsocket = socket;
  return socket;
};

class notify {
  constructor() {
    this.begin();
  }
  begin(promise){
    let self = this;
    promise = promise || new Promise( ()=>{} );
    if( typeof window.cowsocket !== 'undefined' ){
      promise.then();
    } else {
      setTimeout(function(){self.begin(promise)}, 1000);
      return false;
    }
    console.log("Adding event listener");
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
    if( typeof window.cowsocket !== 'undefined' ){
      promise.then();
    } else {
      setTimeout(function(){self.begin(promise)}, 1000);
      return false;
    }
    window.cowsocket.addEventListener('message', (e)=>self.run(self, e));
    self.statswindow = document.createElement("div");
    self.statswindow.className = "chikenz_combatlog_stats";
    self.statswindow.style.width = '300px';
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
        panel.append(this.statswindow)
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
  return `${hours}:${minutes}:${seconds}`;
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