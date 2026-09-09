export type FileKind = "课件" | "真题" | "笔记" | "录音" | "导入";
export type Actor = "系统自动" | "学生确认" | "学生发起";

export type Material = {
  id: string;
  name: string;
  kind: FileKind;
  source: string;
  confidence: number;
  needsConfirm: boolean;
  excerpt: string;
  status: "inbox" | "parsed" | "classified" | "confirmed";
};

export const sampleMaterials: Material[] = [
  {
    id: "m1",
    name: "OS-第5章-进程调度.pdf",
    kind: "课件",
    source: "课程群 · 教师账号上传",
    confidence: 0.97,
    needsConfirm: false,
    excerpt: "时间片轮转（RR）的时间片长度由系统设计决定，过短增加切换开销，过长退化为 FCFS。",
    status: "inbox",
  },
  {
    id: "m2",
    name: "OS-第6章-死锁与银行家算法.pptx",
    kind: "课件",
    source: "教师课堂投屏导出",
    confidence: 0.96,
    needsConfirm: false,
    excerpt: "银行家算法：先检测是否处于安全状态，再决定是否分配资源。",
    status: "inbox",
  },
  {
    id: "m3",
    name: "2024-11-12-课堂板书.jpg",
    kind: "笔记",
    source: "手机相册 · OCR",
    confidence: 0.91,
    needsConfirm: false,
    excerpt: "抢占式 / 非抢占式；SJF 可能饥饿；多级反馈队列兼顾响应与吞吐。",
    status: "inbox",
  },
  {
    id: "m4",
    name: "答疑-银行家算法.m4a",
    kind: "录音",
    source: "课堂录音 · 语音转写",
    confidence: 0.88,
    needsConfirm: false,
    excerpt: "老师强调：安全序列存在不等于当前已死锁，只说明存在一种不会死锁的分配顺序。",
    status: "inbox",
  },
  {
    id: "m5",
    name: "学长-2022期末真题.pdf",
    kind: "真题",
    source: "学长网盘转发 · 来源待核",
    confidence: 0.62,
    needsConfirm: true,
    excerpt: "简答：比较 RR 与多级反馈队列。计算：写出一个安全序列。",
    status: "inbox",
  },
  {
    id: "m6",
    name: "微信群-重点整理.docx",
    kind: "导入",
    source: "聊天记录导入 · 作者不明",
    confidence: 0.41,
    needsConfirm: true,
    excerpt: "RR 时间片一般是 100ms；银行家算法考试必考计算题。",
    status: "inbox",
  },
  {
    id: "m7",
    name: "我的期末提纲.md",
    kind: "笔记",
    source: "本人笔记",
    confidence: 0.99,
    needsConfirm: false,
    excerpt: "要会画甘特图；死锁四个必要条件；银行家算法步骤。",
    status: "inbox",
  },
];

export const pipelineStages = [
  { id: "ingest", title: "汇入", actor: "学生发起" as Actor, detail: "本地上传 / 聊天导入 / 相册 / 网盘" },
  { id: "parse", title: "解析", actor: "系统自动" as Actor, detail: "OCR、ASR、文本抽取、页级切片" },
  { id: "organize", title: "整理", actor: "系统自动" as Actor, detail: "课程、题型、知识点聚类与去重" },
  { id: "trust", title: "采信", actor: "学生确认" as Actor, detail: "低置信分类、来源不明、原文冲突" },
  { id: "produce", title: "产出", actor: "系统自动" as Actor, detail: "提纲 / 闪卡 / 真题包，全部带原文锚点" },
];

export const outline = [
  {
    title: "进程调度",
    bullets: [
      {
        text: "RR 的时间片由系统设计，过短增加上下文切换，过长近似 FCFS。",
        source: "OS-第5章-进程调度.pdf p.12",
        quote: "时间片长度由系统设计决定，过短增加切换开销，过长退化为 FCFS。",
      },
      {
        text: "SJF 平均等待短，但对长作业可能饥饿；多级反馈队列用反馈避免单一策略失衡。",
        source: "2024-11-12-课堂板书.jpg OCR",
        quote: "SJF 可能饥饿；多级反馈队列兼顾响应与吞吐。",
      },
    ],
  },
  {
    title: "死锁与银行家算法",
    bullets: [
      {
        text: "分配前先判断完成后是否仍存在安全序列，而不是只看当前是否已死锁。",
        source: "OS-第6章-死锁与银行家算法.pptx p.7 · 答疑录音 03:12",
        quote: "安全序列存在不等于当前已死锁，只说明存在一种不会死锁的分配顺序。",
      },
    ],
  },
];

export const flashcards = [
  {
    q: "为什么 RR 时间片不能任意取很小？",
    a: "过小会使上下文切换开销占比过高，有效计算时间下降。",
    source: "课件 Ch5 p.12",
  },
  {
    q: "银行家算法通过什么来决定能否分配？",
    a: "模拟分配后是否仍处于安全状态（存在安全序列）。",
    source: "课件 Ch6 p.7 + 答疑录音",
  },
  {
    q: "SJF 的主要风险是什么？",
    a: "长作业可能饥饿。",
    source: "课堂板书 OCR",
  },
];

export const conflict = {
  claim: "微信群笔记写「RR 时间片一般是 100ms」。",
  original: "教师课件写「时间片长度由系统设计决定」，未给出 100ms 这一常数量。",
  action: "默认不把 100ms 写入复习包；标记为未采信传言，待学生选择。",
};

export const evalGates = [
  { metric: "高置信自动分类准确率", gate: "≥ 90%", why: "否则确认队列会退化成手工归档" },
  { metric: "生成条目可溯源率", gate: "≥ 95%", why: "对不上原文会整套弃用" },
  { metric: "无源幻觉率", gate: "< 5%", why: "信任悬崖的直接指标" },
  { metric: "冲突漏检率", gate: "< 10%", why: "与课件矛盾的句子必须被拦住" },
  { metric: "确认负担", gate: "每 20 份资料 ≤ 5 次确认，单次 < 20s", why: "学生本来就不会主动打标签" },
  { metric: "到可用复习包时长", gate: "含确认 < 15 分钟", why: "考前场景必须快" },
  { metric: "采信意愿", gate: "任务后 ≥ 70% 表示会用于下次考试", why: "可用性的主观门槛" },
];
