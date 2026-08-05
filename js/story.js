window.CHARACTERS = {
  guan_yu: { name: '关羽', title: '汉寿亭侯', surname: '关', color: '#c62828', avatar: 'assets/avatars/guanyu.jpg' },
  zhang_fei: { name: '张飞', title: '车骑将军', surname: '张', color: '#1565c0', avatar: 'assets/avatars/zhangfei.jpg' },
  liu_bei: { name: '刘备', title: '汉中王', surname: '刘', color: '#f9a825', avatar: 'assets/avatars/liubei.jpg' },
  zhuge_liang: { name: '诸葛亮', title: '军师中郎将', surname: '亮', color: '#2e7d32', avatar: 'assets/avatars/zhugeliang.jpg' },
  lu_meng: { name: '吕蒙', title: '东吴大都督', surname: '吕', color: '#6a1b9a', avatar: 'assets/avatars/lvmeng.jpg' },
  lu_xun: { name: '陆逊', title: '东吴书生', surname: '陆', color: '#00838f', avatar: 'assets/avatars/luxun.jpg' },
  mi_fang: { name: '糜芳', title: '南郡太守', surname: '糜', color: '#795548', avatar: '' },
  fu_shiren: { name: '傅士仁', title: '公安守将', surname: '傅', color: '#546e7a', avatar: '' },
  zhou_cang: { name: '周仓', title: '关羽部将', surname: '周', color: '#4e342e', avatar: '' },
  player: { name: '谋士', title: '穿越谋士', surname: '谋', color: '#c9a24e', avatar: 'assets/avatars/moushi.jpg' },
  narrator: { name: '', title: '', surname: '', color: '#c9a24e', avatar: '' }
};

window.STORY_DATA = {
  chapter1: {
    id: 'chapter1',
    title: '第一章',
    subtitle: '白衣渡江',
    year: '建安二十四年 · 秋',
    startScene: 'c1_intro',
    scenes: {
      c1_intro: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "建安二十四年秋，关羽水淹七军、擒于禁、斩庞德，威震华夏，曹操几欲迁都以避其锋。此时的荆州军，士气如虹，仿佛一统中原指日可待。",
          "然而，在这如日中天的背后，一场精心策划的阴谋正在荆州的暗影中悄然展开。东吴孙权对荆州垂涎已久，正伺机而动。",
          "作为一名穿越而来的谋士，你深知历史的车轮即将驶向何方——白衣渡江，败走麦城。那将是蜀汉由盛转衰、最令人扼腕叹息的悲痛转折。如今，命运的棋盘已交到你的手中，你是否能逆天改命，挽狂澜于既倒？"
        ],
        next: 'c1_zhuge_letter'
      },
      
      c1_zhuge_letter: {
        type: 'dialogue',
        character: 'zhuge_liang',
        paragraphs: [
          "吾夜观天象，见将星摇摇欲坠于荆楚之上。云长此次北伐虽战果辉煌，然荆州后方空虚，东吴鼠辈必心怀叵测。",
          "云长性情刚烈，素来骄傲，恐难以防备江东暗算。你才智过人，且深明大义，我欲委你重任，替我分担这荆州之忧虑。"
        ],
        next: 'c1_choice_response'
      },

      c1_choice_response: {
        type: 'choice',
        character: 'player',
        paragraphs: ["面对诸葛亮的托付，我该如何抉择？"],
        choices: [
          {
            text: "亲赴荆州，暗中巡察防务",
            description: "(谋略 -5，士气 +5)",
            condition: null,
            effects: { strategy: -5, morale: 5 },
            setFlags: { went_personally: true },
            next: 'c1_arrive_jingzhou'
          },
          {
            text: "修书一封，提醒关将军加强后方",
            description: "(谋略 -5)",
            condition: null,
            effects: { strategy: -5 },
            setFlags: { sent_letter: true },
            next: 'c1_send_letter'
          },
          {
            text: "关将军神勇，东吴不敢轻举妄动",
            description: "(情义 +5)",
            condition: null,
            effects: { brotherhood: 5 },
            setFlags: { trusted_guanyu: true },
            next: 'c1_trust_path'
          }
        ],
        next: null
      },

      c1_arrive_jingzhou: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你星夜兼程，轻车简从赶赴荆州。一路上，但见烽烟北望，南郡守军调动频繁，大多被派往樊城前线支援。",
          "当你踏上江陵的城墙，江风凛冽。你敏锐地察觉到，城防虽有布置，但留守兵力早已捉襟见肘，若东吴大军水陆并进，后果不堪设想。"
        ],
        next: 'c1_guanyu_meeting'
      },

      c1_send_letter: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你在成都伏案挥毫，将对东吴异动的担忧写成密信，由快马加鞭送往荆州前线。",
          "信中言辞恳切，反覆叮嘱关羽莫要贪功冒进，务必留心陆口吕蒙的动向，严防后院起火。"
        ],
        next: 'c1_guanyu_response'
      },

      c1_trust_path: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你深信关云长之威名足以震慑江东鼠辈，便向诸葛亮进言宽心。军师虽抚须不语，却也默认了你的看法。",
          "然而，随着前线不断传来大捷的战报，你心中的隐忧非但没有减轻，反而如荒草般暗自滋生。"
        ],
        next: 'c1_guanyu_confidence'
      },

      c1_guanyu_meeting: {
        type: 'dialogue',
        character: 'guan_yu',
        paragraphs: [
          "军师派你前来，可是忧心荆州防务？哼，江东群鼠，闻吾名皆胆寒，何足道哉！",
          "吾水淹七军，擒于禁，威震天下。那吕蒙小儿若敢来犯，吾必令其有来无回！不过，你既是军师特使，某自当以礼相待。且留此地，看吾如何破曹！"
        ],
        next: 'c1_intelligence'
      },

      c1_guanyu_response: {
        type: 'dialogue',
        character: 'guan_yu',
        paragraphs: [
          "（关羽回信）来信已阅。足下与军师皆多虑矣。江东鼠辈，皆如土鸡瓦犬，某视之若无物。",
          "今樊城指日可下，中原震动。吾当乘胜追击，克复中原，报效汉室。荆州之事，某自有分寸，不劳牵挂。"
        ],
        next: 'c1_intelligence'
      },

      c1_guanyu_confidence: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "前线捷报频传，关羽在军中的威望达到了顶点。他傲视群雄，将更多的后方兵力抽调至樊城前线。",
          "整个荆州沉浸在一片胜利的狂欢中，却无人察觉，江面上的风向，正在悄然发生改变。"
        ],
        next: 'c1_intelligence'
      },

      c1_intelligence: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "不久，江东传来惊人消息：大都督吕蒙突发重病，已被孙权召回建业休养。接替他镇守陆口的，是一个名叫陆逊的年轻书生，名不见经传。",
          "关羽闻讯仰天大笑，更加不把东吴放在眼里，甚至将防备东吴的岗哨撤去了大半。"
        ],
        next: 'c1_luxun_letter'
      },

      c1_luxun_letter: {
        type: 'dialogue',
        character: 'lu_xun',
        paragraphs: [
          "（陆逊致信）仆书生耳，蒙主上谬恩，得此重任。然久仰将军神威，如雷贯耳。",
          "将军擒于禁，斩庞德，威震华夏，诚旷世之奇功也！仆愿结两国之好，唯将军马首是瞻，万望将军垂怜。"
        ],
        next: 'c1_guanyu_reads_letter'
      },

      c1_guanyu_reads_letter: {
        type: 'dialogue',
        character: 'guan_yu',
        paragraphs: [
          "哈哈哈！孙仲谋可谓无人矣，竟派一黄口孺子来守陆口！",
          "此子言辞卑微，毫无骨气。江东既已臣服，吾便可毫无顾忌，倾荆州之兵，直捣许都！"
        ],
        next: 'c1_choice_lumeng'
      },

      c1_choice_lumeng: {
        type: 'choice',
        character: 'player',
        paragraphs: ["此事颇为蹊跷，我必须做出决断："],
        choices: [
          {
            text: "此事蹊跷！吕蒙正值壮年，何以突然病重？派细作暗查",
            description: "(需谋略≥15，消耗谋略 15)",
            condition: { resource: 'strategy', min: 15 },
            effects: { strategy: -15 },
            setFlags: { investigated: true },
            next: 'c1_investigate_result'
          },
          {
            text: "陆逊不过一介书生，东吴无人矣",
            description: "(情义 +5)",
            condition: null,
            effects: { brotherhood: 5 },
            setFlags: null,
            next: 'c1_dismiss_result'
          },
          {
            text: "不管吕蒙是真病假病，加固荆州城防总没有错",
            description: "(兵力 +10，谋略 -5)",
            condition: null,
            effects: { military: 10, strategy: -5 },
            setFlags: { fortified: true },
            next: 'c1_fortify_result'
          }
        ],
        next: null
      },

      c1_investigate_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你散尽千金，派出最精干的细作潜入江东。数日后，一只带血的信鸽飞回，带回了令人胆寒的情报。",
          "吕蒙非但没有卧病在床，反而正秘密与陆逊在浔阳集结水军！那封卑微的信件，不过是骄兵之计！一场天大的阴谋已经张开了一张巨网，正向荆州扑来。"
        ],
        next: 'c1_mifang_scene'
      },

      c1_dismiss_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你顺水推舟，附和了关羽的看法。毕竟陆逊毫无战绩，东吴此时确实显得外强中干。",
          "然而，夜深人静时，望着江面上的孤帆远影，你的内心深处却莫名感到一阵战栗。"
        ],
        next: 'c1_mifang_scene'
      },

      c1_fortify_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你顶着关羽的不悦，强行征调民夫，加固了江陵和公安的城防，并在沿江险要处多设了烽火台。",
          "关羽虽觉你小题大做，但念在军师的面子上，并未过度责难。荆州的城墙厚实了几分，这也成了你心中微弱的慰藉。"
        ],
        next: 'c1_mifang_scene'
      },

      c1_mifang_scene: {
        type: 'dialogue',
        character: 'mi_fang',
        paragraphs: [
          "（压低声音）关公为人傲慢，稍有过失便要军法从事！我等镇守后方，督办粮草，劳苦功高，他竟因一点小差错便扬言回军后定当治罪！",
          "傅将军，你我二人在这荆州，活得连条狗都不如！若是哪天东吴兵临城下，哼……"
        ],
        next: 'c1_choice_garrison'
      },

      c1_choice_garrison: {
        type: 'choice',
        character: 'player',
        paragraphs: ["糜芳与傅士仁心怀怨愤，此乃内乱之源！必须立刻处理："],
        choices: [
          {
            text: "安抚二位将军，恩威并施，化解嫌隙",
            description: "(士气 +10，情义 +5)",
            condition: null,
            effects: { morale: 10, brotherhood: 5 },
            setFlags: { garrison_loyal: true },
            next: 'c1_placate_result'
          },
          {
            text: "军法如山！关将军赏罚分明，你们应当恪尽职守",
            description: "(情义 +10，触发内患)",
            condition: null,
            effects: { brotherhood: 10 },
            setFlags: { garrison_hostile: true },
            next: 'c1_threaten_result'
          },
          {
            text: "暗中安排可靠之人接替二人的防务",
            description: "(需谋略≥20，兵力 +5)",
            condition: { resource: 'strategy', min: 20 },
            effects: { strategy: -20, military: 5 },
            setFlags: { garrison_replaced: true },
            next: 'c1_replace_result'
          }
        ],
        next: null
      },

      c1_placate_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你以大局为重，好言安抚二人，并许诺日后定会在关将军面前为他们美言。又设宴款待，晓以利害。",
          "二人虽面带犹豫，但终究顾忌蜀汉威严，暂时收敛了反叛之心，勉强答应继续死守城池。"
        ],
        next: 'c1_northern_campaign'
      },

      c1_threaten_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你义正辞严地斥责了二人，搬出关将军的军威。糜芳和傅士仁唯唯诺诺地退下。",
          "但在他们转身的瞬间，你分明看到糜芳眼底闪过一丝阴狠与绝望。一粒毁灭的种子，已然深深埋下。"
        ],
        next: 'c1_northern_campaign'
      },

      c1_replace_result: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "你深知此二人不可重用，暗中调动兵符，用忠诚可靠的将领接管了南郡和公安的核心城防。",
          "糜芳与傅士仁虽心有怨言，却被彻底架空了兵权。荆州的内部隐患，被你以雷霆手段暂时压制。"
        ],
        next: 'c1_northern_campaign'
      },

      c1_northern_campaign: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "秋风萧瑟，时光飞逝。关羽在前线水淹七军，威震天下，再次从荆州抽调了最后一批精锐北上。",
          "荆州大本营，彻底成了一座外强中干的空城。江面上的大雾，日复一日地浓烈起来。"
        ],
        next: 'c1_white_robes'
      },

      c1_white_robes: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "建安二十四年冬，一个风雨交加的夜晚。江面上突兀地出现了数十艘商船，缓缓逼近荆州渡口。",
          "电闪雷鸣之间，照亮了船上之人的面容——他们身披蓑衣，内着白衣，手持利刃！这便是历史上最著名的奇袭——吕蒙白衣渡江！烽火台未及点燃，吴军先锋已如幽灵般登岸。"
        ],
        next: 'c1_choice_final'
      },

      c1_choice_final: {
        type: 'choice',
        character: 'player',
        paragraphs: ["生死存亡之际，荆州的命运全系于你一念之间："],
        choices: [
          {
            text: "这是吕蒙的白衣渡江！立即设伏，在渡口截杀！",
            description: "(需提前调查出吕蒙阴谋)",
            condition: { flag: 'investigated' },
            effects: { military: 10 },
            setFlags: { ambushed_enemy: true },
            next: 'c1_ambush_scene'
          },
          {
            text: "紧急飞报关将军回师！荆州危矣！",
            description: "(兵力 -10)",
            condition: null,
            effects: { military: -10 },
            setFlags: { recalled_guanyu: true },
            next: 'c1_recall_scene'
          },
          {
            text: "关闭城门，坚守待援！",
            description: "(进入笼城守卫战)",
            condition: null,
            effects: null,
            setFlags: { defend_city: true },
            next: 'c1_defend_scene'
          },
          {
            text: "为时已晚...糜芳已开城投降",
            description: "(内部生变，防线崩溃)",
            condition: { flag: 'garrison_hostile' },
            effects: null,
            setFlags: null,
            next: 'c1_betrayal'
          }
        ],
        next: null
      },

      c1_ambush_scene: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "因为你早早识破了吕蒙的诈死之计，早已在渡口埋伏下五百精锐弓弩手。当白衣吴军刚刚踏上浅滩，万箭齐发！",
          "惨叫声划破夜空，江水瞬间被染成血红。吕蒙大惊失色，知道奇袭已然破产，但退无可退，只能强行攻城。"
        ],
        next: 'c1_pre_battle'
      },

      c1_recall_scene: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "数匹快马拼死冲出重围，向樊城方向狂奔而去。你声嘶力竭地指挥残兵退入内城。",
          "关将军能否及时赶回？没有人知道。现在的每一刻，都在用将士们的鲜血去拖延。"
        ],
        next: 'c1_pre_battle'
      },

      c1_defend_scene: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "沉重的千斤闸轰然落下，将如潮水般涌来的吴军挡在城外。城墙上，火把连天，箭矢如蝗。",
          "这一夜，将是漫长而惨烈的一夜。你站在城头，望着下方密密麻麻的东吴兵马，拔出了腰间的长剑。"
        ],
        next: 'c1_pre_battle'
      },

      c1_betrayal: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "正当你准备组织抵抗时，南城门方向突然火光冲天！糜芳与傅士仁已然率众反叛，大开城门迎吴军入城！",
          "大势已去！防线瞬间土崩瓦解，无数忠勇的将士在睡梦中被叛军和吴兵屠戮。你绝望地闭上了双眼。"
        ],
        next: 'c1_defeat_betrayal'
      },

      c1_pre_battle: {
        type: 'transition',
        transitionTitle: '荆州保卫战',
        transitionSubtitle: '宁为玉碎，不为瓦全',
        duration: 3000,
        next: 'c1_battle'
      },

      c1_battle: {
        type: 'battle',
        battleId: 'jingzhou_defense',
        intro: "东吴精锐倾巢而出，务必在此挡住吕蒙的攻势！",
        winNext: 'c1_victory',
        loseNext: 'c1_defeat_battle'
      },

      c1_victory: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "天色渐明，城墙下堆满了敌军的尸体。吕蒙见久攻不下，且蜀军大旗依然屹立不倒，恐关羽回师，只得仓皇撤退。",
          "震天的欢呼声在江陵城头上空回荡。你满身鲜血，脱力般跌坐在地。历史的车轮，在这一刻，被你用血肉之躯硬生生地撬偏了轨道！荆州，保住了！"
        ],
        next: 'c1_victory_end'
      },

      c1_defeat_battle: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "城门终究还是被攻破了。潮水般的吴军涌入街道，蜀军将士虽死战不退，终因寡不敌众，全军覆没。",
          "远在樊城的关羽听闻后方失陷，进退失据，军心涣散，最终在突围途中兵败麦城。一代将星，就此陨落。"
        ],
        next: 'c1_defeat_end'
      },

      c1_defeat_betrayal: {
        type: 'narration',
        character: 'narrator',
        paragraphs: [
          "叛徒的倒戈让荆州兵不血刃地落入孙权之手。关公回师无望，家眷被俘，将士毫无斗志，纷纷溃散。",
          "麦城冰冷的冬雪，掩盖了这位武圣最后的踪迹。千古遗恨，终究未能因你的到来而改变。"
        ],
        next: 'c1_defeat_end'
      },

      c1_victory_end: {
        type: 'ending',
        endingId: 'ch1_victory',
        endingTitle: "荆州不失",
        endingEmoji: "🌟",
        endingText: [
          "关羽班师回朝，得知是你力挽狂澜，保全了荆州，不禁长叹：『若非先生深谋远虑，某险些酿下千古大错！』",
          "自此，关羽对你敬若神明。刘备、张飞皆发来贺信，蜀汉在你的守护下，保留了北伐中原的最后希望。新的征程，才刚刚开始。"
        ]
      },

      c1_defeat_end: {
        type: 'ending',
        endingId: 'ch1_defeat',
        endingTitle: "关云长败走麦城",
        endingEmoji: "💔",
        endingText: [
          "建安二十四年冬，关羽、关平父子于临沮遇害。消息传回成都，刘备痛哭晕厥，张飞怒发冲冠。",
          "桃园结义的誓言化为泡影，蜀汉的国运也从此急转直下。你虽然尽力，却未能抗拒历史的洪流……"
        ]
      }
    }
  }
};

window.BATTLE_CONFIGS = {
  jingzhou_defense: {
    name: "荆州保卫战",
    description: "白衣渡江，退无可退。唯有死战，方能破局。",
    gridSize: 7,
    maxTurns: 12,
    terrain: [
      [3, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 0, 2, 2, 0],
      [0, 2, 2, 0, 2, 2, 0],
      [0, 0, 0, 0, 0, 3, 3],
      [1, 1, 0, 0, 0, 1, 1],
      [4, 0, 3, 0, 3, 0, 4]
    ],
    playerUnits: [
      { id: 'guan_yu', name: '关羽', type: 'cavalry', hp: 150, maxHp: 150, atk: 25, def: 15, mov: 3, x: 3, y: 5 },
      { id: 'zhou_cang', name: '周仓', type: 'infantry', hp: 120, maxHp: 120, atk: 18, def: 20, mov: 2, x: 2, y: 5 },
      { id: 'shu_archer', name: '蜀军弓弩手', type: 'archer', hp: 80, maxHp: 80, atk: 20, def: 10, mov: 2, x: 4, y: 6 }
    ],
    enemyUnits: [
      { id: 'lu_meng', name: '吕蒙', type: 'infantry', hp: 130, maxHp: 130, atk: 22, def: 18, mov: 2, x: 3, y: 1 },
      { id: 'wu_cavalry', name: '东吴轻骑', type: 'cavalry', hp: 100, maxHp: 100, atk: 20, def: 12, mov: 3, x: 1, y: 1 },
      { id: 'wu_archer', name: '东吴弓箭手', type: 'archer', hp: 80, maxHp: 80, atk: 18, def: 10, mov: 2, x: 5, y: 0 },
      { id: 'wu_infantry', name: '白衣甲士', type: 'infantry', hp: 110, maxHp: 110, atk: 15, def: 15, mov: 2, x: 4, y: 1 }
    ],
    winCondition: { type: 'defeat_target', targetId: 'lu_meng' },
    loseCondition: { type: 'target_defeated', targetId: 'guan_yu' }
  }
};
