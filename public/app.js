// =========================================================
// KHUSHI AI - FRONTEND
// Natural Hindi Voice + Chat + Microphone
// =========================================================

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const clearBtn = document.getElementById("clearBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const voiceSelect = document.getElementById("voiceSelect");

let history = [];
let recognition = null;
let listening = false;

let selectedVoice = null;
let hindiVoices = [];
let femaleVoices = [];


// =========================================================
// CHAT MESSAGE
// =========================================================

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = `message ${type}`;
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}


// =========================================================
// TYPING
// =========================================================

function showTyping() {
  const typing = document.createElement("div");

  typing.id = "typing";
  typing.className = "message ai typing";

  typing.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}


function hideTyping() {
  const typing = document.getElementById("typing");

  if (typing) {
    typing.remove();
  }
}


// =========================================================
// VOICE DETECTION
// =========================================================

const femaleKeywords = [
  "female",
  "woman",
  "girl",
  "zira",
  "samantha",
  "swara",
  "heera",
  "kalpana",
  "neerja",
  "google hindi",
  "hindi female"
];


function isFemaleVoice(voice) {
  const name = (voice.name || "").toLowerCase();

  return femaleKeywords.some(keyword =>
    name.includes(keyword)
  );
}


// =========================================================
// LOAD NATURAL HINDI VOICES
// =========================================================

function loadVoices() {
  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) {
    return;
  }

  // Hindi voices
  hindiVoices = voices.filter(voice =>
    /^hi(-|_)/i.test(voice.lang)
  );

  // Female Hindi voices
  const hindiFemaleVoices =
    hindiVoices.filter(isFemaleVoice);

  // All female voices
  femaleVoices = voices.filter(isFemaleVoice);

  // Priority:
  // 1. Hindi female
  // 2. Hindi voice
  // 3. Indian English female
  // 4. Any female
  // 5. Indian English
  // 6. Browser default

  const indianEnglishFemale =
    femaleVoices.find(voice =>
      /en-IN/i.test(voice.lang)
    );

  const indianEnglish =
    voices.find(voice =>
      /en-IN/i.test(voice.lang)
    );

  selectedVoice =
    hindiFemaleVoices[0] ||
    hindiVoices[0] ||
    indianEnglishFemale ||
    femaleVoices[0] ||
    indianEnglish ||
    voices[0] ||
    null;

  console.log("================================");
  console.log("KHUSHI NATURAL VOICE");
  console.log(
    selectedVoice
      ? `${selectedVoice.name} (${selectedVoice.lang})`
      : "NO VOICE FOUND"
  );
  console.log("================================");

  // Voice dropdown
  if (voiceSelect) {
    voiceSelect.innerHTML = "";

    if (!voices.length) {
      const option = document.createElement("option");

      option.textContent =
        "Voice available nahi hai";

      option.value = "";

      voiceSelect.appendChild(option);

      return;
    }

    // Show useful Indian voices first
    const usefulVoices = voices.filter(voice =>
      /hi-IN|en-IN/i.test(voice.lang)
    );

    const voicesToShow =
      usefulVoices.length > 0
        ? usefulVoices
        : voices;

    voicesToShow.forEach((voice) => {
      const option =
        document.createElement("option");

      option.value =
        voices.indexOf(voice);

      option.textContent =
        `${voice.name} (${voice.lang})`;

      if (voice === selectedVoice) {
        option.selected = true;
      }

      voiceSelect.appendChild(option);
    });
  }
}


window.speechSynthesis.onvoiceschanged =
  loadVoices;

loadVoices();


// =========================================================
// VOICE SELECT
// =========================================================

if (voiceSelect) {
  voiceSelect.addEventListener(
    "change",
    () => {

      const index =
        Number(voiceSelect.value);

      const voices =
        window.speechSynthesis.getVoices();

      if (voices[index]) {
        selectedVoice = voices[index];

        console.log(
          "Selected voice:",
          selectedVoice.name,
          selectedVoice.lang
        );
      }
    }
  );
}


// =========================================================
// CLEAN TEXT FOR NATURAL SPEECH
// =========================================================

function cleanSpeechText(text) {
  if (!text) {
    return "";
  }

  let clean = String(text);

  // Markdown remove
  clean = clean.replace(/\*\*(.*?)\*\*/g, "$1");
  clean = clean.replace(/\*(.*?)\*/g, "$1");
  clean = clean.replace(/__(.*?)__/g, "$1");
  clean = clean.replace(/`([^`]+)`/g, "$1");

  // URLs remove
  clean = clean.replace(
    /https?:\/\/\S+/gi,
    ""
  );

  // Extra symbols
  clean = clean.replace(
    /[#*_~|>]/g,
    " "
  );

  // Multiple spaces
  clean = clean.replace(
    /\s+/g,
    " "
  );

  return clean.trim();
}


// =========================================================
// DETECT HINDI / HINGLISH
// =========================================================

function containsHindi(text) {
  if (!text) {
    return false;
  }

  // Devanagari
  if (/[\u0900-\u097F]/.test(text)) {
    return true;
  }

  // Common Hinglish words
  const hinglishWords = [
    "hai",
    "hain",
    "ho",
    "hoga",
    "hogi",
    "kya",
    "kyu",
    "kyun",
    "kaise",
    "kaisa",
    "kaisi",
    "kar",
    "karo",
    "karna",
    "karni",
    "raha",
    "rahi",
    "mere",
    "mera",
    "meri",
    "tum",
    "aap",
    "mujhe",
    "aapko",
    "batao",
    "bata",
    "acha",
    "accha",
    "theek",
    "thik",
    "nahi",
    "nahin",
    "haan",
    "chalo",
    "bas",
    "abhi",
    "kal",
    "aaj",
    "baat",
    "suno",
    "sunao"
  ];

  const lower = text.toLowerCase();

  return hinglishWords.some(word =>
    new RegExp(`\\b${word}\\b`, "i").test(lower)
  );
}


// =========================================================
// NATURAL SPEAK
// =========================================================

function speak(text) {

  if (!text) {
    return;
  }

  const cleanText =
    cleanSpeechText(text);

  if (!cleanText) {
    return;
  }

  window.speechSynthesis.cancel();

  // Make sure voices are loaded
  if (!selectedVoice) {
    loadVoices();
  }

  if (!selectedVoice) {
    console.warn(
      "KHUSHI: Voice available nahi hai."
    );

    return;
  }

  const hindi =
    containsHindi(cleanText);

  const utterance =
    new SpeechSynthesisUtterance(
      cleanText
    );

  utterance.voice =
    selectedVoice;

  // Hindi / Hinglish
  if (hindi) {
    utterance.lang = "hi-IN";
  } else {
    utterance.lang =
      /en-IN/i.test(selectedVoice.lang)
        ? "en-IN"
        : selectedVoice.lang;
  }

  // Natural conversational voice
  utterance.rate = 0.90;

  // Slightly natural female pitch
  utterance.pitch = 1.06;

  utterance.volume = 1;

  utterance.onstart = () => {
    console.log(
      "KHUSHI speaking naturally:",
      selectedVoice.name
    );
  };

  utterance.onend = () => {
    console.log(
      "KHUSHI finished speaking."
    );
  };

  utterance.onerror = (event) => {
    console.error(
      "Voice error:",
      event.error
    );
  };

  window.speechSynthesis.speak(
    utterance
  );
}


// =========================================================
// STOP VOICE
// =========================================================

function stopVoice() {
  window.speechSynthesis.cancel();
}


// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {

  const message =
    messageInput.value.trim();

  if (!message) {
    return;
  }

  addMessage(
    message,
    "user"
  );

  messageInput.value = "";

  sendBtn.disabled = true;

  showTyping();

  try {

    const response =
      await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          message,
          history
        })
      });

    const data =
      await response.json();

    hideTyping();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "AI response error"
      );
    }

    const reply =
      data.reply ||
      data.text ||
      "AI response nahi mila.";

    addMessage(
      reply,
      "ai"
    );

    // Save conversation
    history.push({
      role: "user",
      content: message
    });

    history.push({
      role: "assistant",
      content: reply
    });

    // Keep frontend history small
    if (history.length > 20) {
      history =
        history.slice(-20);
    }

    // Natural voice
    speak(reply);

  } catch (error) {

    hideTyping();

    console.error(error);

    addMessage(
      `Sorry, error aa gaya: ${error.message}`,
      "ai"
    );

  } finally {

    sendBtn.disabled = false;

    messageInput.focus();
  }
}


// =========================================================
// SEND BUTTON
// =========================================================

if (sendBtn) {

  sendBtn.addEventListener(
    "click",
    sendMessage
  );
}


// =========================================================
// ENTER KEY
// =========================================================

if (messageInput) {

  messageInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();
      }
    }
  );
}


// =========================================================
// MICROPHONE
// =========================================================

function setupVoice() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    console.warn(
      "Speech Recognition browser me supported nahi hai."
    );

    if (micBtn) {
      micBtn.disabled = true;
    }

    return;
  }

  recognition =
    new SpeechRecognition();

  // Hindi speech recognition
  recognition.lang =
    "hi-IN";

  recognition.continuous =
    false;

  recognition.interimResults =
    true;

  recognition.onstart = () => {

    listening = true;

    if (micBtn) {
      micBtn.classList.add(
        "listening"
      );
    }

    console.log(
      "KHUSHI microphone listening..."
    );
  };

  recognition.onresult =
    (event) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0]
            .transcript;
      }

      if (messageInput) {

        messageInput.value =
          transcript.trim();
      }
    };

  recognition.onend = () => {

    listening = false;

    if (micBtn) {
      micBtn.classList.remove(
        "listening"
      );
    }

    const text =
      messageInput.value.trim();

    if (text) {
      sendMessage();
    }
  };

  recognition.onerror =
    (event) => {

      listening = false;

      if (micBtn) {
        micBtn.classList.remove(
          "listening"
        );
      }

      console.error(
        "Microphone error:",
        event.error
      );
    };
}


// =========================================================
// MICROPHONE BUTTON
// =========================================================

if (micBtn) {

  micBtn.addEventListener(
    "click",
    () => {

      if (!recognition) {
        return;
      }

      // Stop listening
      if (listening) {

        recognition.stop();

        return;
      }

      // Stop current voice
      stopVoice();

      try {

        recognition.start();

      } catch (error) {

        console.error(error);
      }
    }
  );
}


// =========================================================
// CLEAR CHAT
// =========================================================

if (clearBtn) {

  clearBtn.addEventListener(
    "click",
    async () => {

      history = [];

      chat.innerHTML = "";

      stopVoice();

      try {

        await fetch(
          "/api/memory",
          {
            method: "DELETE"
          }
        );

      } catch (error) {

        console.error(error);
      }

      addMessage(
        "Namaste 😊 Main KHUSHI hoon. Mujhse Hindi, Hinglish ya English mein normally baat kar sakte ho.",
        "ai"
      );
    }
  );
}


// =========================================================
// SERVER STATUS
// =========================================================

async function checkStatus() {

  try {

    const response =
      await fetch("/api/status");

    const data =
      await response.json();

    if (statusDot) {
      statusDot.style.background =
        "#22c55e";
    }

    if (statusText) {
      statusText.textContent =
        data.status === "ONLINE"
          ? "Online"
          : "Connected";
    }

  } catch (error) {

    console.error(
      "Status error:",
      error
    );

    if (statusDot) {
      statusDot.style.background =
        "#ef4444";
    }

    if (statusText) {
      statusText.textContent =
        "Offline";
    }
  }
}


// =========================================================
// START KHUSHI
// =========================================================

setupVoice();

checkStatus();

setInterval(
  checkStatus,
  30000
);


// =========================================================
// WELCOME MESSAGE
// =========================================================

if (chat) {

  addMessage(
    "Hii 😊 Main KHUSHI hoon. Mujhse normally baat karo—Hindi, Hinglish ya English mein.",
    "ai"
  );
}