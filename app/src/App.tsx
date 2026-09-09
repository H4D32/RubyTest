import { NavLink, Route, Routes } from "react-router-dom";
import Demo from "./pages/Demo";
import EvalPage from "./pages/EvalPage";
import FlowPage from "./pages/FlowPage";
import Home from "./pages/Home";
import Positioning from "./pages/Positioning";
import Sharing from "./pages/Sharing";

const links = [
  ["/", "定位"],
  ["/flow", "流程"],
  ["/demo", "演示"],
  ["/eval", "评测"],
  ["/sharing", "协作"],
] as const;

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="mark">溯</span>
          溯知
        </NavLink>
        <nav className="nav">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/positioning" element={<Positioning />} />
        <Route path="/flow" element={<FlowPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/eval" element={<EvalPage />} />
        <Route path="/sharing" element={<Sharing />} />
      </Routes>
      <footer className="note">溯知原型 · 面向大学生学习资料管理 · 演示数据为《操作系统》期末复习场景</footer>
    </div>
  );
}
