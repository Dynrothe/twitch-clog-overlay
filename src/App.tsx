import { useEffect, useRef, useState } from "react";
import * as tmi from "tmi.js";
import "./App.css";

function App() {
  const initialized = useRef<boolean>(false);

  const urlParams = new URLSearchParams(window.location.search);

  const TWITCH_CHANNEL = urlParams.get("channel");
  const DEBUG = urlParams.get("debug");
  const IMG_WIDTH = urlParams.get("width");
  const IMG_HEIGHT = urlParams.get("height");
  const ITEM_SIZE = urlParams.get("itemsize");
  const ITEM_MARGIN = urlParams.get("itemmargin");
  const USERNAME_SIZE = urlParams.get("usernamesize");
  const USERNAME_MARGIN = urlParams.get("usernamemargin");

  const [username, setUsername] = useState<string | null>(null);
  const [item, setItem] = useState<string | null>(null);

  const [containerCss, setContainerCss] = useState<any>();
  const [imageCss, setImageCss] = useState<any>();
  const [itemCss, setItemCss] = useState<any>();
  const [usernameCss, setUsernameCss] = useState<any>();

  if (!TWITCH_CHANNEL)
    return (
      <>
        You need to put the twitch channel in the url! example:{" "}
        <a href="https://repo.pogly.gg/twitchclog/?channel=bobross">
          https://repo.pogly.gg/twitchclog/?channel=bobross
        </a>
        !
      </>
    );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setContainerCss({ top: DEBUG ? "30px" : "-300px" });
    setImageCss({ width: IMG_WIDTH ? `${IMG_WIDTH}px` : "unset", height: IMG_HEIGHT ? `${IMG_HEIGHT}px` : "unset" });
    setItemCss({
      fontSize: ITEM_SIZE ? `${ITEM_SIZE}px` : "28px",
      marginTop: ITEM_MARGIN ? `${ITEM_MARGIN}px` : "30px",
    });
    setUsernameCss({
      fontSize: USERNAME_SIZE ? `${USERNAME_SIZE}px` : "28px",
      marginTop: USERNAME_MARGIN ? `${USERNAME_MARGIN}px` : "150px",
    });

    if (DEBUG) {
      setItem("Some Cool Item Name");
      setUsername("Exampe_Username");
    }

    const twitchChannel: string = TWITCH_CHANNEL.toLowerCase();
    const twitchClient = tmi.Client({ channels: [twitchChannel] });

    twitchClient.connect();

    twitchClient.on("connected", () => {
      console.log("Connected to twitch chat!");
    });

    twitchClient.on("message", (_channel: string, tags: tmi.ChatUserstate, message: string) => {
      if (!tags.username || !message) return;
      if (tags.username !== "the_collection_log") return;
      if (!message.includes("just received")) return;

      const content = message
        .replace("just received ", "")
        .match(/^(\S+)\s(.*)/)!
        .slice(1);

      const usernameString = content[0];
      const itemString = content[1].split("!")[0];

      setUsername(usernameString);
      setItem(itemString);
    });
  }, []);

  useEffect(() => {
    if (!username || !item || DEBUG) return;

    let collectionlog = document.getElementById("collectionlog");
    if (!collectionlog) return;

    collectionlog.classList.add("show");

    setTimeout(() => {
      collectionlog.classList.remove("show");

      setTimeout(() => {
        setUsername(null);
        setItem(null);
      }, 1000);
    }, 3000);
  }, [username, item]);

  return (
    <div id="collectionlog" className="collectionlog" style={containerCss}>
      <img src="./TwitchClog.png" alt="TwitchClog" style={imageCss} />
      <div className="text-container">
        <p style={itemCss}>{item}</p>
        <p style={usernameCss}>{username}</p>
      </div>
    </div>
  );
}

export default App;
