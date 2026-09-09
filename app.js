(() => {
  const STEPS = [
    { id: 1, name: "资料上传", mode: "混合", desc: "选择两份假资料开始。原件始终保留，可回看。" },
    { id: 2, name: "多模态解析", mode: "全自动", desc: "OCR / 文本抽取模拟。原件仍在，解错可重跑。" },
    { id: 3, name: "去重与初分类", mode: "全自动", desc: "按科目与资料类型归并；不删原件。" },
    { id: 4, name: "知识点结构化", mode: "全自动", desc: "抽出考点草稿，每条只保留候选出处，尚未放行。" },
    { id: 5, name: "来源可信度标注", mode: "混合", desc: "系统给出可信度建议与原文绑定；真题标待确认。" },
    { id: 6, name: "确认闸门", mode: "必须确认", desc: "进入可用集之前的把关。高置信可一键放行；来源不明默认不进入。" },
    { id: 7, name: "复习材料生成", mode: "全自动", desc: "只基于已放行条目生成带出处提纲，禁止无出处新增。" },
    { id: 8, name: "微调与导出", mode: "必须确认", desc: "可删一条提纲；确认后才能导出。导出=对外承诺可用。" },
  ];

  const ITEMS = [
    {
      id: "a1",
      file: "A",
      title: "主旨题：先抓段落中心句",
      body: "阅读理解主旨题优先定位段首/段尾中心句，再排除以偏概全选项。",
      source: "《考研英语·阅读精讲》课件.pdf · 第 12 页",
      confidence: "high",
    },
    {
      id: "a2",
      file: "A",
      title: "细节题：同义替换而非原词定位",
      body: "正确选项常对原文做同义改写；原词重现可能是干扰项。",
      source: "《考研英语·阅读精讲》课件.pdf · 第 15 页",
      confidence: "high",
    },
    {
      id: "a3",
      file: "A",
      title: "态度题：抓评价性形容词",
      body: "作者态度多由评价词与转折后的结论共同决定。",
      source: "《考研英语·阅读精讲》课件.pdf · 第 18 页",
      confidence: "high",
    },
    {
      id: "b1",
      file: "B",
      title: "（来源不明）2023 阅读 Text题推断",
      body: "据传某套「真题」称第 3 篇正确答案为 C；原文依据不足。",
      source: "阅读理解真题（来源不明）.jpg · 无法绑定官方出处",
      confidence: "pending",
    },
    {
      id: "b2",
      file: "B",
      title: "（来源不明）词汇题答案清单",
      body: "图片笔记列出一组答案，但无法核对年份与试卷版本。",
      source: "阅读理解真题（来源不明）.jpg · 来源不明",
      confidence: "pending",
    },
  ];

  const state = {
    view: "demo",
    step: 1,
    selected: { A: false, B: false },
    auto: { parse: 0, classify: 0, extract: 0 },
    autoTimer: null,
    released: {},
    outline: [],
    removed: {},
    exportConfirmed: false,
    exported: false,
  };

  const els = {
    navBtns: [...document.querySelectorAll(".nav-btn")],
    views: {
      demo: document.getElementById("view-demo"),
      positioning: document.getElementById("view-positioning"),
      flow: document.getElementById("view-flow"),
      eval: document.getElementById("view-eval"),
    },
    stepList: document.getElementById("step-list"),
    kicker: document.getElementById("stage-kicker"),
    title: document.getElementById("stage-title"),
    desc: document.getElementById("stage-desc"),
    panel: document.getElementById("panel-root"),
    actions: document.getElementById("stage-actions"),
    toast: document.getElementById("toast"),
  };

  function showToast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 2200);
  }

  function switchView(name) {
    state.view = name;
    els.navBtns.forEach((btn) => {
      const active = btn.dataset.view === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    Object.entries(els.views).forEach(([key, node]) => {
      const on = key === name;
      node.hidden = !on;
      node.classList.toggle("is-active", on);
    });
  }

  function renderRail() {
    els.stepList.innerHTML = STEPS.map((s) => {
      const done = state.step > s.id;
      const current = state.step === s.id;
      const cls = done ? "is-done" : current ? "is-current" : "";
      const mark = done ? "✓" : s.id;
      return `<li class="step-item ${cls}"><span class="step-dot">${mark}</span><span>${s.id}. ${s.name}</span></li>`;
    }).join("");
  }

  function setHeader() {
    // Visual step for combined auto screen: steps 2-4 share one panel but rail advances
    const meta = STEPS[state.step - 1];
    els.kicker.textContent = `环 ${meta.id} · ${meta.mode}`;
    els.title.textContent = meta.name;
    els.desc.textContent = meta.desc;
  }

  function clearAutoTimer() {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function ensureReleasedDefaults() {
    ITEMS.forEach((item) => {
      if (!(item.id in state.released)) {
        state.released[item.id] = false;
      }
    });
  }

  function releasedItems() {
    return ITEMS.filter((item) => state.released[item.id]);
  }

  function buildOutline() {
    const list = releasedItems();
    state.outline = list.map((item, idx) => ({
      id: item.id,
      title: item.title.replace(/^（来源不明）/, ""),
      body: item.body,
      cite: item.source,
      risky: item.confidence !== "high",
      order: idx + 1,
    }));
    state.removed = {};
    state.exportConfirmed = false;
    state.exported = false;
  }

  function visibleOutline() {
    return state.outline.filter((o) => !state.removed[o.id]);
  }

  function badgeFor(item) {
    if (item.confidence === "high") return '<span class="badge badge-high">高置信</span>';
    return '<span class="badge badge-pending">待确认 · 来源不明</span>';
  }

  function renderUpload() {
    const aOn = state.selected.A ? "is-selected" : "";
    const bOn = state.selected.B ? "is-selected" : "";
    els.panel.innerHTML = `
      <div class="file-grid">
        <button type="button" class="file-card ${aOn}" data-file="A">
          <span class="file-type">课件 · 来源清晰</span>
          <h3>《考研英语·阅读精讲》课件.pdf</h3>
          <p>官方课程讲义扫描件，可绑定页码出处。</p>
        </button>
        <button type="button" class="file-card ${bOn}" data-file="B">
          <span class="file-type">图片 · 来源不明「真题」</span>
          <h3>阅读理解真题（来源不明）.jpg</h3>
          <p>聊天记录导出的答题图，无法核对试卷版本。</p>
        </button>
      </div>`;
    els.panel.querySelectorAll("[data-file]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.file;
        state.selected[key] = !state.selected[key];
        render();
      });
    });

    const ready = state.selected.A && state.selected.B;
    els.actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-start" ${ready ? "" : "disabled"}>开始整理</button>
      <span class="empty-hint">${ready ? "已选 2 份资料，原件将保留。" : "请同时勾选两份假资料。"}</span>`;
    document.getElementById("btn-start").addEventListener("click", () => {
      if (!ready) return;
      state.step = 2;
      state.auto = { parse: 0, classify: 0, extract: 0 };
      startAutoPipeline();
      render();
    });
  }

  function startAutoPipeline() {
    clearAutoTimer();
    state.auto = { parse: 0, classify: 0, extract: 0 };
    state.autoTimer = setInterval(() => {
      if (state.auto.parse < 100) {
        state.auto.parse = Math.min(100, state.auto.parse + 20);
        state.step = 2;
      } else if (state.auto.classify < 100) {
        state.auto.classify = Math.min(100, state.auto.classify + 25);
        state.step = 3;
      } else if (state.auto.extract < 100) {
        state.auto.extract = Math.min(100, state.auto.extract + 25);
        state.step = 4;
      } else {
        clearAutoTimer();
        state.step = 4;
      }
      render({ keepAutoRunning: true });
    }, 280);
  }

  function skipAuto() {
    clearAutoTimer();
    state.auto = { parse: 100, classify: 100, extract: 100 };
    state.step = 4;
    render();
  }

  function renderAutoBundle() {
    const rows = [
      {
        key: "parse",
        title: "2. 多模态解析",
        detail: "OCR 完成 · 提取带页码文本草稿（模拟）",
      },
      {
        key: "classify",
        title: "3. 去重与初分类",
        detail: "科目：考研英语 · 课件 1 份 / 真题图片 1 份 · 未删原件",
      },
      {
        key: "extract",
        title: "4. 知识点提取与结构化",
        detail: "抽出 5 条知识点草稿（3 条来自课件，2 条来自不明真题）",
      },
    ];

    els.panel.innerHTML = `<div class="auto-stack">${rows
      .map((row) => {
        const pct = state.auto[row.key];
        const running = pct > 0 && pct < 100;
        const done = pct >= 100;
        const cls = done ? "is-done" : running ? "is-running" : "";
        const status = done ? "完成" : running ? "处理中" : "等待";
        return `
          <div class="auto-row ${cls}">
            <div class="auto-row-head">
              <strong>${row.title}</strong>
              <span class="auto-status">${status} ${pct}%</span>
            </div>
            <div class="progress"><span style="width:${pct}%"></span></div>
            <p class="auto-detail">${done || running ? row.detail : "排队中"}</p>
          </div>`;
      })
      .join("")}</div>`;

    const allDone = state.auto.parse === 100 && state.auto.classify === 100 && state.auto.extract === 100;
    els.actions.innerHTML = `
      <button type="button" class="btn btn-secondary" id="btn-skip">跳过等待</button>
      <button type="button" class="btn btn-primary" id="btn-to-label" ${allDone ? "" : "disabled"}>进入来源标注</button>
      <button type="button" class="btn btn-ghost" id="btn-back-upload">返回上传</button>`;

    document.getElementById("btn-skip").addEventListener("click", skipAuto);
    document.getElementById("btn-to-label").addEventListener("click", () => {
      if (!allDone) return;
      clearAutoTimer();
      state.step = 5;
      render();
    });
    document.getElementById("btn-back-upload").addEventListener("click", () => {
      clearAutoTimer();
      state.step = 1;
      render();
    });
  }

  function renderLabel() {
    els.panel.innerHTML = `
      <div class="item-list">
        ${ITEMS.map(
          (item) => `
          <article class="item">
            <div class="item-top">
              <h3>${item.title}</h3>
              ${badgeFor(item)}
              <span class="badge badge-blocked">未放行</span>
            </div>
            <p>${item.body}</p>
            <p class="source">出处建议：${item.source}</p>
          </article>`
        ).join("")}
      </div>`;

    els.actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-to-gate">进入确认闸门</button>
      <button type="button" class="btn btn-ghost" id="btn-back-auto">返回自动处理</button>`;
    document.getElementById("btn-to-gate").addEventListener("click", () => {
      ensureReleasedDefaults();
      // happy path defaults: A released false until user action; we don't auto-release
      state.step = 6;
      render();
    });
    document.getElementById("btn-back-auto").addEventListener("click", () => {
      state.step = 4;
      state.auto = { parse: 100, classify: 100, extract: 100 };
      render();
    });
  }

  function renderGate() {
    ensureReleasedDefaults();
    const highIds = ITEMS.filter((i) => i.confidence === "high").map((i) => i.id);
    const pendingIds = ITEMS.filter((i) => i.confidence === "pending").map((i) => i.id);

    els.panel.innerHTML = `
      <div class="gate-toolbar">
        <button type="button" class="btn btn-secondary" id="btn-release-high">一键放行高置信（课件 A）</button>
        <button type="button" class="btn btn-danger" id="btn-force-b">仍要放行来源不明 B（不推荐）</button>
        <button type="button" class="btn btn-ghost" id="btn-clear-b">清除 B 放行</button>
      </div>
      <div class="item-list">
        ${ITEMS.map((item) => {
          const on = state.released[item.id];
          return `
            <article class="item gate-item">
              <div class="item-top">
                <h3>${item.title}</h3>
                ${badgeFor(item)}
                ${on ? '<span class="badge badge-released">已放行</span>' : '<span class="badge badge-blocked">未进入可用集</span>'}
              </div>
              <p>${item.body}</p>
              <p class="source">${item.source}</p>
              <div class="gate-actions">
                ${
                  item.confidence === "high"
                    ? `<button type="button" class="btn btn-secondary" data-toggle="${item.id}">${on ? "取消放行" : "放行"}</button>`
                    : `<button type="button" class="btn btn-danger" data-toggle="${item.id}">${on ? "取消放行" : "仍要放行（不推荐）"}</button>`
                }
              </div>
            </article>`;
        }).join("")}
      </div>`;

    els.panel.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggle;
        state.released[id] = !state.released[id];
        render();
      });
    });

    document.getElementById("btn-release-high").addEventListener("click", () => {
      highIds.forEach((id) => {
        state.released[id] = true;
      });
      showToast("已放行课件 A 的高置信条目");
      render();
    });
    document.getElementById("btn-force-b").addEventListener("click", () => {
      pendingIds.forEach((id) => {
        state.released[id] = true;
      });
      showToast("已强制放行来源不明条目（不推荐）");
      render();
    });
    document.getElementById("btn-clear-b").addEventListener("click", () => {
      pendingIds.forEach((id) => {
        state.released[id] = false;
      });
      render();
    });

    const hasA = highIds.some((id) => state.released[id]);
    els.actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-generate" ${hasA ? "" : "disabled"}>基于已放行条目生成提纲</button>
      <button type="button" class="btn btn-ghost" id="btn-back-label">返回标注</button>
      <span class="empty-hint">${hasA ? "Happy path：可不放行 B，提纲将只有课件内容。" : "请至少放行一条课件 A 的高置信条目。"}</span>`;

    document.getElementById("btn-generate").addEventListener("click", () => {
      if (!hasA) return;
      buildOutline();
      state.step = 7;
      render();
    });
    document.getElementById("btn-back-label").addEventListener("click", () => {
      state.step = 5;
      render();
    });
  }

  function renderGenerate() {
    const risky = visibleOutline().some((o) => o.risky);
    els.panel.innerHTML = `
      ${risky ? '<div class="warn-banner">警告：提纲含来源不明条目。这与宁缺毋滥冲突，导出前请谨慎确认。</div>' : ""}
      <div class="outline">
        <h3>考研英语阅读 · 复习提纲（草稿）</h3>
        <ol>
          ${visibleOutline()
            .map(
              (o) => `<li>
                <strong>${o.title}</strong> — ${o.body}
                <span class="cite">出处：${o.cite}${o.risky ? " · 来源不明" : ""}</span>
              </li>`
            )
            .join("")}
        </ol>
      </div>`;

    els.actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-to-export">进入微调与导出</button>
      <button type="button" class="btn btn-ghost" id="btn-back-gate">返回闸门</button>
      <span class="empty-hint">导出按钮在本步禁用；须进入第 8 环确认。</span>`;

    document.getElementById("btn-to-export").addEventListener("click", () => {
      state.step = 8;
      render();
    });
    document.getElementById("btn-back-gate").addEventListener("click", () => {
      state.step = 6;
      render();
    });
  }

  function renderExport() {
    const list = visibleOutline();
    const risky = list.some((o) => o.risky);
    els.panel.innerHTML = `
      ${risky ? '<div class="warn-banner">当前草稿仍含来源不明内容。可以删除对应条目，或返回闸门取消放行。</div>' : ""}
      <div class="outline">
        <h3>考研英语阅读 · 复习提纲</h3>
        <ol>
          ${list
            .map(
              (o) => `<li>
                <strong>${o.title}</strong> — ${o.body}
                <span class="cite">出处：${o.cite}${o.risky ? " · 来源不明" : ""}</span>
                <div class="gate-actions" style="margin-top:0.45rem">
                  <button type="button" class="btn btn-secondary" data-remove="${o.id}">删除此条</button>
                </div>
              </li>`
            )
            .join("")}
        </ol>
      </div>
      ${
        state.exported
          ? '<div class="export-box">已导出（模拟）：考研英语阅读_可信复习提纲.md —— 可交评阅人对照演示闭环。</div>'
          : ""
      }`;

    els.panel.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.removed[btn.dataset.remove] = true;
        state.exportConfirmed = false;
        state.exported = false;
        render();
      });
    });

    const canExport = state.exportConfirmed && list.length > 0;
    els.actions.innerHTML = `
      <label style="display:flex;align-items:center;gap:0.45rem;margin-right:0.4rem;font-size:0.92rem;">
        <input type="checkbox" id="chk-confirm" ${state.exportConfirmed ? "checked" : ""} />
        我确认这套材料可对外使用（必须确认）
      </label>
      <button type="button" class="btn btn-primary" id="btn-export" ${canExport ? "" : "disabled"}>确认并导出</button>
      <button type="button" class="btn btn-ghost" id="btn-back-gen">返回生成</button>
      <button type="button" class="btn btn-secondary" id="btn-docs">查看定位 / 流程 / 评测</button>`;

    document.getElementById("chk-confirm").addEventListener("change", (e) => {
      state.exportConfirmed = e.target.checked;
      state.exported = false;
      render();
    });
    document.getElementById("btn-export").addEventListener("click", () => {
      if (!canExport) return;
      state.exported = true;
      showToast("已模拟导出复习提纲");
      render();
    });
    document.getElementById("btn-back-gen").addEventListener("click", () => {
      state.step = 7;
      render();
    });
    document.getElementById("btn-docs").addEventListener("click", () => switchView("positioning"));
  }

  function render(opts = {}) {
    if (!opts.keepAutoRunning && state.step !== 2 && state.step !== 3 && state.step !== 4) {
      // leave timer alone only while auto bundle running
    }
    renderRail();
    setHeader();

    if (state.step === 1) renderUpload();
    else if (state.step >= 2 && state.step <= 4) renderAutoBundle();
    else if (state.step === 5) renderLabel();
    else if (state.step === 6) renderGate();
    else if (state.step === 7) renderGenerate();
    else renderExport();
  }

  els.navBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  switchView("demo");
  render();
})();
