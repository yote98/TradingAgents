"use client";

import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";
import { useTheme } from "@crayonai/react-ui/ThemeProvider";

const theme = {
  "chatContainerBg": "#0a1f1c",
  "chatAssistantResponseBg": "#0f2d28",
  "chatAssistantResponseText": "#e2e8f0",
  "chatUserResponseBg": "#14b8a6",
  "chatUserResponseText": "#ffffff",
  "primaryText": "#e2e8f0",
  "secondaryText": "#94a3b8",
  "interactiveAccent": "#14b8a6",
  "strokeDefault": "#1a4d44",
};

const darkTheme = theme;

const ChatInternal = () => {
  const { portalThemeClassName } = useTheme();

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <C1Chat apiUrl="/api/c1-chat" disableThemeProvider />
    </div>
  );
};

export default function C1ChatSection() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ThemeProvider theme={theme} darkTheme={darkTheme} mode="dark">
        <ChatInternal />
      </ThemeProvider>
    </div>
  );
}
