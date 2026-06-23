import { useLayoutEffect } from "react";
import HomePage from "./HomePage.jsx";
import "./home-page-overrides.css";
import { initializeHomePagePreviewVideos } from "./home-page-preview-video.js";

export default function HomePageWithVideo(props) {
  useLayoutEffect(() => initializeHomePagePreviewVideos(), []);

  return <HomePage {...props} />;
}
