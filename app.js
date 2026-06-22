// ==================== 状态管理 ====================
const state = {
  searchQuery: '',
  areaFilter: '全部',
  shiftFilter: '全部',
  paymentFilter: '全部',
};

// ==================== DOM 引用 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  searchInput: $('#searchInput'),
  searchClear: $('#searchClear'),
  areaBar: $('#areaBar'),
  shiftBar: $('#shiftBar'),
  paymentBar: $('#paymentBar'),
  resultCount: $('#resultCount'),
  factoryList: $('#factoryList'),
  recGrid: $('#recGrid'),
  modalOverlay: $('#modalOverlay'),
  modalBody: $('#modalBody'),
  modalTitle: $('#modalTitle'),
  modalClose: $('#modalClose'),
};

// 推荐厂区映射
const recommendedFactories = [
  { display: '白象', keyword: '白象' },
  { display: '菲尼克斯', keyword: '菲尼克斯' },
  { display: '江宁汽车仓库', keyword: '江宁汽车仓库' },
  { display: '芯德', keyword: '芯德' },
  { display: '尚界超级工厂', keyword: '尚界超级工厂' },
  { display: '滨江国企', keyword: '滨江国企' },
  { display: '泉峰科技529', keyword: '泉峰科技529' },
  { display: '音响厂', keyword: '音响厂' },
  { display: '舍弗勒', keyword: '舍弗勒' },
  { display: '华玻', keyword: '华玻' },
];

// ==================== 筛选逻辑 ====================
function getFilteredData() {
  let data = factoryData;

  // 区域筛选
  if (state.areaFilter !== '全部') {
    data = data.filter(f => f.area === state.areaFilter);
  }

  // 班次筛选
  if (state.shiftFilter !== '全部') {
    data = data.filter(f => f.shift.includes(state.shiftFilter));
  }

  // 结算方式筛选
  if (state.paymentFilter !== '全部') {
    data = data.filter(f => {
      const txt = f.salary + f.features + (f.remark || '');
      return txt.includes(state.paymentFilter);
    });
  }

  // 搜索筛选
  const q = state.searchQuery.toLowerCase().trim();
  if (q) {
    data = data.filter(f => {
      return (
        f.name.toLowerCase().includes(q) ||
        f.fullName.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.salary.toLowerCase().includes(q) ||
        f.features.toLowerCase().includes(q) ||
        (f.remark || '').toLowerCase().includes(q)
      );
    });
  }

  return data;
}

// ==================== 渲染区域标签 ====================
function renderAreas() {
  dom.areaBar.innerHTML = areas.map(a => `
    <button class="filter-chip area-chip ${a === state.areaFilter ? 'active' : ''}" data-area="${a}">
      ${a}
    </button>
  `).join('');

  dom.areaBar.querySelectorAll('.area-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.areaFilter = chip.dataset.area;
      renderAreas();
      renderResults();
    });
  });
}

// ==================== 渲染班次标签 ====================
function renderShiftFilters() {
  dom.shiftBar.innerHTML = shiftFilters.map(s => `
    <button class="filter-chip shift-chip ${s === state.shiftFilter ? 'active' : ''}" data-shift="${s}">
      ${s}
    </button>
  `).join('');

  dom.shiftBar.querySelectorAll('.shift-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.shiftFilter = chip.dataset.shift;
      renderShiftFilters();
      renderResults();
    });
  });
}

// ==================== 渲染结算方式标签 ====================
function renderPaymentFilters() {
  dom.paymentBar.innerHTML = paymentFilters.map(p => `
    <button class="filter-chip pay-chip ${p === state.paymentFilter ? 'active' : ''}" data-pay="${p}">
      ${p}
    </button>
  `).join('');

  dom.paymentBar.querySelectorAll('.pay-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.paymentFilter = chip.dataset.pay;
      renderPaymentFilters();
      renderResults();
    });
  });
}

// ==================== 渲染卡片列表 ====================
function renderResults() {
  const data = getFilteredData();

  dom.resultCount.textContent = `共 ${data.length} 家工厂`;

  if (data.length === 0) {
    dom.factoryList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">没有找到匹配的工厂，试试调整筛选条件</div>
      </div>
    `;
    return;
  }

  dom.factoryList.innerHTML = data.map((f, i) => {
    // 构建标签
    const tags = [];
    if (f.shift.includes('长白班')) tags.push('<span class="tag good">长白班</span>');
    else if (f.shift.includes('两班倒')) tags.push('<span class="tag">两班倒</span>');
    if (f.features.includes('坐班')) tags.push('<span class="tag good">坐班</span>');
    if (f.features.includes('五险') || f.features.includes('五险一金')) tags.push('<span class="tag good">五险一金</span>');
    if (f.features.includes('日结')) tags.push('<span class="tag warn">日结</span>');
    if (f.features.includes('不体检')) tags.push('<span class="tag good">不体检</span>');
    if (f.features.includes('包吃包住') || f.features.includes('厂吃厂住')) tags.push('<span class="tag">包吃住</span>');
    if (f.features.includes('不穿无尘服')) tags.push('<span class="tag good">不穿无尘服</span>');

    return `
      <div class="factory-card highlight" data-id="${i}" style="animation-delay:${i * 0.03}s">
        <div class="card-header">
          <div class="card-title">${f.name}</div>
          <div class="card-area">📍 ${f.area}</div>
        </div>
        <div class="card-info-grid">
          <span><span class="label">性别</span><span class="value">${f.gender}</span></span>
          <span><span class="label">年龄</span><span class="value">${f.age}</span></span>
          <span><span class="label">班次</span><span class="value">${f.shift}</span></span>
          <span><span class="label">月薪</span><span class="value">${f.salaryRange}元</span></span>
        </div>
        <div class="card-salary">${f.salary}</div>
        <div class="card-features">${tags.join('')}</div>
        ${f.features ? `<div class="card-remark">🏷️ ${f.features.split(',').slice(0, 3).join(' · ')}</div>` : ''}
      </div>
    `;
  }).join('');

  // 绑定点击事件
  dom.factoryList.querySelectorAll('.factory-card').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.id);
      openDetail(getFilteredData()[idx]);
    });
  });
}

// ==================== 详情弹窗 ====================
function openDetail(f) {
  if (!f) return;

  dom.modalTitle.textContent = f.name;
  dom.modalBody.innerHTML = `
    <dl class="dl">
      <dt>全称</dt><dd>${f.fullName}</dd>
      <dt>地址</dt><dd>${f.address || '未提供'}</dd>
      <hr>
      <dt>类型</dt><dd>${f.category}</dd>
      <dt>性别</dt><dd>${f.gender}</dd>
      <dt>年龄</dt><dd>${f.age}</dd>
      <dt>班次</dt><dd>${f.shift}</dd>
      <hr>
      <dt>日薪</dt><dd>${f.salary}</dd>
      <dt>月薪</dt><dd>${f.salaryRange}元</dd>
      <hr>
      <dt>食宿</dt><dd>${f.housing || '未提供'}</dd>
      <dt>餐食</dt><dd>${f.food || '未提供'}</dd>
      <hr>
      <dt>亮点</dt><dd>${f.features || '无'}</dd>
      
      ${f.requirements ? `<hr><dt class="requirements">要求</dt><dd class="requirements">${f.requirements}</dd>` : ''}
      ${f.remark ? `<hr><dt>备注</dt><dd>${f.remark}</dd>` : ''}
    </dl>
  `;

  dom.modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  dom.modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== 推荐厂区 ====================
function renderRecommended() {
  dom.recGrid.innerHTML = recommendedFactories.map(r => {
    // 找匹配的工厂数量
    const matched = factoryData.filter(f => f.name.includes(r.keyword) || f.fullName.includes(r.keyword));
    return `
      <div class="rec-card" data-keyword="${r.keyword}">
        ${r.display}
        <span class="rec-tag" style="display:block;font-size:0.58rem;font-weight:400;color:#92400e;margin-top:2px;">${matched.length} 个岗位</span>
      </div>
    `;
  }).join('');

  dom.recGrid.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', () => {
      const keyword = card.dataset.keyword;
      dom.searchInput.value = keyword;
      state.searchQuery = keyword;
      dom.searchClear.classList.toggle('visible', true);
      renderResults();
    });
  });
}

// ==================== 搜索 ====================
function handleSearch(value) {
  state.searchQuery = value;
  dom.searchClear.classList.toggle('visible', value.length > 0);
  renderResults();
}

// ==================== 初始化 ====================
function init() {
  renderAreas();
  renderShiftFilters();
  renderPaymentFilters();
  renderRecommended();
  renderResults();

  // 搜索输入
  dom.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  dom.searchClear.addEventListener('click', () => {
    dom.searchInput.value = '';
    handleSearch('');
  });

  // 详情弹窗关闭
  dom.modalClose.addEventListener('click', closeDetail);
  dom.modalOverlay.addEventListener('click', (e) => {
    if (e.target === dom.modalOverlay) closeDetail();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
