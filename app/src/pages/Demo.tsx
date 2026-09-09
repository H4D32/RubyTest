import { useMemo, useState } from "react";
import {
  conflict,
  flashcards,
  outline,
  pipelineStages,
  sampleMaterials,
  type Material,
} from "../data/content";

type Step = 0 | 1 | 2 | 3 | 4 | 5;
const labels = ["汇入资料", "自动解析整理", "确认不确定项", "核对冲突", "生成复习包", "小组共享"];

export default function Demo() {
  const [step, setStep] = useState<Step>(0);
  const [files, setFiles] = useState<Material[]>([]);
  const [progress, setProgress] = useState(0);
  const [trueExam, setTrueExam] = useState<"" | "official" | "unverified">("");
  const [includeChat, setIncludeChat] = useState<"" | "exclude" | "footnote">("");
  const [conflictChoice, setConflictChoice] = useState<"" | "courseware" | "chat">("");
  const [published, setPublished] = useState(false);
  const [role, setRole] = useState("只读成员");

  const loaded = files.length > 0;
  const confirmReady = trueExam !== "" && includeChat !== "";
  const conflictReady = conflictChoice !== "";
  const packFaithful = conflictChoice === "courseware";

  const canNext = useMemo(() => {
    if (step === 0) return loaded;
    if (step === 1) return progress >= 100;
    if (step === 2) return confirmReady;
    if (step === 3) return conflictReady;
    return true;
  }, [step, loaded, progress, confirmReady, conflictReady]);

  function loadSamples() {
    setFiles(sampleMaterials.map((m) => ({ ...m, status: "inbox" })));
  }

  function addLocal(list: FileList | null) {
    if (!list?.length) return;
    const extra: Material[] = Array.from(list).map((f, i) => ({
      id: `u${Date.now()}-${i}`,
      name: f.name,
      kind: "导入",
      source: "本地上传",
      confidence: 0.7,
      needsConfirm: true,
      excerpt: "已接收原文件，演示中按学生补充资料处理。",
      status: "inbox",
    }));
    setFiles((prev) => [...prev, ...extra]);
  }

  function runPipeline() {
    setStep(1);
    setProgress(12);
    const timers = [28, 46, 67, 88, 100];
    timers.forEach((p, i) => {
      window.setTimeout(() => {
        setProgress(p);
        setFiles((prev) =>
          prev.map((m) => ({
            ...m,
            status: p < 50 ? "parsed" : p < 90 ? "classified" : "confirmed",
          })),
        );
      }, 450 * (i + 1));
    });
  }

  return (
    <main className="page page-wide">
      <div className="kicker">产出物 3 · 可交互原型</div>
      <h1>一次完整路径：上传到可用复习材料</h1>
      <p className="lede">课程：《操作系统》期末。请按步骤操作。不确定的真题、来源不明笔记、与课件冲突的句子会被拦住，不会悄悄写进复习包。</p>

      <div className="steps">
        {labels.map((l, i) => (
          <div key={l} className={`step ${i === step ? "now" : i < step ? "done" : ""}`}>
            {i + 1}. {l}
          </div>
        ))}
      </div>

      {step === 0 && (
        <section className="grid-2">
          <div className="dropzone">
            <h3 className="serif" style={{ marginTop: 0 }}>
              把资料丢进来即可，不必先分类
            </h3>
            <p>支持课件、试卷、笔记照片、录音、聊天导入。演示可一键载入期末备考包。</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              <button className="btn" onClick={loadSamples} type="button">
                载入示例资料（7 份）
              </button>
              <label className="btn ghost">
                选择本地文件
                <input type="file" multiple hidden onChange={(e) => addLocal(e.target.files)} />
              </label>
            </div>
            <div className="file-list">
              {files.map((f) => (
                <div className="file-row" key={f.id}>
                  <div className="file-ico">{f.kind}</div>
                  <div>
                    <strong>{f.name}</strong>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>{f.source}</div>
                  </div>
                  <span className="pill">未整理</span>
                </div>
              ))}
            </div>
          </div>
          <aside className="card">
            <h3>系统此刻不会做的事</h3>
            <p>不会要求你给每份文件打标签，不会把微信群里的“真题”直接标成官方试卷。</p>
            <p style={{ marginTop: 12 }}>下一步将自动解析与归类，只有低置信项会回来问你。</p>
            <button className="btn" style={{ marginTop: 18 }} disabled={!loaded} onClick={runPipeline} type="button">
              开始自动整理
            </button>
          </aside>
        </section>
      )}

      {step === 1 && (
        <section>
          <div className="pipeline">
            {pipelineStages.slice(0, 4).map((s, i) => {
              const active = progress > i * 25 && progress < 100;
              const done = progress >= (i + 1) * 25 || progress >= 100;
              return (
                <div className={`pipe ${done ? "done" : ""} ${active ? "active" : ""}`} key={s.id}>
                  <div className="pill auto">{s.actor}</div>
                  <strong>{s.title}</strong>
                  <div className="bar">
                    <i />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="file-list" style={{ marginTop: 16 }}>
            {files.map((f) => (
              <div className="file-row" key={f.id}>
                <div className="file-ico">{f.kind}</div>
                <div>
                  <strong>{f.name}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    置信 {(f.confidence * 100).toFixed(0)}% · {f.excerpt}
                  </div>
                </div>
                <span className={`pill ${f.needsConfirm ? "warn" : "ok"}`}>
                  {progress < 100 ? "处理中" : f.needsConfirm ? "待确认" : "已自动落库"}
                </span>
              </div>
            ))}
          </div>
          <button className="btn" style={{ marginTop: 16 }} disabled={progress < 100} onClick={() => setStep(2)} type="button">
            去确认不确定项（2 项）
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="split">
          <article className="card">
            <span className="pill warn">必须确认 · 自称真题</span>
            <h3>学长-2022期末真题.pdf</h3>
            <p>来源是网盘转发，不是教师账号。系统拒绝自动标为官方真题。</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button className={`btn ${trueExam === "unverified" ? "" : "ghost"}`} type="button" onClick={() => setTrueExam("unverified")}>
                作未核验练习
              </button>
              <button className={`btn ${trueExam === "official" ? "clay" : "ghost"}`} type="button" onClick={() => setTrueExam("official")}>
                我确认是当年试卷
              </button>
            </div>
          </article>
          <article className="card">
            <span className="pill warn">必须确认 · 作者不明</span>
            <h3>微信群-重点整理.docx</h3>
            <p>聊天导入，作者不明，且含具体时间片数值。默认不进入提纲正文。</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button className={`btn ${includeChat === "exclude" ? "" : "ghost"}`} type="button" onClick={() => setIncludeChat("exclude")}>
                不采信，仅存档
              </button>
              <button className={`btn ${includeChat === "footnote" ? "" : "ghost"}`} type="button" onClick={() => setIncludeChat("footnote")}>
                仅作脚注参考
              </button>
            </div>
          </article>
          <button className="btn" disabled={!confirmReady} onClick={() => setStep(3)} type="button">
            下一步：核对冲突
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="conflict">
          <span className="pill warn">冲突拦截</span>
          <h3>{conflict.claim}</h3>
          <div className="split" style={{ marginTop: 12 }}>
            <div>
              <div className="kicker">课件原文</div>
              <div className="quote">{conflict.original}</div>
            </div>
            <div>
              <div className="kicker">系统建议</div>
              <p>{conflict.action}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button className={`btn ${conflictChoice === "courseware" ? "" : "ghost"}`} type="button" onClick={() => setConflictChoice("courseware")}>
              采信课件，不写 100ms
            </button>
            <button className={`btn ${conflictChoice === "chat" ? "clay" : "ghost"}`} type="button" onClick={() => setConflictChoice("chat")}>
              仍采用群笔记说法
            </button>
          </div>
          {conflictChoice === "chat" && (
            <p style={{ marginTop: 12 }}>该选择会降低复习包采信分，评测门禁将标记为“高风险产出”，默认不建议发布给小组。</p>
          )}
          <button className="btn" style={{ marginTop: 16 }} disabled={!conflictReady} onClick={() => setStep(4)} type="button">
            生成复习包
          </button>
        </section>
      )}

      {step === 4 && (
        <section className="grid-2">
          <div>
            <div className="card" style={{ marginBottom: 12 }}>
              <span className={`pill ${packFaithful ? "ok" : "warn"}`}>{packFaithful ? "可发布 · 已对齐课件" : "高风险 · 含未对齐说法"}</span>
              <h3>期末复习提纲</h3>
              {outline.map((sec) => (
                <div key={sec.title} style={{ marginTop: 12 }}>
                  <strong>{sec.title}</strong>
                  {sec.bullets.map((b) => (
                    <div key={b.text} style={{ marginTop: 8 }}>
                      <div>{b.text}</div>
                      <div className="quote">
                        {b.source}：{b.quote}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {conflictChoice === "chat" && (
                <div className="quote" style={{ marginTop: 12, borderLeftColor: "var(--clay)" }}>
                  额外写入（来自微信群，与课件不完全一致）：RR 时间片一般是 100ms。
                </div>
              )}
              {includeChat === "footnote" && packFaithful && (
                <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>脚注：群笔记提到常见时间片经验值，未写入正文。</p>
              )}
            </div>
          </div>
          <div>
            <div className="flash">
              {flashcards.map((c) => (
                <article className="flash-card" key={c.q}>
                  <strong>{c.q}</strong>
                  <div className="back">{c.a}</div>
                  <span className="pill ok">{c.source}</span>
                </article>
              ))}
            </div>
            <button className="btn" style={{ marginTop: 16 }} onClick={() => setStep(5)} type="button">
              共享给考研小组
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="share-grid">
          <article className="card">
            <h3>操作系统期末小组</h3>
            <p>发布对象：已采信复习包。未核验真题对只读成员显示警告徽章。</p>
            <p style={{ margin: "12px 0" }}>
              真题状态：{trueExam === "official" ? "你已声明为当年试卷" : "未核验练习"}
            </p>
            <label>
              以谁的身份预览：{" "}
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>只读成员</option>
                <option>贡献者</option>
                <option>整理员</option>
              </select>
            </label>
            <div style={{ marginTop: 16 }}>
              <button className="btn" type="button" onClick={() => setPublished(true)} disabled={!packFaithful && role === "只读成员"}>
                {packFaithful ? "发布只读复习包" : "高风险包仅整理员可发"}
              </button>
            </div>
            {published && (
              <p style={{ marginTop: 12 }}>已发布。只读成员可看提纲与闪卡及出处；不能把未核验文件改标为官方真题。</p>
            )}
          </article>
          <article className="card">
            <h3>这次演示证明了什么</h3>
            <p>学生没有给 7 份资料打标签。系统自动处理高置信课件与本人笔记；把真题来源和冲突留给确认；复习包每条都能回到原文。</p>
            <button className="btn ghost" style={{ marginTop: 16 }} type="button" onClick={() => window.location.reload()}>
              再走一遍
            </button>
          </article>
        </section>
      )}

      {step > 0 && step < 5 && (
        <div style={{ marginTop: 20 }}>
          <button className="btn ghost" type="button" onClick={() => setStep((s) => (s - 1) as Step)} disabled={!canNext && step !== 1}>
            上一步
          </button>
        </div>
      )}
    </main>
  );
}
