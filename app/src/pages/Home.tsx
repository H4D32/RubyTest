import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="kicker">产品定位说明</div>
        <h1>把散落的资料，变成可采信的复习材料。</h1>
        <p className="lede">
          溯知不是又一个网盘，也不是“丢进去就出摘要”的生成器。它解决的是大学生在考前无法低成本地把相册、聊天、网盘里的课件、真题、笔记和录音，整理成<strong>对得上原文、敢拿来背</strong>的复习包。
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Link className="btn" to="/demo">
            开始演示：上传 → 复习包
          </Link>
          <Link className="btn ghost" to="/positioning">
            阅读完整定位
          </Link>
        </div>
      </section>

      <section className="cards" style={{ marginTop: 36 }}>
        <article className="card">
          <h3>核心问题</h3>
          <p>
            资料已经有了，缺的是一条可信链路：自动整理、标出来源、拦住冲突，再产出带原文锚点的提纲和闪卡。
          </p>
        </article>
        <article className="card">
          <h3>成立与否</h3>
          <p>
            成立的前提是：高置信工作全自动，学生只确认“不敢信”的少数项；一旦产出与原文对不上，产品失败。
          </p>
        </article>
        <article className="card">
          <h3>这次演示</h3>
          <p>
            用《操作系统》期末资料走完汇入、解析、确认冲突、生成复习包、小组共享。全程可点。
          </p>
        </article>
      </section>
    </main>
  );
}
