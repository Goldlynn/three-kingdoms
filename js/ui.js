window.UIManager = class UIManager {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
    this.isTyping = false;
    this.typewriterInterval = null;
    this.currentParagraphs = [];
    this.currentParagraphIndex = 0;
    this.onTextComplete = null;
    this.onChoiceSelected = null;
    this.particles = [];
  }

  init() {
    this.screens = {
      title: document.getElementById('title-screen'),
      story: document.getElementById('story-screen'),
      battle: document.getElementById('battle-screen'),
      ending: document.getElementById('ending-screen')
    };

    this.initParticles();
    
    // Click listeners for text advancement
    const advanceClick = () => this.advanceText();
    const nb = document.getElementById('narrative-text');
    const db = document.getElementById('dialogue-box');
    const bnext = document.getElementById('btn-next');
    
    if(nb) nb.addEventListener('click', advanceClick);
    if(db) db.addEventListener('click', advanceClick);
    if(bnext) bnext.addEventListener('click', advanceClick);
    
    const storyScreen = document.getElementById('story-screen');
    if (storyScreen) {
      storyScreen.addEventListener('click', (e) => {
        const cp = document.getElementById('choices-panel');
        if (cp && cp.classList.contains('hidden') && 
            !e.target.closest('#btn-next') && 
            !e.target.closest('.choice-btn')) {
          this.advanceText();
        }
      });
    }
  }

  showScreen(screenId) {
    if (this.currentScreen) {
      this.screens[this.currentScreen].classList.remove('active');
    }
    this.currentScreen = screenId;
    if (this.screens[screenId]) {
      this.screens[screenId].classList.add('active');
    }
  }

  inkTransition(callback) {
    const overlay = document.getElementById('ink-overlay');
    if (!overlay) { callback(); return; }
    
    overlay.classList.add('active');
    
    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 200);
    }, 1000);
  }

  chapterTransition(title, subtitle, year, callback) {
    const overlay = document.getElementById('chapter-overlay');
    if (!overlay) { callback(); return; }
    
    const titleEl = document.getElementById('chapter-overlay-title');
    const subtitleEl = document.getElementById('chapter-overlay-subtitle');
    const yearEl = document.getElementById('chapter-overlay-year');
    
    if (titleEl) titleEl.textContent = title || '';
    if (subtitleEl) subtitleEl.textContent = subtitle || '';
    if (yearEl) yearEl.textContent = year || '';
    
    overlay.classList.add('active');
    
    setTimeout(() => {
      overlay.classList.remove('active');
      if (callback) setTimeout(callback, 500);
    }, 3000);
  }

  showNarration(paragraphs, character, onComplete) {
    this.currentParagraphs = paragraphs || [];
    this.currentParagraphIndex = 0;
    this.onTextComplete = onComplete;
    this._pendingAdvance = null;
    
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.classList.add('hidden');
      btnNext.onclick = null;
    }
    
    // Setup character portrait
    const charArea = document.getElementById('character-portrait');
    const nameDisplay = document.getElementById('character-name-display');
    const titleDisplay = document.getElementById('character-title-display');
    const portraitChar = document.getElementById('portrait-char');
    
    if (character && character !== 'narrator' && window.CHARACTERS && window.CHARACTERS[character]) {
      const charData = window.CHARACTERS[character];
      const charAreaParent = document.getElementById('character-area');
      if (charAreaParent) charAreaParent.style.display = 'flex';
      if (charArea) {
        charArea.style.display = 'flex';
        charArea.style.setProperty('--character-color', charData.color || '#888');
      }
      if (nameDisplay) nameDisplay.textContent = charData.name;
      if (titleDisplay) titleDisplay.textContent = charData.title || '';
      
      // Avatar image or text fallback
      if (portraitChar) {
        if (charData.avatar) {
          portraitChar.innerHTML = `<img src="${charData.avatar}" alt="${charData.name}" class="portrait-img">`;
        } else {
          portraitChar.textContent = charData.surname || charData.name.charAt(0);
        }
      }
    } else {
      const charAreaParent = document.getElementById('character-area');
      if (charAreaParent) charAreaParent.style.display = 'none';
      if (nameDisplay) nameDisplay.textContent = '';
      if (titleDisplay) titleDisplay.textContent = '';
    }
    
    const textEl = document.getElementById('narrative-text');
    if (textEl) {
      textEl.innerHTML = '';
      this.advanceText(true); // Type first paragraph
    }
  }

  typeText(text, element, speed = 40) {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    
    const p = document.createElement('p');
    element.appendChild(p);
    
    let i = 0;
    this.isTyping = true;
    
    const indicator = document.getElementById('text-indicator');
    if (indicator) indicator.style.display = 'none';
    
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '▌';
    p.appendChild(cursor);
    
    this.typewriterInterval = setInterval(() => {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text.charAt(i));
        i++;
      } else {
        clearInterval(this.typewriterInterval);
        this.isTyping = false;
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        if (indicator) indicator.style.display = 'block';
      }
    }, speed);
    
    // Store remaining text to allow skip
    p.dataset.fullText = text;
  }

  advanceText(isFirst = false) {
    const textEl = document.getElementById('narrative-text');
    if (!textEl) return;
    
    if (this.isTyping) {
      // Skip typing
      clearInterval(this.typewriterInterval);
      this.isTyping = false;
      
      const p = textEl.lastElementChild;
      if (p) {
        const cursor = p.querySelector('.typing-cursor');
        if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
        p.textContent = p.dataset.fullText || p.textContent;
      }
      
      const indicator = document.getElementById('text-indicator');
      if (indicator) indicator.style.display = 'block';
      
    } else if (this.currentParagraphIndex < this.currentParagraphs.length) {
      const text = this.currentParagraphs[this.currentParagraphIndex];
      this.currentParagraphIndex++;
      this.typeText(text, textEl, 40);
    } else {
      // All paragraphs done
      const indicator = document.getElementById('text-indicator');
      if (indicator) indicator.style.display = 'none';
      
      if (!isFirst && this.onTextComplete) {
        const cb = this.onTextComplete;
        this.onTextComplete = null; // prevent re-triggering
        const btnNext = document.getElementById('btn-next');
        if (btnNext) {
          btnNext.classList.remove('hidden');
        }
        cb();
      } else if (this._pendingAdvance) {
        // Click-anywhere to advance after text is complete
        const advance = this._pendingAdvance;
        this._pendingAdvance = null;
        advance();
      }
    }
  }

  showChoices(choices, resources, flags, callback) {
    const panel = document.getElementById('choices-panel');
    if (!panel) return;
    
    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.style.display = 'none';
    
    panel.innerHTML = '';
    panel.classList.remove('hidden');
    
    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.animationDelay = `${idx * 0.1}s`;
      
      let enabled = true;
      if (choice.condition) {
        if (choice.condition.resource) {
          const val = resources[choice.condition.resource] || 0;
          if (val < choice.condition.min) enabled = false;
        }
        if (choice.condition.flag && !flags[choice.condition.flag]) {
          enabled = false;
        }
      }
      
      if (!enabled) {
        btn.classList.add('disabled');
      }
      
      btn.innerHTML = `
        ${choice.text}
        ${choice.description ? `<span class="choice-cost">${choice.description}</span>` : ''}
      `;
      
      btn.addEventListener('click', () => {
        if (!enabled) return;
        btn.classList.add('stamped');
        setTimeout(() => {
          this.hideChoices();
          callback(idx);
        }, 400);
      });
      
      panel.appendChild(btn);
    });
  }

  hideChoices() {
    const panel = document.getElementById('choices-panel');
    if (panel) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
    }
  }

  updateResources(resources, prevResources = {}) {
    ['military', 'morale', 'brotherhood', 'strategy'].forEach(key => {
      const el = document.querySelector(`[data-resource='${key}']`);
      if (!el) return;
      
      const newVal = resources[key] || 0;
      const oldVal = prevResources[key] || newVal;
      el.textContent = newVal;
      
      if (newVal !== oldVal) {
        const delta = newVal - oldVal;
        const resItem = el.closest('.resource-item');
        if (resItem) {
          resItem.classList.remove('increased', 'decreased');
          // trigger reflow
          void resItem.offsetWidth;
          resItem.classList.add(delta > 0 ? 'increased' : 'decreased');
          setTimeout(() => resItem.classList.remove('increased', 'decreased'), 1000);
          
          const float = document.createElement('div');
          float.className = `resource-change-float ${delta > 0 ? 'pos' : 'neg'}`;
          float.textContent = delta > 0 ? `+${delta}` : delta;
          resItem.appendChild(float);
          setTimeout(() => { if (float.parentNode) float.parentNode.removeChild(float); }, 1000);
        }
      }
    });
  }

  showNotification(text, duration = 3000) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    
    notif.textContent = text;
    notif.classList.remove('hidden');
    
    setTimeout(() => {
      notif.classList.add('hidden');
    }, duration);
  }

  shakeScreen() {
    const container = document.getElementById('game-container') || document.body;
    container.classList.add('shake');
    setTimeout(() => {
      container.classList.remove('shake');
    }, 500);
  }

  showBattleIntro(title, description, callback) {
    // In a real app this might be a fancy overlay, for now we can just show a notification and wait
    this.showNotification(`Battle: ${title} - ${description}`, 2000);
    setTimeout(callback, 2000);
  }

  updateBattleInfo(unit) {
    const info = document.getElementById('unit-info');
    if (!info) return;
    
    if (!unit) {
      info.innerHTML = '';
      return;
    }
    
    info.innerHTML = `
      <div class="unit-info-header">
        <strong>${unit.name}</strong> <span class="unit-type-badge ${unit.type}">${unit.type}</span>
      </div>
      <div class="unit-stat">HP: ${unit.hp} / ${unit.maxHp}</div>
      <div class="unit-stat">ATK: ${unit.atk}</div>
      <div class="unit-stat">DEF: ${unit.def}</div>
      <div class="unit-stat">MOV: ${unit.mov}</div>
    `;
  }

  addBattleLog(text, className = '') {
    const log = document.getElementById('battle-log');
    if (!log) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${className}`;
    entry.textContent = text;
    log.appendChild(entry);
    
    log.scrollTop = log.scrollHeight;
  }

  initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 5 + 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      p.style.animationDuration = `${Math.random() * 4 + 4}s`;
      p.style.opacity = Math.random() * 0.5 + 0.1;
      
      container.appendChild(p);
      this.particles.push(p);
    }
  }

  showEndingScreen(endingData, stats) {
    const title = document.getElementById('ending-title');
    const subtitle = document.getElementById('ending-subtitle');
    const textEl = document.getElementById('ending-text');
    const statsEl = document.getElementById('ending-stats');
    
    if (title) title.textContent = endingData.endingTitle || 'Ending';
    if (subtitle) subtitle.textContent = (endingData.endingEmoji || '') + ' ' + (endingData.endingTitle || '');
    if (textEl) {
      textEl.innerHTML = '';
      (endingData.endingText || []).forEach(p => {
        const pEl = document.createElement('p');
        pEl.textContent = p;
        textEl.appendChild(pEl);
      });
    }
    
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="ending-stat">⚔️ 军力: ${stats.military || 0}</div>
        <div class="ending-stat">🏰 民心: ${stats.morale || 0}</div>
        <div class="ending-stat">🤝 义气: ${stats.brotherhood || 0}</div>
        <div class="ending-stat">📜 谋略: ${stats.strategy || 0}</div>
      `;
    }
    
    this.showScreen('ending');
  }

  // =========== Generic Modal ===========
  showModal(title, bodyHTML, onClose) {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
      // Create modal DOM on first call
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-title"></span>
            <button class="modal-close">✕</button>
          </div>
          <div class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close on overlay background click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
      // Close button
      overlay.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    }

    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-body').innerHTML = bodyHTML;
    overlay.classList.add('active');
    this._modalOnClose = onClose || null;
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
    if (this._modalOnClose) {
      this._modalOnClose();
      this._modalOnClose = null;
    }
  }

  showRulesModal() {
    const rulesHTML = `
      <div class="rules-content">
        <h4>📜 游戏简介</h4>
        <p>你是一名穿越到建安二十四年的谋士，目标是阻止白衣渡江、保住荆州、改写历史。</p>

        <h4>🎭 剧情系统</h4>
        <ul>
          <li><b>⚔️ 军力</b> — 影响战斗中我方单位强度</li>
          <li><b>🏰 民心</b> — 影响守城和后方稳定</li>
          <li><b>🤝 义气</b> — 兄弟情义，影响特殊选项</li>
          <li><b>📜 谋略</b> — 消耗以解锁关键调查和替换选项</li>
        </ul>
        <p>你的每次抉择都会消耗/获得资源，并设置剧情标记（flag），影响后续分支和战斗加成。</p>

        <h4>⚔️ 战棋系统</h4>
        <ul>
          <li><b>操作</b>：点击我方单位 → 蓝色高亮为可移动范围 → 点击移动 → 红色高亮为可攻击敌人 → 点击攻击</li>
          <li><b>兵种克制</b>：骑兵 &gt; 弓兵 &gt; 步兵 &gt; 骑兵（1.5倍伤害）</li>
          <li><b>地形</b>：🌊河流不可通行；🌲树林+3防御；🧱城墙+5防御</li>
          <li><b>胜利条件</b>：击败吕蒙</li>
          <li><b>失败条件</b>：关羽阵亡 或 回合耗尽</li>
        </ul>

        <h4>🏁 结局</h4>
        <p>根据你的选择和战斗结果，第一章有两个结局：<br>
        🌟 <b>荆州不失</b> — 改写历史！<br>
        💔 <b>败走麦城</b> — 历史重演…</p>
      </div>
    `;
    this.showModal('规则与帮助', rulesHTML);
  }
}
