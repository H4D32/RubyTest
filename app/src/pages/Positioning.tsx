export default function Positioning() {
  return (
    <main className="page">
      <div className="kicker">产出物 1 · 产品定位说明</div>
      <h1>溯知：面向考前可用的资料消费产品</h1>
      <p className="lede">
        这份说明可独立阅读。判断标准写在前面：如果整理结果不能回溯到原始课件或笔记，学生会整套弃用——因此溯源不是附加功能，而是产品能否成立的条件。
      </p>

      <h2>1. 要解决的核心问题</h2>
      <div className="card">
        <p>
          大学生持续积累课件、真题、笔记、录音，但这些对象分散在相册、聊天记录和网盘中，彼此没有课程结构，也没有可信标记。临近考试，真正昂贵的不是“没有文件”，而是：
        </p>
        <ul>
          <li>找不到、找不全，复习范围被遗漏；</li>
          <li>不愿为每份文件分类打标，期望系统自己整理；</li>
          <li>来源不清的“真题”和学长笔记不敢采信；</li>
          <li>一旦 AI 整理稿与原课件不一致，会放弃整套结果。</li>
        </ul>
        <p>
          <strong>一句话：</strong>在学生不主动归档的前提下，把多源、可信度不一的原始资料，变成可追溯、可核对、可复习的材料，并让学生的注意力只花在“不确定是否该信”的节点上。
        </p>
      </div>

      <h2>2. 非问题（避免做错产品）</h2>
      <div className="grid-3">
        <article className="card">
          <h3>不是云存储</h3>
          <p>网盘已经解决存放。再做一个文件夹树，不会改变考前翻找的成本。</p>
        </article>
        <article className="card">
          <h3>不是通用聊天摘要</h3>
          <p>无出处的漂亮提纲会触发弃用。生成必须带着原文锚点，冲突必须显式暴露。</p>
        </article>
        <article className="card">
          <h3>不是强迫打标签</h3>
          <p>学生不会维护标签体系。自动处理是默认路径，确认只用于低置信与冲突。</p>
        </article>
      </div>

      <h2>3. 成立判断依据</h2>
      <table className="table card" style={{ padding: 8 }}>
        <thead>
          <tr>
            <th>判据</th>
            <th>观察信号</th>
            <th>成立条件</th>
            <th>不成立信号</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>痛点真实且反复</td>
            <td>考季集中整理、多源导入、遗漏焦虑</td>
            <td>用户在考前 2–3 周有明确整理任务</td>
            <td>资料本就集中在一个课程文件夹且已分类</td>
          </tr>
          <tr>
            <td>行为约束</td>
            <td>上传后不打标</td>
            <td>自动分类覆盖大部分文件</td>
            <td>确认次数 ≈ 手工归档次数</td>
          </tr>
          <tr>
            <td>信任悬崖</td>
            <td>对不上原文即弃用</td>
            <td>每条复习语句可点回原文；冲突被拦截</td>
            <td>幻觉、张冠李戴、无法核对</td>
          </tr>
          <tr>
            <td>能力匹配</td>
            <td>平台已有多模态理解与协作</td>
            <td>OCR/ASR/抽取足够支撑页级引用</td>
            <td>解析失败率高，确认队列爆满</td>
          </tr>
          <tr>
            <td>替代缺口</td>
            <td>网盘、聊天、通用大模型并用仍费劲</td>
            <td>一条链路覆盖汇入→整理→采信→二创</td>
            <td>用户觉得“直接丢给 ChatGPT 更快且差不多”</td>
          </tr>
        </tbody>
      </table>

      <h2>4. 产品主张与边界</h2>
      <div className="split">
        <article className="card">
          <h3>主张</h3>
          <p>
            高置信自动落库；低置信、来源不明、跨资料冲突必须停下来让学生点头或排除。复习包（提纲、闪卡、真题演练）默认带出处。协作共享时，原始文件与二创产物权限分离。
          </p>
        </article>
        <article className="card">
          <h3>边界</h3>
          <p>
            不做无来源的“押题神器”。不把学长笔记自动升格为真题。不在学生未确认前，把冲突内容写进默认真习包。
          </p>
        </article>
      </div>
    </main>
  );
}
