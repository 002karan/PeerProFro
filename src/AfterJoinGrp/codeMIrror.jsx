import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "../Features/counter/createGroup";
import { fetchUserProfile } from "../Features/counter/getProfile";
import { runCode, stopCode } from "../Features/counter/coderunnerSlice";
import styled from "styled-components";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import {socket} from '../socketHandler/socketHandler'
import { io } from "socket.io-client";

class CustomAwareness {
  constructor(socket) {
    this.socket = socket;
    this.clientId = socket.id || Math.random().toString(36).substring(2);
    this.states = new Map();
    this.listeners = [];
    this.localState = {};
  }

  setLocalStateField(field, value) {
    this.localState[field] = value;
    if (this.socket?.connected) {
      this.socket.emit("awareness-update", {
        clientId: this.clientId,
        state: this.localState,
      });
    }
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    return this.states;
  }

  on(event, callback) {
    if (event === "change") {
      this.listeners.push(callback);
    }
  }

  off(event, callback) {
    if (event === "change") {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    }
  }

  emitChange() {
    this.listeners.forEach((callback) => callback());
  }

  updateStates(updates) {
    updates.forEach(({ clientId, state }) => {
      if (clientId !== this.clientId) {
        this.states.set(clientId, state);
      }
    });
    this.emitChange();
  }
}

const CodeEditor = ({isEditorVisible}) => {
  const socket = io(import.meta.env.VITE_SERVER_BASE_URL,{
    transports: ['websocket', 'polling'],
    withCredentials: true,   // Ensure WebSocket is attempted first
  });
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const dispatch = useDispatch();
  const { output, isLoading, error } = useSelector((state) => state.codeexecution);
  const [code, setCode] = useState("// Start typing your code here...");
  const ydocRef = useRef(new Y.Doc());
  const awarenessRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const socketRef = useRef(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const controllerRef = useRef(null);
  const [cursors, setCursors] = useState({});
  const handleEditorChange = (value) => setCode(value);
  const { profile } = useSelector((state) => state.user);
  const groupsState = useSelector((state) => state.group);
  const groupId = useSelector((state) => state.passingGroupId.groupId);

  const userColor = `hsl(${Math.random() * 360}, 100%, 70%)`;

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    socketRef.current = socket;
    awarenessRef.current = new CustomAwareness(socketRef.current);

    // Set only cursor information, no username
    awarenessRef.current.setLocalStateField("cursor", null);

    socketRef.current.on("connect", () => {
      console.log("Connected with ID:", socketRef.current.id);
      if (groupId != null) {
        socketRef.current.emit("joinroom", groupId);
        console.log("Emitted joinroom with groupId:", groupId);
      }
    });

    socketRef.current.on("reconnect", (attempt) => {
      socketRef.current.emit("joinroom", groupId);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socketRef.current.on("init-doc", (data) => {
      try {
        Y.applyUpdate(ydocRef.current, new Uint8Array(data));
      } catch (error) {
        console.error("Failed to apply initial document update:", error);
      }
    });

    socketRef.current.on("update-doc", ({ update }) => {
      Y.applyUpdate(ydocRef.current, new Uint8Array(update));
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        const currentValue = model.getValue();
        const newValue = ydocRef.current.getText("monaco").toString();
        if (currentValue !== newValue) {
          editorRef.current.executeEdits("remote-update", [
            { range: model.getFullModelRange(), text: newValue },
          ]);
        }
      }
    });

    socketRef.current.on("cursor-update", ({ clientId, color, position }) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [clientId]: { color, position }
      }));
    });

    socketRef.current.on("awareness-update", (updates) => {
      awarenessRef.current.updateStates([updates]);
      const states = awarenessRef.current.getStates();
      const newCursors = {};
      states.forEach((state, clientId) => {
        if (state.cursor) {
          newCursors[clientId] = {
            color: state.color || userColor,
            position: state.cursor,
          };
        }
      });
      setCursors(newCursors);
    });

    return () => {
      socketRef.current.disconnect();
      ydocRef.current.destroy();
    };
  }, [groupId]);

  const bindEditor = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco || window.monaco || editorRef.current?.monaco;

    if (!editorRef.current || !monacoRef.current) {
      console.error("Editor or Monaco instance not available");
      return;
    }

    const updateDecorations = () => {
      const newDecorations = Object.entries(cursors)
        .filter(([clientId]) => clientId !== socketRef.current.id)
        .map(([clientId, { color, position }]) => ({
          range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          options: {
            className: `cursor-${clientId}`,
            isWholeLine: false,
            stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        }));
      editorRef.current.deltaDecorations([], newDecorations);
    };

    if (!editorRef.current.binding) {
      const yText = ydocRef.current.getText("monaco");
      const binding = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        awarenessRef.current
      );
      editorRef.current.binding = binding;

      editor.onDidChangeCursorPosition((event) => {
        const position = event.position;
        awarenessRef.current.setLocalStateField("cursor", {
          lineNumber: position.lineNumber,
          column: position.column,
        });
        if (socketRef.current?.connected) {
          socketRef.current.emit("cursor-update", {
            clientId: socketRef.current.id,
            color: userColor,
            position: { lineNumber: position.lineNumber, column: position.column },
          });
        }
      });

      awarenessRef.current.on("change", updateDecorations);
      editor.onDidChangeModelDecorations(updateDecorations);
      updateDecorations();

      ydocRef.current.on("update", (update) => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("update-doc", { update: Array.from(update) });
        }
      });

      return () => {
        binding.destroy();
        awarenessRef.current.off("change", updateDecorations);
        editor.dispose();
      };
    }
  };

  if(!isEditorVisible) {
    return null;
  }

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    if (["java", "cpp"].includes(newLanguage)) {
      setCode("");
    }
  };

  const handleRunCode = () => {
    controllerRef.current = new AbortController();
    dispatch(runCode({ language, code, signal: controllerRef.current.signal }));
  };

  const handleStopCode = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      dispatch(stopCode());
    }
  };

  const toggleTerminal = () => {
    setIsTerminalOpen((prev) => !prev);
  };

  return (
    <EditorContainer>
      <Toolbar>
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>
        <div>
          <button onClick={handleRunCode} disabled={isLoading}>
            {isLoading ? "Running..." : "Run"}
          </button>
          <button onClick={handleStopCode} disabled={!isLoading} className="stop">
            Stop
          </button>
        </div>
      </Toolbar>

      <EditorWrapper>
        <Editor
          width="100%"
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onMount={bindEditor}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          onChange={handleEditorChange}
        />
      </EditorWrapper>

      <TerminalContainer>
        <TerminalHeader onClick={toggleTerminal}>
          <h4>Terminal</h4>
          {isTerminalOpen ? <FaChevronUp /> : <FaChevronDown />}
        </TerminalHeader>
        {isTerminalOpen && (
          <TerminalContent>
            <TerminalOutput>
              {isLoading ? "Executing..." : error ? `❌ Error: ${error}` : output || "No output"}
            </TerminalOutput>
          </TerminalContent>
        )}
      </TerminalContainer>

      <style>
        {Object.entries(cursors)
          .map(([clientId, { color }]) => `
            .cursor-${clientId} {
              background: ${color} !important;
              width: 2px !important;
              height: 1.2em !important;
              z-index: 1000;
            }
          `)
          .join("")}
      </style>
    </EditorContainer>
  );
};

// Styled Components remain the same
const EditorContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  width: 92vw;
  height: calc(100vh - 30px);
  background: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: calc(100vw - 20px);
    height: 100vh;
  }
  @media (max-width: 1222px) {
    width: calc(100vw - 100px);
    height: 100vh;
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #333;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;

  select {
    padding: 5px;
    background: #222;
    color: white;
    border: none;
    font-size: 14px;
    cursor: pointer;
  }

  button {
    padding: 5px 10px;
    margin-left: 10px;
    background: #4caf50;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }

  .stop {
    background: #ff4444;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  background: #252525;
  border-radius: 5px;
`;

const TerminalContainer = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 5px;
  padding: 10px;
`;

const TerminalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: black;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const TerminalContent = styled.div`
  padding: 10px;
`;

const TerminalOutput = styled.pre`
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: black;
  color: white;
  padding: 10px;
  border-radius: 5px;
  max-height: 400px;
  overflow-y: auto;
  display: block;
`;

export default CodeEditor;