export default function Sharing() {
  return (
    <main className="page">
      <div className="kicker">加分项 · 协作共享与权限</div>
      <h1>小组能共用资料，但不能共用误信</h1>
      <p className="lede">
        考研组队和课程小组需要共享课件与复习包，同时必须防止把来源不明的“真题”扩散成官方材料。权限按对象分层：原始文件、确认状态、二创产物分开授权。
      </p>

      <div className="grid-2">
        <article className="card">
          <h3>角色</h3>
          <p>
            <strong>拥有者</strong>：课程空间、成员与外发。
            <br />
            <strong>整理员</strong>：确认分类、采信冲突、生成复习包。
            <br />
            <strong>贡献者</strong>：上传自己的笔记/录音，不能改他人来源评级。
            <br />
            <strong>只读成员</strong>：消费已采信复习包，可看到出处但不能改。
          </p>
        </article>
        <article className="card">
          <h3>对象级规则</h3>
          <p>
            教师来源课件默认组内只读。本人笔记默认私有，可一键贡献。来源不明对象共享时强制带“未核验”徽章，禁止被整理员以外的人标成真题。二创复习包继承其引用源的最低可见范围。
          </p>
        </article>
      </div>

      <h2>扩散控制</h2>
      <table className="table card">
        <thead>
          <tr>
            <th>动作</th>
            <th>允许</th>
            <th>系统强制</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>分享复习包链接</td>
            <td>只读成员可阅读已发布版本</td>
            <td>每条保留上传者与引用文件，外链默认 14 天过期</td>
          </tr>
          <tr>
            <td>转存到另一小组</td>
            <td>拥有者或整理员</td>
            <td>未核验真题不能去掉警告；冲突决议不自动带入新组</td>
          </tr>
          <tr>
            <td>共同编辑提纲</td>
            <td>整理员</td>
            <td>删除引用锚点的编辑会被拒绝或降为个人批注</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
