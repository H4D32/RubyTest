import { pipelineStages } from "../data/content";

const rows = [
  ["1. 汇入", "选择文件 / 聊天导入 / 相册", "学生发起", "系统接收并建原始对象，不改文件"],
  ["2. 解析", "OCR、ASR、文本与页级切片", "系统自动", "失败项进确认：重拍、换文件、标记不可用"],
  ["3. 课程与类型归纳", "课名、章节、课件/真题/笔记/录音", "系统自动（高置信直接落库）", "低置信才出现在确认队列"],
  ["4. 来源评级", "教师/本人/同学/不明", "系统自动打级", "「真题」「重点」等敏感标签必须学生确认"],
  ["5. 对齐与冲突", "同知识点多源对照", "系统自动检出", "冲突条目由学生选择采信源"],
  ["6. 生成复习材料", "提纲、闪卡、真题包", "系统自动，且强制引用", "学生抽查若干条；一键剔除无出处内容"],
  ["7. 共享", "小组可见范围与权限", "学生发起", "系统执行权限；禁止匿名把来源不明资料标成官方"],
];

export default function FlowPage() {
  return (
    <main className="page">
      <div className="kicker">产出物 2 · 处理流程方案</div>
      <h1>从上传到可用复习材料</h1>
      <p className="lede">
        原则：能自动的不打扰；凡是会让学生“不敢用”的判断，必须停下来确认。确认的对象是分类、采信和冲突，而不是让学生给每份文件打标签。
      </p>

      <div className="pipeline" style={{ margin: "24px 0" }}>
        {pipelineStages.map((s) => (
          <div className="pipe" key={s.id}>
            <div className={`pill ${s.actor === "系统自动" ? "auto" : "human"}`}>{s.actor}</div>
            <h3 style={{ margin: "8px 0 4px", fontSize: 16 }}>{s.title}</h3>
            <p>{s.detail}</p>
          </div>
        ))}
      </div>

      <table className="table card">
        <thead>
          <tr>
            <th>环节</th>
            <th>动作</th>
            <th>默认执行者</th>
            <th>学生何时介入</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>确认队列的准入规则</h2>
      <div className="grid-2">
        <article className="card">
          <h3>自动通过（不打扰）</h3>
          <p>置信度 ≥ 0.85，来源为教师或本人，且与已采信课件无冲突。直接进入资料库并允许被引用。</p>
        </article>
        <article className="card">
          <h3>必须确认</h3>
          <p>自称真题但来源非教师；作者不明的“重点”；OCR/ASR 质量差；与课件命题冲突；将被写入默认真习包的新结论。</p>
        </article>
      </div>
    </main>
  );
}
