import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Menu from "./components/Menu/Menu";

import Home from "./pages/Home/Home";
import Work from "./pages/Work/Work";
import Project from "./pages/Project/Project";
import About from "./pages/About/About";
import FAQ from "./pages/FAQ/FAQ";
import Contact from "./pages/Contact/Contact";

import { AnimatePresence } from "framer-motion";
import PostsArchivePage from "./pages/posts/page.jsx";
import PostPage from "./pages/posts/[slug]/page.jsx";
import RandomPage from "./pages/random/page.tsx";
import SearchPage from "./pages/search/page.tsx";
import TagsPage from "./pages/tags/page.tsx";
import TagDetailPage from "./pages/tags/[slug]/page.tsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1400);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Menu />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/work" element={<Work />} />
          <Route path="/sample-project" element={<Project />} />
          <Route path="/posts" element={<PostsArchivePage />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/random" element={<RandomPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tags/:slug" element={<TagDetailPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
