/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const workerUrl = "https://loreal-chatbot-worker.tzr-a87.workers.dev/";

// Add a welcome message from the assistant
function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `msg ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage("👋 Hello! How can I help you today?", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the text the user typed and stop if it is empty
  const messageText = userInput.value.trim();
  if (!messageText) {
    return;
  }

  // Show the user's message in the chat window
  addMessage(messageText, "user");

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are L'Oréal Beauty Advisor. Only answer questions about L'Oréal products, skincare, makeup, haircare, fragrances, beauty routines, and product recommendations. If the user asks something unrelated, politely say you can help with L'Oréal beauty topics only.",
          },
          { role: "user", content: messageText },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("Unexpected response from worker:", data);
      const errorMessage =
        data?.error?.message ||
        "Sorry, I could not reach the assistant right now.";
      addMessage(errorMessage, "ai");
      return;
    }

    const reply = data.choices[0].message.content;
    addMessage(reply, "ai");
  } catch (error) {
    console.error(error);
    addMessage("Sorry, I could not reach the assistant right now.", "ai");
  }

  // Clear the input for the next message
  userInput.value = "";
  userInput.focus();
});
