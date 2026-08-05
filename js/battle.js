window.BattleSystem = class BattleSystem {
  constructor(config, containerEl, onBattleEnd) {
    this.config = config;
    this.container = containerEl;
    this.onBattleEnd = onBattleEnd;
    this.grid = [];
    this.playerUnits = JSON.parse(JSON.stringify(config.playerUnits || []));
    this.enemyUnits = JSON.parse(JSON.stringify(config.enemyUnits || []));
    this.currentTurn = 1;
    this.phase = 'player'; 
    this.selectedUnit = null;
    this.state = 'IDLE';
    this.actedUnits = new Set();
  }

  init() {
    this.container.innerHTML = '';
    this.grid = [];
    const gridSize = this.config.gridSize || 7;
    for (let y = 0; y < gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const terrain = (this.config.terrain && this.config.terrain[y] && this.config.terrain[y][x]) ? this.config.terrain[y][x] : 0;
        
        let terrainClass = 'terrain-plain';
        if (terrain === 1) terrainClass = 'terrain-wall';
        else if (terrain === 2) terrainClass = 'terrain-river';
        else if (terrain === 3) terrainClass = 'terrain-forest';
        else if (terrain === 4) terrainClass = 'terrain-camp';
        
        cell.classList.add(terrainClass);
        cell.dataset.x = x;
        cell.dataset.y = y;
        
        cell.addEventListener('click', () => this.onCellClick(x, y));
        
        this.container.appendChild(cell);
        this.grid[y][x] = { element: cell, terrain };
      }
    }
    
    this.renderUnits();
    this.updateBattleHeader();
  }

  getUnitAt(x, y) {
    return this.playerUnits.find(u => u.x === x && u.y === y) || 
           this.enemyUnits.find(u => u.x === x && u.y === y);
  }

  renderUnits() {
    // Remove existing unit elements
    document.querySelectorAll('.battle-unit').forEach(el => el.remove());
    
    [...this.playerUnits, ...this.enemyUnits].forEach(unit => {
      if (unit.hp <= 0) return;
      const isPlayer = this.playerUnits.includes(unit);
      
      const unitEl = document.createElement('div');
      unitEl.className = `battle-unit ${isPlayer ? 'player-unit' : 'enemy-unit'}`;
      if (this.actedUnits.has(unit.id)) {
        unitEl.classList.add('acted');
      }
      
      unitEl.textContent = unit.name.charAt(0);
      
      const hpBar = document.createElement('div');
      hpBar.className = 'unit-hp-bar';
      const hpFill = document.createElement('div');
      hpFill.className = 'unit-hp-fill';
      const hpPercent = (unit.hp / unit.maxHp) * 100;
      hpFill.style.width = `${Math.max(0, hpPercent)}%`;
      if (hpPercent <= 30) hpFill.classList.add('critical');
      else if (hpPercent <= 60) hpFill.classList.add('low');
      
      hpBar.appendChild(hpFill);
      unitEl.appendChild(hpBar);
      
      unit.element = unitEl;
      
      const cell = this.grid[unit.y][unit.x].element;
      cell.appendChild(unitEl);
    });
  }

  updateBattleHeader() {
    const turnCounter = document.getElementById('turn-counter');
    const phaseEl = document.getElementById('battle-phase');
    if (turnCounter) turnCounter.textContent = `第 ${this.currentTurn} / ${this.config.maxTurns} 回合`;
    if (phaseEl) phaseEl.textContent = this.phase === 'player' ? '我方回合' : '敌方回合';
  }

  onCellClick(x, y) {
    if (this.phase !== 'player') return;
    
    const clickedUnit = this.getUnitAt(x, y);
    
    if (this.state === 'IDLE' || this.state === 'PLAYER_SELECT_UNIT') {
      if (clickedUnit && this.playerUnits.includes(clickedUnit) && !this.actedUnits.has(clickedUnit.id)) {
        this.selectUnit(clickedUnit);
      }
    } else if (this.state === 'UNIT_SELECTED') {
      const cellEl = this.grid[y][x].element;
      
      if (cellEl.classList.contains('highlight-move') && !clickedUnit) {
        this.moveUnitVisual(this.selectedUnit, x, y);
      } else if (cellEl.classList.contains('highlight-attack') && clickedUnit && this.enemyUnits.includes(clickedUnit)) {
        this.executeAttack(this.selectedUnit, clickedUnit);
      } else {
        this.deselectUnit();
        if (clickedUnit && this.playerUnits.includes(clickedUnit) && !this.actedUnits.has(clickedUnit.id)) {
          this.selectUnit(clickedUnit);
        }
      }
    } else if (this.state === 'UNIT_MOVED') {
      const cellEl = this.grid[y][x].element;
      if (cellEl.classList.contains('highlight-attack') && clickedUnit && this.enemyUnits.includes(clickedUnit)) {
        this.executeAttack(this.selectedUnit, clickedUnit);
      } else {
        this.unitWait(this.selectedUnit);
      }
    }
  }

  selectUnit(unit) {
    this.selectedUnit = unit;
    this.state = 'UNIT_SELECTED';
    if (window.game && window.game.ui) {
      window.game.ui.updateBattleInfo(unit);
    }
    
    this.clearHighlights();
    this.grid[unit.y][unit.x].element.classList.add('highlight-selected');
    
    const moveRange = this.getMovementRange(unit);
    moveRange.forEach(pos => {
      this.grid[pos.y][pos.x].element.classList.add('highlight-move');
    });
    
    const attackRange = this.getAttackRange(unit, unit.x, unit.y);
    attackRange.forEach(pos => {
      if (this.getUnitAt(pos.x, pos.y)) {
        this.grid[pos.y][pos.x].element.classList.add('highlight-attack');
      }
    });
  }

  deselectUnit() {
    this.selectedUnit = null;
    this.state = 'IDLE';
    this.clearHighlights();
  }

  moveUnitVisual(unit, newX, newY) {
    const oldCell = this.grid[unit.y][unit.x].element;
    const newCell = this.grid[newY][newX].element;
    
    oldCell.removeChild(unit.element);
    newCell.appendChild(unit.element);
    
    unit.x = newX;
    unit.y = newY;
    
    this.clearHighlights();
    this.grid[unit.y][unit.x].element.classList.add('highlight-selected');
    
    this.state = 'UNIT_MOVED';
    
    // Highlight attackable enemies from new position
    const attackRange = this.getAttackRange(unit, unit.x, unit.y);
    let canAttack = false;
    attackRange.forEach(pos => {
      const target = this.getUnitAt(pos.x, pos.y);
      if (target && this.enemyUnits.includes(target)) {
        this.grid[pos.y][pos.x].element.classList.add('highlight-attack');
        canAttack = true;
      }
    });
    
    if (!canAttack) {
      this.unitWait(unit);
    }
  }

  executeAttack(attacker, defender) {
    this.attack(attacker, defender);
    this.unitWait(attacker);
  }

  unitWait(unit) {
    this.actedUnits.add(unit.id);
    if (unit.element) unit.element.classList.add('acted');
    this.deselectUnit();
    this.checkWinLose();
    
    // Check if all player units acted
    const activePlayers = this.playerUnits.filter(u => u.hp > 0);
    if (activePlayers.every(u => this.actedUnits.has(u.id))) {
      setTimeout(() => this.startEnemyTurn(), 500);
    }
  }

  getMovementRange(unit) {
    const range = [];
    const visited = new Set();
    const queue = [{ x: unit.x, y: unit.y, dist: 0 }];
    const gridSize = this.config.gridSize || 7;
    
    visited.add(`${unit.x},${unit.y}`);
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.x !== unit.x || current.y !== unit.y) {
        range.push({ x: current.x, y: current.y });
      }
      
      if (current.dist >= unit.mov) continue;
      
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const n of neighbors) {
        if (n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize) {
          const key = `${n.x},${n.y}`;
          if (!visited.has(key)) {
            const cellTerrain = this.grid[n.y][n.x].terrain;
            // 2 = river (impassable)
            if (cellTerrain === 2) {
              continue;
            }
            // Can't move through other units
            if (this.getUnitAt(n.x, n.y)) {
               continue;
            }
            
            visited.add(key);
            queue.push({ x: n.x, y: n.y, dist: current.dist + 1 });
          }
        }
      }
    }
    
    return range;
  }

  getAttackRange(unit, fromX, fromY) {
    const range = [];
    const gridSize = this.config.gridSize || 7;
    
    if (unit.type === 'archer') {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const dist = Math.abs(x - fromX) + Math.abs(y - fromY);
          if (dist > 0 && dist <= 2) {
            range.push({ x, y });
          }
        }
      }
    } else {
      // Melee (distance 1)
      const neighbors = [
        { x: fromX + 1, y: fromY },
        { x: fromX - 1, y: fromY },
        { x: fromX, y: fromY + 1 },
        { x: fromX, y: fromY - 1 }
      ];
      
      neighbors.forEach(n => {
        if (n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize) {
          range.push(n);
        }
      });
    }
    return range;
  }

  attack(attacker, defender) {
    let typeMultiplier = 1.0;
    if (attacker.type === 'cavalry' && defender.type === 'archer') typeMultiplier = 1.5;
    if (attacker.type === 'archer' && defender.type === 'infantry') typeMultiplier = 1.5;
    if (attacker.type === 'infantry' && defender.type === 'cavalry') typeMultiplier = 1.5;
    if (attacker.type === 'cavalry' && defender.type === 'infantry') typeMultiplier = 0.8;
    
    const terrain = this.grid[defender.y][defender.x].terrain;
    let defBonus = 0;
    if (terrain === 3) defBonus = 3; // forest
    if (terrain === 1) defBonus = 5; // wall
    
    const dmg = Math.max(1, Math.floor(attacker.atk * typeMultiplier - (defender.def + defBonus) / 2) + Math.floor(Math.random() * 6));
    defender.hp -= dmg;
    
    this.showDamagePopup(defender, dmg);
    this.addLogEntry(`${attacker.name} 攻击 ${defender.name}，造成 ${dmg} 点伤害！`, 'attack-log');
    
    this.updateUnitDisplay(defender);
    
    if (defender.hp <= 0) {
      this.addLogEntry(`${defender.name} 被击败！`, 'defeat-log');
      if (defender.element && defender.element.parentNode) {
        defender.element.parentNode.removeChild(defender.element);
      }
    }
  }

  showDamagePopup(unit, damage) {
    const cell = this.grid[unit.y][unit.x].element;
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = `-${damage}`;
    
    const rect = cell.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 1000);
  }

  updateUnitDisplay(unit) {
    if (!unit.element) return;
    const hpFill = unit.element.querySelector('.unit-hp-fill');
    if (hpFill) {
      const hpPercent = (unit.hp / unit.maxHp) * 100;
      hpFill.style.width = `${Math.max(0, hpPercent)}%`;
      hpFill.className = 'unit-hp-fill';
      if (hpPercent <= 30) hpFill.classList.add('critical');
      else if (hpPercent <= 60) hpFill.classList.add('low');
    }
  }

  addLogEntry(text, className) {
    if (window.game && window.game.ui) {
      window.game.ui.addBattleLog(text, className);
    }
  }

  clearHighlights() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        cell.element.classList.remove('highlight-move', 'highlight-attack', 'highlight-selected');
      });
    });
  }

  startEnemyTurn() {
    this.phase = 'enemy';
    this.state = 'ENEMY_TURN';
    this.updateBattleHeader();
    this.actedUnits.clear();
    
    // Remove acted class from player units
    this.playerUnits.forEach(u => {
      if (u.element) u.element.classList.remove('acted');
    });

    const activeEnemies = this.enemyUnits.filter(u => u.hp > 0);
    
    let delay = 500;
    activeEnemies.forEach((enemy, idx) => {
      setTimeout(() => {
        if (enemy.hp <= 0) return;
        this.processEnemyAction(enemy);
        if (idx === activeEnemies.length - 1) {
          setTimeout(() => this.endEnemyTurn(), 1000);
        }
      }, delay);
      delay += 1000; // 1 second per enemy action
    });
    
    if (activeEnemies.length === 0) {
      this.endEnemyTurn();
    }
  }

  processEnemyAction(enemy) {
    const activePlayers = this.playerUnits.filter(u => u.hp > 0);
    if (activePlayers.length === 0) return;
    
    // Find nearest player
    let nearest = null;
    let minDist = Infinity;
    
    activePlayers.forEach(p => {
      const dist = Math.abs(p.x - enemy.x) + Math.abs(p.y - enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });
    
    if (!nearest) return;
    
    // Check if can attack directly from current position
    const attackRange = this.getAttackRange(enemy, enemy.x, enemy.y);
    const canAttackNow = attackRange.find(pos => {
      const unit = this.getUnitAt(pos.x, pos.y);
      return unit && this.playerUnits.includes(unit);
    });
    
    if (canAttackNow) {
      const target = this.getUnitAt(canAttackNow.x, canAttackNow.y);
      this.attack(enemy, target);
    } else {
      // Move closer
      const moveRange = this.getMovementRange(enemy);
      let bestMove = null;
      let bestDist = minDist;
      
      moveRange.forEach(pos => {
        const d = Math.abs(pos.x - nearest.x) + Math.abs(pos.y - nearest.y);
        const randOffset = Math.random() * 0.5;
        if (d + randOffset < bestDist) {
          bestDist = d + randOffset;
          bestMove = pos;
        }
      });
      
      if (bestMove) {
        // Move enemy unit directly (no state machine involvement)
        const oldCell = this.grid[enemy.y][enemy.x].element;
        const newCell = this.grid[bestMove.y][bestMove.x].element;
        if (enemy.element && enemy.element.parentNode) {
          oldCell.removeChild(enemy.element);
        }
        newCell.appendChild(enemy.element);
        enemy.x = bestMove.x;
        enemy.y = bestMove.y;
        
        // Try to attack after moving
        const newAttackRange = this.getAttackRange(enemy, enemy.x, enemy.y);
        const targetAfterMove = newAttackRange.find(pos => {
          const unit = this.getUnitAt(pos.x, pos.y);
          return unit && this.playerUnits.includes(unit);
        });
        if (targetAfterMove) {
          const target = this.getUnitAt(targetAfterMove.x, targetAfterMove.y);
          if (target) this.attack(enemy, target);
        }
      }
    }
    
    this.checkWinLose();
  }

  endEnemyTurn() {
    this.currentTurn++;
    this.phase = 'player';
    this.state = 'IDLE';
    this.updateBattleHeader();
    this.actedUnits.clear();
    
    this.enemyUnits.forEach(u => {
      if (u.element) u.element.classList.remove('acted');
    });
    
    this.checkWinLose();
  }

  checkWinLose() {
    // Win Condition
    let won = false;
    const winCond = this.config.winCondition;
    if (winCond && winCond.type === 'defeat_target') {
      const target = this.enemyUnits.find(u => u.id === winCond.targetId);
      if (!target || target.hp <= 0) won = true;
    } else {
      // Default win: all enemies defeated
      if (this.enemyUnits.filter(u => u.hp > 0).length === 0) won = true;
    }
    
    // Lose Condition
    let lost = false;
    const loseCond = this.config.loseCondition;
    if (loseCond && loseCond.type === 'target_defeated') {
      const target = this.playerUnits.find(u => u.id === loseCond.targetId);
      if (!target || target.hp <= 0) lost = true;
    } else {
      // Default lose: all player units defeated
      if (this.playerUnits.filter(u => u.hp > 0).length === 0) lost = true;
    }
    
    if (this.currentTurn > this.config.maxTurns) {
      lost = true;
    }
    
    if (won) {
      this.state = 'ENDED';
      setTimeout(() => this.onBattleEnd('win'), 1500);
    } else if (lost) {
      this.state = 'ENDED';
      setTimeout(() => this.onBattleEnd('lose'), 1500);
    }
  }
}
