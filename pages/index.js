import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import TextareaAutosize from "react-textarea-autosize";

const id = btoa(Math.random().toString()).substring(10, 15);
const defaultSystem = "samatha";

export default function Home() {
  const messagesEndRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [result, setResult] = useState([]);
  const [system, setSystem] = useState(defaultSystem);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [result]);

  async function onSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  async function sendMessage() {
    try {
      if (isLoading) {
        return;
      }

      const messageInputToSent = messageInput;
      setIsLoading(true);
      setMessageInput("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          content: messageInputToSent,
          system: system,
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult([
        ...result,
        { role: "user", content: messageInputToSent },
        { role: "assistant", content: data.result },
      ]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSystem = localStorage.getItem("system");
      console.debug("savedSystem", savedSystem);
      savedSystem && setSystem(savedSystem);
    }
  }, []);

  const changeSystem = (sys) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("system", sys);
      location.reload();
    }
  };

  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style jsx global>{`
        html,
        body,
        div#__next {
          margin: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>

      <Head>
        <title>Her by OpenAI</title>
        <link rel="icon" href="/her.png" />
      </Head>

      <main className={styles.main}>
        {/* <img src="/dog.png" className={styles.icon} /> */}
        {/* <div className={styles.header}>Her</div> */}
        {/* <Select options={options} /> */}

        <div className={styles.dropdown}>
          <select
            className={styles.select}
            value={system}
            onChange={(item) => {
              changeSystem(item.target.value);
            }}
            name="system"
            id="system"
          >
            <option value="samantha">Samantha</option>
            <option value="data-analyst">Data Analyst</option>
          </select>
        </div>

        <div className={styles.result}>
          {result.length > 0 &&
            result.map((message, index) => {
              return (
                <div
                  key={index}
                  className={styles[message.role]}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              );
            })}
          <div ref={messagesEndRef} />
          {result.length === 0 && <div className={styles.empty}>Her.</div>}
        </div>

        <form onSubmit={onSubmit}>
          <div className={styles.messageInput}>
            <TextareaAutosize
              minRows={1}
              maxRows={6}
              className={styles.textarea}
              placeholder="Type your message here"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => onEnterPress(e)}
            />
            <input type="submit" value="📩" />
            {isLoading && (
              <div className={styles.messageSending}>Waiting...</div>
            )}
          </div>
        </form>
      </main>
    </>
  );
}
