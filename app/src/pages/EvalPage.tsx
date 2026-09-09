import { evalGates } from "../data/content";

export default function EvalPage() {
  return (
    <main className="page">
      <div className="kicker">产出物 4 · 评测方案</div>
      <h1>怎样判断整理结果与二创「能用」</h1>
      <p className="lede">
        可用性不是“看起来像复习资料”，而是：覆盖该考的内容、每句话能对回原文、冲突被拦住、学生愿意在下次考试继续用。下列门槛用于决定能否对真实课程放开自动产出。
      </p>

      <h2>评测对象</h2>
      <div className="grid-3">
        <article className="card">
          <h3>整理层</h3>
          <p>课程/类型分类、来源评级、重复件合并、章节聚类是否正确。</p>
        </article>
        <article className="card">
          <h3>采信层</h3>
          <p>低置信是否进确认队列；真题误标；冲突是否检出。</p>
        </article>
        <article className="card">
          <h3>二创层</h3>
          <p>提纲、闪卡、真题讲解是否忠实于引用片段，有无无源句子。</p>
        </article>
      </div>

      <h2>方法</h2>
      <ol>
        <li>
          <strong>金标集：</strong>选 1 门课、30–50 份真实资料（含课件、拍照笔记、录音、聊天导入、来源不明真题）。由助教或教师标注类型、课程、是否官方、关键知识点。
        </li>
        <li>
          <strong>自动指标：</strong>分类准确率、引用可点击且片段匹配、无源句比例、冲突召回。
        </li>
        <li>
          <strong>任务评测：</strong>学生用复习包完成 20 分钟闭卷抽测，对照只用原文件夹的对照组。
        </li>
        <li>
          <strong>弃用测试：</strong>故意混入 3 条与课件矛盾的生成句，看系统是否拦截；若漏到复习包，记为门禁失败。
        </li>
      </ol>

      <h2>投入使用门槛</h2>
      <table className="table card">
        <thead>
          <tr>
            <th>指标</th>
            <th>门槛</th>
            <th>原因</th>
          </tr>
        </thead>
        <tbody>
          {evalGates.map((g) => (
            <tr key={g.metric}>
              <td>{g.metric}</td>
              <td>{g.gate}</td>
              <td>{g.why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>发布规则</h3>
        <p>
          同时满足：高置信分类与可溯源率达标，幻觉与冲突漏检低于阈值，确认负担不超过上限。任一信任指标不达标，只允许“资料库+确认队列”，禁止自动生成默认真习包。人工抽检每周不少于 1 门课的 20 条二创语句。
        </p>
      </div>
    </main>
  );
}
