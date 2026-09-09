(() => {
  const CATALOG = {
    lamp: {
      id: "lamp",
      name: "水母吊灯",
      type: "lamp",
      slot: "ceiling",
      defaults: { color: "#3aa7ff", scale: 100, bright: 115 },
      prompts: ["水母", "吊灯", "发光"],
    },
    sofa: {
      id: "sofa",
      name: "贝壳沙发",
      type: "sofa",
      slot: "wall",
      defaults: { color: "#d9eef7", scale: 100, bright: 100 },
      prompts: ["沙发", "贝壳", "条纹"],
    },
    rug: {
      id: "rug",
      name: "珊瑚地毯",
      type: "rug",
      slot: "floor",
      defaults: { color: "#f2a0b5", scale: 100, bright: 100 },
      prompts: ["地毯", "珊瑚", "粉"],
    },
  };

  const QUICK_ORDER = ["lamp", "sofa", "rug"];

  const state = {
    gold: 120,
    bottles: 2,
    mats: { shell: 5, wood: 3, ore: 2 },
    questAccepted: false,
    questDone: false,
    warehouse: [],
    placed: {},
    scene: "island",
    day: 0,
    editedOnce: false,
    demoEnded: false,
    pendingPlace: null,
    draft: null,
    variant: 0,
    autoIntroDone: false,
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    goldVal: $("goldVal"),
    bottleVal: $("bottleVal"),
    shellVal: $("shellVal"),
    woodVal: $("woodVal"),
    oreVal: $("oreVal"),
    craftBottleHint: $("craftBottleHint"),
    makeProgress: $("makeProgress"),
    placeProgress: $("placeProgress"),
    questTitle: $("questTitle"),
    questStatus: $("questStatus"),
    btnGoRoom: $("btnGoRoom"),
    sceneIsland: $("sceneIsland"),
    sceneRoom: $("sceneRoom"),
    warehouse: $("warehouse"),
    warehouseList: $("warehouseList"),
    placedItems: $("placedItems"),
    annotation: $("annotation"),
    toast: $("toast"),
    npcBang: $("npcBang"),
    islandHint: $("islandHint"),
    npcRoom: $("npcRoom"),
    btnCallNpc: $("btnCallNpc"),
    dialogLayer: $("dialogLayer"),
    dialogText: $("dialogText"),
    dialogActions: $("dialogActions"),
    bottleLayer: $("bottleLayer"),
    craftLayer: $("craftLayer"),
    craftPrompt: $("craftPrompt"),
    genProgress: $("genProgress"),
    genBar: $("genBar"),
    genStep: $("genStep"),
    previewBox: $("previewBox"),
    previewVisual: $("previewVisual"),
    editColor: $("editColor"),
    editScale: $("editScale"),
    editBright: $("editBright"),
    placeLayer: $("placeLayer"),
    placeText: $("placeText"),
    itemMenuLayer: $("itemMenuLayer"),
    itemMenuTitle: $("itemMenuTitle"),
    editPlacedLayer: $("editPlacedLayer"),
    editPlacedVisual: $("editPlacedVisual"),
    placedColor: $("placedColor"),
    placedBright: $("placedBright"),
    dayVeil: $("dayVeil"),
    dayText: $("dayText"),
    endLayer: $("endLayer"),
    annoToggle: $("annoToggle"),
  };

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.add("hidden"), 2400);
  }

  function annotate(html) {
    if (!els.annoToggle.checked) {
      els.annotation.classList.add("hidden");
      return;
    }
    els.annotation.innerHTML = html;
    els.annotation.classList.remove("hidden");
  }

  function hideAnno() {
    els.annotation.classList.add("hidden");
  }

  function syncResources() {
    els.goldVal.textContent = state.gold;
    els.bottleVal.textContent = state.bottles;
    els.shellVal.textContent = state.mats.shell;
    els.woodVal.textContent = state.mats.wood;
    els.oreVal.textContent = state.mats.ore;
    els.craftBottleHint.textContent = state.bottles;
  }

  function madeCount() {
    const ids = new Set([
      ...state.warehouse.map((w) => w.id),
      ...Object.keys(state.placed),
    ]);
    return ["lamp", "sofa", "rug"].filter((id) => ids.has(id)).length;
  }

  function placedCount() {
    return Object.keys(state.placed).length;
  }

  function syncQuest() {
    const m = madeCount();
    const p = placedCount();
    els.makeProgress.textContent = `${m}/3`;
    els.placeProgress.textContent = `${p}/3`;
    if (!state.questAccepted) {
      els.questTitle.textContent = "—";
      els.questStatus.textContent = "未接取";
      els.btnGoRoom.classList.add("hidden");
    } else if (state.questDone) {
      els.questTitle.textContent = "小海的海洋主题生日房间";
      els.questStatus.textContent = "已完成";
      els.btnGoRoom.classList.remove("hidden");
      els.btnGoRoom.textContent = "再次进入房间";
    } else {
      els.questTitle.textContent = "小海的海洋主题生日房间";
      els.questStatus.textContent = "进行中";
      if (m >= 3) {
        els.btnGoRoom.classList.remove("hidden");
        els.btnGoRoom.textContent = "前往布置";
      } else {
        els.btnGoRoom.classList.add("hidden");
      }
    }
    els.btnCallNpc.disabled = !(p >= 3 && !state.questDone);
    els.npcBang.classList.toggle("hidden", state.questAccepted);
  }

  function showScene(name) {
    state.scene = name;
    els.sceneIsland.classList.toggle("hidden", name !== "island");
    els.sceneRoom.classList.toggle("hidden", name !== "room");
    els.warehouse.classList.toggle("hidden", name !== "room");
    if (name === "room") renderWarehouse();
    renderPlaced();
  }

  function openDialog(text, actions) {
    els.dialogText.textContent = text;
    els.dialogActions.innerHTML = "";
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn ${a.primary ? "primary" : ""}`;
      b.textContent = a.label;
      b.onclick = () => {
        els.dialogLayer.classList.add("hidden");
        a.onClick && a.onClick();
      };
      els.dialogActions.appendChild(b);
    });
    els.dialogLayer.classList.remove("hidden");
  }

  function acceptQuest() {
    state.questAccepted = true;
    syncQuest();
    els.islandHint.textContent = "需要 3 个魔力瓶才能做满 3 件——先看看魔力瓶吧";
    annotate("NPC 主动委托给创造目标；命门仍是后续的确认写入与回访一致。");
    toast("已接取委托：制作并布置 3 个海洋风装饰");
    setTimeout(() => {
      openDialog(
        "对了，AI制作要消耗魔力瓶。你好像瓶不太够？点左上角魔力瓶，用材料兑换就行。充值是以后的事啦～",
        [{ label: "去看看魔力瓶", primary: true, onClick: () => openBottle() }]
      );
    }, 400);
  }

  function openBottle() {
    els.bottleLayer.classList.remove("hidden");
  }

  function exchange(type) {
    const rules = {
      shell: { need: 3, key: "shell", label: "贝壳" },
      ore: { need: 2, key: "ore", label: "矿石" },
      wood: { need: 5, key: "wood", label: "木头" },
    };
    const r = rules[type];
    if (state.mats[r.key] < r.need) {
      toast(`${r.label}不足，还需要凑齐 ${r.need} 个`);
      return;
    }
    state.mats[r.key] -= r.need;
    state.bottles += 1;
    syncResources();
    toast(`兑换成功！魔力瓶 ${state.bottles - 1}→${state.bottles}`);
    if (state.bottles >= 3) {
      annotate("瓶数对齐任务：确认采纳才扣瓶。可以开始 AI 制作了。");
      els.islandHint.textContent = "点右上角「AI制作」，先做水母吊灯";
    }
  }

  function openCraft(presetPrompt) {
    if (!state.questAccepted) {
      openDialog("先听听小海要拜托你什么事吧～", [
        { label: "好", primary: true, onClick: () => $("npcIsland").click() },
      ]);
      return;
    }
    els.craftPrompt.value =
      presetPrompt ||
      "海洋主题，水母形状的吊灯，蓝色，会发光";
    els.genProgress.classList.add("hidden");
    els.previewBox.classList.add("hidden");
    state.draft = null;
    syncResources();
    els.craftLayer.classList.remove("hidden");
  }

  function matchCatalog(prompt, preferId) {
    if (preferId && CATALOG[preferId]) return CATALOG[preferId];
    const text = (prompt || "").toLowerCase();
    let best = CATALOG.lamp;
    let score = -1;
    Object.values(CATALOG).forEach((item) => {
      const s = item.prompts.reduce(
        (acc, k) => acc + (text.includes(k) ? 1 : 0),
        0
      );
      if (s > score) {
        score = s;
        best = item;
      }
    });
    // avoid suggesting already owned if possible
    const owned = new Set([
      ...state.warehouse.map((w) => w.id),
      ...Object.keys(state.placed),
    ]);
    if (owned.has(best.id)) {
      const next = QUICK_ORDER.find((id) => !owned.has(id));
      if (next) return CATALOG[next];
    }
    return best;
  }

  function runGenerate(preferId) {
    const item = matchCatalog(els.craftPrompt.value, preferId);
    const steps = ["理解描述…", "生成轮廓…", "填充细节…", "材质渲染…"];
    els.previewBox.classList.add("hidden");
    els.genProgress.classList.remove("hidden");
    els.genBar.style.width = "0%";
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        const variantColor =
          item.id === "lamp"
            ? state.variant % 2 === 0
              ? "#3aa7ff"
              : "#5ad0c8"
            : item.id === "sofa"
              ? state.variant % 2 === 0
                ? "#d9eef7"
                : "#c5e0f5"
              : state.variant % 2 === 0
                ? "#f2a0b5"
                : "#e889a4";
        state.draft = {
          ...item,
          color: variantColor,
          scale: item.defaults.scale,
          bright: item.defaults.bright,
        };
        showDraftPreview();
        els.genProgress.classList.add("hidden");
        annotate("预览阶段：岛上/房间仍无正式物品。放弃或换一个不扣瓶。");
        return;
      }
      els.genStep.textContent = steps[i];
      els.genBar.style.width = `${((i + 1) / steps.length) * 100}%`;
      i += 1;
      setTimeout(tick, 420);
    };
    tick();
  }

  function showDraftPreview() {
    const d = state.draft;
    els.editColor.value = d.color;
    els.editScale.value = d.scale;
    els.editBright.value = d.bright;
    els.previewVisual.innerHTML = "";
    els.previewVisual.appendChild(makeFurnitureEl(d, true));
    els.previewBox.classList.remove("hidden");
  }

  function applyDraftEdits() {
    if (!state.draft) return;
    state.draft.color = els.editColor.value;
    state.draft.scale = Number(els.editScale.value);
    state.draft.bright = Number(els.editBright.value);
    showDraftPreview();
  }

  function makeFurnitureEl(item, preview) {
    const el = document.createElement("div");
    el.className = `furniture ${item.type}`;
    el.style.setProperty("--f-color", item.color);
    el.style.setProperty("--f-scale", item.scale);
    el.style.setProperty("--f-bright", item.bright);
    if (!preview) {
      el.dataset.id = item.id;
      el.title = `${item.name}（点击可编辑）`;
    }
    return el;
  }

  function confirmCraft() {
    if (!state.draft) return;
    if (state.bottles < 1) {
      toast("魔力瓶用完了，可以用材料兑换（充值 Demo 未开放）");
      return;
    }
    const owned = new Set([
      ...state.warehouse.map((w) => w.id),
      ...Object.keys(state.placed),
    ]);
    if (owned.has(state.draft.id)) {
      toast(`已经有${state.draft.name}了，换个描述或用任务推荐做下一件`);
      return;
    }
    state.bottles -= 1;
    state.warehouse.push({
      id: state.draft.id,
      name: state.draft.name,
      type: state.draft.type,
      slot: state.draft.slot,
      color: state.draft.color,
      scale: state.draft.scale,
      bright: state.draft.bright,
    });
    syncResources();
    syncQuest();
    toast(`${state.draft.name}已加入仓库！魔力瓶剩余 ${state.bottles}`);
    annotate("硬门禁①通过：确认采纳才扣瓶并入库。放置前世界外观不变。");
    state.draft = null;
    els.craftLayer.classList.add("hidden");
    if (madeCount() >= 3) {
      els.islandHint.textContent = "三件齐了——去小海房间布置吧";
      setTimeout(() => {
        openDialog("三件海洋风装饰都好了！去我房间布置一下吧～", [
          { label: "前往布置", primary: true, onClick: () => enterRoom() },
          { label: "稍等一下", onClick: () => {} },
        ]);
      }, 350);
    } else if (state.bottles === 0) {
      toast("魔力瓶用完了，可以用材料兑换或稍后再说");
    } else {
      els.islandHint.textContent = `还可制作 ${3 - madeCount()} 件 · 可用「任务推荐」加速`;
    }
  }

  function renderWarehouse() {
    els.warehouseList.innerHTML = "";
    if (!state.warehouse.length) {
      els.warehouseList.innerHTML = `<p class="tiny">仓库空空，先去 AI 制作吧</p>`;
      return;
    }
    state.warehouse.forEach((item) => {
      const row = document.createElement("div");
      row.className = "wh-item";
      row.draggable = true;
      row.innerHTML = `<span class="mini ${item.type}"></span><span>${item.name}<br/><small>拖到${slotLabel(item.slot)}</small></span>`;
      row.addEventListener("dragstart", (e) => {
        row.classList.add("dragging");
        e.dataTransfer.setData("text/plain", item.id);
        document.querySelectorAll(".place-slot").forEach((s) => {
          if (s.dataset.slot === item.slot) s.classList.add("active");
        });
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        document.querySelectorAll(".place-slot").forEach((s) => s.classList.remove("active"));
      });
      els.warehouseList.appendChild(row);
    });
  }

  function slotLabel(slot) {
    return { ceiling: "天花板", wall: "靠墙", floor: "地面" }[slot] || slot;
  }

  function enterRoom() {
    showScene("room");
    hideAnno();
    annotate("硬门禁②：拖到挂点后还要确认「放在这里」，取消则回仓库。");
    els.npcRoom.classList.add("hidden");
  }

  function setupSlots() {
    document.querySelectorAll(".place-slot").forEach((slot) => {
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("active");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("active"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("active");
        const id = e.dataTransfer.getData("text/plain");
        const item = state.warehouse.find((w) => w.id === id);
        if (!item) return;
        if (item.slot !== slot.dataset.slot) {
          toast(`${item.name}更适合放在「${slotLabel(item.slot)}」`);
          return;
        }
        if (state.placed[id]) {
          toast("这件已经放过了");
          return;
        }
        state.pendingPlace = { item, slot: slot.dataset.slot };
        els.placeText.textContent = `把「${item.name}」放在${slotLabel(slot.dataset.slot)}？未确认不会改变房间。`;
        els.placeLayer.classList.remove("hidden");
      });
    });
  }

  function confirmPlace(ok) {
    els.placeLayer.classList.add("hidden");
    if (!ok || !state.pendingPlace) {
      state.pendingPlace = null;
      return;
    }
    const { item, slot } = state.pendingPlace;
    state.warehouse = state.warehouse.filter((w) => w.id !== item.id);
    state.placed[item.id] = { ...item, slot };
    state.pendingPlace = null;
    renderWarehouse();
    renderPlaced();
    syncQuest();
    toast(`${item.name}已放置`);
    if (placedCount() >= 3) {
      annotate("房间已被玩家塑造：空房 → 海洋主题。可以叫小海验收。");
      toast("布置完成！叫小海来验收吧");
    }
  }

  function renderPlaced() {
    els.placedItems.innerHTML = "";
    const pos = {
      ceiling: { top: "10%", left: "42%" },
      wall: { top: "40%", left: "62%" },
      floor: { top: "62%", left: "38%" },
    };
    Object.values(state.placed).forEach((item) => {
      const el = makeFurnitureEl(item, false);
      const p = pos[item.slot];
      el.style.top = p.top;
      el.style.left = p.left;
      if (item.id === "lamp") {
        el.addEventListener("click", () => openItemMenu(item));
      }
      els.placedItems.appendChild(el);
    });
  }

  function callNpc() {
    if (placedCount() < 3) return;
    els.npcRoom.classList.remove("hidden");
    openDialog(
      "哇！！太好看了吧！这就是我想要的海洋主题！水母吊灯还会发光，贝壳沙发好可爱，珊瑚地毯颜色好美！谢谢你！！",
      [
        {
          label: "领取奖励",
          primary: true,
          onClick: () => {
            if (!state.questDone) {
              state.questDone = true;
              state.gold += 200;
              state.mats.shell += 1;
              syncResources();
              syncQuest();
              toast("任务完成！金币 +200，稀有贝壳 +1");
            }
            annotate("世界回应：NPC 验收。下一步才是命门——离开再回访。");
            setTimeout(() => {
              openDialog(
                "我先去跟朋友炫耀一下～你也可以先离开，过一天再来看看房间还在不在哦。",
                [
                  {
                    label: "离开房间（一天后）",
                    primary: true,
                    onClick: () => leaveAndReturn("一天后…", false),
                  },
                  { label: "再看看房间", onClick: () => {} },
                ]
              );
            }, 300);
          },
        },
      ]
    );
  }

  function leaveAndReturn(label, afterEdit) {
    els.dayVeil.classList.remove("hidden", "fade-out");
    els.dayText.textContent = label;
    showScene("room");
    els.npcRoom.classList.add("hidden");
    setTimeout(() => {
      els.dayVeil.classList.add("fade-out");
      state.day += 1;
      setTimeout(() => {
        els.dayVeil.classList.add("hidden");
        renderPlaced();
        const ok =
          placedCount() === 3 &&
          state.placed.lamp &&
          state.placed.sofa &&
          state.placed.rug;
        if (ok) {
          const lamp = state.placed.lamp;
          annotate(
            afterEdit
              ? `✓ 二次编辑后一致性：灯仍为当前色（${lamp.color}）、亮度 ${lamp.bright}，挂点未变。`
              : "✓ 一致性验证通过：物品持久化 3/3、位置准确 3/3、属性保持（颜色/大小/亮度未变）。"
          );
        }
        els.npcRoom.classList.remove("hidden");
        if (!afterEdit) {
          openDialog(
            "你回来啦！你昨天布置的房间我好喜欢！我叫了我朋友来看，她们都夸好看，问我是在哪买的装饰品呢～我跟她们说是我朋友用AI做的，她们都超羡慕！",
            [
              {
                label: "试试改一下吊灯",
                primary: true,
                onClick: () => {
                  annotate("连续编辑：点天花板上的水母吊灯 → 编辑 → 保存，再离开验证。");
                  toast("点击房间里的水母吊灯继续编辑");
                },
              },
            ]
          );
        } else {
          openDialog(
            "哟，你把水母吊灯改成这个颜色了？也挺好看的！你真会折腾～",
            [
              {
                label: "结束演示",
                primary: true,
                onClick: () => {
                  state.demoEnded = true;
                  els.endLayer.classList.remove("hidden");
                },
              },
            ]
          );
        }
      }, 700);
    }, 1600);
  }

  function openItemMenu(item) {
    if (!state.questDone && state.day < 1) {
      toast("先完成验收并回访，再演示连续编辑哦");
      return;
    }
    els.itemMenuTitle.textContent = item.name;
    els.itemMenuLayer.classList.remove("hidden");
    $("btnEditPlaced").onclick = () => {
      els.itemMenuLayer.classList.add("hidden");
      openPlacedEdit(item);
    };
  }

  function openPlacedEdit(item) {
    els.placedColor.value = item.color;
    els.placedBright.value = item.bright;
    els.editPlacedVisual.innerHTML = "";
    els.editPlacedVisual.appendChild(makeFurnitureEl(item, true));
    els.editPlacedLayer.classList.remove("hidden");
    const refresh = () => {
      const draft = {
        ...item,
        color: els.placedColor.value,
        bright: Number(els.placedBright.value),
      };
      els.editPlacedVisual.innerHTML = "";
      els.editPlacedVisual.appendChild(makeFurnitureEl(draft, true));
    };
    els.placedColor.oninput = refresh;
    els.placedBright.oninput = refresh;
    $("btnSavePlacedEdit").onclick = () => {
      state.placed.lamp.color = els.placedColor.value;
      state.placed.lamp.bright = Number(els.placedBright.value);
      state.editedOnce = true;
      els.editPlacedLayer.classList.add("hidden");
      renderPlaced();
      toast("编辑已保存（挂点未变）");
      annotate("已写入新状态。再离开一天，验证二次编辑也能被记住。");
      setTimeout(() => {
        openDialog("改好了？那……我们再过一天看看它还在不在？", [
          {
            label: "离开（又一天后）",
            primary: true,
            onClick: () => leaveAndReturn("又一天后…", true),
          },
        ]);
      }, 350);
    };
  }

  function resetAll() {
    Object.assign(state, {
      gold: 120,
      bottles: 2,
      mats: { shell: 5, wood: 3, ore: 2 },
      questAccepted: false,
      questDone: false,
      warehouse: [],
      placed: {},
      scene: "island",
      day: 0,
      editedOnce: false,
      demoEnded: false,
      pendingPlace: null,
      draft: null,
      variant: 0,
      autoIntroDone: true,
    });
    els.endLayer.classList.add("hidden");
    showScene("island");
    syncResources();
    syncQuest();
    hideAnno();
    els.islandHint.textContent = "小海似乎有事找你…";
    els.npcRoom.classList.add("hidden");
    setTimeout(intro, 400);
  }

  function intro() {
    openDialog(
      "太好了你来了！下周是我的生日，我想把我的房间布置成海洋主题！你能帮我用AI做3个海洋风的装饰品吗？做好了我给你200金币和稀有材料！",
      [
        { label: "没问题，交给我", primary: true, onClick: acceptQuest },
        {
          label: "稍等一下",
          onClick: () => {
            els.islandHint.textContent = "点小海或感叹号可重新接委托";
          },
        },
      ]
    );
  }

  // events
  $("npcIsland").addEventListener("click", () => {
    if (state.questDone) {
      openDialog("房间我超喜欢！你随时可以再进去看看～", [
        { label: "进入房间", primary: true, onClick: enterRoom },
        { label: "好", onClick: () => {} },
      ]);
      return;
    }
    if (state.questAccepted) {
      openDialog("海洋主题哦～做完三件就来我房间布置！魔力瓶不够就兑换。", [
        { label: "去制作", primary: true, onClick: () => openCraft() },
        { label: "看魔力瓶", onClick: openBottle },
      ]);
      return;
    }
    intro();
  });

  $("btnBottle").addEventListener("click", openBottle);
  $("closeBottle").addEventListener("click", () => els.bottleLayer.classList.add("hidden"));
  document.querySelectorAll(".ex-card").forEach((btn) => {
    btn.addEventListener("click", () => exchange(btn.dataset.ex));
  });

  $("btnCraft").addEventListener("click", () => openCraft());
  $("closeCraft").addEventListener("click", () => els.craftLayer.classList.add("hidden"));
  $("btnGenerate").addEventListener("click", () => runGenerate());
  $("btnQuick").addEventListener("click", () => {
    const owned = new Set([
      ...state.warehouse.map((w) => w.id),
      ...Object.keys(state.placed),
    ]);
    const next = QUICK_ORDER.find((id) => !owned.has(id));
    if (!next) {
      toast("三件都有了，去布置吧");
      return;
    }
    const item = CATALOG[next];
    els.craftPrompt.value = `海洋主题，${item.name}`;
    runGenerate(next);
  });
  $("btnRegen").addEventListener("click", () => {
    state.variant += 1;
    runGenerate(state.draft && state.draft.id);
  });
  $("btnAbort").addEventListener("click", () => {
    state.draft = null;
    els.previewBox.classList.add("hidden");
    toast("已放弃，未扣魔力瓶，世界未写入");
    annotate("支线：未确认不进世界。");
  });
  $("btnConfirmCraft").addEventListener("click", confirmCraft);
  ["editColor", "editScale", "editBright"].forEach((id) => {
    $(id).addEventListener("input", applyDraftEdits);
  });

  $("btnGoRoom").addEventListener("click", enterRoom);
  $("btnBackIsland").addEventListener("click", () => showScene("island"));
  $("btnCallNpc").addEventListener("click", callNpc);
  $("btnLeaveDay").addEventListener("click", () => {
    if (placedCount() < 3) {
      toast("先把三件都放好，回访才有对照");
      return;
    }
    if (!state.questDone) {
      toast("建议先叫小海验收，再演示隔天回访");
      return;
    }
    leaveAndReturn(state.editedOnce ? "又一天后…" : "一天后…", state.editedOnce);
  });

  $("btnPlaceCancel").addEventListener("click", () => confirmPlace(false));
  $("btnPlaceOk").addEventListener("click", () => confirmPlace(true));
  $("closeItemMenu").addEventListener("click", () => els.itemMenuLayer.classList.add("hidden"));
  $("closeEditPlaced").addEventListener("click", () => els.editPlacedLayer.classList.add("hidden"));
  $("btnCancelPlacedEdit").addEventListener("click", () => els.editPlacedLayer.classList.add("hidden"));
  $("btnRestart").addEventListener("click", resetAll);
  els.annoToggle.addEventListener("change", () => {
    if (!els.annoToggle.checked) hideAnno();
  });

  setupSlots();
  syncResources();
  syncQuest();
  showScene("island");
  setTimeout(intro, 600);
})();
