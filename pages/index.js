import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";

const id = btoa(Math.random().toString()).substring(10, 15);

export default function Home() {
  const messagesEndRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [result, setResult] = useState([]);
  const [system, setSystem] = useState("samatha");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [result]);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, content: messageInput, system: system }),
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
        { role: "user", content: messageInput },
        { role: "assistant", content: data.result },
      ]);
      setMessageInput("");
    } catch (error) {
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
          <input
            type="text"
            name="message"
            placeholder="Type your message here"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <input type="submit" value="📩" />
        </form>
      </main>
    </>
  );
}
