/* 简历母版生成器 — 核心逻辑 */
(function () {
  'use strict';

  var STORAGE_KEY = 'resume-master-data-v1';
  var AI_CONFIG_KEY = 'resume-master-ai-config';
  var AI_MODE_KEY = 'resume-master-ai-mode';
  var MODULES_KEY = 'resume-master-modules-v1';
  var CURRENT_ID_KEY = 'resume-master-current-id';

  var FONT_SIZES = { small: '12px', medium: '14px', large: '16px' };

  var DEFAULT_DATA = {
    template: 'modern',
    accent: '#2563eb',
    fontSize: 'medium',
    basic: {
      name: '张三',
      title: '前端开发工程师',
      phone: '138-0000-0000',
      email: 'zhangsan@example.com',
      location: '北京',
      website: 'github.com/zhangsan',
      avatar: '',
      summary: '5 年前端开发经验，专注于大型 Web 应用架构与性能优化，主导过多个千万级日活产品的核心模块研发。'
    },
    education: [
      { school: '北京大学', major: '计算机科学与技术', degree: '本科', start: '2015.09', end: '2019.06', gpa: 'GPA 3.8/4.0', note: '主修课程：数据结构、操作系统、计算机网络' }
    ],
    projects: [
      { name: '企业级低代码平台', role: '前端负责人', start: '2023.03', end: '至今', link: '', skills: 'React / TypeScript / Node.js', desc: '负责低代码平台渲染引擎与组件库的从 0 到 1 搭建；\n主导可视化拖拽编辑器的性能优化，首屏加载时间降低 40%；\n带领 4 人团队完成 3 个大版本迭代，服务 200+ 企业客户。' }
    ],
    work: [
      { company: '某某科技有限公司', position: '高级前端工程师', start: '2021.07', end: '至今', desc: '负责核心业务中台的前端架构设计与落地；\n推动团队组件化与工程化建设，研发效率提升 30%；\n参与招聘与新人培养，累计 mentor 8 名初级工程师。' },
      { company: '某某网络有限公司', position: '前端工程师', start: '2019.07', end: '2021.06', desc: '参与电商小程序与 H5 商城的功能开发与维护；\n优化页面加载性能，转化率提升 15%。' }
    ],
    awards: [
      { name: '全国大学生数学建模竞赛', org: '中国工业与应用数学学会', date: '2018.09', desc: '国家一等奖（前 1%）' }
    ],
    custom: [
      { id: 'c1', title: '专业技能', type: 'tags', content: 'JavaScript / TypeScript, React / Vue, Node.js, Webpack / Vite, 性能优化, 工程化', items: [] },
      { id: 'c2', title: '自我评价', type: 'text', content: '自驱力强，热爱技术分享，具备良好的跨团队协作与项目管理能力，能够快速学习并落地新技术。', items: [] }
    ]
  };

  var EMPTY_DATA = {
    template: 'modern',
    accent: '#2563eb',
    fontSize: 'medium',
    basic: { name: '', title: '', phone: '', email: '', location: '', website: '', avatar: '', summary: '' },
    education: [],
    projects: [],
    work: [],
    awards: [],
    custom: []
  };

  /* ---------- 简历模板样式（同时用于页面渲染与 Word 导出） ---------- */
  var RESUME_CSS = [
    '.resume-page{font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:#24292f;line-height:1.55;}',
    '.resume-inner{display:flex;flex-direction:column;}',
    '.r-name{font-size:1.9rem;font-weight:800;letter-spacing:.5px;margin:0;color:#111;}',
    '.r-title{font-size:1.02rem;font-weight:600;color:var(--accent);margin:4px 0 2px;}',
    '.r-contact{font-size:.82rem;color:#57606a;margin-top:6px;line-height:1.7;}',
    '.r-contact .sep{color:#c4c9cf;margin:0 6px;}',
    '.r-avatar{width:84px;height:84px;border-radius:50%;overflow:hidden;margin-bottom:.6rem;border:2px solid var(--accent);}',
    '.r-avatar img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.r-section{margin-top:1.2rem;}',
    '.r-h{font-size:1.05rem;font-weight:700;margin:0 0 .55rem;color:var(--accent);border-bottom:1.5px solid var(--accent);padding-bottom:3px;letter-spacing:.3px;}',
    '.r-summary{font-size:.88rem;color:#3c434c;margin:0;line-height:1.7;}',
    '.r-item{margin-bottom:.75rem;}',
    '.r-item:last-child{margin-bottom:0;}',
    '.r-item-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;}',
    '.r-item-title{font-size:.95rem;font-weight:700;color:#1f2328;}',
    '.r-item-sub{font-size:.85rem;color:#57606a;font-weight:500;margin-top:1px;}',
    '.r-item-date{font-size:.82rem;color:#8b949e;white-space:nowrap;}',
    '.r-item-link{font-size:.8rem;color:var(--accent);}',
    '.r-desc{margin:.3rem 0 0;padding-left:1.1rem;color:#3c434c;font-size:.87rem;line-height:1.65;}',
    '.r-desc li{margin-bottom:2px;}',
    '.r-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;}',
    '.r-tag{background:rgba(37,99,235,.08);color:var(--accent);padding:2px 10px;border-radius:20px;font-size:.8rem;}',
    /* 经典 */
    '.tpl-classic{font-family:"Songti SC","SimSun","STSong",serif;color:#1a1a1a;}',
    '.tpl-classic .r-name{font-family:"SimHei","Microsoft YaHei",sans-serif;}',
    '.tpl-classic .r-h{font-family:"SimHei","Microsoft YaHei",sans-serif;color:#1a1a1a;border-bottom:1px solid #333;}',
    '.tpl-classic .r-title{color:#1a1a1a;}',
    '.tpl-classic .r-tag{background:#f2f2f2;color:#333;border-radius:3px;}',
    /* 现代 */
    '.tpl-modern .r-h{color:var(--accent);border-bottom:none;border-left:4px solid var(--accent);padding-left:9px;}',
    '.tpl-modern .r-name{letter-spacing:1px;}',
    /* 简约 */
    '.tpl-minimal .r-h{color:#111;border-bottom:1px solid #e2e2e2;letter-spacing:2px;font-weight:600;}',
    '.tpl-minimal .r-title{color:#555;}',
    '.tpl-minimal .r-tag{background:#f5f5f5;color:#333;border-radius:3px;}',
    /* 双栏 */
    '.tpl-dual .resume-inner{flex-direction:row;align-items:stretch;}',
    '.tpl-dual .r-sidebar{width:250px;flex:none;background:#f5f7fb;border-radius:8px;padding:1.2rem;margin-right:1.5rem;}',
    '.tpl-dual .r-sidebar .r-h{color:var(--accent);border-bottom:1.5px solid var(--accent);}',
    '.tpl-dual .r-main{flex:1;min-width:0;}',
    '.tpl-dual .r-header-main{margin-bottom:1rem;}',
    '.tpl-dual .r-contact{line-height:1.9;}'
  ].join('\n');

  /* ---------- 状态 ---------- */
  var resumes = loadResumes();
  var currentResumeId = getCurrentResumeId(resumes);
  var data = findResume(resumes, currentResumeId);
  var modules = loadModules();
  var moduleDraft = null;
  var moduleEditingIndex = -1;
  var zoom = 1;
  var activeTab = 'basic';
  var polishTarget = null;
  var polishResultText = '';
  var saveTimer = null;
  var toastTimer = null;

  /* ---------- 工具函数 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function uid() { return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function nl2br(s) { return String(s == null ? '' : s).replace(/\n/g, '<br>'); }

  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, k) { return acc == null ? undefined : acc[k]; }, obj);
  }
  function setPath(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var key = parts[i];
      if (cur[key] == null) cur[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[key];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /* ---------- 持久化（多简历） ---------- */
  function normalizeResume(d) {
    return {
      id: d.id || uid(),
      name: d.name || '我的简历',
      template: d.template || DEFAULT_DATA.template,
      accent: d.accent || DEFAULT_DATA.accent,
      fontSize: d.fontSize || DEFAULT_DATA.fontSize,
      basic: Object.assign({}, DEFAULT_DATA.basic, d.basic || {}),
      education: d.education || [],
      projects: d.projects || [],
      work: d.work || [],
      awards: d.awards || [],
      custom: d.custom || []
    };
  }
  function makeResume(name) {
    var r = JSON.parse(JSON.stringify(DEFAULT_DATA));
    r.id = uid();
    r.name = name || '未命名简历';
    return r;
  }
  function loadResumes() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (parsed.length) return parsed.map(normalizeResume);
        } else if (parsed && typeof parsed === 'object') {
          return [normalizeResume(parsed)];
        }
      }
    } catch (e) { /* ignore */ }
    return [makeResume('我的简历')];
  }
  function getCurrentResumeId(list) {
    try {
      var id = localStorage.getItem(CURRENT_ID_KEY);
      if (id && list.some(function (r) { return r.id === id; })) return id;
    } catch (e) { /* ignore */ }
    return list[0].id;
  }
  function findResume(list, id) {
    return list.find(function (r) { return r.id === id; }) || list[0];
  }
  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    localStorage.setItem(CURRENT_ID_KEY, currentResumeId);
    var t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    setSaveStatus('已自动保存 ' + t);
  }
  function scheduleSave() {
    setSaveStatus('正在保存…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveData, 500);
  }
  function setSaveStatus(text) { var el = $('#save-status'); if (el) el.textContent = text; }

  /* ---------- AI 配置 ---------- */
  function getAIConfig() {
    try {
      var raw = localStorage.getItem(AI_CONFIG_KEY);
      if (raw) return Object.assign({ provider: '', baseUrl: '', apiKey: '', model: '' }, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return { provider: '', baseUrl: '', apiKey: '', model: '' };
  }
  function getAIMode() { return localStorage.getItem(AI_MODE_KEY) || 'local'; }
  function setAIMode(m) { localStorage.setItem(AI_MODE_KEY, m); }

  /* ---------- AI 服务商预设 ---------- */
  var AI_PROVIDERS = {
    deepseek: {
      name: 'DeepSeek（深度求索）',
      baseUrl: 'https://api.deepseek.com/v1',
      keyUrl: 'https://platform.deepseek.com/api_keys',
      models: [
        { value: 'deepseek-chat', label: 'DeepSeek-V3（通用对话，性价比高）' },
        { value: 'deepseek-reasoner', label: 'DeepSeek-R1（推理增强）' }
      ],
      defaultModel: 'deepseek-chat'
    },
    openai: {
      name: 'OpenAI（ChatGPT）',
      baseUrl: 'https://api.openai.com/v1',
      keyUrl: 'https://platform.openai.com/api-keys',
      models: [
        { value: 'gpt-4o-mini', label: 'GPT-4o mini（快速、低成本）' },
        { value: 'gpt-4o', label: 'GPT-4o（最强多模态）' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo（最便宜）' }
      ],
      defaultModel: 'gpt-4o-mini'
    },
    moonshot: {
      name: 'Moonshot（Kimi）',
      baseUrl: 'https://api.moonshot.cn/v1',
      keyUrl: 'https://platform.moonshot.cn/console/api-keys',
      models: [
        { value: 'moonshot-v1-8k', label: 'Kimi v1（8K 上下文）' },
        { value: 'moonshot-v1-32k', label: 'Kimi v1（32K 上下文）' },
        { value: 'moonshot-v1-128k', label: 'Kimi v1（128K 长文本）' }
      ],
      defaultModel: 'moonshot-v1-8k'
    },
    zhipu: {
      name: '智谱 AI（GLM）',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
      models: [
        { value: 'glm-4-flash', label: 'GLM-4-Flash（免费、快速）' },
        { value: 'glm-4', label: 'GLM-4（旗舰）' },
        { value: 'glm-4-air', label: 'GLM-4-Air（轻量）' },
        { value: 'glm-4-flashx', label: 'GLM-4-FlashX（超快）' }
      ],
      defaultModel: 'glm-4-flash'
    },
    dashscope: {
      name: '通义千问（阿里）',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      keyUrl: 'https://dashscope.console.aliyun.com/apiKey',
      models: [
        { value: 'qwen-turbo', label: 'Qwen Turbo（快速）' },
        { value: 'qwen-plus', label: 'Qwen Plus（均衡）' },
        { value: 'qwen-max', label: 'Qwen Max（最强）' },
        { value: 'qwen-long', label: 'Qwen Long（长文本）' }
      ],
      defaultModel: 'qwen-turbo'
    },
    doubao: {
      name: '豆包（字节跳动）',
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      keyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
      models: [
        { value: 'doubao-pro-32k', label: 'Doubao Pro 32K' },
        { value: 'doubao-pro-128k', label: 'Doubao Pro 128K（长文本）' },
        { value: 'doubao-lite-32k', label: 'Doubao Lite 32K（轻量）' }
      ],
      defaultModel: 'doubao-pro-32k'
    },
    siliconflow: {
      name: '硅基流动（SiliconFlow）',
      baseUrl: 'https://api.siliconflow.cn/v1',
      keyUrl: 'https://cloud.siliconflow.cn/account/ak',
      models: [
        { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen2.5-7B（免费）' },
        { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3' },
        { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek-R1' },
        { value: 'Pro/Qwen/Qwen2.5-72B-Instruct', label: 'Qwen2.5-72B' }
      ],
      defaultModel: 'Qwen/Qwen2.5-7B-Instruct'
    },
    yi: {
      name: '零一万物（Yi）',
      baseUrl: 'https://api.lingyiwanwu.com/v1',
      keyUrl: 'https://platform.lingyiwanwu.com/apikeys',
      models: [
        { value: 'yi-large', label: 'Yi Large（旗舰）' },
        { value: 'yi-medium', label: 'Yi Medium（均衡）' },
        { value: 'yi-lightning', label: 'Yi Lightning（快速）' }
      ],
      defaultModel: 'yi-large'
    },
    baichuan: {
      name: '百川智能（Baichuan）',
      baseUrl: 'https://api.baichuan-ai.com/v1',
      keyUrl: 'https://platform.baichuan-ai.com/console/apikey',
      models: [
        { value: 'Baichuan4', label: 'Baichuan4（旗舰）' },
        { value: 'Baichuan3-Turbo', label: 'Baichuan3 Turbo' }
      ],
      defaultModel: 'Baichuan4'
    },
    minimax: {
      name: 'MiniMax',
      baseUrl: 'https://api.minimax.chat/v1',
      keyUrl: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
      models: [
        { value: 'abab6.5s-chat', label: 'ABAB 6.5s（快速）' },
        { value: 'abab6.5-chat', label: 'ABAB 6.5（旗舰）' },
        { value: 'abab6-chat', label: 'ABAB 6' }
      ],
      defaultModel: 'abab6.5s-chat'
    },
    stepfun: {
      name: '阶跃星辰（StepFun）',
      baseUrl: 'https://api.stepfun.com/v1',
      keyUrl: 'https://platform.stepfun.com/interface-key',
      models: [
        { value: 'step-1-8k', label: 'Step-1（8K）' },
        { value: 'step-1-32k', label: 'Step-1（32K）' },
        { value: 'step-1-128k', label: 'Step-1（128K 长文本）' },
        { value: 'step-1-flash', label: 'Step-1 Flash（快速）' }
      ],
      defaultModel: 'step-1-8k'
    },
    openrouter: {
      name: 'OpenRouter（多模型聚合）',
      baseUrl: 'https://openrouter.ai/api/v1',
      keyUrl: 'https://openrouter.ai/keys',
      models: [
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3（聚合）' },
        { value: 'openai/gpt-4o-mini', label: 'GPT-4o mini（聚合）' },
        { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5（聚合）' },
        { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku（聚合）' }
      ],
      defaultModel: 'deepseek/deepseek-chat'
    },
    custom: {
      name: '自定义',
      baseUrl: '',
      keyUrl: '',
      models: [],
      defaultModel: ''
    }
  };

  function detectProviderFromConfig(cfg) {
    if (!cfg || !cfg.baseUrl) return 'custom';
    var url = cfg.baseUrl.toLowerCase();
    var keys = Object.keys(AI_PROVIDERS);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === 'custom') continue;
      var p = AI_PROVIDERS[keys[i]];
      if (p.baseUrl && url.indexOf(p.baseUrl.toLowerCase().replace(/\/+$/, '')) === 0) return keys[i];
    }
    return 'custom';
  }

  function onProviderChange() {
    var key = $('#ai-provider').value;
    var p = AI_PROVIDERS[key];
    var linkRow = $('#provider-link-row');
    var linkEl = $('#provider-key-link');
    var modelSelect = $('#ai-model-select');
    var modelInput = $('#ai-model');

    if (!p || key === 'custom') {
      $('#ai-base-url').value = '';
      $('#ai-base-url').readOnly = false;
      modelSelect.innerHTML = '';
      modelSelect.hidden = true;
      modelInput.placeholder = '手动输入模型名称';
      modelInput.value = '';
      if (linkRow) linkRow.hidden = true;
      return;
    }

    $('#ai-base-url').value = p.baseUrl;
    $('#ai-base-url').readOnly = true;

    modelSelect.innerHTML = '<option value="">— 选择模型 —</option>' +
      p.models.map(function (m) { return '<option value="' + esc(m.value) + '">' + esc(m.label) + '</option>'; }).join('');
    modelSelect.hidden = false;

    var currentModel = modelInput.value.trim();
    var matched = p.models.some(function (m) { return m.value === currentModel; });
    if (matched) {
      modelSelect.value = currentModel;
    } else if (!currentModel) {
      modelInput.value = p.defaultModel;
      modelSelect.value = p.defaultModel;
    } else {
      modelSelect.value = '';
    }

    modelInput.placeholder = '选择或手动输入';
    modelInput.readOnly = false;

    if (p.keyUrl && linkRow) {
      linkEl.href = p.keyUrl;
      linkRow.hidden = false;
    } else if (linkRow) {
      linkRow.hidden = true;
    }
  }

  function onModelSelectChange() {
    var val = $('#ai-model-select').value;
    if (val) $('#ai-model').value = val;
  }

  /* ---------- 提示条 ---------- */
  function toast(msg, type) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast' + (type ? ' ' + type : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2800);
  }

  /* ---------- 弹窗 ---------- */
  function openModal(id) { document.getElementById(id).hidden = false; }
  function closeModal(id) { document.getElementById(id).hidden = true; }

  /* ---------- 简历渲染 ---------- */
  function contactChips() {
    var b = data.basic;
    var parts = [];
    if (b.phone) parts.push(esc(b.phone));
    if (b.email) parts.push(esc(b.email));
    if (b.location) parts.push(esc(b.location));
    if (b.website) parts.push(esc(b.website));
    return parts.join('<span class="sep">|</span>');
  }
  function bullets(text) {
    var lines = String(text || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    if (!lines.length) return '';
    return '<ul class="r-desc">' + lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
  }

  function renderEducation() {
    var items = data.education.map(function (e) {
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">' + esc(e.school) + (e.major ? ' · ' + esc(e.major) : '') + '</span>' +
        '<span class="r-item-date">' + esc(e.start) + ' - ' + esc(e.end) + '</span></div>' +
        (e.degree || e.gpa ? '<div class="r-item-sub">' + [e.degree, e.gpa].filter(Boolean).map(esc).join(' · ') + '</div>' : '') +
        (e.note ? '<div class="r-item-sub">' + nl2br(esc(e.note)) + '</div>' : '') +
        '</div>';
    }).join('');
    return '<section class="r-section"><h2 class="r-h">教育背景</h2>' + items + '</section>';
  }
  function renderWork() {
    var items = data.work.map(function (w) {
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">' + esc(w.company) + (w.position ? ' · ' + esc(w.position) : '') + '</span>' +
        '<span class="r-item-date">' + esc(w.start) + ' - ' + esc(w.end) + '</span></div>' +
        bullets(w.desc) + '</div>';
    }).join('');
    return '<section class="r-section"><h2 class="r-h">工作经历</h2>' + items + '</section>';
  }
  function renderProjects() {
    var items = data.projects.map(function (p) {
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">' + esc(p.name) + (p.role ? ' · ' + esc(p.role) : '') + '</span>' +
        '<span class="r-item-date">' + esc(p.start) + ' - ' + esc(p.end) + '</span></div>' +
        (p.skills ? '<div class="r-item-sub">' + esc(p.skills) + '</div>' : '') +
        bullets(p.desc) + '</div>';
    }).join('');
    return '<section class="r-section"><h2 class="r-h">项目经历</h2>' + items + '</section>';
  }
  function renderAwards() {
    var items = data.awards.map(function (a) {
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">' + esc(a.name) + '</span>' +
        '<span class="r-item-date">' + esc(a.date) + '</span></div>' +
        (a.org ? '<div class="r-item-sub">' + esc(a.org) + '</div>' : '') +
        (a.desc ? '<div class="r-item-sub">' + nl2br(esc(a.desc)) + '</div>' : '') +
        '</div>';
    }).join('');
    return '<section class="r-section"><h2 class="r-h">获奖经历</h2>' + items + '</section>';
  }
  function renderCustomSection(c) {
    if (c.type === 'tags') {
      var tags = String(c.content || '').split(/[,，、\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (!tags.length) return '';
      return '<section class="r-section"><h2 class="r-h">' + esc(c.title) + '</h2><div class="r-tags">' +
        tags.map(function (t) { return '<span class="r-tag">' + esc(t) + '</span>'; }).join('') + '</div></section>';
    }
    if (c.type === 'text') {
      if (!String(c.content || '').trim()) return '';
      return '<section class="r-section"><h2 class="r-h">' + esc(c.title) + '</h2><p class="r-summary">' + nl2br(esc(c.content)) + '</p></section>';
    }
    var items = (c.items || []).map(function (it) {
      return '<div class="r-item"><div class="r-item-head"><span class="r-item-title">' + esc(it.title) + '</span>' +
        (it.desc ? '<span class="r-item-date">' + esc(it.desc) + '</span>' : '') + '</div></div>';
    }).join('');
    return '<section class="r-section"><h2 class="r-h">' + esc(c.title) + '</h2>' + items + '</section>';
  }

  function buildResumeHTML() {
    var b = data.basic;
    var isDual = data.template === 'dual';
    var contact = contactChips();
    var hasAvatar = !!b.avatar;
    var tagsCustom = data.custom.filter(function (c) { return c.type === 'tags'; });
    var otherCustom = data.custom.filter(function (c) { return c.type !== 'tags'; });

    var header = (hasAvatar && !isDual ? '<div class="r-avatar"><img src="' + esc(b.avatar) + '" alt=""/></div>' : '') +
      '<h1 class="r-name">' + (esc(b.name) || '姓名') + '</h1>' +
      '<div class="r-title">' + esc(b.title) + '</div>' +
      (isDual ? '' : '<div class="r-contact">' + contact + '</div>');

    var ordered = [];
    if (b.summary) ordered.push('<section class="r-section"><h2 class="r-h">个人简介</h2><p class="r-summary">' + nl2br(esc(b.summary)) + '</p></section>');
    if (!isDual) tagsCustom.forEach(function (c) { ordered.push(renderCustomSection(c)); });
    if (data.education.length) ordered.push(renderEducation());
    if (data.work.length) ordered.push(renderWork());
    if (data.projects.length) ordered.push(renderProjects());
    if (data.awards.length) ordered.push(renderAwards());
    otherCustom.forEach(function (c) { ordered.push(renderCustomSection(c)); });

    if (isDual) {
      var sidebar = [];
      if (hasAvatar) sidebar.push('<div class="r-avatar"><img src="' + esc(b.avatar) + '" alt=""/></div>');
      if (contact) sidebar.push('<div class="r-contact">' + contact + '</div>');
      tagsCustom.forEach(function (c) { sidebar.push(renderCustomSection(c)); });
      return '<div class="resume-inner">' +
        '<aside class="r-sidebar">' + sidebar.join('') + '</aside>' +
        '<div class="r-main"><div class="r-header-main">' + header + '</div>' + ordered.join('') + '</div>' +
        '</div>';
    }
    return '<div class="resume-inner"><div class="r-header">' + header + '</div>' + ordered.join('') + '</div>';
  }

  function renderResume() {
    var page = $('#resume-page');
    page.className = 'resume-page tpl-' + data.template;
    page.style.setProperty('--accent', data.accent);
    page.style.fontSize = FONT_SIZES[data.fontSize] || '14px';
    page.innerHTML = buildResumeHTML();
    page.style.transform = 'scale(' + zoom + ')';
  }

  /* ---------- 编辑区渲染 ---------- */
  function aiBtn(path) {
    return '<button type="button" class="ai-btn" data-action="polish" data-polish="' + path + '">AI 优化</button>';
  }
  function moveBtn(idx, key) {
    return '<button type="button" class="mini-btn" data-action="move" data-target="' + key + '" data-idx="' + idx + '" data-dir="-1">上移</button>' +
      '<button type="button" class="mini-btn" data-action="move" data-target="' + key + '" data-idx="' + idx + '" data-dir="1">下移</button>';
  }

  function renderBasicPanel() {
    var b = data.basic;
    return '<section class="panel" data-panel="basic">' +
      '<div class="field"><div class="field-label">姓名</div><input type="text" data-bind="basic.name" value="' + esc(b.name) + '"></div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">求职意向</div><input type="text" data-bind="basic.title" value="' + esc(b.title) + '"></div>' +
      '<div class="field"><div class="field-label">所在地</div><input type="text" data-bind="basic.location" value="' + esc(b.location) + '"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">电话</div><input type="text" data-bind="basic.phone" value="' + esc(b.phone) + '"></div>' +
      '<div class="field"><div class="field-label">邮箱</div><input type="text" data-bind="basic.email" value="' + esc(b.email) + '"></div>' +
      '</div>' +
      '<div class="field"><div class="field-label">个人网站 / 主页</div><input type="text" data-bind="basic.website" value="' + esc(b.website) + '"></div>' +
      '<div class="field"><div class="field-label">头像</div>' +
      '<div class="avatar-row"><div class="avatar-preview">' + (b.avatar ? '<img src="' + esc(b.avatar) + '" alt="">' : '无头像') + '</div>' +
      '<button type="button" class="btn btn-ghost" data-action="upload-avatar">上传头像</button>' +
      (b.avatar ? '<button type="button" class="mini-btn danger" data-action="remove-avatar">移除</button>' : '') +
      '</div><input type="file" id="avatar-file" accept="image/*" hidden></div>' +
      '<div class="field"><div class="field-label">个人简介 ' + aiBtn('basic.summary') + '</div>' +
      '<textarea data-bind="basic.summary" rows="4">' + esc(b.summary) + '</textarea></div>' +
      '</section>';
  }

  function educationCard(e, idx) {
    return '<div class="section-card">' +
      '<div class="section-card-head"><span class="section-card-title">教育经历 ' + (idx + 1) + '</span>' +
      '<span class="section-card-actions">' + moveBtn(idx, 'education') + '<button type="button" class="mini-btn up" data-action="save-edu-to-modules" data-idx="' + idx + '">存入库</button><button type="button" class="mini-btn danger" data-action="remove" data-target="education" data-idx="' + idx + '">删除</button></span></div>' +
      '<div class="field"><div class="field-label">学校</div><input type="text" data-bind="education.' + idx + '.school" value="' + esc(e.school) + '"></div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">专业</div><input type="text" data-bind="education.' + idx + '.major" value="' + esc(e.major) + '"></div>' +
      '<div class="field"><div class="field-label">学历</div><input type="text" data-bind="education.' + idx + '.degree" value="' + esc(e.degree) + '"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">开始时间</div><input type="text" data-bind="education.' + idx + '.start" value="' + esc(e.start) + '"></div>' +
      '<div class="field"><div class="field-label">结束时间</div><input type="text" data-bind="education.' + idx + '.end" value="' + esc(e.end) + '"></div>' +
      '</div>' +
      '<div class="field"><div class="field-label">GPA / 排名（可选）</div><input type="text" data-bind="education.' + idx + '.gpa" value="' + esc(e.gpa) + '"></div>' +
      '<div class="field"><div class="field-label">备注（主修课程等） ' + aiBtn('education.' + idx + '.note') + '</div><textarea data-bind="education.' + idx + '.note" rows="2">' + esc(e.note) + '</textarea></div>' +
      '</div>';
  }
  function projectCard(p, idx) {
    return '<div class="section-card">' +
      '<div class="section-card-head"><span class="section-card-title">项目经历 ' + (idx + 1) + '</span>' +
      '<span class="section-card-actions">' + moveBtn(idx, 'projects') + '<button type="button" class="mini-btn up" data-action="save-to-modules" data-idx="' + idx + '">存入库</button><button type="button" class="mini-btn danger" data-action="remove" data-target="projects" data-idx="' + idx + '">删除</button></span></div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">项目名称</div><input type="text" data-bind="projects.' + idx + '.name" value="' + esc(p.name) + '"></div>' +
      '<div class="field"><div class="field-label">担任角色</div><input type="text" data-bind="projects.' + idx + '.role" value="' + esc(p.role) + '"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">开始时间</div><input type="text" data-bind="projects.' + idx + '.start" value="' + esc(p.start) + '"></div>' +
      '<div class="field"><div class="field-label">结束时间</div><input type="text" data-bind="projects.' + idx + '.end" value="' + esc(p.end) + '"></div>' +
      '</div>' +
      '<div class="field"><div class="field-label">技术栈</div><input type="text" data-bind="projects.' + idx + '.skills" value="' + esc(p.skills) + '"></div>' +
      '<div class="field"><div class="field-label">项目描述 ' + aiBtn('projects.' + idx + '.desc') + '</div><textarea data-bind="projects.' + idx + '.desc" rows="4">' + esc(p.desc) + '</textarea></div>' +
      '</div>';
  }
  function workCard(w, idx) {
    return '<div class="section-card">' +
      '<div class="section-card-head"><span class="section-card-title">工作经历 ' + (idx + 1) + '</span>' +
      '<span class="section-card-actions">' + moveBtn(idx, 'work') + '<button type="button" class="mini-btn up" data-action="save-work-to-modules" data-idx="' + idx + '">存入库</button><button type="button" class="mini-btn danger" data-action="remove" data-target="work" data-idx="' + idx + '">删除</button></span></div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">公司</div><input type="text" data-bind="work.' + idx + '.company" value="' + esc(w.company) + '"></div>' +
      '<div class="field"><div class="field-label">职位</div><input type="text" data-bind="work.' + idx + '.position" value="' + esc(w.position) + '"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">开始时间</div><input type="text" data-bind="work.' + idx + '.start" value="' + esc(w.start) + '"></div>' +
      '<div class="field"><div class="field-label">结束时间</div><input type="text" data-bind="work.' + idx + '.end" value="' + esc(w.end) + '"></div>' +
      '</div>' +
      '<div class="field"><div class="field-label">工作描述 ' + aiBtn('work.' + idx + '.desc') + '</div><textarea data-bind="work.' + idx + '.desc" rows="4">' + esc(w.desc) + '</textarea></div>' +
      '</div>';
  }
  function awardCard(a, idx) {
    return '<div class="section-card">' +
      '<div class="section-card-head"><span class="section-card-title">获奖经历 ' + (idx + 1) + '</span>' +
      '<span class="section-card-actions">' + moveBtn(idx, 'awards') + '<button type="button" class="mini-btn danger" data-action="remove" data-target="awards" data-idx="' + idx + '">删除</button></span></div>' +
      '<div class="field-row">' +
      '<div class="field"><div class="field-label">奖项名称</div><input type="text" data-bind="awards.' + idx + '.name" value="' + esc(a.name) + '"></div>' +
      '<div class="field"><div class="field-label">颁发机构</div><input type="text" data-bind="awards.' + idx + '.org" value="' + esc(a.org) + '"></div>' +
      '</div>' +
      '<div class="field"><div class="field-label">获奖时间</div><input type="text" data-bind="awards.' + idx + '.date" value="' + esc(a.date) + '"></div>' +
      '<div class="field"><div class="field-label">描述 ' + aiBtn('awards.' + idx + '.desc') + '</div><textarea data-bind="awards.' + idx + '.desc" rows="2">' + esc(a.desc) + '</textarea></div>' +
      '</div>';
  }

  function customCard(c, idx) {
    var typeLabel = c.type === 'tags' ? '标签' : (c.type === 'text' ? '段落' : '条目列表');
    var body = '';
    if (c.type === 'tags' || c.type === 'text') {
      var label = c.type === 'tags' ? '标签内容（逗号或换行分隔）' : '段落内容';
      body = '<div class="field"><div class="field-label">' + label + ' ' + aiBtn('custom.' + idx + '.content') + '</div><textarea data-bind="custom.' + idx + '.content" rows="3">' + esc(c.content) + '</textarea></div>';
    } else {
      var items = (c.items || []).map(function (it, j) {
        return '<div class="field-row" style="align-items:flex-end">' +
          '<div class="field"><div class="field-label">标题</div><input type="text" data-bind="custom.' + idx + '.items.' + j + '.title" value="' + esc(it.title) + '"></div>' +
          '<div class="field"><div class="field-label">描述</div><input type="text" data-bind="custom.' + idx + '.items.' + j + '.desc" value="' + esc(it.desc) + '"></div>' +
          '<button type="button" class="mini-btn danger" data-action="remove" data-target="custom.' + idx + '.items" data-idx="' + j + '">删除</button>' +
          '</div>';
      }).join('');
      body = items + '<button type="button" class="mini-btn up" data-action="add" data-target="custom.' + idx + '.items">+ 添加条目</button>';
    }
    return '<div class="section-card">' +
      '<div class="section-card-head"><span class="section-card-title">' + esc(c.title) + ' <span style="color:var(--muted);font-weight:400">（' + typeLabel + '）</span></span>' +
      '<span class="section-card-actions">' + moveBtn(idx, 'custom') + '<button type="button" class="mini-btn danger" data-action="remove" data-target="custom" data-idx="' + idx + '">删除</button></span></div>' +
      body + '</div>';
  }

  function optimizableFields() {
    var fields = [];
    if (data.basic && data.basic.summary != null) fields.push({ path: 'basic.summary', label: '个人简介', get: function () { return data.basic.summary; } });
    data.education.forEach(function (e, i) { if (e.note != null) fields.push({ path: 'education.' + i + '.note', label: '教育经历' + (i + 1) + ' · 备注', get: function () { return e.note; } }); });
    data.work.forEach(function (w, i) { fields.push({ path: 'work.' + i + '.desc', label: '工作经历' + (i + 1) + ' · 描述', get: function () { return w.desc; } }); });
    data.projects.forEach(function (p, i) { fields.push({ path: 'projects.' + i + '.desc', label: '项目经历' + (i + 1) + ' · 描述', get: function () { return p.desc; } }); });
    data.awards.forEach(function (a, i) { fields.push({ path: 'awards.' + i + '.desc', label: '获奖经历' + (i + 1) + ' · 描述', get: function () { return a.desc; } }); });
    data.custom.forEach(function (c, i) {
      if (c.type === 'text' || c.type === 'tags') fields.push({ path: 'custom.' + i + '.content', label: c.title, get: function () { return c.content; } });
    });
    return fields;
  }

  function renderAIPanel() {
    var mode = getAIMode();
    var list = optimizableFields().map(function (f) {
      return '<div class="ai-field-item"><span>' + esc(f.label) + '</span>' +
        '<button type="button" class="mini-btn up" data-action="polish" data-polish="' + esc(f.path) + '">优化</button></div>';
    }).join('');
    return '<section class="panel" data-panel="ai">' +
      '<p class="hint">本地智能润色离线可用、即时生成；云端大模型效果更好，需在「AI 设置」中配置 OpenAI 兼容接口。</p>' +
      '<div class="ai-mode-row">' +
      '<label class="radio"><input type="radio" name="ai-global-mode" value="local"' + (mode === 'local' ? ' checked' : '') + '> 本地智能润色</label>' +
      '<label class="radio"><input type="radio" name="ai-global-mode" value="cloud"' + (mode === 'cloud' ? ' checked' : '') + '> 云端大模型</label>' +
      '</div>' +
      '<button type="button" class="btn btn-accent btn-block" data-action="optimize-all">一键优化全部经历描述</button>' +
      '<div class="field-label" style="margin-top:18px;margin-bottom:8px">可优化的内容</div>' +
      '<div class="ai-field-list">' + (list || '<div class="hint">暂无内容，请先填写经历描述。</div>') + '</div>' +
      '</section>';
  }

  function renderEditor() {
    var panels = $('#panels');
    panels.innerHTML =
      renderBasicPanel() +
      '<section class="panel" data-panel="education">' +
      '<div class="panel-toolbar"><button type="button" class="btn btn-ghost" data-action="open-modules">模块库</button><span class="toolbar-hint">保存 / 复用常用经历模块</span></div>' +
      data.education.map(educationCard).join('') +
      '<button type="button" class="add-btn" data-action="add" data-target="education">+ 添加教育经历</button></section>' +
      '<section class="panel" data-panel="project">' +
      '<div class="panel-toolbar"><button type="button" class="btn btn-ghost" data-action="open-modules">模块库</button><span class="toolbar-hint">保存 / 复用常用经历模块</span></div>' +
      data.projects.map(projectCard).join('') +
      '<button type="button" class="add-btn" data-action="add" data-target="projects">+ 添加项目经历</button></section>' +
      '<section class="panel" data-panel="work">' +
      '<div class="panel-toolbar"><button type="button" class="btn btn-ghost" data-action="open-modules">模块库</button><span class="toolbar-hint">保存 / 复用常用经历模块</span></div>' +
      data.work.map(workCard).join('') +
      '<button type="button" class="add-btn" data-action="add" data-target="work">+ 添加工作经历</button></section>' +
      '<section class="panel" data-panel="award">' + data.awards.map(awardCard).join('') +
      '<button type="button" class="add-btn" data-action="add" data-target="awards">+ 添加获奖经历</button></section>' +
      '<section class="panel" data-panel="custom">' + data.custom.map(customCard).join('') +
      '<button type="button" class="add-btn" data-action="add-custom">+ 添加自定义模块</button></section>' +
      renderAIPanel();
    applyTab(activeTab);
  }

  function applyTab(name) {
    $$('#tabs .tab').forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === name); });
    $$('#panels .panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === name); });
  }

  function blankItem(target) {
    if (target === 'education') return { school: '', major: '', degree: '', start: '', end: '', gpa: '', note: '' };
    if (target === 'projects') return { name: '', role: '', start: '', end: '', link: '', skills: '', desc: '' };
    if (target === 'work') return { company: '', position: '', start: '', end: '', desc: '' };
    if (target === 'awards') return { name: '', org: '', date: '', desc: '' };
    if (target.indexOf('.items') !== -1) return { title: '', desc: '' };
    return {};
  }

  /* ---------- AI 优化 ---------- */
  function localPolish(text) {
    var changes = [];
    var rules = [
      [/负责(?!人)/g, '牵头'],
      [/参与(?!者)/g, '深度参与'],
      [/完成了?/g, '交付'],
      [/做了/g, '落地'],
      [/使用了?/g, '运用'],
      [/提高了?/g, '显著提升'],
      [/减少了?/g, '大幅降低'],
      [/搭建/g, '从 0 到 1 搭建'],
      [/优化了?/g, '深度优化'],
      [/开发了?/g, '设计并开发'],
      [/维护/g, '持续维护与优化'],
      [/熟悉/g, '精通'],
      [/了解/g, '深入理解']
    ];
    var lines = String(text || '').split(/\n+/).map(function (l) { return l.replace(/^[\s•·\-*●]+/, '').trim(); }).filter(Boolean);
    var improved = lines.map(function (line) {
      var before = line;
      rules.forEach(function (r) { if (r[0].test(line)) line = line.replace(r[0], r[1]); });
      if (!/[。！？；;.!?，,：:]$/.test(line)) line += '。';
      if (line !== before) changes.push({ before: before, after: line });
      return line;
    });
    return { text: improved.join('\n'), changes: changes };
  }

  async function cloudPolish(text, cfg) {
    var resp = await fetch(cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: '你是一名资深简历优化专家。请将用户提供的中文简历经历描述优化为更具说服力的版本：使用强有力的动词开头、突出量化成果、遵循 STAR 法则、语言简洁专业。仅输出优化后的文本，保留换行与要点结构，不要任何解释或前后缀。' },
          { role: 'user', content: text }
        ],
        temperature: 0.6
      })
    });
    if (!resp.ok) {
      var t = await resp.text();
      throw new Error(resp.status + ' ' + t.slice(0, 200));
    }
    var json = await resp.json();
    var out = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
    return (out || '').trim();
  }

  function openPolish(path) {
    var field = optimizableFields().find(function (f) { return f.path === path; });
    var original = field ? field.get() : (getPath(data, path) || '');
    polishTarget = path;
    $('#polish-original').value = original;
    var resEl = $('#polish-result');
    resEl.textContent = '优化结果将显示在这里。';
    resEl.classList.remove('loading');
    $('#btn-apply-polish').disabled = true;
    var mode = getAIMode();
    $$('input[name="ai-mode-polish"]').forEach(function (r) { r.checked = (r.value === mode); });
    openModal('modal-ai-polish');
  }

  async function runPolish() {
    var original = $('#polish-original').value.trim();
    if (!original) { toast('请先输入内容', 'error'); return; }
    var mode = document.querySelector('input[name="ai-mode-polish"]:checked').value;
    var resEl = $('#polish-result');
    resEl.textContent = '正在生成优化结果…';
    resEl.classList.add('loading');
    $('#btn-apply-polish').disabled = true;
    try {
      if (mode === 'cloud') {
        var cfg = getAIConfig();
        if (!cfg.apiKey) throw new Error('尚未配置云端大模型，请先在「AI 设置」中填入 API Key');
        polishResultText = await cloudPolish(original, cfg);
        resEl.textContent = polishResultText || '(无结果)';
      } else {
        var r = localPolish(original);
        polishResultText = r.text;
        resEl.textContent = r.text;
        if (r.changes.length) {
          var note = document.createElement('div');
          note.className = 'polish-changes';
          note.textContent = '已优化 ' + r.changes.length + ' 处：' + r.changes.slice(0, 4).map(function (c) { return '「' + c.before + '」→「' + c.after + '」'; }).join('；');
          resEl.appendChild(note);
        }
      }
      resEl.classList.remove('loading');
      $('#btn-apply-polish').disabled = false;
    } catch (err) {
      resEl.classList.remove('loading');
      resEl.textContent = '生成失败：' + err.message;
      toast('优化失败：' + err.message, 'error');
    }
  }

  function applyPolish() {
    if (!polishTarget || !polishResultText) return;
    setPath(data, polishTarget, polishResultText);
    var el = document.querySelector('[data-bind="' + polishTarget + '"]');
    if (el) el.value = polishResultText;
    renderResume();
    saveData();
    closeModal('modal-ai-polish');
    toast('已替换到简历', 'success');
  }

  async function optimizeAll() {
    var mode = getAIMode();
    var fields = optimizableFields().filter(function (f) { return String(f.get() || '').trim(); });
    if (!fields.length) { toast('没有可优化的内容', 'error'); return; }
    var cfg = getAIConfig();
    if (mode === 'cloud' && !cfg.apiKey) { toast('请先配置云端大模型 API Key', 'error'); return; }
    if (!window.confirm('将对 ' + fields.length + ' 处内容进行 AI 优化，是否继续？')) return;
    toast('开始优化，请稍候…');
    var done = 0;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var original = String(f.get() || '').trim();
      if (!original) continue;
      try {
        var result = mode === 'cloud' ? await cloudPolish(original, cfg) : localPolish(original).text;
        if (result && result !== original) setPath(data, f.path, result);
      } catch (err) { console.warn('优化失败', f.path, err); }
      done++;
    }
    renderEditor();
    renderResume();
    saveData();
    toast('已优化 ' + done + ' 处内容', 'success');
  }

  /* ---------- 导出 ---------- */
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  function exportWord() {
    var html = buildResumeHTML();
    var accent = data.accent;
    var fontSize = FONT_SIZES[data.fontSize] || '14px';
    var wordCss = RESUME_CSS.split('var(--accent)').join(accent);
    wordCss +=
      '.resume-page{width:auto;min-height:0;box-shadow:none;padding:36px 40px;margin:0;}' +
      '@page{size:A4;margin:2cm;}' +
      'body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;}' +
      '.tpl-dual .resume-inner{display:block;}' +
      '.tpl-dual .r-sidebar{float:left;width:30%;margin-right:4%;}' +
      '.tpl-dual .r-main{overflow:hidden;}';
    var doc = '<!DOCTYPE html>' +
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>简历</title><style>' +
      wordCss +
      '</style></head>' +
      '<body><div class="resume-page tpl-' + data.template + '" style="--accent:' + accent + ';font-size:' + fontSize + '">' + html + '</div></body></html>';
    var blob = new Blob(['\ufeff', doc], { type: 'application/msword' });
    downloadBlob(blob, (data.basic.name || '我的简历') + '.doc');
    toast('Word 已导出', 'success');
  }

  async function exportPng() {
    var page = $('#resume-page');
    var savedTransform = page.style.transform;
    page.style.transform = 'none';
    try {
      var canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      canvas.toBlob(function (blob) {
        downloadBlob(blob, (data.basic.name || '我的简历') + '.png');
        toast('PNG 已导出', 'success');
      }, 'image/png');
    } catch (err) {
      toast('导出失败：' + err.message, 'error');
    } finally {
      page.style.transform = savedTransform;
    }
  }

  /* ---------- 事件 ---------- */
  function onPanelInput(e) {
    var el = e.target;
    var path = el.getAttribute('data-bind');
    if (!path) return;
    setPath(data, path, el.value);
    renderResume();
    scheduleSave();
  }
  function onPanelChange(e) {
    if (e.target.name === 'ai-global-mode') setAIMode(e.target.value);
  }
  function onPanelClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var target = btn.getAttribute('data-target');
    var idx = parseInt(btn.getAttribute('data-idx') || '0', 10);
    var dir = parseInt(btn.getAttribute('data-dir') || '0', 10);

    if (action === 'add') {
      var arr = getPath(data, target);
      if (Array.isArray(arr)) { arr.push(blankItem(target)); renderEditor(); renderResume(); saveData(); }
    } else if (action === 'remove') {
      var arr2 = getPath(data, target);
      if (Array.isArray(arr2)) { arr2.splice(idx, 1); renderEditor(); renderResume(); saveData(); }
    } else if (action === 'move') {
      var arr3 = getPath(data, target);
      if (Array.isArray(arr3)) {
        var j = idx + dir;
        if (j >= 0 && j < arr3.length) { var tmp = arr3[idx]; arr3[idx] = arr3[j]; arr3[j] = tmp; renderEditor(); renderResume(); saveData(); }
      }
    } else if (action === 'polish') {
      openPolish(btn.getAttribute('data-polish'));
    } else if (action === 'optimize-all') {
      optimizeAll();
    } else if (action === 'upload-avatar') {
      $('#avatar-file').click();
    } else if (action === 'remove-avatar') {
      data.basic.avatar = ''; renderEditor(); renderResume(); saveData();
    } else if (action === 'save-to-modules') {
      saveProjectToModules(idx);
    } else if (action === 'save-work-to-modules') {
      saveWorkToModules(idx);
    } else if (action === 'save-edu-to-modules') {
      saveEduToModules(idx);
    } else if (action === 'open-modules') {
      openModules();
    } else if (action === 'add-custom') {
      openModal('modal-add-custom');
    }
  }

  function syncControls() {
    $('#template-select').value = data.template;
    $('#accent-color').value = data.accent;
    $('#font-size-select').value = data.fontSize;
    renderResumeSelect();
  }

  /* ---------- 简历管理 ---------- */
  function renderResumeSelect() {
    var sel = $('#resume-select');
    if (!sel) return;
    sel.innerHTML = resumes.map(function (r) {
      return '<option value="' + esc(r.id) + '">' + esc(r.name || '未命名简历') + '</option>';
    }).join('');
    sel.value = data.id;
  }
  function renderResumeList() {
    var el = $('#resume-list');
    if (!el) return;
    el.innerHTML = resumes.map(function (r) {
      var active = r.id === data.id;
      return '<div class="resume-item' + (active ? ' active' : '') + '" data-action="switch-resume" data-id="' + esc(r.id) + '">' +
        '<span>' + esc(r.name || '未命名简历') + '</span>' +
        (active ? '<span class="resume-current">当前</span>' : '') +
        '</div>';
    }).join('');
  }
  function switchResume(id) {
    var r = findResume(resumes, id);
    if (!r || r.id === data.id) return;
    data = r;
    currentResumeId = r.id;
    renderEditor(); renderResume(); syncControls(); saveData();
    renderResumeList();
    toast('已切换到「' + (r.name || '未命名') + '」', 'success');
  }
  function newResume() {
    var name = window.prompt('请输入新简历名称：', '我的简历 ' + (resumes.length + 1));
    if (name == null) return;
    var r = makeResume(name.trim() || '未命名简历');
    resumes.push(r);
    data = r;
    currentResumeId = r.id;
    renderEditor(); renderResume(); syncControls(); saveData();
    renderResumeList();
    toast('已新建简历「' + r.name + '」', 'success');
  }
  function renameResume() {
    var name = window.prompt('重命名当前简历：', data.name);
    if (name == null || !name.trim()) return;
    data.name = name.trim();
    syncControls(); renderResumeList(); saveData();
    toast('已重命名', 'success');
  }
  function duplicateResume() {
    var copy = JSON.parse(JSON.stringify(data));
    copy.id = uid();
    copy.name = (data.name || '简历') + '（副本）';
    resumes.push(copy);
    data = copy;
    currentResumeId = copy.id;
    renderEditor(); renderResume(); syncControls(); saveData();
    renderResumeList();
    toast('已复制简历', 'success');
  }
  function deleteResume() {
    if (resumes.length <= 1) { toast('至少保留一份简历', 'error'); return; }
    if (!window.confirm('确定删除当前简历「' + data.name + '」？')) return;
    var idx = resumes.findIndex(function (r) { return r.id === data.id; });
    resumes.splice(idx, 1);
    data = resumes[0];
    currentResumeId = data.id;
    renderEditor(); renderResume(); syncControls(); saveData();
    renderResumeList();
    toast('已删除简历', 'success');
  }
  function setZoom(z) {
    zoom = Math.min(2, Math.max(0.5, Math.round(z * 10) / 10));
    $('#resume-page').style.transform = 'scale(' + zoom + ')';
    $('#zoom-value').textContent = Math.round(zoom * 100) + '%';
  }

  function bindEvents() {
    $('#resume-select').addEventListener('change', function (e) { switchResume(e.target.value); });
    $('#btn-manage-resumes').addEventListener('click', function () { renderResumeList(); openModal('modal-resumes'); });
    $('#btn-new-resume').addEventListener('click', newResume);
    $('#btn-rename-resume').addEventListener('click', renameResume);
    $('#btn-duplicate-resume').addEventListener('click', duplicateResume);
    $('#btn-delete-resume').addEventListener('click', deleteResume);
    $('#resume-list').addEventListener('click', function (e) {
      var item = e.target.closest('[data-action="switch-resume"]');
      if (!item) return;
      switchResume(item.getAttribute('data-id'));
    });

    $('#template-select').addEventListener('change', function (e) { data.template = e.target.value; renderResume(); saveData(); });
    $('#accent-color').addEventListener('input', function (e) { data.accent = e.target.value; renderResume(); scheduleSave(); });
    $('#font-size-select').addEventListener('change', function (e) { data.fontSize = e.target.value; renderResume(); saveData(); });

    $('#btn-export-word').addEventListener('click', exportWord);
    $('#btn-export-png').addEventListener('click', function () { exportPng(); });
    $('#btn-ai-settings').addEventListener('click', function () { openModal('modal-ai-settings'); });
    $('#btn-save-ai').addEventListener('click', saveAIConfig);
    $('#btn-test-ai').addEventListener('click', testAI);
    $('#ai-provider').addEventListener('change', onProviderChange);
    $('#ai-model-select').addEventListener('change', onModelSelectChange);

    $('#btn-load-sample').addEventListener('click', function () {
      Object.assign(data, JSON.parse(JSON.stringify(DEFAULT_DATA))); renderEditor(); renderResume(); syncControls(); saveData(); toast('已载入示例数据', 'success');
    });
    $('#btn-clear').addEventListener('click', function () {
      if (!window.confirm('确定清空全部内容？此操作不可撤销。')) return;
      Object.assign(data, JSON.parse(JSON.stringify(EMPTY_DATA))); renderEditor(); renderResume(); syncControls(); saveData(); toast('已清空');
    });

    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b) return;
      activeTab = b.getAttribute('data-tab');
      applyTab(activeTab);
    });

    $('#panels').addEventListener('input', onPanelInput);
    $('#panels').addEventListener('change', onPanelChange);
    $('#panels').addEventListener('click', onPanelClick);

    $$('.modal-close').forEach(function (b) { b.addEventListener('click', function () { closeModal(b.getAttribute('data-close')); }); });
    $$('.modal-backdrop').forEach(function (m) { m.addEventListener('click', function (e) { if (e.target === m) closeModal(m.id); }); });

    $('#btn-run-polish').addEventListener('click', runPolish);
    $('#btn-apply-polish').addEventListener('click', applyPolish);
    $('#btn-confirm-custom').addEventListener('click', addCustomSection);

    $('#btn-new-module').addEventListener('click', newModule);
    $('#btn-save-module').addEventListener('click', saveModuleDraft);
    $('#btn-cancel-module-edit').addEventListener('click', function () {
      moduleDraft = null;
      moduleEditingIndex = -1;
      $('#module-editor').hidden = true;
    });
    $('#mod-type').addEventListener('change', renderModuleFields);
    $('#btn-export-modules').addEventListener('click', exportModules);
    $('#btn-import-modules').addEventListener('click', function () { $('#import-modules-file').click(); });
    $('#import-modules-file').addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (f) importModules(f);
      e.target.value = '';
    });
    $('#btn-insert-selected').addEventListener('click', insertSelected);
    $('#module-select-all').addEventListener('change', function (e) {
      $$('#module-list .module-select').forEach(function (cb) { cb.checked = e.target.checked; });
      updateInsertSelected();
    });
    $('#module-search').addEventListener('input', renderModuleList);
    $('#module-category-filter').addEventListener('change', renderModuleList);
    $('#module-list').addEventListener('click', function (e) {
      if (e.target.closest('.module-select')) { updateInsertSelected(); return; }
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var act = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');
      if (act === 'insert-module') insertModule(id);
      else if (act === 'edit-module') editModule(id);
      else if (act === 'delete-module') deleteModule(id);
    });

    $('#avatar-file').addEventListener('change', function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { data.basic.avatar = r.result; renderEditor(); renderResume(); saveData(); };
      r.readAsDataURL(f);
      e.target.value = '';
    });

    $('#zoom-in').addEventListener('click', function () { setZoom(zoom + 0.1); });
    $('#zoom-out').addEventListener('click', function () { setZoom(zoom - 0.1); });

    /* 智能导入 */
    $('#btn-smart-import').addEventListener('click', openSmartImport);
    $$('#import-tabs .import-tab').forEach(function (t) {
      t.addEventListener('click', function () { switchImportTab(t.getAttribute('data-import-tab')); });
    });
    var dz = $('#drop-zone');
    if (dz) {
      dz.addEventListener('click', function () { $('#smart-import-file').click(); });
      dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
      dz.addEventListener('drop', handleDrop);
    }
    $('#smart-import-file').addEventListener('change', function (e) {
      if (e.target.files[0]) handleImportFile(e.target.files[0]);
      e.target.value = '';
    });
    $('#import-text-area').addEventListener('input', function (e) { importData.text = e.target.value; });
    $('#btn-parse-import').addEventListener('click', runImportParse);
    $('#btn-reparse').addEventListener('click', runImportParse);
    $('#btn-apply-import').addEventListener('click', applyImportToResume);
    var parseFieldsEl = $('#parse-fields');
    if (parseFieldsEl) {
      parseFieldsEl.addEventListener('change', function (e) {
        if (e.target.classList.contains('field-check')) {
          var idx = parseInt(e.target.getAttribute('data-idx'), 10);
          if (parsedFields[idx]) parsedFields[idx].checked = e.target.checked;
        }
        if (e.target.classList.contains('cat-check')) {
          var cat = e.target.getAttribute('data-cat');
          parsedFields.forEach(function (f) {
            if (f.category === cat) f.checked = e.target.checked;
          });
          parseFieldsEl.querySelectorAll('.field-check').forEach(function (cb) {
            var idx = parseInt(cb.getAttribute('data-idx'), 10);
            if (parsedFields[idx] && parsedFields[idx].category === cat) cb.checked = e.target.checked;
          });
        }
      });
      parseFieldsEl.addEventListener('input', function (e) {
        if (e.target.classList.contains('parse-field-value')) {
          var idx = parseInt(e.target.getAttribute('data-idx'), 10);
          if (parsedFields[idx]) parsedFields[idx].value = e.target.value;
        }
      });
    }
  }

  function saveAIConfig() {
    var provider = $('#ai-provider').value || 'custom';
    var baseUrl = $('#ai-base-url').value.trim();
    var apiKey = $('#ai-api-key').value.trim();
    var model = $('#ai-model').value.trim();
    if (!baseUrl) {
      var p = AI_PROVIDERS[provider];
      if (p && p.baseUrl) baseUrl = p.baseUrl;
    }
    if (!model) {
      var p2 = AI_PROVIDERS[provider];
      if (p2 && p2.defaultModel) model = p2.defaultModel;
    }
    var cfg = { provider: provider, baseUrl: baseUrl, apiKey: apiKey, model: model };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
    closeModal('modal-ai-settings');
    toast('AI 配置已保存', 'success');
  }

  async function testAI() {
    var provider = $('#ai-provider').value || 'custom';
    var p = AI_PROVIDERS[provider];
    var baseUrl = $('#ai-base-url').value.trim() || (p ? p.baseUrl : '');
    var apiKey = $('#ai-api-key').value.trim();
    var model = $('#ai-model').value.trim() || (p ? p.defaultModel : '');
    var resultEl = $('#ai-test-result');
    if (!apiKey) { toast('请先填写 API Key', 'error'); return; }
    if (!baseUrl) { toast('请先选择服务商或填写接口地址', 'error'); return; }
    if (!model) { toast('请先选择或输入模型名称', 'error'); return; }
    var btn = $('#btn-test-ai');
    btn.disabled = true; btn.textContent = '测试中…';
    resultEl.hidden = false;
    resultEl.className = 'ai-test-result loading';
    resultEl.textContent = '正在连接 ' + (p ? p.name : baseUrl) + ' …';
    try {
      var resp = await fetch(baseUrl.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: model, messages: [{ role: 'user', content: '你好' }], max_tokens: 5 })
      });
      if (!resp.ok) throw new Error(resp.status + ' ' + (await resp.text()).slice(0, 120));
      resultEl.className = 'ai-test-result success';
      resultEl.textContent = '连接成功！服务商：' + (p ? p.name : '自定义') + '，模型：' + model;
      toast('连接成功', 'success');
    } catch (err) {
      resultEl.className = 'ai-test-result error';
      resultEl.textContent = '连接失败：' + err.message;
      toast('连接失败：' + err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = '测试连接';
    }
  }

  function addCustomSection() {
    var title = $('#custom-title').value.trim();
    if (!title) { toast('请输入模块名称', 'error'); return; }
    var type = $('#custom-type').value;
    data.custom.push({ id: uid(), title: title, type: type, content: '', items: [] });
    $('#custom-title').value = '';
    closeModal('modal-add-custom');
    renderEditor(); renderResume(); saveData();
    toast('已添加模块「' + title + '」', 'success');
  }

  /* ---------- 经历模块库 ---------- */
  var MODULE_TYPE_LABELS = { project: '项目', work: '工作', education: '教育' };

  function loadModules() {
    try {
      var raw = localStorage.getItem(MODULES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return [];
  }
  function saveModules() {
    localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
  }

  function blankModule(type) {
    return { id: uid(), type: type || 'project', category: '', start: '', end: '', name: '', role: '', link: '', skills: '', desc: '', company: '', position: '', school: '', major: '', degree: '', gpa: '', note: '' };
  }

  function openModules() {
    moduleDraft = null;
    moduleEditingIndex = -1;
    $('#module-editor').hidden = true;
    renderModuleList();
    openModal('modal-modules');
  }

  function moduleFieldRow(labelHtml, inputHtml) {
    return '<div class="field"><div class="field-label">' + labelHtml + '</div>' + inputHtml + '</div>';
  }

  function renderModuleFields() {
    var type = $('#mod-type').value;
    var d = moduleDraft || blankModule(type);
    var html = '';
    if (type === 'project') {
      html += moduleFieldRow('模块 / 项目名称', '<input type="text" id="mod-name" value="' + esc(d.name) + '" placeholder="例如：通用登录鉴权模块">');
      html += '<div class="field-row">' +
        moduleFieldRow('担任角色', '<input type="text" id="mod-role" value="' + esc(d.role) + '">') +
        moduleFieldRow('技术栈', '<input type="text" id="mod-skills" value="' + esc(d.skills) + '">') + '</div>';
      html += '<div class="field-row">' +
        moduleFieldRow('开始时间', '<input type="text" id="mod-start" value="' + esc(d.start) + '">') +
        moduleFieldRow('结束时间', '<input type="text" id="mod-end" value="' + esc(d.end) + '">') + '</div>';
      html += moduleFieldRow('项目描述', '<textarea id="mod-desc" rows="3" placeholder="每行一条要点">' + esc(d.desc) + '</textarea>');
    } else if (type === 'work') {
      html += '<div class="field-row">' +
        moduleFieldRow('公司', '<input type="text" id="mod-company" value="' + esc(d.company) + '">') +
        moduleFieldRow('职位', '<input type="text" id="mod-position" value="' + esc(d.position) + '">') + '</div>';
      html += '<div class="field-row">' +
        moduleFieldRow('开始时间', '<input type="text" id="mod-start" value="' + esc(d.start) + '">') +
        moduleFieldRow('结束时间', '<input type="text" id="mod-end" value="' + esc(d.end) + '">') + '</div>';
      html += moduleFieldRow('工作描述', '<textarea id="mod-desc" rows="3" placeholder="每行一条要点">' + esc(d.desc) + '</textarea>');
    } else {
      html += '<div class="field-row">' +
        moduleFieldRow('学校', '<input type="text" id="mod-school" value="' + esc(d.school) + '">') +
        moduleFieldRow('学历', '<input type="text" id="mod-degree" value="' + esc(d.degree) + '">') + '</div>';
      html += moduleFieldRow('专业', '<input type="text" id="mod-major" value="' + esc(d.major) + '">');
      html += '<div class="field-row">' +
        moduleFieldRow('开始时间', '<input type="text" id="mod-start" value="' + esc(d.start) + '">') +
        moduleFieldRow('结束时间', '<input type="text" id="mod-end" value="' + esc(d.end) + '">') + '</div>';
      html += moduleFieldRow('GPA / 排名', '<input type="text" id="mod-gpa" value="' + esc(d.gpa) + '">');
      html += moduleFieldRow('备注（主修课程等）', '<textarea id="mod-note" rows="2">' + esc(d.note) + '</textarea>');
    }
    $('#mod-fields').innerHTML = html;
  }

  function newModule() {
    moduleDraft = blankModule('project');
    moduleEditingIndex = -1;
    $('#mod-type').value = 'project';
    $('#mod-category').value = '';
    renderModuleFields();
    $('#module-editor').hidden = false;
  }

  function editModule(id) {
    var idx = moduleIndex(id);
    var m = modules[idx];
    if (!m) return;
    moduleDraft = JSON.parse(JSON.stringify(m));
    moduleEditingIndex = idx;
    $('#mod-type').value = m.type || 'project';
    $('#mod-category').value = m.category || '';
    renderModuleFields();
    $('#module-editor').hidden = false;
  }

  function collectModuleDraft() {
    var type = $('#mod-type').value;
    var d = moduleDraft || blankModule(type);
    d.type = type;
    function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
    d.name = val('mod-name'); d.role = val('mod-role'); d.skills = val('mod-skills');
    d.start = val('mod-start'); d.end = val('mod-end'); d.desc = val('mod-desc');
    d.company = val('mod-company'); d.position = val('mod-position');
    d.school = val('mod-school'); d.degree = val('mod-degree'); d.major = val('mod-major');
    d.gpa = val('mod-gpa'); d.note = val('mod-note'); d.category = val('mod-category');
    return d;
  }

  function moduleTitle(m) {
    if (m.type === 'work') return m.company || '未命名模块';
    if (m.type === 'education') return m.school || '未命名模块';
    return m.name || '未命名模块';
  }

  function saveModuleDraft() {
    var d = collectModuleDraft();
    if (moduleTitle(d) === '未命名模块') { toast('请填写模块名称', 'error'); return; }
    if (moduleEditingIndex >= 0) {
      modules[moduleEditingIndex] = d;
    } else {
      modules.push(d);
    }
    saveModules();
    moduleDraft = null;
    moduleEditingIndex = -1;
    $('#module-editor').hidden = true;
    renderModuleList();
    toast('模块已保存', 'success');
  }

  function moduleIndex(id) {
    return modules.findIndex(function (m) { return m.id === id; });
  }
  function findModuleById(id) {
    return modules.find(function (m) { return m.id === id; });
  }
  function renderCategoryFilter() {
    var sel = $('#module-category-filter');
    if (!sel) return;
    var current = sel.value;
    var cats = [];
    modules.forEach(function (m) { if (m.category && cats.indexOf(m.category) === -1) cats.push(m.category); });
    sel.innerHTML = '<option value="">全部分类</option>' + cats.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('');
    sel.value = current;
  }

  function renderModuleList() {
    renderCategoryFilter();
    var el = $('#module-list');
    if (!modules.length) {
      el.innerHTML = '<div class="hint">模块库为空，可点击「新建模块」，或在各类经历卡片中点击「存入库」。</div>';
      updateInsertSelected();
      return;
    }
    var q = ($('#module-search') ? $('#module-search').value : '').trim().toLowerCase();
    var cat = $('#module-category-filter') ? $('#module-category-filter').value : '';
    var list = modules.filter(function (m) {
      var matchCat = !cat || (m.category || '') === cat;
      var hay = (moduleTitle(m) + ' ' + (m.category || '') + ' ' + (m.skills || '') + ' ' + (m.role || '') + ' ' + (m.position || '') + ' ' + (m.school || '')).toLowerCase();
      var matchQ = !q || hay.indexOf(q) !== -1;
      return matchCat && matchQ;
    });
    if (!list.length) {
      el.innerHTML = '<div class="hint">没有匹配的模块，请调整搜索或分类。</div>';
      updateInsertSelected();
      return;
    }
    el.innerHTML = list.map(function (m) {
      var typeLabel = MODULE_TYPE_LABELS[m.type] || '项目';
      var summary = [];
      if (m.type === 'work') summary = [m.position, m.start && m.end ? (m.start + ' - ' + m.end) : ''].filter(Boolean);
      else if (m.type === 'education') summary = [m.major, m.degree, m.start && m.end ? (m.start + ' - ' + m.end) : ''].filter(Boolean);
      else summary = [m.role, m.skills].filter(Boolean);
      return '<div class="module-item">' +
        '<label class="module-check"><input type="checkbox" class="module-select" data-id="' + esc(m.id) + '"></label>' +
        '<div class="module-item-info"><span class="module-item-name">' + esc(moduleTitle(m)) +
        ' <span class="module-type-tag">' + esc(typeLabel) + '</span>' +
        (m.category ? ' <span class="module-cat-tag">' + esc(m.category) + '</span>' : '') + '</span>' +
        '<span class="module-item-summary">' + esc(summary.join(' · ')) + '</span></div>' +
        '<div class="module-item-actions">' +
        '<button type="button" class="mini-btn" data-action="edit-module" data-id="' + esc(m.id) + '">编辑</button>' +
        '<button type="button" class="mini-btn up" data-action="insert-module" data-id="' + esc(m.id) + '">插入</button>' +
        '<button type="button" class="mini-btn danger" data-action="delete-module" data-id="' + esc(m.id) + '">删除</button>' +
        '</div></div>';
    }).join('');
    updateInsertSelected();
  }

  function insertModuleData(m) {
    if (m.type === 'work') {
      data.work.push({ company: m.company, position: m.position, start: m.start, end: m.end, desc: m.desc });
    } else if (m.type === 'education') {
      data.education.push({ school: m.school, major: m.major, degree: m.degree, start: m.start, end: m.end, gpa: m.gpa, note: m.note });
    } else {
      data.projects.push({ name: m.name, role: m.role, start: m.start, end: m.end, link: m.link || '', skills: m.skills, desc: m.desc });
    }
  }

  function insertModule(id) {
    var m = findModuleById(id);
    if (!m) return;
    insertModuleData(m);
    renderEditor(); renderResume(); saveData();
    toast('已插入模块「' + moduleTitle(m) + '」', 'success');
  }

  function insertSelected() {
    var ids = $$('#module-list .module-select:checked').map(function (cb) { return cb.getAttribute('data-id'); });
    if (!ids.length) { toast('请先勾选要插入的模块', 'error'); return; }
    ids.forEach(function (id) { var m = findModuleById(id); if (m) insertModuleData(m); });
    renderEditor(); renderResume(); saveData();
    toast('已插入 ' + ids.length + ' 个模块', 'success');
  }

  function updateInsertSelected() {
    var n = $$('#module-list .module-select:checked').length;
    $('#btn-insert-selected').disabled = (n === 0);
    $('#module-select-all').checked = (modules.length > 0 && n === modules.length);
  }

  function deleteModule(id) {
    if (!window.confirm('确定删除该模块？')) return;
    var idx = moduleIndex(id);
    if (idx < 0) return;
    modules.splice(idx, 1);
    saveModules();
    renderModuleList();
    toast('模块已删除');
  }

  function saveProjectToModules(idx) {
    var p = data.projects[idx];
    if (!p) return;
    if (!String(p.name || '').trim()) { toast('请先填写项目名称', 'error'); return; }
    modules.push({ id: uid(), type: 'project', name: p.name, role: p.role, start: p.start, end: p.end, link: p.link || '', skills: p.skills, desc: p.desc });
    saveModules();
    toast('已存入模块库', 'success');
  }
  function saveWorkToModules(idx) {
    var w = data.work[idx];
    if (!w) return;
    if (!String(w.company || '').trim()) { toast('请先填写公司名称', 'error'); return; }
    modules.push({ id: uid(), type: 'work', company: w.company, position: w.position, start: w.start, end: w.end, desc: w.desc });
    saveModules();
    toast('已存入模块库', 'success');
  }
  function saveEduToModules(idx) {
    var e = data.education[idx];
    if (!e) return;
    if (!String(e.school || '').trim()) { toast('请先填写学校名称', 'error'); return; }
    modules.push({ id: uid(), type: 'education', school: e.school, major: e.major, degree: e.degree, start: e.start, end: e.end, gpa: e.gpa, note: e.note });
    saveModules();
    toast('已存入模块库', 'success');
  }

  function exportModules() {
    if (!modules.length) { toast('模块库为空', 'error'); return; }
    var blob = new Blob([JSON.stringify(modules, null, 2)], { type: 'application/json' });
    downloadBlob(blob, '简历模块库.json');
    toast('模块库已导出', 'success');
  }

  function importModules(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) throw new Error('格式错误');
        arr.forEach(function (m) { if (m && m.type) modules.push(m); });
        saveModules();
        renderModuleList();
        toast('已导入 ' + arr.length + ' 个模块', 'success');
      } catch (err) {
        toast('导入失败：' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ---------- 智能导入 — 信息提取与分拣 ---------- */
  var importData = { text: '', file: null, fileBase64: '', fileName: '', fileType: '' };
  var parsedFields = [];

  function openSmartImport() {
    importData = { text: '', file: null, fileBase64: '', fileName: '', fileType: '' };
    parsedFields = [];
    $('#import-text-area').value = '';
    var preview = $('#import-file-preview');
    if (preview) { preview.hidden = true; preview.innerHTML = ''; }
    var resultArea = $('#parse-result-area');
    if (resultArea) resultArea.hidden = true;
    var fileInput = $('#smart-import-file');
    if (fileInput) fileInput.value = '';
    openModal('modal-smart-import');
  }

  function switchImportTab(tab) {
    $$('#import-tabs .import-tab').forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-import-tab') === tab);
    });
    $('#import-panel-file').classList.toggle('active', tab === 'file');
    $('#import-panel-text').classList.toggle('active', tab === 'text');
  }

  function handleImportFile(file) {
    if (!file) return;
    importData.file = file;
    importData.fileName = file.name;
    importData.fileType = file.type;
    var preview = $('#import-file-preview');
    if (!preview) return;
    preview.hidden = false;

    if (file.type.startsWith('image/')) {
      var reader = new FileReader();
      reader.onload = function () {
        importData.fileBase64 = reader.result;
        preview.innerHTML = '<div class="file-preview-card">' +
          '<img src="' + reader.result + '" alt="预览" class="file-preview-img">' +
          '<div class="file-preview-info"><span class="file-preview-name">' + esc(file.name) + '</span>' +
          '<span class="file-preview-meta">图片 · ' + (file.size / 1024).toFixed(1) + ' KB · 需云端 AI 解析</span></div></div>';
      };
      reader.readAsDataURL(file);
    } else {
      var tr = new FileReader();
      tr.onload = function () {
        importData.text = tr.result;
        preview.innerHTML = '<div class="file-preview-card">' +
          '<div class="file-preview-icon">📄</div>' +
          '<div class="file-preview-info"><span class="file-preview-name">' + esc(file.name) + '</span>' +
          '<span class="file-preview-meta">文本 · ' + (file.size / 1024).toFixed(1) + ' KB · 可离线解析</span></div></div>';
      };
      tr.readAsText(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    var dz = $('#drop-zone');
    if (dz) dz.classList.remove('dragover');
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleImportFile(file);
  }

  /* 文本信息提取引擎 — 基于正则的模式匹配 */
  function extractFromText(text) {
    var t = String(text || '').trim();
    if (!t) return [];
    var results = [];
    var used = {};

    function add(category, label, value, path) {
      var v = String(value || '').trim();
      if (!v) return;
      var key = category + '|' + label;
      if (used[key]) return;
      used[key] = true;
      results.push({ category: category, label: label, value: v, path: path, checked: true });
    }

    /* --- 基本信息 --- */
    var nameMatch = t.match(/(?:姓\s*名|名\s*字)\s*[:：\s]*([^\s,，\n，、；;]{2,5})/);
    if (nameMatch) add('basic', '姓名', nameMatch[1], 'basic.name');
    else {
      var firstLine = t.split(/\n/)[0].trim();
      if (firstLine.length >= 2 && firstLine.length <= 5 && /^[\u4e00-\u9fa5a-zA-Z·\s]+$/.test(firstLine)) {
        add('basic', '姓名', firstLine, 'basic.name');
      }
    }

    var phoneMatch = t.match(/(?:电\s*话|手\s*机|联\s*系\s*方\s*式)\s*[:：\s]*([1][3-9]\d[\s-]?\d{4}[\s-]?\d{4})|([1][3-9]\d{9})/);
    if (phoneMatch) {
      var phone = (phoneMatch[1] || phoneMatch[2] || '').replace(/[\s-]/g, '');
      add('basic', '电话', phone, 'basic.phone');
    } else {
      var p2 = t.match(/1[3-9]\d{9}/);
      if (p2) add('basic', '电话', p2[0], 'basic.phone');
    }

    var emailMatch = t.match(/(?:邮\s*箱|电\s*子\s*邮\s*箱|E-?mail)\s*[:：\s]*([^\s,，\n；;]+@[^\s,，\n；;]+)/i);
    if (emailMatch) add('basic', '邮箱', emailMatch[1], 'basic.email');
    else {
      var e2 = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
      if (e2) add('basic', '邮箱', e2[0], 'basic.email');
    }

    var locMatch = t.match(/(?:所\s*在\s*地|地\s*址|城\s*市|现\s*居)\s*[:：\s]*([^\s,，\n；;]{2,20})/);
    if (locMatch) add('basic', '所在地', locMatch[1], 'basic.location');

    var webMatch = t.match(/(?:网\s*站|主\s*页|博\s*客|Git[Hh]ub|个\s*人\s*主\s*页)\s*[:：\s]*([^\s,，\n；;]{4,60})/);
    if (webMatch) add('basic', '网站', webMatch[1], 'basic.website');
    else {
      var w2 = t.match(/(?:github\.com|gitlab\.com|gitee\.com|linkedin\.com|blog\.[\w.]+)\/[\w-]+/i);
      if (w2) add('basic', '网站', w2[0], 'basic.website');
    }

    var titleMatch = t.match(/(?:求\s*职\s*意\s*向|职\s*位|岗\s*位|期\s*望\s*职\s*位)\s*[:：\s]*([^\s,，\n；;]{2,30})/);
    if (titleMatch) add('basic', '求职意向', titleMatch[1], 'basic.title');

    var sumMatch = t.match(/(?:个\s*人\s*简\s*介|自\s*我\s*评\s*价|自\s*我\s*介\s*绍|个\s*人\s*总\s*结|简\s*介)\s*[:：\s]*([\s\S]*?)(?=\n\s*\n|\n[【\[]|教育|工作|项目|获奖|技能|证书|$)/);
    if (sumMatch) {
      var summary = sumMatch[1].trim().slice(0, 300);
      add('basic', '个人简介', summary, 'basic.summary');
    }

    /* --- 教育背景 --- */
    var eduPatterns = [
      /(?:教\s*育\s*背\s*景|教\s*育\s*经\s*历|学\s*历)\s*[:：]?\s*\n([\s\S]*?)(?=\n\s*\n|\n[【\[]|工作|项目|获奖|技能|证书|自我|简介|$)/,
      /(?:教\s*育\s*背\s*景|教\s*育\s*经\s*历|学\s*历)\s*[:：]\s*([\s\S]*?)(?=\n\s*\n|工作|项目|获奖|技能|证书|自我|简介|$)/
    ];
    var eduText = '';
    eduPatterns.forEach(function (re) { if (!eduText) { var m = t.match(re); if (m) eduText = m[1] || ''; } });

    if (eduText) {
      var eduLines = eduText.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      eduLines.forEach(function (line) {
        var school = '';
        var major = '';
        var degree = '';
        var dates = '';

        var dateMatch = line.match(/(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?)\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?|至今|现在|present)/i);
        if (dateMatch) dates = dateMatch[0];

        var degMatch = line.match(/(本科|硕士|博士|大专|专科|学士|研究生|MBA|博士后|高中)/);
        if (degMatch) degree = degMatch[1];

        var uniMatch = line.match(/([\u4e00-\u9fa5A-Za-z·()（）]+(?:大学|学院|学校|University|Institute|College))/);
        if (uniMatch) school = uniMatch[1];

        var majorMatch = line.match(/(?:专\s*业|主\s*修)\s*[:：]?\s*([\u4e00-\u9fa5A-Za-z·\s]{2,30})/);
        if (majorMatch) major = majorMatch[1].trim();

        if (school) {
          add('education', '学校', school, 'education.school');
          if (major) add('education', '专业', major, 'education.major');
          if (degree) add('education', '学历', degree, 'education.degree');
          if (dates) add('education', '时间', dates, 'education.dates');
        }
      });
    }

    /* --- 工作经历 --- */
    var workPatterns = [
      /(?:工\s*作\s*经\s*历|工\s*作\s*经\s*验)\s*[:：]?\s*\n([\s\S]*?)(?=\n\s*\n|\n[【\[]|教育|项目|获奖|技能|证书|自我|简介|$)/,
      /(?:工\s*作\s*经\s*历|工\s*作\s*经\s*验)\s*[:：]\s*([\s\S]*?)(?=\n\s*\n|教育|项目|获奖|技能|证书|自我|简介|$)/
    ];
    var workText = '';
    workPatterns.forEach(function (re) { if (!workText) { var m = t.match(re); if (m) workText = m[1] || ''; } });

    if (workText) {
      var workBlocks = workText.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
      workBlocks.forEach(function (block, i) {
        var company = '';
        var position = '';
        var dates = '';
        var desc = '';

        var cMatch = block.match(/([\u4e00-\u9fa5A-Za-z·()（）]+(?:有限公司|科技|集团|股份|公司|Inc|LLC|Corp|Co\.?))/);
        if (cMatch) company = cMatch[1];

        var pMatch = block.match(/(?:职\s*位|岗\s*位|担\s*任)\s*[:：]?\s*([^\s,，\n；;|]{2,20})/) || block.match(/[-–—]\s*([^\s,，\n；;|·]{2,20})/);
        if (pMatch) position = pMatch[1];

        var wdMatch = block.match(/(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?)\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?|至今|现在|present)/i);
        if (wdMatch) dates = wdMatch[0];

        var lines = block.split(/\n/).filter(function (l) { return l.trim(); });
        if (lines.length > 1) {
          desc = lines.slice(1).join('\n').trim();
        } else {
          var rest = block.replace(cMatch ? cMatch[0] : '', '').replace(pMatch ? pMatch[0] : '', '').replace(wdMatch ? wdMatch[0] : '', '').trim();
          if (rest) desc = rest;
        }

        if (company) {
          add('work', '公司 ' + (i + 1), company, 'work.' + i + '.company');
          if (position) add('work', '职位 ' + (i + 1), position, 'work.' + i + '.position');
          if (dates) add('work', '时间 ' + (i + 1), dates, 'work.' + i + '.dates');
          if (desc) add('work', '描述 ' + (i + 1), desc, 'work.' + i + '.desc');
        }
      });
    }

    /* --- 项目经历 --- */
    var projPatterns = [
      /(?:项\s*目\s*经\s*历|项\s*目\s*经\s*验|项\s*目)\s*[:：]?\s*\n([\s\S]*?)(?=\n\s*\n|\n[【\[]|教育|工作|获奖|技能|证书|自我|简介|$)/,
      /(?:项\s*目\s*经\s*历|项\s*目\s*经\s*验|项\s*目)\s*[:：]\s*([\s\S]*?)(?=\n\s*\n|教育|工作|获奖|技能|证书|自我|简介|$)/
    ];
    var projText = '';
    projPatterns.forEach(function (re) { if (!projText) { var m = t.match(re); if (m) projText = m[1] || ''; } });

    if (projText) {
      var projBlocks = projText.split(/\n\s*\n/).map(function (b) { return b.trim(); }).filter(Boolean);
      projBlocks.forEach(function (block, i) {
        var pname = '';
        var role = '';
        var skills = '';
        var dates = '';
        var desc = '';

        var pnMatch = block.match(/(?:项\s*目\s*名\s*称|项\s*目)\s*[:：]?\s*([^\n]{2,40})/) || block.match(/^([^\s,，：:·\-–—|]{2,40})/);
        if (pnMatch) pname = pnMatch[1].trim();

        var rMatch = block.match(/(?:角\s*色|担\s*任|职\s*责|负\s*责)\s*[:：]?\s*([^\s,，\n；;|]{2,20})/);
        if (rMatch) role = rMatch[1];

        var sMatch = block.match(/(?:技\s*术\s*栈|技\s*术|工\s*具|语\s*言)\s*[:：]?\s*([^\n]{3,80})/);
        if (sMatch) skills = sMatch[1].trim();

        var pdMatch = block.match(/(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?)\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}[\.\-/月]?|至今|现在|present)/i);
        if (pdMatch) dates = pdMatch[0];

        var lines = block.split(/\n/).filter(function (l) { return l.trim(); });
        if (lines.length > 1) {
          desc = lines.slice(1).join('\n').trim();
          if (desc.length > 300) desc = desc.slice(0, 300);
        }

        if (pname) {
          add('project', '项目名称 ' + (i + 1), pname, 'project.' + i + '.name');
          if (role) add('project', '角色 ' + (i + 1), role, 'project.' + i + '.role');
          if (skills) add('project', '技术栈 ' + (i + 1), skills, 'project.' + i + '.skills');
          if (dates) add('project', '时间 ' + (i + 1), dates, 'project.' + i + '.dates');
          if (desc) add('project', '描述 ' + (i + 1), desc, 'project.' + i + '.desc');
        }
      });
    }

    /* --- 获奖经历 --- */
    var awardMatch = t.match(/(?:获\s*奖|证\s*书|荣\s*誉|奖\s*项)\s*[:：]?\s*\n?([\s\S]*?)(?=\n\s*\n|\n[【\[]|教育|工作|项目|技能|自我|简介|$)/);
    if (awardMatch) {
      var awardLines = awardMatch[1].split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      awardLines.forEach(function (line, i) {
        if (line.length < 3) return;
        var dateM = line.match(/(20\d{2}[\.\-/年]\d{1,2})/);
        var name = line.replace(dateM ? dateM[0] : '', '').trim();
        add('award', '奖项 ' + (i + 1), name, 'award.' + i + '.name');
        if (dateM) add('award', '时间 ' + (i + 1), dateM[0], 'award.' + i + '.date');
      });
    }

    /* --- 技能 --- */
    var skillMatch = t.match(/(?:专\s*业\s*技\s*能|技\s*能|技\s*术\s*栈|技\s*术\s*特\s*长)\s*[:：]?\s*\n?([\s\S]*?)(?=\n\s*\n|\n[【\[]|教育|工作|项目|获奖|自我|简介|$)/);
    if (skillMatch) {
      var skills = skillMatch[1].trim().replace(/^[:：]\s*/, '');
      if (skills) add('custom', '专业技能', skills, 'custom.skills');
    }

    return results;
  }

  /* 云端 AI 提取 — 支持图片和文本 */
  async function extractWithAI(text, imageData, cfg) {
    var messages = [];
    var systemPrompt = '你是一个简历信息提取助手。请从用户提供的简历内容中提取关键信息，并按照以下 JSON 格式输出（仅输出 JSON，不要任何其他内容）：\n' +
      '{\n' +
      '  "basic": { "name": "", "title": "", "phone": "", "email": "", "location": "", "website": "", "summary": "" },\n' +
      '  "education": [{ "school": "", "major": "", "degree": "", "start": "", "end": "", "gpa": "", "note": "" }],\n' +
      '  "work": [{ "company": "", "position": "", "start": "", "end": "", "desc": "" }],\n' +
      '  "projects": [{ "name": "", "role": "", "start": "", "end": "", "skills": "", "desc": "" }],\n' +
      '  "awards": [{ "name": "", "org": "", "date": "", "desc": "" }],\n' +
      '  "skills": ""\n' +
      '}\n只填写能识别到的字段，识别不到的留空。';

    if (imageData) {
      messages.push({ role: 'system', content: systemPrompt });
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: '请提取这张简历图片中的所有信息，按 JSON 格式输出。' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      });
    } else {
      messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: '请提取以下简历内容中的所有信息，按 JSON 格式输出：\n\n' + text });
    }

    var resp = await fetch(cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify({ model: cfg.model, messages: messages, temperature: 0.2 })
    });
    if (!resp.ok) {
      var errText = await resp.text();
      throw new Error(resp.status + ' ' + errText.slice(0, 200));
    }
    var json = await resp.json();
    var content = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
    if (!content) throw new Error('AI 未返回内容');
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    var parsed;
    try { parsed = JSON.parse(content); }
    catch (e) { throw new Error('AI 返回格式异常，无法解析为 JSON'); }
    return aiResultToFields(parsed);
  }

  function aiResultToFields(obj) {
    var results = [];
    function add(category, label, value, path) {
      var v = String(value || '').trim();
      if (!v) return;
      results.push({ category: category, label: label, value: v, path: path, checked: true });
    }
    if (obj.basic) {
      add('basic', '姓名', obj.basic.name, 'basic.name');
      add('basic', '求职意向', obj.basic.title, 'basic.title');
      add('basic', '电话', obj.basic.phone, 'basic.phone');
      add('basic', '邮箱', obj.basic.email, 'basic.email');
      add('basic', '所在地', obj.basic.location, 'basic.location');
      add('basic', '网站', obj.basic.website, 'basic.website');
      add('basic', '个人简介', obj.basic.summary, 'basic.summary');
    }
    if (Array.isArray(obj.education)) {
      obj.education.forEach(function (e, i) {
        add('education', '学校 ' + (i + 1), e.school, 'education.' + i + '.school');
        add('education', '专业 ' + (i + 1), e.major, 'education.' + i + '.major');
        add('education', '学历 ' + (i + 1), e.degree, 'education.' + i + '.degree');
        add('education', '开始时间 ' + (i + 1), e.start, 'education.' + i + '.start');
        add('education', '结束时间 ' + (i + 1), e.end, 'education.' + i + '.end');
        add('education', 'GPA ' + (i + 1), e.gpa, 'education.' + i + '.gpa');
        add('education', '备注 ' + (i + 1), e.note, 'education.' + i + '.note');
      });
    }
    if (Array.isArray(obj.work)) {
      obj.work.forEach(function (w, i) {
        add('work', '公司 ' + (i + 1), w.company, 'work.' + i + '.company');
        add('work', '职位 ' + (i + 1), w.position, 'work.' + i + '.position');
        add('work', '开始时间 ' + (i + 1), w.start, 'work.' + i + '.start');
        add('work', '结束时间 ' + (i + 1), w.end, 'work.' + i + '.end');
        add('work', '描述 ' + (i + 1), w.desc, 'work.' + i + '.desc');
      });
    }
    if (Array.isArray(obj.projects)) {
      obj.projects.forEach(function (p, i) {
        add('project', '项目名称 ' + (i + 1), p.name, 'project.' + i + '.name');
        add('project', '角色 ' + (i + 1), p.role, 'project.' + i + '.role');
        add('project', '开始时间 ' + (i + 1), p.start, 'project.' + i + '.start');
        add('project', '结束时间 ' + (i + 1), p.end, 'project.' + i + '.end');
        add('project', '技术栈 ' + (i + 1), p.skills, 'project.' + i + '.skills');
        add('project', '描述 ' + (i + 1), p.desc, 'project.' + i + '.desc');
      });
    }
    if (Array.isArray(obj.awards)) {
      obj.awards.forEach(function (a, i) {
        add('award', '奖项 ' + (i + 1), a.name, 'award.' + i + '.name');
        add('award', '机构 ' + (i + 1), a.org, 'award.' + i + '.org');
        add('award', '时间 ' + (i + 1), a.date, 'award.' + i + '.date');
        add('award', '描述 ' + (i + 1), a.desc, 'award.' + i + '.desc');
      });
    }
    if (obj.skills) add('custom', '专业技能', obj.skills, 'custom.skills');
    return results;
  }

  async function runImportParse() {
    var mode = document.querySelector('input[name="import-mode"]:checked').value;
    var statusEl = $('#parse-status');
    var fieldsEl = $('#parse-fields');
    var resultArea = $('#parse-result-area');
    var parseBtn = $('#btn-parse-import');

    var hasText = !!importData.text.trim();
    var hasImage = !!importData.fileBase64;

    if (!hasText && !hasImage) { toast('请先上传文件或粘贴文本', 'error'); return; }

    var isImage = importData.fileType.startsWith('image/');
    var useAI = mode === 'ai' || isImage;

    if (useAI) {
      var cfg = getAIConfig();
      if (!cfg.apiKey) {
        toast('图片解析需要配置云端 AI，请先在「AI 设置」中配置', 'error');
        return;
      }
    }

    resultArea.hidden = false;
    fieldsEl.innerHTML = '';
    statusEl.textContent = '正在解析…';
    statusEl.className = 'parse-status loading';
    parseBtn.disabled = true;

    try {
      if (useAI) {
        var cfg2 = getAIConfig();
        parsedFields = await extractWithAI(importData.text, importData.fileBase64, cfg2);
      } else {
        parsedFields = extractFromText(importData.text);
      }

      if (!parsedFields.length) {
        statusEl.textContent = '未识别到有效信息';
        statusEl.className = 'parse-status empty';
        fieldsEl.innerHTML = '<div class="hint">未能从内容中提取有效信息，请尝试使用「云端 AI」模式，或手动检查内容格式。</div>';
      } else {
        statusEl.textContent = '已识别 ' + parsedFields.length + ' 个字段';
        statusEl.className = 'parse-status success';
        renderParsedFields();
      }
    } catch (err) {
      statusEl.textContent = '解析失败';
      statusEl.className = 'parse-status error';
      fieldsEl.innerHTML = '<div class="hint">解析失败：' + esc(err.message) + '</div>';
      toast('解析失败：' + err.message, 'error');
    } finally {
      parseBtn.disabled = false;
    }
  }

  function renderParsedFields() {
    var el = $('#parse-fields');
    if (!el) return;
    var categories = {};
    parsedFields.forEach(function (f, i) {
      if (!categories[f.category]) categories[f.category] = [];
      f._i = i;
      categories[f.category].push(f);
    });

    var catLabels = {
      basic: '基本信息', education: '教育背景', work: '工作经历',
      project: '项目经历', award: '获奖经历', custom: '其他'
    };
    var catOrder = ['basic', 'education', 'work', 'project', 'award', 'custom'];

    var html = '';
    catOrder.forEach(function (cat) {
      if (!categories[cat]) return;
      html += '<div class="parse-category">' +
        '<div class="parse-category-head">' +
        '<label class="radio"><input type="checkbox" class="cat-check" data-cat="' + cat + '" checked> ' + esc(catLabels[cat] || cat) + '</label>' +
        '<span class="parse-cat-count">' + categories[cat].length + ' 项</span>' +
        '</div><div class="parse-category-body">';
      categories[cat].forEach(function (f) {
        var v = f.value;
        if (v.length > 120) v = v.slice(0, 120) + '…';
        html += '<div class="parse-field-item">' +
          '<label class="parse-check"><input type="checkbox" class="field-check" data-idx="' + f._i + '"' + (f.checked ? ' checked' : '') + '></label>' +
          '<div class="parse-field-info">' +
          '<span class="parse-field-label">' + esc(f.label) + '</span>' +
          '<input type="text" class="parse-field-value" data-idx="' + f._i + '" value="' + esc(f.value) + '">' +
          '</div></div>';
      });
      html += '</div></div>';
    });
    el.innerHTML = html;
  }

  function applyImportToResume() {
    var checked = parsedFields.filter(function (f) { return f.checked; });
    if (!checked.length) { toast('未选择任何字段', 'error'); return; }

    var count = { basic: 0, education: 0, work: 0, project: 0, award: 0, custom: 0 };
    var maxIdx = { education: -1, work: -1, project: -1, award: -1 };

    checked.forEach(function (f) {
      var parts = f.path.split('.');
      var cat = parts[0];
      if (cat === 'education' || cat === 'work' || cat === 'project' || cat === 'award') {
        var idx = parseInt(parts[1] || '0', 10);
        if (idx > maxIdx[cat]) maxIdx[cat] = idx;
      }
    });

    ['education', 'work', 'project', 'award'].forEach(function (cat) {
      var needed = maxIdx[cat] + 1;
      if (needed > 0) {
        while (data[cat].length < needed) {
          data[cat].push(blankItem(cat));
        }
      }
    });

    var skillsContent = '';

    checked.forEach(function (f) {
      var parts = f.path.split('.');
      var cat = parts[0];
      if (cat === 'basic') {
        var key = parts[1];
        if (key === 'phone') data.basic.phone = f.value;
        else if (key === 'email') data.basic.email = f.value;
        else if (key === 'location') data.basic.location = f.value;
        else if (key === 'website') data.basic.website = f.value;
        else if (key === 'name') data.basic.name = f.value;
        else if (key === 'title') data.basic.title = f.value;
        else if (key === 'summary') data.basic.summary = f.value;
        count.basic++;
      } else if (cat === 'education') {
        var ei = parseInt(parts[1] || '0', 10);
        var ek = parts[2];
        if (ek === 'school') data.education[ei].school = f.value;
        else if (ek === 'major') data.education[ei].major = f.value;
        else if (ek === 'degree') data.education[ei].degree = f.value;
        else if (ek === 'start') data.education[ei].start = f.value;
        else if (ek === 'end') data.education[ei].end = f.value;
        else if (ek === 'gpa') data.education[ei].gpa = f.value;
        else if (ek === 'note') data.education[ei].note = f.value;
        else if (ek === 'dates') {
          var dm = f.value.match(/(20\d{2}[\.\-/年]\d{1,2})\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}|至今|现在|present)/i);
          if (dm) { data.education[ei].start = dm[1]; data.education[ei].end = dm[2]; }
        }
        count.education++;
      } else if (cat === 'work') {
        var wi = parseInt(parts[1] || '0', 10);
        var wk = parts[2];
        if (wk === 'company') data.work[wi].company = f.value;
        else if (wk === 'position') data.work[wi].position = f.value;
        else if (wk === 'start') data.work[wi].start = f.value;
        else if (wk === 'end') data.work[wi].end = f.value;
        else if (wk === 'desc') data.work[wi].desc = f.value;
        else if (wk === 'dates') {
          var wdm = f.value.match(/(20\d{2}[\.\-/年]\d{1,2})\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}|至今|现在|present)/i);
          if (wdm) { data.work[wi].start = wdm[1]; data.work[wi].end = wdm[2]; }
        }
        count.work++;
      } else if (cat === 'project') {
        var pi = parseInt(parts[1] || '0', 10);
        var pk = parts[2];
        if (pk === 'name') data.projects[pi].name = f.value;
        else if (pk === 'role') data.projects[pi].role = f.value;
        else if (pk === 'skills') data.projects[pi].skills = f.value;
        else if (pk === 'start') data.projects[pi].start = f.value;
        else if (pk === 'end') data.projects[pi].end = f.value;
        else if (pk === 'desc') data.projects[pi].desc = f.value;
        else if (pk === 'dates') {
          var pdm = f.value.match(/(20\d{2}[\.\-/年]\d{1,2})\s*[-–—至到]+\s*(20\d{2}[\.\-/年]\d{1,2}|至今|现在|present)/i);
          if (pdm) { data.projects[pi].start = pdm[1]; data.projects[pi].end = pdm[2]; }
        }
        count.project++;
      } else if (cat === 'award') {
        var ai = parseInt(parts[1] || '0', 10);
        var ak = parts[2];
        if (ak === 'name') data.awards[ai].name = f.value;
        else if (ak === 'org') data.awards[ai].org = f.value;
        else if (ak === 'date') data.awards[ai].date = f.value;
        else if (ak === 'desc') data.awards[ai].desc = f.value;
        count.award++;
      } else if (cat === 'custom') {
        if (f.path === 'custom.skills') {
          skillsContent = f.value;
        }
        count.custom++;
      }
    });

    if (skillsContent) {
      var skillSection = data.custom.find(function (c) { return c.title === '专业技能' && c.type === 'tags'; });
      if (skillSection) {
        skillSection.content = skillsContent;
      } else {
        data.custom.push({ id: uid(), title: '专业技能', type: 'tags', content: skillsContent, items: [] });
      }
    }

    renderEditor();
    renderResume();
    saveData();
    closeModal('modal-smart-import');
    var total = checked.length;
    toast('已填充 ' + total + ' 个字段到简历', 'success');
  }

  /* ---------- 启动 ---------- */
  function init() {
    var style = document.createElement('style');
    style.id = 'resume-style';
    style.textContent = RESUME_CSS;
    document.head.appendChild(style);

    renderEditor();
    renderResume();
    syncControls();
    bindEvents();

    var cfg = getAIConfig();
    var provider = cfg.provider || detectProviderFromConfig(cfg);
    $('#ai-provider').value = provider;
    $('#ai-base-url').value = cfg.baseUrl || (AI_PROVIDERS[provider] ? AI_PROVIDERS[provider].baseUrl : '');
    $('#ai-api-key').value = cfg.apiKey;
    $('#ai-model').value = cfg.model || (AI_PROVIDERS[provider] && AI_PROVIDERS[provider].defaultModel ? AI_PROVIDERS[provider].defaultModel : '');
    onProviderChange();
  }

  init();
})();
