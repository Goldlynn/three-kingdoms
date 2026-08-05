window.GameController = class GameController {
  constructor() {
    this.ui = new window.UIManager();
    this.battle = null;
    
    this.state = {
      chapter: 1,
      currentScene: null,
      resources: { military: 100, morale: 80, brotherhood: 100, strategy: 50 },
      flags: {},
      choiceHistory: [],
      currentEnding: null
    };
  }

  init() {
    this.ui.init();
    
    const btnNewGame = document.getElementById('btn-new-game');
    const btnContinue = document.getElementById('btn-continue');
    const btnRestart = document.getElementById('btn-restart');
    
    if (btnNewGame) btnNewGame.addEventListener('click', () => this.newGame());
    if (btnContinue) btnContinue.addEventListener('click', () => this.continueGame());
    if (btnRestart) btnRestart.addEventListener('click', () => this.newGame());
    
    if (localStorage.getItem('threekingdoms_save') && btnContinue) {
      btnContinue.style.display = 'inline-block';
    } else if (btnContinue) {
      btnContinue.style.display = 'none';
    }
    
    this.ui.showScreen('title');
  }

  newGame() {
    this.state = {
      chapter: 1,
      currentScene: null,
      resources: { military: 100, morale: 80, brotherhood: 100, strategy: 50 },
      flags: {},
      choiceHistory: [],
      currentEnding: null
    };
    this.startChapter(1);
  }

  startChapter(chapterNum) {
    this.state.chapter = chapterNum;
    
    const chapterData = window.STORY_DATA && window.STORY_DATA[`chapter${chapterNum}`];
    if (!chapterData) {
      console.error(`Chapter ${chapterNum} not found`);
      return;
    }
    
    this.ui.updateResources(this.state.resources);
    
    this.ui.inkTransition(() => {
      this.ui.showScreen('story');
      
      const cTitle = document.getElementById('chapter-title-display');
      if (cTitle) cTitle.textContent = chapterData.title;
      
      this.ui.chapterTransition(chapterData.title, chapterData.subtitle, chapterData.year, () => {
        this.advanceScene(chapterData.startScene);
      });
    });
  }

  advanceScene(sceneId) {
    if (!sceneId) return;
    
    this.state.currentScene = sceneId;
    this.save();
    
    const chapterData = window.STORY_DATA[`chapter${this.state.chapter}`];
    const scene = chapterData.scenes[sceneId];
    
    if (!scene) {
      console.error(`Scene ${sceneId} not found`);
      this.ui.showNotification(`Error: Scene ${sceneId} missing`);
      return;
    }
    
    if (this.ui.currentScreen !== 'story' && scene.type !== 'battle' && scene.type !== 'ending') {
      this.ui.showScreen('story');
    }
    
    switch (scene.type) {
      case 'narration':
      case 'dialogue':
        this.ui.showNarration(scene.paragraphs, scene.character, () => {
          // On complete, allow clicking anywhere (including btn-next) to advance
          this.ui._pendingAdvance = () => {
            const btn = document.getElementById('btn-next');
            if (btn) btn.classList.add('hidden');
            this.advanceScene(scene.next);
          };
        });
        break;
        
      case 'choice':
        this.ui.showNarration(scene.paragraphs, scene.character, () => {
          this.ui.showChoices(scene.choices, this.state.resources, this.state.flags, (choiceIndex) => {
            this.processChoice(scene, choiceIndex);
          });
        });
        break;
        
      case 'battle':
        this.ui.showNotification(scene.intro || '战斗开始！', 2000);
        setTimeout(() => {
          this.startBattle(scene.battleId, scene.winNext, scene.loseNext);
        }, 2000);
        break;
        
      case 'transition':
        this.ui.chapterTransition(scene.transitionTitle, scene.transitionSubtitle, '', () => {
          this.advanceScene(scene.next);
        });
        break;
        
      case 'ending':
        if (scene.setFlags) {
          Object.assign(this.state.flags, scene.setFlags);
        }
        this.ui.inkTransition(() => {
          this.ui.showEndingScreen(scene, this.state.resources);
        });
        break;
    }
  }

  processChoice(scene, choiceIndex) {
    const choice = scene.choices[choiceIndex];
    if (!choice) return;
    
    this.state.choiceHistory.push(choice.text);
    
    const prevResources = { ...this.state.resources };
    
    if (choice.effects) {
      for (const [res, delta] of Object.entries(choice.effects)) {
        if (this.state.resources[res] !== undefined) {
          this.state.resources[res] = Math.max(0, Math.min(100, this.state.resources[res] + delta));
        }
      }
    }
    
    if (choice.setFlags) {
      Object.assign(this.state.flags, choice.setFlags);
    }
    
    this.ui.updateResources(this.state.resources, prevResources);
    
    this.ui.inkTransition(() => {
      this.advanceScene(choice.next);
    });
  }

  startBattle(battleId, winNext, loseNext) {
    const configData = window.BATTLE_CONFIGS && window.BATTLE_CONFIGS[battleId];
    if (!configData) {
      console.error(`Battle config ${battleId} not found`);
      return;
    }
    
    // Deep copy config to apply modifiers safely
    const config = JSON.parse(JSON.stringify(configData));
    
    // Apply flag modifiers
    if (this.state.flags.fortified) {
      config.playerUnits.forEach(u => u.def += 3);
    }
    if (this.state.flags.investigated) {
      config.playerUnits.push({id:'bonus_archer', name:'斥候', type:'archer', hp:60, maxHp:60, atk:15, def:8, mov:2, x:0, y:6});
    }
    if (this.state.flags.garrison_replaced) {
      config.playerUnits.push({id:'loyal_guard', name:'忠卫', type:'infantry', hp:80, maxHp:80, atk:12, def:16, mov:2, x:2, y:6});
    }
    if (this.state.flags.ambushed_enemy) {
      config.enemyUnits.forEach(u => {
        u.hp = Math.floor(u.hp * 0.8);
      });
    }
    
    this.ui.inkTransition(() => {
      this.ui.showScreen('battle');
      
      const bTitle = document.getElementById('battle-title');
      if (bTitle) bTitle.textContent = config.name || 'Battle';
      
      const bLog = document.getElementById('battle-log');
      if (bLog) bLog.innerHTML = '';
      
      const grid = document.getElementById('battle-grid');
      
      this.battle = new window.BattleSystem(config, grid, (result) => {
        this.onBattleComplete(result, winNext, loseNext);
      });
      
      this.battle.init();
      this.ui.addBattleLog(`战斗开始: ${config.name}`);
      
      // Wire up battle action buttons
      const btnEndTurn = document.getElementById('btn-end-turn');
      const btnAttack = document.getElementById('btn-attack');
      const btnWait = document.getElementById('btn-wait');
      if (btnEndTurn) {
        btnEndTurn.onclick = () => {
          if (this.battle && this.battle.phase === 'player') {
            this.battle.actedUnits.clear();
            this.battle.playerUnits.filter(u => u.hp > 0).forEach(u => this.battle.actedUnits.add(u.id));
            this.battle.deselectUnit();
            this.battle.startEnemyTurn();
          }
        };
      }
      if (btnWait) {
        btnWait.onclick = () => {
          if (this.battle && this.battle.selectedUnit && this.battle.state === 'UNIT_MOVED') {
            this.battle.unitWait(this.battle.selectedUnit);
          }
        };
      }
      if (btnAttack) {
        btnAttack.onclick = () => {
          // Attack is handled by cell click; this button is just a visual indicator
        };
      }
    });
  }

  onBattleComplete(result, winNext, loseNext) {
    this.ui.addBattleLog(result === 'win' ? '我军大捷！' : '我军败北…', result === 'win' ? 'win-log' : 'lose-log');
    
    setTimeout(() => {
      this.ui.inkTransition(() => {
        this.battle = null;
        this.advanceScene(result === 'win' ? winNext : loseNext);
      });
    }, 2000);
  }

  save() {
    try {
      localStorage.setItem('threekingdoms_save', JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save game state", e);
    }
  }

  load() {
    try {
      const data = localStorage.getItem('threekingdoms_save');
      if (data) {
        this.state = JSON.parse(data);
        return true;
      }
    } catch (e) {
      console.warn("Failed to load game state", e);
    }
    return false;
  }

  continueGame() {
    if (this.load()) {
      this.ui.updateResources(this.state.resources);
      const chapterData = window.STORY_DATA[`chapter${this.state.chapter}`];
      
      this.ui.inkTransition(() => {
        this.ui.showScreen('story');
        const cTitle = document.getElementById('chapter-title-display');
        if (cTitle) cTitle.textContent = chapterData ? chapterData.title : `Chapter ${this.state.chapter}`;
        this.advanceScene(this.state.currentScene);
      });
    } else {
      this.newGame();
    }
  }

  checkCondition(condition) {
    if (!condition) return true;
    if (condition.resource) {
      return (this.state.resources[condition.resource] || 0) >= condition.min;
    }
    if (condition.flag) {
      return !!this.state.flags[condition.flag];
    }
    return true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new window.GameController();
  window.game.init();
});
