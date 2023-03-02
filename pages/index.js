import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

const id = btoa(Math.random().toString()).substring(10, 15);

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, content: animalInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      setAnimalInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Her by OpenAI</title>
        <link rel="icon" href="/her.png" />
      </Head>

      <main className={styles.main}>
        {/* <img src="/dog.png" className={styles.icon} /> */}
        <h3>Her</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="message"
            placeholder="Type your message here"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
